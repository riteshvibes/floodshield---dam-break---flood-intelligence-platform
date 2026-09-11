import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Check,
  ExternalLink,
  MapPin,
  Waves,
  Shield,
  Layers,
  X,
  Globe2,
  Loader2,
  CloudRain,
  Wind,
  Thermometer,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { DamRecord, GlobalDamSearchResult } from '../types';
import { INDIAN_DAMS_CATALOGUE } from '../data/damsData';
import { searchGlobalDams, fetchGlobalDamDetails, CURATED_GLOBAL_DAMS } from '../services/globalDamSearchService';

interface DamCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDamId: string;
  onSelectDam: (dam: DamRecord) => void;
}

const GLOBAL_PRESET_DAMS = [
  'Hoover Dam',
  'Three Gorges Dam',
  'Oroville Dam',
  'Itaipu Dam',
  'Aswan High Dam',
  'Kariba Dam',
  'Nurek Dam',
  'Grand Coulee Dam',
  'Vajont Dam',
  'Banqiao Dam',
];

export const DamCatalogueModal: React.FC<DamCatalogueModalProps> = ({
  isOpen,
  onClose,
  selectedDamId,
  onSelectDam,
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'national'>('global');
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');

  // Global search state
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalResults, setGlobalResults] = useState<GlobalDamSearchResult[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [loadingDamId, setLoadingDamId] = useState<string | null>(null);

  // Initialize global results with curated world dams
  useEffect(() => {
    if (!globalSearch.trim()) {
      const curatedResults: GlobalDamSearchResult[] = CURATED_GLOBAL_DAMS.map((d) => ({
        id: d.id,
        osmId: d.osmId || d.ndsaId,
        name: d.name,
        displayName: `${d.name}, ${d.river}, ${d.state}, ${d.country || 'Global'}`,
        river: d.river,
        basin: d.basin,
        country: d.country || 'Global',
        state: d.state,
        lat: d.lat,
        lon: d.lon,
        heightM: d.heightM,
        crestLengthM: d.crestLengthM,
        material: d.damType,
        yearBuilt: d.yearBuilt,
        source: 'Curated',
        importance: 0.95,
        thumbnailUrl: d.thumbnailUrl,
        summary: d.summary,
      }));
      setGlobalResults(curatedResults);
      return;
    }

    setIsSearchingGlobal(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchGlobalDams(globalSearch.trim());
        setGlobalResults(results);
      } catch (err) {
        console.error('Global search error in modal:', err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [globalSearch]);

  if (!isOpen) return null;

  const states = Array.from(new Set(INDIAN_DAMS_CATALOGUE.map((d) => d.state)));

  const filteredIndianDams = INDIAN_DAMS_CATALOGUE.filter((dam) => {
    const matchesSearch =
      dam.name.toLowerCase().includes(search.toLowerCase()) ||
      dam.river.toLowerCase().includes(search.toLowerCase()) ||
      dam.ndsaId.toLowerCase().includes(search.toLowerCase()) ||
      dam.basin.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === 'all' || dam.state === selectedState;
    return matchesSearch && matchesState;
  });

  const handleSelectGlobalDam = async (item: GlobalDamSearchResult) => {
    try {
      setLoadingDamId(item.id);
      const fullDam = await fetchGlobalDamDetails(item);
      onSelectDam(fullDam);
      onClose();
    } catch (err) {
      console.error('Failed to load global dam:', err);
    } finally {
      setLoadingDamId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">
                  Universal Dam &amp; Reservoir Catalogue
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  OpenStreetMap + Open-Meteo
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Dynamic worldwide discovery coupled with live Copernicus DEM, meteorological forecasts &amp; GloFAS river discharge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-2">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition ${
              activeTab === 'global'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>GLOBAL DAM EXPLORER (OPENSTREETMAP)</span>
          </button>
          <button
            onClick={() => setActiveTab('national')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition ${
              activeTab === 'national'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>NATIONAL BASELINE DAMS (NDSA / CWC)</span>
          </button>
        </div>

        {/* TAB 1: GLOBAL DAM EXPLORER */}
        {activeTab === 'global' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search & Preset Filter Bar */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search any dam globally by name or location (e.g. Hoover Dam, Three Gorges, Nurek, Oroville, Kariba, Vajont)..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-sans"
                />
                {globalSearch && (
                  <button
                    onClick={() => setGlobalSearch('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                <span className="text-slate-500 shrink-0 mr-1">Quick Select:</span>
                {GLOBAL_PRESET_DAMS.map((name) => (
                  <button
                    key={name}
                    onClick={() => setGlobalSearch(name)}
                    className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 shrink-0 transition"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Status Header */}
            <div className="px-5 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                {isSearchingGlobal ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span className="text-cyan-400">Querying OpenStreetMap Nominatim &amp; Open-Meteo APIs...</span>
                  </>
                ) : (
                  <span>Showing {globalResults.length} Worldwide Hydraulic Structures</span>
                )}
              </span>
              <span className="text-[11px] text-slate-500">Live 2D Delft3D mesh auto-calibrated</span>
            </div>

            {/* Results Grid */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              {globalResults.map((item) => {
                const isSelected = item.id === selectedDamId;
                const isLoading = loadingDamId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/80 ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                    }`}
                  >
                    {/* Thumbnail if available */}
                    {item.thumbnailUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-700 hidden sm:block bg-slate-900">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-white text-base">{item.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {item.country || 'Global'}
                        </span>
                        {item.state && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-850 text-slate-300 border border-slate-700">
                            {item.state}
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                          {item.source === 'OpenStreetMap' ? 'OSM LIVE' : 'CURATED GLOBAL'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          River: <b className="text-slate-200">{item.river}</b>
                        </span>
                        <span>
                          Coordinates:{' '}
                          <b className="text-slate-200">
                            {item.lat.toFixed(3)}°N, {item.lon.toFixed(3)}°E
                          </b>
                        </span>
                        {item.heightM && (
                          <span>
                            Height: <b className="text-slate-200">{item.heightM} m</b>
                          </span>
                        )}
                        {item.yearBuilt && (
                          <span>
                            Commissioned: <b className="text-slate-200">{item.yearBuilt}</b>
                          </span>
                        )}
                      </div>

                      {/* Wikipedia summary snippet */}
                      {item.summary && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      )}

                      {!item.summary && item.displayName && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.displayName}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                      <button
                        disabled={loadingDamId !== null}
                        onClick={() => handleSelectGlobalDam(item)}
                        className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Coupling Meteo...</span>
                          </>
                        ) : isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Current Active Dam</span>
                          </>
                        ) : (
                          <>
                            <span>Simulate &amp; Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        Open-Meteo &amp; GloFAS synced
                      </span>
                    </div>
                  </div>
                );
              })}

              {!isSearchingGlobal && globalResults.length === 0 && (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Globe2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-300">
                    No dams found matching &quot;{globalSearch}&quot;
                  </div>
                  <div className="text-xs max-w-md mx-auto">
                    Try typing the generic dam name (e.g. &quot;Hoover&quot;, &quot;Aswan&quot;, &quot;Tehri&quot;, &quot;Vajont&quot;, &quot;Glen Canyon&quot;) or selecting from the quick presets above.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NATIONAL BASELINE DAMS */}
        {activeTab === 'national' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search & Filter Strip */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Dam name, River, Basin, or NDSA ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All States</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Dams List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {filteredIndianDams.map((dam) => {
                const isSelected = dam.id === selectedDamId;

                return (
                  <div
                    key={dam.id}
                    onClick={() => {
                      onSelectDam(dam);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/80 ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">{dam.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {dam.state}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                          {dam.provenance.mode}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          NDSA: <b className="text-slate-200">{dam.ndsaId}</b>
                        </span>
                        <span>
                          River: <b className="text-slate-200">{dam.river}</b>
                        </span>
                        <span>
                          Basin: <b className="text-slate-200">{dam.basin}</b>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-400">
                        <div>
                          Height: <b className="text-white">{dam.heightM} m</b>
                        </div>
                        <div>
                          Capacity: <b className="text-white">{dam.storageCapacityMCM} MCM</b>
                        </div>
                        <div>
                          FRL: <b className="text-white">{dam.fullReservoirLevelM} m</b>
                        </div>
                        <div>
                          Year Built: <b className="text-white">{dam.yearBuilt}</b>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                      <button
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active Asset</span>
                          </>
                        ) : (
                          <span>Load Asset</span>
                        )}
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        NWDP updated: {dam.provenance.retrievedAt.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
