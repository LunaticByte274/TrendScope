import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VideoDetailModal } from './components/VideoDetailModal';
import { OverviewPage } from './pages/OverviewPage';
import { TrendingExplorerPage } from './pages/TrendingExplorerPage';
import { CategoryIntelligencePage } from './pages/CategoryIntelligencePage';
import { EngagementLabPage } from './pages/EngagementLabPage';
import { SentimentIntelligencePage } from './pages/SentimentIntelligencePage';
import { CountryComparisonPage } from './pages/CountryComparisonPage';
import { CreatorAnalyticsPage } from './pages/CreatorAnalyticsPage';
import { VideoTablePage } from './pages/VideoTablePage';
import { PredictiveStudioPage } from './pages/PredictiveStudioPage';
import { FilterState, OverviewData, VideoDetail, VideoItem } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [filters, setFilters] = useState<FilterState>({
    country: 'US',
    categoryId: undefined,
    startDate: undefined,
    endDate: undefined,
    search: undefined
  });

  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState<boolean>(true);
  const [selectedVideoDetail, setSelectedVideoDetail] = useState<VideoDetail | null>(null);

  // Load global metadata (categories, countries) on mount
  useEffect(() => {
    api.getMetadata()
      .then(meta => {
        setCategories(meta.categories);
      })
      .catch(console.error);
  }, []);

  // Load overview data when filters change
  useEffect(() => {
    let isMounted = true;
    setOverviewLoading(true);
    api.getOverview(filters)
      .then(data => {
        if (isMounted) {
          setOverviewData(data);
          setOverviewLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setOverviewLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters]);

  const handleSelectVideo = (video: VideoItem) => {
    api.getVideoDetail(video.video_id, video.country || filters.country || 'US')
      .then(setSelectedVideoDetail)
      .catch(err => {
        console.error(err);
        // Fallback minimal structure
        setSelectedVideoDetail({
          video,
          history: [],
          category_benchmarks: {
            cat_avg_views: video.views,
            cat_median_views: video.views,
            cat_avg_like_rate: video.like_rate,
            cat_avg_comment_rate: video.comment_rate,
            cat_avg_trend_days: video.trend_count
          }
        });
      });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f8fafc] flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-72'
      }`}>
        {/* Global Header */}
        <Header
          currentTab={currentTab}
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          setCurrentTab={setCurrentTab}
          collapsed={sidebarCollapsed}
        />

        {/* Page Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewPage
              data={overviewData}
              loading={overviewLoading}
              filters={filters}
              onSelectVideo={handleSelectVideo}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'trending' && (
            <TrendingExplorerPage
              filters={filters}
              onSelectVideo={handleSelectVideo}
            />
          )}

          {currentTab === 'categories' && (
            <CategoryIntelligencePage
              filters={filters}
            />
          )}

          {currentTab === 'engagement' && (
            <EngagementLabPage
              filters={filters}
            />
          )}

          {currentTab === 'sentiment' && (
            <SentimentIntelligencePage
              filters={filters}
            />
          )}

          {currentTab === 'countries' && (
            <CountryComparisonPage />
          )}

          {currentTab === 'creators' && (
            <CreatorAnalyticsPage
              filters={filters}
            />
          )}

          {currentTab === 'videos' && (
            <VideoTablePage
              filters={filters}
              onSelectVideo={handleSelectVideo}
            />
          )}

          {currentTab === 'predictive' && (
            <PredictiveStudioPage
              filters={filters}
            />
          )}
        </main>
      </div>

      {/* Video Detail Modal */}
      <VideoDetailModal
        detail={selectedVideoDetail}
        onClose={() => setSelectedVideoDetail(null)}
      />
    </div>
  );
};

export default App;

