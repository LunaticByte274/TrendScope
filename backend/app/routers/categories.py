from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/categories", tags=["Category Intelligence"])

@router.get("")
def get_categories(
    country: Optional[str] = Query("US"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    return AnalyticsService.get_categories(
        country=country,
        start_date=start_date,
        end_date=end_date
    )

