import React from 'react';
import {
  GitCompare,
  TrendingUp,
  Clock,
  Waves,
  Users,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { ScenarioConfig, DamRecord, SimulationResultManifest } from '../types';
import { calculateBreachHydrodynamics } from '../services/hydroEngine';

interface ScenarioComparisonModalProps {
  dam: DamRecord;
  scenarios: ScenarioConfig[];
  activeResults: SimulationResultManifest | null;
  onSelectAndRun: (scenarioId: string) => void;
}

export const ScenarioComparisonModal: React.FC<ScenarioComparisonModalProps> = ({
  dam,
  scenarios,
  activeResults,
  onSelectAndRun,
}) => {
  // Pre-calculate comparison metrics for all scenarios
  const comparisons = scenarios.map((sc) => {
    const hydro = calculateBreachHydrodynamics(dam, sc);
    const estArrivalMin = Math.round(
      (4.5 / (Math.max(14.0, (sc.initialWaterLevelM / 2.0) * (1 / (sc.manningRoughness * 25))))) * 60
    );
    const estAreaSqKm = Math.round((dam?.riverReach?.totalLengthKm || 30) * 1.45 * (hydro.peakDischargeCumecs / 12000) ** 0.4 * 10) / 10;
    const popMultiplier = dam?.id === 'dam_machchhu_2' ? 1420 : 640;
    const estPop = Math.round(estAreaSqKm * popMultiplier);

    return {
      scenario: sc,
      peakQ: hydro.peakDischargeCumecs,
      volumeMCM: hydro.totalVolumeReleasedMCM,
      arrivalMin: estArrivalMin,
      areaSqKm: estAreaSqKm,
      populationExposed: estPop,
    };
  });

  const maxPeakQ = Math.max(...comparisons.map((c) => c.peakQ), 1);
  const maxArea = Math.max(...comparisons.map((c) => c.areaSqKm), 1);
  const maxPop = Math.max(...comparisons.map((c) => c.populationExposed), 1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" />
            <span>Multi-Scenario Sensitivity & Risk Ranking</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Hydrodynamic Scenario Matrix Comparison
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Evaluate divergent breach assumptions: Overtopping vs Piping vs Structural Failure vs Surcharge Release.
            Compare peak hydrograph attenuation, time-to-impact, and exposed population footprint.
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {comparisons.map(({ scenario, peakQ, volumeMCM, arrivalMin, areaSqKm, populationExposed }) => {
          const isCurrentActive = activeResults?.scenarioId === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow-xl flex flex-col justify-between transition-all ${
                isCurrentActive
                  ? 'border-cyan-500 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {scenario.solver}
                  </span>
                  {isCurrentActive && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                      <Check className="w-3 h-3" /> ACTIVE SIMULATION
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base mb-1">{scenario.name}</h3>
                <div className="text-xs font-mono uppercase text-slate-400 mb-4">
                  Mode: {scenario.mode.replace('_', ' ')}
                </div>

                {/* KPI Metrics with Comparative Visual Bars */}
                <div className="space-y-3.5 text-xs font-mono">
                  {/* Peak Discharge */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Waves className="w-3.5 h-3.5 text-cyan-400" /> Peak Outflow (Q):
                      </span>
                      <span className="font-bold text-cyan-400">{peakQ.toLocaleString()} m³/s</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(peakQ / maxPeakQ) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Arrival Time */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Urban Arrival Time:
                      </span>
                      <span className="font-bold text-amber-400">{arrivalMin} minutes</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ETA at closest urban center ({dam.downstreamSettlements[0] || 'G-01'})
                    </div>
                  </div>

                  {/* Flooded Area */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Inundated Extent:
                      </span>
                      <span className="font-bold text-blue-400">{areaSqKm} km²</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(areaSqKm / maxArea) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Exposed Population */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Users className="w-3.5 h-3.5 text-red-400" /> Exposed Population:
                      </span>
                      <span className="font-bold text-red-400">{populationExposed.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(populationExposed / maxPop) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSelectAndRun(scenario.id)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    isCurrentActive
                      ? 'bg-slate-800 text-slate-300 hover:text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                  }`}
                >
                  <span>{isCurrentActive ? 'Re-run Active Solver' : 'Switch & Simulate Scenario'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
