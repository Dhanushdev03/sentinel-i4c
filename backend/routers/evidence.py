"""
Evidence Router: Prediction Passport Export & Cryptographic Verification
"""

from fastapi import APIRouter, HTTPException, Depends
from backend.database import repo
from backend.auth import get_current_user, User
from backend.prediction_passport import generate_prediction_passport

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])


@router.get("/{case_id}")
def get_case_evidence_passport(case_id: str, current_user: User = Depends(get_current_user)):
    case = repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    pred = case.get("prediction")
    if not pred:
        raise HTTPException(status_code=400, detail=f"Case {case_id} has no predictions recorded")

    explanation = repo.explanations.get(pred["id"])
    alert = case.get("alert")
    outcome = case.get("outcome")

    passport = generate_prediction_passport(
        case=case,
        prediction=pred,
        explanation=explanation,
        alert=alert,
        officer_action={
            "officer_name": case.get("officer_name"),
            "badge": case.get("officer_badge"),
            "action": alert.get("officer_action") if alert else None,
            "status": alert.get("status") if alert else None,
            "notes": alert.get("officer_note") if alert else None
        },
        outcome=outcome
    )

    return passport.model_dump()
