"""
Unit Tests: Trace Confidence Router & Fusion Engine
"""

import pytest
from simulator.fraud_simulator import FraudSimulator, SimulationMode
from ml.confidence_router import TraceConfidenceRouter, TraceConfidenceLevel
from ml.tgn_trace import TGNTraceEngine
from ml.geo_temporal import GeoTemporalEngine
from ml.fusion import FusionEngine


def test_confidence_routing_high_confidence():
    sim = FraudSimulator(seed=202)
    # 4 hops with low noise -> HIGH confidence
    scenario = sim.generate_scenario(
        case_id="CONF-TEST-HIGH",
        case_number="CYB-CONF-01",
        hops_count=4,
        mode=SimulationMode.SUSPICIOUS
    )
    router = TraceConfidenceRouter()
    decision = router.evaluate(scenario.transactions, tgn_entropy=0.6, unseen_node_ratio=0.1)

    assert decision.confidence_level == TraceConfidenceLevel.HIGH
    assert decision.w_tgn >= 0.65
    assert decision.w_stkde + decision.w_stgcn <= 0.35


def test_confidence_routing_low_confidence():
    sim = FraudSimulator(seed=303)
    # 2 hops with adversarial noise -> LOW confidence
    scenario = sim.generate_scenario(
        case_id="CONF-TEST-LOW",
        case_number="CYB-CONF-02",
        hops_count=2,
        mode=SimulationMode.ADVERSARIAL
    )
    router = TraceConfidenceRouter()
    decision = router.evaluate(scenario.transactions, tgn_entropy=1.9, unseen_node_ratio=0.7)

    assert decision.confidence_level == TraceConfidenceLevel.LOW
    assert decision.w_tgn <= 0.35
    assert decision.w_stkde + decision.w_stgcn >= 0.65


def test_fusion_engine_output():
    sim = FraudSimulator(seed=404)
    scenario = sim.generate_scenario(case_id="FUSE-TEST-01", case_number="CYB-FUSE-01")

    tgn = TGNTraceEngine().score_chain(scenario.transactions, scenario.candidate_cash_points)
    router_dec = TraceConfidenceRouter().evaluate(scenario.transactions, tgn_entropy=tgn.entropy)
    geo = GeoTemporalEngine().evaluate(scenario.candidate_cash_points, scenario.transactions)

    fusion = FusionEngine()
    result = fusion.fuse(
        case_id="FUSE-TEST-01",
        router=router_dec,
        tgn=tgn,
        geo=geo,
        candidate_points=scenario.candidate_cash_points,
        estimated_amount=400000.0
    )

    assert result.id.startswith("PRED-")
    assert len(result.locations) <= 3
    assert result.locations[0].rank == 1
    assert result.locations[0].probability >= result.locations[1].probability
    assert result.expected_recovery > 0.0
