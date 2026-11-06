# ============================
# YouTube Trending Video Analysis (Local) - Flat CSV Version
# ============================

# --- 1. Load Libraries ---
library(dplyr)       # for data wrangling
library(readr)       # for CSV read/write
library(lubridate)   # for date handling
library(tidytext)    # for tokenizing words
library(textdata)    # for sentiment lexicons
library(ggplot2)     # for plotting

# --- 2. Set Paths ---
data_path <- "data/"
output_fig_path <- "outputs/figures/"
output_table_path <- "outputs/tables/"

# --- 3. Load Dataset ---
us_videos <- read_csv(file.path(data_path, "USvideos.csv"), show_col_types = FALSE)

# --- 4. Basic Data Cleaning ---
# Convert trending_date to proper Date format
us_videos <- us_videos %>%
  mutate(trending_date = as.Date(trending_date, format = "%y.%d.%m"),
         category_id = as.factor(category_id))  # Keep category_id as factor

# --- 5. Trend Detection: Top 10 Trending Videos ---
trend_summary <- us_videos %>%
  count(title, sort = TRUE) %>%
  slice_head(n = 10)

# Save trend summary
write_csv(trend_summary, file.path(output_table_path, "US_trending_videos.csv"))

# --- 6. Category-wise Popularity ---
cat_popularity <- us_videos %>%
  group_by(category_id) %>%
  summarise(total_views = sum(views, na.rm = TRUE)) %>%
  arrange(desc(total_views))

# Save category popularity
write_csv(cat_popularity, file.path(output_table_path, "US_category_popularity.csv"))

# Plot category popularity
ggplot(cat_popularity, aes(x = reorder(category_id, total_views), y = total_views)) +
  geom_col(fill = "steelblue") +
  coord_flip() +
  labs(title = "Category-wise Popularity (US)", x = "Category ID", y = "Total Views") +
  theme_minimal()

ggsave(file.path(output_fig_path, "US_category_popularity.png"))

# --- 7. Sentiment Analysis on Titles (Demo) ---
# Since actual comments are not present, we use video titles for sentiment demo

# Tokenize words in titles
us_words <- us_videos %>%
  unnest_tokens(word, title)

# Load AFINN sentiment lexicon
afinn <- get_sentiments("afinn")

# Calculate sentiment score per video
sentiment_scores <- us_words %>%
  inner_join(afinn, by = "word") %>%
  group_by(video_id) %>%
  summarise(sentiment_score = mean(value, na.rm = TRUE))

# Save sentiment scores
write_csv(sentiment_scores, file.path(output_table_path, "US_sentiment_scores.csv"))

# --- END ---
cat("✅ Analysis complete! Results saved in outputs/ folder.\n")
