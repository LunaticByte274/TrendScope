from fastapi import APIRouter, Query
from typing import Optional
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/creators", tags=["Creator Analytics"])

@router.get("")
def get_creators(
    country: Optional[str] = Query("US"),
    category_id: Optional[int] = Query(None),
    limit: Optional[int] = Query(25, ge=1, le=100)
):
    return AnalyticsService.get_creators(country=country, category_id=category_id, limit=limit)

