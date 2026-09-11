import React, { useState } from 'react';
import {
  Users,
  Building,
  Route,
  Activity,
  Trees,
  Coins,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Search,
} from 'lucide-react';
import { ImpactSummary, CriticalAssetImpact } from '../types';

interface ImpactAnalyticsProps {
  impact: ImpactSummary | null;
  onSelectAsset?: (asset: CriticalAssetImpact) => void;
}

export const ImpactAnalytics: React.FC<ImpactAnalyticsProps> = ({ impact, onSelectAsset }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!impact) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />
        <p>No active simulation impact metrics found. Run a simulation to compute exposure.</p>
      </div>
    );
  }

  const filteredAssets = impact.criticalAssets.filter((asset) => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Headline Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Population Exposed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <Users className="w-4 h-4" />
            <span>WorldPop Exposed</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {impact.populationExposed.toLocaleString()}
          </div>
          <div className="text-[10px] text-red-400 font-mono mt-1">
            {impact.highRiskPopulation.toLocaleString()} High Risk (h&gt;1.8m)
          </div>
        </div>

        {/* Buildings Affected */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-mono mb-1">
            <Building className="w-4 h-4" />
            <span>Buildings at Risk</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {impact.buildingsExposed.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">OpenStreetMap Footprints</div>
        </div>

        {/* Submerged Road Corridors */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <Route className="w-4 h-4" />
            <span>Cut-Off Highways</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {impact.submergedRoadKm} <span className="text-xs text-slate-400 font-normal">km</span>
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono mt-1">Impassable &gt; 0.3m depth</div>
        </div>

        {/* Critical Health & Education Facilities */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-red-400 text-xs font-mono mb-1">
            <Activity className="w-4 h-4" />
            <span>Hospitals & Schools</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {impact.hospitalsAtRisk + impact.schoolsAtRisk}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {impact.hospitalsAtRisk} Hosp • {impact.schoolsAtRisk} Schools
          </div>
        </div>

        {/* Agricultural Submersion */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono mb-1">
            <Trees className="w-4 h-4" />
            <span>Cropland Loss</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {impact.agriculturalAreaSubmergedHa.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">ha</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-1">Dynamic World 10m</div>
        </div>

        {/* Economic Loss Estimate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono mb-1">
            <Coins className="w-4 h-4" />
            <span>Est. Disruption</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ₹{impact.economicLossEstimateCrINR.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">Cr</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Direct Infrastructure</div>
        </div>
      </div>

      {/* Evacuation & Shelter Action Zones */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">Emergency Evacuation Priorities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {impact.evacuationZones.map((zone) => (
            <div
              key={zone.zoneId}
              className={`p-4 rounded-lg border ${
                zone.urgency.includes('Immediate')
                  ? 'bg-red-950/40 border-red-800/80'
                  : zone.urgency.includes('Urgent')
                  ? 'bg-amber-950/40 border-amber-800/80'
                  : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white text-sm">{zone.name}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    zone.urgency.includes('Immediate')
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : zone.urgency.includes('Urgent')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {zone.urgency}
                </span>
              </div>
              <div className="text-xs text-slate-300 mb-2">
                Exposed Population: <b className="text-white">{zone.population.toLocaleString()}</b>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Staging Shelter: <span className="text-cyan-300">{zone.recommendedShelter}</span>
              </div>
              <div className="mt-2 text-[11px] font-mono flex items-center gap-1.5">
                {zone.evacuationRouteClear ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> High Corridor Clear
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Direct Bridge Submerged — Use Bypass
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Infrastructure Detail Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-base text-white">Critical Facilities & Infrastructure Register</h3>
            <p className="text-xs text-slate-400 font-mono">
              Hydrodynamic depth, wave arrival time (ETA), and evacuation urgency
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Types</option>
              <option value="hospital">Hospitals</option>
              <option value="bridge">Bridges</option>
              <option value="school">Schools</option>
              <option value="substation">Power Grids</option>
              <option value="community">Settlements</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Asset Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Wave ETA</th>
                <th className="py-2.5 px-3">Inundation Depth</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Evacuation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset && onSelectAsset(asset)}
                  className="hover:bg-slate-800/60 cursor-pointer transition"
                >
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    {asset.name}
                  </td>
                  <td className="py-2.5 px-3 uppercase text-cyan-400">{asset.type}</td>
                  <td className="py-2.5 px-3">{asset.distanceFromDamKm} km</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">
                    T + {asset.estimatedArrivalHours}h
                  </td>
                  <td className="py-2.5 px-3 font-bold text-blue-400">
                    {asset.inundationDepthM} m
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asset.status === 'Submerged'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : asset.status === 'Inundated'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold ${
                        asset.evacuationPriority === 'Immediate'
                          ? 'text-red-400'
                          : asset.evacuationPriority === 'High'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {asset.evacuationPriority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
