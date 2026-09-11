export type FailureMode = 'full_breach' | 'partial_breach' | 'piping_failure' | 'overtopping' | 'gate_release' | 'compound_rainfall_breach';

export type SolverType = 'Delft3D-FM' | 'HEC-RAS 2D' | 'SPH-DualSPHysics' | 'Surrogate-2D';

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type DataSourceProvenance = 'LIVE' | 'CACHED' | 'USER_UPLOADED' | 'SIMULATED' | 'ESTIMATED';

export interface DamRecord {
  id: string;
  name: string;
  ndsaId: string;
  river: string;
  basin: string;
  state: string;
  country?: string;
  lat: number;
  lon: number;
  heightM: number;
  crestLengthM: number;
  storageCapacityMCM: number; // Million Cubic Meters
  fullReservoirLevelM: number; // FRL
  maximumWaterLevelM: number; // MWL
  designDischargeCusecs: number;
  yearBuilt: number;
  damType: string;
  status: string;
  downstreamSettlements: string[];
  thumbnailUrl?: string;
  wikipediaUrl?: string;
  summary?: string;
  osmId?: string;
  liveWeather?: {
    temperatureC: number;
    precipitationMmPerHr: number;
    windSpeedKmh: number;
    surfacePressureHpa?: number;
  };
  liveDischargeCumecs?: number;
  provenance: {
    source: string;
    sourceUrl: string;
    retrievedAt: string;
    version: string;
    mode: DataSourceProvenance;
  };
  reservoir: {
    areaSqKm: number;
    elevationRangeM: [number, number];
    polygon: [number, number][]; // Lat, Lon
  };
  riverReach: {
    totalLengthKm: number;
    coordinates: [number, number][]; // Thalweg polyline
  };
}

export interface GlobalDamSearchResult {
  id: string;
  osmId: string;
  name: string;
  displayName: string;
  river?: string;
  basin?: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  heightM?: number;
  crestLengthM?: number;
  material?: string;
  yearBuilt?: number;
  operator?: string;
  wikipedia?: string;
  wikidata?: string;
  importance?: number;
  source: 'OpenStreetMap' | 'Curated';
}

export interface ScenarioConfig {
  id: string;
  name: string;
  damId: string;
  mode: FailureMode;
  solver: SolverType;
  initialWaterLevelM: number; // Initial Reservoir Stage
  breachWidthM: number; // Characteristic breach bottom width
  breachFormationTimeMin: number; // Formation time in minutes
  breachDepthM: number; // Depth of breach invert
  manningRoughness: number; // 0.025 to 0.08
  inflowDischargeCumecs: number; // Inflow baseline / peak hydrograph
  simulationDurationHours: number; // typically 6 to 24 hrs
  outputIntervalMin: number; // 15 or 30 min
  rainfallMmPerHr: number;
  notes?: string;
  createdAt: string;
}

export interface SimulationJob {
  id: string;
  scenarioId: string;
  damId: string;
  scenarioName: string;
  solver: SolverType;
  status: JobStatus;
  progress: number; // 0 to 100
  startedAt: string;
  completedAt?: string;
  inputsVersion: string;
  logs: string[];
  executionTimeSec?: number;
  resultManifest?: SimulationResultManifest;
}

export interface GaugeReading {
  gaugeId: string;
  name: string;
  distanceKm: number;
  lat: number;
  lon: number;
  arrivalMinutes: number;
  peakDepthM: number;
  peakVelocityMs: number;
  peakDischargeCumecs: number;
  hydrograph: { timeHours: number; depthM: number; dischargeCumecs: number; velocityMs: number }[];
}

export interface FloodTimeStep {
  timeHours: number;
  label: string;
  inundatedAreaSqKm: number;
  maxDepthM: number;
  maxVelocityMs: number;
  frontDistanceKm: number;
  // Simplified polygon bounds for fast rendering at this time step
  floodPolygons: {
    path: [number, number][];
    depthM: number;
    velocityMs: number;
    hazardLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  }[];
}

export interface CriticalAssetImpact {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'bridge' | 'substation' | 'road' | 'community';
  lat: number;
  lon: number;
  distanceFromDamKm: number;
  estimatedArrivalHours: number;
  inundationDepthM: number;
  velocityMs: number;
  status: 'Inundated' | 'At Risk' | 'Safe' | 'Submerged';
  evacuationPriority: 'Immediate' | 'High' | 'Moderate' | 'Low';
}

export interface ImpactSummary {
  simulationId: string;
  populationExposed: number;
  highRiskPopulation: number;
  buildingsExposed: number;
  submergedRoadKm: number;
  hospitalsAtRisk: number;
  schoolsAtRisk: number;
  bridgesAtRisk: number;
  powerSubstationsAtRisk: number;
  agriculturalAreaSubmergedHa: number;
  economicLossEstimateCrINR: number;
  criticalAssets: CriticalAssetImpact[];
  lulcBreakdown: { category: string; areaHa: number; percentage: number }[];
  evacuationZones: {
    zoneId: string;
    name: string;
    urgency: 'Immediate (0-2h)' | 'Urgent (2-6h)' | 'Watch (6-12h)' | 'Safe Staging';
    population: number;
    recommendedShelter: string;
    evacuationRouteClear: boolean;
  }[];
}

export interface SatelliteValidationResult {
  simulationId: string;
  satelliteSensor: string; // 'Sentinel-1 C-SAR' | 'Sentinel-2 MSI'
  satellitePassDate: string;
  orbitPass: 'Ascending' | 'Descending';
  polarization: 'VV + VH';
  baselinePermanentWaterExcluded: boolean;
  simulatedAreaSqKm: number;
  satelliteObservedAreaSqKm: number;
  intersectionAreaSqKm: number;
  iouScore: number; // Intersection over Union (Jaccard)
  precision: number;
  recall: number;
  f1Score: number;
  kappaCoefficient: number;
  qualityFlag: 'Validated - High Agreement' | 'Acceptable Agreement' | 'Partial Cloud/Radar Shadow' | 'No Valid Observation';
  differenceMaskUrl?: string;
  provenance: {
    geeAssetId: string;
    copernicusTileId: string;
    processedTimestamp: string;
    jrcBaselineYear: number;
  };
}

export interface SimulationResultManifest {
  simulationId: string;
  scenarioId: string;
  solverUsed: SolverType;
  damName: string;
  peakBreachDischargeCumecs: number;
  totalVolumeReleasedMCM: number;
  maxFloodDepthM: number;
  maxFloodVelocityMs: number;
  totalInundationAreaSqKm: number;
  earliestArrivalTimeMin: number;
  timeSteps: FloodTimeStep[];
  gauges: GaugeReading[];
  impact: ImpactSummary;
  satelliteValidation?: SatelliteValidationResult;
  vulnerabilityZones?: {
    zone: string;
    score: number;
    trigger: string;
    action: string;
    lat: number;
    lon: number;
  }[];
  provenance: {
    demSource: string;
    roughnessSchema: string;
    solverVersion: string;
    generatedAt: string;
    meshResolutionM: number;
  };
}

export interface DataServiceStatus {
  id: string;
  name: string;
  category: 'National Water Portal' | 'Satellite Observation' | 'Terrain & DEM' | 'Hydrology' | 'Infrastructure';
  url: string;
  lastChecked: string;
  latencyMs: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'USING_CACHE';
  cacheTimestamp: string;
  cachedRecordsCount: number;
  license: string;
}
