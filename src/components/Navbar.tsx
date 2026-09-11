import React from 'react';
import {
  ShieldAlert,
  Database,
  Layers,
  Activity,
  Satellite,
  GitCompare,
  FileDown,
  Server,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { DamRecord } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDam: DamRecord;
  onOpenDamCatalogue: () => void;
  onOpenDataHealth: () => void;
  isSimulating: boolean;
  simulationProgress: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedDam,
  onOpenDamCatalogue,
  onOpenDataHealth,
  isSimulating,
  simulationProgress,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Problem Statement Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider text-white">FLOODSHIELD</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  SIH 2026 • NTRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono leading-none truncate max-w-[280px] sm:max-w-xs">
                Hydrodynamic Dam-Break Intelligence & SAR Validation
              </p>
            </div>
          </div>

          {/* Dam Selector Pill (Real Indian Dam Provenance) */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onOpenDamCatalogue}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition text-left text-xs text-slate-200 group"
              title="Click to change Indian Dam asset"
            >
              <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-semibold text-white flex items-center gap-1">
                  <span>{selectedDam.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">({selectedDam.state})</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  NDSA: {selectedDam.ndsaId} • {selectedDam.river}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('mission_control')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'mission_control'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Mission Control</span>
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'scenarios'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Scenarios</span>
            </button>

            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'impact'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Impact & Exposure</span>
            </button>

            <button
              onClick={() => setActiveTab('satellite')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'satellite'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Satellite className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">SAR Validation</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden lg:inline">Compare</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'reports'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export GIS</span>
            </button>

            {/* Data Health & Provenance Indicator Button */}
            <button
              onClick={onOpenDataHealth}
              className="p-2 rounded-md text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition flex items-center space-x-1"
              title="Data Provenance & System Health"
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </nav>
        </div>
      </div>

      {/* Real-time simulation progress bar strip */}
      {isSimulating && (
        <div className="w-full bg-slate-800 h-1 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${simulationProgress}%` }}
          />
        </div>
      )}
    </header>
  );
};
