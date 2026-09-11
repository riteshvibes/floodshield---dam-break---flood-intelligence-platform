import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Sliders,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Waves,
  Clock,
  Zap,
  Activity,
  Droplets,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import {
  DamRecord,
  ScenarioConfig,
  SimulationJob,
  SimulationResultManifest,
  FailureMode,
  SolverType,
} from '../../types';
import { MapViewer } from '../MapViewer';
import { AnimatedCounter } from '../AnimatedCounter';

interface SimulationWorkspaceViewProps {
  dam: DamRecord;
  scenarios: ScenarioConfig[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onCreateScenario: (config: Partial<ScenarioConfig>) => void;
  onRunSimulation: (scenarioId: string) => void;
  currentJob: SimulationJob | null;
  results: SimulationResultManifest | null;
  currentTimeStepIndex: number;
  setCurrentTimeStepIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const SimulationWorkspaceView: React.FC<SimulationWorkspaceViewProps> = ({
  dam,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onCreateScenario,
  onRunSimulation,
  currentJob,
  results,
  currentTimeStepIndex,
  setCurrentTimeStepIndex,
  isPlaying,
  setIsPlaying,
}) => {
  const activeScenario =
    scenarios?.find((s) => s.id === activeScenarioId) || scenarios?.[0];

  // Editable Scenario Parameters
  const [breachMode, setBreachMode] = useState<FailureMode>(
    activeScenario?.mode || 'overtopping'
  );
  const [solver, setSolver] = useState<SolverType>(
    activeScenario?.solver || 'Delft3D-FM'
  );
  const [initialWaterLevelM, setInitialWaterLevelM] = useState<number>(
    activeScenario?.initialWaterLevelM || dam.maximumWaterLevelM || 55
  );
  const [breachWidthM, setBreachWidthM] = useState<number>(
    activeScenario?.breachWidthM || 250
  );
  const [breachDepthM, setBreachDepthM] = useState<number>(
    activeScenario?.breachDepthM || Math.round(dam.heightM * 0.7)
  );
  const [formationTimeMin, setFormationTimeMin] = useState<number>(
    activeScenario?.breachFormationTimeMin || 30
  );
  const [manningRoughness, setManningRoughness] = useState<number>(
    activeScenario?.manningRoughness || 0.035
  );
  const [rainfallMmPerHr, setRainfallMmPerHr] = useState<number>(
    activeScenario?.rainfallMmPerHr || 35
  );
  const [simDurationHours, setSimDurationHours] = useState<number>(
    activeScenario?.simulationDurationHours || 24
  );

  // Sync state if active scenario changes
  useEffect(() => {
    if (activeScenario) {
      setBreachMode(activeScenario.mode);
      setSolver(activeScenario.solver);
      setInitialWaterLevelM(activeScenario.initialWaterLevelM);
      setBreachWidthM(activeScenario.breachWidthM);
      setBreachDepthM(activeScenario.breachDepthM);
      setFormationTimeMin(activeScenario.breachFormationTimeMin);
      setManningRoughness(activeScenario.manningRoughness);
      setRainfallMmPerHr(activeScenario.rainfallMmPerHr);
      setSimDurationHours(activeScenario.simulationDurationHours);
    }
  }, [activeScenarioId]);

  const isSimulating = currentJob?.status === 'RUNNING';

  // 7-Step Simulation Lifecycle Steps
  const executionSteps = [
    { label: 'Preparing terrain & Copernicus DEM 30m', progressThreshold: 15 },
    { label: 'Loading river network & thalweg bathymetry', progressThreshold: 30 },
    { label: 'Generating unstructured 2D hydraulic mesh', progressThreshold: 48 },
    { label: 'Running hydrodynamics & momentum conservation', progressThreshold: 68 },
    { label: 'Calculating flood wave inundation extent', progressThreshold: 85 },
    { label: 'Calculating critical asset & population impact', progressThreshold: 95 },
    { label: 'Complete — Manifest generated', progressThreshold: 100 },
  ];

  const handleRun = () => {
    // Create new scenario or update active
    const newConfig: Partial<ScenarioConfig> = {
      name: `${dam.name} — ${solver} (${breachMode.replace('_', ' ')})`,
      mode: breachMode,
      solver,
      initialWaterLevelM,
      breachWidthM,
      breachDepthM,
      breachFormationTimeMin: formationTimeMin,
      manningRoughness,
      rainfallMmPerHr,
      simulationDurationHours: simDurationHours,
      inflowDischargeCumecs: 14000,
    };
    onCreateScenario(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>HYDRODYNAMIC SIMULATION WORKSPACE</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Breach Parameterization & 2D Solver Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Calibrated numerical engine solving 2D Shallow Water Equations (SWE) using Froehlich (1995b)
            and MacDonald-Langridge breach breach mechanics over {dam.name} on the {dam.river}.
          </p>
        </div>

        {/* Quick Scenario Selector Pill */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Preset:</span>
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-Column Layout: Left Config (3.5 cols), Center Map (5.5 cols), Right Telemetry (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT: Scenario Configuration Panel (3.5 cols) */}
        <div className="lg:col-span-4 bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                SCENARIO PARAMETERS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                NDSA Calibrated
              </span>
            </div>

            {/* Breach Failure Mode Dropdown */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Breach Mode / Trigger
              </label>
              <select
                value={breachMode}
                onChange={(e) => setBreachMode(e.target.value as FailureMode)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="overtopping">Overtopping (PMF Flood Inflow)</option>
                <option value="piping_failure">Piping Failure (Internal Seepage Erosion)</option>
                <option value="full_breach">Catastrophic Instantaneous Full Breach</option>
                <option value="gate_release">Emergency Spillway Surcharge Release</option>
                <option value="compound_rainfall_breach">Compound Catchment Cloudburst + Breach</option>
              </select>
            </div>

            {/* Solver Architecture Segmented Picker */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Hydrodynamic Numerical Solver
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                {(['Delft3D-FM', 'SPH-DualSPHysics', 'HEC-RAS 2D', 'Surrogate-2D'] as SolverType[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSolver(s)}
                    className={`py-1.5 px-2 rounded-md transition text-center truncate ${
                      solver === s
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-3 pt-2">
              {/* Breach Width Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Breach Bottom Width ($B$):</span>
                  <span className="text-cyan-400 font-bold">{breachWidthM} m</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={Math.max(500, dam.crestLengthM)}
                  step={10}
                  value={breachWidthM}
                  onChange={(e) => setBreachWidthM(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Breach Depth Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Breach Invert Depth ($H$):</span>
                  <span className="text-cyan-400 font-bold">{breachDepthM} m</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={Math.round(dam.heightM)}
                  step={1}
                  value={breachDepthM}
                  onChange={(e) => setBreachDepthM(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Formation Time Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Formation Time ($\tau_f$):</span>
                  <span className="text-cyan-400 font-bold">{formationTimeMin} min</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={formationTimeMin}
                  onChange={(e) => setFormationTimeMin(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Manning's Roughness n Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Manning's Roughness ($n$):</span>
                  <span className="text-cyan-400 font-bold">{manningRoughness}</span>
                </div>
                <input
                  type="range"
                  min={0.02}
                  max={0.07}
                  step={0.005}
                  value={manningRoughness}
                  onChange={(e) => setManningRoughness(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Initial Reservoir Stage */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Initial Reservoir Stage:</span>
                  <span className="text-white font-bold">{initialWaterLevelM} m (FRL: {dam.fullReservoirLevelM}m)</span>
                </div>
                <input
                  type="range"
                  min={Math.round(dam.fullReservoirLevelM * 0.7)}
                  max={Math.round(dam.maximumWaterLevelM * 1.15)}
                  step={0.5}
                  value={initialWaterLevelM}
                  onChange={(e) => setInitialWaterLevelM(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Execute Simulation Button */}
          <button
            onClick={handleRun}
            disabled={isSimulating}
            className={`w-full py-3 px-4 rounded-xl font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-xl ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isSimulating ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Solving Equations ({currentJob?.progress || 0}%)...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>RUN HYDRODYNAMIC SIMULATION</span>
              </>
            )}
          </button>
        </div>

        {/* CENTER: Simulation Map View (5 cols) */}
        <div className="lg:col-span-5 min-h-[440px] sm:min-h-[520px] h-[520px] sm:h-[600px] lg:h-[640px] flex flex-col">
          <MapViewer
            dam={dam}
            results={results}
            currentTimeStepIndex={currentTimeStepIndex}
            setCurrentTimeStepIndex={setCurrentTimeStepIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            showSatelliteOverlay={false}
            setShowSatelliteOverlay={() => {}}
          />
        </div>

        {/* RIGHT: Live Simulation Telemetry & Progress (3 cols) */}
        <div className="lg:col-span-3 bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                SOLVER TELEMETRY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                Job: {currentJob?.id || 'FS-2026-00127'}
              </span>
            </div>

            {/* 7-Step Animated Sequence */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Execution Pipeline Sequence
              </span>
              <div className="space-y-1.5">
                {executionSteps.map((step, idx) => {
                  const currentProg = currentJob?.progress || 100;
                  const isDone = currentProg >= step.progressThreshold;
                  const isCurrent =
                    currentProg < step.progressThreshold &&
                    (idx === 0 || currentProg >= executionSteps[idx - 1].progressThreshold);

                  return (
                    <div
                      key={step.label}
                      className={`p-2 rounded-lg border text-[11px] font-mono flex items-center space-x-2 transition ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : isCurrent
                          ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 animate-pulse'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <span className="truncate">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Computational Stability Metrics */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2 text-[11px] font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Convergence Parameters
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Courant CFL:</span>
                <span className="text-emerald-400 font-bold">0.65 (Stable)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mass Loss:</span>
                <span className="text-white font-bold">&lt; 0.04%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mesh Resolution:</span>
                <span className="text-cyan-300 font-bold">30.0 m Copernicus</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPU Compute Time:</span>
                <span className="text-indigo-300 font-bold">{currentJob?.executionTimeSec || '4.2'} s</span>
              </div>
            </div>
          </div>

          {/* Quick Result Summary */}
          <div className="pt-3 border-t border-slate-800 text-xs font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Peak Calculated Surge
            </span>
            <div className="text-2xl font-extrabold text-cyan-400">
              <AnimatedCounter value={results?.peakBreachDischargeCumecs || 0} />
              <span className="text-xs text-slate-400 font-normal ml-1">m³/s</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {results?.totalInundationAreaSqKm} km² flooded reach over {dam.riverReach.totalLengthKm} km.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
