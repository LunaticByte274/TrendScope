import React from 'react';
import { 
  LayoutDashboard, 
  Flame, 
  Layers, 
  HeartHandshake, 
  Smile, 
  Globe2, 
  Tv2, 
  Table2, 
  BrainCircuit, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed
}) => {
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard, badge: 'Live' },
    { id: 'trending', label: 'Trending Explorer', icon: Flame },
    { id: 'categories', label: 'Category Intelligence', icon: Layers },
    { id: 'engagement', label: 'Engagement Lab', icon: HeartHandshake },
    { id: 'sentiment', label: 'Sentiment Intelligence', icon: Smile },
    { id: 'countries', label: 'Global Comparison', icon: Globe2, badge: '10 Countries' },
    { id: 'creators', label: 'Creator Analytics', icon: Tv2 },
    { id: 'videos', label: 'Video Data Explorer', icon: Table2 },
    { id: 'predictive', label: 'Predictive Studio', icon: BrainCircuit, badge: '5 ML Models' }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen z-40 bg-[#060911] border-r border-[#1e293b] transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1e293b]">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">TrendScope</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[170px]">YouTube Trend Intelligence</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors ml-auto"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {!collapsed ? "Analytics Modules" : "•"}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-slate-800/90 text-white font-semibold border border-slate-700/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? 'text-emerald-400' : 'text-slate-400'
              }`} />
              
              {!collapsed && (
                <span className="truncate text-left flex-1">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dataset Footnote */}
      {!collapsed && (
        <div className="p-4 border-t border-[#1e293b] bg-[#070b14]/70">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-slate-300">2026 Trend Intelligence</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            361,424 cleaned records spanning 10 territories (Apr 2026 – Nov 2026).
          </p>
        </div>
      )}
    </aside>
  );
};

