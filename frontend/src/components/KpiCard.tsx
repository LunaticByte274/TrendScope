import React, { useState } from 'react';
import { LucideIcon, Info } from 'lucide-react';
import { InfoModal } from './InfoModal';

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  subLabel?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'neutral';
  color?: 'emerald' | 'cyan' | 'purple' | 'amber';
  info?: {
    concept: string;
    calculation: string;
    whyItMatters: string;
    interpretation: string;
  };
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subValue,
  subLabel,
  icon: Icon,
  badge,
  badgeType = 'neutral',
  color = 'emerald',
  info
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const colorStyles = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  }[color];

  const badgeStyles = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  }[badgeType];

  return (
    <>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 hover:border-slate-600/80 transition-all duration-200 relative group shadow-sm">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium text-slate-400">{label}</span>
          <div className="flex items-center gap-1.5">
            {info && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800/80 transition-colors"
                title="View statistical explanation"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${colorStyles}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
          {badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
              {badge}
            </span>
          )}
        </div>

        {(subValue || subLabel) && (
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>{subLabel}</span>
            <span className="font-semibold text-slate-300 font-mono">{subValue}</span>
          </div>
        )}
      </div>

      {info && (
        <InfoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={label}
          concept={info.concept}
          calculation={info.calculation}
          whyItMatters={info.whyItMatters}
          interpretation={info.interpretation}
        />
      )}
    </>
  );
};

