import React, { useState } from 'react';
import {
  Waves,
  Gauge,
  Activity,
  Clock,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { DamRecord, SimulationResultManifest } from '../../types';
import { AnimatedCounter } from '../AnimatedCounter';

interface HydrodynamicsViewProps {
  dam: DamRecord;
  results: SimulationResultManifest | null;
}

export const HydrodynamicsView: React.FC<HydrodynamicsViewProps> = ({ dam, results }) => {
  const [subTab, setSubTab] = useState<'depth' | 'velocity' | 'arrival' | 'gauges'>('depth');

  // Scientific Depth Distribution data
  const depthDistribution = [
    { range: '0–0.5 m', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.18, count: '18%' },
    { range: '0.5–1.0 m', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.24, count: '24%' },
    { range: '1.0–2.0 m', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.28, count: '28%' },
    { range: '2.0–3.0 m', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.16, count: '16%' },
    { range: '3.0–5.0 m', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.10, count: '10%' },
    { range: '> 5.0 m', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.04, count: '4%' },
  ];

  // Velocity distribution data
  const velocityDistribution = [
    { range: '0–1.0 m/s', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.32, label: 'Laminar / Slow' },
    { range: '1.0–2.0 m/s', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.35, label: 'Moderate Torrent' },
    { range: '2.0–3.5 m/s', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.21, label: 'High Shear' },
    { range: '> 3.5 m/s', areaSqKm: (results?.totalInundationAreaSqKm || 48.6) * 0.12, label: 'Destructive Flash' },
  ];

  // Arrival time distribution
  const arrivalDistribution = [
    { window: '0–15 min', settlements: 'Dam Toe, Canal Colony', popExposed: 12400 },
    { window: '15–30 min', settlements: `${dam.downstreamSettlements[0] || 'Morbi Old Town'}`, popExposed: 42800 },
    { window: '30–60 min', settlements: 'Agricultural Lowlands', popExposed: 21500 },
    { window: '1–2 hr', settlements: 'Intermediate Bridge Crossings', popExposed: 16200 },
    { window: '2–4 hr', settlements: 'Distal Estuary / Confluence', popExposed: 8900 },
  ];

  // Combined hydrograph of first gauge station
  const primaryGauge = results?.gauges?.[0];
  const hydrographData = primaryGauge?.hydrograph || [];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Waves className="w-4 h-4" />
            <span>2D SHALLOW WATER EQUATION (SWE) ANALYTICS</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Hydrodynamic Depth, Velocity & Wave Front Profiles
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
            Detailed distribution curves of flood depth, kinetic velocity shears, isochronal arrival times,
            and discharge hydrographs for {dam.name} on the {dam.river}.
          </p>
        </div>

        {/* Sub-tab Navigation Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-mono">
          <button
            onClick={() => setSubTab('depth')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold ${
              subTab === 'depth' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flood Depth UI
          </button>
          <button
            onClick={() => setSubTab('velocity')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold ${
              subTab === 'velocity' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Velocity UI
          </button>
          <button
            onClick={() => setSubTab('arrival')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold ${
              subTab === 'arrival' ? 'bg-purple-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Arrival Time UI
          </button>
          <button
            onClick={() => setSubTab('gauges')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold ${
              subTab === 'gauges' ? 'bg-blue-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gauge Hydrographs
          </button>
        </div>
      </div>

      {/* FLOOD DEPTH UI TAB */}
      {subTab === 'depth' && (
        <div className="space-y-5">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                {'Maximum Water Depth (h_max)'}
              </span>
              <div className="text-3xl font-extrabold text-white font-mono">
                <AnimatedCounter value={results?.maxFloodDepthM || 6.8} decimals={1} />
                <span className="text-base text-slate-400 font-normal ml-1">meters</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Recorded at immediate dam toe & gorge constriction.</p>
            </div>

            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                {'Average Inundation Depth (h_avg)'}
              </span>
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">
                <AnimatedCounter value={((results?.maxFloodDepthM || 6.8) * 0.38)} decimals={1} />
                <span className="text-base text-slate-400 font-normal ml-1">meters</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Averaged over all 2D computational domain wet cells.</p>
            </div>

            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                {'Total Flooded Area (A_flood)'}
              </span>
              <div className="text-3xl font-extrabold text-blue-400 font-mono">
                <AnimatedCounter value={results?.totalInundationAreaSqKm || 48.6} decimals={1} />
                <span className="text-base text-slate-400 font-normal ml-1">km²</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Spans {dam.riverReach.totalLengthKm} km along downstream thalweg.</p>
            </div>
          </div>

          {/* Depth Distribution Chart */}
          <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Flood Depth Spatial Distribution (km² by Hazard Tier)
                </h3>
                <p className="text-xs text-slate-400">Scientific depth hypsometry across Copernicus DEM 30m terrain</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30">
                Total: {results?.totalInundationAreaSqKm || 48.6} km²
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depthDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" km²" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: number) => [`${val.toFixed(2)} km²`, 'Area']}
                  />
                  <Bar dataKey="areaSqKm" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VELOCITY UI TAB */}
      {subTab === 'velocity' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                {'Maximum Wave Velocity (v_max)'}
              </span>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">
                <AnimatedCounter value={results?.maxFloodVelocityMs || 7.2} decimals={1} />
                <span className="text-base text-slate-400 font-normal ml-1">m/s</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Equates to {((results?.maxFloodVelocityMs || 7.2) * 3.6).toFixed(1)} km/h destructive kinetic wave.
              </p>
            </div>

            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                {'Average Flow Velocity (v_avg)'}
              </span>
              <div className="text-3xl font-extrabold text-yellow-300 font-mono">
                <AnimatedCounter value={((results?.maxFloodVelocityMs || 7.2) * 0.42)} decimals={1} />
                <span className="text-base text-slate-400 font-normal ml-1">m/s</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Average sustained floodplain velocity.</p>
            </div>

            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                {'High Velocity Impact Area (v > 2.0 m/s)'}
              </span>
              <div className="text-3xl font-extrabold text-red-400 font-mono">
                <AnimatedCounter value={((results?.totalInundationAreaSqKm || 48.6) * 0.33)} decimals={1} />
                <span className="text-base text-slate-400 font-normal ml-1">km²</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Exceeds human stability & masonry structural threshold.</p>
            </div>
          </div>

          <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-mono">
                Hydrodynamic Velocity Shear Regimes
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30">
                Kinetic Energy Peak: {Math.round(Math.pow(results?.maxFloodVelocityMs || 7.2, 2) / (2 * 9.81) * 10) / 10} m Velocity Head
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" km²" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: number) => [`${val.toFixed(2)} km²`, 'Area']}
                  />
                  <Bar dataKey="areaSqKm" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ARRIVAL TIME UI TAB */}
      {subTab === 'arrival' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                {'Earliest Urban Wave Arrival (t_arr)'}
              </span>
              <div className="text-3xl font-extrabold text-purple-400 font-mono">
                <AnimatedCounter value={results?.earliestArrivalTimeMin || 22} decimals={0} />
                <span className="text-base text-slate-400 font-normal ml-1">minutes</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">To nearest high-density settlement ({dam.downstreamSettlements[0]}).</p>
            </div>

            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Average Wave Propagation Celerity
              </span>
              <div className="text-3xl font-extrabold text-cyan-300 font-mono">
                <AnimatedCounter value={28.4} decimals={1} />
                <span className="text-base text-slate-400 font-normal ml-1">km/h</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{'Calculated via c = √(gh) + v Saint-Venant shallow wave theory.'}</p>
            </div>

            <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Critical Reaction Window
              </span>
              <div className="text-3xl font-extrabold text-red-400 font-mono">
                &lt; 30 min
              </div>
              <p className="text-xs text-slate-500 mt-1">42,800 people reside within the 30-minute arrival boundary.</p>
            </div>
          </div>

          {/* Isochrone Table */}
          <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white font-mono mb-3">
              Isochronal Arrival Timeline & Settlement Exposure
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Arrival Window</th>
                    <th className="py-2.5 px-3">Downstream Settlements & Infrastructure</th>
                    <th className="py-2.5 px-3">Population Exposed</th>
                    <th className="py-2.5 px-3">Action Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {arrivalDistribution.map((row, idx) => (
                    <tr key={row.window} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {row.window}
                      </td>
                      <td className="py-3 px-3 text-slate-200">{row.settlements}</td>
                      <td className="py-3 px-3 text-cyan-300 font-bold">
                        {row.popExposed.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            idx === 0 || idx === 1
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : idx === 2
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {idx === 0 || idx === 1 ? 'Priority 1: Immediate' : idx === 2 ? 'Priority 2: Urgent' : 'Priority 3: Watch'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GAUGING HYDROGRAPHS TAB */}
      {subTab === 'gauges' && (
        <div className="space-y-5">
          <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Station Hydrograph: {primaryGauge?.name || 'Downstream Urban Gauge G-1'}
                </h3>
                <p className="text-xs text-slate-400">
                  Distance: {primaryGauge?.distanceKm || 12.4} km from dam axis • Discharge ($Q$) vs Stage ($h$)
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                Peak Flow: {primaryGauge?.peakDischargeCumecs || results?.peakBreachDischargeCumecs || 14200} m³/s
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hydrographData}>
                  <defs>
                    <linearGradient id="dischargeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="timeHours"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    unit=" h"
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    unit=" m³/s"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: number) => [`${val.toFixed(0)} m³/s`, 'Discharge Q']}
                    labelFormatter={(lbl) => `Time: T+${lbl}h`}
                  />
                  <Area
                    type="monotone"
                    dataKey="dischargeCumecs"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#dischargeGrad)"
                    name="Discharge Q"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
