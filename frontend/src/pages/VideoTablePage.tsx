import React, { useState, useEffect } from 'react';
import { 
  Table2, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  ExternalLink,
  Eye,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { FilterState, VideoItem } from '../types';
import { api } from '../services/api';

interface VideoTablePageProps {
  filters: FilterState;
  onSelectVideo: (video: VideoItem) => void;
}

export const VideoTablePage: React.FC<VideoTablePageProps> = ({
  filters,
  onSelectVideo
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [sortBy, setSortBy] = useState<string>('views');
  const [sortDir, setSortDir] = useState<string>('desc');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getVideosTable(filters, page, pageSize, sortBy, sortDir)
      .then(res => {
        if (isMounted) {
          setVideos(res.videos);
          setTotalRecords(res.total_records);
          setTotalPages(res.total_pages);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters, page, pageSize, sortBy, sortDir]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  };

  const downloadCsv = () => {
    const url = `/api/export/csv?country=${filters.country || 'US'}&limit=1000`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Table Control Bar */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Table2 className="w-5 h-5 text-emerald-400" />
            Video Repository ({totalRecords.toLocaleString()} Total Records)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Server-side filtered and paginated corpus with instant column sorting
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-500/30 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Database Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#090d16]/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Video Info</th>
                <th className="py-3 px-4">Category</th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('views')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Views</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('likes')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Likes</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('like_rate')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Like %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('trend_count')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Trending Days</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-slate-800/20"></td>
                  </tr>
                ))
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No records found matching current query.
                  </td>
                </tr>
              ) : (
                videos.map(v => (
                  <tr 
                    key={v.video_id + v.country} 
                    onClick={() => onSelectVideo(v)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.thumbnail_link}
                          alt={v.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60`;
                          }}
                          className="w-14 h-9 object-cover rounded-lg border border-slate-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {v.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {v.channel_title}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium whitespace-nowrap">
                        {v.category_name}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                      {v.views >= 1e6 ? `${(v.views / 1e6).toFixed(1)}M` : v.views.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-cyan-400 whitespace-nowrap">
                      {v.likes.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold whitespace-nowrap">
                      {v.like_rate}%
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-purple-400 whitespace-nowrap">
                      {v.trend_count} Days
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        v.sentiment_category === 'positive' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        v.sentiment_category === 'negative' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {v.sentiment_category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#090d16]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing Page <strong className="text-white font-mono">{page}</strong> of <strong className="text-white font-mono">{totalPages}</strong> ({totalRecords.toLocaleString()} Total Videos)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

