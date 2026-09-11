import React from 'react';
import {
  Waves,
  Gauge,
  Activity,
  Route,
  Clock,
  Users,
  ShieldAlert,
  Play,
  ArrowRight,
  Sparkles,
  MapPin,
  Building,
  Radio,
  FileText,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { DamRecord, SimulationResultManifest, CriticalAssetImpact } from '../../types';
import { MapViewer } from '../MapViewer';
import { AnimatedCounter } from '../AnimatedCounter';
import { NavTabId } from '../Sidebar';

interface OverviewViewProps {
  dam: DamRecord;
  results: SimulationResultManifest | null;
  currentTimeStepIndex?: number;
  setCurrentTimeStepIndex?: (index: number) => void;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
  showSatelliteOverlay?: boolean;
  setShowSatelliteOverlay?: (show: boolean) => void;
  onNavigateTab?: (tab: NavTabId) => void;
  onNavigate?: (tab: any) => void;
  onSelectAsset?: (asset: CriticalAssetImpact) => void;
  isSimulating?: boolean;
  onRunSimulation?: () => void;
  onOpenCatalogue?: () => void;
  onOpenLiveTelemetry?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  dam,
  results,
  currentTimeStepIndex = 3,
  setCurrentTimeStepIndex = () => {},
  isPlaying = false,
  setIsPlaying = () => {},
  showSatelliteOverlay = false,
  setShowSatelliteOverlay = () => {},
  onNavigateTab,
  onNavigate,
  onSelectAsset,
  isSimulating = false,
  onRunSimulation = () => {},
  onOpenCatalogue,
  onOpenLiveTelemetry,
}) => {
  const navigate = onNavigateTab || onNavigate || (() => {});
  const safeIndex = (currentTimeStepIndex !== undefined && results?.timeSteps && results.timeSteps[currentTimeStepIndex]) ? currentTimeStepIndex : 0;
  const currentStep = results?.timeSteps?.[safeIndex];

  return (
    <div className="space-y-5 max-w-[1800px] mx-auto">
      {/* 1. Header Hero Banner */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>LIVE FLOOD RISK WORKSPACE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.05] max-w-3xl">
              Flood risk at a glance
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Review the current dam, understand downstream impact, and run a clear flood scenario
              from one workspace.
            </p>
            {onOpenCatalogue && (
              <button
                onClick={onOpenCatalogue}
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Change selected dam
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 xl:max-w-[390px] xl:justify-end">
            {onOpenLiveTelemetry && (
              <button
                onClick={onOpenLiveTelemetry}
                className="px-3.5 py-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900/60 hover:border-cyan-400 text-cyan-300 text-xs font-mono transition flex items-center space-x-1.5 shadow-lg shadow-cyan-950/30"
                title="View live Open-Meteo & GloFAS river discharge telemetry"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="font-bold">Live conditions</span>
              </button>
            )}
            <button
              onClick={onRunSimulation}
              disabled={isSimulating}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider flex items-center space-x-2 transition shadow-lg ${
                isSimulating
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
                <span>{isSimulating ? 'Running scenario...' : 'Run scenario'}</span>
            </button>
            <button
              onClick={() => navigate('simulation')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-mono transition flex items-center space-x-1.5"
            >
              <span>Simulation settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Map & Live Situation Split (65% Map, 35% Live Situation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Large Hero Map Container (7-8 cols on large screens) */}
        <div className="lg:col-span-8 min-h-[420px] h-[clamp(420px,58vh,660px)] flex flex-col min-w-0">
          <MapViewer
            dam={dam}
            results={results}
            currentTimeStepIndex={currentTimeStepIndex}
            setCurrentTimeStepIndex={setCurrentTimeStepIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            showSatelliteOverlay={showSatelliteOverlay}
            setShowSatelliteOverlay={setShowSatelliteOverlay}
            onSelectAsset={onSelectAsset}
          />
        </div>

        {/* Live Situation Side Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Main Situation Box */}
          <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                    CURRENT SITUATION
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/40 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> RISK: CRITICAL
                </span>
              </div>

              {/* Dam & Model Parameters Matrix */}
              <div className="space-y-2.5 text-xs font-mono mb-5">
                <div className="flex justify-between py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">Selected dam:</span>
                  <span className="text-white font-bold">{dam.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">River:</span>
                  <span className="text-cyan-300 font-semibold">{dam.river} ({dam.riverReach.totalLengthKm} km)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">Scenario:</span>
                  <span className="text-amber-300 font-semibold uppercase">Overtopping</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">Model:</span>
                  <span className="text-indigo-300 font-semibold">{results?.solverUsed || 'Delft3D-FM'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    READY
                  </span>
                </div>
              </div>

              {/* Dynamic Hydraulic Readouts for Current Time Step */}
              <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs font-mono">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Snapshot at T + {currentStep?.timeHours.toFixed(1) || '0.0'}h
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400">Inundated Area:</span>
                    <div className="text-lg font-bold text-cyan-400">
                      <AnimatedCounter value={currentStep?.inundatedAreaSqKm || 0} decimals={1} />
                      <span className="text-xs text-slate-400 font-normal ml-1">km²</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Maximum Depth:</span>
                    <div className="text-lg font-bold text-white">
                      <AnimatedCounter value={currentStep?.maxDepthM || 0} decimals={1} />
                      <span className="text-xs text-slate-400 font-normal ml-1">m</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Peak Wave Velocity:</span>
                    <div className="text-lg font-bold text-amber-400">
                      <AnimatedCounter value={currentStep?.maxVelocityMs || 0} decimals={1} />
                      <span className="text-xs text-slate-400 font-normal ml-1">m/s</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Urban Impact ETA:</span>
                    <div className="text-lg font-bold text-purple-400">
                      <AnimatedCounter value={results?.earliestArrivalTimeMin || 0} decimals={0} />
                      <span className="text-xs text-slate-400 font-normal ml-1">min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Downstream Immediate Settlements Callout */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>Downstream impact area</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(dam?.downstreamSettlements || []).map((settlement, idx) => (
                  <span
                    key={settlement}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                      idx === 0
                        ? 'bg-red-950/60 text-red-300 border-red-700/60 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {settlement}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('emergency_response')}
                  className="w-full py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-300 font-mono text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Response plan</span>
                </button>
                <button
                  onClick={() => navigate('flood_map')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 font-mono text-xs transition flex items-center justify-center space-x-1"
                >
                  <span>Open flood map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. New Dashboard KPI Strip with Animated Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Peak Discharge */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center space-x-1.5 text-cyan-400 text-[10px] font-mono uppercase tracking-wider mb-1">
            <Waves className="w-3.5 h-3.5" />
            <span>Peak Discharge ($Q_p$)</span>
          </div>
          <div className="text-xl font-extrabold text-cyan-400 font-mono">
            <AnimatedCounter value={results?.peakBreachDischargeCumecs || 0} />
            <span className="text-xs text-slate-400 font-normal ml-1">m³/s</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Froehlich (1995b) Formulation</div>
        </div>

        {/* Metric 2: Max Depth */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center space-x-1.5 text-blue-400 text-[10px] font-mono uppercase tracking-wider mb-1">
            <Gauge className="w-3.5 h-3.5" />
            <span>Max Water Depth</span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            <AnimatedCounter value={results?.maxFloodDepthM || 0} decimals={1} />
            <span className="text-xs text-slate-400 font-normal ml-1">m</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Thalweg Constriction</div>
        </div>

        {/* Metric 3: Wave Velocity */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-mono uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Max Flow Velocity</span>
          </div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">
            <AnimatedCounter value={results?.maxFloodVelocityMs || 0} decimals={1} />
            <span className="text-xs text-slate-400 font-normal ml-1">m/s</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {((results?.maxFloodVelocityMs || 0) * 3.6).toFixed(1)} km/h Surge Speed
          </div>
        </div>

        {/* Metric 4: Arrival Time */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center space-x-1.5 text-purple-400 text-[10px] font-mono uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Urban Arrival Time</span>
          </div>
          <div className="text-xl font-extrabold text-purple-400 font-mono">
            <AnimatedCounter value={results?.earliestArrivalTimeMin || 0} />
            <span className="text-xs text-slate-400 font-normal ml-1">min</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            To {dam?.downstreamSettlements?.[0] || 'Downstream Settlement'}
          </div>
        </div>

        {/* Metric 5: Population Exposed */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center space-x-1.5 text-red-400 text-[10px] font-mono uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>WorldPop Exposed</span>
          </div>
          <div className="text-xl font-extrabold text-red-400 font-mono">
            <AnimatedCounter value={results?.impact?.populationExposed || 0} />
          </div>
          <div className="text-[10px] text-red-400/80 font-mono mt-0.5">
            {results?.impact?.highRiskPopulation?.toLocaleString()} High Risk
          </div>
        </div>

        {/* Metric 6: Submerged Roads */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-mono uppercase tracking-wider mb-1">
            <Route className="w-3.5 h-3.5" />
            <span>Cut-Off Corridors</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono">
            <AnimatedCounter value={results?.impact?.submergedRoadKm || 0} decimals={1} />
            <span className="text-xs text-slate-400 font-normal ml-1">km</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {results?.impact?.bridgesAtRisk} Bridges At Risk
          </div>
        </div>
      </div>
    </div>
  );
};
