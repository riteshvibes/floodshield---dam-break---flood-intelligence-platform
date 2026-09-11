import React from 'react';
import {
  Siren,
  AlertTriangle,
  Users,
  Building,
  Route,
  Clock,
  Shield,
  CheckCircle2,
  PhoneCall,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { DamRecord, SimulationResultManifest } from '../../types';
import { AnimatedCounter } from '../AnimatedCounter';

interface EmergencyResponseViewProps {
  dam: DamRecord;
  results: SimulationResultManifest | null;
}

export const EmergencyResponseView: React.FC<EmergencyResponseViewProps> = ({ dam, results }) => {
  const impact = results?.impact;

  const evacuationPriorityTiers = [
    {
      priority: '1 — CRITICAL',
      color: 'border-red-500 bg-red-950/30 text-red-300',
      badge: 'bg-red-500 text-slate-950',
      timing: 'Immediate Evacuation (0 – 2 Hours)',
      population: impact?.highRiskPopulation || 28400,
      zones: `${dam.downstreamSettlements[0] || 'Morbi Old Town'}, Lowland Thalweg Sectors`,
      shelters: 'High-Ground Community Stadium, Government Polytechnic College',
      routeStatus: 'PRIMARY CORRIDORS AT RISK OF CUT-OFF WITHIN 45 MIN',
    },
    {
      priority: '2 — HIGH',
      color: 'border-amber-500 bg-amber-950/30 text-amber-300',
      badge: 'bg-amber-500 text-slate-950',
      timing: 'Urgent Evacuation (2 – 6 Hours)',
      population: Math.round((impact?.populationExposed || 94500) * 0.42),
      zones: `${dam.downstreamSettlements.slice(1, 3).join(', ') || 'Downstream Riverside Wards'}`,
      shelters: 'Zilla Parishad High School, North Hilltop Transit Camp',
      routeStatus: 'Bypass NH Arterial Open; Avoid River Embankment Bridges',
    },
    {
      priority: '3 — MEDIUM',
      color: 'border-blue-500 bg-blue-950/30 text-blue-300',
      badge: 'bg-blue-500 text-slate-950',
      timing: 'Watch & Staging Advisory (6 – 12 Hours)',
      population: Math.round((impact?.populationExposed || 94500) * 0.28),
      zones: 'Distal Agricultural Hinterland & Peripheral Hamlets',
      shelters: 'District Sports Complex & Agricultural Mandi Yard',
      routeStatus: 'Corridors Currently Clear; Monitor Automated Sirens',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-red-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Siren className="w-4 h-4 animate-pulse" />
            <span>DISASTER MANAGEMENT & EVACUATION SUPPORT</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            EMERGENCY RESPONSE CENTER (EAP)
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
            Model-based actionable decision support for District Disaster Management Authorities (DDMA),
            SDRF, and NDRF relief coordination over {dam.name}.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-red-950 border border-red-500/40 text-red-300 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> STAGE: RED ALERT
          </span>
        </div>
      </div>

      {/* Prominent Operational Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs font-mono text-amber-200 flex items-start space-x-3 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white block uppercase tracking-wider mb-1">
            OPERATIONAL ADVISORY NOTICE (SIH 2026 / NTRO)
          </strong>
          These recommendations are scientific, model-based simulations derived from 2D shallow water hydrodynamic
          wave propagation equations and WorldPop demographics. They are designed for scenario planning and decision support.
          Official evacuation mandates must strictly follow authorized State Disaster Management Authority (SDMA)
          and District Collectorate orders.
        </div>
      </div>

      {/* Top 3 Metric Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Earliest Urban Wave ETA</span>
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            <AnimatedCounter value={results?.earliestArrivalTimeMin || 22} />
            <span className="text-base text-slate-400 font-normal ml-1">min</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">To nearest high-density settlement: {dam.downstreamSettlements[0]}</p>
        </div>

        <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-red-400" />
            <span>Priority 1 Population</span>
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono">
            <AnimatedCounter value={impact?.highRiskPopulation || 28400} />
          </div>
          <p className="text-xs text-slate-500 mt-1">Requires immediate vertical/horizontal transit.</p>
        </div>

        <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            <Route className="w-4 h-4 text-emerald-400" />
            <span>Compromised Arterials</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            <AnimatedCounter value={impact?.submergedRoadKm || 42.5} decimals={1} />
            <span className="text-base text-slate-400 font-normal ml-1">km</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{impact?.bridgesAtRisk || 8} river crossings inundated.</p>
        </div>
      </div>

      {/* Evacuation Priority Rankings (Priority 1, 2, 3) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          POPULATION EVACUATION STAGING PROTOCOL
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {evacuationPriorityTiers.map((tier) => (
            <div
              key={tier.priority}
              className={`rounded-2xl p-5 border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 ${tier.color}`}
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold uppercase ${tier.badge}`}>
                    PRIORITY {tier.priority}
                  </span>
                  <span className="text-xs font-mono text-white font-bold">{tier.timing}</span>
                </div>
                <div className="text-xs font-mono">
                  <span className="text-slate-400">Target Zones: </span>
                  <span className="text-white font-semibold">{tier.zones}</span>
                </div>
                <div className="text-xs font-mono">
                  <span className="text-slate-400">Recommended Muster Shelters: </span>
                  <span className="text-cyan-300">{tier.shelters}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  <span className="text-amber-400 font-bold">Route Advisory: </span>
                  {tier.routeStatus}
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center shrink-0 min-w-[160px]">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Exposed Population
                </span>
                <span className="text-2xl font-extrabold text-white font-mono">
                  <AnimatedCounter value={tier.population} />
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-1">Residents</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
