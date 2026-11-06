import React from 'react';
import { X, ExternalLink, Calendar, Eye, ThumbsUp, MessageSquare, TrendingUp, Award, BarChart2 } from 'lucide-react';
import { Chart } from './Chart';
import { VideoDetail } from '../types';

interface VideoDetailModalProps {
  detail: VideoDetail | null;
  onClose: () => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ detail, onClose }) => {
  if (!detail) return null;
  const { video, history, category_benchmarks } = detail;

  // Chart configuration for daily snapshot history
  const dates = history.map(h => h.trending_date);
  const viewsSeries = history.map(h => h.views);
  const likesSeries = history.map(h => h.likes);

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 },
      formatter: (params: any) => {
        let res = `<div class="font-bold text-xs mb-1">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          res += `<div class="flex items-center justify-between gap-4 text-xs">
            <span style="color:${p.color}">● ${p.seriesName}</span>
            <span class="font-mono font-bold">${Number(p.value).toLocaleString()}</span>
          </div>`;
        });
        return res;
      }
    },
    legend: {
      data: ['Views', 'Likes'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 30 }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Views',
        nameTextStyle: { color: '#10b981', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { 
          color: '#94a3b8', 
          fontSize: 10,
          formatter: (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v
        }
      },
      {
        type: 'value',
        name: 'Likes',
        nameTextStyle: { color: '#06b6d4', fontSize: 10 },
        splitLine: { show: false },
        axisLabel: { 
          color: '#94a3b8', 
          fontSize: 10,
          formatter: (v: number) => v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v
        }
      }
    ],
    series: [
      {
        name: 'Views',
        type: 'line',
        data: viewsSeries,
        smooth: true,
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }
            ]
          }
        }
      },
      {
        name: 'Likes',
        type: 'line',
        yAxisIndex: 1,
        data: likesSeries,
        smooth: true,
        itemStyle: { color: '#06b6d4' }
      }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <img 
              src={video.thumbnail_link} 
              alt={video.title}
              onError={(e) => {
                // Fallback image placeholder
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60`;
              }}
              className="w-28 h-20 object-cover rounded-xl border border-slate-700 shadow-md flex-shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {video.category_name}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {video.country} Chart
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  ID: <span className="font-mono text-slate-300">{video.video_id}</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-2">{video.title}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">{video.channel_title}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {video.first_date} → {video.last_date} ({video.trend_count} days)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`https://www.youtube.com/watch?v=${video.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/15 border border-red-500/30 text-red-400 hover:bg-red-600/25 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Watch</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Final Recorded Views</span>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-base font-bold text-white">{video.views.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Total Likes & Rate</span>
              <div className="flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-cyan-400" />
                <span className="text-base font-bold text-white">{video.likes.toLocaleString()}</span>
                <span className="text-[11px] font-mono text-cyan-400">({video.like_rate}%)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Comments Recorded</span>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="text-base font-bold text-white">{video.comment_count.toLocaleString()}</span>
                <span className="text-[11px] font-mono text-purple-400">({video.comment_rate}%)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">AFINN Title Sentiment</span>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-base font-bold text-white">
                  {video.afinn_score !== 0 ? (video.afinn_score > 0 ? `+${video.afinn_score}` : video.afinn_score) : '0'}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">({video.sentiment_category})</span>
              </div>
            </div>
          </div>

          {/* Longitudinal Trajectory Chart */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Day-over-Day Trajectory ({history.length} Daily Snapshots)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Growth: <strong className="text-emerald-400 font-mono">+{((video.views_growth || 0)).toLocaleString()} views</strong>
              </span>
            </div>
            {history.length > 1 ? (
              <Chart option={chartOption} style={{ height: '240px' }} />
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500">
                Single snapshot record on {video.first_date}. No longitudinal time-series available.
              </div>
            )}
          </div>

          {/* Benchmarking Comparison against Category */}
          <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Benchmark vs. {video.category_name} Category Average
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0f172a] border border-slate-800/80">
                <span className="text-slate-400 block mb-1 text-[11px]">Views vs. Category Median</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-white">{video.views.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400">
                    Cat: <strong className="font-mono text-slate-300">{category_benchmarks.cat_median_views.toLocaleString()}</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (video.views / Math.max(category_benchmarks.cat_median_views, 1)) * 50)}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0f172a] border border-slate-800/80">
                <span className="text-slate-400 block mb-1 text-[11px]">Like Rate vs. Cat Average</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-cyan-400 font-mono">{video.like_rate}%</span>
                  <span className="text-[11px] text-slate-400">
                    Cat Avg: <strong className="font-mono text-slate-300">{category_benchmarks.cat_avg_like_rate}%</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (video.like_rate / Math.max(category_benchmarks.cat_avg_like_rate, 0.01)) * 50)}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0f172a] border border-slate-800/80">
                <span className="text-slate-400 block mb-1 text-[11px]">Longevity vs. Cat Average</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-purple-400 font-mono">{video.trend_count} Days</span>
                  <span className="text-[11px] text-slate-400">
                    Cat Avg: <strong className="font-mono text-slate-300">{category_benchmarks.cat_avg_trend_days} Days</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-purple-400 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (video.trend_count / Math.max(category_benchmarks.cat_avg_trend_days, 1)) * 50)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

