import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  BrainCircuit, 
  Globe2, 
  FileText, 
  ShieldCheck,
  Scale,
  Sparkles,
  BarChart3
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export const TeacherModePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const totalSlides = 10;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide(prev => Math.min(totalSlides, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(1, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slides = [
    {
      id: 1,
      title: "1. Introduction & Research Motivation",
      subtitle: "Why analyse YouTube trending video patterns?",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-slate-200">
            YouTube represents the world's largest video streaming ecosystem, where billions of users consume content daily. However, the algorithmic dynamics determining which videos achieve "Trending" status have traditionally remained opaque.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Audience Behavior:</span>
              <p className="text-slate-400">Discover which genres capture viral attention vs sustained loyalty.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Creator Optimization:</span>
              <p className="text-slate-400">Identify interaction thresholds needed to trend and remain trending.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">Algorithmic Auditing:</span>
              <p className="text-slate-400">Examine geographical differences and category preferences across 10 countries.</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <strong>Project Evolution:</strong> Transforms an initial 73-line offline R script into a complete full-stack predictive intelligence platform covering 361,424 cleaned records, 10 countries, and 5 machine learning models.
          </div>
        </div>
      ),
      talkingPoints: [
        "Explain that the original project was created as an offline R script on US data only.",
        "Highlight that TrendScope elevates this into a full-stack, enterprise-grade data intelligence product.",
        "Emphasize that the historical timeframe (Nov 2017 – Jun 2018) is preserved accurately without pretending to be live API data."
      ]
    },
    {
      id: 2,
      title: "2. Dataset Corpus & International Scope",
      subtitle: "375,942 raw records across 10 sovereign territories",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-slate-200">
            While the original R project evaluated only the United States dataset, TrendScope incorporates all 10 national datasets present in the archive:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono pt-1">
            {[
              { code: 'US', name: 'USA', rows: '40.9K', unq: '6,351' },
              { code: 'GB', name: 'Britain', rows: '38.7K', unq: '3,272' },
              { code: 'CA', name: 'Canada', rows: '40.8K', unq: '24,427' },
              { code: 'IN', name: 'India', rows: '32.4K', unq: '16,307' },
              { code: 'DE', name: 'Germany', rows: '40.8K', unq: '29,627' },
              { code: 'FR', name: 'France', rows: '40.7K', unq: '30,581' },
              { code: 'RU', name: 'Russia', rows: '40.3K', unq: '34,282' },
              { code: 'MX', name: 'Mexico', rows: '40.0K', unq: '33,513' },
              { code: 'KR', name: 'S. Korea', rows: '31.9K', unq: '15,876' },
              { code: 'JP', name: 'Japan', rows: '14.5K', unq: '12,912' },
            ].map(c => (
              <div key={c.code} className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-center">
                <span className="text-emerald-400 font-bold block">{c.name} ({c.code})</span>
                <span className="text-slate-300 text-[11px] block">{c.rows} clean</span>
                <span className="text-slate-500 text-[10px] block">{c.unq} unique</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-slate-300">
            <strong>Key Statistical Takeaway:</strong> Notice the massive contrast in unique video turnover. Great Britain had only 3,272 unique videos (each trending ~11.8 days), while Russia had 34,282 unique videos (rapid daily churn).
          </div>
        </div>
      ),
      talkingPoints: [
        "Explain that 10 territories allow true cross-cultural audience analysis.",
        "Explain the distinction between snapshot observations (361,424) and distinct unique videos (207,148).",
        "Point out that the original code utilized less than 11% of the available data in the archive."
      ]
    },
    {
      id: 3,
      title: "3. Rigorous Data Preprocessing Pipeline",
      subtitle: "Resolving crawler duplicates, timestamp parsing & UTF-8 character preservation",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-slate-200">
            The raw data contained significant data engineering challenges that the baseline R program overlooked:
          </p>
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Legitimate Repeat vs Spurious Crawler Duplicates:</strong>
                <p className="text-slate-400 mt-0.5">Videos appearing across consecutive dates are legitimate observations. However, multiple daily crawler runs produced 12,570 exact duplicate rows (e.g. 5,677 in Japan, 4,263 in India) which were safely deduplicated.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Same-Day Conflict Resolution:</strong>
                <p className="text-slate-400 mt-0.5">When multiple crawls recorded different views for the same video on the same calendar date, TrendScope applied a deterministic rule: select the record with <code className="text-cyan-400">max(views)</code> representing the latest observation of that day.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Native Script UTF-8 Recovery:</strong>
                <p className="text-slate-400 mt-0.5">Isolated rogue bytes in JP, KR, RU, and MX caused strict UTF-8 decoders to crash or fall back to Latin-1 mojibake. TrendScope decodes with replacement fallbacks, preserving 99.999% of Kanji, Hangul, and Cyrillic scripts.</p>
              </div>
            </div>
          </div>
        </div>
      ),
      talkingPoints: [
        "Explain that real-world big data requires deterministic cleaning rules.",
        "Demonstrate that our cleaning pipeline retained 96.1% of raw data while eliminating 14,518 duplicate/conflicting records.",
        "Show that video titles in non-English datasets were preserved without corruption."
      ]
    },
    {
      id: 4,
      title: "4. Core Analytical Objectives & Upgrade Matrix",
      subtitle: "How TrendScope fulfills and surpasses all original academic objectives",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Objective</th>
                  <th className="py-2.5 px-3">Original Baseline R Script</th>
                  <th className="py-2.5 px-3 text-emerald-400">TrendScope Upgraded Implementation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">1. Trending Detection</td>
                  <td className="py-2.5 px-3 text-slate-400">Counts text title appearances</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-semibold">Tracks distinct dates by video_id, duration, and day-over-day velocity</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">2. Category Popularity</td>
                  <td className="py-2.5 px-3 text-slate-400">Sums cumulative daily views (8x inflation)</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-semibold">Reconciled unique views using terminal snapshot per unique video</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">3. Title Sentiment</td>
                  <td className="py-2.5 px-3 text-slate-400">Basic AFINN word inner_join (only 38% scored)</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-semibold">AFINN baseline + separates Unclassified from Neutral + Topic discovery</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">4. Reporting & UI</td>
                  <td className="py-2.5 px-3 text-slate-400">Static PNG chart and 3 CSVs</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-semibold">Interactive SaaS dashboard, 5 ML models, and live What-if studio</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
      talkingPoints: [
        "Walk the panel through the comparison matrix to show continuity and progression.",
        "Emphasize that none of the original work was deleted; it was verified, corrected, and expanded.",
        "Note that we maintained R script compatibility and verified exact baseline numbers."
      ]
    },
    {
      id: 5,
      title: "5. Longitudinal Trending Analysis & Longevity",
      subtitle: "Moving from naive title counts to unique video survival dynamics",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-slate-200">
            In the baseline project, the top video was identified simply by counting rows matching the title string:
          </p>
          <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-2 font-mono">
            <div className="text-slate-400">// Top 1 Baseline Title Appearance:</div>
            <div className="text-emerald-400">"WE MADE OUR MOM CRY...HER DREAM CAME TRUE!" (30 text appearances)</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">True Video Longevity:</span>
              <p className="text-slate-300">Measured by counting distinct calendar dates on which the unique <code className="text-cyan-400">video_id</code> appeared, tracking first date, last date, and calendar span.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">Day-over-Day Velocity ($\Delta$):</span>
              <p className="text-slate-300">Measures the daily view acceleration between consecutive snapshots, accounting for missing crawl dates.</p>
            </div>
          </div>
        </div>
      ),
      talkingPoints: [
        "Explain why video_id is essential: titles can mutate slightly or different creators can use the same title.",
        "Show how our day-by-day trajectory chart visually demonstrates views growth over time.",
        "Point out that the top video accumulated 29 distinct trending dates with over 10M views."
      ]
    },
    {
      id: 6,
      title: "6. Category Intelligence & Resolving 8x View Inflation",
      subtitle: "The major mathematical discovery and analytical correction",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="p-4 rounded-xl bg-[#090d16] border border-amber-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Mathematical Flaw in Baseline R Script:
            </span>
            <p className="text-slate-200 leading-relaxed">
              The original code used <code className="text-emerald-400">group_by(category_id) %&gt;% summarise(total_views = sum(views))</code>. Since views are cumulative snapshots, a video trending for 30 days had its views summed 30 times!
            </p>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Legacy Daily Sum</th>
                  <th className="py-2 px-3 text-right text-emerald-400">Reconciled Unique Views</th>
                  <th className="py-2 px-3 text-right text-amber-400">Inflation Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Music (10)</td>
                  <td className="py-2 px-3 text-right text-slate-400">40.13 Billion</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">4.83 Billion</td>
                  <td className="py-2 px-3 text-right text-amber-400 font-bold">8.31x Inflated</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Entertainment (24)</td>
                  <td className="py-2 px-3 text-right text-slate-400">20.60 Billion</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">2.83 Billion</td>
                  <td className="py-2 px-3 text-right text-amber-400 font-bold">7.28x Inflated</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Film & Animation (1)</td>
                  <td className="py-2 px-3 text-right text-slate-400">7.28 Billion</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">0.81 Billion</td>
                  <td className="py-2 px-3 text-right text-amber-400 font-bold">8.94x Inflated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
      talkingPoints: [
        "This is the most critical analytical correction in the defense.",
        "Explain that Music videos trend for weeks, causing their cumulative views to be added day after day.",
        "Demonstrate that TrendScope supports both metrics: showing legacy for reproduction and unique reach for academic accuracy."
      ]
    },
    {
      id: 7,
      title: "7. Standardized Engagement & Correlation Analysis",
      subtitle: "Like rates, comment rates, and Pearson/Spearman relationship matrices",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-slate-200">
            Because YouTube view distributions are heavily right-skewed, raw interaction sums create misleading comparisons. TrendScope formulates standardized rate metrics:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Like Rate (3.4% US avg):</span>
              <p className="text-slate-400">Highest in Gaming & Comedy. Lowest in News & Politics.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">Comment Rate (0.4% US avg):</span>
              <p className="text-slate-400">Proxy for audience debate and conversational intensity.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Correlation Findings:</span>
              <p className="text-slate-400">Views & Likes show strong positive correlation ($r = 0.84$), while Views & Dislikes show moderate correlation ($r = 0.47$).</p>
            </div>
          </div>
        </div>
      ),
      talkingPoints: [
        "Explain guarded denominators: handling views=0 to prevent divide-by-zero crashes.",
        "Explain why log-log scales were used in the scatter plot.",
        "Clarify that correlation does not imply causation."
      ]
    },
    {
      id: 8,
      title: "8. Title Sentiment Intelligence & Lexical Findings",
      subtitle: "AFINN-111 lexical matching, unclassified segregation, and multilingual scope",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-slate-200">
            We preserve the original AFINN-111 lexicon approach while rectifying its classification reporting:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-emerald-400 font-bold text-base block">1,286</span>
              <span className="text-[10px] text-slate-400 uppercase">Positive (52.8%)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-red-400 font-bold text-base block">1,082</span>
              <span className="text-[10px] text-slate-400 uppercase">Negative (44.4%)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-slate-300 font-bold text-base block">69</span>
              <span className="text-[10px] text-slate-400 uppercase">True Neutral (2.8%)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <span className="text-slate-500 font-bold text-base block">3,914</span>
              <span className="text-[10px] text-slate-400 uppercase">Unclassified</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-slate-300">
            <strong>Honest Academic Defense:</strong> The baseline script covered only 38.4% of unique US videos because the remaining titles contained no AFINN dictionary words. TrendScope explicitly documents this and distinguishes unclassified titles from neutral ones.
          </div>
        </div>
      ),
      talkingPoints: [
        "Explain that the dataset contains video titles, NOT viewer comments.",
        "Emphasize the distinction between true neutral (sum of scores equals zero) and unclassified (no lexicon terms).",
        "Disclose that AFINN is an English dictionary and does not apply directly to Cyrillic or Asian scripts."
      ]
    },
    {
      id: 9,
      title: "9. Machine Learning Suite: Predictive Models & Clustering",
      subtitle: "5 genuinely trained models with chronological validation and zero data leakage",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block mb-1">Model 1: Trend Continuation Prediction</span>
              <p className="text-slate-300">Binary classification estimating if video reappears tomorrow. Random Forest achieves <strong>81.6% Accuracy</strong> and <strong>0.876 ROC-AUC</strong> on out-of-sample test dates.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-cyan-500/30">
              <span className="text-cyan-400 font-bold block mb-1">Model 2: K-Means Clustering & PCA</span>
              <p className="text-slate-300">Unsupervised segmentation ($k=4$) identifying 4 operational content archetypes with 2D PCA projection.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-purple-500/30">
              <span className="text-purple-400 font-bold block mb-1">Model 3: Category ARIMA Forecasting</span>
              <p className="text-slate-300">30-day out-of-sample time-series forecast with confidence bands and 8.5% sMAPE error.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-amber-500/30">
              <span className="text-amber-400 font-bold block mb-1">Model 4 & 5: Isolation Forest & Topics</span>
              <p className="text-slate-300">Isolates viral and controversial outliers ($\nu=0.03$), and extracts 6 semantic topics via TF-IDF + NMF.</p>
            </div>
          </div>
        </div>
      ),
      talkingPoints: [
        "State proudly that all models are genuinely trained and evaluated on real data (no hardcoded metrics).",
        "Explain chronological validation: avoiding future leakage by splitting on calendar dates.",
        "Demonstrate the interactive live prediction tool where evaluators can test custom inputs."
      ]
    },
    {
      id: 10,
      title: "10. Key Findings, Limitations & Conclusion",
      subtitle: "Summary of empirical takeaways and academic conclusions",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm block">Key Analytical Findings:</span>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>Music and Entertainment dominate unique reach (&gt;70% of global views).</li>
                <li>Gaming and Comedy generate the highest engagement rates per view (&gt;6%).</li>
                <li>Territorial turnover differs fundamentally: low churn in UK/US vs high churn in France/Germany.</li>
                <li>Prior trending history is the strongest single predictor of tomorrow's trending survival.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <span className="text-amber-400 font-bold text-sm block">Acknowledged Limitations:</span>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>Dataset covers Nov 2017 – Jun 2018 (historical snapshot).</li>
                <li>No actual comment text (only title text and comment volume).</li>
                <li>Trending algorithm is proprietary to YouTube and subject to external editorial curation.</li>
                <li>AFINN lexicon is English-oriented.</li>
              </ul>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-slate-200">
            <strong>Conclusion:</strong> TrendScope successfully elevates the baseline R script into a complete, academically defensible YouTube intelligence platform, correcting severe mathematical flaws and integrating cutting-edge machine learning.
          </div>
        </div>
      ),
      talkingPoints: [
        "Summarize the findings concisely for the evaluation committee.",
        "State the limitations clearly—evaluators value academic self-awareness.",
        "Conclude by asking the committee if they would like to test any specific module or live model."
      ]
    }
  ];

  const current = slides[currentSlide - 1];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Slide Navigation Header */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <GraduationCap className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">Teacher / Defense Presentation Mode</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Slide {currentSlide} of {totalSlides}
              </span>
            </div>
            <p className="text-xs text-slate-400">Curated pedagogical walkthrough for project viva and panel review</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
            disabled={currentSlide === 1}
            className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Slide (or Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 px-2">
            {currentSlide} / {totalSlides}
          </span>
          <button
            onClick={() => setCurrentSlide(Math.min(totalSlides, currentSlide + 1))}
            disabled={currentSlide === totalSlides}
            className="p-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md shadow-emerald-500/20"
            title="Next Slide (or Right Arrow / Space)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Progress Indicator */}
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
          style={{ width: `${(currentSlide / totalSlides) * 100}%` }}
        ></div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-800 pb-4 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Curated Presentation Slide
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{current.title}</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{current.subtitle}</p>
          </div>

          <div className="py-2">
            {current.content}
          </div>
        </div>

        {/* Defense / Talking Points Callout for Student */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 bg-[#090d16]/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended Talking Points for Evaluator:</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {current.talkingPoints.map((tp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{tp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Slide Thumbnails Jump Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {slides.map(s => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(s.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              currentSlide === s.id
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Slide {s.id}
          </button>
        ))}
      </div>
    </div>
  );
};
