import React, { useState } from 'react';
import {
  Layers,
  Play,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Cpu,
  Droplet,
  CloudRain,
  Flame,
  Info,
} from 'lucide-react';
import { DamRecord, ScenarioConfig, SolverType, FailureMode } from '../types';

interface ScenarioBuilderProps {
  dam: DamRecord;
  scenarios: ScenarioConfig[];
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onCreateScenario: (config: Partial<ScenarioConfig>) => void;
  onRunSimulation: (scenarioId: string) => void;
  isSimulating: boolean;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  dam,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onCreateScenario,
  onRunSimulation,
  isSimulating,
}) => {
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Form State
  const [name, setName] = useState(`New Scenario — ${dam.name}`);
  const [mode, setMode] = useState<FailureMode>('overtopping');
  const [solver, setSolver] = useState<SolverType>('Delft3D-FM');
  const [initialWaterLevelM, setInitialWaterLevelM] = useState<number>(dam.maximumWaterLevelM || 60);
  const [breachWidthM, setBreachWidthM] = useState<number>(180);
  const [breachFormationTimeMin, setBreachFormationTimeMin] = useState<number>(30);
  const [breachDepthM, setBreachDepthM] = useState<number>(Math.round(dam.heightM * 0.7));
  const [manningRoughness, setManningRoughness] = useState<number>(0.035);
  const [inflowDischargeCumecs, setInflowDischargeCumecs] = useState<number>(2500);
  const [rainfallMmPerHr, setRainfallMmPerHr] = useState<number>(35);
  const [simulationDurationHours, setSimulationDurationHours] = useState<number>(24);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (breachWidthM <= 0) {
      setError('Breach width must be a positive number.');
      return;
    }
    if (breachWidthM > dam.crestLengthM) {
      setError(`Breach width (${breachWidthM}m) cannot exceed dam crest length (${dam.crestLengthM}m).`);
      return;
    }
    if (breachFormationTimeMin <= 0) {
      setError('Breach formation time must be greater than 0 minutes.');
      return;
    }
    if (initialWaterLevelM <= 0) {
      setError('Initial reservoir stage must be positive.');
      return;
    }

    onCreateScenario({
      name,
      damId: dam.id,
      mode,
      solver,
      initialWaterLevelM,
      breachWidthM,
      breachFormationTimeMin,
      breachDepthM,
      manningRoughness,
      inflowDischargeCumecs,
      rainfallMmPerHr,
      simulationDurationHours,
      outputIntervalMin: 15,
      notes,
    });

    setIsCreatingCustom(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Hydrodynamic Scenario Builder</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Dam-Break & Sudden Water Release Scenarios
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Configure hydraulic failure modes, geotechnical breach geometry, and roughness parameters.
            Submit jobs to asynchronous hydrodynamic solver workers (Delft3D-FM, HEC-RAS 2D, SPH, or Surrogate).
          </p>
        </div>

        <button
          onClick={() => setIsCreatingCustom(!isCreatingCustom)}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/20 whitespace-nowrap self-start md:self-auto"
        >
          {isCreatingCustom ? 'View Saved Scenarios' : '+ Create Custom Scenario'}
        </button>
      </div>

      {/* Custom Creation Form */}
      {isCreatingCustom ? (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">Configure New Hydraulic Run</h3>
            <p className="text-xs text-slate-400">Target Asset: {dam.name} ({dam.river})</p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Scenario Name */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-mono text-slate-300 mb-1">Scenario Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Failure Mode */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Failure Mechanism *</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as FailureMode)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="overtopping">Embankment Overtopping (Flood Surcharge)</option>
                <option value="piping_failure">Internal Piping Erosion (Seepage)</option>
                <option value="full_breach">Catastrophic Instantaneous Structural Collapse</option>
                <option value="partial_breach">Partial Breach / Spillway Gate Jam</option>
                <option value="gate_release">Controlled Emergency Spillway Release</option>
                <option value="compound_rainfall_breach">Compound: Cloudburst (100mm/h) + Breach</option>
              </select>
            </div>

            {/* Hydrodynamic Solver Selection */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Hydrodynamic Solver Engine *
              </label>
              <select
                value={solver}
                onChange={(e) => setSolver(e.target.value as SolverType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Delft3D-FM">Delft3D-FM (Deltares Unstructured 2D D-Flow)</option>
                <option value="HEC-RAS 2D">HEC-RAS 2D (USACE Finite Volume SWE)</option>
                <option value="SPH-DualSPHysics">SPH-DualSPHysics (Lagrangian Wave Impact)</option>
                <option value="Surrogate-2D">FLOODSHIELD 2D Surrogate (Fast DEM St. Venant)</option>
              </select>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {solver === 'Delft3D-FM'
                  ? 'High accuracy on curved river thalwegs and broad floodplains.'
                  : solver === 'SPH-DualSPHysics'
                  ? 'Captures violent near-dam front impact and fluid turbulence.'
                  : solver === 'HEC-RAS 2D'
                  ? 'Benchmark diffusion-wave & full momentum equations.'
                  : 'Fast physics surrogate for instant interactive exploration.'}
              </p>
            </div>

            {/* Initial Water Level */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Initial Reservoir Stage (m above bed)
              </label>
              <input
                type="number"
                step="0.1"
                value={initialWaterLevelM}
                onChange={(e) => setInitialWaterLevelM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Dam Max Water Level: {dam.maximumWaterLevelM} m
              </span>
            </div>

            {/* Breach Width */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Breach Bottom Width B (m)
              </label>
              <input
                type="number"
                value={breachWidthM}
                onChange={(e) => setBreachWidthM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Dam Crest Length: {dam.crestLengthM} m
              </span>
            </div>

            {/* Breach Formation Time */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Formation Time &tau; (minutes)
              </label>
              <input
                type="number"
                value={breachFormationTimeMin}
                onChange={(e) => setBreachFormationTimeMin(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Froehlich empirical range: 15–90 min
              </span>
            </div>

            {/* Manning's Roughness n */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Manning&apos;s Roughness Coefficient n
              </label>
              <input
                type="number"
                step="0.005"
                min="0.02"
                max="0.08"
                value={manningRoughness}
                onChange={(e) => setManningRoughness(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                0.030 (Clean channel) to 0.055 (Vegetated plain)
              </span>
            </div>

            {/* Peak Inflow */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Peak Upstream Inflow (m³/s)
              </label>
              <input
                type="number"
                value={inflowDischargeCumecs}
                onChange={(e) => setInflowDischargeCumecs(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Design Spillway Discharge: {Math.round(dam.designDischargeCusecs / 35.315)} m³/s
              </span>
            </div>

            {/* Rainfall Rate */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Catchment Rainfall Intensity (mm/h)
              </label>
              <input
                type="number"
                value={rainfallMmPerHr}
                onChange={(e) => setRainfallMmPerHr(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">IMD Monsoon Cloudburst rate</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreatingCustom(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-cyan-500/20"
            >
              Save & Register Scenario
            </button>
          </div>
        </form>
      ) : null}

      {/* Available Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isActive = sc.id === activeScenarioId;
          return (
            <div
              key={sc.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-cyan-500 ring-1 ring-cyan-500/50 shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {sc.solver}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {sc.mode.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mb-1">{sc.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {sc.notes || 'Configured hydrodynamic simulation run with terrain & hydraulic boundary parameters.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-4">
                  <div>
                    <span className="text-slate-500 text-[10px]">Breach Width:</span>
                    <div className="font-bold">{sc.breachWidthM} m</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Formation Time:</span>
                    <div className="font-bold">{sc.breachFormationTimeMin} min</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Inflow Q:</span>
                    <div className="font-bold">{sc.inflowDischargeCumecs} m³/s</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Roughness n:</span>
                    <div className="font-bold">{sc.manningRoughness}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSelectScenario(sc.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {isActive ? 'Active on Map' : 'Select'}
                </button>

                <button
                  onClick={() => onRunSimulation(sc.id)}
                  disabled={isSimulating}
                  className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                  title="Submit run to hydrodynamic worker"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Run Solver</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
