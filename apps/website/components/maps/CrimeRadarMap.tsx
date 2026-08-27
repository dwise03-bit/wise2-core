'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  GoogleMap,
  Marker,
  Circle,
  HeatmapLayer,
  useJsApiLoader,
  InfoWindow,
  Polyline,
} from '@react-google-maps/api';
import {
  GOOGLE_MAPS_API_KEY,
  GREENSBORO_CENTER,
  DEFAULT_ZOOM,
  WATCH_ZONES,
  MAP_STYLES,
  UPDATE_INTERVALS,
  TIME_RANGES,
  TRAIL_CONFIG,
} from '@/lib/google-maps-config';
import {
  SignalLocation,
  IncidentMarker,
  signalToLocation,
  incidentToMarker,
  filterSignalsByBand,
  filterSignalsByTimeRange,
  filterIncidentsByTimeRange,
  clusterSignals,
  exportToGeoJSON,
  shouldTriggerAlert,
} from '@/lib/signal-mapper';
import { MapPin, AlertTriangle, Radio, Zap, Clock, Download, Eye, EyeOff, Settings } from 'lucide-react';

interface CrimeRadarMapProps {
  apiUrl?: string;
  apiKey?: string;
  autoUpdate?: boolean;
}

interface SignalTrail {
  signalId: string;
  path: google.maps.LatLngLiteral[];
}

export default function CrimeRadarMap({
  apiUrl = process.env.NEXT_PUBLIC_WISE_DEFENSE_API || 'http://localhost:3014',
  apiKey = process.env.NEXT_PUBLIC_WISE_DEFENSE_API_KEY || 'demo-key',
  autoUpdate = true,
}: CrimeRadarMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [signals, setSignals] = useState<SignalLocation[]>([]);
  const [incidents, setIncidents] = useState<IncidentMarker[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<SignalLocation | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentMarker | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState({
    signals: true,
    incidents: true,
    zones: true,
    heatmap: false,
    traffic: false,
  });
  const [frequencyFilter, setFrequencyFilter] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<number | null>(6 * 60 * 60 * 1000); // 6 hours
  const [threatFilter, setThreatFilter] = useState<string>('LOW');
  const [isLoading, setIsLoading] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [trails, setTrails] = useState<Map<string, SignalTrail>>(new Map());

  // Fetch signals from WISE Defense API
  const fetchSignals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/api/sdr/frequencies`, {
        headers: { 'X-API-Key': apiKey },
      });

      if (!response.ok) throw new Error('Failed to fetch signals');
      const data = await response.json();

      if (data.frequencies && Array.isArray(data.frequencies)) {
        const signalLocations = data.frequencies.map((signal: any, idx: number) =>
          signalToLocation(signal, `signal-${idx}-${Date.now()}`),
        );

        setSignals((prev) => [...prev, ...signalLocations]);

        // Keep only last 500 signals
        setSignals((prev) => prev.slice(-500));

        // Check for alerts
        const newAlerts = signalLocations.filter(shouldTriggerAlert);
        setAlertCount(newAlerts.length);
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, apiKey]);

  // Fetch incidents from WISE Defense API
  const fetchIncidents = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/incidents`, {
        headers: { 'X-API-Key': apiKey },
      });

      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();

      if (data.incidents && Array.isArray(data.incidents)) {
        const incidentMarkers = data.incidents.map((incident: any) =>
          incidentToMarker(incident),
        );
        setIncidents(incidentMarkers);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  }, [apiUrl, apiKey]);

  // Set up auto-update interval
  useEffect(() => {
    if (!autoUpdate || !isLoaded) return;

    fetchSignals();
    fetchIncidents();

    const signalInterval = setInterval(fetchSignals, UPDATE_INTERVALS.SIGNALS);
    const incidentInterval = setInterval(fetchIncidents, UPDATE_INTERVALS.INCIDENTS);

    return () => {
      clearInterval(signalInterval);
      clearInterval(incidentInterval);
    };
  }, [isLoaded, autoUpdate, fetchSignals, fetchIncidents]);

  // Apply filters
  const filteredSignals = useCallback(() => {
    let filtered = signals;

    if (frequencyFilter !== 'ALL') {
      filtered = filterSignalsByBand(filtered, frequencyFilter);
    }

    if (timeRange) {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - timeRange);
      filtered = filterSignalsByTimeRange(filtered, startTime, endTime);
    }

    return filtered;
  }, [signals, frequencyFilter, timeRange]);

  const filteredIncidents = useCallback(() => {
    let filtered = incidents;

    if (timeRange) {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - timeRange);
      filtered = filterIncidentsByTimeRange(filtered, startTime, endTime, threatFilter);
    }

    return filtered;
  }, [incidents, timeRange, threatFilter]);

  // Handle map click for zone selection
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      console.log(`Clicked: ${lat}, ${lng}`);
    }
  };

  // Handle zoom to zone
  const handleZoomToZone = (zone: (typeof WATCH_ZONES)[0]) => {
    if (mapRef.current) {
      mapRef.current.panTo(zone.center);
      mapRef.current.setZoom(14);
      setSelectedZone(zone.id);
    }
  };

  // Export map data
  const handleExportData = () => {
    const geoJson = exportToGeoJSON(filteredSignals(), filteredIncidents());
    const dataStr = JSON.stringify(geoJson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crime-radar-${new Date().toISOString()}.geojson`;
    link.click();
  };

  // Handle traffic layer toggle
  const handleTrafficToggle = () => {
    setVisibleLayers((prev) => ({ ...prev, traffic: !prev.traffic }));
    if (mapRef.current && visibleLayers.traffic === false) {
      // Traffic layer will be added
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-wise-bg-card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wise-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Knight Wing Crime Radar...</p>
        </div>
      </div>
    );
  }

  const currentSignals = filteredSignals();
  const currentIncidents = filteredIncidents();
  const signalClusters = visibleLayers.signals ? clusterSignals(currentSignals, 0.15) : [];
  const heatmapData = currentSignals.map((s) => ({
    location: new google.maps.LatLng(s.latitude, s.longitude),
    weight: Math.max(0, s.signalStrength + 100) / 100,
  }));

  return (
    <div className="w-full h-full bg-wise-bg-base text-white flex flex-col">
      {/* Header Controls */}
      <div className="border-b border-wise-primary-border bg-wise-bg-card/50 p-4 space-y-4">
        {/* Top Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-wise-primary" />
              <span className="font-bold text-lg">Knight Wing Crime Radar</span>
            </div>
            {alertCount > 0 && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded px-3 py-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-400">{alertCount} Active Alerts</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-wise-primary/20 hover:bg-wise-primary/30 border border-wise-primary rounded transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleTrafficToggle}
              className="flex items-center gap-2 px-4 py-2 bg-wise-primary/20 hover:bg-wise-primary/30 border border-wise-primary rounded transition-colors"
            >
              <Zap className="w-4 h-4" />
              Traffic
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-wise-primary/20 hover:bg-wise-primary/30 border border-wise-primary rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2">Frequency Band</label>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="w-full bg-wise-bg-base border border-wise-primary-border rounded px-3 py-2 text-sm"
            >
              <option value="ALL">All Frequencies</option>
              <option value="POLICE">Police (461 MHz)</option>
              <option value="FIRE_EMS">Fire/EMS (463.5 MHz)</option>
              <option value="PUBLIC_SAFETY">Public Safety (410-480 MHz)</option>
              <option value="CELLULAR">Cellular</option>
              <option value="FM_RADIO">FM Radio</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Time Range</label>
            <select
              value={timeRange?.toString() || 'all'}
              onChange={(e) =>
                setTimeRange(e.target.value === 'all' ? null : parseInt(e.target.value))
              }
              className="w-full bg-wise-bg-base border border-wise-primary-border rounded px-3 py-2 text-sm"
            >
              {TIME_RANGES.map((range) => (
                <option key={range.label} value={range.value?.toString() || 'all'}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Threat Level</label>
            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="w-full bg-wise-bg-base border border-wise-primary-border rounded px-3 py-2 text-sm"
            >
              <option value="LOW">All Levels</option>
              <option value="ELEVATED">Elevated+</option>
              <option value="HIGH">High+</option>
              <option value="CRITICAL">Critical Only</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-2">Layers</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVisibleLayers((p) => ({ ...p, signals: !p.signals }))}
                className={`flex-1 px-2 py-2 rounded text-xs transition-colors ${
                  visibleLayers.signals
                    ? 'bg-wise-primary/30 border border-wise-primary'
                    : 'bg-wise-bg-base border border-gray-700'
                }`}
              >
                {visibleLayers.signals ? <Eye className="w-3 h-3 mx-auto" /> : <EyeOff className="w-3 h-3 mx-auto" />}
              </button>
              <button
                onClick={() => setVisibleLayers((p) => ({ ...p, heatmap: !p.heatmap }))}
                className={`flex-1 px-2 py-2 rounded text-xs transition-colors ${
                  visibleLayers.heatmap
                    ? 'bg-wise-primary/30 border border-wise-primary'
                    : 'bg-wise-bg-base border border-gray-700'
                }`}
              >
                Heat
              </button>
              <button
                onClick={() => setVisibleLayers((p) => ({ ...p, zones: !p.zones }))}
                className={`flex-1 px-2 py-2 rounded text-xs transition-colors ${
                  visibleLayers.zones
                    ? 'bg-wise-primary/30 border border-wise-primary'
                    : 'bg-wise-bg-base border border-gray-700'
                }`}
              >
                Zones
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-wise-bg-base border border-wise-primary-border rounded p-3">
            <div className="text-xs text-gray-400">Active Signals</div>
            <div className="text-xl font-bold text-wise-primary">{currentSignals.length}</div>
          </div>
          <div className="bg-wise-bg-base border border-wise-primary-border rounded p-3">
            <div className="text-xs text-gray-400">Incidents</div>
            <div className="text-xl font-bold text-red-500">{currentIncidents.length}</div>
          </div>
          <div className="bg-wise-bg-base border border-wise-primary-border rounded p-3">
            <div className="text-xs text-gray-400">Watch Zones</div>
            <div className="text-xl font-bold text-yellow-500">{WATCH_ZONES.length}</div>
          </div>
          <div className="bg-wise-bg-base border border-wise-primary-border rounded p-3">
            <div className="text-xs text-gray-400">Status</div>
            <div className={`text-xl font-bold ${isLoading ? 'text-yellow-500' : 'text-green-500'}`}>
              {isLoading ? 'Updating...' : 'Live'}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Main Map */}
        <div className="flex-1 rounded overflow-hidden border border-wise-primary-border/30">
          <GoogleMap
            mapContainerClassName="w-full h-full"
            center={GREENSBORO_CENTER}
            zoom={DEFAULT_ZOOM}
            onLoad={(map) => (mapRef.current = map)}
            onClick={handleMapClick}
            options={{
              styles: MAP_STYLES.DARK,
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: true,
              fullscreenControl: true,
              streetViewControl: false,
            }}
          >
            {/* Watch Zones */}
            {visibleLayers.zones &&
              WATCH_ZONES.map((zone) => (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={zone.center}
                    radius={zone.radius * 1609.34} // Convert miles to meters
                    options={{
                      fillColor: zone.color,
                      fillOpacity: 0.1,
                      strokeColor: zone.color,
                      strokeOpacity: 0.4,
                      strokeWeight: 2,
                      clickable: true,
                    }}
                    onClick={() => handleZoomToZone(zone)}
                  />
                </React.Fragment>
              ))}

            {/* Signal Markers (Clustered) */}
            {visibleLayers.signals &&
              signalClusters.map((cluster, idx) => (
                <Marker
                  key={`cluster-${idx}`}
                  position={cluster.center}
                  title={`${cluster.count} signals`}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: cluster.size,
                    fillColor: cluster.color,
                    fillOpacity: 0.8,
                    strokeColor: '#fff',
                    strokeWeight: 1,
                  }}
                  onClick={() => {
                    if (cluster.signals.length === 1) {
                      setSelectedSignal(cluster.signals[0]);
                    }
                  }}
                />
              ))}

            {/* Incident Markers */}
            {visibleLayers.incidents &&
              currentIncidents.map((incident) => (
                <Marker
                  key={incident.id}
                  position={{ lat: incident.latitude, lng: incident.longitude }}
                  title={incident.headline}
                  icon={{
                    url: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${incident.color}"><circle cx="12" cy="12" r="10"/></svg>`,
                    scaledSize: new google.maps.Size(24, 24),
                  }}
                  onClick={() => setSelectedIncident(incident)}
                />
              ))}

            {/* Heatmap Layer */}
            {visibleLayers.heatmap && heatmapData.length > 0 && (
              <HeatmapLayer data={heatmapData} options={{ radius: 30, blur: 15 }} />
            )}

            {/* Selected Signal Info */}
            {selectedSignal && (
              <InfoWindow
                position={{ lat: selectedSignal.latitude, lng: selectedSignal.longitude }}
                onCloseClick={() => setSelectedSignal(null)}
              >
                <div className="text-black bg-white p-3 rounded text-sm">
                  <div className="font-bold mb-2">{selectedSignal.label}</div>
                  <div>Signal: {selectedSignal.signalStrength.toFixed(1)} dB</div>
                  <div>Type: {selectedSignal.classification}</div>
                  <div className="text-xs text-gray-600 mt-2">
                    {selectedSignal.detectedAt.toLocaleTimeString()}
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Selected Incident Info */}
            {selectedIncident && (
              <InfoWindow
                position={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }}
                onCloseClick={() => setSelectedIncident(null)}
              >
                <div className="text-black bg-white p-3 rounded text-sm max-w-xs">
                  <div className="font-bold mb-2">{selectedIncident.headline}</div>
                  <div>Category: {selectedIncident.category}</div>
                  <div>Threat: {selectedIncident.threatLevel}</div>
                  {selectedIncident.description && (
                    <div className="text-xs mt-2">{selectedIncident.description}</div>
                  )}
                  <div className="text-xs text-gray-600 mt-2">
                    {selectedIncident.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* Sidebar - Watch Zones */}
        <div className="w-72 bg-wise-bg-card border border-wise-primary-border rounded p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-wise-primary" />
            Watch Zones
          </h3>

          <div className="space-y-2">
            {WATCH_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoomToZone(zone)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedZone === zone.id
                    ? 'bg-wise-primary/20 border-wise-primary'
                    : 'bg-wise-bg-base border-wise-primary-border hover:border-wise-primary'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: zone.color }}
                  ></div>
                  <span className="font-semibold text-sm">{zone.name}</span>
                </div>
                <div className="text-xs text-gray-400 ml-5">{zone.description}</div>
                <div className="text-xs text-gray-500 ml-5 mt-1">Radius: {zone.radius}mi</div>
              </button>
            ))}
          </div>

          {/* Signal Legend */}
          <div className="mt-6 pt-6 border-t border-wise-primary-border">
            <h4 className="font-bold text-sm mb-3">Signal Types</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Police Radio (461 MHz)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Fire/EMS (463.5 MHz)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Public Safety (410-480)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <span>Cellular (800-2000 MHz)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>FM Radio (88-108 MHz)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
