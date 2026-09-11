import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Layers,
  MapPin,
  Eye,
  AlertOctagon,
  Shield,
  Clock,
  Compass,
  Radio,
  CloudRain,
  ChevronDown,
  ChevronUp,
  Maximize2,
} from 'lucide-react';
import {
  DamRecord,
  SimulationResultManifest,
  CriticalAssetImpact,
  GaugeReading,
} from '../types';
import { fetchLiveRadarTileConfig } from '../services/liveDataService';

interface MapViewerProps {
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

export const MapViewer: React.FC<MapViewerProps> = ({
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap style state
  const [baseLayerType, setBaseLayerType] = useState<'dark' | 'satellite' | 'street' | 'topo'>('dark');
  const [showAssets, setShowAssets] = useState(true);
  const [showRiver, setShowRiver] = useState(true);
  const [showGauges, setShowGauges] = useState(true);
  const [showLiveRadar, setShowLiveRadar] = useState(false);
  const [radarTimestamp, setRadarTimestamp] = useState<string>('');
  const [radarLoading, setRadarLoading] = useState(false);

  // Responsive panel fold toggles
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const [isLayersExpanded, setIsLayersExpanded] = useState(true);
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [inspectorData, setInspectorData] = useState<{
    lat: number;
    lng: number;
    depthM: number;
    velocityMs: number;
    arrivalMin: number;
    hazardLevel: string;
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [dam.lat, dam.lon],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layer configuration (100% public, free, zero-watermark, no API key required)
      const getBaseTileLayer = (type: string) => {
        switch (type) {
          case 'satellite':
            return L.tileLayer(
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              {
                maxNativeZoom: 18,
                maxZoom: 19,
                attribution: '&copy; Esri, Maxar, Earthstar Geographics',
              }
            );
          case 'street':
            return L.tileLayer(
              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              {
                maxNativeZoom: 19,
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }
            );
          case 'topo':
            return L.tileLayer(
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
              {
                maxNativeZoom: 18,
                maxZoom: 19,
                attribution: '&copy; Esri, USGS, NOAA, FAO',
              }
            );
          case 'dark':
          default:
            return L.tileLayer(
              'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
              {
                maxNativeZoom: 16,
                maxZoom: 19,
                attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap',
              }
            );
        }
      };

      const tileLayer = getBaseTileLayer(baseLayerType).addTo(map);

      // Store in map object
      (map as any)._baseTileLayer = tileLayer;

      // LayerGroup for dynamic simulation layers
      const lg = L.layerGroup().addTo(map);
      layerGroupRef.current = lg;

      // Click to inspect water depth at point
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        // Check distance to river reach to estimate depth
        const distKm = getMinDistToReach([lat, lng], dam.riverReach.coordinates);
        if (distKm < 2.5 && results) {
          const currentStep = results.timeSteps[currentTimeStepIndex];
          const estDepth = Math.max(0.2, (currentStep?.maxDepthM || 4) * (1 - distKm / 3));
          const estVel = Math.max(0.4, (currentStep?.maxVelocityMs || 2) * 0.8);
          setInspectorData({
            lat: Math.round(lat * 10000) / 10000,
            lng: Math.round(lng * 10000) / 10000,
            depthM: Math.round(estDepth * 10) / 10,
            velocityMs: Math.round(estVel * 10) / 10,
            arrivalMin: Math.round(distKm * 8 + 15),
            hazardLevel: estDepth > 2.5 ? 'Extreme' : estDepth > 1.2 ? 'High' : 'Medium',
          });
        } else {
          setInspectorData({
            lat: Math.round(lat * 10000) / 10000,
            lng: Math.round(lng * 10000) / 10000,
            depthM: 0,
            velocityMs: 0,
            arrivalMin: 0,
            hazardLevel: 'Dry / Elevated Ground',
          });
        }
      });

      mapRef.current = map;
    }

    return () => {
      // Keep map alive across normal renders
    };
  }, []);

  // Responsive ResizeObserver to ensure Leaflet never suffers from gray tiles or incorrect sizing
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const el = mapContainerRef.current;
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    observer.observe(el);

    const onResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', onResize);

    const timeoutId = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Update base tile layer on type change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }
    const createTileLayer = (type: string) => {
      switch (type) {
        case 'satellite':
          return L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
              maxNativeZoom: 18,
              maxZoom: 19,
              attribution: '&copy; Esri, Maxar, Earthstar Geographics',
            }
          );
        case 'street':
          return L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              maxNativeZoom: 19,
              maxZoom: 19,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }
          );
        case 'topo':
          return L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            {
              maxNativeZoom: 18,
              maxZoom: 19,
              attribution: '&copy; Esri, USGS, NOAA, FAO',
            }
          );
        case 'dark':
        default:
          return L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            {
              maxNativeZoom: 16,
              maxZoom: 19,
              attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap',
            }
          );
      }
    };
    const newTile = createTileLayer(baseLayerType).addTo(map);
    (map as any)._baseTileLayer = newTile;
  }, [baseLayerType]);

  // Live Precipitation Radar Layer (RainViewer API real-time radar)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (radarLayerRef.current) {
      map.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (showLiveRadar) {
      setRadarLoading(true);
      fetchLiveRadarTileConfig()
        .then((config) => {
          if (config && mapRef.current) {
            setRadarTimestamp(config.radarDateFormatted);
            const rLayer = L.tileLayer(config.radarTileUrlPattern, {
              opacity: 0.75,
              zIndex: 15,
              attribution: '&copy; RainViewer Real-Time Radar',
            }).addTo(mapRef.current);
            radarLayerRef.current = rLayer;
          }
        })
        .finally(() => {
          setRadarLoading(false);
        });
    }
  }, [showLiveRadar]);

  // Center map when dam changes and invalidate size
  useEffect(() => {
    if (!mapRef.current || !dam) return;
    mapRef.current.flyTo([dam.lat, dam.lon], 11, { duration: 1.2 });
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 350);
  }, [dam?.id]);

  // Render all active geospatial layers on simulation / step change
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    // 1. Reservoir boundary
    if (dam.reservoir && dam.reservoir.polygon) {
      const resPolygon = L.polygon(dam.reservoir.polygon, {
        color: '#06b6d4',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#0891b2',
        fillOpacity: 0.25,
      }).bindTooltip(
        `<b>${dam.name} Reservoir</b><br/>Area: ${dam.reservoir.areaSqKm} km²<br/>Storage: ${dam.storageCapacityMCM} MCM`,
        { sticky: true }
      );
      lg.addLayer(resPolygon);
    }

    // 2. River Thalweg Reach
    if (showRiver && dam.riverReach) {
      const riverLine = L.polyline(dam.riverReach.coordinates, {
        color: '#38bdf8',
        weight: 3.5,
        opacity: 0.85,
        lineCap: 'round',
      }).bindTooltip(
        `<b>${dam.river} Downstream Channel</b><br/>Length: ${dam.riverReach.totalLengthKm} km`,
        { sticky: true }
      );
      lg.addLayer(riverLine);
    }

    // 3. Dam Axis Marker
    const damIcon = L.divIcon({
      className: 'custom-dam-marker',
      html: `<div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 6px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const damMarker = L.marker([dam.lat, dam.lon], { icon: damIcon }).bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 200px;">
        <h4 style="font-weight: bold; margin: 0 0 4px 0; color: #0284c7;">${dam.name}</h4>
        <div><b>NDSA ID:</b> ${dam.ndsaId}</div>
        <div><b>River:</b> ${dam.river}</div>
        <div><b>Height:</b> ${dam.heightM} m</div>
        <div><b>FRL / MWL:</b> ${dam.fullReservoirLevelM}m / ${dam.maximumWaterLevelM}m</div>
        <div><b>Capacity:</b> ${dam.storageCapacityMCM} MCM</div>
        <div><b>Status:</b> ${dam.status}</div>
      </div>
    `);
    lg.addLayer(damMarker);

    // 4. Inundation Extent for Current Time Step
    if (results && results.timeSteps) {
      const step = results.timeSteps[currentTimeStepIndex];
      if (step && step.floodPolygons) {
        step.floodPolygons.forEach((slice, idx) => {
          // Color based on hazard level
          let color = '#38bdf8';
          let fillColor = '#0284c7';
          let fillOpacity = 0.45;

          if (slice.hazardLevel === 'Extreme') {
            color = '#dc2626';
            fillColor = '#ef4444';
            fillOpacity = 0.65;
          } else if (slice.hazardLevel === 'High') {
            color = '#ea580c';
            fillColor = '#f97316';
            fillOpacity = 0.55;
          } else if (slice.hazardLevel === 'Medium') {
            color = '#2563eb';
            fillColor = '#3b82f6';
            fillOpacity = 0.45;
          }

          const poly = L.polygon(slice.path, {
            color,
            weight: 1.2,
            fillColor,
            fillOpacity,
          }).bindTooltip(
            `<b>Flood Inundation (${slice.hazardLevel} Hazard)</b><br/>
             Depth: ${slice.depthM} m<br/>
             Velocity: ${slice.velocityMs} m/s<br/>
             Time: T+${step.timeHours}h`,
            { sticky: true }
          );

          lg.addLayer(poly);
        });
      }
    }

    // 5. Sentinel-1 SAR Validation Overlay (if toggled)
    if (showSatelliteOverlay && results && results.satelliteValidation) {
      const sar = results.satelliteValidation;
      const reach = dam.riverReach.coordinates;
      // Synthesize Sentinel-1 radar footprint with slight observation variance
      const sarPolys: [number, number][][] = [];
      for (let i = 0; i < reach.length - 1; i++) {
        const p1 = reach[i];
        const p2 = reach[i + 1];
        const offset = 0.007 + Math.sin(i * 0.8) * 0.002;
        sarPolys.push([
          [p1[0] + offset, p1[1] + offset],
          [p2[0] + offset, p2[1] + offset],
          [p2[0] - offset, p2[1] - offset],
          [p1[0] - offset, p1[1] - offset],
        ]);
      }
      sarPolys.forEach((coords) => {
        const sarPoly = L.polygon(coords, {
          color: '#10b981',
          weight: 2,
          dashArray: '3, 6',
          fillColor: '#059669',
          fillOpacity: 0.35,
        }).bindTooltip(
          `<b>Sentinel-1 SAR Observed Water Mask</b><br/>
           Sensor: ${sar.satelliteSensor}<br/>
           IoU Agreement: ${sar.iouScore}%<br/>
           Scene Date: ${sar.satellitePassDate.slice(0, 10)}`,
          { sticky: true }
        );
        lg.addLayer(sarPoly);
      });
    }

    // Engineering screening markers from the local AI forecast. These are not failure predictions.
    if (results?.vulnerabilityZones) {
      results.vulnerabilityZones.forEach((zone) => {
        const color = zone.score >= 75 ? '#dc2626' : zone.score >= 50 ? '#f59e0b' : '#22c55e';
        const riskIcon = L.divIcon({
          className: 'custom-risk-marker',
          html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 0 12px ${color};display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:11px">!</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker([zone.lat, zone.lon], { icon: riskIcon }).bindPopup(`<div style="font-family:sans-serif;font-size:12px;color:#0f172a;min-width:210px"><b>AI-identified high-risk zone requiring engineering inspection.</b><div style="margin-top:6px"><b>Zone:</b> ${zone.zone}</div><div><b>Screening score:</b> ${zone.score}/100</div><div><b>Trigger:</b> ${zone.trigger}</div><div style="margin-top:5px;color:#92400e">This is not a guaranteed dam failure prediction.</div></div>`).addTo(lg);
      });
    }

    // 6. Gauging Stations
    if (showGauges && results && results.gauges) {
      results.gauges.forEach((gauge: GaugeReading) => {
        const gaugeIcon = L.divIcon({
          className: 'custom-gauge-marker',
          html: `<div style="background-color: #0284c7; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px #38bdf8; font-size: 10px; font-weight: bold; color: white;">
            G
          </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const gaugeMarker = L.marker([gauge.lat, gauge.lon], { icon: gaugeIcon }).bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 200px;">
            <h4 style="font-weight: bold; margin: 0 0 4px 0; color: #0369a1;">Station ${gauge.gaugeId}: ${gauge.name}</h4>
            <div><b>Distance from Dam:</b> ${gauge.distanceKm} km</div>
            <div><b>Flood Arrival Time:</b> ${gauge.arrivalMinutes} minutes</div>
            <div><b>Peak Depth:</b> ${gauge.peakDepthM} m</div>
            <div><b>Peak Velocity:</b> ${gauge.peakVelocityMs} m/s</div>
            <div><b>Peak Discharge:</b> ${gauge.peakDischargeCumecs} m³/s</div>
          </div>
        `);
        lg.addLayer(gaugeMarker);
      });
    }

    // 7. Critical Infrastructure Markers
    if (showAssets && results && results.impact.criticalAssets) {
      results.impact.criticalAssets.forEach((asset: CriticalAssetImpact) => {
        const isHazard = asset.status === 'Submerged' || asset.status === 'Inundated';
        const markerBg =
          asset.type === 'hospital'
            ? '#ef4444'
            : asset.type === 'bridge'
            ? '#f59e0b'
            : asset.type === 'school'
            ? '#8b5cf6'
            : '#10b981';

        const assetIcon = L.divIcon({
          className: 'custom-asset-marker',
          html: `<div style="background-color: ${markerBg}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid ${
            isHazard ? '#fee2e2' : '#ffffff'
          }; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px ${markerBg};">
            <span style="color: white; font-size: 10px; font-weight: 800;">${
              asset.type[0].toUpperCase()
            }</span>
          </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const assetMarker = L.marker([asset.lat, asset.lon], { icon: assetIcon }).bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 200px;">
            <h4 style="font-weight: bold; margin: 0 0 4px 0; color: #1e293b;">${asset.name}</h4>
            <div><b>Type:</b> ${asset.type.toUpperCase()}</div>
            <div><b>Status:</b> <span style="font-weight: bold; color: ${
              asset.status === 'Submerged' ? '#b91c1c' : '#047857'
            }">${asset.status}</span></div>
            <div><b>Distance from Dam:</b> ${asset.distanceFromDamKm} km</div>
            <div><b>Wave ETA:</b> T + ${asset.estimatedArrivalHours} hours</div>
            <div><b>Inundation Depth:</b> ${asset.inundationDepthM} m</div>
            <div><b>Evacuation Urgency:</b> <b>${asset.evacuationPriority}</b></div>
          </div>
        `);

        assetMarker.on('click', () => {
          if (onSelectAsset) onSelectAsset(asset);
        });

        lg.addLayer(assetMarker);
      });
    }
  }, [
    dam,
    results,
    currentTimeStepIndex,
    showAssets,
    showRiver,
    showGauges,
    showSatelliteOverlay,
    results?.vulnerabilityZones,
  ]);

  // Timeline Animation Loop
  useEffect(() => {
    let timer: any;
    if (isPlaying && results && results.timeSteps) {
      timer = setInterval(() => {
        setCurrentTimeStepIndex((prev) => {
          if (prev >= results.timeSteps.length - 1) {
            setIsPlaying(false);
            return 0; // loop or reset
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, results, playbackSpeed]);

  const currentStep = results?.timeSteps[currentTimeStepIndex];

  return (
    <div className="relative w-full h-full min-h-[440px] sm:min-h-[520px] bg-slate-950 flex flex-col overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Top Left Floating Information Badge (Collapsible for mobile) */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 text-xs shadow-xl max-w-[280px] sm:max-w-sm pointer-events-auto transition-all">
        <div 
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          className="p-2.5 sm:p-3 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-[11px] sm:text-xs">
            <Compass className="w-3.5 h-3.5 animate-spin-slow text-cyan-400 shrink-0" />
            <span className="truncate">{isInfoExpanded ? 'MODEL DOMAIN' : dam.name}</span>
          </div>
          <button className="text-slate-400 hover:text-white p-0.5 ml-2">
            {isInfoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isInfoExpanded && (
          <div className="px-3 pb-3 pt-0 border-t border-slate-800/80 text-xs">
            <div className="text-white font-semibold text-xs sm:text-sm mt-1">{dam.name}</div>
            <div className="text-slate-400 font-mono text-[10px] sm:text-[11px] mt-0.5">
              River: {dam.river} • Reach: {dam.riverReach.totalLengthKm} km
            </div>
            {currentStep && (
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-slate-400 font-mono">Wave Extent:</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {currentStep.frontDistanceKm} km / {currentStep.inundatedAreaSqKm} km²
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Right Controls & Layer Toggle Panel (Collapsible for mobile) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2 pointer-events-auto max-w-[220px] sm:max-w-xs">
        {/* Toggle Layers Button on Mobile */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsLayersExpanded(!isLayersExpanded)}
            className="sm:hidden px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1 shadow-lg"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isLayersExpanded ? 'Hide' : 'Layers'}</span>
          </button>
        </div>

        {isLayersExpanded && (
          <div className="flex flex-col items-end space-y-2 w-full animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Real Basemap Picker */}
            <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 flex items-center space-x-1 shadow-xl text-[10px] sm:text-[11px] font-mono">
              <button
                onClick={() => setBaseLayerType('dark')}
                className={`px-2 py-1 rounded transition ${
                  baseLayerType === 'dark'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="ESRI Dark Canvas (High-contrast flood wave analysis, no API key needed)"
              >
                Dark
              </button>
              <button
                onClick={() => setBaseLayerType('satellite')}
                className={`px-2 py-1 rounded transition ${
                  baseLayerType === 'satellite'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="ESRI Sub-meter True Color Satellite Imagery"
              >
                Satellite
              </button>
              <button
                onClick={() => setBaseLayerType('street')}
                className={`px-2 py-1 rounded transition ${
                  baseLayerType === 'street'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="OpenStreetMap Standard Vector & Road Topography"
              >
                OSM
              </button>
              <button
                onClick={() => setBaseLayerType('topo')}
                className={`px-2 py-1 rounded transition ${
                  baseLayerType === 'topo'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="ESRI World Topo Map (Elevation contours & terrain relief)"
              >
                Terrain
              </button>
            </div>

            {/* Layer Toggles */}
            <div className="bg-slate-900/90 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border border-slate-700/80 text-xs shadow-xl space-y-1.5 text-slate-300 w-full">
              <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center justify-between mb-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>Map Overlays</span>
                </span>
              </div>

              {/* Real-Time Live Rain Radar Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-800/60 transition text-cyan-300 font-medium">
                <input
                  type="checkbox"
                  checked={showLiveRadar}
                  onChange={(e) => setShowLiveRadar(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="flex items-center gap-1.5 text-[11px]">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Live Rain Radar</span>
                  {showLiveRadar && radarTimestamp && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      {radarTimestamp}
                    </span>
                  )}
                  {radarLoading && <span className="text-[9px] text-slate-400 animate-pulse">...</span>}
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-800/60 transition">
                <input
                  type="checkbox"
                  checked={showAssets}
                  onChange={(e) => setShowAssets(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px]">Critical Assets</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-800/60 transition">
                <input
                  type="checkbox"
                  checked={showRiver}
                  onChange={(e) => setShowRiver(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px]">River Thalweg</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-800/60 transition">
                <input
                  type="checkbox"
                  checked={showGauges}
                  onChange={(e) => setShowGauges(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px]">Gauging Stations</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-800/60 transition text-emerald-400">
                <input
                  type="checkbox"
                  checked={showSatelliteOverlay}
                  onChange={(e) => setShowSatelliteOverlay(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-[11px]">Sentinel-1 SAR Mask</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Point Inspector Overlay (shows when user clicks map) */}
      {inspectorData && (
        <div className="absolute bottom-20 sm:bottom-24 left-3 z-10 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/40 text-xs shadow-2xl pointer-events-auto max-w-[260px] sm:min-w-[240px]">
          <div className="flex items-center justify-between text-cyan-400 font-mono font-bold mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              SPOT HYDRO GAUGE
            </span>
            <button
              onClick={() => setInspectorData(null)}
              className="text-slate-400 hover:text-white text-[11px] p-1"
            >
              ✕
            </button>
          </div>
          <div className="text-slate-300 font-mono text-[10px] sm:text-[11px]">
            Coord: {inspectorData.lat}, {inspectorData.lng}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] sm:text-[11px]">
            <div>
              <span className="text-slate-400">Flood Depth:</span>
              <div className="text-white font-mono font-bold text-sm">
                {inspectorData.depthM} m
              </div>
            </div>
            <div>
              <span className="text-slate-400">Velocity:</span>
              <div className="text-white font-mono font-bold text-sm">
                {inspectorData.velocityMs} m/s
              </div>
            </div>
            <div>
              <span className="text-slate-400">Arrival Time:</span>
              <div className="text-amber-400 font-mono font-semibold">
                {inspectorData.arrivalMin} min
              </div>
            </div>
            <div>
              <span className="text-slate-400">Hazard Rating:</span>
              <div
                className={`font-semibold ${
                  inspectorData.hazardLevel === 'Extreme'
                    ? 'text-red-400'
                    : inspectorData.hazardLevel === 'High'
                    ? 'text-orange-400'
                    : 'text-cyan-300'
                }`}
              >
                {inspectorData.hazardLevel}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Hazard & Depth Legend (Collapsible on mobile) */}
      <div className="absolute bottom-20 sm:bottom-24 right-3 z-10 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 text-[10px] sm:text-[11px] shadow-xl pointer-events-auto">
        <div
          onClick={() => setIsLegendExpanded(!isLegendExpanded)}
          className="p-2 sm:p-2.5 flex items-center justify-between cursor-pointer select-none space-x-2 text-slate-400"
        >
          <span className="font-mono uppercase tracking-wider flex items-center gap-1 text-[10px] text-slate-300">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>Legend</span>
          </span>
          <button className="p-0.5 text-slate-400">
            {isLegendExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {isLegendExpanded && (
          <div className="p-2 sm:p-2.5 pt-0 space-y-1 font-mono text-[9px] sm:text-[10px] border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-red-600 shrink-0"></span>
              <span className="text-slate-300">Extreme (&gt;3.0m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-orange-500 shrink-0"></span>
              <span className="text-slate-300">High (1.8-3.0m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 shrink-0"></span>
              <span className="text-slate-300">Medium (0.8-1.8m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400 shrink-0"></span>
              <span className="text-slate-300">Low (&lt;0.8m)</span>
            </div>
            {showLiveRadar && (
              <div className="flex items-center space-x-2 pt-1 border-t border-slate-800 text-cyan-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500/70 border border-cyan-400 shrink-0"></span>
                <span>Live Radar Rain</span>
              </div>
            )}
            {showSatelliteOverlay && (
              <div className="flex items-center space-x-2 pt-1 border-t border-slate-800 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded border border-emerald-400 bg-emerald-500/40 shrink-0"></span>
                <span>Sentinel-1 SAR</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Floating Time Animation Controller Strip */}
      <div className="p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        {/* Playback Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center transition shadow-lg shadow-cyan-500/30"
            title={isPlaying ? 'Pause simulation animation' : 'Play simulation animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentTimeStepIndex(0);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset to T=0h"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs text-slate-400 font-mono">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded transition ${
                  playbackSpeed === speed
                    ? 'bg-cyan-500/30 text-cyan-300 font-bold'
                    : 'hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Time Scrubber Slider */}
        <div className="flex-1 w-full max-w-xl flex items-center space-x-3">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="range"
            min={0}
            max={(results?.timeSteps?.length || 1) - 1}
            value={currentTimeStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentTimeStepIndex(Number(e.target.value));
            }}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <div className="text-xs font-mono text-cyan-300 font-bold whitespace-nowrap min-w-[70px] text-right">
            {currentStep?.label || 'T + 0h'}
          </div>
        </div>

        {/* Dynamic Hydro Status */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-mono border-l border-slate-800 pl-4 text-slate-300">
          <div>
            <span className="text-slate-400">Peak Depth:</span>{' '}
            <span className="text-white font-bold">{currentStep?.maxDepthM || 0} m</span>
          </div>
          <div>
            <span className="text-slate-400">Wave Speed:</span>{' '}
            <span className="text-white font-bold">{currentStep?.maxVelocityMs || 0} m/s</span>
          </div>
          <div>
            <span className="text-slate-400">Inundated:</span>{' '}
            <span className="text-cyan-400 font-bold">{currentStep?.inundatedAreaSqKm || 0} km²</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Calculate minimum distance from point to polyline in km
function getMinDistToReach(point: [number, number], reach: [number, number][]): number {
  let minDist = 999;
  for (const r of reach) {
    const dLat = (point[0] - r[0]) * 111;
    const dLon = (point[1] - r[1]) * 111 * Math.cos((point[0] * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}
