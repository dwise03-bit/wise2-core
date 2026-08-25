'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface SDRSignal {
  id: string;
  frequency: number;
  power: number;
  detectedAt: string;
  modulation?: string;
  bandwidth?: number;
}

export interface Incident {
  id: string;
  headline: string;
  category: string;
  incidentType: string;
  threatLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  latitude?: number;
  longitude?: number;
  approximateLocation?: string;
  verificationStatus: 'UNVERIFIED' | 'DEVELOPING' | 'CORROBORATED' | 'OFFICIAL' | 'CLEARED';
  confidence: number;
  receivedTimestamp: string;
  sourceUrl?: string;
}

export interface WatchZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  categories: string[];
  minimumThreat: string;
  enabled: boolean;
}

export interface DashboardData {
  incidents: Incident[];
  sdrSignals: SDRSignal[];
  watchZones: WatchZone[];
  meshNodes: any[];
  alerts: any[];
}

interface UseWiseDefenseApiOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  useWebSocket?: boolean;
}

export function useWiseDefenseApi(options: UseWiseDefenseApiOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 10000, // 10 seconds
    useWebSocket = true,
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/wise-defense/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          // API not available yet, return mock data for development
          setData({
            incidents: [],
            sdrSignals: [],
            watchZones: [],
            meshNodes: [],
            alerts: [],
          });
          return;
        }
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
      }

      const result = await response.json();
      setData({
        incidents: result.incidents || [],
        sdrSignals: result.sdr || [],
        watchZones: result.watchZones || [],
        meshNodes: result.meshNodes || [],
        alerts: result.alerts || [],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard';
      setError(message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Fetch incidents (Crime Radar)
  const fetchIncidents = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/wise-defense/incidents`, {
        credentials: 'include',
      });
      if (response.ok) {
        const incidents = await response.json();
        setData((prev) => prev ? { ...prev, incidents } : null);
      }
    } catch (err) {
      console.error('Incidents fetch error:', err);
    }
  }, [apiBaseUrl]);

  // Fetch SDR signals (Spectrum)
  const fetchSDRSignals = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/wise-defense/sdr/signals`, {
        credentials: 'include',
      });
      if (response.ok) {
        const sdrSignals = await response.json();
        setData((prev) => prev ? { ...prev, sdrSignals } : null);
      }
    } catch (err) {
      console.error('SDR signals fetch error:', err);
    }
  }, [apiBaseUrl]);

  // Fetch watch zones
  const fetchWatchZones = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/wise-defense/watch-zones`, {
        credentials: 'include',
      });
      if (response.ok) {
        const watchZones = await response.json();
        setData((prev) => prev ? { ...prev, watchZones } : null);
      }
    } catch (err) {
      console.error('Watch zones fetch error:', err);
    }
  }, [apiBaseUrl]);

  // Setup WebSocket for real-time updates
  const setupWebSocket = useCallback(() => {
    if (!useWebSocket || wsRef.current) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/wise-defense/stream`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected to WISE Defense');
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setData((prev) => {
            if (!prev) return null;
            if (update.type === 'signal') {
              return { ...prev, sdrSignals: [update.data, ...prev.sdrSignals].slice(0, 100) };
            } else if (update.type === 'incident') {
              return { ...prev, incidents: [update.data, ...prev.incidents].slice(0, 100) };
            }
            return prev;
          });
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        wsRef.current = null;
        // Attempt reconnect in 5 seconds
        setTimeout(() => setupWebSocket(), 5000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WebSocket setup error:', err);
    }
  }, [useWebSocket]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  // Initial fetch and setup
  useEffect(() => {
    fetchDashboard();
    setupWebSocket();

    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(fetchDashboard, refreshInterval);
    }

    return cleanup;
  }, [fetchDashboard, setupWebSocket, autoRefresh, refreshInterval, cleanup]);

  // Refresh function for manual updates
  const refresh = useCallback(() => {
    fetchDashboard();
    fetchIncidents();
    fetchSDRSignals();
    fetchWatchZones();
  }, [fetchDashboard, fetchIncidents, fetchSDRSignals, fetchWatchZones]);

  return {
    data,
    loading,
    error,
    refresh,
    fetchIncidents,
    fetchSDRSignals,
    fetchWatchZones,
  };
}
