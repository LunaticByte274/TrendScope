from fastapi import APIRouter, Query, Body
from typing import Optional
from app.services.ml_service import MLService
from app.services.analytics_service import AnalyticsService
from app.schemas import ContinuationPredictRequest, TisSimulationRequest

router = APIRouter(prefix="/models", tags=["Predictive Studio & ML"])

@router.get("/summary")
def get_models_summary():
    return {
        "models": [
            {
                "id": "trend_continuation",
                "name": "Trend Continuation Prediction",
                "type": "Supervised Binary Classification",
                "purpose": "Predicts whether an actively trending video will reappear on the trending list on the following calendar day without future data leakage.",
                "algorithms": ["Logistic Regression", "Random Forest (Best: 81.6% Acc, 0.876 ROC-AUC)", "Gradient Boosting"],
                "features": ["log_views", "log_likes", "like_rate", "comment_rate", "prior_trend_count", "time_to_trend_hours", "category_id"]
            },
            {
                "id": "content_clustering",
                "name": "Video Performance Clustering",
                "type": "Unsupervised K-Means + PCA 2D",
                "purpose": "Groups videos into 4 behavioral archetypes based on standardized volume, velocity, and audience interaction vectors.",
                "algorithms": ["K-Means (k=4)", "Principal Component Analysis (PCA)"],
                "features": ["log_views", "log_likes", "like_rate", "comment_rate", "trend_duration_days"]
            },
            {
                "id": "category_forecasting",
                "name": "Category Trend Activity Forecasting",
                "type": "Time-Series Econometric Modeling",
                "purpose": "Forecasts out-of-sample daily video trending volumes per category with confidence bounds.",
                "algorithms": ["Holt-Winters Exponential Smoothing", "ARIMA(2,1,1)"],
                "horizon_days": 30
            },
            {
                "id": "anomaly_detection",
                "name": "Multivariate Virality Anomaly Detection",
                "type": "Unsupervised Tree Ensembles",
                "purpose": "Detects extraordinary viral spikes, controversial dislike ratios, and irregular trajectory outliers.",
                "algorithms": ["Isolation Forest (Contamination=0.03)"]
            },
            {
                "id": "topic_discovery",
                "name": "Title Semantic Topic Discovery",
                "type": "Natural Language Processing (NLP)",
                "purpose": "Extracts recurring latent content themes and characteristic keywords from video titles.",
                "algorithms": ["TF-IDF N-grams", "Non-Negative Matrix Factorization (NMF)"]
            }
        ]
    }

@router.get("/trend-prediction")
def get_trend_prediction_benchmarks(country: Optional[str] = Query("US")):
    return MLService.get_continuation_benchmark(country=country)

@router.post("/predict-continuation")
def predict_continuation(req: ContinuationPredictRequest):
    return MLService.predict_continuation(
        views=req.views,
        likes=req.likes,
        dislikes=req.dislikes,
        comment_count=req.comment_count,
        category_id=req.category_id,
        prior_trend_count=req.prior_trend_count,
        hours_since_publish=req.hours_since_publish
    )

@router.get("/clustering")
def get_clustering(country: Optional[str] = Query("US")):
    return MLService.get_clustering(country=country)

@router.get("/forecast")
def get_forecast(
    country: Optional[str] = Query("US"),
    category_id: Optional[int] = Query(10),
    horizon: Optional[int] = Query(30, ge=7, le=60)
):
    return MLService.get_forecast(country=country, category_id=category_id, horizon=horizon)

@router.get("/anomalies")
def get_anomalies(country: Optional[str] = Query("US")):
    return MLService.get_anomalies(country=country)

@router.get("/topics")
def get_topics(country: Optional[str] = Query("US")):
    return MLService.get_topics(country=country)

@router.post("/simulate-tis")
def simulate_tis(req: TisSimulationRequest):
    return AnalyticsService.simulate_tis(
        country=req.country,
        weight_views=req.weight_views,
        weight_engagement=req.weight_engagement,
        weight_frequency=req.weight_frequency,
        weight_velocity=req.weight_velocity,
        limit=req.limit
    )

