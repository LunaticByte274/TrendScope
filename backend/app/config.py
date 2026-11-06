import os

BASE_DIR = os.environ.get("BASE_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
CLEAN_DATA_DIR = os.environ.get("CLEAN_DATA_DIR", os.path.join(BASE_DIR, "data/clean"))

SNAPSHOTS_PARQUET = os.path.join(CLEAN_DATA_DIR, "snapshots.parquet")
UNIQUE_VIDEOS_PARQUET = os.path.join(CLEAN_DATA_DIR, "unique_videos.parquet")
CATEGORIES_JSON = os.path.join(CLEAN_DATA_DIR, "categories.json")
CLEANING_AUDIT_JSON = os.path.join(CLEAN_DATA_DIR, "cleaning_audit.json")

SUPPORTED_COUNTRIES = ["US", "CA", "GB", "IN", "DE", "FR", "JP", "KR", "MX", "RU"]

COUNTRY_NAMES = {
    "US": "United States",
    "CA": "Canada",
    "GB": "Great Britain",
    "IN": "India",
    "DE": "Germany",
    "FR": "France",
    "JP": "Japan",
    "KR": "South Korea",
    "MX": "Mexico",
    "RU": "Russia"
}

