"""
Analytics Router: Performance Metrics & Model Comparison
"""

from fastapi import APIRouter, Depends
from backend.database import repo
from backend.auth import get_current_user, User

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("")
def get_analytics(current_user: User = Depends(get_current_user)):
    return repo.get_analytics_metrics()
