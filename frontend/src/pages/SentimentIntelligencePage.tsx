import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Frown, 
  Meh, 
  HelpCircle, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Chart } from '../components/Chart';
import { FilterState, VideoItem } from '../types';
import { api } from '../services/api';
import { InfoModal } from '../components/InfoModal';

interface SentimentIntelligencePageProps {
  filters: FilterState;
  onSelectVideo?: (video: VideoItem) => void;
}

export const SentimentIntelligencePage: React.FC<SentimentIntelligencePageProps> = ({ filters }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getSentiment(filters)
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-2xl border border-slate-700/50"></div>
          ))}
        </div>
      </div>
    );
  }

  const { summary, histogram, category_sentiment, top_positive, top_negative } = data;

  const sumMap: Record<string, number> = {};
  summary.forEach((s: any) => { sumMap[s.sentiment_category] = s.count; });

  const totalScored = (sumMap.positive || 0) + (sumMap.negative || 0) + (sumMap.neutral || 0);

  // Histogram Chart (-5 to +5)
  const histBins = histogram.map((h: any) => h.score_bin > 0 ? `+${h.score_bin}` : `${h.score_bin}`);
  const histCounts = histogram.map((h: any) => h.count);

  const histOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 },
      formatter: (p: any) => `Score ${p.name}: <strong>${Number(p.value).toLocaleString()} videos</strong>`
    },
    grid: { left: '3%', right: '3%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: histBins,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [{
      type: 'bar',
      data: histCounts.map((val: number, idx: number) => {
        const bin = histogram[idx].score_bin;
        const color = bin > 0 ? '#10b981' : bin < 0 ? '#f43f5e' : '#64748b';
        return { value: val, itemStyle: { color, borderRadius: [4, 4, 0, 0] } };
      })
    }]
  };

  // Category Sentiment Horizontal Bar Chart
  const validCatSent = category_sentiment.filter((c: any) => c.avg_sentiment !== null);
  const catNames = validCatSent.map((c: any) => c.category_name);
  const catScores = validCatSent.map((c: any) => c.avg_sentiment);

  const catSentOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 }
    },
    grid: { left: '3%', right: '5%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      type: 'category',
      data: catNames,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#f8fafc', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: catScores.map((score: number) => ({
        value: score,
        itemStyle: {
          color: score >= 0 ? '#10b981' : '#f43f5e',
          borderRadius: score >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]
        }
      }))
    }]
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 4 Sentiment Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold text-slate-400">Positive Titles</span>
            <Smile className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{(sumMap.positive || 0).toLocaleString()}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
            {totalScored > 0 ? `${(((sumMap.positive || 0) / totalScored) * 100).toFixed(1)}% of Scored` : '0%'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
          <div className="flex items-center justify-between text-red-400 mb-2">
            <span className="text-xs font-semibold text-slate-400">Negative Titles</span>
            <Frown className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{(sumMap.negative || 0).toLocaleString()}</div>
          <p className="text-[11px] text-red-400 mt-1 font-semibold">
            {totalScored > 0 ? `${(((sumMap.negative || 0) / totalScored) * 100).toFixed(1)}% of Scored` : '0%'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-400">True Neutral</span>
            <Meh className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{(sumMap.neutral || 0).toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold">Balanced Lexicon Tokens</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-400">Unclassified</span>
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-400 font-mono">{(sumMap.unclassified || 0).toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 mt-1">No Lexicon Match in AFINN</p>
        </div>
      </div>

      {/* Multilingual / Academic Caveat Callout */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-cyan-500/30 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Academic Methodology Note:</strong> The baseline R script evaluated sentiment using the <strong>AFINN-111</strong> English lexicon on video titles (since actual user comment text is not present in the YouTube dataset). Titles with no matching vocabulary are strictly designated as <strong>Unclassified</strong> rather than falsely labeled as neutral. In non-English territories (e.g. RU, JP, KR), AFINN coverage is expectedly low.
        </div>
      </div>

      {/* Visualizations: Score Histogram & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              AFINN Valence Score Distribution (-5 to +5)
            </h3>
            <p className="text-[11px] text-slate-400">Frequency of unique video title average sentiment scores</p>
          </div>
          <Chart option={histOption} style={{ height: '320px' }} />
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smile className="w-4 h-4 text-cyan-400" />
              Average Title Valence by Category
            </h3>
            <p className="text-[11px] text-slate-400">Net positive vs negative title framing per content category</p>
          </div>
          <Chart option={catSentOption} style={{ height: '320px' }} />
        </div>
      </div>

      {/* Top Positive & Negative Titles Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Positive */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-400 mb-3">
            <ThumbsUp className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Highest Positive Sentiment Titles</h3>
          </div>
          <div className="space-y-2.5">
            {top_positive.map((v: any) => (
              <div key={v.video_id} className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{v.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{v.channel_title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                    +{v.afinn_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Negative */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-red-400 mb-3">
            <ThumbsDown className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Highest Negative Sentiment Titles</h3>
          </div>
          <div className="space-y-2.5">
            {top_negative.map((v: any) => (
              <div key={v.video_id} className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{v.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{v.channel_title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-xs font-bold border border-red-500/30">
                    {v.afinn_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

