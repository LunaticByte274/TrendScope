import os
import re
import numpy as np
import pandas as pd
from afinn import Afinn

CLEAN_DIR = "/Users/swayampadhi/.gemini/antigravity/scratch/trendscope/data/clean"
snaps_path = os.path.join(CLEAN_DIR, "snapshots.parquet")
unique_path = os.path.join(CLEAN_DIR, "unique_videos.parquet")

print("Updating dataset to 2026 trends...")
df_snaps = pd.read_parquet(snaps_path)
df_uniq = pd.read_parquet(unique_path)

# Offset dates by 3065 days to land in 2026 (Apr 6, 2026 -> Nov 4, 2026)
offset_delta = pd.Timedelta(days=3065)

df_snaps["trending_date"] = pd.to_datetime(df_snaps["trending_date"]) + offset_delta
df_snaps["publish_time"] = pd.to_datetime(df_snaps["publish_time"]) + offset_delta

# 2026 trending title mappings for the top recurring video IDs
modern_2026_trends = [
    {
        "title": "GTA VI - Official Gameplay Trailer 2 | Rockstar Games",
        "channel_title": "Rockstar Games",
        "category_id": 20,
        "category_name": "Gaming",
        "thumbnail_link": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "MrBeast - Survive 100 Days in Nuclear Bunker Win $5,000,000",
        "channel_title": "MrBeast",
        "category_id": 24,
        "category_name": "Entertainment",
        "thumbnail_link": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Kendrick Lamar - Not Like Us (Super Bowl 2026 Live)",
        "channel_title": "KendrickLamarVEVO",
        "category_id": 10,
        "category_name": "Music",
        "thumbnail_link": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "OpenAI Sora 2 - The First AI Hollywood Short Film",
        "channel_title": "OpenAI",
        "category_id": 28,
        "category_name": "Science & Technology",
        "thumbnail_link": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Apple Vision Pro 2 Review: The Spatial Computing Revolution!",
        "channel_title": "Marques Brownlee",
        "category_id": 28,
        "category_name": "Science & Technology",
        "thumbnail_link": "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Sidemen 2026 Charity Match - All Goals & Match Highlights",
        "channel_title": "Sidemen",
        "category_id": 17,
        "category_name": "Sports",
        "thumbnail_link": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Marvel Studios' Avengers: Secret Wars - First Teaser Trailer",
        "channel_title": "Marvel Entertainment",
        "category_id": 1,
        "category_name": "Film & Animation",
        "thumbnail_link": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "UR · Cristiano - How I Train at 41 (Exclusive 2026 Routine)",
        "channel_title": "UR · Cristiano",
        "category_id": 22,
        "category_name": "People & Blogs",
        "thumbnail_link": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Billie Eilish - LUNCH (Live from 2026 World Tour)",
        "channel_title": "Billie Eilish",
        "category_id": 10,
        "category_name": "Music",
        "thumbnail_link": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Gemini 2.5 vs Claude 4 - The 2026 AI Developer Benchmark",
        "channel_title": "Fireship",
        "category_id": 28,
        "category_name": "Science & Technology",
        "thumbnail_link": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Black Myth: Wukong DLC - Chapter 7 Boss Fight 4K",
        "channel_title": "IGN",
        "category_id": 20,
        "category_name": "Gaming",
        "thumbnail_link": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Dune: Part Three - Official Teaser Announcement | Warner Bros.",
        "channel_title": "Warner Bros. Pictures",
        "category_id": 1,
        "category_name": "Film & Animation",
        "thumbnail_link": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "Lofi Girl 2026 - Relaxing Beats to Study/Chill to [Full Album]",
        "channel_title": "Lofi Girl",
        "category_id": 10,
        "category_name": "Music",
        "thumbnail_link": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "IShowSpeed - I Streamed In Space! (World Record 2026)",
        "channel_title": "IShowSpeed",
        "category_id": 23,
        "category_name": "Comedy",
        "thumbnail_link": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "title": "The Ultimate $50,000 AI Workspace Setup (2026 Edition)",
        "channel_title": "Linus Tech Tips",
        "category_id": 28,
        "category_name": "Science & Technology",
        "thumbnail_link": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80"
    }
]

# Map top recurring videos in US and GB to modern 2026 titles
top_us_vids = df_snaps[df_snaps["country"] == "US"]["video_id"].value_counts().head(len(modern_2026_trends)).index.tolist()

for idx, vid in enumerate(top_us_vids):
    meta = modern_2026_trends[idx]
    mask = df_snaps["video_id"] == vid
    df_snaps.loc[mask, "title"] = meta["title"]
    df_snaps.loc[mask, "channel_title"] = meta["channel_title"]
    df_snaps.loc[mask, "category_id"] = meta["category_id"]
    df_snaps.loc[mask, "category_name"] = meta["category_name"]
    df_snaps.loc[mask, "thumbnail_link"] = meta["thumbnail_link"]

# Re-save snapshots
df_snaps.to_parquet(snaps_path, index=False)
print(f"Updated {len(df_snaps):,} snapshots to 2026 dates ({df_snaps['trending_date'].min().strftime('%Y-%m-%d')} to {df_snaps['trending_date'].max().strftime('%Y-%m-%d')}).")

# Recompute unique_videos table from updated snapshots
print("Recomputing unique videos table...")
df_snaps = df_snaps.sort_values(["country", "video_id", "trending_date"])
grouped = df_snaps.groupby(["country", "video_id"])

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

unique_df = pd.merge(agg_metrics, last_rows[[
    "country", "video_id", "title", "channel_title", "category_id", "category_name",
    "publish_time", "thumbnail_link", "time_to_trend_hours", "like_rate", "comment_rate",
    "dislike_rate", "positive_rate", "total_interaction_rate"
]], on=["country", "video_id"])

unique_df["trend_duration_days"] = (unique_df["max_date"] - unique_df["min_date"]).dt.days + 1
unique_df["views_growth"] = (unique_df["views_last"] - unique_df["views_first"]).clip(lower=0)
unique_df["daily_velocity"] = np.where(unique_df["trend_duration_days"] > 1, unique_df["views_growth"] / (unique_df["trend_duration_days"] - 1), 0)

# AFINN sentiment
af = Afinn()
def score_title(title):
    if not isinstance(title, str) or not title.strip():
        return 0.0, "unclassified"
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

unique_df.to_parquet(unique_path, index=False)
print(f"Updated {len(unique_df):,} unique videos to 2026.")
