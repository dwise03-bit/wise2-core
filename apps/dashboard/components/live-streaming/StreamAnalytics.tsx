'use client';

import React, { useState, useEffect } from 'react';

interface AnalyticsDataPoint {
  timestamp: Date;
  viewers: number;
  bitrate: number;
}

interface StreamAnalyticsProps {
  viewers?: number;
  bitrate?: number;
  health?: 'excellent' | 'good' | 'fair' | 'poor';
  dataPoints?: AnalyticsDataPoint[];
  onRefresh?: () => void;
}

/**
 * StreamAnalytics Component
 * Shows real-time analytics with graph, viewers, bitrate, and health
 */
export function StreamAnalytics({
  viewers = 1256,
  bitrate = 8450,
  health = 'excellent',
  dataPoints,
  onRefresh,
}: StreamAnalyticsProps) {
  const [animatedViewers, setAnimatedViewers] = useState(0);
  const [animatedBitrate, setAnimatedBitrate] = useState(0);

  // Animate counters on mount
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setAnimatedViewers((prev) => {
        if (prev < viewers) return prev + Math.ceil((viewers - prev) / 10);
        return viewers;
      });
    }, 30);

    const bitrateInterval = setInterval(() => {
      setAnimatedBitrate((prev) => {
        if (prev < bitrate) return prev + Math.ceil((bitrate - prev) / 10);
        return bitrate;
      });
    }, 30);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(bitrateInterval);
    };
  }, [viewers, bitrate]);

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'excellent':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'good':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'fair':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'poor':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400';
    }
  };

  // Generate mock data if not provided
  const chartData = dataPoints || Array.from({ length: 20 }, (_, i) => ({
    timestamp: new Date(Date.now() - (20 - i) * 60000),
    viewers: Math.floor(800 + Math.random() * 500 + i * 10),
    bitrate: Math.floor(7500 + Math.random() * 1500),
  }));

  const maxViewers = Math.max(...chartData.map((d) => d.viewers));
  // eslint-disable-next-line no-unused-vars
  const maxBitrate = Math.max(...chartData.map((d) => d.bitrate));

  return (
    <div className="space-y-md">
      {/* Top Stats Row */}
      <div className="grid grid-cols-3 gap-sm">
        {/* Viewers Card */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Live Viewers</p>
          <div className="flex items-baseline gap-1">
            <div className="text-3xl font-bold text-blue-400">
              {animatedViewers.toLocaleString()}
            </div>
            <div className="text-xs text-green-400 font-semibold">
              ↑ 142
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">+12% from last hour</p>
        </div>

        {/* Bitrate Card */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Current Bitrate</p>
          <div className="flex items-baseline gap-1">
            <div className="text-3xl font-bold text-purple-400">
              {(animatedBitrate / 1000).toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">Mbps</div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Optimal range: 8-10 Mbps</p>
        </div>

        {/* Health Card */}
        <div className={`rounded-lg p-md border ${getHealthColor(health)}`}>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Stream Health</p>
          <div className="flex items-center gap-2">
            {health === 'excellent' && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            <div className="text-lg font-bold capitalize">{health}</div>
          </div>
          <p className="text-xs opacity-75 mt-1">All systems nominal</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md">
        <div className="flex items-center justify-between mb-md">
          <h4 className="text-sm font-bold text-white">Viewer Trend (Last 20 minutes)</h4>
          <button
            onClick={onRefresh}
            className="text-gray-400 hover:text-blue-400 transition-colors text-lg"
            title="Refresh analytics"
          >
            🔄
          </button>
        </div>

        {/* SVG Chart */}
        <div className="bg-gray-800/30 rounded-lg p-md border border-gray-700/30 overflow-x-auto">
          <svg
            viewBox="0 0 400 150"
            className="w-full h-48"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((y) => (
              <line
                key={`grid-${y}`}
                x1="20"
                y1={20 + y * 110}
                x2="380"
                y2={20 + y * 110}
                stroke="#4b5563"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((y) => (
              <text
                key={`label-${y}`}
                x="15"
                y={25 + (1 - y) * 110}
                textAnchor="end"
                fontSize="10"
                fill="#9ca3af"
              >
                {Math.floor(y * maxViewers)}
              </text>
            ))}

            {/* Data line */}
            <polyline
              points={chartData
                .map((d, i) => {
                  const x = 20 + (i / (chartData.length - 1)) * 360;
                  const y = 130 - ((d.viewers - Math.min(...chartData.map((p) => p.viewers))) / (maxViewers - Math.min(...chartData.map((p) => p.viewers)))) * 110;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#00D9FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Area fill */}
            <polyline
              points={`20,130 ${chartData
                .map((d, i) => {
                  const x = 20 + (i / (chartData.length - 1)) * 360;
                  const y = 130 - ((d.viewers - Math.min(...chartData.map((p) => p.viewers))) / (maxViewers - Math.min(...chartData.map((p) => p.viewers)))) * 110;
                  return `${x},${y}`;
                })
                .join(' ')} 380,130`}
              fill="url(#chartGradient)"
              opacity="0.3"
            />

            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Data points */}
            {chartData.map((d, i) => {
              const x = 20 + (i / (chartData.length - 1)) * 360;
              const y = 130 - ((d.viewers - Math.min(...chartData.map((p) => p.viewers))) / (maxViewers - Math.min(...chartData.map((p) => p.viewers)))) * 110;
              return (
                <circle
                  key={`dot-${i}`}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#00D9FF"
                  opacity={i === chartData.length - 1 ? 1 : 0.5}
                />
              );
            })}
          </svg>
        </div>

        {/* Chart Legend */}
        <div className="flex gap-md mt-md text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <span>Viewer Count</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
            <span>Offline</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-sm text-sm">
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-sm">
          <p className="text-xs text-gray-400 mb-1">Peak Viewers</p>
          <p className="text-lg font-bold text-green-400">
            {Math.max(...chartData.map((d) => d.viewers)).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-sm">
          <p className="text-xs text-gray-400 mb-1">Avg Bitrate</p>
          <p className="text-lg font-bold text-blue-400">
            {(chartData.reduce((sum, d) => sum + d.bitrate, 0) / chartData.length / 1000).toFixed(1)} Mbps
          </p>
        </div>
      </div>
    </div>
  );
}
