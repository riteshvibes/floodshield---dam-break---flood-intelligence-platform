import React from 'react';
import {
  Server,
  Database,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Layers,
  Cpu,
  Globe,
  Radio,
} from 'lucide-react';

interface DataSourceRecord {
  name: string;
  agency: string;
  category: 'Terrain' | 'Hydrology' | 'Demographics' | 'Infrastructure' | 'Satellite';
  purpose: string;
  resolution: string;
  status: 'ONLINE' | 'CONNECTED' | 'CACHED' | 'STANDBY';
  statusColor: string;
  lastUpdate: string;
  dataQuality: string;
  coverage: string;
}

export const DataSourcesView: React.FC = () => {
  const sources: DataSourceRecord[] = [
    {
      name: 'Copernicus DEM GLO-30',
      agency: 'European Space Agency (ESA)',
      category: 'Terrain',
      purpose: 'High-accuracy 30m digital surface model for hydrodynamic bathymetry & floodplain routing.',
      resolution: '30m horizontal / 1m vertical',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: '2026-09-10 18:30 IST',
      dataQuality: 'Grade A (Validated)',
      coverage: 'Pan-India Catchments',
    },
    {
      name: 'SRTM 1-Arc Second DEM',
      agency: 'NASA / USGS',
      category: 'Terrain',
      purpose: 'Secondary baseline topography validation and steep slope verification.',
      resolution: '30m global',
      status: 'CACHED',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      lastUpdate: '2026-08-15 Archival',
      dataQuality: 'Grade B (Vegetation Noise)',
      coverage: 'Global Landmass',
    },
    {
      name: 'India-WRIS / NWDP Portal',
      agency: 'Ministry of Jal Shakti / CWC',
      category: 'Hydrology',
      purpose: 'Real-time dam storage ratings, full reservoir levels (FRL), design flood discharges & gate telemetry.',
      resolution: 'Hourly Station Feed',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: '2026-09-11 04:00 IST',
      dataQuality: 'Official Indian Benchmark',
      coverage: '5,334 Large Dams',
    },
    {
      name: 'Central Water Commission (CWC)',
      agency: 'Government of India',
      category: 'Hydrology',
      purpose: 'River basin boundaries, downstream gauging stations, and stage-discharge rating tables.',
      resolution: 'Sub-basin scale',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: '2026-09-10 22:00 IST',
      dataQuality: 'High Precision In-Situ',
      coverage: 'Major Indian Basins',
    },
    {
      name: 'IMD Doppler Weather Radar & NWP',
      agency: 'India Meteorological Dept',
      category: 'Hydrology',
      purpose: 'Catchment rainfall precipitation rates (mm/hr) for compound flood simulation.',
      resolution: '0.25° Gridded Rainfall',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: '2026-09-11 03:30 IST',
      dataQuality: 'Radar Calibrated',
      coverage: 'National Radar Network',
    },
    {
      name: 'NASA GPM IMERG Precipitation',
      agency: 'NASA / JAXA',
      category: 'Hydrology',
      purpose: 'Multi-satellite calibrated precipitation accumulation for remote transboundary basins.',
      resolution: '0.1° (Half-Hourly)',
      status: 'CONNECTED',
      statusColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      lastUpdate: '2026-09-11 01:00 IST',
      dataQuality: 'Satellite Microwave/IR',
      coverage: 'Lat 60°N–60°S',
    },
    {
      name: 'Google Earth Engine (GEE)',
      agency: 'Google Cloud API',
      category: 'Satellite',
      purpose: 'Cloud raster computation, Otsu radar thresholding, and SAR temporal change detection.',
      resolution: 'Multi-Scale Pyramids',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: 'Active Session',
      dataQuality: 'High-Throughput HPC',
      coverage: 'Planetary Archives',
    },
    {
      name: 'Sentinel-1 C-SAR IW GRD',
      agency: 'Copernicus / ESA',
      category: 'Satellite',
      purpose: 'Synthetic Aperture Radar all-weather water delineation and ground-truth validation.',
      resolution: '10m spatial pixel',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: '2026-09-08 Descending',
      dataQuality: 'Sub-pixel Radar Mask',
      coverage: '6–12 Day Revisit',
    },
    {
      name: 'Sentinel-2 MSI Optical',
      agency: 'Copernicus / ESA',
      category: 'Satellite',
      purpose: 'Multispectral water indexing (NDWI / MNDWI) for cloud-free validation.',
      resolution: '10m / 20m VNIR-SWIR',
      status: 'CACHED',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      lastUpdate: '2026-09-04 Scene',
      dataQuality: 'Optical Level-2A BOA',
      coverage: '5-Day Revisit',
    },
    {
      name: 'WorldPop 2025 Demographics',
      agency: 'University of Southampton',
      category: 'Demographics',
      purpose: 'High-resolution population density grids for vulnerable civilian exposure calculation.',
      resolution: '100m spatial grid',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: '2025 Census Calibrated',
      dataQuality: 'Peer-Reviewed Demographic',
      coverage: 'National Coverage',
    },
    {
      name: 'OpenStreetMap (OSM) Overpass',
      agency: 'OSM Foundation / Contributors',
      category: 'Infrastructure',
      purpose: 'Building footprints, road networks, bridge spans, hospitals, schools, and substations.',
      resolution: 'Vector Geometries',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: '2026-09-10 Nightly',
      dataQuality: 'Continuous Community QA',
      coverage: 'Global Vectors',
    },
    {
      name: 'ESA WorldCover 10m LULC',
      agency: 'European Space Agency (ESA)',
      category: 'Terrain',
      purpose: 'Land-use and land-cover classification for spatially distributed Manning friction roughness $n$.',
      resolution: '10m Sentinel-Derived',
      status: 'ONLINE',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastUpdate: '2024 V2.0',
      dataQuality: '87.4% Overall Accuracy',
      coverage: 'Global Landcover',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>AUTHORITATIVE GEOSPATIAL & HYDROLOGIC FEEDS</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            DATA SOURCES REGISTRY & PROVENANCE
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
            Audit trail of 12 authoritative national and planetary datasets powering the FLOODSHIELD
            dam-break hydrodynamic pipeline.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">ALL 12 FEEDS CONNECTED</span>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src) => (
          <div
            key={src.name}
            className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${src.statusColor}`}>
                  {src.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{src.category}</span>
              </div>

              <h3 className="font-bold text-white text-base leading-snug">{src.name}</h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{src.agency}</div>

              <p className="text-xs text-slate-300 font-sans mt-2.5 leading-relaxed">
                {src.purpose}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Spatial Resolution:</span>
                <span className="text-white font-semibold">{src.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage Domain:</span>
                <span className="text-cyan-300">{src.coverage}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Benchmark:</span>
                <span className="text-emerald-400">{src.dataQuality}</span>
              </div>
              <div className="flex justify-between text-[10px] pt-1 text-slate-500">
                <span>Last Synchronized:</span>
                <span>{src.lastUpdate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
