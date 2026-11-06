import io
import csv
from fastapi import APIRouter, Query, Response
from typing import Optional
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/csv")
def export_csv(
    country: Optional[str] = Query("US"),
    category_id: Optional[int] = Query(None),
    limit: int = Query(500, ge=1, le=5000)
):
    data = AnalyticsService.get_trending_videos(
        country=country,
        category_id=category_id,
        limit=limit
    )
    videos = data.get("videos", [])
    
    output = io.StringIO()
    if videos:
        writer = csv.DictWriter(output, fieldnames=list(videos[0].keys()))
        writer.writeheader()
        writer.writerows(videos)
        
    csv_bytes = output.getvalue().encode("utf-8")
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=trendscope_{country}_export.csv"}
    )

