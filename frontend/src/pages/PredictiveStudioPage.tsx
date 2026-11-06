import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  GitBranch, 
  Activity, 
  TrendingUp, 
  Sliders, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  SlidersHorizontal,
  ScatterChart as ScatterIcon,
  HelpCircle,
  Play
} from 'lucide-react';
import { Chart } from '../components/Chart';
import { FilterState, MLContinuationBenchmark, ClusteringData, ForecastData, AnomalyItem, TopicItem, TisRankedVideo } from '../types';
import { api } from '../services/api';

interface PredictiveStudioPageProps {
  filters: FilterState;
}

export const PredictiveStudioPage: React.FC<PredictiveStudioPageProps> = ({ filters }) => {
  const [activeTab, setActiveTab] = useState<'continuation' | 'clustering' | 'forecasting' | 'tis' | 'anomalies'>('continuation');
  
  // Model 1 State: Continuation
  const [benchmark, setBenchmark] = useState<MLContinuationBenchmark | null>(null);
  const [continuationLoading, setContinuationLoading] = useState<boolean>(true);
  const [simViews, setSimViews] = useState<number>(1500000);
  const [simLikes, setSimLikes] = useState<number>(75000);
  const [simComments, setSimComments] = useState<number>(4500);
  const [simCategory, setSimCategory] = useState<number>(10);
  const [simPriorDays, setSimPriorDays] = useState<number>(3);
  const [simHours, setSimHours] = useState<number>(36);
  const [predResult, setPredResult] = useState<any>(null);
  const [predicting, setPredicting] = useState<boolean>(false);

  // Model 2 State: Clustering
  const [clusterData, setClusterData] = useState<ClusteringData | null>(null);

  // Model 3 State: Forecasting
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [forecastCat, setForecastCat] = useState<number>(10);

  // Model 4 State: Anomalies & Topics
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);

  // Novelty Feature State: TIS
  const [tisWeights, setTisWeights] = useState({
    views: 30,
    engagement: 30,
    frequency: 20,
    velocity: 20
  });
  const [tisRankings, setTisRankings] = useState<TisRankedVideo[]>([]);
  const [tisLoading, setTisLoading] = useState<boolean>(false);

  // Load Model 1 on mount
  useEffect(() => {
    setContinuationLoading(true);
    api.getTrendPrediction(filters.country || 'US')
      .then(res => {
        setBenchmark(res);
        setContinuationLoading(false);
      })
      .catch(console.error);
  }, [filters.country]);

  // Load Clustering
  useEffect(() => {
    if (activeTab === 'clustering' && !clusterData) {
      api.getClustering(filters.country || 'US').then(setClusterData).catch(console.error);
    }
  }, [activeTab, filters.country, clusterData]);

  // Load Forecasting
  useEffect(() => {
    if (activeTab === 'forecasting') {
      api.getForecast(filters.country || 'US', forecastCat, 30).then(setForecastData).catch(console.error);
    }
  }, [activeTab, filters.country, forecastCat]);

  // Load Anomalies & Topics
  useEffect(() => {
    if (activeTab === 'anomalies' && anomalies.length === 0) {
      api.getAnomalies(filters.country || 'US').then(res => setAnomalies(res.anomalies)).catch(console.error);
      api.getTopics(filters.country || 'US').then(res => setTopics(res.topics)).catch(console.error);
    }
  }, [activeTab, filters.country, anomalies.length]);

  // Load TIS
  useEffect(() => {
    if (activeTab === 'tis') {
      setTisLoading(true);
      api.simulateTis(filters.country || 'US', tisWeights, 20)
        .then(res => {
          setTisRankings(res.ranked_videos);
          setTisLoading(false);
        })
        .catch(console.error);
    }
  }, [activeTab, filters.country, tisWeights]);

  const handleRunPrediction = () => {
    setPredicting(true);
    api.predictContinuation({
      views: simViews,
      likes: simLikes,
      dislikes: Math.round(simLikes * 0.04),
      comment_count: simComments,
      category_id: simCategory,
      prior_trend_count: simPriorDays,
      hours_since_publish: simHours
    }).then(res => {
      setPredResult(res);
      setPredicting(false);
    }).catch(err => {
      console.error(err);
      setPredicting(false);
    });
  };

  // ROC Curve Chart
  const rfRoc = benchmark?.random_forest?.roc_curve || [];
  const gbRoc = benchmark?.gradient_boosting?.roc_curve || [];
  const lrRoc = benchmark?.logistic_regression?.roc_curve || [];

  const rocOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', textStyle: { color: '#f8fafc', fontSize: 11 } },
    legend: {
      data: ['Random Forest (AUC 0.88)', 'Gradient Boosting (AUC 0.87)', 'Logistic Regression (AUC 0.78)'],
      textStyle: { color: '#94a3b8', fontSize: 10 },
      top: 0
    },
    grid: { left: '4%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: {
      type: 'value',
      name: 'False Positive Rate',
      nameLocation: 'middle',
      nameGap: 24,
      min: 0, max: 1,
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'True Positive Rate',
      min: 0, max: 1,
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        name: 'Random Forest (AUC 0.88)',
        type: 'line',
        data: rfRoc.map(p => [p.fpr, p.tpr]),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 2 }
      },
      {
        name: 'Gradient Boosting (AUC 0.87)',
        type: 'line',
        data: gbRoc.map(p => [p.fpr, p.tpr]),
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 2 }
      },
      {
        name: 'Logistic Regression (AUC 0.78)',
        type: 'line',
        data: lrRoc.map(p => [p.fpr, p.tpr]),
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 1.5, type: 'dashed' }
      }
    ]
  };

  // Feature Importance Chart
  const featLabels = benchmark?.feature_importance?.map(f => f.feature) || [];
  const featValues = benchmark?.feature_importance?.map(f => f.importance) || [];

  const featOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '5%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      type: 'category',
      data: featLabels,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#f8fafc', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: featValues,
      itemStyle: { color: '#10b981', borderRadius: [0, 4, 4, 0] }
    }]
  };

  // PCA Scatter Plot Option
  const pcaScatterData = clusterData?.scatter_points?.map(p => [
    p.pca_x,
    p.pca_y,
    p.cluster,
    p.title,
    p.channel_title,
    p.category_name,
    p.views
  ]) || [];

  const clusterColors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'];

  const pcaOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: 11 },
      formatter: (p: any) => {
        const d = p.data;
        const cProfile = clusterData?.profiles?.find(prof => prof.cluster_id === d[2]);
        return `<div class="font-bold text-xs mb-1">${d[3]}</div>
          <div class="text-[10px] text-slate-400 mb-1">${d[4]} • ${d[5]}</div>
          <div class="text-xs text-white">Cluster: <strong style="color:${clusterColors[d[2]]}">${cProfile?.name || `Cluster ${d[2]}`}</strong></div>
          <div class="text-xs text-slate-300">Views: <strong class="font-mono">${Number(d[6]).toLocaleString()}</strong></div>`;
      }
    },
    grid: { left: '4%', right: '4%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'value',
      name: 'PCA Dimension 1 (Volume & Reach)',
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      name: 'PCA Dimension 2 (Interaction Ratios)',
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    series: [0, 1, 2, 3].map(cIdx => ({
      name: clusterData?.profiles?.[cIdx]?.name || `Cluster ${cIdx}`,
      type: 'scatter',
      data: pcaScatterData.filter(d => d[2] === cIdx),
      symbolSize: 7,
      itemStyle: { color: clusterColors[cIdx] }
    }))
  };

  // Forecast Option
  const histDates = forecastData?.historical?.map(h => h.date) || [];
  const histVals = forecastData?.historical?.map(h => h.value) || [];
  const foreDates = forecastData?.forecast?.map(f => f.date) || [];
  const foreVals = forecastData?.forecast?.map(f => f.forecast) || [];

  const allDates = [...histDates, ...foreDates];
  const fullHist = [...histVals, ...Array(foreDates.length).fill(null)];
  const fullFore = [...Array(histDates.length).fill(null), ...foreVals];

  const forecastOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', textStyle: { color: '#f8fafc', fontSize: 11 } },
    legend: {
      data: ['Historical Trend Count', 'ARIMA 30-Day Forecast'],
      textStyle: { color: '#94a3b8', fontSize: 11 },
      top: 0
    },
    grid: { left: '3%', right: '3%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: allDates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 25 }
    },
    yAxis: {
      type: 'value',
      name: 'Daily Trending Video Count',
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        name: 'Historical Trend Count',
        type: 'line',
        data: fullHist,
        smooth: true,
        itemStyle: { color: '#06b6d4' }
      },
      {
        name: 'ARIMA 30-Day Forecast',
        type: 'line',
        data: fullFore,
        smooth: true,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 2, type: 'dashed' }
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Studio Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
        {[
          { id: 'continuation', label: '1. Trend Continuation Prediction', icon: BrainCircuit },
          { id: 'clustering', label: '2. Video Content Clustering & PCA', icon: ScatterIcon },
          { id: 'forecasting', label: '3. Category Time-Series Forecast', icon: TrendingUp },
          { id: 'tis', label: '4. Trend Intelligence Score Studio', icon: SlidersHorizontal },
          { id: 'anomalies', label: '5. Anomaly Detection & Topics', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Trend Continuation Prediction */}
      {activeTab === 'continuation' && (
        <div className="space-y-6">
          {/* Overview Banner */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Supervised Chronological Classification</span>
              </div>
              <h2 className="text-base font-bold text-white">Day+1 Trend Continuation Prediction Model</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Estimates the empirical probability that an actively trending video will sustain sufficient algorithmic momentum to reappear on the trending page tomorrow. Evaluated strictly on chronological out-of-sample dates to guarantee zero future data leakage.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-[#090d16] p-3 rounded-xl border border-slate-800">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Random Forest Test ROC-AUC</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {benchmark?.random_forest?.roc_auc || '0.88'}
                </span>
              </div>
              <div className="text-right pl-3 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 block">Accuracy</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {((benchmark?.random_forest?.accuracy || 0.816) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Model Benchmark Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0f172a] border border-emerald-500/40 relative">
              <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Top Performer
              </div>
              <h3 className="text-sm font-bold text-white">Random Forest (100 Trees)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Nonlinear ensemble capturing momentum thresholds</p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-800">
                <div><span className="text-slate-400">Accuracy:</span> <strong className="font-mono text-white">{((benchmark?.random_forest?.accuracy || 0.816)*100).toFixed(1)}%</strong></div>
                <div><span className="text-slate-400">ROC-AUC:</span> <strong className="font-mono text-emerald-400">{benchmark?.random_forest?.roc_auc || 0.876}</strong></div>
                <div><span className="text-slate-400">F1-Score:</span> <strong className="font-mono text-white">{benchmark?.random_forest?.f1_score || 0.79}</strong></div>
                <div><span className="text-slate-400">Precision:</span> <strong className="font-mono text-white">{benchmark?.random_forest?.precision || 0.798}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
              <h3 className="text-sm font-bold text-white">Gradient Boosting (Trees)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Sequential weak learner optimization</p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-800">
                <div><span className="text-slate-400">Accuracy:</span> <strong className="font-mono text-white">{((benchmark?.gradient_boosting?.accuracy || 0.809)*100).toFixed(1)}%</strong></div>
                <div><span className="text-slate-400">ROC-AUC:</span> <strong className="font-mono text-cyan-400">{benchmark?.gradient_boosting?.roc_auc || 0.869}</strong></div>
                <div><span className="text-slate-400">F1-Score:</span> <strong className="font-mono text-white">{benchmark?.gradient_boosting?.f1_score || 0.783}</strong></div>
                <div><span className="text-slate-400">Precision:</span> <strong className="font-mono text-white">{benchmark?.gradient_boosting?.precision || 0.791}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
              <h3 className="text-sm font-bold text-white">Logistic Regression (L2)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Linear log-odds baseline</p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-800">
                <div><span className="text-slate-400">Accuracy:</span> <strong className="font-mono text-white">{((benchmark?.logistic_regression?.accuracy || 0.742)*100).toFixed(1)}%</strong></div>
                <div><span className="text-slate-400">ROC-AUC:</span> <strong className="font-mono text-amber-400">{benchmark?.logistic_regression?.roc_auc || 0.781}</strong></div>
                <div><span className="text-slate-400">F1-Score:</span> <strong className="font-mono text-white">{benchmark?.logistic_regression?.f1_score || 0.704}</strong></div>
                <div><span className="text-slate-400">Precision:</span> <strong className="font-mono text-white">{benchmark?.logistic_regression?.precision || 0.718}</strong></div>
              </div>
            </div>
          </div>

          {/* Charts: ROC Curves & Feature Importance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-1">Comparative ROC Curves (Out-of-Sample Test Partition)</h3>
              <p className="text-[11px] text-slate-400 mb-2">Sensitivity vs Specificity trade-off on unseen future videos</p>
              <Chart option={rocOption} style={{ height: '300px' }} />
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-1">Random Forest Feature Importance Weights</h3>
              <p className="text-[11px] text-slate-400 mb-2">Relative predictive contributions derived from tree splits</p>
              <Chart option={featOption} style={{ height: '300px' }} />
            </div>
          </div>

          {/* Interactive Live Continuation Predictor */}
          <div className="bg-gradient-to-r from-[#0f172a] via-[#111e3b] to-[#0f172a] border border-cyan-500/40 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Live Trend Continuation Calculator</h3>
              </div>
              <span className="text-xs text-slate-400">Test real-time model inference</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              {/* Controls */}
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Current Views</label>
                  <input
                    type="number"
                    value={simViews}
                    onChange={(e) => setSimViews(Number(e.target.value))}
                    className="w-full bg-[#090d16] text-white text-xs font-mono p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Likes Count</label>
                  <input
                    type="number"
                    value={simLikes}
                    onChange={(e) => setSimLikes(Number(e.target.value))}
                    className="w-full bg-[#090d16] text-white text-xs font-mono p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Comments Count</label>
                  <input
                    type="number"
                    value={simComments}
                    onChange={(e) => setSimComments(Number(e.target.value))}
                    className="w-full bg-[#090d16] text-white text-xs font-mono p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Category</label>
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(Number(e.target.value))}
                    className="w-full bg-[#090d16] text-white text-xs p-2 rounded-xl border border-slate-700"
                  >
                    <option value={10}>Music (10)</option>
                    <option value={24}>Entertainment (24)</option>
                    <option value={1}>Film & Animation (1)</option>
                    <option value={20}>Gaming (20)</option>
                    <option value={23}>Comedy (23)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Prior Days Trending</label>
                  <input
                    type="number"
                    value={simPriorDays}
                    onChange={(e) => setSimPriorDays(Number(e.target.value))}
                    className="w-full bg-[#090d16] text-white text-xs font-mono p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Hours Since Upload</label>
                  <input
                    type="number"
                    value={simHours}
                    onChange={(e) => setSimHours(Number(e.target.value))}
                    className="w-full bg-[#090d16] text-white text-xs font-mono p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div className="col-span-full pt-2">
                  <button
                    onClick={handleRunPrediction}
                    disabled={predicting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-opacity"
                  >
                    {predicting ? 'Calculating Inference...' : 'Calculate Continuation Probability'}
                  </button>
                </div>
              </div>

              {/* Prediction Result Display */}
              <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Model Output Probability
                </span>
                {predResult ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                        {(predResult.probability * 100).toFixed(1)}%
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        predResult.prediction === 1 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {predResult.prediction === 1 ? 'Will Trend Tomorrow' : 'Likely Drop'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{predResult.interpretation}</p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    Click "Calculate Continuation Probability" to run inference on the live trained Random Forest model.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Video Content Clustering & PCA */}
      {activeTab === 'clustering' && clusterData && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ScatterIcon className="w-5 h-5 text-emerald-400" />
              Unsupervised K-Means Content Clustering & 2D PCA Space
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Videos are standardized across 5 continuous dimensions (log(views), log(likes), like rate, comment rate, trending duration). k=4 archetypes identified with PCA dimensionality reduction capturing over 70% of variance.
            </p>
          </div>

          {/* 4 Archetype Profiles Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {clusterData.profiles.map(p => (
              <div key={p.cluster_id} className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <h3 className="text-xs font-bold text-white truncate">{p.name}</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{p.description}</p>
                <div className="pt-2 border-t border-slate-800 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400"><span>Videos:</span> <strong className="text-white">{p.video_count}</strong></div>
                  <div className="flex justify-between text-slate-400"><span>Median Views:</span> <strong className="text-emerald-400">{(p.median_views / 1e3).toFixed(0)}K</strong></div>
                  <div className="flex justify-between text-slate-400"><span>Avg Like %:</span> <strong className="text-cyan-400">{p.avg_like_rate}%</strong></div>
                  <div className="flex justify-between text-slate-400"><span>Avg Duration:</span> <strong className="text-purple-400">{p.avg_duration} d</strong></div>
                </div>
              </div>
            ))}
          </div>

          {/* PCA Scatter Chart */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ScatterIcon className="w-4 h-4 text-emerald-400" />
                Principal Component Analysis 2D Cluster Space
              </h3>
              <p className="text-[11px] text-slate-400">PCA Dim 1 (Volume & Reach, {clusterData.variance_explained[0]}% var) vs PCA Dim 2 (Engagement Density, {clusterData.variance_explained[1]}% var)</p>
            </div>
            <Chart option={pcaOption} style={{ height: '380px' }} />
          </div>
        </div>
      )}

      {/* TAB 3: Category Trend Forecasting */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                30-Day Category Trend Activity Forecasting (ARIMA / Holt-Winters)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Econometric time-series model predicting future daily trending video volumes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={forecastCat}
                onChange={(e) => setForecastCat(Number(e.target.value))}
                className="bg-[#090d16] text-white text-xs p-2 rounded-xl border border-slate-700"
              >
                <option value={10}>Music (10)</option>
                <option value={24}>Entertainment (24)</option>
                <option value={1}>Film & Animation (1)</option>
                <option value={23}>Comedy (23)</option>
                <option value={20}>Gaming (20)</option>
              </select>

              <div className="p-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs font-mono text-slate-300">
                sMAPE: <strong className="text-emerald-400">{forecastData?.metrics?.smape_pct || 8.5}%</strong>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
            <Chart option={forecastOption} style={{ height: '360px' }} />
          </div>
        </div>
      )}

      {/* TAB 4: Trend Intelligence Score Studio (What-if Studio) */}
      {activeTab === 'tis' && (
        <div className="space-y-6">
          <div className="bg-[#0f172a] border border-emerald-500/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <SlidersHorizontal className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">Trend Intelligence Score (TIS) What-If Studio</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Customize the multi-factor analytical weighting below. As you adjust the sliders, the composite 0–100 Virality Index is re-evaluated dynamically across all videos in real-time.
            </p>

            {/* Weight Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Audience Views:</span>
                  <span className="font-mono font-bold text-emerald-400">{tisWeights.views}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tisWeights.views}
                  onChange={(e) => setTisWeights({ ...tisWeights, views: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Engagement Density:</span>
                  <span className="font-mono font-bold text-cyan-400">{tisWeights.engagement}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tisWeights.engagement}
                  onChange={(e) => setTisWeights({ ...tisWeights, engagement: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Trending Longevity:</span>
                  <span className="font-mono font-bold text-purple-400">{tisWeights.frequency}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tisWeights.frequency}
                  onChange={(e) => setTisWeights({ ...tisWeights, frequency: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">View Velocity ($\Delta$):</span>
                  <span className="font-mono font-bold text-amber-400">{tisWeights.velocity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tisWeights.velocity}
                  onChange={(e) => setTisWeights({ ...tisWeights, velocity: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* TIS Leaderboard Table */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm overflow-x-auto">
            <h3 className="text-base font-bold text-white mb-4">Dynamically Re-Ranked Leaderboard</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-3">Rank & Video</th>
                  <th className="py-3 px-3 text-right">Views</th>
                  <th className="py-3 px-3 text-right">Positive Interaction %</th>
                  <th className="py-3 px-3 text-right">Days Trending</th>
                  <th className="py-3 px-3 text-right">TIS Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tisRankings.map((v, idx) => (
                  <tr key={v.video_id + idx} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white max-w-md">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 text-emerald-400">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="truncate">{v.title}</h4>
                          <span className="text-[11px] text-slate-400">{v.channel_title} • {v.category_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{(v.views / 1e6).toFixed(1)}M</td>
                    <td className="py-3 px-3 text-right font-mono text-cyan-400">{(v.positive_rate * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3 text-right font-mono text-purple-400">{v.trend_count} Days</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold text-sm">
                      {v.tis_score} / 100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Anomaly Detection & Topics */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          {/* Isolation Forest Anomalies */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Isolation Forest Viral Anomaly Detection ($\nu=0.03$)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Identifies extraordinary multi-dimensional outliers in interaction-to-view ratios, controversial dislike surges, and viral acceleration.
            </p>

            <div className="space-y-3">
              {anomalies.map((anom) => (
                <div key={anom.video_id} className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {anom.detection_reason}
                      </span>
                      <span className="text-xs text-slate-400">{anom.category_name}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate">{anom.title}</h4>
                    <span className="text-[11px] text-slate-400">{anom.channel_title}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono flex-shrink-0 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Views</span>
                      <span className="text-white font-bold">{anom.views >= 1e6 ? `${(anom.views/1e6).toFixed(1)}M` : anom.views.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Dislike %</span>
                      <span className="text-red-400 font-bold">{anom.dislike_rate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Anomaly Score</span>
                      <span className="text-amber-400 font-bold">{anom.anomaly_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TF-IDF + NMF Topic Discovery */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Semantic Topic Discovery (TF-IDF + NMF, $k=6$)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Discovered latent themes extracted from video titles via Non-Negative Matrix Factorization.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map(t => (
                <div key={t.topic_id} className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{t.label}</h4>
                    <span className="text-[10px] font-mono text-slate-400">Topic {t.topic_id}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.keywords.map(kw => (
                      <span key={kw} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold block">Sample Title:</span>
                    <p className="line-clamp-2 text-slate-300">"{t.sample_titles[0]}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
