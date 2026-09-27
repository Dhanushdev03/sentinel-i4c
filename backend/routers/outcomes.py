"""
Outcomes Router: Feedback Loop & Model Verification Intake
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from backend.database import repo
from backend.auth import get_current_user, User

router = APIRouter(prefix="/api/outcomes", tags=["Outcomes"])


class OutcomeRequest(BaseModel):
    case_id: str
    result: str  # HIT, MISS, PARTIAL
    actual_location: str
    actual_amount: float
    cash_recovered: float
    officer_comments: str


@router.post("", status_code=201)
def record_case_outcome(req: OutcomeRequest, current_user: User = Depends(get_current_user)):
    valid_results = ["HIT", "MISS", "PARTIAL"]
    if req.result.upper() not in valid_results:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid outcome result '{req.result}'. Allowed: {valid_results}"
        )

    case = repo.get_case(req.case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {req.case_id} not found")

    outcome = repo.record_outcome(
        case_id=req.case_id,
        result=req.result,
        actual_location=req.actual_location,
        actual_amount=req.actual_amount,
        cash_recovered=req.cash_recovered,
        officer_comments=req.officer_comments,
        recorded_by=current_user.full_name
    )

    return {
        "status": "OUTCOME_RECORDED",
        "feedback_applied": True,
        "message": f"Outcome {req.result.upper()} recorded. Model feedback loop updated.",
        "outcome": outcome
    }
