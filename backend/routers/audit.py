"""
Audit Router: Chained Tamper-Evident Ledger & Integrity Verification
"""

from typing import Optional
from fastapi import APIRouter, Depends
from backend.audit import audit_manager
from backend.auth import get_current_user, User

router = APIRouter(prefix="/api/audit", tags=["Audit"])


@router.get("")
def get_audit_logs(
    case_id: Optional[str] = None,
    action: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    logs = audit_manager.logs
    if case_id:
        logs = [l for l in logs if l.case_id == case_id]
    if action:
        logs = [l for l in logs if l.action.upper() == action.upper()]
    return logs


@router.post("/verify")
@router.get("/verify")
def verify_audit_chain(current_user: User = Depends(get_current_user)):
    verification = audit_manager.verify_integrity()
    return verification.model_dump()
