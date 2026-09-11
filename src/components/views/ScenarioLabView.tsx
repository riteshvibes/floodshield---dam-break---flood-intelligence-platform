import React, { useState } from 'react';
import {
  Sliders,
  Copy,
  Plus,
  Trash2,
  GitBranch,
  Play,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { DamRecord, ScenarioConfig, FailureMode, SolverType } from '../../types';

interface ScenarioLabViewProps {
  dam: DamRecord;
  scenarios: ScenarioConfig[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onCreateScenario: (config: Partial<ScenarioConfig>) => void;
  onDeleteScenario: (id: string) => void;
  onRunSimulation: (id: string) => void;
}

export const ScenarioLabView: React.FC<ScenarioLabViewProps> = ({
  dam,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onCreateScenario,
  onDeleteScenario,
  onRunSimulation,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newBreachMode, setNewBreachMode] = useState<FailureMode>('overtopping');
  const [newSolver, setNewSolver] = useState<SolverType>('Delft3D-FM');
  const [newBreachWidth, setNewBreachWidth] = useState(250);
  const [newRainfall, setNewRainfall] = useState(30);

  const handleDuplicate = (sc: ScenarioConfig) => {
    onCreateScenario({
      name: `${sc.name} (Copy)`,
      mode: sc.mode,
      solver: sc.solver,
      initialWaterLevelM: sc.initialWaterLevelM,
      breachWidthM: sc.breachWidthM,
      breachDepthM: sc.breachDepthM,
      breachFormationTimeMin: sc.breachFormationTimeMin,
      manningRoughness: sc.manningRoughness,
      rainfallMmPerHr: sc.rainfallMmPerHr,
      simulationDurationHours: sc.simulationDurationHours,
      inflowDischargeCumecs: sc.inflowDischargeCumecs,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;

    onCreateScenario({
      name: newScenarioName,
      mode: newBreachMode,
      solver: newSolver,
      breachWidthM: newBreachWidth,
      rainfallMmPerHr: newRainfall,
      initialWaterLevelM: dam.maximumWaterLevelM,
      breachDepthM: Math.round(dam.heightM * 0.7),
      breachFormationTimeMin: 35,
      manningRoughness: 0.035,
      simulationDurationHours: 24,
      inflowDischargeCumecs: 14000,
    });

    setNewScenarioName('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <GitBranch className="w-4 h-4" />
            <span>PARAMETRIC SCENARIO MATRIX</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            SCENARIO LAB
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
            Design, duplicate, and benchmark multiple hydrologic stress-test scenarios
            varying breach geomentry, antecedent moisture, and compound monsoon inflows.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Scenario</span>
        </button>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc, idx) => {
          const isActive = sc.id === activeScenarioId;

          return (
            <div
              key={sc.id}
              className={`rounded-2xl p-5 border transition shadow-xl flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'bg-[#0f1a30] border-cyan-500/80 shadow-cyan-950/30'
                  : 'bg-[#0c1324] border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Scenario 0{idx + 1}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {isActive && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold uppercase">
                        ACTIVE RUN
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {sc.solver}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base leading-snug mb-1">{sc.name}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Mode: <span className="text-slate-200 uppercase">{sc.mode.replace('_', ' ')}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Breach Width:</span>
                    <span className="text-white font-bold">{sc.breachWidthM} m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Formation Time:</span>
                    <span className="text-white font-bold">{sc.breachFormationTimeMin} min</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Rainfall Inflow:</span>
                    <span className="text-cyan-400 font-bold">{sc.rainfallMmPerHr} mm/h</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Manning n:</span>
                    <span className="text-amber-400 font-bold">{sc.manningRoughness}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDuplicate(sc)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Duplicate Scenario"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {scenarios.length > 1 && (
                    <button
                      onClick={() => onDeleteScenario(sc.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 transition"
                      title="Delete Scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSelectScenario(sc.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                    }`}
                  >
                    {isActive ? 'Active' : 'Select'}
                  </button>
                  <button
                    onClick={() => onRunSimulation(sc.id)}
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
                    title="Run This Scenario"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Scenario Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-white mb-1 font-mono">Create Custom Scenario</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure parameters for {dam.name} on the {dam.river}.
            </p>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Scenario Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% Breach + Surcharge"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Breach Mode</label>
                <select
                  value={newBreachMode}
                  onChange={(e) => setNewBreachMode(e.target.value as FailureMode)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="overtopping">Overtopping</option>
                  <option value="piping_failure">Piping Failure</option>
                  <option value="full_breach">Full Embankment Breach</option>
                  <option value="compound_rainfall_breach">Compound Catchment Cloudburst</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Breach Width (m)</label>
                  <input
                    type="number"
                    value={newBreachWidth}
                    onChange={(e) => setNewBreachWidth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Rainfall (mm/h)</label>
                  <input
                    type="number"
                    value={newRainfall}
                    onChange={(e) => setNewRainfall(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono uppercase tracking-wider transition"
                >
                  Save & Add to Lab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
