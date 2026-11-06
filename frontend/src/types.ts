export interface FilterState {
  country: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface KpiSummary {
  total_records: number;
  unique_videos: number;
  total_countries: number;
  total_categories: number;
  avg_views: number;
  median_views: number;
  total_unique_views: number;
  total_legacy_views: number;
  avg_like_rate: number;
  avg_comment_rate: number;
  top_category: string;
  date_coverage: string;
}

export interface VideoItem {
  video_id: string;
  country: string;
  title: string;
  channel_title: string;
  category_id: number;
  category_name: string;
  views: number;
  likes: number;
  dislikes: number;
  comment_count: number;
  trend_count: number;
  trend_duration_days: number;
  views_growth?: number;
  daily_velocity?: number;
  first_date: string;
  last_date: string;
  like_rate: number;
  comment_rate: number;
  positive_rate: number;
  afinn_score: number;
  sentiment_category: string;
  thumbnail_link: string;
}

export interface VideoDetail {
  video: VideoItem;
  history: Array<{
    trending_date: string;
    views: number;
    likes: number;
    dislikes: number;
    comment_count: number;
    like_rate: number;
    comment_rate: number;
  }>;
  category_benchmarks: {
    cat_avg_views: number;
    cat_median_views: number;
    cat_avg_like_rate: number;
    cat_avg_comment_rate: number;
    cat_avg_trend_days: number;
  };
}

export interface CategoryItem {
  category_id: number;
  category_name: string;
  unique_video_count: number;
  unique_views: number;
  legacy_views: number;
  inflation_ratio: number;
  avg_views: number;
  median_views: number;
  avg_likes: number;
  avg_like_rate: number;
  avg_comment_rate: number;
  avg_positive_rate: number;
  avg_afinn: number;
  avg_trend_days: number;
}

export interface CountryOverview {
  country: string;
  country_name: string;
  snapshot_count: number;
  unique_videos: number;
  avg_views: number;
  median_views: number;
  avg_like_pct: number;
  avg_comment_pct: number;
  avg_pos_pct: number;
  distinct_days: number;
  min_date: string;
  max_date: string;
}

export interface CreatorItem {
  channel_title: string;
  unique_video_count: number;
  total_views: number;
  avg_views: number;
  median_views: number;
  avg_like_pct: number;
  avg_trend_days: number;
  primary_category: string;
}

export interface OverviewData {
  kpis: KpiSummary;
  daily_activity: Array<{ dt: string; snapshot_count: number; unique_videos: number; avg_views: number }>;
  top_trending_videos: VideoItem[];
  category_popularity: CategoryItem[];
  views_distribution: Array<{ bin: string; count: number }>;
  engagement_distribution: Array<{ bin: string; count: number }>;
  sentiment_summary: Record<string, number>;
  country_comparison_quick: Array<{ country: string; unique_videos: number; median_views: number; avg_like_pct: number; avg_trend_days: number }>;
  insights: Array<{ type: string; title: string; description: string }>;
}

export interface MLContinuationBenchmark {
  logistic_regression: { accuracy: number; precision: number; recall: number; f1_score: number; roc_auc: number; confusion_matrix: number[][]; roc_curve: Array<{ fpr: number; tpr: number }>; pr_curve: Array<{ precision: number; recall: number }> };
  random_forest: { accuracy: number; precision: number; recall: number; f1_score: number; roc_auc: number; confusion_matrix: number[][]; roc_curve: Array<{ fpr: number; tpr: number }>; pr_curve: Array<{ precision: number; recall: number }> };
  gradient_boosting: { accuracy: number; precision: number; recall: number; f1_score: number; roc_auc: number; confusion_matrix: number[][]; roc_curve: Array<{ fpr: number; tpr: number }>; pr_curve: Array<{ precision: number; recall: number }> };
  feature_importance: Array<{ feature: string; importance: number }>;
  train_samples: number;
  test_samples: number;
  split_date: string;
}

export interface ClusterProfile {
  cluster_id: number;
  name: string;
  color: string;
  description: string;
  video_count: number;
  median_views: number;
  avg_like_rate: number;
  avg_comment_rate: number;
  avg_duration: number;
  top_categories: Record<string, number>;
}

export interface ClusteringData {
  elbow_curve: Array<{ k: number; inertia: number }>;
  variance_explained: number[];
  profiles: ClusterProfile[];
  scatter_points: Array<{ video_id: string; title: string; channel_title: string; category_name: string; views: number; cluster: number; pca_x: number; pca_y: number }>;
}

export interface ForecastData {
  category_id: number;
  metrics: { mae: number; rmse: number; smape_pct: number };
  historical: Array<{ date: string; value: number }>;
  forecast: Array<{ date: string; forecast: number; lower_bound: number; upper_bound: number }>;
}

export interface AnomalyItem {
  video_id: string;
  title: string;
  channel_title: string;
  category_name: string;
  views: number;
  likes: number;
  dislikes: number;
  comment_count: number;
  like_rate: number;
  dislike_rate: number;
  anomaly_score: number;
  detection_reason: string;
  thumbnail_link: string;
}

export interface TopicItem {
  topic_id: number;
  label: string;
  keywords: string[];
  sample_titles: string[];
}

export interface TisRankedVideo {
  video_id: string;
  country: string;
  title: string;
  channel_title: string;
  category_name: string;
  views: number;
  likes: number;
  comment_count: number;
  trend_count: number;
  daily_velocity: number;
  positive_rate: number;
  p_views: number;
  p_eng: number;
  p_freq: number;
  p_vel: number;
  tis_score: number;
  thumbnail_link: string;
}

