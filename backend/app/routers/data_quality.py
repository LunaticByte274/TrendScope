from fastapi import APIRouter
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/data-quality", tags=["Data Quality"])

@router.get("")
def get_data_quality():
    return AnalyticsService.get_data_quality()

