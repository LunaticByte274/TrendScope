import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  BarChart3, 
  PieChart, 
  Scale, 
  ArrowRight, 
  CheckSquare, 
  Square,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Chart } from '../components/Chart';
import { CategoryItem, FilterState } from '../types';
import { api } from '../services/api';
import { InfoModal } from '../components/InfoModal';

interface CategoryIntelligencePageProps {
  filters: FilterState;
}

export const CategoryIntelligencePage: React.FC<CategoryIntelligencePageProps> = ({ filters }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([10, 24]); // Default: Music & Entertainment
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getCategories(filters)
      .then(res => {
        if (isMounted) {
          setCategories(res.categories);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filters]);

  const toggleCategorySelect = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Horizontal bar chart of Unique Views
  const sortedByViews = [...categories].sort((a, b) => a.unique_views - b.unique_views);
  const barNames = sortedByViews.map(c => c.category_name);
  const barUniqueViews = sortedByViews.map(c => c.unique_views);

  const horizontalBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 },
      formatter: (params: any) => {
        const val = Number(params[0].value);
        return `<div class="font-bold text-xs">${params[0].axisValue}</div>
          <div class="text-xs text-emerald-400 mt-1">Unique Reach: <strong>${(val / 1e9).toFixed(2)} Billion Views</strong></div>`;
      }
    },
    grid: { left: '3%', right: '5%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { 
        color: '#94a3b8', 
        fontSize: 10,
        formatter: (v: number) => `${(v/1e9).toFixed(1)}B`
      }
    },
    yAxis: {
      type: 'category',
      data: barNames,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#f8fafc', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: barUniqueViews,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#047857' },
            { offset: 1, color: '#10b981' }
          ]
        },
        borderRadius: [0, 6, 6, 0]
      }
    }]
  };

  // Treemap of Unique Views
  const treemapData = categories.map(c => ({
    name: c.category_name,
    value: c.unique_views,
    videoCount: c.unique_video_count
  }));

  const treemapOption = {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: (info: any) => {
        const v = info.value;
        const count = info.data.videoCount;
        return `<div class="font-bold text-xs mb-1">${info.name}</div>
          <div class="text-xs text-slate-300">Unique Views: <strong class="text-emerald-400">${(v / 1e9).toFixed(2)}B</strong></div>
          <div class="text-xs text-slate-300">Videos: <strong class="text-white">${count.toLocaleString()}</strong></div>`;
      }
    },
    series: [{
      type: 'treemap',
      data: treemapData,
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: '{b}\n{c}',
        fontSize: 11,
        color: '#f8fafc'
      },
      itemStyle: {
        borderColor: '#0f172a',
        borderWidth: 2,
        gapWidth: 2
      },
      levels: [{
        color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#6366f1', '#14b8a6']
      }]
    }]
  };

  // Selected Categories Comparison
  const selectedCategories = categories.filter(c => selectedIds.includes(c.category_id));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Explaining the Critical Analytical Correction */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Critical Analytical Correction: Resolving View Count Inflation</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              The original R baseline summed cumulative daily view counts, repeatedly counting videos on every day they trended. 
              TrendScope establishes <strong>Reconciled Unique Views</strong> (using each video's latest observation date snapshot).
            </p>
          </div>
        </div>
        <button
          onClick={() => setInfoModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Read Mathematical Proof</span>
        </button>
      </div>

      {/* Main Charts: Horizontal Bar & Treemap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Reconciled Category Popularity Ranking
            </h3>
            <p className="text-[11px] text-slate-400">Total estimated unique views per category (terminal snapshots)</p>
          </div>
          <Chart option={horizontalBarOption} style={{ height: '340px' }} />
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Category Audience Share Treemap
            </h3>
            <p className="text-[11px] text-slate-400">Proportional volume of unique viewership across categories</p>
          </div>
          <Chart option={treemapOption} style={{ height: '340px' }} />
        </div>
      </div>

      {/* Category Multi-Selection & Comparison Studio */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Interactive Category Comparison Studio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select 2 or more categories below to compare reach, engagement rates, and inflation factors side by side
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Selected: <strong className="text-emerald-400 font-bold">{selectedIds.length} Categories</strong>
          </div>
        </div>

        {/* Category Selector Pills */}
        <div className="flex flex-wrap gap-2 py-4">
          {categories.map(c => {
            const isSelected = selectedIds.includes(c.category_id);
            return (
              <button
                key={c.category_id}
                onClick={() => toggleCategorySelect(c.category_id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-[#090d16] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                <span>{c.category_name}</span>
              </button>
            );
          })}
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {selectedCategories.map(c => (
            <div key={c.category_id} className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{c.category_name}</h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  ID: {c.category_id}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Unique Videos:</span>
                  <span className="font-bold text-white font-mono">{c.unique_video_count.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Reconciled Views:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {(c.unique_views / 1e6).toFixed(1)}M
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Legacy Snapshot Sum:</span>
                  <span className="font-bold text-slate-400 font-mono">
                    {(c.legacy_views / 1e6).toFixed(1)}M ({c.inflation_ratio}x)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Average Like Rate:</span>
                  <span className="font-bold text-cyan-400 font-mono">{c.avg_like_rate}%</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Average Longevity:</span>
                  <span className="font-bold text-purple-400 font-mono">{c.avg_trend_days} Days</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Average AFINN Score:</span>
                  <span className="font-bold text-amber-400 font-mono">{c.avg_afinn > 0 ? `+${c.avg_afinn}` : c.avg_afinn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Category Table */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-4">Complete Category Summary Matrix</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-right">Unique Videos</th>
              <th className="py-3 px-3 text-right">Reconciled Unique Views</th>
              <th className="py-3 px-3 text-right">Legacy Daily Sum</th>
              <th className="py-3 px-3 text-right">Inflation</th>
              <th className="py-3 px-3 text-right">Avg Like %</th>
              <th className="py-3 px-3 text-right">Avg Longevity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {categories.map(c => (
              <tr key={c.category_id} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-3 font-semibold text-white">{c.category_name}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-300">{c.unique_video_count.toLocaleString()}</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">{(c.unique_views / 1e6).toFixed(1)}M</td>
                <td className="py-3 px-3 text-right font-mono text-slate-400">{(c.legacy_views / 1e6).toFixed(1)}M</td>
                <td className="py-3 px-3 text-right font-mono text-amber-400">{c.inflation_ratio}x</td>
                <td className="py-3 px-3 text-right font-mono text-cyan-400">{c.avg_like_rate}%</td>
                <td className="py-3 px-3 text-right font-mono text-purple-400">{c.avg_trend_days} d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Modal on Inflation Correction */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Category View Count Reconciled Formulation"
        concept="The difference between cumulative snapshot observations and actual unique audience exposure."
        calculation="Unique Views = SUM(views_last per unique video_id) vs Legacy = SUM(views across every daily crawl snapshot row)"
        whyItMatters="In the original R code, summing daily snapshot views repeatedly counted the cumulative views of videos that trended for multiple days. For categories like Music with long trending lifecycles, this inflated the recorded audience by over 800%."
        interpretation="Reconciled Unique Views accurately represents terminal video performance, while Legacy Snapshot Sum is preserved for historical baseline reproduction."
      />
    </div>
  );
};

