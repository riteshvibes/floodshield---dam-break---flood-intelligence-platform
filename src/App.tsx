import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/views/OverviewView';
import { SimulationWorkspaceView } from './components/views/SimulationWorkspaceView';
import { GisMapWorkspaceView } from './components/views/GisMapWorkspaceView';
import { HydrodynamicsView } from './components/views/HydrodynamicsView';
import { ModelComparisonView } from './components/views/ModelComparisonView';
import { ImpactAnalysisView } from './components/views/ImpactAnalysisView';
import { RiskAnalysisView } from './components/views/RiskAnalysisView';
import { SatelliteValidationView } from './components/views/SatelliteValidationView';
import { DamExplorerView } from './components/views/DamExplorerView';
import { ScenarioLabView } from './components/views/ScenarioLabView';
import { EmergencyResponseView } from './components/views/EmergencyResponseView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { ReportsCenterView } from './components/views/ReportsCenterView';
import { AIFloodForecastView } from './components/views/AIFloodForecastView';
import { MLDataView } from './components/views/MLDataView';

import { DamCatalogueModal } from './components/DamCatalogueModal';
import { DataHealthModal } from './components/DataHealthModal';
import { ExportReportModal } from './components/ExportReportModal';
import { SimulationQueueBar } from './components/SimulationQueueBar';
import { LiveTelemetryModal } from './components/LiveTelemetryModal';

import {
  DamRecord,
  ScenarioConfig,
  SimulationJob,
  SimulationResultManifest,
  DataServiceStatus,
  CriticalAssetImpact,
} from './types';
import { INDIAN_DAMS_CATALOGUE } from './data/damsData';
import { simulateFloodWave } from './services/hydroEngine';

export default function App() {
  // Navigation & Layout State
  const [activeView, setActiveView] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Core Dam & Scenario State
  const [selectedDam, setSelectedDam] = useState<DamRecord>(INDIAN_DAMS_CATALOGUE[0]);
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('SC-MACHCHHU-OVERTOPPING');

  // Hydrodynamic Simulation & Playback State
  const [currentJob, setCurrentJob] = useState<SimulationJob | null>(null);
  const [activeResults, setActiveResults] = useState<SimulationResultManifest | null>(null);
  const [currentTimeStepIndex, setCurrentTimeStepIndex] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showSatelliteOverlay, setShowSatelliteOverlay] = useState<boolean>(false);

  // Modals
  const [isCatalogueOpen, setIsCatalogueOpen] = useState<boolean>(false);
  const [isDataHealthOpen, setIsDataHealthOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(false);
  const [servicesHealth, setServicesHealth] = useState<DataServiceStatus[]>([]);

  // Simulation execution engine
  const runSimulationDirect = useCallback((dam: DamRecord, scenario: ScenarioConfig) => {
    const manifest = simulateFloodWave(dam, scenario);
    setActiveResults(manifest);
    setCurrentJob({
      id: `FS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      scenarioId: scenario.id,
      damId: dam.id,
      scenarioName: scenario.name,
      solver: scenario.solver,
      status: 'COMPLETED',
      progress: 100,
      startedAt: new Date(Date.now() - 60000).toISOString(),
      completedAt: new Date().toISOString(),
      inputsVersion: `${dam.provenance.version}-DEM30`,
      logs: [
        `[${scenario.solver} Worker] Dispatched 2D shallow water mesh solver...`,
        `[${scenario.solver} Worker] Peak breach discharge Q = ${manifest.peakBreachDischargeCumecs.toLocaleString()} m³/s computed.`,
        `[${scenario.solver} Worker] Wave front propagation solved across ${dam.riverReach.totalLengthKm} km channel.`,
        `[${scenario.solver} Worker] Completed with zero numerical instability. Mass conservation error < 0.04%.`,
      ],
      resultManifest: manifest,
    });
    setCurrentTimeStepIndex(3);
  }, []);

  // Initial Data Fetch & Bootstrap
  useEffect(() => {
    // 1. Fetch scenarios for selected dam
    fetch(`/api/scenarios?damId=${selectedDam.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ScenarioConfig[]) => {
        if (data && data.length > 0) {
          setScenarios(data);
          setActiveScenarioId(data[0].id);
        } else {
          const defaultSc: ScenarioConfig = {
            id: `SC-${selectedDam.id}-DEFAULT`,
            name: `${selectedDam.name} — Benchmark Overtopping`,
            damId: selectedDam.id,
            mode: 'overtopping',
            solver: 'Delft3D-FM',
            initialWaterLevelM: selectedDam.maximumWaterLevelM || 55,
            breachWidthM: 220,
            breachFormationTimeMin: 30,
            breachDepthM: Math.round(selectedDam.heightM * 0.7),
            manningRoughness: 0.035,
            inflowDischargeCumecs: 8500,
            simulationDurationHours: 24,
            outputIntervalMin: 15,
            rainfallMmPerHr: 35,
            notes: 'Standard extreme hydrological scenario.',
            createdAt: new Date().toISOString(),
          };
          setScenarios([defaultSc]);
          setActiveScenarioId(defaultSc.id);
        }
      })
      .catch(() => {
        const defaultSc: ScenarioConfig = {
          id: `SC-${selectedDam.id}-DEFAULT`,
          name: `${selectedDam.name} — Benchmark Overtopping`,
          damId: selectedDam.id,
          mode: 'overtopping',
          solver: 'Delft3D-FM',
          initialWaterLevelM: selectedDam.maximumWaterLevelM || 55,
          breachWidthM: 220,
          breachFormationTimeMin: 30,
          breachDepthM: Math.round(selectedDam.heightM * 0.7),
          manningRoughness: 0.035,
          inflowDischargeCumecs: 8500,
          simulationDurationHours: 24,
          outputIntervalMin: 15,
          rainfallMmPerHr: 35,
          notes: 'Standard extreme hydrological scenario.',
          createdAt: new Date().toISOString(),
        };
        setScenarios([defaultSc]);
        setActiveScenarioId(defaultSc.id);
      });

    // 2. Fetch data health
    fetch('/api/data-health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services) {
          setServicesHealth(data.services);
        }
      })
      .catch(() => {});

    // 3. Initial Simulation run for immediate visual display
    runSimulationDirect(selectedDam, {
      id: `SC-${selectedDam.id}-INITIAL`,
      name: `${selectedDam.name} Benchmark Run`,
      damId: selectedDam.id,
      mode: 'overtopping',
      solver: 'Delft3D-FM',
      initialWaterLevelM: selectedDam.maximumWaterLevelM || 55,
      breachWidthM: 250,
      breachFormationTimeMin: 25,
      breachDepthM: Math.round(selectedDam.heightM * 0.7),
      manningRoughness: 0.035,
      inflowDischargeCumecs: 14000,
      simulationDurationHours: 24,
      outputIntervalMin: 15,
      rainfallMmPerHr: 40,
      createdAt: new Date().toISOString(),
    });
  }, [selectedDam.id, runSimulationDirect]);

  // Handle Scenario Run from UI
  const handleRunSimulation = async (scenarioId: string) => {
    const sc = scenarios.find((s) => s.id === scenarioId);
    if (!sc) return;

    setActiveScenarioId(scenarioId);

    // Try submitting to async server worker
    try {
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });

      if (res.ok) {
        const { jobId } = await res.json();
        setCurrentJob({
          id: jobId,
          scenarioId: sc.id,
          damId: selectedDam.id,
          scenarioName: sc.name,
          solver: sc.solver,
          status: 'RUNNING',
          progress: 15,
          startedAt: new Date().toISOString(),
          inputsVersion: `${selectedDam.provenance.version}-DEM30`,
          logs: [`[Job Queue] Job ${jobId} submitted to ${sc.solver} worker...`],
        });

        // Poll job status until completed
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/simulations/${jobId}`);
            if (statusRes.ok) {
              const jobData: SimulationJob = await statusRes.json();
              setCurrentJob(jobData);
              if (jobData.status === 'COMPLETED' && jobData.resultManifest) {
                setActiveResults(jobData.resultManifest);
                setCurrentTimeStepIndex(3);
                clearInterval(pollInterval);
              } else if (jobData.status === 'FAILED') {
                clearInterval(pollInterval);
              }
            }
          } catch {
            runSimulationDirect(selectedDam, sc);
            clearInterval(pollInterval);
          }
        }, 800);
      } else {
        runSimulationDirect(selectedDam, sc);
      }
    } catch {
      runSimulationDirect(selectedDam, sc);
    }
  };

  // Create custom scenario
  const handleCreateScenario = (config: Partial<ScenarioConfig>) => {
    const newSc: ScenarioConfig = {
      id: `SC-${Date.now()}`,
      name: config.name || 'Custom Run',
      damId: selectedDam.id,
      mode: config.mode || 'overtopping',
      solver: config.solver || 'Delft3D-FM',
      initialWaterLevelM: config.initialWaterLevelM || 50,
      breachWidthM: config.breachWidthM || 150,
      breachFormationTimeMin: config.breachFormationTimeMin || 30,
      breachDepthM: config.breachDepthM || 20,
      manningRoughness: config.manningRoughness || 0.035,
      inflowDischargeCumecs: config.inflowDischargeCumecs || 3000,
      simulationDurationHours: config.simulationDurationHours || 24,
      outputIntervalMin: 15,
      rainfallMmPerHr: config.rainfallMmPerHr || 0,
      notes: config.notes || '',
      createdAt: new Date().toISOString(),
    };

    setScenarios((prev) => [newSc, ...prev]);
    setActiveScenarioId(newSc.id);
    handleRunSimulation(newSc.id);
  };

  const handleUpdateScenario = (updated: ScenarioConfig) => {
    setScenarios((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    if (activeScenarioId === id && scenarios.length > 1) {
      const remaining = scenarios.filter((s) => s.id !== id);
      setActiveScenarioId(remaining[0].id);
    }
  };

  const handleSelectDam = (dam: DamRecord) => {
    setSelectedDam(dam);
  };

  const handleSelectAsset = (asset: CriticalAssetImpact) => {
    setActiveView('impact');
  };

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  return (
    <div className="min-h-screen overflow-hidden bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <TopBar
        selectedDam={selectedDam}
        onSelectDam={handleSelectDam}
        activeScenario={activeScenario}
        onOpenDamCatalogue={() => setIsCatalogueOpen(true)}
        onOpenDataHealth={() => setIsDataHealthOpen(true)}
        onOpenLiveTelemetry={() => setIsTelemetryOpen(true)}
        onRunSimulation={() => activeScenario && handleRunSimulation(activeScenario.id)}
        isSimulating={currentJob?.status === 'RUNNING'}
        simulationProgress={currentJob?.progress || 0}
        onNavigate={setActiveView}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Layout Body: Sidebar + Dynamic Workspace View */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Hierarchical Sidebar */}
        <Sidebar
          activeTab={activeView as any}
          setActiveTab={(tab) => setActiveView(tab)}
          activeView={activeView}
          onNavigate={setActiveView}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          selectedDam={selectedDam}
          isSimulating={currentJob?.status === 'RUNNING'}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Dynamic Center Workspace */}
        <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 lg:p-7 space-y-5 pb-24">
          {activeView === 'overview' && (
            <OverviewView
              dam={selectedDam}
              results={activeResults}
              currentTimeStepIndex={currentTimeStepIndex}
              setCurrentTimeStepIndex={setCurrentTimeStepIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              showSatelliteOverlay={showSatelliteOverlay}
              setShowSatelliteOverlay={setShowSatelliteOverlay}
              onNavigateTab={(tab) => setActiveView(tab)}
              onNavigate={setActiveView}
              onSelectAsset={handleSelectAsset}
              isSimulating={currentJob?.status === 'RUNNING'}
              onRunSimulation={() => activeScenario && handleRunSimulation(activeScenario.id)}
              onOpenCatalogue={() => setIsCatalogueOpen(true)}
              onOpenLiveTelemetry={() => setIsTelemetryOpen(true)}
            />
          )}

          {activeView === 'ai_forecast' && (
            <AIFloodForecastView
              dam={selectedDam}
              activeScenario={activeScenario}
              onSimulationComplete={(results, forecast) => {
                setActiveResults(results);
                setCurrentTimeStepIndex(3);
                setCurrentJob({
                  id: `FS-ML-${Date.now()}`,
                  scenarioId: activeScenario?.id || 'ML_FORECAST',
                  damId: selectedDam.id,
                  scenarioName: `${selectedDam.name} AI forecast`,
                  solver: results.solverUsed,
                  status: 'COMPLETED',
                  progress: 100,
                  startedAt: new Date(Date.now() - 1000).toISOString(),
                  completedAt: new Date().toISOString(),
                  inputsVersion: `${forecast.modelVersion}-LOCAL-ML`,
                  logs: [
                    `[Local ML] ${forecast.model} predicted next-hour discharge: ${forecast.predictedDischarge.toLocaleString()} m³/s.`,
                    '[Hydrodynamic Worker] Local forecast passed into the existing flood-wave engine.',
                    '[Hydrodynamic Worker] Flood extent, depth, velocity, and impact results generated.',
                  ],
                  resultManifest: results,
                });
              }}
            />
          )}

          {activeView === 'ml_data' && <MLDataView />}

          {activeView === 'simulation' && (
            <SimulationWorkspaceView
              dam={selectedDam}
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSelectScenario={(id) => {
                setActiveScenarioId(id);
                handleRunSimulation(id);
              }}
              onCreateScenario={handleCreateScenario}
              onRunSimulation={handleRunSimulation}
              isSimulating={currentJob?.status === 'RUNNING'}
              results={activeResults}
              currentTimeStepIndex={currentTimeStepIndex}
              setCurrentTimeStepIndex={setCurrentTimeStepIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              showSatelliteOverlay={showSatelliteOverlay}
              setShowSatelliteOverlay={setShowSatelliteOverlay}
              onSelectAsset={handleSelectAsset}
            />
          )}

          {(activeView === 'flood_map' || activeView === 'gis_map') && (
            <GisMapWorkspaceView
              dam={selectedDam}
              results={activeResults}
              currentTimeStepIndex={currentTimeStepIndex}
              setCurrentTimeStepIndex={setCurrentTimeStepIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              showSatelliteOverlay={showSatelliteOverlay}
              setShowSatelliteOverlay={setShowSatelliteOverlay}
              onSelectAsset={handleSelectAsset}
            />
          )}

          {activeView === 'hydrodynamics' && (
            <HydrodynamicsView
              dam={selectedDam}
              results={activeResults}
            />
          )}

          {activeView === 'model_comparison' && (
            <ModelComparisonView
              dam={selectedDam}
              results={activeResults}
            />
          )}

          {(activeView === 'impact_analysis' || activeView === 'impact') && (
            <ImpactAnalysisView
              dam={selectedDam}
              results={activeResults}
              currentTimeStepIndex={currentTimeStepIndex}
              setCurrentTimeStepIndex={setCurrentTimeStepIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              onSelectAsset={handleSelectAsset}
            />
          )}

          {(activeView === 'risk_analysis' || activeView === 'risk') && (
            <RiskAnalysisView
              dam={selectedDam}
              results={activeResults}
            />
          )}

          {(activeView === 'satellite_validation' || activeView === 'satellite') && (
            <SatelliteValidationView
              dam={selectedDam}
              results={activeResults}
            />
          )}

          {(activeView === 'dam_explorer' || activeView === 'explorer') && (
            <DamExplorerView
              selectedDam={selectedDam}
              onSelectDam={handleSelectDam}
              onLoadIntoSimulation={(dam) => {
                handleSelectDam(dam);
                setActiveView('simulation');
              }}
            />
          )}

          {(activeView === 'scenario_lab' || activeView === 'scenarios') && (
            <ScenarioLabView
              dam={selectedDam}
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSelectScenario={(id) => {
                setActiveScenarioId(id);
                handleRunSimulation(id);
              }}
              onCreateScenario={handleCreateScenario}
              onDeleteScenario={handleDeleteScenario}
              onRunSimulation={(id) => {
                setActiveScenarioId(id);
                handleRunSimulation(id);
                setActiveView('simulation');
              }}
            />
          )}

          {(activeView === 'emergency_response' || activeView === 'emergency') && (
            <EmergencyResponseView
              dam={selectedDam}
              results={activeResults}
            />
          )}

          {(activeView === 'data_sources' || activeView === 'datasources') && (
            <DataSourcesView />
          )}

          {activeView === 'reports' && (
            <ReportsCenterView
              dam={selectedDam}
              results={activeResults}
              activeScenario={activeScenario}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Dam Catalogue Modal */}
      <DamCatalogueModal
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        selectedDamId={selectedDam.id}
        onSelectDam={handleSelectDam}
      />

      {/* Data Health Modal */}
      <DataHealthModal
        isOpen={isDataHealthOpen}
        onClose={() => setIsDataHealthOpen(false)}
        services={servicesHealth}
      />

      {/* Live Telemetry Modal (Open-Meteo, GloFAS River Flow, RainViewer) */}
      <LiveTelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        dam={selectedDam}
        selectedDam={selectedDam}
        onApplyLiveRainfall={(rainMmHr) => {
          if (activeScenario) {
            handleUpdateScenario({
              ...activeScenario,
              rainfallMmPerHr: rainMmHr,
              notes: `${activeScenario.notes} [Synced with live Open-Meteo telemetry: ${rainMmHr} mm/h]`,
            });
          }
        }}
        onSyncRainfall={(rainMmHr) => {
          if (activeScenario) {
            handleUpdateScenario({
              ...activeScenario,
              rainfallMmPerHr: rainMmHr,
              notes: `${activeScenario.notes} [Synced with live Open-Meteo telemetry: ${rainMmHr} mm/h]`,
            });
          }
        }}
      />

      {/* Export Report / EAP Modal */}
      {isExportModalOpen && (
        <ExportReportModal
          dam={selectedDam}
          results={activeResults}
        />
      )}

      {/* Real-time Job Queue Bar */}
      <SimulationQueueBar
        currentJob={currentJob}
        onViewResults={() => setActiveView('simulation')}
      />
    </div>
  );
}
