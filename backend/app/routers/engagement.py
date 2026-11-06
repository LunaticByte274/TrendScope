from fastapi import APIRouter, Query
from typing import Optional
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/engagement", tags=["Engagement Analytics"])

@router.get("")
def get_engagement_lab(
    country: Optional[str] = Query("US"),
    category_id: Optional[int] = Query(None)
):
    return AnalyticsService.get_engagement_lab(country=country, category_id=category_id)

