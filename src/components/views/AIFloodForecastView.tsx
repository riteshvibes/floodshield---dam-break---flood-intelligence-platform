import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BrainCircuit, Database, Gauge, Play, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { DamRecord, ScenarioConfig, SimulationResultManifest } from '../../types';

interface ForecastResponse {
  predictedDischarge: number;
  floodSeverity: string;
  model: string;
  modelVersion: string;
  forecasts: { horizonHours: number; predictedDischarge: number }[];
  historical: { timestamp: string; actualDischarge: number }[];
  uncertainty: { horizonHours: number; stdDev: number; method: string }[];
  training: {
    datasetStatus: string;
    trainingDate: string;
    features: string[];
    testAgreementPercent?: Record<string, number>;
    metricWarning?: string;
    historicalCoverageYears?: number;
    requiredCoverageYears?: number;
    records: number;
    dateRange: { start: string; end: string };
    metrics: Record<string, { mae: number; rmse: number; r2: number }>;
    featureImportance: Record<string, number>;
    split: { train: number; validation: number; test: number; method: string };
  };
}

interface VulnerabilityAssessment {
  score: number;
  level: string;
  label: string;
  limitation: string;
  zones: { zone: string; score: number; trigger: string; action: string }[];
}

interface AIFloodForecastViewProps {
  dam: DamRecord;
  activeScenario?: ScenarioConfig;
  onSimulationComplete: (results: SimulationResultManifest, forecast: ForecastResponse) => void;
}

const FEATURE_LABELS: Record<string, string> = {
  rainfall_1h: 'Rainfall 1h', rainfall_3h: 'Rainfall 3h', rainfall_6h: 'Rainfall 6h',
  rainfall_12h: 'Rainfall 12h', rainfall_24h: 'Rainfall 24h', previous_discharge_1h: 'Previous discharge',
  previous_discharge_3h: 'Discharge average 3h', previous_discharge_6h: 'Discharge average 6h',
  previous_water_level: 'Previous water level', reservoir_level: 'Reservoir level', river_level: 'River level',
  elevation: 'Elevation', slope: 'Slope', soil_moisture: 'Soil moisture',
};

export const AIFloodForecastView: React.FC<AIFloodForecastViewProps> = ({ dam, activeScenario, onSimulationComplete }) => {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not_trained' | 'error'>('loading');
  const [message, setMessage] = useState('Loading local model status...');
  const [isRunning, setIsRunning] = useState(false);
  const [rainfall, setRainfall] = useState(dam.liveWeather?.precipitationMmPerHr || 40);
  const [vulnerability, setVulnerability] = useState<VulnerabilityAssessment | null>(null);

  const runForecast = async () => {
    setIsRunning(true);
    setMessage('Running local model and hydrodynamic simulation...');
    try {
      const input = {
        rainfall_1h: rainfall,
        rainfall_3h: rainfall * 2.3,
        rainfall_6h: rainfall * 3.9,
        rainfall_12h: rainfall * 5.1,
        rainfall_24h: rainfall * 7.2,
        previous_discharge_1h: dam.liveDischargeCumecs || activeScenario?.inflowDischargeCumecs || 500,
        reservoir_level: dam.maximumWaterLevelM,
        previous_water_level: dam.fullReservoirLevelM,
        river_level: dam.fullReservoirLevelM * 0.08,
        elevation: dam.reservoir.elevationRangeM[1],
        slope: 0.018,
        soil_moisture: 0.35,
      };
      const response = await fetch('/api/ml/predict-simulate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ damId: dam.id, ...input, scenario: activeScenario }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Prediction failed');
      setForecast(data.prediction);
      setVulnerability(data.vulnerability || null);
      onSimulationComplete(data.results, data.prediction);
      setStatus('ready');
      setMessage('Local model forecast applied to the flood simulation.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Local model is unavailable.');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    fetch('/api/ml/status').then((response) => response.json()).then((data) => {
      if (data.status === 'READY') setStatus('ready');
      else setStatus('not_trained');
      setMessage(data.status === 'READY' ? 'Local model ready.' : data.message || 'Train the local model to enable forecasts.');
    }).catch(() => { setStatus('error'); setMessage('Could not reach the local ML service.'); });
  }, []);

  const chartData = useMemo(() => {
    if (!forecast) return [];
    return [
      ...forecast.historical.map((item) => ({ label: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), actual: item.actualDischarge })),
      ...forecast.forecasts.map((item) => ({ label: `+${item.horizonHours}h`, predicted: item.predictedDischarge })),
    ];
  }, [forecast]);

  const topFeatures = forecast ? Object.entries(forecast.training.featureImportance).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 6) : [];
  const metrics = forecast?.training.metrics['1'];
  const testAgreement = forecast?.training.testAgreementPercent?.['1'] ?? (metrics ? metrics.r2 * 100 : null);

  return (
    <div className="space-y-5 max-w-[1800px] mx-auto">
      <section className="rounded-2xl border border-cyan-500/20 bg-[#0c1324] p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono uppercase tracking-[0.18em]"><BrainCircuit className="w-4 h-4" /> AI / ML prediction</div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">Predict future river discharge</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">A locally trained model uses stored conditions and feeds its discharge forecast into the existing hydrodynamic simulation for {dam.name}.</p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2 text-xs font-mono"><span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-cyan-300">POWERED BY MACHINE LEARNING</span><span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${status === 'ready' ? 'bg-emerald-400' : status === 'error' ? 'bg-red-400' : 'bg-amber-400'}`} />{message}</span></div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="text-[11px] uppercase tracking-wider text-slate-400">Selected dam</div><div className="mt-2 font-bold text-white truncate">{dam.name}</div><div className="text-xs text-slate-500">{dam.river}</div></div>
        <label className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-400"><span>Rainfall input</span><span className="text-cyan-300">{rainfall} mm/h</span></div><input aria-label="Rainfall input" className="mt-4 w-full accent-cyan-400" type="range" min="0" max="250" step="1" value={rainfall} onChange={(event) => setRainfall(Number(event.target.value))} /></label>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="text-[11px] uppercase tracking-wider text-slate-400">Current discharge</div><div className="mt-2 text-xl font-bold text-cyan-300">{(dam.liveDischargeCumecs || activeScenario?.inflowDischargeCumecs || 500).toLocaleString()} <span className="text-xs text-slate-500">m³/s</span></div></div>
      </section>

      <button disabled={isRunning || status === 'not_trained'} onClick={runForecast} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"><Play className="w-4 h-4 fill-current" />{isRunning ? 'Processing...' : 'Predict and simulate'}</button>
      {status === 'not_trained' && <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">The local model is not trained yet. Run <code>python backend/ml/create_demo_dataset.py</code>, then <code>python backend/ml/train.py</code>.</div>}

      {forecast && <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-white">Data & model transparency</h2><p className="mt-1 text-xs text-slate-400">Every value below comes from the saved model metadata and local training fixture.</p></div><div className="flex flex-wrap gap-2 text-xs"><a className="rounded border border-slate-700 px-2.5 py-1.5 text-slate-300 hover:border-cyan-400 hover:text-cyan-300" href="/api/ml/training-data" download>Discharge training data</a><a className="rounded border border-slate-700 px-2.5 py-1.5 text-slate-300 hover:border-cyan-400 hover:text-cyan-300" href="/api/ml/rainfall-data" download>5-year rainfall data</a><a className="rounded border border-slate-700 px-2.5 py-1.5 text-slate-300 hover:border-cyan-400 hover:text-cyan-300" href="/api/ml/data-dictionary" download>Data dictionary</a><a className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1.5 text-cyan-300 hover:bg-cyan-500/20" href="/api/ml/report.pdf" download>ML report PDF</a></div></div><div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs"><div><span className="text-slate-500">Model</span><div className="mt-1 font-semibold text-white">{forecast.model}</div></div><div><span className="text-slate-500">Version / trained</span><div className="mt-1 font-semibold text-white">{forecast.modelVersion}</div><div className="text-slate-400">{new Date(forecast.training.trainingDate).toLocaleDateString()}</div></div><div><span className="text-slate-500">Training period</span><div className="mt-1 font-semibold text-white">{new Date(forecast.training.dateRange.start).toLocaleDateString()} - {new Date(forecast.training.dateRange.end).toLocaleDateString()}</div></div><div><span className="text-slate-500">Features / records</span><div className="mt-1 font-semibold text-white">{forecast.training.features?.length || Object.keys(forecast.training.featureImportance).length} / {forecast.training.records}</div></div><div><span className="text-slate-500">Discharge coverage</span><div className="mt-1 font-semibold text-white">{forecast.training.historicalCoverageYears ?? 0} years</div><div className="text-amber-300">Target: 5+ years</div></div></div><div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"><div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3 text-xs text-cyan-100"><b>1h test agreement:</b> {testAgreement === null ? 'n/a' : `${testAgreement.toFixed(2)}%`}<div className="mt-1 text-cyan-200/70">This is R² × 100 on unseen chronological test data, not accuracy or probability of truth.</div></div><div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 text-xs text-amber-200">{forecast.training.datasetStatus === 'DEMO_MODEL_NOT_HISTORICAL' ? 'DEMO MODEL: current discharge fixture is not measured historical gauge data. Five-year rainfall ingestion is available, but matching measured discharge labels are still required before retraining.' : 'Historical training data status verified in model metadata.'}</div></div></section>}

      {vulnerability && <section className="rounded-xl border border-amber-500/25 bg-[#171522] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-amber-300 text-xs font-mono uppercase tracking-wider"><ShieldAlert className="w-4 h-4" /> Dam vulnerability / early warning</div><h2 className="mt-2 text-lg font-bold text-white">{vulnerability.label}</h2><p className="mt-1 text-xs text-slate-400">Rule-based engineering screening informed by the forecast and existing dam metadata.</p></div><div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center"><div className="text-2xl font-bold text-amber-300">{vulnerability.score}</div><div className="text-[10px] font-mono text-amber-200">{vulnerability.level} SCREEN</div></div></div><div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">{vulnerability.zones.map((zone) => <div key={zone.zone} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"><div className="flex justify-between gap-2 text-xs font-semibold text-white"><span>{zone.zone}</span><span className="text-amber-300">{zone.score}</span></div><p className="mt-2 text-[11px] text-slate-400">{zone.trigger}</p><p className="mt-2 text-[11px] text-cyan-300">{zone.action}</p></div>)}</div><p className="mt-4 text-[11px] text-amber-200/80">{vulnerability.limitation}</p></section>}

      {forecast && <>
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {forecast.forecasts.map((item) => <div key={item.horizonHours} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="text-xs text-slate-400">+{item.horizonHours} hours</div><div className="mt-2 text-xl font-bold text-white">{item.predictedDischarge.toLocaleString()} <span className="text-xs text-slate-500">m³/s</span></div></div>)}
        </section>
        <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-white">Historical actual | future ML prediction</h2><p className="text-xs text-slate-500">Past observations are separated from the forecast horizon</p></div><span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-300">{forecast.floodSeverity}</span></div><div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" />Historical actual</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" />Future prediction</span></div><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#243149" strokeDasharray="3 3" /><XAxis dataKey="label" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} /><Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} /><ReferenceLine x="+1h" stroke="#22d3ee" strokeDasharray="4 4" label={{ value: 'FORECAST', fill: '#67e8f9', fontSize: 10 }} /><Area type="monotone" dataKey="actual" stroke="#94a3b8" fill="none" connectNulls name="Actual" /><Area type="monotone" dataKey="predicted" stroke="#22d3ee" fill="url(#forecastFill)" connectNulls name="Predicted" /></AreaChart></ResponsiveContainer></div><p className="mt-2 text-[10px] text-slate-500">Spread shown in model metadata is Random Forest tree spread, not a calibrated confidence interval.</p></div>
          <div className="space-y-5"><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="font-bold text-white">What the model learned</h2><div className="mt-4 space-y-3">{topFeatures.map(([name, value]) => { const importance = Number(value); return <div key={name}><div className="flex justify-between text-xs"><span className="text-slate-300">{FEATURE_LABELS[name] || name}</span><span className="font-mono text-cyan-300">{(importance * 100).toFixed(1)}%</span></div><div className="mt-1 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(3, importance * 100)}%` }} /></div></div>; })}</div></div><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="font-bold text-white">Model performance</h2><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><div className="text-lg font-bold text-white">{metrics?.mae ?? '-'} </div><div className="text-[10px] text-slate-500">MAE</div></div><div><div className="text-lg font-bold text-white">{metrics?.rmse ?? '-'}</div><div className="text-[10px] text-slate-500">RMSE</div></div><div><div className="text-lg font-bold text-white">{metrics?.r2 ?? '-'}</div><div className="text-[10px] text-slate-500">R²</div></div></div><div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Database className="w-3.5 h-3.5 text-cyan-400" />{forecast.model} · {forecast.modelVersion} · {forecast.training.records} records</div></div></div>
        </section>
      </>}
    </div>
  );
};
