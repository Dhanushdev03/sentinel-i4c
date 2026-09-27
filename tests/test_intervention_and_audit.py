"""
Unit Tests: Intervention Optimizer & Chained Audit Log Integrity
"""

import pytest
from simulator.fraud_simulator import FraudSimulator
from ml.intervention import InterventionOptimizer
from ml.fusion import FusionEngine, CandidateLocation
from backend.audit import AuditLogManager


def test_intervention_optimizer():
    optimizer = InterventionOptimizer()
    candidates = [
        CandidateLocation(
            rank=1, id="LOC-1", name="Target Alpha", address="Addr 1", type="ATM", bank="SBI",
            probability=0.70, confidence=0.85, lat=19.1, lng=72.8, district="Mumbai", state="Maharashtra",
            distance_km=4.0, eta_min=12, expected_recovery=0.0, tgn_score=0.7, stkde_score=0.6,
            stgcn_score=0.6, fusion_score=0.68, jurisdiction_ps="Alpha PS"
        ),
        CandidateLocation(
            rank=2, id="LOC-2", name="Target Bravo", address="Addr 2", type="CSP", bank="HDFC",
            probability=0.20, confidence=0.60, lat=19.2, lng=72.9, district="Mumbai", state="Maharashtra",
            distance_km=14.0, eta_min=30, expected_recovery=0.0, tgn_score=0.4, stkde_score=0.4,
            stgcn_score=0.4, fusion_score=0.40, jurisdiction_ps="Bravo PS"
        )
    ]

    plan = optimizer.optimize(
        case_id="INT-CASE-01",
        prediction_id="PRED-01",
        candidates=candidates,
        predicted_amount=400000.0
    )

    assert len(plan.priorities) == 2
    assert plan.priorities[0].priority_level == 1
    assert plan.priorities[0].expected_recovery > plan.priorities[1].expected_recovery
    assert "RECOMMENDATION ONLY" in plan.mandatory_human_notice


def test_audit_hash_chain_integrity():
    auditor = AuditLogManager()
    auditor.log_event("USR-01", "CASE_CREATED", "Test Case 1 Created", "CASE-01")
    auditor.log_event("USR-01", "ALERT_SENT", "Red Alert Dispatched", "CASE-01")
    auditor.log_event("USR-02", "ALERT_ACKNOWLEDGED", "Officer acknowledged alert", "CASE-01")

    # Verify untouched chain
    status = auditor.verify_integrity()
    assert status.is_valid is True
    assert status.total_entries == 4  # 1 genesis + 3 events

    # Intentionally tamper with an entry
    original_details = auditor.logs[1].details
    auditor.logs[1].details = "TAMPERED DETAILS"
    tampered_status = auditor.verify_integrity()
    assert tampered_status.is_valid is False

    # Restore
    auditor.logs[1].details = original_details
    assert auditor.verify_integrity().is_valid is True
