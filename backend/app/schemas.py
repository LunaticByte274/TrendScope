from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class FilterParams(BaseModel):
    country: Optional[str] = "US"
    category_id: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    search: Optional[str] = None

class VideoItem(BaseModel):
    video_id: str
    country: str
    title: str
    channel_title: str
    category_id: int
    category_name: str
    views: int
    likes: int
    dislikes: int
    comment_count: int
    trend_count: int
    trend_duration_days: int
    first_date: str
    last_date: str
    like_rate: float
    comment_rate: float
    positive_rate: float
    afinn_score: float
    sentiment_category: str
    thumbnail_link: str

class VideoSnapshotHistory(BaseModel):
    trending_date: str
    views: int
    likes: int
    dislikes: int
    comment_count: int
    like_rate: float
    comment_rate: float

class VideoDetailResponse(BaseModel):
    video: VideoItem
    history: List[VideoSnapshotHistory]
    category_benchmarks: Dict[str, Any]

class KpiSummary(BaseModel):
    total_records: int
    unique_videos: int
    total_countries: int
    total_categories: int
    avg_views: float
    median_views: float
    total_unique_views: int
    total_legacy_views: int
    avg_like_rate: float
    avg_comment_rate: float
    top_category: str
    date_coverage: str

class OverviewResponse(BaseModel):
    kpis: KpiSummary
    daily_activity: List[Dict[str, Any]]
    top_trending_videos: List[VideoItem]
    category_popularity: List[Dict[str, Any]]
    views_distribution: List[Dict[str, Any]]
    engagement_distribution: List[Dict[str, Any]]
    sentiment_summary: Dict[str, Any]
    country_comparison_quick: List[Dict[str, Any]]
    insights: List[Dict[str, str]]

class CategoryItem(BaseModel):
    category_id: int
    category_name: str
    unique_video_count: int
    unique_views: int
    legacy_views: int
    inflation_ratio: float
    avg_views: float
    median_views: float
    avg_likes: float
    avg_like_rate: float
    avg_comment_rate: float
    avg_positive_rate: float
    avg_afinn: float
    avg_trend_days: float

class ContinuationPredictRequest(BaseModel):
    views: int
    likes: int
    dislikes: int
    comment_count: int
    category_id: int
    prior_trend_count: int = 1
    hours_since_publish: float = 24.0

class ContinuationPredictResponse(BaseModel):
    probability: float
    prediction: int
    interpretation: str
    feature_contributions: Dict[str, float]

class TisSimulationRequest(BaseModel):
    country: Optional[str] = "US"
    weight_views: float = 30.0
    weight_engagement: float = 30.0
    weight_frequency: float = 20.0
    weight_velocity: float = 20.0
    limit: int = 20

