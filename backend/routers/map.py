"""
Map Router: Geospatial Withdrawal Terminals, Jurisdiction Polygons, and Risk Zones
"""

from typing import Optional
from fastapi import APIRouter, Depends
from backend.database import repo
from backend.auth import get_current_user, User

router = APIRouter(prefix="/api/map", tags=["Map"])


@router.get("/locations")
def get_map_locations(
    state: Optional[str] = None,
    point_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    points = list(repo.cash_points.values())
    if state:
        points = [p for p in points if p.state.lower() == state.lower()]
    if point_type:
        points = [p for p in points if p.type.value.upper() == point_type.upper()]

    return {
        "cash_points": [p.model_dump() for p in points],
        "total": len(points),
        "source": "SIMULATED_REGIONAL_CWP_CATALOG"
    }
