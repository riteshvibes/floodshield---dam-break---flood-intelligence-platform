import React, { useState } from 'react';
import {
  Terminal,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { SimulationJob } from '../types';

interface SimulationQueueBarProps {
  currentJob: SimulationJob | null;
  onViewResults?: () => void;
}

export const SimulationQueueBar: React.FC<SimulationQueueBarProps> = ({
  currentJob,
  onViewResults,
}) => {
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);

  if (!currentJob) return null;

  const isRunning = currentJob.status === 'RUNNING';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md text-xs font-mono shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4">
        {/* Job ID and Solver Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {isRunning ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}

          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <span className="text-slate-400 hidden sm:inline">Job:</span>
            <span className="text-cyan-300 font-bold truncate max-w-[94px] sm:max-w-none">{currentJob.id}</span>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
              {currentJob.solver}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
                isRunning
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {currentJob.status}
            </span>
          </div>
        </div>

        {/* Progress Bar & Details */}
        <div className="flex-1 max-w-md hidden sm:flex items-center space-x-3">
          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${currentJob.progress}%` }}
            />
          </div>
          <span className="text-cyan-400 font-bold min-w-[36px] text-right">
            {currentJob.progress}%
          </span>
        </div>

        {/* Logs Toggle & Result Action */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLogsExpanded(!isLogsExpanded)}
            className="px-2 py-1.5 sm:px-2.5 sm:py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Worker Logs</span>
            {isLogsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {currentJob.status === 'COMPLETED' && onViewResults && (
            <button
              onClick={onViewResults}
              className="px-2.5 sm:px-3 py-1.5 sm:py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-md shadow-cyan-500/20"
            >
              <span className="hidden sm:inline">Inspect Wave</span>
              <span className="sm:hidden">Inspect</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Logs Drawer */}
      {isLogsExpanded && (
        <div className="max-w-7xl mx-auto px-4 pb-3 pt-1 border-t border-slate-800">
          <div className="bg-slate-950 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1 text-[11px] text-slate-400 border border-slate-800 font-mono">
            {currentJob.logs.map((log, i) => (
              <div key={i} className="leading-tight flex items-start gap-2">
                <span className="text-slate-600 select-none">[{i + 1}]</span>
                <span className={log.includes('completed') ? 'text-emerald-400' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
