"""
Alerts Router: Real-time Multi-agency Alerting & Human-in-the-Loop Actions
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from backend.database import repo
from backend.auth import get_current_user, User

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


class AlertActionRequest(BaseModel):
    action: str  # ACKNOWLEDGE, ESCALATE, OVERRIDE, RESOLVE
    officer_note: Optional[str] = None


class NewAlertRequest(BaseModel):
    case_id: str
    level: str  # RED, AMBER, GREEN
    location: str
    location_address: str
    time_window: str
    amount: float
    probability: float
    confidence: float
    reason: str
    recommended_action: str


@router.get("")
def list_alerts(
    level: Optional[str] = None,
    status: Optional[str] = None,
    case_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    alerts = list(repo.alerts.values())
    if level:
        alerts = [a for a in alerts if a.get("level", "").upper() == level.upper()]
    if status:
        alerts = [a for a in alerts if a.get("status", "").upper() == status.upper()]
    if case_id:
        alerts = [a for a in alerts if a.get("case_id") == case_id]
    return alerts


@router.post("", status_code=201)
def create_alert(req: NewAlertRequest, current_user: User = Depends(get_current_user)):
    alert_id = f"ALT-{req.case_id[-5:]}-{len(repo.alerts) + 1:02d}"
    alert_dict = req.model_dump()
    alert_dict["id"] = alert_id
    alert_dict["status"] = "PENDING"
    alert_dict["officer_id"] = current_user.badge_number

    repo.alerts[alert_id] = alert_dict
    return alert_dict


@router.put("/{alert_id}/action")
def update_alert_action(
    alert_id: str,
    req: AlertActionRequest,
    current_user: User = Depends(get_current_user)
):
    valid_actions = ["ACKNOWLEDGE", "ESCALATE", "OVERRIDE", "RESOLVE"]
    if req.action.upper() not in valid_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action '{req.action}'. Must be one of: {valid_actions}"
        )

    updated = repo.update_alert_action(
        alert_id=alert_id,
        action=req.action,
        officer_note=req.officer_note,
        officer_id=current_user.badge_number
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    return updated
