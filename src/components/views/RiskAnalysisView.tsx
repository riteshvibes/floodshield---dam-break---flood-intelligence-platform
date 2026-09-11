import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Layers,
  Activity,
  Gauge,
  Clock,
  Users,
  Building,
  CheckCircle,
} from 'lucide-react';
import { DamRecord, SimulationResultManifest } from '../../types';
import { AnimatedCounter } from '../AnimatedCounter';

interface RiskAnalysisViewProps {
  dam: DamRecord;
  results: SimulationResultManifest | null;
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({ dam, results }) => {
  const riskTiers = [
    {
      category: 'CRITICAL',
      color: 'border-red-500 bg-red-950/40 text-red-300',
      badge: 'bg-red-500 text-slate-950',
      depth: '> 3.0 m',
      velocity: '> 2.5 m/s',
      arrival: '< 30 min',
      exposure: '42,800 residents',
      infrastructure: 'Bridges submerged, power substation offline',
      areaSqKm: ((results?.totalInundationAreaSqKm || 48.6) * 0.22).toFixed(1),
      description: 'Zero reaction buffer. Rapid structural collapse and vehicle displacement.',
    },
    {
      category: 'HIGH',
      color: 'border-orange-500 bg-orange-950/40 text-orange-300',
      badge: 'bg-orange-500 text-slate-950',
      depth: '1.8 – 3.0 m',
      velocity: '1.5 – 2.5 m/s',
      arrival: '30 – 60 min',
      exposure: '28,400 residents',
      infrastructure: 'Ground floor submersion, municipal clinic cut off',
      areaSqKm: ((results?.totalInundationAreaSqKm || 48.6) * 0.35).toFixed(1),
      description: 'Heavy residential damage. Unsafe for wading or emergency transport.',
    },
    {
      category: 'MEDIUM',
      color: 'border-blue-500 bg-blue-950/40 text-blue-300',
      badge: 'bg-blue-500 text-slate-950',
      depth: '0.8 – 1.8 m',
      velocity: '0.8 – 1.5 m/s',
      arrival: '1 – 2 hr',
      exposure: '16,200 residents',
      infrastructure: 'Agricultural lowlands, rural access roads cut off',
      areaSqKm: ((results?.totalInundationAreaSqKm || 48.6) * 0.28).toFixed(1),
      description: 'Controlled evacuation feasible via designated high-ground corridors.',
    },
    {
      category: 'LOW',
      color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300',
      badge: 'bg-cyan-500 text-slate-950',
      depth: '< 0.8 m',
      velocity: '< 0.8 m/s',
      arrival: '> 2 hr',
      exposure: '7,100 residents',
      infrastructure: 'Peripheral backwater, minimal structural risk',
      areaSqKm: ((results?.totalInundationAreaSqKm || 48.6) * 0.15).toFixed(1),
      description: 'Advisory watch zone. Water levels stabilize below habitable floor lines.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>QUANTITATIVE MULTI-CRITERIA RISK ENGINE</span>
        </div>
        <h2 className="text-xl font-bold text-white">
          FLOOD RISK ANALYSIS & EXPLAINABILITY
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-3xl">
          Transparent algorithmic risk grading synthesizing hydrodynamic flood hazard ($h \times v$),
          population density (WorldPop), critical infrastructure vulnerability, and warning reaction time.
        </p>
      </div>

      {/* Transparent Calculation Explainer: WHY THIS AREA IS HIGH RISK */}
      <div className="bg-[#0c1324] border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              WHY THIS AREA IS CLASSIFIED AS CRITICAL / HIGH RISK
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded-lg border border-cyan-500/30">
            Formula: Multi-Criteria Hazard Index (MCHI)
          </span>
        </div>

        {/* Mathematical Formulation */}
        <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 mb-5 leading-relaxed">
          <div className="text-cyan-400 font-bold mb-1">
            Hazard Score = 0.35 × (Depth Factor) + 0.25 × (Velocity Factor) + 0.20 × (Vulnerability) + 0.20 × (Urgency Factor)
          </div>
          <div className="text-slate-400 text-[11px] grid grid-cols-1 md:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-800">
            <div>• <b className="text-white">Depth ($h$):</b> High hazard when $h &gt; 1.8$m</div>
            <div>• <b className="text-white">Velocity ($v$):</b> Shear risk when $v &gt; 2.0$m/s</div>
            <div>• <b className="text-white">WorldPop:</b> Density &gt; 4,000 / km²</div>
            <div>• <b className="text-white">Reaction Time:</b> Arrival &lt; 30 min</div>
          </div>
        </div>

        {/* Breakdown of 4 transparent drivers for the current active dam */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-blue-400 mb-1 font-bold">
              <Gauge className="w-4 h-4" />
              <span>1. Flood Depth ($h$)</span>
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {results?.maxFloodDepthM || 6.8} m
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Water height substantially exceeds single-story building rooftops in low-lying thalweg sectors.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-amber-400 mb-1 font-bold">
              <Activity className="w-4 h-4" />
              <span>2. Velocity ($v$)</span>
            </div>
            <div className="text-xl font-bold text-amber-400 mb-1">
              {results?.maxFloodVelocityMs || 7.2} m/s
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              {'Hydrodynamic momentum (h × v > 12.0 m²/s) exceeds masonry structural resistance.'}
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-red-400 mb-1 font-bold">
              <Users className="w-4 h-4" />
              <span>3. Population Density</span>
            </div>
            <div className="text-xl font-bold text-red-400 mb-1">
              {results?.impact?.highRiskPopulation?.toLocaleString() || '28,400'}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              High demographic exposure concentrated in urban centers like {dam.downstreamSettlements[0]}.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-purple-400 mb-1 font-bold">
              <Clock className="w-4 h-4" />
              <span>{'4. Arrival Time (t_arr)'}</span>
            </div>
            <div className="text-xl font-bold text-purple-400 mb-1">
              {results?.earliestArrivalTimeMin || 22} min
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Severe constraint on evacuation mobilization; automated sirens and cell broadcasts required.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Risk Categories Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskTiers.map((tier) => (
          <div
            key={tier.category}
            className={`border rounded-2xl p-5 shadow-lg space-y-3 ${tier.color}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded font-mono text-xs font-extrabold uppercase ${tier.badge}`}>
                  {tier.category} RISK
                </span>
                <span className="font-mono text-xs text-slate-300">
                  {tier.areaSqKm} km² ({dam.name} Domain)
                </span>
              </div>
              <span className="text-xs font-mono font-bold">{tier.exposure}</span>
            </div>

            <p className="text-xs font-sans text-slate-200 leading-relaxed">
              {tier.description}
            </p>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">Depth Threshold:</span>
                <span className="font-bold text-white">{tier.depth}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Velocity Range:</span>
                <span className="font-bold text-white">{tier.velocity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Warning Buffer:</span>
                <span className="font-bold text-white">{tier.arrival}</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span>Infra: {tier.infrastructure}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
