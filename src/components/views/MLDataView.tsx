import React, { useEffect, useState } from 'react';
import { BrainCircuit, CheckCircle2, Database, Download, FileText, ShieldAlert } from 'lucide-react';

interface MLMetadata {
  model: string;
  modelVersion: string;
  trainingDate: string;
  features: string[];
  records: number;
  datasetStatus: string;
  dateRange: { start: string; end: string };
  historicalCoverageYears?: number;
  requiredCoverageYears?: number;
  split: { train: number; validation: number; test: number; method: string };
  metrics: Record<string, { mae: number; rmse: number; r2: number }>;
  testAgreementPercent?: Record<string, number>;
  featureImportance: Record<string, number>;
  dataSources?: string[];
  metricWarning?: string;
  provenance?: string;
  evaluationType?: string;
}

interface FeedbackStatus { records: number; retrainingRequired: boolean; message: string; }
interface EarlyWarning { risk: string; likelyWindow: string; peakForecastDischarge: number; designDischarge: number; vulnerabilityScore: number; warning: string; prevention: string[]; dam: string; modelVersion: string; }

interface LiveValidation {
  status: string;
  observations: number;
  message?: string;
  mae?: number;
  rmse?: number;
  directionalHitRate?: number;
  lastUpdated?: string;
}

const labels: Record<string, string> = {
  rainfall_1h: 'Rainfall 1h', rainfall_3h: 'Rainfall 3h', rainfall_6h: 'Rainfall 6h',
  rainfall_12h: 'Rainfall 12h', rainfall_24h: 'Rainfall 24h', previous_discharge_1h: 'Previous discharge 1h',
  previous_discharge_3h: 'Previous discharge 3h', previous_discharge_6h: 'Previous discharge 6h',
  previous_water_level: 'Previous water level', reservoir_level: 'Reservoir level', river_level: 'River level',
  elevation: 'Elevation', slope: 'Slope', soil_moisture: 'Soil moisture',
};

export const MLDataView: React.FC = () => {
  const [metadata, setMetadata] = useState<MLMetadata | null>(null);
  const [feedback, setFeedback] = useState<FeedbackStatus | null>(null);
  const [liveValidation, setLiveValidation] = useState<LiveValidation | null>(null);
  const [earlyWarning, setEarlyWarning] = useState<EarlyWarning | null>(null);
  const [warningLoading, setWarningLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/ml/status')
      .then((response) => response.json())
      .then((data) => {
        if (data.metadata) setMetadata(data.metadata);
        else setError(data.message || 'Model metadata is unavailable.');
      })
      .catch(() => setError('Could not load local ML metadata.'));
    fetch('/api/ml/live-validation').then((response) => response.json()).then(setLiveValidation).catch(() => {});
    fetch('/api/ml/feedback').then((response) => response.json()).then(setFeedback).catch(() => {});
  }, []);

  if (error) return <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 text-sm text-amber-200">{error}</div>;
  if (!metadata) return <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">Loading ML data...</div>;

  const topFeatures = Object.entries(metadata.featureImportance).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 8);
  const runEarlyWarning = async () => {
    setWarningLoading(true);
    try {
      const response = await fetch('/api/ml/early-warning', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const result = await response.json();
      if (response.ok) setEarlyWarning(result);
    } finally {
      setWarningLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1800px] space-y-5">
      <section className="rounded-2xl border border-cyan-500/20 bg-[#0c1324] p-5 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-cyan-300"><BrainCircuit className="h-4 w-4" /> ML data & model details</div>
            <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">What the model uses and learns</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">A transparent view of the saved local model, its training data, validation split, features, and provenance.</p>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-cyan-300">POWERED BY MACHINE LEARNING</span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="text-[11px] text-slate-500">Model</div><div className="mt-2 font-bold text-white">{metadata.model}</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="text-[11px] text-slate-500">Version</div><div className="mt-2 font-bold text-cyan-300">{metadata.modelVersion}</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="text-[11px] text-slate-500">Records</div><div className="mt-2 font-bold text-white">{metadata.records.toLocaleString()}</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="text-[11px] text-slate-500">Features</div><div className="mt-2 font-bold text-white">{metadata.features.length}</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="text-[11px] text-slate-500">Coverage</div><div className="mt-2 font-bold text-amber-300">{metadata.historicalCoverageYears ?? 0} years</div></div>
      </section>

      <section className="rounded-xl border border-amber-500/25 bg-amber-950/10 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-bold text-amber-200">Real-time accuracy monitor</h2><p className="mt-1 text-sm text-amber-100/70">Live accuracy requires a measured discharge observation after each forecast. Synthetic test data is never used here.</p></div><span className="rounded-full border border-amber-500/30 px-3 py-1 text-[10px] font-bold tracking-wider text-amber-200">{liveValidation?.status === 'MEASURED_GROUND_TRUTH_ACTIVE' ? 'MEASURED DATA ACTIVE' : 'WAITING FOR GROUND TRUTH'}</span></div>{liveValidation?.observations ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center"><div><div className="text-xl font-bold text-white">{liveValidation.observations}</div><div className="text-[10px] text-slate-500">observations</div></div><div><div className="text-xl font-bold text-white">{liveValidation.mae}</div><div className="text-[10px] text-slate-500">live MAE</div></div><div><div className="text-xl font-bold text-white">{liveValidation.rmse}</div><div className="text-[10px] text-slate-500">live RMSE</div></div><div><div className="text-xl font-bold text-white">{liveValidation.directionalHitRate}%</div><div className="text-[10px] text-slate-500">directional hit rate</div></div></div> : <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">{liveValidation?.message || 'No measured discharge observations have been paired with model forecasts yet. Real-time accuracy is therefore not available.'}</div>}</section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="flex items-center gap-2 font-bold text-white"><Database className="h-4 w-4 text-cyan-400" /> Training data</h2><div className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-4"><span className="text-slate-400">Period</span><span className="text-right text-white">{new Date(metadata.dateRange.start).toLocaleDateString()} - {new Date(metadata.dateRange.end).toLocaleDateString()}</span></div><div className="flex justify-between"><span className="text-slate-400">Train / validation / test</span><span className="text-white">{metadata.split.train} / {metadata.split.validation} / {metadata.split.test}</span></div><div className="flex justify-between"><span className="text-slate-400">Split method</span><span className="text-cyan-300">{metadata.split.method}</span></div><div className="flex justify-between"><span className="text-slate-400">Training date</span><span className="text-white">{new Date(metadata.trainingDate).toLocaleString()}</span></div></div></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="font-bold text-white">Features used</h2><div className="mt-4 flex flex-wrap gap-2">{metadata.features.map((feature) => <span key={feature} className="rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300">{labels[feature] || feature}</span>)}</div></div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="flex items-center gap-2 font-bold text-white"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Synthetic offline benchmark</h2><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">{Object.entries(metadata.metrics).map(([horizon, rawMetric]) => { const metric = rawMetric as { mae: number; rmse: number; r2: number }; const agreement = metadata.testAgreementPercent?.[horizon] ?? metric.r2 * 100; return <div key={horizon} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"><div className="text-xs text-slate-400">+{horizon}h</div><div className="mt-2 text-lg font-bold text-cyan-300">{agreement.toFixed(2)}%</div><div className="text-[10px] text-slate-500">synthetic R² agreement</div><div className="mt-3 space-y-1 text-[11px] text-slate-400"><div>MAE: {metric.mae}</div><div>RMSE: {metric.rmse}</div><div>R²: {metric.r2}</div></div></div>; })}</div><p className="mt-4 text-xs text-amber-300">Not real-time accuracy. The synthetic fixture is useful for pipeline testing only. See the live monitor below for measured validation.</p></div>
      </section>

      <section className="rounded-xl border border-cyan-500/25 bg-cyan-950/10 p-5"><h2 className="font-bold text-cyan-200">Self-enhancing feedback loop</h2><p className="mt-2 text-sm text-slate-300">Measured forecast outcomes are retained separately and used for the next validated retraining cycle. The model never learns from synthetic scores as if they were field observations.</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><div><div className="text-xl font-bold text-white">{feedback?.records ?? 0}</div><div className="text-[10px] text-slate-500">measured feedback records</div></div><div><div className="text-xl font-bold text-cyan-300">{feedback?.retrainingRequired ? 'READY' : 'COLLECTING'}</div><div className="text-[10px] text-slate-500">retraining status</div></div><div><div className="text-xl font-bold text-amber-300">{liveValidation?.observations ?? 0}</div><div className="text-[10px] text-slate-500">validated observations</div></div></div><p className="mt-3 text-xs text-slate-400">{feedback?.message || 'Collect measured observations before retraining.'}</p></section>

      <section className="rounded-xl border border-red-500/25 bg-red-950/10 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold text-red-200"><ShieldAlert className="h-4 w-4" /> Future disaster early warning</h2><p className="mt-1 text-sm text-slate-300">Screen the current forecast for elevated flood or dam-stress conditions and recommended prevention actions.</p></div><button onClick={runEarlyWarning} disabled={warningLoading} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-400 disabled:opacity-50">{warningLoading ? 'Assessing...' : 'Run early-warning assessment'}</button></div>{earlyWarning && <div className="mt-4 space-y-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div><div className="text-[10px] text-slate-500">Risk level</div><div className="mt-1 text-xl font-bold text-red-300">{earlyWarning.risk}</div></div><div><div className="text-[10px] text-slate-500">Likely window</div><div className="mt-1 text-sm font-bold text-white">{earlyWarning.likelyWindow}</div></div><div><div className="text-[10px] text-slate-500">Peak forecast</div><div className="mt-1 text-sm font-bold text-white">{earlyWarning.peakForecastDischarge.toLocaleString()} m³/s</div></div><div><div className="text-[10px] text-slate-500">Screening score</div><div className="mt-1 text-sm font-bold text-amber-300">{earlyWarning.vulnerabilityScore}/100</div></div></div><div className="rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-100">{earlyWarning.warning}</div><div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">How to reduce risk</div><ul className="mt-2 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">{earlyWarning.prevention.map((action) => <li key={action} className="rounded border border-slate-800 bg-slate-950/30 p-2">{action}</li>)}</ul></div></div>}</section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="font-bold text-white">Feature importance</h2><div className="mt-4 space-y-3">{topFeatures.map(([feature, rawValue]) => { const value = Number(rawValue); return <div key={feature}><div className="flex justify-between text-xs"><span className="text-slate-300">{labels[feature] || feature}</span><span className="font-mono text-cyan-300">{(value * 100).toFixed(2)}%</span></div><div className="mt-1 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(2, value * 100)}%` }} /></div></div>; })}</div></div>
        <div className="rounded-xl border border-amber-500/25 bg-amber-950/10 p-5"><h2 className="flex items-center gap-2 font-bold text-amber-200"><ShieldAlert className="h-4 w-4" /> Data status & downloads</h2><p className="mt-3 text-sm leading-relaxed text-amber-100/80">{metadata.datasetStatus === 'SYNTHETIC_DEMO_NOT_HISTORICAL' ? 'This is a seven-year synthetic discharge fixture, not measured historical discharge data. A separate five-year rainfall archive is available.' : 'Historical training data is active.'}</p><div className="mt-4 flex flex-wrap gap-2 text-xs"><a className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-3 py-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300" href="/api/ml/training-data" download><Download className="h-3.5 w-3.5" /> Discharge data</a><a className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-3 py-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300" href="/api/ml/rainfall-data" download><Download className="h-3.5 w-3.5" /> 5-year rainfall</a><a className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-3 py-2 text-slate-300 hover:border-cyan-400 hover:text-cyan-300" href="/api/ml/data-dictionary" download><FileText className="h-3.5 w-3.5" /> Data dictionary</a><a className="inline-flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-cyan-300" href="/api/ml/report.pdf" download><FileText className="h-3.5 w-3.5" /> PDF report</a></div></div>
      </section>
    </div>
  );
};
