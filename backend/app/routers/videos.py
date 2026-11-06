from fastapi import APIRouter, Query
from typing import Optional
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/videos", tags=["Video Explorer Table"])

@router.get("")
def get_videos_table(
    country: Optional[str] = Query("US"),
    category_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    sort_by: str = Query("views"),
    sort_dir: str = Query("desc")
):
    return AnalyticsService.get_videos_table(
        country=country,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir
    )

