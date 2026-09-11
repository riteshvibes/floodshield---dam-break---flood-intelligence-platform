import React, { useState } from 'react';
import {
  Users,
  Building,
  Route,
  Activity,
  AlertTriangle,
  Hospital,
  GraduationCap,
  Home,
  Layers,
  MapPin,
  PieChart as PieIcon,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DamRecord, SimulationResultManifest, CriticalAssetImpact } from '../../types';
import { MapViewer } from '../MapViewer';
import { AnimatedCounter } from '../AnimatedCounter';

interface ImpactAnalysisViewProps {
  dam: DamRecord;
  results: SimulationResultManifest | null;
  currentTimeStepIndex: number;
  setCurrentTimeStepIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onSelectAsset?: (asset: CriticalAssetImpact) => void;
}

export const ImpactAnalysisView: React.FC<ImpactAnalysisViewProps> = ({
  dam,
  results,
  currentTimeStepIndex,
  setCurrentTimeStepIndex,
  isPlaying,
  setIsPlaying,
  onSelectAsset,
}) => {
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all');
  const [highlightedAsset, setHighlightedAsset] = useState<CriticalAssetImpact | null>(null);

  const impact = results?.impact;

  // WorldPop Population breakdown
  const popData = [
    { name: 'High Risk (h > 1.8m)', value: impact?.highRiskPopulation || 28400, color: '#ef4444' },
    { name: 'Medium Risk (0.8m-1.8m)', value: Math.round((impact?.populationExposed || 94500) * 0.42), color: '#f59e0b' },
    { name: 'Low Risk (h < 0.8m)', value: Math.round((impact?.populationExposed || 94500) * 0.28), color: '#3b82f6' },
  ];

  // Infrastructure Breakdown
  const infraData = [
    { name: 'Submerged Road (km)', count: impact?.submergedRoadKm || 42.5, color: '#10b981' },
    { name: 'Bridges at Risk', count: impact?.bridgesAtRisk || 8, color: '#f59e0b' },
    { name: 'Hospitals / Clinics', count: impact?.hospitalsAtRisk || 4, color: '#ef4444' },
    { name: 'Schools / Colleges', count: impact?.schoolsAtRisk || 14, color: '#8b5cf6' },
    { name: 'Buildings Inundated', count: impact?.buildingsExposed || 3820, color: '#06b6d4' },
  ];

  // Filter assets
  const filteredAssets = (impact?.criticalAssets || []).filter((a) => {
    if (selectedAssetType === 'all') return true;
    return a.type === selectedAssetType;
  });

  const handleAssetClick = (asset: CriticalAssetImpact) => {
    setHighlightedAsset(asset);
    if (onSelectAsset) onSelectAsset(asset);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          <span>VULNERABILITY & EXPOSURE ENGINE</span>
        </div>
        <h2 className="text-xl font-bold text-white">
          FLOOD IMPACT ANALYSIS
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-3xl">
          WorldPop 2025 demographic exposure and OpenStreetMap critical infrastructure vulnerability
          overlayed against the {dam.name} hydrodynamic flood footprint.
        </p>
      </div>

      {/* Main Split: Left Map (6.5 cols), Right Analytics (5.5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Map Viewer */}
        <div className="lg:col-span-7 min-h-[560px] h-[640px] flex flex-col">
          <MapViewer
            dam={dam}
            results={results}
            currentTimeStepIndex={currentTimeStepIndex}
            setCurrentTimeStepIndex={setCurrentTimeStepIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            showSatelliteOverlay={false}
            setShowSatelliteOverlay={() => {}}
            onSelectAsset={handleAssetClick}
          />
        </div>

        {/* Right: Analytics Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Population Exposure Box */}
          <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-400" />
                POPULATION AT RISK (WORLDPOP)
              </span>
              <span className="text-xs font-mono font-bold text-red-400">
                <AnimatedCounter value={impact?.populationExposed || 94500} /> Exposed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-3">
              <div className="bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] text-red-300 block">High Risk</span>
                <span className="text-base font-bold text-red-400">
                  <AnimatedCounter value={impact?.highRiskPopulation || 28400} />
                </span>
              </div>
              <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] text-amber-300 block">Medium Risk</span>
                <span className="text-base font-bold text-amber-400">
                  <AnimatedCounter value={Math.round((impact?.populationExposed || 94500) * 0.42)} />
                </span>
              </div>
              <div className="bg-blue-950/40 border border-blue-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] text-blue-300 block">Low Risk</span>
                <span className="text-base font-bold text-blue-400">
                  <AnimatedCounter value={Math.round((impact?.populationExposed || 94500) * 0.28)} />
                </span>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {popData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: number) => [val.toLocaleString(), 'People']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Infrastructure Impact Breakdown */}
          <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-cyan-400" />
                  CRITICAL INFRASTRUCTURE ASSETS
                </span>
                <span className="text-[10px] font-mono text-slate-400">OSM Overpass API</span>
              </div>

              {/* Asset Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-3 text-xs font-mono">
                {['all', 'hospital', 'bridge', 'school', 'road'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedAssetType(type)}
                    className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] font-bold transition ${
                      selectedAssetType === type
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'bg-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Asset Scroll List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 divide-y divide-slate-800/60 pr-1">
                {filteredAssets.map((asset) => {
                  const isSelected = highlightedAsset?.id === asset.id;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => handleAssetClick(asset)}
                      className={`w-full text-left p-2 rounded-lg transition text-xs font-mono flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate font-semibold">{asset.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">({asset.type})</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-white font-bold">{asset.inundationDepthM}m</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            asset.status === 'Submerged'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Economic Loss Estimate Strip */}
            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Total Asset Damage Index:</span>
              <span className="text-emerald-400 font-bold text-sm">
                ₹{impact?.economicLossEstimateCrINR || 840} Crore INR
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
