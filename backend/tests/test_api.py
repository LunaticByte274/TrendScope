import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["platform"] == "TrendScope"

def test_metadata():
    res = client.get("/api/metadata")
    assert res.status_code == 200
    data = res.json()
    assert len(data["countries"]) == 10
    assert len(data["categories"]) >= 16
    assert data["total_records"] > 300000

def test_overview_us():
    res = client.get("/api/overview?country=US")
    assert res.status_code == 200
    data = res.json()
    kpis = data["kpis"]
    assert kpis["unique_videos"] == 6351
    assert kpis["total_records"] == 40899
    assert len(data["daily_activity"]) > 100
    assert len(data["top_trending_videos"]) == 10
    assert len(data["category_popularity"]) > 5
    assert len(data["insights"]) >= 2

def test_trending_explorer():
    res = client.get("/api/trends?country=US&limit=10&sort_by=trend_count")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 6351
    assert len(data["videos"]) == 10
    top_v = data["videos"][0]
    assert top_v["trend_count"] >= 28

    # Video detail
    vid_id = top_v["video_id"]
    detail_res = client.get(f"/api/trends/{vid_id}?country=US")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["video"]["video_id"] == vid_id
    assert len(detail["history"]) >= 1

def test_categories():
    res = client.get("/api/categories?country=US")
    assert res.status_code == 200
    data = res.json()
    cats = data["categories"]
    assert len(cats) >= 10
    # Music should be top category
    music_cat = next(c for c in cats if c["category_id"] == 10)
    assert music_cat["unique_views"] > 4000000000
    assert music_cat["inflation_ratio"] > 5.0  # Demonstrating legacy inflation

def test_engagement():
    res = client.get("/api/engagement?country=US")
    assert res.status_code == 200
    data = res.json()
    assert len(data["scatter_sample"]) > 100
    assert "pearson" in data["correlations"]
    assert "spearman" in data["correlations"]
    assert len(data["category_engagement"]) > 5

def test_sentiment():
    res = client.get("/api/sentiment?country=US")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "histogram" in data
    assert len(data["top_positive"]) > 0

def test_countries_and_compare():
    res = client.get("/api/countries")
    assert res.status_code == 200
    assert len(res.json()["countries"]) == 10

    comp_res = client.get("/api/countries/compare?codes=US,GB,CA,IN")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert len(comp_data["comparison"]) == 4

def test_creators():
    res = client.get("/api/creators?country=US&limit=15")
    assert res.status_code == 200
    data = res.json()
    assert len(data["creators"]) == 15

def test_videos_table():
    res = client.get("/api/videos?country=US&page=1&page_size=10&sort_by=views&sort_dir=desc")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] == 6351
    assert len(data["videos"]) == 10

def test_ml_trend_prediction():
    res = client.get("/api/models/trend-prediction?country=US")
    assert res.status_code == 200
    data = res.json()
    assert "random_forest" in data
    assert "roc_auc" in data["random_forest"]
    assert data["random_forest"]["roc_auc"] > 0.60

    # Live prediction endpoint
    pred_res = client.post("/api/models/predict-continuation", json={
        "views": 1500000,
        "likes": 85000,
        "dislikes": 2000,
        "comment_count": 6000,
        "category_id": 10,
        "prior_trend_count": 4,
        "hours_since_publish": 28.0
    })
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert "probability" in pred_data
    assert 0.0 <= pred_data["probability"] <= 1.0

def test_ml_clustering():
    res = client.get("/api/models/clustering?country=US")
    assert res.status_code == 200
    data = res.json()
    assert len(data["profiles"]) == 4
    assert len(data["scatter_points"]) > 50

def test_ml_forecast():
    res = client.get("/api/models/forecast?country=US&category_id=10&horizon=30")
    assert res.status_code == 200
    data = res.json()
    assert len(data["historical"]) > 50
    assert len(data["forecast"]) == 30
    assert "mae" in data["metrics"]

def test_ml_anomalies_and_topics():
    anom_res = client.get("/api/models/anomalies?country=US")
    assert anom_res.status_code == 200
    assert len(anom_res.json()["anomalies"]) > 0

    topics_res = client.get("/api/models/topics?country=US")
    assert topics_res.status_code == 200
    assert len(topics_res.json()["topics"]) == 6

def test_tis_simulation():
    res = client.post("/api/models/simulate-tis", json={
        "country": "US",
        "weight_views": 40.0,
        "weight_engagement": 30.0,
        "weight_frequency": 20.0,
        "weight_velocity": 10.0,
        "limit": 10
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["ranked_videos"]) == 10
    assert data["ranked_videos"][0]["tis_score"] > 0

def test_data_quality_report():
    res = client.get("/api/data-quality")
    assert res.status_code == 200
    data = res.json()
    assert len(data["audit"]) == 10

def test_csv_export():
    res = client.get("/api/export/csv?country=US&limit=50")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/csv")
    assert b"video_id" in res.content
