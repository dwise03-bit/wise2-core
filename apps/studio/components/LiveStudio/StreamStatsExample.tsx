'use client';

import React, { useState, useEffect } from 'react';
import { StreamStats, type StreamStatsSnapshot, type StreamSession } from './StreamStats';

/**
 * Example implementation of StreamStats component
 * Shows various usage patterns and mock data generation
 */

// Mock data generator for realistic streaming stats
function generateMockStats(): StreamStatsSnapshot {
  const base = {
    bitrate: 5000 + Math.random() * 500,
    fps: Math.random() > 0.95 ? 59 : 60,
    droppedFrames: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0,
    encodingLag: 40 + Math.random() * 20,
    networkLag: 25 + Math.random() * 15,
    renderingLag: 3 + Math.random() * 3,
    cpuUsage: 40 + Math.random() * 20,
    gpuUsage: 60 + Math.random() * 15,
    downBandwidth: 0.3 + Math.random() * 0.3,
    upBandwidth: 5.0 + Math.random() * 1.0,
  };

  return {
    timestamp: Date.now(),
    viewers: Math.max(100, Math.floor(1000 + Math.random() * 500 + Math.sin(Date.now() / 5000) * 300)),
    ...base,
  };
}

// Mock session data
const mockSessions: StreamSession[] = [
  {
    id: 'session-1',
    platform: 'twitch',
    startTime: new Date(Date.now() - 86400000), // Yesterday
    endTime: new Date(Date.now() - 82800000),
    duration: 3600,
    avgViewers: 850,
    peakViewers: 1200,
    peakBitrate: 5800,
  },
  {
    id: 'session-2',
    platform: 'youtube',
    startTime: new Date(Date.now() - 172800000), // 2 days ago
    endTime: new Date(Date.now() - 169200000),
    duration: 5400,
    avgViewers: 1250,
    peakViewers: 1850,
    peakBitrate: 6200,
  },
  {
    id: 'session-3',
    platform: 'twitch',
    startTime: new Date(Date.now() - 259200000), // 3 days ago
    endTime: new Date(Date.now() - 255600000),
    duration: 7200,
    avgViewers: 950,
    peakViewers: 1400,
    peakBitrate: 5500,
  },
  {
    id: 'session-4',
    platform: 'facebook',
    startTime: new Date(Date.now() - 345600000), // 4 days ago
    endTime: new Date(Date.now() - 342000000),
    duration: 4800,
    avgViewers: 650,
    peakViewers: 900,
    peakBitrate: 4800,
  },
  {
    id: 'session-5',
    platform: 'custom',
    startTime: new Date(Date.now() - 432000000), // 5 days ago
    endTime: new Date(Date.now() - 428400000),
    duration: 3600,
    avgViewers: 500,
    peakViewers: 750,
    peakBitrate: 4500,
  },
];

export function StreamStatsExample() {
  const [currentStats, setCurrentStats] = useState<StreamStatsSnapshot>(generateMockStats());
  const [isLive, setIsLive] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [reconnectCountdown, setReconnectCountdown] = useState(5);

  // Auto-update stats every 500ms when live
  useEffect(() => {
    if (!isLive || isReconnecting) return;

    const interval = setInterval(() => {
      setCurrentStats(generateMockStats());
    }, 500);

    return () => clearInterval(interval);
  }, [isLive, isReconnecting]);

  // Handle reconnect countdown
  useEffect(() => {
    if (!isReconnecting) return;

    if (reconnectCountdown === 0) {
      // Reconnection successful
      setIsReconnecting(false);
      setIsLive(true);
      setReconnectAttempts(0);
      return;
    }

    const timer = setTimeout(() => {
      setReconnectCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isReconnecting, reconnectCountdown]);

  const handleToggleLive = () => {
    setIsLive(!isLive);
  };

  const handleSimulateDisconnect = () => {
    setIsLive(false);
    setIsReconnecting(true);
    setReconnectAttempts(1);
    setReconnectCountdown(5);
  };

  const handleReconnect = async () => {
    // Simulate reconnection attempt
    setReconnectAttempts((prev) => Math.min(prev + 1, 5));
    setReconnectCountdown(5);

    if (reconnectAttempts >= 4) {
      // Max attempts reached, connection failed
      setIsReconnecting(false);
      alert('Failed to reconnect after 5 attempts');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Controls */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Stream Stats Dashboard</h1>
          <p className="text-gray-400 mb-6">
            Professional streaming analytics with real-time metrics, charts, and health monitoring
          </p>

          {/* Control Panel */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={handleToggleLive}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  isLive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLive ? 'Stop Stream' : 'Start Stream'}
              </button>

              <button
                onClick={handleSimulateDisconnect}
                disabled={!isLive || isReconnecting}
                className="px-4 py-2 rounded font-semibold bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Simulate Disconnect
              </button>

              <div className="text-sm text-gray-400 text-center py-2">
                <div>Status: {isLive ? (isReconnecting ? 'Reconnecting...' : 'Live') : 'Offline'}</div>
              </div>
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Viewer count oscillates between 700-1300. Bitrate fluctuates around 5000-5500 kbps. Frame drops occur
                randomly (~10% chance per update).
              </p>
              <p>
                Use "Stop Stream" to go offline, and "Simulate Disconnect" to trigger reconnection flow. All metrics
                update every 500ms.
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats Panel (2/3 width on large screens) */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-6">
            <StreamStats
              isLive={isLive}
              stats={currentStats}
              onReconnect={handleReconnect}
              sessionHistory={mockSessions}
              reconnectAttempts={reconnectAttempts}
              reconnectCountdown={reconnectCountdown}
              isReconnecting={isReconnecting}
              autoUpdate={false} // We're manually updating
              updateInterval={500}
            />
          </div>

          {/* Info Panel */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-300 uppercase mb-3">About This Example</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                This is a fully functional StreamStats dashboard component with:
              </p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1.5 list-disc list-inside">
                <li>Real-time metric tracking</li>
                <li>Live charts (bitrate, FPS, CPU, latency)</li>
                <li>Health status indicator</li>
                <li>Reconnection flow</li>
                <li>Stream session history</li>
                <li>Resource monitoring</li>
              </ul>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-bold text-gray-300 uppercase mb-3">Integration</h3>
              <pre className="bg-gray-900 rounded p-3 text-xs text-gray-300 overflow-auto">
{`import { StreamStats } from '@/components/LiveStudio';

<StreamStats
  isLive={isStreaming}
  stats={currentStats}
  sessionHistory={history}
  isReconnecting={false}
  onReconnect={handleReconnect}
/>`}
              </pre>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-bold text-gray-300 uppercase mb-3">Metrics Provided</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <div>
                  <span className="font-semibold">Bitrate:</span> Current stream bitrate in kbps
                </div>
                <div>
                  <span className="font-semibold">FPS:</span> Frames per second with drop detection
                </div>
                <div>
                  <span className="font-semibold">Lags:</span> Encoding, network, and rendering lags
                </div>
                <div>
                  <span className="font-semibold">Resources:</span> CPU, GPU, and bandwidth usage
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase mb-2">Key Features</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ 4 Real-time chart types (line, area)</li>
              <li>✓ Color-coded health indicators</li>
              <li>✓ Auto-reconnection management</li>
              <li>✓ Expandable session history</li>
              <li>✓ Smooth animations with Framer Motion</li>
              <li>✓ Dark theme optimized for streaming</li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase mb-2">Data Structure</h3>
            <pre className="bg-gray-900 rounded p-3 text-xs text-gray-300 overflow-auto">
{`interface StreamStatsSnapshot {
  timestamp: number;
  viewers: number;
  bitrate: number; // kbps
  fps: number;
  droppedFrames: number;
  encodingLag: number; // ms
  networkLag: number; // ms
  renderingLag: number; // ms
  cpuUsage: number; // %
  gpuUsage: number; // %
  downBandwidth: number; // MB/s
  upBandwidth: number; // MB/s
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
