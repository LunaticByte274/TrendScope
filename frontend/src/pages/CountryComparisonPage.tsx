import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  BarChart3, 
  CheckSquare, 
  Square, 
  HelpCircle,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import { Chart } from '../components/Chart';
import { CountryOverview } from '../types';
import { api } from '../services/api';

export const CountryComparisonPage: React.FC = () => {
  const [countries, setCountries] = useState<CountryOverview[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['US', 'GB', 'IN', 'CA']);
  const [compData, setCompData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getCountries()
      .then(res => setCountries(res.countries))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCodes.length === 0) return;
    setLoading(true);
    api.compareCountries(selectedCodes)
      .then(res => {
        setCompData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCodes]);

  const toggleCountry = (code: string) => {
    if (selectedCodes.includes(code)) {
      if (selectedCodes.length > 1) {
        setSelectedCodes(selectedCodes.filter(c => c !== code));
      }
    } else {
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  // Radar Chart comparing selected countries
  const radarIndicators = [
    { name: 'Median Reach', max: 1000000 },
    { name: 'Average Like %', max: 6 },
    { name: 'Average Comment %', max: 0.8 },
    { name: 'Trending Longevity (Days)', max: 12 },
    { name: 'Unique Video Count', max: 35000 }
  ];

  const radarSeriesData = compData?.comparison?.map((c: any) => ({
    name: c.country_name,
    value: [
      c.median_views,
      c.avg_like_pct,
      c.avg_comment_pct,
      c.avg_longevity,
      c.unique_videos
    ]
  })) || [];

  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: { color: '#94a3b8', fontSize: 11 }
    },
    radar: {
      indicator: radarIndicators,
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#f8fafc', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e293b' } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    series: [{
      type: 'radar',
      data: radarSeriesData,
      symbolSize: 4
    }]
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Country Selection Pills */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              Global Cross-Territory Comparison Studio
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select 2 or more countries to contrast audience engagement, reach, and trending longevity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCodes(countries.map(c => c.country))}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Select All 10
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setSelectedCodes(['US', 'GB', 'IN', 'CA'])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Reset Default
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-4">
          {countries.map(c => {
            const isSelected = selectedCodes.includes(c.country);
            return (
              <button
                key={c.country}
                onClick={() => toggleCountry(c.country)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-[#090d16] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                <span>{c.country_name}</span>
                <span className="font-mono text-[10px] opacity-75">({c.unique_videos.toLocaleString()})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Radar & Key Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Multi-Dimensional Country Performance Radar
            </h3>
            <p className="text-[11px] text-slate-400">Comparing median views, interaction rates, and longevity across territories</p>
          </div>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-xs text-slate-500">Loading comparison...</div>
          ) : (
            <Chart option={radarOption} style={{ height: '360px' }} />
          )}
        </div>

        {/* Selected Country Summary Cards */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Key Cross-Territory Statistical Insights</h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
                <span className="font-bold text-emerald-400 block mb-1">Audience Reach Disparity:</span>
                <p className="text-slate-300 leading-relaxed">
                  Great Britain (GB) and the USA exhibit significantly higher median view reach per trending video ({compData?.comparison?.find((c: any) => c.country === 'GB')?.median_views?.toLocaleString()} views in GB) compared to France or Japan (~60K–75K).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
                <span className="font-bold text-cyan-400 block mb-1">Trending Longevity & Churn:</span>
                <p className="text-slate-300 leading-relaxed">
                  Great Britain has only 3,272 unique videos across 38,742 records (each trending video averages ~11.8 days), demonstrating a low-turnover trending chart dominated by global viral hits. In contrast, France and Germany experience rapid daily churn with over 29,000 unique videos.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
                <span className="font-bold text-purple-400 block mb-1">Interactive Engagement Propensity:</span>
                <p className="text-slate-300 leading-relaxed">
                  Russia and Mexico record the highest like rates (~4.8%–5.0%), while India and South Korea show more moderate like rates (~2.1%) with heavy mobile discussion volume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Country Comparison Matrix */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-4">Complete 10-Country Benchmark Table</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-3">Country</th>
              <th className="py-3 px-3 text-right">Snapshots</th>
              <th className="py-3 px-3 text-right">Unique Videos</th>
              <th className="py-3 px-3 text-right">Median Views</th>
              <th className="py-3 px-3 text-right">Avg Views</th>
              <th className="py-3 px-3 text-right">Avg Like %</th>
              <th className="py-3 px-3 text-right">Avg Comment %</th>
              <th className="py-3 px-3 text-right">Coverage Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {countries.map(c => (
              <tr key={c.country} className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{c.country}</span>
                  <span>{c.country_name}</span>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-300">{c.snapshot_count.toLocaleString()}</td>
                <td className="py-3 px-3 text-right font-mono text-white font-bold">{c.unique_videos.toLocaleString()}</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">{c.median_views.toLocaleString()}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-400">{(c.avg_views / 1e6).toFixed(2)}M</td>
                <td className="py-3 px-3 text-right font-mono text-cyan-400">{c.avg_like_pct}%</td>
                <td className="py-3 px-3 text-right font-mono text-purple-400">{c.avg_comment_pct}%</td>
                <td className="py-3 px-3 text-right font-mono text-slate-400">{c.distinct_days} d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

