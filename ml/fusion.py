"""
SENTINEL-I4C: Fusion & Calibration Engine
Computes calibrated ensemble cash-out predictions:
Final Score = w_t * TGN + w_k * ST-KDE + w_g * ST-GCN

Weights are calibrated dynamically by the Trace Confidence Router.
Outputs Top-3 ranked cash-out predictions with probabilities, time windows, and amounts.
"""

import math
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

from simulator.fraud_simulator import CashWithdrawalPoint
from .tgn_trace import TGNScores
from .geo_temporal import GeoScores
from .confidence_router import RouterDecision


class CandidateLocation(BaseModel):
    rank: int
    id: str
    name: str
    address: str
    type: str  # ATM, CSP, Branch
    bank: str
    probability: float
    confidence: float
    lat: float
    lng: float
    district: str
    state: str
    distance_km: float
    eta_min: int
    expected_recovery: float
    tgn_score: float
    stkde_score: float
    stgcn_score: float
    fusion_score: float
    jurisdiction_ps: str


class PredictionResult(BaseModel):
    model_config = {"protected_namespaces": ()}
    id: str
    case_id: str
    timestamp: str
    model_version: str = "SENTINEL-ENSEMBLE-v0.4.2"
    trace_confidence: str
    w_tgn: float
    w_stkde: float
    w_stgcn: float
    locations: List[CandidateLocation]
    time_window_min: int
    time_window_max: int
    amount_min: float
    amount_max: float
    expected_recovery: float
    input_hash: str
    calibration_method: str = "Temperature Scaled Softmax (T=1.2)"


class FusionEngine:
    """
    Calibrates and fuses signals from TGN Trace Engine and Geo-Temporal (ST-KDE + ST-GCN) engines.
    """

    def fuse(
        self,
        case_id: str,
        router: RouterDecision,
        tgn: TGNScores,
        geo: GeoScores,
        candidate_points: List[CashWithdrawalPoint],
        estimated_amount: float,
        time_min: int = 15,
        time_max: int = 28
    ) -> PredictionResult:
        point_map = {p.id: p for p in candidate_points}
        tgn_map = {c.node_id: c for c in tgn.candidates}
        geo_map = {g.point_id: g for g in geo.point_scores}

        raw_fused: List[Dict] = []
        for p in candidate_points:
            t_score = tgn_map[p.id].probability if p.id in tgn_map else 0.20
            k_score = geo_map[p.id].st_kde_score if p.id in geo_map else 0.30
            g_score = geo_map[p.id].st_gcn_score if p.id in geo_map else 0.35
            dist_km = geo_map[p.id].distance_km if p.id in geo_map else 5.0

            # Core fusion equation:
            # Final Score = w_t * TGN + w_k * ST-KDE + w_g * ST-GCN
            fused = (router.w_tgn * t_score) + (router.w_stkde * k_score) + (router.w_stgcn * g_score)

            raw_fused.append({
                "point": p,
                "fused": fused,
                "t_score": t_score,
                "k_score": k_score,
                "g_score": g_score,
                "dist_km": dist_km,
            })

        # Softmax calibration with temperature T=1.2
        T = 1.2
        exp_scores = [math.exp(item["fused"] / T) for item in raw_fused]
        sum_exp = sum(exp_scores) if exp_scores else 1.0
        calibrated_probs = [s / sum_exp for s in exp_scores]

        # Build candidate locations
        locations: List[CandidateLocation] = []
        for i, item in enumerate(raw_fused):
            p = item["point"]
            prob = round(calibrated_probs[i], 4)
            dist_km = item["dist_km"]
            # Estimate ETA: 30 km/h average patrol speed in city + 4 min dispatch
            eta_min = int(round((dist_km / 30.0) * 60.0 + 4.0))

            # Intercept success factor based on ETA vs time window
            intercept_p = max(0.2, min(0.9, 1.0 - (eta_min / max(time_max, 30))))
            expected_rec = round(prob * estimated_amount * intercept_p, 2)

            locations.append(CandidateLocation(
                rank=0,  # assigned after sorting
                id=p.id,
                name=p.name,
                address=p.address,
                type=p.type.value,
                bank=p.bank,
                probability=prob,
                confidence=round(min(0.92, (router.score * 0.5) + (prob * 0.5)), 3),
                lat=p.lat,
                lng=p.lng,
                district=p.district,
                state=p.state,
                distance_km=dist_km,
                eta_min=eta_min,
                expected_recovery=expected_rec,
                tgn_score=round(item["t_score"], 4),
                stkde_score=round(item["k_score"], 4),
                stgcn_score=round(item["g_score"], 4),
                fusion_score=round(item["fused"], 4),
                jurisdiction_ps=p.jurisdiction_ps
            ))

        # Sort descending by probability and take Top 3
        locations.sort(key=lambda l: l.probability, reverse=True)
        top3 = locations[:3]
        for idx, loc in enumerate(top3):
            loc.rank = idx + 1

        # Prediction ID and input hash
        import hashlib
        input_hash = hashlib.sha256(f"{case_id}-{router.score}-{estimated_amount}".encode()).hexdigest()

        return PredictionResult(
            id=f"PRED-{case_id[-6:]}-001",
            case_id=case_id,
            timestamp="2026-03-15T09:35:00Z",
            trace_confidence=router.confidence_level.value,
            w_tgn=router.w_tgn,
            w_stkde=router.w_stkde,
            w_stgcn=router.w_stgcn,
            locations=top3,
            time_window_min=time_min,
            time_window_max=time_max,
            amount_min=round(estimated_amount * 0.82, 2),
            amount_max=round(estimated_amount * 0.96, 2),
            expected_recovery=round(sum(l.expected_recovery for l in top3) / max(1, len(top3)), 2),
            input_hash=input_hash
        )
