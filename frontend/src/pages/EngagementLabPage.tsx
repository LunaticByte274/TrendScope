import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  ScatterChart as ScatterIcon, 
  Grid, 
  Sparkles, 
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  ThumbsDown,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Chart } from '../components/Chart';
import { FilterState } from '../types';
import { api } from '../services/api';
import { InfoModal } from '../components/InfoModal';

interface EngagementLabPageProps {
  filters: FilterState;
}

export const EngagementLabPage: React.FC<EngagementLabPageProps> = ({ filters }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [corrType, setCorrType] = useState<'pearson' | 'spearman'>('pearson');
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getEngagement(filters)
      .then(res => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-700/50"></div>
          <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-700/50"></div>
        </div>
      </div>
    );
  }

  const { scatter_sample, correlations, category_engagement } = data;

  // Scatter 1: Log Views vs Log Likes
  const scatterViewsLikes = scatter_sample.map((s: any) => [
    s.views,
    s.likes,
    s.title,
    s.channel_title,
    s.category_name,
    s.like_rate
  ]);

  const scatterOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 },
      formatter: (param: any) => {
        const d = param.data;
        return `<div class="font-bold text-xs max-w-xs mb-1">${d[2]}</div>
          <div class="text-[11px] text-emerald-400 font-semibold">${d[3]} • ${d[4]}</div>
          <div class="mt-2 text-xs text-slate-300">Views: <strong class="font-mono text-white">${Number(d[0]).toLocaleString()}</strong></div>
          <div class="text-xs text-slate-300">Likes: <strong class="font-mono text-cyan-400">${Number(d[1]).toLocaleString()}</strong> (${d[5]}% Like Rate)</div>`;
      }
    },
    grid: { left: '4%', right: '4%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'log',
      name: 'Views (Log)',
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { 
        color: '#94a3b8', 
        fontSize: 10,
        formatter: (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v
      }
    },
    yAxis: {
      type: 'log',
      name: 'Likes (Log)',
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { 
        color: '#94a3b8', 
        fontSize: 10,
        formatter: (v: number) => v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v
      }
    },
    series: [{
      type: 'scatter',
      data: scatterViewsLikes,
      symbolSize: 8,
      itemStyle: {
        color: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1
      }
    }]
  };

  // Correlation Heatmap Data
  const corrMatrix = correlations[corrType] || {};
  const corrMetrics = Object.keys(corrMatrix);
  const heatmapData: Array<[number, number, number]> = [];

  corrMetrics.forEach((m1, i) => {
    corrMetrics.forEach((m2, j) => {
      heatmapData.push([i, j, corrMatrix[m1][m2]]);
    });
  });

  const heatmapOption = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 },
      formatter: (p: any) => {
        const val = p.data[2];
        return `${corrMetrics[p.data[0]]} ↔ ${corrMetrics[p.data[1]]}: <strong>${val}</strong>`;
      }
    },
    grid: { left: '15%', right: '5%', bottom: '20%', top: '5%' },
    xAxis: {
      type: 'category',
      data: corrMetrics,
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 30 },
      splitArea: { show: true, areaStyle: { color: ['transparent', 'rgba(255,255,255,0.01)'] } }
    },
    yAxis: {
      type: 'category',
      data: corrMetrics,
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    visualMap: {
      min: -0.2,
      max: 1.0,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: { color: '#94a3b8', fontSize: 10 },
      inRange: {
        color: ['#1e293b', '#064e3b', '#10b981', '#34d399']
      }
    },
    series: [{
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true,
        color: '#f8fafc',
        fontSize: 10,
        formatter: (p: any) => p.data[2].toFixed(2)
      }
    }]
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <ThumbsUp className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Like Rate Metric</h3>
          </div>
          <div className="text-xl font-bold text-white font-mono mt-1">likes / views</div>
          <p className="text-xs text-slate-400 mt-2">
            Measures positive viewer approval propensity. Guarded against division by zero (0.0 when views = 0).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <MessageSquare className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Comment Rate Metric</h3>
          </div>
          <div className="text-xl font-bold text-white font-mono mt-1">comments / views</div>
          <p className="text-xs text-slate-400 mt-2">
            Measures conversational propensity and community discussion depth.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Engagement Performance Index</h3>
          </div>
          <div className="text-xl font-bold text-white font-mono mt-1">60% Like + 40% Comment</div>
          <p className="text-xs text-slate-400 mt-2">
            Composite percentile rank normalizing engagement across categorical variances.
          </p>
        </div>
      </div>

      {/* Main Charts: Scatter Plot & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ScatterIcon className="w-4 h-4 text-emerald-400" />
                Views vs. Likes Relationship (Log-Log Scale)
              </h3>
              <p className="text-[11px] text-slate-400">Hover over any data point to inspect individual video performance</p>
            </div>
            <button
              onClick={() => setInfoModalOpen(true)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <Chart option={scatterOption} style={{ height: '340px' }} />
        </div>

        {/* Correlation Heatmap */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                Metric Correlation Matrix
              </h3>
              <p className="text-[11px] text-slate-400">Pairwise linear and monotonic relationship coefficients</p>
            </div>
            <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setCorrType('pearson')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  corrType === 'pearson' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pearson
              </button>
              <button
                onClick={() => setCorrType('spearman')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  corrType === 'spearman' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Spearman
              </button>
            </div>
          </div>
          <Chart option={heatmapOption} style={{ height: '340px' }} />
        </div>
      </div>

      {/* Category Engagement Ranking Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-4">Category Engagement Density Rankings</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-right">Videos Analyzed</th>
              <th className="py-3 px-3 text-right">Avg Like Rate</th>
              <th className="py-3 px-3 text-right">Avg Comment Rate</th>
              <th className="py-3 px-3 text-right">Avg Dislike Rate</th>
              <th className="py-3 px-3 text-right">Total Positive Interaction %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {category_engagement.map((cat: any) => (
              <tr key={cat.category_name} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-3 font-semibold text-white">{cat.category_name}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-400">{cat.video_count.toLocaleString()}</td>
                <td className="py-3 px-3 text-right font-mono text-cyan-400 font-bold">{cat.avg_like_pct}%</td>
                <td className="py-3 px-3 text-right font-mono text-purple-400">{cat.avg_comment_pct}%</td>
                <td className="py-3 px-3 text-right font-mono text-red-400">{cat.avg_dislike_pct}%</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">{cat.avg_positive_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Engagement Formulations & Logarithmic Scaling"
        concept="Audience engagement metrics represent fractional participatory friction per viewer exposure."
        calculation="Like Rate = likes / views, Comment Rate = comments / views. Displayed in log-log scale to handle Pareto skew."
        whyItMatters="Comparing raw like counts unfairly favors high-view videos. Rate metrics normalize community affinity."
        interpretation="Categories like Gaming and Comedy typically exhibit 2x to 3x higher comment rates than Music or News."
      />
    </div>
  );
};
