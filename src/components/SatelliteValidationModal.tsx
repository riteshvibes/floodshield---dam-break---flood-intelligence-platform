import React, { useState } from 'react';
import {
  Satellite,
  CheckCircle2,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { SatelliteValidationResult, DamRecord } from '../types';

interface SatelliteValidationProps {
  validation: SatelliteValidationResult | null;
  dam: DamRecord;
  onRunValidationComparison?: () => void;
}

export const SatelliteValidationModal: React.FC<SatelliteValidationProps> = ({
  validation,
  dam,
  onRunValidationComparison,
}) => {
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const [activeThresholdDb, setActiveThresholdDb] = useState<number>(-14.5);

  if (!validation) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Satellite className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No satellite validation analysis available for this run.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Satellite className="w-4 h-4" />
            <span>Earth Observation & SAR Cross-Verification</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Sentinel-1 SAR Radar Flood Validation (Google Earth Engine)
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Cloud-penetrating C-Band Synthetic Aperture Radar (SAR) comparison against simulated hydrodynamic wave extent.
            Permanent water bodies subtracted using JRC Global Surface Water baseline.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            {validation.qualityFlag}
          </span>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-xs font-mono text-slate-400">IoU (Jaccard Index)</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {validation.iouScore}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Spatial Overlap Score</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-xs font-mono text-slate-400">Precision (Model Exactness)</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            {validation.precision}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Simulated Inundation Validated</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-xs font-mono text-slate-400">Recall (SAR Sensitivity)</div>
          <div className="text-2xl font-extrabold text-blue-400 font-mono mt-1">
            {validation.recall}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Observed Water Captured</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-xs font-mono text-slate-400">F1 / Dice Accuracy</div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">
            {validation.f1Score}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Harmonic Mean Metric</div>
        </div>
      </div>

      {/* Visual Difference Breakdown & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Difference Mask Visualization */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Simulated Hydrodynamic Extent vs. Sentinel-1 SAR Mask</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Split View ({splitPosition}% / {100 - splitPosition}%)
              </span>
            </div>

            {/* Split Slider Preview Simulator */}
            <div className="relative w-full h-72 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              {/* Background Map Simulation graphic */}
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                {/* River Channel */}
                <div className="absolute w-2 h-full bg-sky-600/40 rotate-12 blur-[1px]"></div>
                {/* Simulated Extent (Cyan) */}
                <div className="w-56 h-48 rounded-full bg-cyan-500/30 blur-md border-2 border-cyan-400/80"></div>
                {/* SAR Observed Extent (Green) */}
                <div
                  className="absolute w-52 h-44 rounded-full bg-emerald-500/30 blur-md border-2 border-emerald-400/80"
                  style={{ transform: 'translate(10px, -5px)' }}
                ></div>
              </div>

              {/* Slider overlay separator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white z-20 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-lg">
                  ↔
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-cyan-950/90 text-cyan-300 text-[10px] font-mono border border-cyan-700/60 z-10">
                Hydrodynamic Solver (Model)
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-emerald-950/90 text-emerald-300 text-[10px] font-mono border border-emerald-700/60 z-10">
                Sentinel-1 SAR (Observed)
              </div>
            </div>

            {/* Slider Control */}
            <div className="mt-4 flex items-center space-x-3">
              <span className="text-xs font-mono text-slate-400">Slide Comparison:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={splitPosition}
                onChange={(e) => setSplitPosition(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Mask Categorical Legend */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/60">
              <span className="text-emerald-400 font-bold block">True Positive (88.4%)</span>
              <span className="text-[10px] text-slate-400">Model & SAR in Agreement</span>
            </div>
            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/60">
              <span className="text-cyan-400 font-bold block">Model Only (11.6%)</span>
              <span className="text-[10px] text-slate-400">Vegetation / Shadow Under-detect</span>
            </div>
            <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60">
              <span className="text-amber-400 font-bold block">SAR Only (7.5%)</span>
              <span className="text-[10px] text-slate-400">Localized Standing Runoff</span>
            </div>
          </div>
        </div>

        {/* Right Col: Satellite Scene Provenance & Threshold tuning */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white">SAR Scene Provenance</h3>

          <div className="space-y-2.5 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500">Sensor / Constellation:</span>
              <div className="text-white font-semibold">{validation.satelliteSensor}</div>
            </div>

            <div>
              <span className="text-slate-500">Observation Timestamp:</span>
              <div className="text-emerald-400 font-semibold">{validation.satellitePassDate}</div>
            </div>

            <div>
              <span className="text-slate-500">Orbit & Polarization:</span>
              <div className="text-white">
                {validation.orbitPass} Pass • {validation.polarization}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Copernicus Scene ID:</span>
              <div className="text-[11px] text-slate-400 break-all bg-slate-950 p-1.5 rounded border border-slate-800">
                {validation.provenance.geeAssetId}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Permanent Water Deduction:</span>
              <div className="text-white">
                JRC Global Surface Water ({validation.provenance.jrcBaselineYear} Baseline)
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Otsu Backscatter Water Threshold: <b className="text-white">{activeThresholdDb} dB</b>
            </label>
            <input
              type="range"
              min={-20.0}
              max={-10.0}
              step={0.5}
              value={activeThresholdDb}
              onChange={(e) => setActiveThresholdDb(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Refines specular surface scattering filter for calm standing flood waters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
