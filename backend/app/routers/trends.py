from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/trends", tags=["Trending Explorer"])

@router.get("")
def get_trending_videos(
    country: Optional[str] = Query("US"),
    category_id: Optional[int] = Query(None),
    sort_by: Optional[str] = Query("trend_count", description="trend_count, views, likes, like_rate, comments, velocity"),
    limit: Optional[int] = Query(20, ge=1, le=100),
    offset: Optional[int] = Query(0, ge=0),
    search: Optional[str] = Query(None)
):
    return AnalyticsService.get_trending_videos(
        country=country,
        category_id=category_id,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
        search=search
    )

@router.get("/{video_id}")
def get_video_detail(video_id: str, country: Optional[str] = Query("US")):
    detail = AnalyticsService.get_video_detail(video_id, country)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")
    return detail

