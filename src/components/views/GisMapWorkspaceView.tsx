import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Eye,
  Sliders,
  Shield,
  Gauge,
  Activity,
  Clock,
  Building,
  Users,
  Route,
  Droplets,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DamRecord, SimulationResultManifest, CriticalAssetImpact } from '../../types';
import { MapViewer } from '../MapViewer';

interface GisMapWorkspaceViewProps {
  dam: DamRecord;
  results: SimulationResultManifest | null;
  currentTimeStepIndex: number;
  setCurrentTimeStepIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  showSatelliteOverlay: boolean;
  setShowSatelliteOverlay: (show: boolean) => void;
  onSelectAsset?: (asset: CriticalAssetImpact) => void;
}

export const GisMapWorkspaceView: React.FC<GisMapWorkspaceViewProps> = ({
  dam,
  results,
  currentTimeStepIndex,
  setCurrentTimeStepIndex,
  isPlaying,
  setIsPlaying,
  showSatelliteOverlay,
  setShowSatelliteOverlay,
  onSelectAsset,
}) => {
  // Layer states
  const [activeAnalysisMode, setActiveAnalysisMode] = useState<'depth' | 'velocity' | 'arrival' | 'risk'>('depth');
  const [opacity, setOpacity] = useState<number>(0.65);
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(true);

  return (
    <div className="space-y-4">
      {/* Top GIS Command Strip */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>ENTERPRISE GIS FLOOD WORKSPACE</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Geospatial Analysis & Thematic Multi-Layer Viewer
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Switch between Flood Depth, Velocity Shear vectors, Wave Arrival isochrones, and Critical Infrastructure.
          </p>
        </div>

        {/* Thematic Analysis Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-mono">
          <button
            onClick={() => setActiveAnalysisMode('depth')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeAnalysisMode === 'depth'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Flood Depth ($h$)
          </button>
          <button
            onClick={() => setActiveAnalysisMode('velocity')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeAnalysisMode === 'velocity'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Velocity ($v$)
          </button>
          <button
            onClick={() => setActiveAnalysisMode('arrival')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeAnalysisMode === 'arrival'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {'Arrival Time (t_arr)'}
          </button>
          <button
            onClick={() => setActiveAnalysisMode('risk')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeAnalysisMode === 'risk'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Risk Category
          </button>
        </div>
      </div>

      {/* Main Map Workspace with Overlaid Scientific Floating Legend & Layer Manager */}
      <div className="relative w-full min-h-[460px] sm:min-h-[560px] h-[540px] sm:h-[660px] lg:h-[720px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <MapViewer
          dam={dam}
          results={results}
          currentTimeStepIndex={currentTimeStepIndex}
          setCurrentTimeStepIndex={setCurrentTimeStepIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          showSatelliteOverlay={showSatelliteOverlay}
          setShowSatelliteOverlay={setShowSatelliteOverlay}
          onSelectAsset={onSelectAsset}
        />

        {/* Floating Thematic Legend according to selected active mode (responsive hidden on mobile so map remains usable) */}
        <div className="hidden md:block absolute top-20 left-4 z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 shadow-2xl pointer-events-auto max-w-xs text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              {activeAnalysisMode === 'depth' && <Gauge className="w-3.5 h-3.5 text-blue-400" />}
              {activeAnalysisMode === 'velocity' && <Activity className="w-3.5 h-3.5 text-amber-400" />}
              {activeAnalysisMode === 'arrival' && <Clock className="w-3.5 h-3.5 text-purple-400" />}
              {activeAnalysisMode === 'risk' && <Shield className="w-3.5 h-3.5 text-red-400" />}
              THEMATIC CLASSIFICATION
            </span>
          </div>

          {activeAnalysisMode === 'depth' && (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-red-600 shrink-0"></span>
                <span className="text-slate-200">&gt; 5.0 m (Submerged 2-Storey)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-orange-500 shrink-0"></span>
                <span className="text-slate-200">3.0 – 5.0 m (High Hazard)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 shrink-0"></span>
                <span className="text-slate-200">2.0 – 3.0 m (Severe Submersion)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 shrink-0"></span>
                <span className="text-slate-200">1.0 – 2.0 m (Ground Floor Flood)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-cyan-400 shrink-0"></span>
                <span className="text-slate-200">0.5 – 1.0 m (Pedestrian Hazard)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-cyan-200 shrink-0"></span>
                <span className="text-slate-200">0.0 – 0.5 m (Shallow Surface)</span>
              </div>
            </div>
          )}

          {activeAnalysisMode === 'velocity' && (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-red-600 shrink-0"></span>
                <span className="text-slate-200">&gt; 4.0 m/s (Structural Shear Fail)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-orange-500 shrink-0"></span>
                <span className="text-slate-200">2.0 – 4.0 m/s (Vehicles Swept)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 shrink-0"></span>
                <span className="text-slate-200">1.0 – 2.0 m/s (Moderate Torrent)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-cyan-400 shrink-0"></span>
                <span className="text-slate-200">0.0 – 1.0 m/s (Slow Runoff)</span>
              </div>
            </div>
          )}

          {activeAnalysisMode === 'arrival' && (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-red-600 shrink-0"></span>
                <span className="text-slate-200">0 – 15 min (Zero Reaction Time)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-orange-500 shrink-0"></span>
                <span className="text-slate-200">15 – 30 min (Immediate Evac)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 shrink-0"></span>
                <span className="text-slate-200">30 – 60 min (Urgent Mobilization)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-500 shrink-0"></span>
                <span className="text-slate-200">1.0 – 2.0 hr (Advance Warning)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-cyan-400 shrink-0"></span>
                <span className="text-slate-200">&gt; 2.0 hr (Extended Reach)</span>
              </div>
            </div>
          )}

          {activeAnalysisMode === 'risk' && (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-red-600 shrink-0"></span>
                <span className="text-slate-200">{'CRITICAL (h > 3.0m and v > 2.0m/s)'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-orange-500 shrink-0"></span>
                <span className="text-slate-200">HIGH (High Risk Population Zone)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-500 shrink-0"></span>
                <span className="text-slate-200">MEDIUM (Inundated Corridors)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-cyan-400 shrink-0"></span>
                <span className="text-slate-200">LOW (Peripheral Backwater)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
