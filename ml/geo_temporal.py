"""
SENTINEL-I4C: Geo-Temporal Fallback Engine
Components:
1. ST-KDE (Spatio-Temporal Kernel Density Estimation)
   - Evaluates historical cash-out hotspot density with temporal decay
2. ST-GCN (Spatio-Temporal Graph Convolutional Network)
   - ATM/CSP/Branch proximity graph with temporal features (hour, day of week, recent activity)
"""

import math
from typing import List, Dict, Tuple
from pydantic import BaseModel
from simulator.fraud_simulator import CashWithdrawalPoint, SyntheticTransaction


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points on Earth in km."""
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


class PointGeoScore(BaseModel):
    point_id: str
    name: str
    st_kde_score: float
    st_gcn_score: float
    combined_geo_score: float
    distance_km: float
    density_percentile: float
    temporal_affinity: float


class GeoScores(BaseModel):
    engine_name: str = "Geo-Temporal Fallback Engine (ST-KDE + ST-GCN)"
    point_scores: List[PointGeoScore]
    cluster_hotspot_name: str


class GeoTemporalEngine:
    """
    Computes spatial-temporal likelihood of terminal cash-out locations.
    Uses spatial Gaussian kernel with temporal decay (ST-KDE) and
    neighborhood graph message aggregation (ST-GCN).
    """

    def __init__(self):
        # Bandwidth for spatial Gaussian kernel in km
        self.spatial_bandwidth_km = 8.0
        # Temporal decay half-life in hours
        self.temporal_halflife_hours = 48.0

    def compute_st_kde(
        self,
        point: CashWithdrawalPoint,
        reference_lat: float,
        reference_lng: float,
        recency_hours: float = 6.0
    ) -> Tuple[float, float]:
        """
        ST-KDE = Spatial Kernel(d) * Temporal Decay(t) * Point Historical Weight
        """
        dist_km = haversine_km(point.lat, point.lng, reference_lat, reference_lng)

        # Gaussian spatial kernel
        spatial_kernel = math.exp(-0.5 * ((dist_km / self.spatial_bandwidth_km) ** 2))

        # Temporal decay kernel
        decay = math.exp(- (recency_hours / self.temporal_halflife_hours) * math.log(2.0))

        # Point historical fraud weight
        hist_weight = 1.0 + (point.recent_fraud_activity * 0.08)

        st_kde = spatial_kernel * decay * hist_weight
        return round(st_kde, 4), round(dist_km, 2)

    def compute_st_gcn(
        self,
        target_point: CashWithdrawalPoint,
        all_points: List[CashWithdrawalPoint],
        hour_of_day: int = 14,
        day_of_week: int = 2
    ) -> Tuple[float, float]:
        """
        ST-GCN simulates graph convolution over neighboring cashout points (< 15 km).
        Aggregates risk and temporal operational affinities (ATM 24x7, CSP business hours).
        """
        # Temporal feature: Hour-of-day affinity
        # ATMs peak late afternoon / night (14:00 - 23:00)
        # CSPs peak afternoon (11:00 - 18:00)
        # Branches peak banking hours (10:00 - 16:00)
        if target_point.type.value == "ATM":
            hour_affinity = 0.90 if (14 <= hour_of_day <= 22) else 0.65
        elif target_point.type.value == "CSP":
            hour_affinity = 0.95 if (10 <= hour_of_day <= 18) else 0.20
        else:  # Branch
            hour_affinity = 0.85 if (10 <= hour_of_day <= 16 and day_of_week < 6) else 0.10

        # Graph Convolution: Aggregate neighbors within 12 km
        neighbor_risks = []
        for other in all_points:
            if other.id != target_point.id:
                d = haversine_km(target_point.lat, target_point.lng, other.lat, other.lng)
                if d <= 12.0:
                    weight = 1.0 / max(1.0, d)
                    neighbor_risks.append(other.risk_score * weight)

        agg_risk = sum(neighbor_risks) / max(1, len(neighbor_risks)) if neighbor_risks else target_point.risk_score
        st_gcn = (0.50 * target_point.risk_score) + (0.30 * agg_risk) + (0.20 * hour_affinity)

        return round(st_gcn, 4), round(hour_affinity, 3)

    def evaluate(
        self,
        candidate_points: List[CashWithdrawalPoint],
        transactions: List[SyntheticTransaction]
    ) -> GeoScores:
        """
        Evaluates candidate points using ST-KDE and ST-GCN.
        """
        if not candidate_points:
            return GeoScores(point_scores=[], cluster_hotspot_name="None")

        # Use first point's coordinates as regional center or average center
        center_lat = sum(p.lat for p in candidate_points) / len(candidate_points)
        center_lng = sum(p.lng for p in candidate_points) / len(candidate_points)

        scores: List[PointGeoScore] = []
        for p in candidate_points:
            st_kde, dist_km = self.compute_st_kde(p, center_lat, center_lng, recency_hours=4.5)
            st_gcn, hour_aff = self.compute_st_gcn(p, candidate_points, hour_of_day=15, day_of_week=3)

            # Combined geo score
            combined = round((0.55 * st_kde) + (0.45 * st_gcn), 4)

            scores.append(PointGeoScore(
                point_id=p.id,
                name=p.name,
                st_kde_score=st_kde,
                st_gcn_score=st_gcn,
                combined_geo_score=combined,
                distance_km=dist_km,
                density_percentile=round(min(99.0, max(15.0, st_kde * 65.0)), 1),
                temporal_affinity=hour_aff
            ))

        # Sort descending by combined score
        scores.sort(key=lambda s: s.combined_geo_score, reverse=True)
        hotspot_name = scores[0].name if scores else "Regional Zone"

        return GeoScores(
            point_scores=scores,
            cluster_hotspot_name=hotspot_name
        )
