import { FilterState, OverviewData, VideoDetail, CategoryItem, MLContinuationBenchmark, ClusteringData, ForecastData, AnomalyItem, TopicItem, TisRankedVideo, CountryOverview, CreatorItem } from '../types';

const API_BASE = '/api';

export const api = {
  async getMetadata() {
    const res = await fetch(`${API_BASE}/metadata`);
    if (!res.ok) throw new Error('Failed to load metadata');
    return res.json();
  },

  async getOverview(filters: FilterState): Promise<OverviewData> {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.categoryId) params.append('category_id', String(filters.categoryId));
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/overview?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load overview data');
    return res.json();
  },

  async getTrendingVideos(filters: FilterState, sortBy = 'trend_count', limit = 20, offset = 0) {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.categoryId) params.append('category_id', String(filters.categoryId));
    if (filters.search) params.append('search', filters.search);
    params.append('sort_by', sortBy);
    params.append('limit', String(limit));
    params.append('offset', String(offset));

    const res = await fetch(`${API_BASE}/trends?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load trending videos');
    return res.json();
  },

  async getVideoDetail(videoId: string, country = 'US'): Promise<VideoDetail> {
    const res = await fetch(`${API_BASE}/trends/${encodeURIComponent(videoId)}?country=${country}`);
    if (!res.ok) throw new Error('Failed to load video detail');
    return res.json();
  },

  async getCategories(filters: FilterState): Promise<{ categories: CategoryItem[] }> {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);

    const res = await fetch(`${API_BASE}/categories?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  async getEngagement(filters: FilterState) {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.categoryId) params.append('category_id', String(filters.categoryId));

    const res = await fetch(`${API_BASE}/engagement?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load engagement data');
    return res.json();
  },

  async getSentiment(filters: FilterState) {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.categoryId) params.append('category_id', String(filters.categoryId));

    const res = await fetch(`${API_BASE}/sentiment?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load sentiment data');
    return res.json();
  },

  async getCountries(): Promise<{ countries: CountryOverview[] }> {
    const res = await fetch(`${API_BASE}/countries`);
    if (!res.ok) throw new Error('Failed to load country data');
    return res.json();
  },

  async compareCountries(codes: string[]) {
    const res = await fetch(`${API_BASE}/countries/compare?codes=${codes.join(',')}`);
    if (!res.ok) throw new Error('Failed to compare countries');
    return res.json();
  },

  async getCreators(filters: FilterState, limit = 25): Promise<{ creators: CreatorItem[] }> {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.categoryId) params.append('category_id', String(filters.categoryId));
    params.append('limit', String(limit));

    const res = await fetch(`${API_BASE}/creators?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load creators');
    return res.json();
  },

  async getVideosTable(filters: FilterState, page = 1, pageSize = 20, sortBy = 'views', sortDir = 'desc') {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.categoryId) params.append('category_id', String(filters.categoryId));
    if (filters.search) params.append('search', filters.search);
    params.append('page', String(page));
    params.append('page_size', String(pageSize));
    params.append('sort_by', sortBy);
    params.append('sort_dir', sortDir);

    const res = await fetch(`${API_BASE}/videos?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load video table');
    return res.json();
  },

  async getTrendPrediction(country = 'US'): Promise<MLContinuationBenchmark> {
    const res = await fetch(`${API_BASE}/models/trend-prediction?country=${country}`);
    if (!res.ok) throw new Error('Failed to load trend prediction benchmark');
    return res.json();
  },

  async predictContinuation(params: {
    views: number;
    likes: number;
    dislikes: number;
    comment_count: number;
    category_id: number;
    prior_trend_count: number;
    hours_since_publish: number;
  }) {
    const res = await fetch(`${API_BASE}/models/predict-continuation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Prediction calculation failed');
    return res.json();
  },

  async getClustering(country = 'US'): Promise<ClusteringData> {
    const res = await fetch(`${API_BASE}/models/clustering?country=${country}`);
    if (!res.ok) throw new Error('Failed to load clustering data');
    return res.json();
  },

  async getForecast(country = 'US', categoryId = 10, horizon = 30): Promise<ForecastData> {
    const res = await fetch(`${API_BASE}/models/forecast?country=${country}&category_id=${categoryId}&horizon=${horizon}`);
    if (!res.ok) throw new Error('Failed to load forecast data');
    return res.json();
  },

  async getAnomalies(country = 'US'): Promise<{ anomalies: AnomalyItem[] }> {
    const res = await fetch(`${API_BASE}/models/anomalies?country=${country}`);
    if (!res.ok) throw new Error('Failed to load anomalies');
    return res.json();
  },

  async getTopics(country = 'US'): Promise<{ topics: TopicItem[] }> {
    const res = await fetch(`${API_BASE}/models/topics?country=${country}`);
    if (!res.ok) throw new Error('Failed to load topics');
    return res.json();
  },

  async simulateTis(country: string, weights: { views: number; engagement: number; frequency: number; velocity: number }, limit = 20): Promise<{ ranked_videos: TisRankedVideo[] }> {
    const res = await fetch(`${API_BASE}/models/simulate-tis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country,
        weight_views: weights.views,
        weight_engagement: weights.engagement,
        weight_frequency: weights.frequency,
        weight_velocity: weights.velocity,
        limit
      })
    });
    if (!res.ok) throw new Error('Failed to simulate TIS score');
    return res.json();
  },

  async getDataQuality() {
    const res = await fetch(`${API_BASE}/data-quality`);
    if (!res.ok) throw new Error('Failed to load data quality');
    return res.json();
  }
};

