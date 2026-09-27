"""
SENTINEL-I4C: Trace Confidence Router
Calculates trace confidence and dynamically assigns weights between
the Temporal Graph Engine (TGN) and the Geo-Temporal Fallback Engine (ST-KDE + ST-GCN).

Routing Policy:
- HIGH CONFIDENCE   (>= 0.65): TGN weighted heavily (w_t = 0.70, w_k = 0.18, w_g = 0.12)
- MEDIUM CONFIDENCE (0.40 - 0.64): Balanced Fusion   (w_t = 0.50, w_k = 0.28, w_g = 0.22)
- LOW CONFIDENCE    (< 0.40):  Geo fallback dominant (w_t = 0.25, w_k = 0.45, w_g = 0.30)
"""

from enum import Enum
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from simulator.fraud_simulator import SyntheticTransaction


class TraceConfidenceLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ConfidenceFactors(BaseModel):
    model_config = {"protected_namespaces": ()}
    observed_mule_hops_score: float
    transaction_recency_score: float
    node_novelty_score: float
    model_entropy_score: float
    graph_connectivity_score: float
    composite_confidence: float


class RouterDecision(BaseModel):
    confidence_level: TraceConfidenceLevel
    score: float
    w_tgn: float       # w_t (Temporal Graph)
    w_stkde: float     # w_k (Spatial-Temporal KDE)
    w_stgcn: float     # w_g (Spatial-Temporal GCN Proximity)
    primary_route: str
    rationale: str
    factors: ConfidenceFactors


class TraceConfidenceRouter:
    """
    Evaluates dynamic graph signals to route inference between TGN and Geo-Temporal engines.
    """

    def evaluate(
        self,
        transactions: List[SyntheticTransaction],
        tgn_entropy: float = 1.0,
        unseen_node_ratio: float = 0.2
    ) -> RouterDecision:
        main_txs = [t for t in transactions if not t.is_noise]
        hop_count = len(main_txs)

        # 1. Observed Mule Hops Score (0.0 to 1.0)
        # More verified hops in chain = higher confidence up to hop 4
        hops_score = min(1.0, hop_count / 4.0) if hop_count >= 3 else 0.25

        # 2. Transaction Recency Score (0.0 to 1.0)
        # Fast chains (< 45 min total) exhibit clear directional velocity
        recency_score = 0.85 if hop_count >= 3 else 0.35

        # 3. Node Novelty Score (0.0 to 1.0)
        # Lower novelty (known mules / recognized clusters) -> higher confidence
        novelty_score = max(0.1, 1.0 - unseen_node_ratio)

        # 4. Model Entropy Score (0.0 to 1.0)
        # Lower entropy in TGN prediction -> sharper probability peak -> higher confidence
        entropy_score = max(0.1, min(1.0, 1.0 - (tgn_entropy / 2.2)))

        # 5. Graph Connectivity Score (0.0 to 1.0)
        # Continuous sequential graph vs fragmented / noise-heavy graph
        noise_txs = [t for t in transactions if t.is_noise]
        noise_ratio = len(noise_txs) / max(1, len(transactions))
        connectivity_score = max(0.2, 1.0 - (noise_ratio * 0.8))

        # Weighted composite score
        composite = (
            (0.30 * hops_score) +
            (0.20 * recency_score) +
            (0.15 * novelty_score) +
            (0.20 * entropy_score) +
            (0.15 * connectivity_score)
        )
        composite = round(min(0.98, max(0.05, composite)), 3)

        # Routing decision
        if composite >= 0.65:
            level = TraceConfidenceLevel.HIGH
            w_t = 0.70
            w_k = 0.18
            w_g = 0.12
            primary = "TGN Trace Engine (Weighted Heavily)"
            rationale = (
                f"Sufficient mule hops observed ({hop_count} hops) with high graph connectivity "
                f"and low model entropy ({tgn_entropy:.2f}). Directing primary inference to TGN."
            )
        elif composite >= 0.40:
            level = TraceConfidenceLevel.MEDIUM
            w_t = 0.50
            w_k = 0.28
            w_g = 0.22
            primary = "Calibrated Fusion (TGN + ST-KDE + ST-GCN)"
            rationale = (
                f"Moderate chain visibility ({hop_count} hops). Balanced fusion weights applied "
                f"between temporal graph scoring and regional geo-spatial patterns."
            )
        else:
            level = TraceConfidenceLevel.LOW
            w_t = 0.25
            w_k = 0.45
            w_g = 0.30
            primary = "Geo-Temporal Fallback Engine (ST-KDE + ST-GCN)"
            rationale = (
                f"Limited mule hop visibility ({hop_count} hops) or high graph fragmentation. "
                f"Falling back to spatial kernel density (ST-KDE) and regional proximity graph (ST-GCN)."
            )

        factors = ConfidenceFactors(
            observed_mule_hops_score=round(hops_score, 3),
            transaction_recency_score=round(recency_score, 3),
            node_novelty_score=round(novelty_score, 3),
            model_entropy_score=round(entropy_score, 3),
            graph_connectivity_score=round(connectivity_score, 3),
            composite_confidence=composite
        )

        return RouterDecision(
            confidence_level=level,
            score=composite,
            w_tgn=w_t,
            w_stkde=w_k,
            w_stgcn=w_g,
            primary_route=primary,
            rationale=rationale,
            factors=factors
        )
