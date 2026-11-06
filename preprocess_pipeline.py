import os
import glob
import json
import re
import numpy as np
import pandas as pd
from afinn import Afinn

BASE_DIR = "/Users/swayampadhi/.gemini/antigravity/scratch/trendscope"
SRC_DATA_DIR = os.path.join(BASE_DIR, "BDA PROJECT/data")
CLEAN_DATA_DIR = os.path.join(BASE_DIR, "data/clean")
os.makedirs(CLEAN_DATA_DIR, exist_ok=True)

print("Starting TrendScope Data Preprocessing Pipeline...")

# 1. Load Category Metadata
print("Loading and unifying category metadata...")
cat_map = {}
for jf_path in sorted(glob.glob(os.path.join(SRC_DATA_DIR, "*_category_id.json"))):
    with open(jf_path, "r", encoding="utf-8") as jf:
        data = json.load(jf)
        for item in data.get("items", []):
            cid = int(item["id"])
            title = item["snippet"]["title"]
            cat_map[cid] = title

# Fallback names if any missing
default_cats = {
    1: "Film & Animation", 2: "Autos & Vehicles", 10: "Music", 15: "Pets & Animals",
    17: "Sports", 18: "Short Movies", 19: "Travel & Events", 20: "Gaming",
    21: "Videoblogging", 22: "People & Blogs", 23: "Comedy", 24: "Entertainment",
    25: "News & Politics", 26: "Howto & Style", 27: "Education", 28: "Science & Technology",
    29: "Nonprofits & Activism", 30: "Movies", 43: "Shows", 44: "Trailers"
}
for cid, title in default_cats.items():
    if cid not in cat_map:
        cat_map[cid] = title

with open(os.path.join(CLEAN_DATA_DIR, "categories.json"), "w", encoding="utf-8") as out_jf:
    json.dump(cat_map, out_jf, indent=2)
print(f"Unified {len(cat_map)} categories.")

# 2. Process all 10 CSV files
countries = ["CA", "DE", "FR", "GB", "IN", "JP", "KR", "MX", "RU", "US"]
all_clean_snapshots = []
cleaning_audit = []

af = Afinn()

for cc in countries:
    csv_file = os.path.join(SRC_DATA_DIR, f"{cc}videos.csv")
    print(f"\nProcessing {cc} ({csv_file})...")
    
    # Read with UTF-8 and replacement for rogue bytes
    with open(csv_file, "r", encoding="utf-8", errors="replace") as f:
        df = pd.read_csv(f, on_bad_lines="skip")
    
    raw_count = len(df)
    
    # Check exact duplicates
    exact_dups = df.duplicated().sum()
    df = df.drop_duplicates().copy()
    
    # Parse dates: format %y.%d.%m
    df["trending_date"] = pd.to_datetime(df["trending_date"], format="%y.%d.%m", errors="coerce")
    df = df.dropna(subset=["trending_date"]).copy()
    
    # Parse publish_time
    df["publish_time"] = pd.to_datetime(df["publish_time"], errors="coerce")
    
    # Duplicate conflict resolution for same video on same date
    # deterministic rule: pick record with highest views (most recent crawl of the day)
    vid_date_conflicts = df.duplicated(subset=["video_id", "trending_date"]).sum()
    df = df.sort_values(by=["views", "likes"], ascending=[False, False])
    df = df.drop_duplicates(subset=["video_id", "trending_date"], keep="first").copy()
    
    # Clean numerical columns
    for num_col in ["views", "likes", "dislikes", "comment_count"]:
        df[num_col] = pd.to_numeric(df[num_col], errors="coerce").fillna(0).clip(lower=0).astype(np.int64)
        
    df["category_id"] = pd.to_numeric(df["category_id"], errors="coerce").fillna(0).astype(int)
    df["category_name"] = df["category_id"].map(cat_map).fillna("Other / Unknown")
    
    # Clean boolean columns
    for bool_col in ["comments_disabled", "ratings_disabled", "video_error_or_removed"]:
        df[bool_col] = df[bool_col].astype(bool)
        
    df["country"] = cc
    
    # Calculate snapshot engagement rates
    v = df["views"].replace(0, 1)
    df["like_rate"] = (df["likes"] / v).clip(0.0, 1.0)
    df["comment_rate"] = (df["comment_count"] / v).clip(0.0, 1.0)
    df["dislike_rate"] = (df["dislikes"] / v).clip(0.0, 1.0)
    df["positive_rate"] = ((df["likes"] + df["comment_count"]) / v).clip(0.0, 1.0)
    df["total_interaction_rate"] = ((df["likes"] + df["dislikes"] + df["comment_count"]) / v).clip(0.0, 1.0)
    
    # Time to trend in hours
    df["time_to_trend_hours"] = ((df["trending_date"] - df["publish_time"].dt.tz_localize(None)).dt.total_seconds() / 3600.0).clip(lower=0)
    
    cleaned_count = len(df)
    unique_vids = df["video_id"].nunique()
    
    cleaning_audit.append({
        "country": cc,
        "raw_records": raw_count,
        "exact_duplicates_removed": int(exact_dups),
        "same_day_conflicts_resolved": int(vid_date_conflicts),
        "clean_records": cleaned_count,
        "unique_videos": unique_vids
    })
    
    all_clean_snapshots.append(df)
    print(f"  {cc} clean: {cleaned_count:,} records ({unique_vids:,} unique videos).")

unified_df = pd.concat(all_clean_snapshots, ignore_index=True)
print(f"\nTotal unified clean snapshots: {len(unified_df):,} records across 10 countries.")

# Save unified snapshots to Parquet
snapshots_parquet = os.path.join(CLEAN_DATA_DIR, "snapshots.parquet")
unified_df.to_parquet(snapshots_parquet, index=False)
print(f"Saved snapshots to {snapshots_parquet}")

# 3. Build unique videos table with longitudinal lifecycle metrics & AFINN sentiment
print("\nComputing unique video longitudinal metrics & AFINN title sentiment...")
# Sort by trending date
unified_df = unified_df.sort_values(["country", "video_id", "trending_date"])

unique_records = []
grouped = unified_df.groupby(["country", "video_id"])

# We compute unique video metrics efficiently
first_rows = grouped.first().reset_index()
last_rows = grouped.last().reset_index()
agg_metrics = grouped.agg(
    trend_count=("trending_date", "count"),
    min_date=("trending_date", "min"),
    max_date=("trending_date", "max"),
    views_first=("views", "first"),
    views_last=("views", "last"),
    likes_last=("likes", "last"),
    dislikes_last=("dislikes", "last"),
    comments_last=("comment_count", "last")
).reset_index()

unique_df = pd.merge(agg_metrics, last_rows[["country", "video_id", "title", "channel_title", "category_id", "category_name", "publish_time", "thumbnail_link", "time_to_trend_hours", "like_rate", "comment_rate", "dislike_rate", "positive_rate", "total_interaction_rate"]], on=["country", "video_id"])

unique_df["trend_duration_days"] = (unique_df["max_date"] - unique_df["min_date"]).dt.days + 1
unique_df["views_growth"] = (unique_df["views_last"] - unique_df["views_first"]).clip(lower=0)
unique_df["daily_velocity"] = np.where(unique_df["trend_duration_days"] > 1, unique_df["views_growth"] / (unique_df["trend_duration_days"] - 1), 0)

# Compute AFINN sentiment per unique video
print("Computing AFINN sentiment for unique video titles...")
def score_title(title):
    if not isinstance(title, str) or not title.strip():
        return 0.0, "unclassified"
    # Find matching words
    words = re.findall(r'\b[a-zA-Z]+\b', title.lower())
    matched_scores = [af.score(w) for w in words if af.score(w) != 0]
    if not matched_scores:
        return 0.0, "unclassified"
    avg_score = float(np.mean(matched_scores))
    if avg_score > 0:
        return avg_score, "positive"
    elif avg_score < 0:
        return avg_score, "negative"
    else:
        return 0.0, "neutral"

sent_results = [score_title(t) for t in unique_df["title"]]
unique_df["afinn_score"] = [r[0] for r in sent_results]
unique_df["sentiment_category"] = [r[1] for r in sent_results]

# Title characteristics
unique_df["title_char_length"] = unique_df["title"].astype(str).str.len()
unique_df["title_word_count"] = unique_df["title"].astype(str).str.split().str.len()
alpha_count = unique_df["title"].astype(str).str.findall(r'[a-zA-Z]').str.len().replace(0, 1)
upper_count = unique_df["title"].astype(str).str.findall(r'[A-Z]').str.len()
unique_df["uppercase_ratio"] = (upper_count / alpha_count).clip(0.0, 1.0)
unique_df["contains_question"] = unique_df["title"].astype(str).str.contains(r'\?', regex=True)
unique_df["contains_exclamation"] = unique_df["title"].astype(str).str.contains(r'!', regex=True)

unique_parquet = os.path.join(CLEAN_DATA_DIR, "unique_videos.parquet")
unique_df.to_parquet(unique_parquet, index=False)
print(f"Saved unique videos table ({len(unique_df):,} rows) to {unique_parquet}")

# Save data quality audit
audit_path = os.path.join(CLEAN_DATA_DIR, "cleaning_audit.json")
with open(audit_path, "w", encoding="utf-8") as af:
    json.dump(cleaning_audit, af, indent=2)

print("Preprocessing pipeline completed successfully!")
