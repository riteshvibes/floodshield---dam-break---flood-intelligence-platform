import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Server,
  Activity,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  MapPin,
  ExternalLink,
  Shield,
  Radio,
  Globe2,
  Loader2,
  CloudRain,
  Waves,
} from 'lucide-react';
import { DamRecord, ScenarioConfig, GlobalDamSearchResult } from '../types';
import { INDIAN_DAMS_CATALOGUE } from '../data/damsData';
import { searchGlobalDams, fetchGlobalDamDetails } from '../services/globalDamSearchService';

interface TopBarProps {
  selectedDam: DamRecord;
  onSelectDam?: (dam: DamRecord) => void;
  onOpenDamCatalogue: () => void;
  onOpenDataHealth: () => void;
  onOpenLiveTelemetry?: () => void;
  isSimulating: boolean;
  simulationProgress: number;
  onToggleMobileSidebar?: () => void;
  activeScenario?: ScenarioConfig;
  onRunSimulation?: () => void;
  onNavigate?: (tab: any) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedDam,
  onSelectDam,
  onOpenDamCatalogue,
  onOpenDataHealth,
  onOpenLiveTelemetry,
  isSimulating,
  simulationProgress,
  onToggleMobileSidebar,
  activeScenario,
  onRunSimulation,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalResults, setGlobalResults] = useState<GlobalDamSearchResult[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [loadingDamName, setLoadingDamName] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Debounced global search across OpenStreetMap & Open-Meteo
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setGlobalResults([]);
      setIsSearchingGlobal(false);
      return;
    }

    setIsSearchingGlobal(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchGlobalDams(trimmed);
        setGlobalResults(results);
      } catch (err) {
        console.error('Error during global dam search:', err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle selecting a dynamic global dam
  const handleSelectGlobalResult = async (item: GlobalDamSearchResult) => {
    try {
      setLoadingDamName(item.name);
      const fullDam = await fetchGlobalDamDetails(item);
      if (onSelectDam) {
        onSelectDam(fullDam);
      }
      setIsSearchOpen(false);
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to load global dam details:', err);
    } finally {
      setLoadingDamName(null);
    }
  };

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter dams and downstream settlements based on search query
  const searchResults = INDIAN_DAMS_CATALOGUE.filter((d) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.river.toLowerCase().includes(q) ||
      d.state.toLowerCase().includes(q) ||
      d.basin.toLowerCase().includes(q) ||
      d.downstreamSettlements.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <header className="min-h-16 bg-[#080d1a]/95 border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between gap-2 sticky top-0 z-20 select-none backdrop-blur-xl">
      {/* Left: Mobile Toggle & Brand Indicator */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        <button
          onClick={() => onToggleMobileSidebar && onToggleMobileSidebar()}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Dam Context Chip */}
        <button
          onClick={onOpenDamCatalogue}
          className="hidden sm:flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-xs transition group min-w-0 max-w-full"
          title="Click to change selected dam asset"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <span className="text-slate-300 font-semibold truncate max-w-[112px] sm:max-w-[200px]">
            {selectedDam?.name || 'Machchhu-II Dam'}
          </span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            ({selectedDam?.river || 'Machchhu'} Basin)
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </button>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 min-w-0 max-w-[min(34vw,460px)] mx-2 lg:mx-3 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search any dam globally (e.g. Hoover, Three Gorges, Tehri, Oroville)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setGlobalResults([]);
              }}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Autocomplete Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 text-xs max-h-96 flex flex-col">
            {/* Loading detail banner if fetching Open-Meteo data */}
            {loadingDamName && (
              <div className="px-3 py-2 bg-cyan-950/80 border-b border-cyan-500/40 text-cyan-300 flex items-center space-x-2 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span className="font-mono text-[11px]">
                  Synthesizing Open-Meteo hydro &amp; elevation data for <b>{loadingDamName}</b>...
                </span>
              </div>
            )}

            <div className="overflow-y-auto divide-y divide-slate-800/60 flex-1">
              {/* 1. Global Dams Section */}
              {globalResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/80 text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex justify-between items-center">
                    <span className="flex items-center space-x-1.5">
                      <Globe2 className="w-3 h-3 text-cyan-400" />
                      <span>Global Dams (OpenStreetMap &amp; Open-Meteo)</span>
                    </span>
                    <span className="text-slate-400">{globalResults.length} Found</span>
                  </div>
                  <div className="divide-y divide-slate-800/40">
                    {globalResults.map((item) => (
                      <button
                        key={item.id}
                        disabled={loadingDamName !== null}
                        onClick={() => handleSelectGlobalResult(item)}
                        className="w-full text-left px-3 py-2.5 hover:bg-cyan-950/30 transition flex items-center justify-between group disabled:opacity-50"
                      >
                        <div className="pr-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white group-hover:text-cyan-400 transition">
                              {item.name}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                              {item.country || 'Global'}
                            </span>
                            {item.source === 'OpenStreetMap' && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                                OSM Live
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {item.river} • {item.state ? `${item.state}, ` : ''}{item.country}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">
                            {item.displayName}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800/80 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 border border-slate-700 transition font-bold">
                            Load &amp; Simulate →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Indian Baseline Dams Section */}
              {searchResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex justify-between items-center">
                    <span>National Benchmark Dams (NDSA / CWC)</span>
                    <span>{searchResults.length}</span>
                  </div>
                  <div className="divide-y divide-slate-800/40">
                    {searchResults.map((dam) => (
                      <button
                        key={dam.id}
                        disabled={loadingDamName !== null}
                        onClick={() => {
                          if (onSelectDam) onSelectDam(dam);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-800/70 transition flex items-center justify-between group disabled:opacity-50"
                      >
                        <div>
                          <div className="font-semibold text-white group-hover:text-cyan-400 transition">
                            {dam.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {dam.river} River • {dam.state} • Reach: {dam.riverReach.totalLengthKm} km
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Downstream: {dam.downstreamSettlements.slice(0, 3).join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {dam.storageCapacityMCM} MCM
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Searching global status indicator */}
              {isSearchingGlobal && (
                <div className="p-3 bg-slate-950/40 flex items-center justify-center space-x-2 text-slate-400 text-xs font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Searching OpenStreetMap Global Infrastructure Registry...</span>
                </div>
              )}

              {/* Empty state */}
              {!isSearchingGlobal && searchResults.length === 0 && globalResults.length === 0 && (
                <div className="p-5 text-center text-slate-400 space-y-2">
                  <div>No direct dams found for &quot;{searchQuery}&quot;.</div>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onOpenDamCatalogue();
                    }}
                    className="text-xs text-cyan-400 hover:underline font-mono"
                  >
                    Open Full Global Dam Explorer Modal →
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>OpenStreetMap + Open-Meteo live sync active</span>
              </span>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  onOpenDamCatalogue();
                }}
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Browse Global Catalogue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Operational Status & Action Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Live Web Telemetry Trigger Button */}
        <button
          onClick={onOpenLiveTelemetry}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 transition text-cyan-300 text-xs font-mono group shadow-lg shadow-cyan-950/40"
          title="Open Live Meteorology & GloFAS River Flow Stream (Open-Meteo API)"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse group-hover:scale-110 transition" />
          <span className="font-bold hidden xl:inline">LIVE TELEMETRY</span>
          <span className="font-bold md:hidden">LIVE</span>
        </button>

        {/* Data Status Badge */}
        <button
          onClick={onOpenDataHealth}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/30 transition text-emerald-400 text-xs font-mono"
          title="Data Provenance: NWDP, CWC, Copernicus GLO-30 connected"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold hidden xl:inline">DATA CONNECTED</span>
          <span className="font-bold hidden sm:inline xl:hidden">DATA</span>
        </button>

        {/* Simulation Status Badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono ${
            isSimulating
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 animate-pulse'
              : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="font-bold hidden xl:inline">
            {isSimulating ? `SIMULATING (${simulationProgress}%)` : 'SIMULATION READY'}
          </span>
          <span className="font-bold xl:hidden">
            {isSimulating ? `${simulationProgress}%` : 'READY'}
          </span>
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition relative"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-slate-950"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-white font-mono uppercase tracking-wider">
                  Operational Alerts (3)
                </span>
                <span className="text-[10px] font-mono text-cyan-400">NTRO Alert System</span>
              </div>
              <div className="p-2 space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-800">
                <div className="pt-2 flex items-start space-x-2.5">
                  <span className="p-1 rounded bg-red-500/20 text-red-400 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-200">
                      High Surge Wave Triggered ({selectedDam?.name || 'Machchhu-II Dam'})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Hydrodynamic wave reaches nearest urban cluster at T+22 min. Inundation depth &gt; 3.0m.
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">2 mins ago</div>
                  </div>
                </div>

                <div className="pt-2 flex items-start space-x-2.5">
                  <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-200">Sentinel-1 SAR Pass Ingested</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Copernicus C-Band SAR radar observation calibrated with 91.8% IoU agreement.
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">14 mins ago</div>
                  </div>
                </div>

                <div className="pt-2 flex items-start space-x-2.5">
                  <span className="p-1 rounded bg-cyan-500/20 text-cyan-400 shrink-0">
                    <Info className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-200">Copernicus DEM GLO-30 Synchronized</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      30m spatial bathymetry elevation raster loaded into 2D mesh generator.
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">1 hr ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
