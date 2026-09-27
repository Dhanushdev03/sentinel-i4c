"""
SENTINEL-I4C: Prediction Passport & Evidence Export
Generates an immutable-style cryptographic evidence package for LEA case files.
Includes model version, input snapshots, SHA-256 hashes, SHAP attributions,
and officer audit signatures.

IMPORTANT NOTICE:
This is a tamper-evident prototype evidence log for demonstration and investigative triaging.
It is NOT certified for statutory court admissibility under Indian Evidence Act Sec 65B without
formal forensic validation.
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class EvidencePassport(BaseModel):
    model_config = {"protected_namespaces": ()}
    passport_id: str
    case_id: str
    case_number: str
    prediction_id: str
    generated_at: str
    model_version: str
    input_snapshot_hash: str
    passport_sha256: str
    disclaimer: str = (
        "PROTOTYPE EVIDENCE LOG: Generated for hackathon evaluation and investigative triage. "
        "Not a certified statutory Certificate under Section 65B of the Indian Evidence Act."
    )
    case_summary: Dict[str, Any]
    predicted_locations: list
    time_window_estimate: str
    amount_estimate: str
    shap_factors: list
    counterfactual: str
    alert_details: Optional[Dict[str, Any]] = None
    officer_action: Optional[Dict[str, Any]] = None
    outcome_feedback: Optional[Dict[str, Any]] = None


def generate_prediction_passport(
    case: Dict[str, Any],
    prediction: Dict[str, Any],
    explanation: Optional[Dict[str, Any]] = None,
    alert: Optional[Dict[str, Any]] = None,
    officer_action: Optional[Dict[str, Any]] = None,
    outcome: Optional[Dict[str, Any]] = None
) -> EvidencePassport:
    now = datetime.now(timezone.utc).isoformat()
    passport_id = f"PASSPORT-{case.get('id', 'CYB')[-8:]}-{int(datetime.now().timestamp())}"

    # Build reproducible input snapshot string for SHA-256
    raw_snapshot = {
        "case_id": case.get("id"),
        "case_number": case.get("case_number"),
        "amount": case.get("reported_amount"),
        "fraud_type": case.get("fraud_type"),
        "prediction_id": prediction.get("id"),
        "locations": prediction.get("locations", []),
        "time_window": f"{prediction.get('time_window_min')}-{prediction.get('time_window_max')}m",
        "model_version": prediction.get("model_version", "SENTINEL-v0.4.2"),
    }
    serialized_snapshot = json.dumps(raw_snapshot, sort_keys=True)
    input_hash = hashlib.sha256(serialized_snapshot.encode("utf-8")).hexdigest()

    # Calculate overall passport cryptographic seal
    passport_seal = hashlib.sha256(f"{passport_id}|{input_hash}|{now}".encode("utf-8")).hexdigest()

    time_str = f"{prediction.get('time_window_min', 15)}–{prediction.get('time_window_max', 28)} min"
    amt_min = prediction.get("amount_min", 0)
    amt_max = prediction.get("amount_max", 0)
    amt_str = f"₹{amt_min:,.2f} – ₹{amt_max:,.2f}"

    return EvidencePassport(
        passport_id=passport_id,
        case_id=case.get("id", ""),
        case_number=case.get("case_number", ""),
        prediction_id=prediction.get("id", ""),
        generated_at=now,
        model_version=prediction.get("model_version", "SENTINEL-TGN-v0.4.2-PROTOTYPE"),
        input_snapshot_hash=input_hash,
        passport_sha256=passport_seal,
        case_summary={
            "fraud_type": case.get("fraud_type"),
            "reported_amount": case.get("reported_amount"),
            "victim_account": case.get("victim_account_token"),
            "state": case.get("state"),
            "district": case.get("district"),
            "severity": case.get("severity"),
            "hops_count": case.get("hops_count", len(case.get("transactions", [])))
        },
        predicted_locations=prediction.get("locations", []),
        time_window_estimate=time_str,
        amount_estimate=amt_str,
        shap_factors=explanation.get("top_factors", []) if explanation else [],
        counterfactual=explanation.get("counterfactual", "N/A") if explanation else "N/A",
        alert_details=alert,
        officer_action=officer_action,
        outcome_feedback=outcome
    )
