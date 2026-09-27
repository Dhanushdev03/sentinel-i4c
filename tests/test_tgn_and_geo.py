"""
Unit Tests: TGN Trace Engine and Geo-Temporal (ST-KDE + ST-GCN)
"""

import pytest
from simulator.fraud_simulator import FraudSimulator, CASH_POINTS_CATALOG
from ml.tgn_trace import TGNTraceEngine
from ml.geo_temporal import GeoTemporalEngine, haversine_km


def test_tgn_trace_scoring():
    sim = FraudSimulator(seed=789)
    scenario = sim.generate_scenario(case_id="TGN-TEST-01", case_number="CYB-TGN-01")
    tgn = TGNTraceEngine()

    scores = tgn.score_chain(scenario.transactions, scenario.candidate_cash_points)
    assert scores.engine_name == "Prototype Temporal Graph Scoring (TGN Architecture)"
    assert scores.trace_confidence > 0.0
    assert len(scores.candidates) == len(scenario.candidate_cash_points)

    # Probabilities should sum to approximately 1.0
    prob_sum = sum(c.probability for c in scores.candidates)
    assert pytest.approx(prob_sum, abs=0.02) == 1.0


def test_geo_temporal_engine():
    sim = FraudSimulator(seed=101)
    scenario = sim.generate_scenario(case_id="GEO-TEST-01", case_number="CYB-GEO-01")
    geo = GeoTemporalEngine()

    scores = geo.evaluate(scenario.candidate_cash_points, scenario.transactions)
    assert len(scores.point_scores) == len(scenario.candidate_cash_points)
    for p in scores.point_scores:
        assert p.st_kde_score >= 0.0
        assert p.st_gcn_score >= 0.0
        assert p.combined_geo_score >= 0.0


def test_haversine_accuracy():
    # Distance between Mumbai (19.0760, 72.8777) and Pune (18.5204, 73.8567) is ~120-150 km
    d = haversine_km(19.0760, 72.8777, 18.5204, 73.8567)
    assert 110.0 <= d <= 160.0
