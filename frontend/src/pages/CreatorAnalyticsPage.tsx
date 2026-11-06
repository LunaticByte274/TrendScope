import React, { useState, useEffect } from 'react';
import { 
  Tv2, 
  Award, 
  Search, 
  Eye, 
  ThumbsUp, 
  Layers, 
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Chart } from '../components/Chart';
import { CreatorItem, FilterState } from '../types';
import { api } from '../services/api';

interface CreatorAnalyticsPageProps {
  filters: FilterState;
}

export const CreatorAnalyticsPage: React.FC<CreatorAnalyticsPageProps> = ({ filters }) => {
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getCreators(filters, 50)
      .then(res => {
        if (isMounted) {
          setCreators(res.creators);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters]);

  const filteredCreators = creators.filter(c => 
    c.channel_title.toLowerCase().includes(search.toLowerCase()) ||
    c.primary_category.toLowerCase().includes(search.toLowerCase())
  );

  // Bubble chart: Unique Video Volume (X) vs Average Views (Y) vs Total Views (Size)
  const bubbleData = creators.slice(0, 30).map(c => [
    c.unique_video_count,
    c.avg_views,
    c.total_views,
    c.channel_title,
    c.primary_category
  ]);

  const bubbleOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 },
      formatter: (p: any) => {
        const d = p.data;
        return `<div class="font-bold text-xs mb-1">${d[3]}</div>
          <div class="text-[10px] text-emerald-400 font-semibold mb-1">${d[4]}</div>
          <div class="text-xs text-slate-300">Trending Videos: <strong>${d[0]}</strong></div>
          <div class="text-xs text-slate-300">Avg Views/Video: <strong>${(d[1] / 1e6).toFixed(2)}M</strong></div>
          <div class="text-xs text-slate-300">Total Views: <strong>${(d[2] / 1e9).toFixed(2)}B</strong></div>`;
      }
    },
    grid: { left: '4%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      name: 'Unique Videos on Trending Chart',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'Average Views per Video',
      nameTextStyle: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { 
        color: '#94a3b8', 
        fontSize: 10,
        formatter: (v: number) => `${(v/1e6).toFixed(1)}M`
      }
    },
    series: [{
      type: 'scatter',
      data: bubbleData,
      symbolSize: (data: any) => {
        const views = data[2];
        return Math.max(12, Math.min(50, Math.sqrt(views / 1e6) * 1.5));
      },
      itemStyle: {
        color: 'rgba(16, 185, 129, 0.65)',
        borderColor: '#10b981',
        borderWidth: 1.5
      }
    }]
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search & Overview Bar */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Tv2 className="w-5 h-5 text-emerald-400" />
            Creator & Channel Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify the most prolific channels, viral hitmakers, and content focus areas
          </p>
        </div>

        <div className="relative flex items-center w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search channel or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#090d16] text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bubble Chart: Prolific Volume vs Viral Reach */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Channel Volume vs. Viral Reach Matrix
          </h3>
          <p className="text-[11px] text-slate-400">
            Bubble size corresponds to cumulative views. Hover over any bubble to inspect channel statistics.
          </p>
        </div>
        <Chart option={bubbleOption} style={{ height: '360px' }} />
      </div>

      {/* Creator Leaderboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCreators.slice(0, 18).map((c, idx) => (
          <div key={c.channel_title} className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                  #{idx + 1}
                </span>
                <h4 className="text-sm font-bold text-white truncate">{c.channel_title}</h4>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                {c.primary_category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Trending Videos</span>
                <span className="font-bold text-white font-mono text-sm">{c.unique_video_count}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Total View Reach</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {(c.total_views / 1e6).toFixed(1)}M
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Avg Views / Video</span>
                <span className="font-bold text-cyan-400 font-mono text-xs">
                  {c.avg_views >= 1e6 ? `${(c.avg_views / 1e6).toFixed(1)}M` : c.avg_views.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Avg Like Rate</span>
                <span className="font-bold text-purple-400 font-mono text-xs">{c.avg_like_pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

