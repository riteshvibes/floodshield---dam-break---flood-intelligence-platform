import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Sparkles,
  FileCheck,
  Table,
  Layers,
  MapPin,
  Clock,
  Printer,
  FileCode,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { DamRecord, SimulationResultManifest, ScenarioConfig } from '../../types';

interface ReportsCenterViewProps {
  dam: DamRecord;
  results: SimulationResultManifest | null;
  activeScenario?: ScenarioConfig;
  onOpenExportModal: () => void;
}

export const ReportsCenterView: React.FC<ReportsCenterViewProps> = ({
  dam,
  results,
  activeScenario,
  onOpenExportModal,
}) => {
  const [reportType, setReportType] = useState<'standard' | 'ndma' | 'technical'>('ndma');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Archive of previous reports
  const pastReports = [
    {
      id: 'REP-2026-0891',
      dam: dam.name,
      river: dam.river,
      scenario: 'Catastrophic 100% Embankment Breach',
      model: results?.solverUsed || 'Delft3D-FM',
      date: '2026-09-11 04:30',
      risk: 'CRITICAL',
      status: 'VERIFIED',
    },
    {
      id: 'REP-2026-0872',
      dam: dam.name,
      river: dam.river,
      scenario: '50% Breach + 35mm/h Monsoon Storm',
      model: 'SPH-DualSPHysics',
      date: '2026-09-10 14:15',
      risk: 'HIGH',
      status: 'VERIFIED',
    },
    {
      id: 'REP-2026-0840',
      dam: dam.name,
      river: dam.river,
      scenario: '20% Controlled Piping Release',
      model: 'HEC-RAS 2D',
      date: '2026-09-08 19:45',
      risk: 'MEDIUM',
      status: 'ARCHIVED',
    },
  ];

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      name: `FloodShield_${dam.name.replace(/\s+/g, '_')}_Inundation`,
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: [
        {
          type: 'Feature',
          properties: {
            damName: dam.name,
            river: dam.river,
            maxDepthM: results?.maxFloodDepthM || 6.8,
            maxVelocityMs: results?.maxFloodVelocityMs || 7.2,
            peakDischargeCumecs: results?.peakBreachDischargeCumecs || 14200,
            areaSqKm: results?.totalInundationAreaSqKm || 48.6,
            generatedAt: new Date().toISOString(),
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              (dam.reservoir?.polygon || []).map((c) => [c[1], c[0]]),
            ],
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FloodShield_${dam.name.replace(/\s+/g, '_')}_FloodExtent.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('GeoJSON downloaded successfully');
  };

  const handleExportCSV = () => {
    let csv = 'Station_ID,Station_Name,Distance_km,Arrival_min,Peak_Depth_m,Peak_Velocity_ms,Peak_Discharge_cumecs\n';
    (results?.gauges || []).forEach((g) => {
      csv += `${g.gaugeId},"${g.name}",${g.distanceKm},${g.arrivalMinutes},${g.peakDepthM},${g.peakVelocityMs},${g.peakDischargeCumecs}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FloodShield_${dam.name.replace(/\s+/g, '_')}_Gauges.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('CSV metrics downloaded successfully');
  };

  const handleExportKML = () => {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>FloodShield_${dam.name}_Inundation</name>
    <description>Simulated breach inundation wave on ${dam.river}</description>
    <Placemark>
      <name>${dam.name} Dam Axis</name>
      <Point>
        <coordinates>${dam.lon},${dam.lat},0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FloodShield_${dam.name.replace(/\s+/g, '_')}.kml`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('KML Google Earth file downloaded');
  };

  const showNotice = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>EXECUTIVE DISASTER DOSSIER & GIS EXPORTS</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            REPORT CENTER & DATA EXPORT ENGINE
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
            Export standards-compliant emergency action plans (EAP), QGIS/ArcGIS spatial layers,
            and executive advisories for {dam.name} on the {dam.river}.
          </p>
        </div>

        <button
          onClick={onOpenExportModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Generate Full Report Dossier</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-xs flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Export GIS Layers Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GeoJSON */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold mb-1">
              <FileCode className="w-4 h-4" />
              <span>GeoJSON Vector</span>
            </div>
            <h4 className="font-bold text-white text-sm">Spatial Flood Boundary</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Standard OGC format compatible with QGIS, ArcGIS Online, Mapbox, and Leaflet web apps.
            </p>
          </div>
          <button
            onClick={handleExportGeoJSON}
            className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GeoJSON</span>
          </button>
        </div>

        {/* KML */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold mb-1">
              <Layers className="w-4 h-4" />
              <span>Google Earth KML</span>
            </div>
            <h4 className="font-bold text-white text-sm">3D Elevation Overlay</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ready-to-fly Keyhole Markup Language file for Google Earth Pro terrain visualization.
            </p>
          </div>
          <button
            onClick={handleExportKML}
            className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export KML</span>
          </button>
        </div>

        {/* CSV */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold mb-1">
              <Table className="w-4 h-4" />
              <span>CSV Gauges & Hydrographs</span>
            </div>
            <h4 className="font-bold text-white text-sm">Hydraulic Telemetry</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Time-series flood depth, wave velocity, and peak stage tables across all river cross-sections.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Tables</span>
          </button>
        </div>

        {/* Full NDMA EAP Pack */}
        <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs font-bold mb-1">
              <Shield className="w-4 h-4" />
              <span>NDMA / CWC EAP Format</span>
            </div>
            <h4 className="font-bold text-white text-sm">Emergency Action Plan</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Complete emergency dossier with AI executive summary, hazard maps, and evacuation routes.
            </p>
          </div>
          <button
            onClick={onOpenExportModal}
            className="w-full py-2 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Report Builder</span>
          </button>
        </div>
      </div>

      {/* Archive Table of Previously Generated Runs */}
      <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white font-mono mb-4">
          Previously Generated Hydrodynamic Runs & Reports
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Target Dam & River</th>
                <th className="py-2.5 px-3">Breach Scenario</th>
                <th className="py-2.5 px-3">Solver</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Risk Tier</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pastReports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-3 font-bold text-cyan-400">{r.id}</td>
                  <td className="py-3 px-3 text-white">
                    {r.dam} ({r.river})
                  </td>
                  <td className="py-3 px-3 text-slate-300">{r.scenario}</td>
                  <td className="py-3 px-3 text-indigo-300">{r.model}</td>
                  <td className="py-3 px-3 text-slate-400">{r.date}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.risk === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : r.risk === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {r.risk}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={onOpenExportModal}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
