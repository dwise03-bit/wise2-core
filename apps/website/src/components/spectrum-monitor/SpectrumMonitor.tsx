'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, Radio, TrendingUp, Zap } from 'lucide-react';

interface SpectrumDataPoint {
  frequency: number;
  power_db: number;
  timestamp: string;
}

interface SpectrumResponse {
  spectrum: SpectrumDataPoint[];
  frequency_range: {
    min_mhz: number;
    max_mhz: number;
  };
  timestamp: string;
  total_signals: number;
  peak_power_db: number;
}

interface FrequencyData {
  frequency: number;
  power_db: number;
  mode?: string;
  timestamp: string;
}

interface FrequenciesResponse {
  frequencies: FrequencyData[];
  classified: Record<string, FrequencyData[]>;
  threshold_db: number;
  count: number;
  timestamp: string;
}

interface Alert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  source_id?: string;
  created_at: string;
}

interface AlertsResponse {
  alerts: Alert[];
  count: number;
  timestamp: string;
}

export default function SpectrumMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spectrumData, setSpectrumData] = useState<SpectrumDataPoint[]>([]);
  const [frequenciesData, setFrequenciesData] = useState<FrequencyData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [peakPower, setPeakPower] = useState(-100);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Fetch spectrum data
  const fetchSpectrumData = async () => {
    try {
      const response = await fetch('/api/sdr/spectrum');
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data: SpectrumResponse = await response.json();
      setSpectrumData(data.spectrum);
      setPeakPower(data.peak_power_db);
      setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(`Failed to fetch spectrum: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Fetch active frequencies
  const fetchFrequencies = async () => {
    try {
      const response = await fetch('/api/sdr/frequencies?threshold_db=-50');
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data: FrequenciesResponse = await response.json();
      setFrequenciesData(data.frequencies);
    } catch (err) {
      logger.debug('Failed to fetch frequencies:', err);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/sdr/alerts');
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data: AlertsResponse = await response.json();
      setAlerts(data.alerts.slice(0, 5)); // Show latest 5
    } catch (err) {
      logger.debug('Failed to fetch alerts:', err);
    }
  };

  // Draw spectrum graph
  const drawSpectrum = () => {
    const canvas = canvasRef.current;
    if (!canvas || spectrumData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = '#1a3a3a';
    ctx.lineWidth = 1;

    // Frequency labels (every 100 MHz)
    for (let freq = 100; freq <= 1200; freq += 100) {
      const x = padding + ((freq - 88) / (1200 - 88)) * (width - padding * 2);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Power labels (every 10 dB)
    for (let power = -100; power <= 0; power += 10) {
      const y = height - padding - ((power + 100) / 100) * (height - padding * 2);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Draw spectrum data
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    spectrumData.forEach((point, idx) => {
      const x = padding + ((point.frequency - 88) / (1200 - 88)) * (width - padding * 2);
      const y = height - padding - ((point.power_db + 100) / 100) * (height - padding * 2);

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw fill under curve
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#00ff00';
    const lastPoint = spectrumData[spectrumData.length - 1];
    const lastX = padding + ((lastPoint.frequency - 88) / (1200 - 88)) * (width - padding * 2);
    const lastY = height - padding - ((lastPoint.power_db + 100) / 100) * (height - padding * 2);

    ctx.lineTo(lastX, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.fill();

    // Draw frequency labels
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    for (let freq = 100; freq <= 1200; freq += 200) {
      const x = padding + ((freq - 88) / (1200 - 88)) * (width - padding * 2);
      ctx.fillText(`${freq}M`, x, height - padding + 20);
    }

    // Draw power labels
    ctx.textAlign = 'right';
    for (let power = -100; power <= 0; power += 20) {
      const y = height - padding - ((power + 100) / 100) * (height - padding * 2);
      ctx.fillText(`${power}dB`, padding - 10, y + 5);
    }
  };

  // Update effect
  useEffect(() => {
    setIsLoading(true);

    // Initial load
    Promise.all([fetchSpectrumData(), fetchFrequencies(), fetchAlerts()])
      .finally(() => setIsLoading(false));

    // Set up polling (10 second intervals to match RTL-SDR)
    const spectrumInterval = setInterval(fetchSpectrumData, 10000);
    const frequenciesInterval = setInterval(fetchFrequencies, 10000);
    const alertsInterval = setInterval(fetchAlerts, 15000);

    return () => {
      clearInterval(spectrumInterval);
      clearInterval(frequenciesInterval);
      clearInterval(alertsInterval);
    };
  }, []);

  // Draw spectrum when data changes
  useEffect(() => {
    drawSpectrum();
  }, [spectrumData]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-600/10';
      case 'WARNING': return 'text-yellow-600 bg-yellow-600/10';
      case 'INFO': return 'text-blue-600 bg-blue-600/10';
      default: return 'text-gray-600 bg-gray-600/10';
    }
  };

  const getSignalTypeColor = (type: string) => {
    switch (type) {
      case 'fm_radio': return 'bg-blue-500/20 text-blue-400';
      case 'noaa_weather': return 'bg-green-500/20 text-green-400';
      case 'gmrs_frs': return 'bg-yellow-500/20 text-yellow-400';
      case 'public_safety': return 'bg-red-500/20 text-red-400';
      case 'cellular': return 'bg-purple-500/20 text-purple-400';
      case 'ism': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold">Spectrum Monitor</h2>
            <p className="text-xs text-gray-400">
              Real-time RTL-SDR spectrum analysis | 88-1200 MHz
            </p>
          </div>
        </div>
        {lastUpdate && (
          <div className="text-right text-xs text-gray-400">
            <p>Last update</p>
            <p className="text-green-500 font-mono">{lastUpdate}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Peak Power</p>
              <p className="text-2xl font-bold text-green-500 font-mono">{peakPower.toFixed(1)} dB</p>
            </div>
            <Zap className="w-8 h-8 text-green-500/50" />
          </div>
        </div>

        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Signals Detected</p>
              <p className="text-2xl font-bold text-blue-500">{frequenciesData.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500/50" />
          </div>
        </div>

        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Active Alerts</p>
              <p className="text-2xl font-bold text-yellow-500">{alerts.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500/50" />
          </div>
        </div>
      </div>

      {/* Spectrum Graph */}
      <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-300">
          Frequency Spectrum
        </h3>
        {isLoading ? (
          <div className="w-full h-64 bg-black/50 rounded flex items-center justify-center">
            <p className="text-gray-500">Loading spectrum data...</p>
          </div>
        ) : error ? (
          <div className="w-full h-64 bg-black/50 rounded flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full border border-green-500/30 rounded bg-black"
          />
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-4">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-300">
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded border ${getSeverityColor(alert.severity)} border-current/30`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{alert.title}</p>
                    <p className="text-xs mt-1">{alert.message}</p>
                  </div>
                  <span className="text-xs whitespace-nowrap">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Frequencies */}
      {frequenciesData.length > 0 && (
        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-4">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-300">
            Top Detected Frequencies
          </h3>
          <div className="space-y-2">
            {frequenciesData.slice(0, 10).map((freq, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-black/50 rounded border border-wise-primary-border/30 text-xs"
              >
                <div className="flex-1">
                  <span className="font-mono font-bold text-green-400">{freq.frequency.toFixed(2)} MHz</span>
                  <span className="text-gray-500 ml-2">
                    Power: {freq.power_db.toFixed(1)} dB
                  </span>
                </div>
                {freq.mode && (
                  <span className="text-gray-400 text-xs">{freq.mode}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple logger
const logger = {
  debug: (msg: string, err?: any) => console.debug(msg, err),
  info: (msg: string) => console.info(msg),
  error: (msg: string) => console.error(msg),
};
