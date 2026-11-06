import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  ExternalLink,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { VideoItem, FilterState } from '../types';
import { api } from '../services/api';

interface TrendingExplorerPageProps {
  filters: FilterState;
  onSelectVideo: (video: VideoItem) => void;
}

export const TrendingExplorerPage: React.FC<TrendingExplorerPageProps> = ({
  filters,
  onSelectVideo
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('trend_count');
  const [limit, setLimit] = useState<number>(20);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getTrendingVideos(filters, sortBy, limit, 0)
      .then(res => {
        if (isMounted) {
          setVideos(res.videos);
          setTotalCount(res.total);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters, sortBy, limit]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-400" />
            Trending Video Rankings ({totalCount.toLocaleString()} Total Unique Videos)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by distinct calendar dates on the trending chart with day-over-day tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Limit selector */}
          <div className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-xl border border-slate-800">
            {[10, 20, 50].map((l) => (
              <button
                key={l}
                onClick={() => setLimit(l)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  limit === l
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Top {l}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#090d16] text-slate-200 text-xs font-medium pl-8 pr-7 py-1.5 rounded-xl border border-slate-700/80 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="trend_count">Sort: Trending Days (Longevity)</option>
              <option value="views">Sort: Total Cumulative Views</option>
              <option value="likes">Sort: Total Likes</option>
              <option value="like_rate">Sort: Highest Like Rate (%)</option>
              <option value="comments">Sort: Most Comments</option>
              <option value="positive_rate">Sort: Positive Engagement Rate</option>
              <option value="velocity">Sort: Daily View Velocity</option>
            </select>
            <div className="absolute right-2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>
        </div>
      </div>

      {/* Grid of Video Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-800/40 rounded-2xl border border-slate-700/50"></div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f172a] border border-[#1e293b]">
          <p className="text-slate-400 text-sm">No trending videos match your current filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((vid, idx) => (
            <div
              key={vid.video_id + idx}
              onClick={() => onSelectVideo(vid)}
              className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail & Rank Badge */}
                <div className="relative mb-3 rounded-xl overflow-hidden aspect-video bg-[#090d16]">
                  <img
                    src={vid.thumbnail_link}
                    alt={vid.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60`;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/10">
                    #{idx + 1}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-emerald-500/90 text-black font-bold text-[10px] shadow-md">
                    {vid.trend_count} Days Trending
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-slate-200 text-[10px] font-semibold">
                    {vid.category_name}
                  </div>
                </div>

                {/* Title & Channel */}
                <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
                  {vid.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
                  {vid.channel_title}
                </p>

                {/* Date Span */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{vid.first_date} → {vid.last_date}</span>
                  <span>({vid.trend_duration_days}d span)</span>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Audience Reach</span>
                  <span className="font-bold text-white font-mono">
                    {vid.views >= 1e6 ? `${(vid.views / 1e6).toFixed(1)}M` : vid.views.toLocaleString()}
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">Like Rate</span>
                  <span className="font-bold text-cyan-400 font-mono">{vid.like_rate}%</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Sentiment</span>
                  <span className={`text-[10px] font-bold uppercase ${
                    vid.sentiment_category === 'positive' ? 'text-emerald-400' :
                    vid.sentiment_category === 'negative' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {vid.sentiment_category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

