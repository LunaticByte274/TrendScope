import React from 'react';
import { X, HelpCircle, CheckCircle2 } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  concept: string;
  calculation: string;
  whyItMatters: string;
  interpretation: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  concept,
  calculation,
  whyItMatters,
  interpretation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#0f172a] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Academic & Statistical Explanation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs leading-relaxed">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              What is this?
            </span>
            <p className="text-slate-300">{concept}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              How is it calculated?
            </span>
            <div className="p-2.5 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-[11px] text-slate-300">
              {calculation}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
              Why it matters:
            </span>
            <p className="text-slate-300">{whyItMatters}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              How to interpret the numbers:
            </span>
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{interpretation}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

