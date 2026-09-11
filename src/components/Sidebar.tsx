import React from 'react';
import {
  LayoutDashboard,
  PlaySquare,
  Map,
  ShieldAlert,
  Compass,
  Siren,
  FileText,
  BrainCircuit,
  Database,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';
import { DamRecord } from '../types';

export type NavTabId =
  | 'overview'
  | 'simulation'
  | 'flood_map'
  | 'hydrodynamics'
  | 'model_comparison'
  | 'impact_analysis'
  | 'risk_analysis'
  | 'satellite_validation'
  | 'dam_explorer'
  | 'scenario_lab'
  | 'emergency_response'
  | 'data_sources'
  | 'reports'
  | 'ai_forecast'
  | 'ml_data';

interface SidebarProps {
  activeTab?: NavTabId;
  setActiveTab?: (tab: NavTabId) => void;
  activeView?: string;
  onNavigate?: (tab: any) => void;
  isCollapsed: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  selectedDam?: DamRecord;
  isSimulating?: boolean;
}

interface NavGroup {
  label: string;
  items: {
    id: NavTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeView,
  onNavigate,
  isCollapsed,
  setIsCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  setIsMobileOpen,
  selectedDam,
  isSimulating = false,
}) => {
  const currentTab = (activeTab || activeView || 'overview') as NavTabId;
  const navigateTo = setActiveTab || onNavigate || (() => {});
  const toggleCollapse = () => {
    if (setIsCollapsed) setIsCollapsed(!isCollapsed);
    if (onToggleCollapse) onToggleCollapse();
  };
  const navGroups: NavGroup[] = [
    {
      label: 'WORKSPACE',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'ai_forecast', label: 'AI Forecast', icon: BrainCircuit, badge: 'LOCAL', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
        { id: 'ml_data', label: 'ML Data', icon: Database, badge: 'DETAILS', badgeColor: 'bg-slate-800/80 text-slate-300 border-slate-700/60' },
        {
          id: 'simulation',
          label: 'Simulations',
          icon: PlaySquare,
          badge: isSimulating ? 'RUNNING' : 'READY',
          badgeColor: isSimulating ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        },
        { id: 'flood_map', label: 'Flood Map', icon: Map },
      ],
    },
    {
      label: 'DECISIONS',
      items: [
        { id: 'risk_analysis', label: 'Risk & Exposure', icon: ShieldAlert, badge: 'REVIEW', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40' },
        { id: 'emergency_response', label: 'Response Plan', icon: Siren },
      ],
    },
    {
      label: 'REFERENCE',
      items: [
        { id: 'dam_explorer', label: 'Dam Catalogue', icon: Compass },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
    },
  ];

  const handleNavClick = (tab: NavTabId) => {
    navigateTo(tab);
    if (isMobileOpen && setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080d1a] border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm tracking-wider text-white truncate font-sans">
                FLOOD<span className="text-cyan-400">SHIELD</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight truncate">
                NTRO • Hydro Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-lg transition-all text-xs font-medium ${
                    isCollapsed
                      ? 'justify-center p-2.5'
                      : 'justify-between px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold uppercase tracking-tight shrink-0 ${
                        item.badgeColor ||
                        'bg-slate-800/80 text-slate-400 border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Active Dam Context Footer */}
      {!isCollapsed ? (
        <div className="p-3 m-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between mb-1">
            <span>SELECTED DAM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="font-bold text-white text-xs truncate">
            {selectedDam?.name || 'Machchhu-II Dam'}
          </div>
          <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
            {selectedDam?.river || 'Machchhu'} River ({selectedDam?.state || 'Gujarat'})
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Capacity:</span>
            <span className="text-cyan-300 font-bold">
              {selectedDam?.storageCapacityMCM || 110.4} MCM
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800/80 flex justify-center text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400" title={`Active: ${selectedDam?.name || 'Selected Dam'}`} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
