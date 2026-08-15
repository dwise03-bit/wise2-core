'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { StreamStats, HealthStatus, StreamGraph } from './streamingTypes';
import { HEALTH_THRESHOLDS, STATS_GRAPH_CONFIG } from './streamingConstants';

interface StreamStatsProps {
  stats: StreamStats;
  isLive: boolean;
}

export default function StreamStatsComponent({ stats, isLive }: StreamStatsProps) {
  const [fpsHistory, setFpsHistory] = useState<StreamGraph[]>([]);
  const [bitrateHistory, setBitrateHistory] = useState<StreamGraph[]>([]);

  useEffect(() => {
    if (!isLive) {
      setFpsHistory([]);
      setBitrateHistory([]);
      return;
    }

    setFpsHistory((prev) => [
      ...prev.slice(-STATS_GRAPH_CONFIG.maxDataPoints - 1),
      { timestamp: Date.now(), value: stats.frameRateCurrent },
    ]);

    setBitrateHistory((prev) => [
      ...prev.slice(-STATS_GRAPH_CONFIG.maxDataPoints - 1),
      { timestamp: Date.now(), value: stats.bitrateCurrent },
    ]);
  }, [stats, isLive]);

  const calculateHealth = (): HealthStatus => {
    const okayThresholds = HEALTH_THRESHOLDS.okay;

    if (
      stats.droppedFramePercentage > okayThresholds.droppedFramePercentage.max ||
      stats.cpuUsage > okayThresholds.cpuUsage.max ||
      stats.gpuUsage > okayThresholds.gpuUsage.max ||
      stats.networkLatency > okayThresholds.networkLatency.max ||
      stats.encodingLag > okayThresholds.encodingLag.max
    ) {
      return 'poor';
    }

    const goodThresholds = HEALTH_THRESHOLDS.good;
    if (
      stats.droppedFramePercentage <= goodThresholds.droppedFramePercentage.max &&
      stats.cpuUsage <= goodThresholds.cpuUsage.max &&
      stats.gpuUsage <= goodThresholds.gpuUsage.max &&
      stats.networkLatency <= goodThresholds.networkLatency.max &&
      stats.encodingLag <= goodThresholds.encodingLag.max
    ) {
      return 'good';
    }

    return 'okay';
  };

  const health = calculateHealth();

  const healthColor = {
    good: 'text-green-400',
    okay: 'text-yellow-400',
    poor: 'text-red-400',
  }[health];

  const healthBg = {
    good: 'bg-green-500/10 border-green-500/30',
    okay: 'bg-yellow-500/10 border-yellow-500/30',
    poor: 'bg-red-500/10 border-red-500/30',
  }[health];

  const healthIcon = {
    good: <CheckCircle className="w-5 h-5" />,
    okay: <AlertTriangle className="w-5 h-5" />,
    poor: <AlertTriangle className="w-5 h-5" />,
  }[health];

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const MiniGraph = ({ data, max, label }: { data: StreamGraph[]; max: number; label: string }) => {
    if (data.length < 2) {
      return (
        <div className="h-12 bg-slate-700/50 rounded flex items-center justify-center text-gray-500 text-xs">
          No data
        </div>
      );
    }

    const points = data
      .map((point, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (point.value / max) * 100;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <div className="relative h-12 bg-slate-700/50 rounded overflow-hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-amber-400"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono text-gray-400">
            {data[data.length - 1].value.toFixed(1)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-400" />
          Stream Statistics
        </h2>

        <div className={`px-4 py-2 rounded-lg border ${healthBg} flex items-center gap-2`}>
          <span className={`${healthColor}`}>{healthIcon}</span>
          <span className={`${healthColor} font-medium capitalize`}>{health}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Viewers"
          value={stats.viewerCount.toLocaleString()}
          unit=""
          trend="up"
        />

        <StatCard
          label="Bitrate"
          value={stats.bitrateCurrent}
          unit="kbps"
          secondary={`avg: ${stats.bitrateAverage}`}
        />

        <StatCard
          label="Frame Rate"
          value={stats.frameRateCurrent}
          unit="fps"
          secondary={`target: ${stats.frameRateTarget}`}
          alert={stats.frameRateCurrent < stats.frameRateTarget - 2}
        />

        <StatCard
          label="Dropped Frames"
          value={stats.droppedFrames}
          unit={`(${stats.droppedFramePercentage.toFixed(2)}%)`}
          alert={stats.droppedFramePercentage > 2}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Encoding Lag"
          value={stats.encodingLag}
          unit="ms"
          alert={stats.encodingLag > 100}
        />

        <StatCard
          label="Network Latency"
          value={stats.networkLatency}
          unit="ms"
          alert={stats.networkLatency > 200}
        />

        <StatCard
          label="CPU Usage"
          value={stats.cpuUsage.toFixed(1)}
          unit="%"
          alert={stats.cpuUsage > 85}
        />

        {stats.gpuUsage > 0 && (
          <StatCard
            label="GPU Usage"
            value={stats.gpuUsage.toFixed(1)}
            unit="%"
            alert={stats.gpuUsage > 90}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Frame Rate (last 60s)
          </label>
          <MiniGraph
            data={fpsHistory}
            max={stats.frameRateTarget + 5}
            label="FPS"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bitrate (last 60s)
          </label>
          <MiniGraph
            data={bitrateHistory}
            max={stats.bitrateCurrent * 1.2}
            label="kbps"
          />
        </div>
      </div>

      {(stats.droppedFrames > 0 ||
        stats.cpuUsage > 85 ||
        stats.networkLatency > 200) && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="font-semibold text-red-300 mb-2">
            Performance Issues Detected
          </h4>
          <ul className="space-y-1 text-sm text-red-200">
            {stats.droppedFrames > 0 && (
              <li>
                • Frame drops detected ({stats.droppedFramePercentage.toFixed(2)}%) - check bitrate
              </li>
            )}
            {stats.cpuUsage > 85 && (
              <li>
                • High CPU usage ({stats.cpuUsage.toFixed(1)}%) - reduce scene complexity
              </li>
            )}
            {stats.networkLatency > 200 && (
              <li>
                • High latency ({stats.networkLatency}ms) - move closer to server or reduce bitrate
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  secondary?: string;
  alert?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

function StatCard({
  label,
  value,
  unit = '',
  secondary,
  alert = false,
  trend,
}: StatCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        alert
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-slate-700/50 border-slate-600/50'
      }`}
    >
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p
          className={`text-2xl font-bold ${
            alert ? 'text-red-400' : 'text-white'
          }`}
        >
          {value}
        </p>
        {unit && <p className="text-xs text-gray-500">{unit}</p>}
      </div>
      {secondary && (
        <p className="text-xs text-gray-500 mt-1">{secondary}</p>
      )}
      {trend && (
        <div className="mt-2">
          {trend === 'up' && (
            <div className="text-green-400 text-xs font-medium">↑ Rising</div>
          )}
          {trend === 'down' && (
            <div className="text-red-400 text-xs font-medium">↓ Falling</div>
          )}
          {trend === 'stable' && (
            <div className="text-gray-400 text-xs font-medium">→ Stable</div>
          )}
        </div>
      )}
    </div>
  );
}
