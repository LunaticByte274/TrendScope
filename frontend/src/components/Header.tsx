import React from 'react';
import { 
  Globe2, 
  Layers, 
  Search, 
  X, 
  Activity, 
  SlidersHorizontal 
} from 'lucide-react';
import { FilterState } from '../types';

interface HeaderProps {
  currentTab: string;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: Array<{ id: number; name: string }>;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  filters,
  setFilters,
  categories,
  setCurrentTab,
  collapsed
}) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    'overview': { title: 'Executive Overview', subtitle: 'Global trending dynamics, audience reach & high-level engagement' },
    'trending': { title: 'Trending Video Explorer', subtitle: 'Longitudinal appearance tracking & video lifecycle dynamics' },
    'categories': { title: 'Category Intelligence', subtitle: 'Category-wise unique reach vs. legacy cumulative view inflation' },
    'engagement': { title: 'Engagement Analytics Lab', subtitle: 'Interaction ratios, distributions & cross-metric correlation matrix' },
    'sentiment': { title: 'Sentiment Intelligence', subtitle: 'AFINN-111 title valence, keyword attribution & multilingual caveats' },
    'countries': { title: 'Global Country Comparison', subtitle: 'Normalized cross-territory metrics across 10 national trending charts' },
    'creators': { title: 'Creator / Channel Analytics', subtitle: 'Channel concentration, viral consistency & category focus' },
    'videos': { title: 'Video Data Explorer', subtitle: 'Server-side paginated repository with full analytical column filtering' },
    'predictive': { title: 'Predictive & Machine Learning Studio', subtitle: 'Supervised trend continuation, K-Means clustering, ARIMA forecasts & NMF topics' }
  };

  const current = titles[currentTab] || { title: 'Analytics', subtitle: 'YouTube Trend Intelligence' };

  const countryList = [
    { code: 'US', name: '🇺🇸 United States' },
    { code: 'GB', name: '🇬🇧 Great Britain' },
    { code: 'IN', name: '🇮🇳 India' },
    { code: 'CA', name: '🇨🇦 Canada' },
    { code: 'DE', name: '🇩🇪 Germany' },
    { code: 'FR', name: '🇫🇷 France' },
    { code: 'JP', name: '🇯🇵 Japan' },
    { code: 'KR', name: '🇰🇷 South Korea' },
    { code: 'MX', name: '🇲🇽 Mexico' },
    { code: 'RU', name: '🇷🇺 Russia' },
    { code: 'ALL', name: '🌐 All Countries' }
  ];

  return (
    <header className={`sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-3.5 transition-all duration-300 ${
      collapsed ? 'ml-20' : 'ml-72'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Titles */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">{current.title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-3 h-3 animate-pulse" />
              Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{current.subtitle}</p>
        </div>

        {/* Right: Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Country Selector */}
          <div className="relative flex items-center">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
            <select
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="bg-[#0f172a] text-slate-200 text-xs font-medium pl-8 pr-7 py-1.5 rounded-lg border border-slate-700/80 focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer hover:border-slate-600"
            >
              {countryList.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Category Filter */}
          <div className="relative flex items-center">
            <Layers className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 pointer-events-none" />
            <select
              value={filters.categoryId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
              className="bg-[#0f172a] text-slate-200 text-xs font-medium pl-8 pr-7 py-1.5 rounded-lg border border-slate-700/80 focus:border-cyan-500 focus:outline-none transition-colors appearance-none cursor-pointer hover:border-slate-600 max-w-[170px]"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search title or channel..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="bg-[#0f172a] text-slate-200 text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-700/80 focus:border-slate-500 focus:outline-none w-36 sm:w-48 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

