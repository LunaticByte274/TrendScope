from fastapi import APIRouter, Query
from typing import Optional
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("")
def get_overview(
    country: Optional[str] = Query("US", description="Country code (e.g. US, GB, ALL)"),
    category_id: Optional[int] = Query(None, description="Category ID filter"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Search term")
):
    return AnalyticsService.get_overview(
        country=country,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search
    )

