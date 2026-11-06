import urllib.request
import zipfile
import io
import pandas as pd
import re

# Let's inspect the distribution of US_sentiment_scores.csv
us_sent = pd.read_csv("/Users/swayampadhi/.gemini/antigravity/scratch/trendscope/BDA PROJECT/outputs/tables/US_sentiment_scores.csv")
print(f"US_sentiment_scores rows: {len(us_sent)}")
print(f"Positive (>0): {(us_sent['sentiment_score'] > 0).sum()}")
print(f"Negative (<0): {(us_sent['sentiment_score'] < 0).sum()}")
print(f"Zero (==0): {(us_sent['sentiment_score'] == 0).sum()}")
print(f"Mean: {us_sent['sentiment_score'].mean():.4f}")
print(f"Median: {us_sent['sentiment_score'].median()}")
print(f"Min: {us_sent['sentiment_score'].min()}, Max: {us_sent['sentiment_score'].max()}")
