from fastapi import APIRouter, Query
from typing import Optional
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/sentiment", tags=["Sentiment Intelligence"])

@router.get("")
def get_sentiment(
    country: Optional[str] = Query("US"),
    category_id: Optional[int] = Query(None)
):
    return AnalyticsService.get_sentiment_analysis(country=country, category_id=category_id)

