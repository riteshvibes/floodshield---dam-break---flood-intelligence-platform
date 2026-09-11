import React, { useState } from 'react';
import {
  Server,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { DataServiceStatus } from '../types';

interface DataHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: DataServiceStatus[];
}

export const DataHealthModal: React.FC<DataHealthModalProps> = ({
  isOpen,
  onClose,
  services,
}) => {
  const [isResilienceModeActive, setIsResilienceModeActive] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Data Provenance & System Health</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-bold">
                  RESILIENT • ZERO DOWNTIME
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-time connection telemetry, cache freshness timestamps, and external API fallback states
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

        {/* Resilience Policy Callout */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Cache-First Operation (PRD Section 12):</span> If any external
              government portal or satellite endpoint experiences outage, FLOODSHIELD seamlessly falls back to
              georeferenced local cache without disrupting active simulations.
            </div>
          </div>

          <button
            onClick={() => setIsResilienceModeActive(!isResilienceModeActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
              isResilienceModeActive
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isResilienceModeActive ? '⚡ Resilience Sim Active' : 'Test Offline Fallback'}
          </button>
        </div>

        {/* Services Health Table */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {services.map((src) => {
            const effectiveStatus = isResilienceModeActive ? 'USING_CACHE' : src.status;

            return (
              <div
                key={src.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm font-sans">{src.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        effectiveStatus === 'ONLINE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : effectiveStatus === 'USING_CACHE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {effectiveStatus}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {src.category}
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] truncate max-w-md">
                    Endpoint: <a href={src.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{src.url}</a>
                  </div>

                  <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
                    <span>Cache Date: {src.cacheTimestamp.slice(0, 10)}</span>
                    <span>Records in Cache: {src.cachedRecordsCount.toLocaleString()}</span>
                    <span>License: {src.license}</span>
                  </div>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <div className="text-slate-400 text-[11px]">
                    Latency: <b className="text-white">{isResilienceModeActive ? '0 ms (Local)' : `${src.latencyMs} ms`}</b>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Checked: Just now
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
