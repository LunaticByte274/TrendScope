import React from 'react';
import { 
  FileText, 
  Video, 
  Globe2, 
  Layers, 
  Eye, 
  HeartHandshake, 
  Flame, 
  TrendingUp, 
  Award, 
  BarChart3, 
  PieChart, 
  Smile, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Chart } from '../components/Chart';
import { OverviewData, FilterState, VideoItem } from '../types';
import { KpiCard } from '../components/KpiCard';

interface OverviewPageProps {
  data: OverviewData | null;
  loading: boolean;
  filters: FilterState;
  onSelectVideo: (video: VideoItem) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  data,
  loading,
  filters,
  onSelectVideo,
  onNavigateTab
}) => {
  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-2xl border border-slate-700/50"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-700/50"></div>
          <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-700/50"></div>
        </div>
      </div>
    );
  }

  const { kpis, daily_activity, top_trending_videos, category_popularity, views_distribution, sentiment_summary, insights, country_comparison_quick } = data;

  // Chart 1: Daily Trending Volume Time Series
  const dailyDates = daily_activity.map(d => d.dt);
  const dailyCounts = daily_activity.map(d => d.snapshot_count);
  const dailyUnique = daily_activity.map(d => d.unique_videos);

  const dailyActivityOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 }
    },
    legend: {
      data: ['Daily Observations', 'Unique Videos Active'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0
    },
    grid: { left: '3%', right: '3%', bottom: '8%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dailyDates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 25 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        name: 'Daily Observations',
        type: 'line',
        data: dailyCounts,
        smooth: true,
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }
            ]
          }
        }
      },
      {
        name: 'Unique Videos Active',
        type: 'line',
        data: dailyUnique,
        smooth: true,
        itemStyle: { color: '#06b6d4' }
      }
    ]
  };

  // Chart 2: Category Popularity — Unique Views vs Legacy Snapshot Sum
  const catNames = category_popularity.slice(0, 8).map(c => c.category_name).reverse();
  const catUnique = category_popularity.slice(0, 8).map(c => c.unique_views).reverse();
  const catLegacy = category_popularity.slice(0, 8).map(c => c.legacy_views).reverse();

  const categoryBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 },
      formatter: (params: any) => {
        let title = `<div class="font-bold text-xs mb-1">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          title += `<div class="flex items-center justify-between gap-4 text-xs">
            <span style="color:${p.color}">● ${p.seriesName}</span>
            <span class="font-mono font-bold">${(Number(p.value) / 1e9).toFixed(2)} Billion</span>
          </div>`;
        });
        return title;
      }
    },
    legend: {
      data: ['Reconciled Unique Views', 'Legacy Snapshot Sum (Inflated)'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { 
        color: '#94a3b8', 
        fontSize: 10,
        formatter: (v: number) => `${(v/1e9).toFixed(0)}B`
      }
    },
    yAxis: {
      type: 'category',
      data: catNames,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#f8fafc', fontSize: 11 }
    },
    series: [
      {
        name: 'Reconciled Unique Views',
        type: 'bar',
        data: catUnique,
        itemStyle: { color: '#10b981', borderRadius: [0, 4, 4, 0] }
      },
      {
        name: 'Legacy Snapshot Sum (Inflated)',
        type: 'bar',
        data: catLegacy,
        itemStyle: { color: '#334155', borderRadius: [0, 4, 4, 0] }
      }
    ]
  };

  // Chart 3: Views Distribution Histogram
  const viewsBins = views_distribution.map(v => v.bin);
  const viewsCounts = views_distribution.map(v => v.count);

  const viewsHistOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 }
    },
    grid: { left: '3%', right: '3%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: viewsBins,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 20 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [{
      name: 'Video Count',
      type: 'bar',
      data: viewsCounts,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#06b6d4' },
            { offset: 1, color: '#0284c7' }
          ]
        },
        borderRadius: [4, 4, 0, 0]
      }
    }]
  };

  // Chart 4: Sentiment Donut
  const sentimentDonutOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 11 }
    },
    series: [
      {
        name: 'Title Sentiment',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: sentiment_summary.positive || 0, name: 'Positive Title', itemStyle: { color: '#10b981' } },
          { value: sentiment_summary.negative || 0, name: 'Negative Title', itemStyle: { color: '#f43f5e' } },
          { value: sentiment_summary.neutral || 0, name: 'True Neutral', itemStyle: { color: '#64748b' } },
          { value: sentiment_summary.unclassified || 0, name: 'Unclassified', itemStyle: { color: '#334155' } }
        ]
      }
    ]
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total Trending Records"
          value={kpis.total_records.toLocaleString()}
          subLabel="Coverage Window"
          subValue={kpis.date_coverage.split(' to ')[0]}
          icon={FileText}
          color="emerald"
          badge="Cleaned"
          badgeType="success"
          info={{
            concept: "Daily observations collected across trending video crawls.",
            calculation: "COUNT(snapshots) after exact duplicate removal and same-day conflict resolution.",
            whyItMatters: "Provides the sample volume for longitudinal tracking and survival analysis.",
            interpretation: "Reflects the total crawl volume available for temporal analytics."
          }}
        />

        <KpiCard
          label="Unique Videos Observed"
          value={kpis.unique_videos.toLocaleString()}
          subLabel="Longevity Multiple"
          subValue={`${(kpis.total_records / Math.max(kpis.unique_videos, 1)).toFixed(1)}x Repeat Appearances`}
          icon={Video}
          color="cyan"
          badge="Deduplicated"
          badgeType="info"
          info={{
            concept: "Distinct video IDs observed in the territory over the analysis period.",
            calculation: "COUNT(DISTINCT video_id)",
            whyItMatters: "Essential for avoiding multiple counts of the same content.",
            interpretation: "Low unique video count paired with high records indicates sustained trending longevity."
          }}
        />

        <KpiCard
          label="Reconciled Unique Views"
          value={kpis.total_unique_views >= 1e9 ? `${(kpis.total_unique_views / 1e9).toFixed(2)}B` : `${(kpis.total_unique_views / 1e6).toFixed(1)}M`}
          subLabel="Legacy Snapshot Sum"
          subValue={`${(kpis.total_legacy_views / 1e9).toFixed(1)}B (${(kpis.total_legacy_views / Math.max(kpis.total_unique_views, 1)).toFixed(1)}x inflated)`}
          icon={Eye}
          color="purple"
          badge="Method Corrected"
          badgeType="warning"
          info={{
            concept: "Audience reach calculated by using only the latest snapshot per video.",
            calculation: "SUM(views_last) per distinct video_id",
            whyItMatters: "The original R script summed daily snapshots, artificially multiplying views by days trending.",
            interpretation: "This corrected figure represents true unique audience exposure."
          }}
        />

        <KpiCard
          label="Average Like Rate"
          value={`${kpis.avg_like_rate}%`}
          subLabel="Avg Comment Rate"
          subValue={`${kpis.avg_comment_rate}%`}
          icon={HeartHandshake}
          color="amber"
          badge="Guarded Ratio"
          badgeType="success"
          info={{
            concept: "Propensity of viewers to register positive feedback per view.",
            calculation: "AVG(likes / views) protected against division by zero",
            whyItMatters: "Normalizes audience interaction across small vs giant creators.",
            interpretation: "Values above 4% signify strong audience affinity and content approval."
          }}
        />
      </div>

      {/* Narrative Section: What Does This Dashboard Tell Us? */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#111c35] to-[#0f172a] border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-tight">What Does This Dashboard Tell Us?</h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Real-Time Automated Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {insights.map((ins, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#090d16]/70 border border-slate-800/80">
              <h3 className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {ins.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{ins.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Visualizations: 2 Large Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trending Activity */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Daily Trending Activity (2026 Trends)
              </h3>
              <p className="text-[11px] text-slate-400">Timeline of observed snapshot entries vs unique active videos</p>
            </div>
          </div>
          <Chart option={dailyActivityOption} style={{ height: '300px' }} />
        </div>

        {/* Category Popularity: Unique Views vs Legacy Inflation */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Category Popularity: Unique Views vs. Legacy Inflation
              </h3>
              <p className="text-[11px] text-slate-400">Comparing corrected terminal reach against cumulative snapshot summation</p>
            </div>
            <button 
              onClick={() => onNavigateTab('categories')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Explore <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <Chart option={categoryBarOption} style={{ height: '300px' }} />
        </div>
      </div>

      {/* Secondary Row: Distribution Histograms & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Views Distribution Histogram */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Audience Reach Distribution
            </h3>
            <p className="text-[11px] text-slate-400">Unique video counts across log-scaled view brackets</p>
          </div>
          <Chart option={viewsHistOption} style={{ height: '240px' }} />
        </div>

        {/* Sentiment Donut */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-emerald-400" />
                Title Sentiment Breakdown
              </h3>
              <p className="text-[11px] text-slate-400">AFINN-111 lexical valence across unique titles</p>
            </div>
            <button 
              onClick={() => onNavigateTab('sentiment')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <Chart option={sentimentDonutOption} style={{ height: '240px' }} />
        </div>

        {/* Quick Country Benchmark */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-purple-400" />
                Territory Reach Snapshot
              </h3>
              <button 
                onClick={() => onNavigateTab('countries')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                Compare 10 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2.5">
              {country_comparison_quick.slice(0, 5).map(c => (
                <div key={c.country} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#090d16] border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{c.country}</span>
                    <span className="text-slate-400">({c.unique_videos.toLocaleString()} vids)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">Med: <strong className="text-emerald-400 font-bold">{c.median_views.toLocaleString()}</strong></span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {c.avg_like_pct}% Like
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 italic">
            *GB and US exhibit the highest repeat trending longevity per video.
          </div>
        </div>
      </div>

      {/* Top 10 Trending Videos Showcase */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-400" />
              Top 10 Most Frequently Trending Videos
            </h3>
            <p className="text-xs text-slate-400">Ranked by distinct observed trending dates and accumulated audience volume</p>
          </div>
          <button 
            onClick={() => onNavigateTab('trending')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
          >
            <span>View All Rankings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {top_trending_videos.map((vid, idx) => (
            <div 
              key={vid.video_id + idx}
              onClick={() => onSelectVideo(vid)}
              className="p-3 rounded-xl bg-[#090d16] border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 font-mono font-bold text-xs flex items-center justify-center text-slate-300 flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                #{idx + 1}
              </div>
              <img 
                src={vid.thumbnail_link} 
                alt={vid.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60`;
                }}
                className="w-16 h-12 object-cover rounded-lg border border-slate-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {vid.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                  <span className="truncate max-w-[130px]">{vid.channel_title}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{vid.category_name}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-white block">{vid.trend_count} Days</span>
                <span className="text-[10px] text-slate-400 font-mono">{(vid.views / 1e6).toFixed(1)}M views</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

