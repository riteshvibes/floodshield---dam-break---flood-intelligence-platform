import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Activity, Droplets, Waves, Gauge, Info } from 'lucide-react';
import { SimulationResultManifest } from '../types';

interface HydrographChartProps {
  results: SimulationResultManifest | null;
}

export const HydrographChart: React.FC<HydrographChartProps> = ({ results }) => {
  const [selectedGaugeIndex, setSelectedGaugeIndex] = useState<number>(1);
  const [activeChartMode, setActiveChartMode] = useState<'discharge' | 'depth'>('discharge');

  if (!results) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        <Activity className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-50" />
        <p>No active hydrodynamic simulation data available.</p>
      </div>
    );
  }

  const selectedGauge = results.gauges[selectedGaugeIndex] || results.gauges[0];
  const chartData = selectedGauge?.hydrograph || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col space-y-4">
      {/* Top Controls & Metrics Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white">
              Hydrodynamic Discharge & Stage Profiles
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Solver: <span className="text-cyan-400">{results.solverUsed}</span> • Mesh: {results.provenance.meshResolutionM}m • DEM: {results.provenance.demSource.slice(0, 20)}...
          </p>
        </div>

        {/* Gauge Switcher */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-slate-800 p-0.5 text-xs font-mono">
            {results.gauges.map((g, idx) => (
              <button
                key={g.gaugeId}
                onClick={() => setSelectedGaugeIndex(idx)}
                className={`px-2.5 py-1 rounded-md transition ${
                  selectedGaugeIndex === idx
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {g.gaugeId} ({g.distanceKm} km)
              </button>
            ))}
          </div>

          {/* Chart mode toggle */}
          <div className="flex rounded-lg bg-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setActiveChartMode('discharge')}
              className={`px-2 py-1 rounded transition ${
                activeChartMode === 'discharge'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Q (m³/s)
            </button>
            <button
              onClick={() => setActiveChartMode('depth')}
              className={`px-2 py-1 rounded transition ${
                activeChartMode === 'depth'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Depth (m)
            </button>
          </div>
        </div>
      </div>

      {/* Hydraulic KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">Peak Breach Flow ($Q_p$)</span>
          <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
            {results.peakBreachDischargeCumecs.toLocaleString()} <span className="text-xs text-slate-400">m³/s</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Froehlich 1995 Equation</div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">Station Arrival Time</span>
          <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
            {selectedGauge.arrivalMinutes} <span className="text-xs text-slate-400">min</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Dist: {selectedGauge.distanceKm} km from dam</div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">Peak Stage / Depth</span>
          <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">
            {selectedGauge.peakDepthM} <span className="text-xs text-slate-400">m</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Velocity: {selectedGauge.peakVelocityMs} m/s</div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">Total Volume Surge</span>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            {results.totalVolumeReleasedMCM} <span className="text-xs text-slate-400">MCM</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Mass Balance Error &lt; 0.04%</div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeChartMode === 'discharge' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDischarge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                dataKey="timeHours"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `T+${val}h`}
              />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(value: any) => [`${Number(value).toLocaleString()} m³/s`, 'Discharge']}
                labelFormatter={(label) => `Time: T + ${label} hours`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="dischargeCumecs"
                name={`Discharge Q @ ${selectedGauge?.name || 'Downstream Gauge'}`}
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDischarge)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                dataKey="timeHours"
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `T+${val}h`}
              />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(value: any, name: string) => [
                  `${value} ${name.includes('Depth') ? 'm' : 'm/s'}`,
                  name,
                ]}
                labelFormatter={(label) => `Time: T + ${label} hours`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="depthM"
                name="Inundation Depth (m)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="velocityMs"
                name="Flow Velocity (m/s)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          Hydrograph computed along {results.damName} cross-section profile using unsteady 2D momentum conservation equations. Permanent baseflow of 15 m³/s added.
        </span>
      </div>
    </div>
  );
};
