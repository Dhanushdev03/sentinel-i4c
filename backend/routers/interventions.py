"""
Interventions Router: Operational Recommendation Plans & Priorities
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from backend.database import repo
from backend.auth import get_current_user, User

router = APIRouter(prefix="/api/interventions", tags=["Interventions"])


@router.get("/{case_id}")
def get_intervention_plan(case_id: str, current_user: User = Depends(get_current_user)):
    plan = repo.interventions.get(case_id)
    if not plan:
        raise HTTPException(status_code=404, detail=f"No intervention plan for case {case_id}")
    return plan


@router.post("")
def trigger_intervention_optimization(case_id: str, current_user: User = Depends(get_current_user)):
    case = repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    pred = case.get("prediction")
    if not pred or not pred.get("locations"):
        raise HTTPException(status_code=400, detail="Case has no valid predictions to optimize")

    plan = repo.intervention_optimizer.optimize(
        case_id=case_id,
        prediction_id=pred["id"],
        candidates=pred["locations"],
        predicted_amount=pred["amount_max"]
    )
    repo.interventions[case_id] = plan.model_dump()
    return plan.model_dump()
