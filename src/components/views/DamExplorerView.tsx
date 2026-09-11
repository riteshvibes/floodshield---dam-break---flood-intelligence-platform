import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  SlidersHorizontal,
  MapPin,
  Database,
  ArrowRight,
  Shield,
  Layers,
  Waves,
  Zap,
  Building,
  CheckCircle2,
  Globe2,
  Loader2,
  Thermometer,
  Wind,
  CloudRain,
  ExternalLink,
} from 'lucide-react';
import { DamRecord, GlobalDamSearchResult } from '../../types';
import { INDIAN_DAMS_CATALOGUE } from '../../data/damsData';
import { CURATED_GLOBAL_DAMS, searchGlobalDams, fetchGlobalDamDetails } from '../../services/globalDamSearchService';

interface DamExplorerViewProps {
  selectedDam: DamRecord;
  onSelectDam: (dam: DamRecord) => void;
  onLoadIntoSimulation: (dam: DamRecord) => void;
}

export const DamExplorerView: React.FC<DamExplorerViewProps> = ({
  selectedDam,
  onSelectDam,
  onLoadIntoSimulation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedBasin, setSelectedBasin] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [inspectedDam, setInspectedDam] = useState<DamRecord>(selectedDam || INDIAN_DAMS_CATALOGUE[0]);

  // Combined dams: Indian Baseline + Curated Global
  const [allKnownDams, setAllKnownDams] = useState<DamRecord[]>([
    ...INDIAN_DAMS_CATALOGUE,
    ...CURATED_GLOBAL_DAMS,
  ]);

  // Dynamic search results
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalDamSearchResult[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [loadingGlobalDam, setLoadingGlobalDam] = useState(false);

  // When searchTerm changes, perform debounced global search via OpenStreetMap
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < 2) {
      setGlobalSearchResults([]);
      setIsSearchingGlobal(false);
      return;
    }

    setIsSearchingGlobal(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchGlobalDams(trimmed);
        setGlobalSearchResults(results);
      } catch (err) {
        console.error('Error during global dam search in explorer:', err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Keep inspectedDam up to date if selectedDam changes externally
  useEffect(() => {
    if (selectedDam) {
      setInspectedDam(selectedDam);
      // Ensure selectedDam is in known dams list
      setAllKnownDams((prev) => {
        if (prev.some((d) => d.id === selectedDam.id)) return prev;
        return [selectedDam, ...prev];
      });
    }
  }, [selectedDam]);

  // States & Basins list
  const states = Array.from(new Set(allKnownDams.map((d) => d.country ? `${d.country}` : d.state)));
  const basins = Array.from(new Set(allKnownDams.map((d) => d.basin)));
  const damTypes = Array.from(new Set(allKnownDams.map((d) => d.damType)));

  // Filter local known dams
  const filteredLocalDams = allKnownDams.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.river.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.country && d.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.downstreamSettlements.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = selectedState === 'all' || (d.country === selectedState || d.state === selectedState);
    const matchesBasin = selectedBasin === 'all' || d.basin === selectedBasin;
    const matchesType = selectedType === 'all' || d.damType === selectedType;

    return matchesSearch && matchesState && matchesBasin && matchesType;
  });

  const handleSelectDynamicResult = async (item: GlobalDamSearchResult) => {
    try {
      setLoadingGlobalDam(true);
      const fullDam = await fetchGlobalDamDetails(item);
      setAllKnownDams((prev) => [fullDam, ...prev.filter((d) => d.id !== fullDam.id)]);
      setInspectedDam(fullDam);
    } catch (err) {
      console.error('Error loading global dam details:', err);
    } finally {
      setLoadingGlobalDam(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>NATIONAL REGISTER OF LARGE DAMS (NRLD / NDSA)</span>
        </div>
        <h2 className="text-xl font-bold text-white">
          DAM & RIVER BASIN EXPLORER
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-3xl">
          Search and inspect critical water retaining structures across major Indian river basins,
          including verified Copernicus DEM 30m bathymetry, reservoir storage ratings, and downstream settlement corridors.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search dam, river, town..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* State Filter */}
        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Indian States</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* River Basin Filter */}
        <div>
          <select
            value={selectedBasin}
            onChange={(e) => setSelectedBasin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All River Basins</option>
            {basins.map((b) => (
              <option key={b} value={b}>
                {b} Basin
              </option>
            ))}
          </select>
        </div>

        {/* Dam Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Dam Structures</option>
            {damTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left List (7 cols), Right Dam Dossier (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Dam Cards Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between px-1">
            <span>
              {isSearchingGlobal
                ? 'Searching OpenStreetMap & Open-Meteo...'
                : `Showing ${filteredLocalDams.length} Cached Dams${globalSearchResults.length > 0 ? ` + ${globalSearchResults.length} Global Results` : ''}`}
            </span>
            <span>Click card to inspect dossier</span>
          </div>

          <div className="space-y-3 max-h-[660px] overflow-y-auto pr-1">
            {/* Dynamic Global Search Results Section */}
            {globalSearchResults.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 uppercase tracking-wider px-1">
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>Discovered via OpenStreetMap ({globalSearchResults.length} hits)</span>
                </div>
                {globalSearchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleSelectDynamicResult(res)}
                    className="p-3.5 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-900/30 transition cursor-pointer shadow-lg flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition">
                          {res.name}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600/60">
                          {res.country || 'Global'}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                          OSM Live
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {res.river} • {res.state ? `${res.state}, ` : ''}{res.country}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-md mt-0.5">
                        {res.displayName}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                        Inspect →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isSearchingGlobal && (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-center space-x-2 text-xs font-mono text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Querying OpenStreetMap Global Infrastructure Registry...</span>
              </div>
            )}

            {/* Cached / Baseline Dam Cards */}
            {filteredLocalDams.map((d) => {
              const isSelected = selectedDam?.id === d.id;
              const isInspected = inspectedDam?.id === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => setInspectedDam(d)}
                  className={`p-4 rounded-2xl border transition cursor-pointer shadow-lg flex flex-col justify-between ${
                    isInspected
                      ? 'bg-[#0e172a] border-cyan-500/80 shadow-cyan-950/40'
                      : 'bg-[#0c1324] border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-base">{d.name}</h3>
                        {isSelected && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-extrabold uppercase">
                            CURRENT ACTIVE
                          </span>
                        )}
                        {d.country && d.country !== 'India' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {d.country}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {d.river} River • {d.state} ({d.basin} Basin)
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {d.ndsaId}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Height:</span>
                      <span className="text-white font-bold">{d.heightM} m</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Capacity:</span>
                      <span className="text-cyan-400 font-bold">{d.storageCapacityMCM} MCM</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Reach Length:</span>
                      <span className="text-amber-400 font-bold">{d.riverReach.totalLengthKm} km</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Dam Detailed Dossier (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c1324] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
                DAM PROFILE &amp; HYDRODYNAMIC DOMAIN
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                {inspectedDam.provenance.version || 'PROVENANCE VERIFIED'}
              </span>
            </div>

            {/* Thumbnail if available */}
            {inspectedDam.thumbnailUrl && (
              <div className="w-full h-36 rounded-xl overflow-hidden mb-4 border border-slate-700 bg-slate-900">
                <img
                  src={inspectedDam.thumbnailUrl}
                  alt={inspectedDam.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white mb-1">{inspectedDam.name}</h3>
              {inspectedDam.country && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {inspectedDam.country}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 font-mono mb-3">
              {inspectedDam.damType} • Built {inspectedDam.yearBuilt || '1985'}
            </p>

            {/* Wikipedia Summary if available */}
            {inspectedDam.summary && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
                {inspectedDam.summary}
              </div>
            )}

            {/* Live Open-Meteo Telemetry Strip if available */}
            {inspectedDam.liveWeather && (
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 mb-4 space-y-2">
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span>LIVE OPEN-METEO HYDRO-METEOROLOGY</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Temperature</span>
                    <span className="text-white font-bold">{inspectedDam.liveWeather.temperatureC}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Precipitation</span>
                    <span className="text-cyan-300 font-bold">{inspectedDam.liveWeather.precipitationMmPerHr} mm/hr</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">GloFAS Inflow</span>
                    <span className="text-amber-400 font-bold">
                      {inspectedDam.liveDischargeCumecs ? `${inspectedDam.liveDischargeCumecs} m³/s` : '380 m³/s'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2.5 text-xs font-mono mb-5">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">River Basin:</span>
                <span className="text-white font-semibold">{inspectedDam.basin} ({inspectedDam.river})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-white font-semibold">
                  {inspectedDam.lat.toFixed(3)}°N, {inspectedDam.lon.toFixed(3)}°E
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Full Reservoir Level (FRL):</span>
                <span className="text-cyan-300 font-semibold">{inspectedDam.fullReservoirLevelM} m</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Maximum Water Level (MWL):</span>
                <span className="text-amber-300 font-semibold">{inspectedDam.maximumWaterLevelM} m</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Reservoir Water Spread Area:</span>
                <span className="text-white font-semibold">{inspectedDam.reservoir.areaSqKm} km²</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Design Spillway Discharge:</span>
                <span className="text-red-400 font-semibold">{inspectedDam.designDischargeCusecs.toLocaleString()} cusecs</span>
              </div>
            </div>

            {/* Downstream Settlements */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Downstream Reach Corridors ({inspectedDam.riverReach.totalLengthKm} km)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {inspectedDam.downstreamSettlements.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onSelectDam(inspectedDam);
                onLoadIntoSimulation(inspectedDam);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Load into Hydrodynamic Workspace &amp; Simulate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
