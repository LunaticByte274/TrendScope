import os
import json
import glob
import chardet
import pandas as pd
import numpy as np

DATA_DIR = "/Users/swayampadhi/.gemini/antigravity/scratch/trendscope/BDA PROJECT/data"
OUTPUTS_DIR = "/Users/swayampadhi/.gemini/antigravity/scratch/trendscope/BDA PROJECT/outputs"

print("=== 1. ANALYZING CATEGORY METADATA JSON FILES ===")
category_files = sorted(glob.glob(os.path.join(DATA_DIR, "*_category_id.json")))
all_categories = {}
country_cat_counts = {}

for f in category_files:
    country_code = os.path.basename(f).split("_")[0]
    with open(f, "r", encoding="utf-8") as jf:
        data = json.load(jf)
        items = data.get("items", [])
        country_cat_counts[country_code] = len(items)
        for item in items:
            cid = int(item["id"])
            title = item["snippet"]["title"]
            if cid not in all_categories:
                all_categories[cid] = set()
            all_categories[cid].add(title)

print(f"Found {len(category_files)} category metadata files.")
for cc, cnt in country_cat_counts.items():
    print(f"  {cc}: {cnt} categories")

print("\nUnified Category ID -> Name Mapping:")
for cid in sorted(all_categories.keys()):
    names = list(all_categories[cid])
    print(f"  ID {cid:2d}: {', '.join(names)}")

print("\n=== 2. ANALYZING ALL 10 CSV DATASETS ===")
csv_files = sorted(glob.glob(os.path.join(DATA_DIR, "*videos.csv")))
audit_summary = []

for f in csv_files:
    fname = os.path.basename(f)
    country_code = fname[:2]
    fsize_mb = os.path.getsize(f) / (1024 * 1024)
    
    # Check encoding
    encoding = "utf-8"
    try:
        with open(f, "r", encoding="utf-8") as tf:
            for _ in range(2000):
                tf.readline()
    except UnicodeDecodeError:
        with open(f, "rb") as raw:
            sample = raw.read(50000)
            res = chardet.detect(sample)
            encoding = res.get("encoding", "latin1")
            
    # Try reading with pandas
    read_enc = "utf-8"
    try:
        df = pd.read_csv(f, encoding="utf-8", on_bad_lines="skip")
    except UnicodeDecodeError:
        read_enc = "latin1"
        df = pd.read_csv(f, encoding="latin1", on_bad_lines="skip")
        
    total_rows = len(df)
    unique_vids = df["video_id"].nunique()
    exact_dups = df.duplicated().sum()
    vid_date_dups = df.duplicated(subset=["video_id", "trending_date"]).sum()
    
    # Missing description
    missing_desc = df["description"].isna().sum()
    
    # Date range
    # trending_date is YY.DD.MM or similar
    # In R script: as.Date(trending_date, format = "%y.%d.%m")
    try:
        parsed_dates = pd.to_datetime(df["trending_date"], format="%y.%d.%m")
        min_date = parsed_dates.min().strftime("%Y-%m-%d")
        max_date = parsed_dates.max().strftime("%Y-%m-%d")
        distinct_days = parsed_dates.nunique()
    except Exception as e:
        min_date = "Error"
        max_date = "Error"
        distinct_days = 0
        
    views_min, views_med, views_mean, views_max = df["views"].min(), df["views"].median(), df["views"].mean(), df["views"].max()
    likes_min, likes_med, likes_mean, likes_max = df["likes"].min(), df["likes"].median(), df["likes"].mean(), df["likes"].max()
    
    audit_summary.append({
        "country": country_code,
        "filename": fname,
        "size_mb": round(fsize_mb, 2),
        "encoding": encoding,
        "read_enc": read_enc,
        "total_rows": total_rows,
        "unique_vids": unique_vids,
        "exact_duplicates": exact_dups,
        "vid_date_duplicates": vid_date_dups,
        "missing_descriptions": missing_desc,
        "min_date": min_date,
        "max_date": max_date,
        "distinct_days": distinct_days,
        "views_med": int(views_med),
        "views_max": int(views_max),
        "likes_med": int(likes_med),
        "likes_max": int(likes_max),
    })

summary_df = pd.DataFrame(audit_summary)
print(summary_df.to_string())

print("\n=== 3. CHECKING US ORIGINAL REPRODUCIBILITY ===")
us_df = pd.read_csv(os.path.join(DATA_DIR, "USvideos.csv"), encoding="utf-8")
print(f"USvideos.csv total records: {len(us_df)}, unique video IDs: {us_df['video_id'].nunique()}")

# Legacy count(title, sort=TRUE)
r_top10 = us_df["title"].value_counts().head(10)
print("\nR-script title counts (top 5):")
print(r_top10.head(5))

# Legacy category popularity
r_cat = us_df.groupby("category_id")["views"].sum().sort_values(ascending=False)
print("\nR-script category total views (top 5):")
for cid, v in r_cat.head(5).items():
    print(f"  Category {cid}: {v:,}")

# Unique video latest snapshot category views
# sort by trending_date, take last
us_df["parsed_date"] = pd.to_datetime(us_df["trending_date"], format="%y.%d.%m")
latest_us = us_df.sort_values("parsed_date").groupby("video_id").last().reset_index()
unique_cat_views = latest_us.groupby("category_id")["views"].sum().sort_values(ascending=False)
print("\nCORRECTED Unique-Video Category Views (top 5):")
for cid, v in unique_cat_views.head(5).items():
    print(f"  Category {cid}: {v:,} (vs legacy {r_cat[cid]:,}, ratio: {r_cat[cid]/v:.2f}x)")

print("\nData auditing complete!")
