from fastapi import APIRouter
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Metadata"])

@router.get("/health")
def health_check():
    return {"status": "ok", "platform": "TrendScope", "version": "2.0.0"}

@router.get("/metadata")
def get_metadata():
    return AnalyticsService.get_metadata()

