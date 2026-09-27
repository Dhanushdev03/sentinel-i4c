"""
End-to-End Integration Test: Sentinel-I4C
Tests Complete SIH Lifecycle:
Complaint Received
  ↓
Case Creation
  ↓
Transaction Stream & Dynamic Graph
  ↓
Trace Confidence & Route Selection
  ↓
TGN / Geo-Temporal Fusion
  ↓
Predictions (Location, Time, Amount)
  ↓
Explainability (SHAP & Counterfactual)
  ↓
Intervention Optimization
  ↓
Alert Generation & Officer Action
  ↓
Outcome Recording & Feedback Loop
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_complete_e2e_pipeline():
    # 1. Step 1: Create Case (Complaint Received)
    case_payload = {
        "fraud_type": "UPI Fraud",
        "reported_amount": 420000.0,
        "state": "Maharashtra",
        "district": "Mumbai",
        "notes": "E2E Automated Integration Test Case"
    }
    create_res = client.post("/api/cases", json=case_payload)
    assert create_res.status_code == 201
    created_case = create_res.json()
    case_id = created_case["id"]
    assert case_id.startswith("CASE-")
    assert created_case["status"] == "ACTIVE"

    # 2. Step 2: Ingest & Retrieve Dynamic Transaction Graph
    graph_res = client.get(f"/api/cases/{case_id}/graph")
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert len(graph_data["nodes"]) >= 3
    assert len(graph_data["edges"]) >= 3

    # 3. Step 3: Verify Trace Confidence & Predictions
    pred = created_case.get("prediction")
    assert pred is not None
    assert pred["trace_confidence"] in ("HIGH", "MEDIUM", "LOW")
    assert len(pred["locations"]) == 3
    top_loc = pred["locations"][0]
    assert top_loc["rank"] == 1
    assert top_loc["probability"] > 0
    assert pred["time_window_min"] < pred["time_window_max"]
    assert pred["amount_min"] < pred["amount_max"]

    # 4. Step 4: Verify Explainability (SHAP & Counterfactual)
    expl_res = client.get(f"/api/predictions/{pred['id']}/explanation")
    assert expl_res.status_code == 200
    expl_data = expl_res.json()
    assert len(expl_data["top_factors"]) >= 4
    assert "If the last transfer amount" in expl_data["counterfactual"]

    # 5. Step 5: Verify Intervention Optimizer
    plan_res = client.get(f"/api/interventions/{case_id}")
    assert plan_res.status_code == 200
    plan_data = plan_res.json()
    assert len(plan_data["priorities"]) >= 1
    p1 = plan_data["priorities"][0]
    assert p1["expected_recovery"] > 0
    assert "RECOMMENDATION ONLY" in plan_data["mandatory_human_notice"]

    # 6. Step 6: Verify Alert and Human-in-the-Loop Action
    alert = created_case.get("alert")
    assert alert is not None
    alert_id = alert["id"]

    # Officer acknowledges and confirms alert
    action_res = client.put(
        f"/api/alerts/{alert_id}/action",
        json={"action": "ACKNOWLEDGE", "officer_note": "Patrol dispatched to target ATM kiosk"}
    )
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "ACKNOWLEDGE"

    # 7. Step 7: Record Outcome (Hit/Miss) into Feedback Loop
    outcome_payload = {
        "case_id": case_id,
        "result": "HIT",
        "actual_location": top_loc["name"],
        "actual_amount": 395000.0,
        "cash_recovered": 380000.0,
        "officer_comments": "Suspect intercepted at predicted ATM terminal. Cash recovered."
    }
    outcome_res = client.post("/api/outcomes", json=outcome_payload)
    assert outcome_res.status_code == 201
    outcome_data = outcome_res.json()
    assert outcome_data["status"] == "OUTCOME_RECORDED"
    assert outcome_data["feedback_applied"] is True

    # 8. Step 8: Verify Case Evidence Passport
    passport_res = client.get(f"/api/evidence/{case_id}")
    assert passport_res.status_code == 200
    passport = passport_res.json()
    assert passport["case_id"] == case_id
    assert len(passport["passport_sha256"]) == 64
    assert passport["outcome_feedback"]["result"] == "HIT"

    # 9. Step 9: Verify Tamper-Evident Chained Audit Log
    verify_res = client.post("/api/audit/verify")
    assert verify_res.status_code == 200
    audit_status = verify_res.json()
    assert audit_status["is_valid"] is True
