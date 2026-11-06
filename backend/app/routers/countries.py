from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/countries", tags=["Global Country Comparison"])

@router.get("")
def get_countries_overview():
    return AnalyticsService.get_countries_overview()

@router.get("/compare")
def compare_countries(
    codes: Optional[str] = Query("US,GB,IN,CA", description="Comma separated country codes")
):
    selected = [c.strip().upper() for c in codes.split(",") if c.strip()]
    return AnalyticsService.compare_countries(selected)

