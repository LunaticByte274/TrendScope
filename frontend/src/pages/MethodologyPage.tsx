import React from 'react';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  BrainCircuit, 
  ShieldCheck, 
  Scale, 
  Sigma,
  FileText
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Title & Introduction */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Academic Research Defense</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Analytical Methodology & Mathematical Formulations</h1>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          TrendScope was architected to transform the baseline YouTube trending study into an academically defensible, reproducible, and mathematically rigorous data science platform. This document outlines the formal analytical foundations and operational assumptions.
        </p>
      </div>

      {/* Section 1: Resolving Cumulative Inflation */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Scale className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">1. Correcting View Inflation: Reconciled Terminal Snapshots</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In historical trending video crawlers, videos frequently remain on the trending page for multiple consecutive days. Because YouTube view counts are inherently cumulative, summing daily views across all observation rows repeatedly counts the same views:
        </p>
        
        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-slate-400">// Legacy Naive Formulation (Original R baseline):</div>
          <div className="text-red-400">P_legacy(category) = ∑_(rows ∈ category) views_row</div>
          <div className="text-slate-400 pt-2">// TrendScope Reconciled Unique-Video Formulation:</div>
          <div className="text-emerald-400">P_unique(category) = ∑_(v ∈ unique_videos_category) views_terminal(v)</div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In prolonged trending categories (particularly Music, where videos average 8 to 15 days on the charts), the legacy method inflated total category volume by <strong>831%</strong> (40.13B legacy vs. 4.83B unique). TrendScope documents both measures to preserve historical reproducibility while presenting accurate unique audience reach.
        </p>
      </div>

      {/* Section 2: Ratio Formulations */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Sigma className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">2. Standardized Engagement & Guarded Denominators</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Because raw view counts follow a steep power-law distribution (Pareto-distributed), raw interaction sums disproportionately favor massive creators. We define normalized engagement rates bounded within $[0, 1]$ and protected against zero division:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Like Rate (R_like):</span>
            <div className="text-white">R_like = likes / max(views, 1)</div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">Initial approval propensity per view.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
            <span className="text-purple-400 font-bold block mb-1">Comment Rate (R_comment):</span>
            <div className="text-white">R_comment = comments / max(views, 1)</div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">Discussion density and conversational intensity.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
            <span className="text-red-400 font-bold block mb-1">Dislike Rate (R_dislike):</span>
            <div className="text-white">R_dislike = dislikes / max(views, 1)</div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">Disapproval and controversy index.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">Engagement Performance Index (EPI):</span>
            <div className="text-white">EPI = 100 * (0.6 * P_like + 0.4 * P_comment)</div>
            <p className="text-[11px] text-slate-400 font-sans mt-2">Percentile composite normalized by category.</p>
          </div>
        </div>
      </div>

      {/* Section 3: Sentiment Methodology */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-purple-400">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">3. AFINN Lexical Sentiment & Honest Caveats</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The project utilizes the validated <strong>AFINN-111</strong> lexicon (Finn Årup Nielsen) consisting of 2,477 English words rated on an integer valence scale from $-5$ (extremely negative) to $+5$ (extremely positive).
        </p>

        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">
              <strong>Title-Only Scoping:</strong> The dataset contains no viewer comment text. Sentiment represents creator title framing rather than viewer reaction.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">
              <strong>Unclassified vs Neutral:</strong> Titles without lexicon terms are categorized as <em>Unclassified</em> rather than erroneously assigned a zero neutral score.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">
              <strong>Multilingual Scope:</strong> AFINN is an English dictionary. Non-English datasets (Russia, Japan, South Korea) naturally exhibit high unclassified rates, which is clearly disclosed rather than falsified.
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Machine Learning Protocol */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <BrainCircuit className="w-5 h-5" />
          <h2 className="text-base font-bold text-white">4. Machine Learning & Predictive Modeling Protocols</h2>
        </div>
        
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>Chronological Leakage Prevention:</strong> Rather than performing randomized train/test splits (which allow future temporal information to leak into past predictions), all predictive tasks split data chronologically: training on the initial 75% of dates and evaluating strictly on the terminal 25% of dates on unseen future videos.
          </p>

          <p>
            <strong>Unsupervised K-Means Archetypes:</strong> Standardized continuous features are mapped into 4 interpretable operational archetypes supported by inertia elbow analysis and silhouette validation.
          </p>

          <p>
            <strong>Time-Series Forecasting:</strong> Modeled using Holt-Winters Exponential Smoothing and ARIMA with out-of-sample sMAPE and RMSE validation.
          </p>
        </div>
      </div>
    </div>
  );
};
