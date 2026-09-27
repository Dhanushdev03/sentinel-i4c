"""
Cases Router: Endpoints for Case Management, Transaction Graph, and Simulation
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from backend.database import repo
from backend.auth import get_current_user, User
from backend.audit import audit_manager

router = APIRouter(prefix="/api/cases", tags=["Cases"])


class NewCaseRequest(BaseModel):
    fraud_type: str = "UPI Fraud"
    reported_amount: float = 450000.0
    state: str = "Maharashtra"
    district: str = "Mumbai"
    victim_account_token: Optional[str] = None
    initial_tx_id: Optional[str] = None
    notes: Optional[str] = None


@router.get("")
def list_cases(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    fraud_type: Optional[str] = None,
    state: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    cases = repo.get_cases()
    if status:
        cases = [c for c in cases if c.get("status", "").upper() == status.upper()]
    if severity:
        cases = [c for c in cases if c.get("severity", "").upper() == severity.upper()]
    if fraud_type:
        cases = [c for c in cases if c.get("fraud_type", "").lower() == fraud_type.lower()]
    if state:
        cases = [c for c in cases if c.get("state", "").lower() == state.lower()]
    return cases


@router.post("", status_code=201)
def create_case(req: NewCaseRequest, current_user: User = Depends(get_current_user)):
    case = repo.create_case(
        fraud_type=req.fraud_type,
        reported_amount=req.reported_amount,
        state=req.state,
        district=req.district,
        officer_name=current_user.full_name,
        officer_badge=current_user.badge_number
    )
    return case


@router.get("/{case_id}")
def get_case(case_id: str, current_user: User = Depends(get_current_user)):
    case = repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return case


@router.post("/{case_id}/simulate")
def simulate_case_flow(case_id: str, current_user: User = Depends(get_current_user)):
    case = repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    audit_manager.log_event(
        user_id=current_user.badge_number,
        action="SIMULATION_TRIGGERED",
        details=f"Live simulation executed for case {case_id}",
        case_id=case_id
    )
    return {
        "status": "SIMULATION_SUCCESS",
        "case_id": case_id,
        "prediction": case.get("prediction"),
        "alert": case.get("alert"),
        "transactions_streamed": len(case.get("transactions", []))
    }


@router.get("/{case_id}/transactions")
def get_case_transactions(case_id: str, current_user: User = Depends(get_current_user)):
    case = repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return repo.transactions.get(case_id, [])


@router.get("/{case_id}/graph")
def get_case_graph(case_id: str, current_user: User = Depends(get_current_user)):
    case = repo.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return repo.get_graph(case_id)
