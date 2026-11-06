from afinn import Afinn
import pandas as pd
import re

af = Afinn()
print("AFINN test: 'good'", af.score("good"), "'bad'", af.score("bad"))

# Check a couple of videos from US_sentiment_scores.csv
us_sent = pd.read_csv("/Users/swayampadhi/.gemini/antigravity/scratch/trendscope/BDA PROJECT/outputs/tables/US_sentiment_scores.csv")
us_raw = pd.read_csv("/Users/swayampadhi/.gemini/antigravity/scratch/trendscope/BDA PROJECT/data/USvideos.csv", encoding="utf-8")

# Let's check video_id "-0CMnp02rNY"
sample_vid = "-0CMnp02rNY"
vrows = us_raw[us_raw["video_id"] == sample_vid]
print(f"Title for {sample_vid}: {vrows['title'].iloc[0]}")
print(f"Recorded R score: {us_sent[us_sent['video_id'] == sample_vid]['sentiment_score'].iloc[0]}")
