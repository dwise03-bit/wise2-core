'use client';

import React, { useState } from 'react';
import Multistreaming, {
  EncodingSettings,
  FailoverSettings,
  PlatformStreamStatus,
} from './Multistreaming';
import type { StreamingPlatform } from './streamingTypes';

/**
 * Example: Multistreaming UI Integration
 *
 * Shows how to integrate the Multistreaming component with:
 * - Real stream state management
 * - Platform connection handling
 * - Encoding updates
 * - Failover configuration
 */
export default function MultistreamsExample() {
  const [encodingSettings, setEncodingSettings] = useState<EncodingSettings>({
    resolution: '720p',
    fps: 30,
    baselineBitrate: 3500,
  });

  const [failoverSettings, setFailoverSettings] = useState<FailoverSettings>({
    enableFailover: true,
    continueOnDisconnect: true,
    maxReconnectAttempts: 5,
  });

  const handleConnect = (platforms: StreamingPlatform[]) => {
    console.log('Connecting to platforms:', platforms);
    // In a real app:
    // 1. Validate stream keys for each platform
    // 2. Initialize encoders
    // 3. Start streaming to all selected platforms
    // 4. Monitor each platform independently
    // 5. Handle failover if configured
  };

  const handleDisconnect = (platform: StreamingPlatform) => {
    console.log('Disconnecting from platform:', platform);
    // In a real app:
    // 1. Stop streaming to this platform
    // 2. Clean up resources
    // 3. Emit stats summary
    // 4. If failover enabled and others still active, continue streaming
  };

  const handleEncodingChange = (settings: EncodingSettings) => {
    console.log('Encoding settings changed:', settings);
    setEncodingSettings(settings);
    // In a real app:
    // 1. Update encoder settings
    // 2. Recalculate bitrate per platform
    // 3. Apply to all active streams
  };

  const handleSettingsChange = (settings: FailoverSettings) => {
    console.log('Failover settings changed:', settings);
    setFailoverSettings(settings);
    // In a real app:
    // 1. Update failover configuration
    // 2. Adjust reconnection strategy
    // 3. Log policy changes
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Multi-Streaming Control Center
          </h1>
          <p className="text-gray-400">
            Simultaneously broadcast to multiple platforms with synchronized
            encoding
          </p>
        </div>

        {/* Main Component */}
        <Multistreaming
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onEncodingChange={handleEncodingChange}
          onSettingsChange={handleSettingsChange}
        />

        {/* Debug Panel */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Current Settings</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Encoding Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                Encoding
              </h4>
              <div className="space-y-2 text-sm font-mono text-gray-400">
                <div>
                  Resolution: <span className="text-white">{encodingSettings.resolution}</span>
                </div>
                <div>
                  FPS: <span className="text-white">{encodingSettings.fps}</span>
                </div>
                <div>
                  Baseline Bitrate:{' '}
                  <span className="text-white">
                    {encodingSettings.baselineBitrate} kbps
                  </span>
                </div>
              </div>
            </div>

            {/* Failover Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                Failover
              </h4>
              <div className="space-y-2 text-sm font-mono text-gray-400">
                <div>
                  Enabled:{' '}
                  <span className={failoverSettings.enableFailover ? 'text-green-400' : 'text-gray-500'}>
                    {failoverSettings.enableFailover ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  Continue on Failure:{' '}
                  <span className={failoverSettings.continueOnDisconnect ? 'text-green-400' : 'text-gray-500'}>
                    {failoverSettings.continueOnDisconnect ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  Max Reconnect Attempts:{' '}
                  <span className="text-white">
                    {failoverSettings.maxReconnectAttempts}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Documentation */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Features</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h4 className="font-medium text-amber-400">
                Multi-Platform Support
              </h4>
              <ul className="text-gray-400 space-y-1 list-disc list-inside">
                <li>Twitch</li>
                <li>YouTube</li>
                <li>Facebook Live</li>
                <li>Custom RTMP</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-amber-400">
                Synchronized Encoding
              </h4>
              <ul className="text-gray-400 space-y-1 list-disc list-inside">
                <li>Single encoder configuration</li>
                <li>Platform-optimized bitrates</li>
                <li>Shared resolution & FPS</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-blue-400">
                Per-Platform Status
              </h4>
              <ul className="text-gray-400 space-y-1 list-disc list-inside">
                <li>Live viewer counts</li>
                <li>Individual bitrate monitoring</li>
                <li>Connection status indicators</li>
                <li>Error notifications</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-blue-400">
                Resilience & Failover
              </h4>
              <ul className="text-gray-400 space-y-1 list-disc list-inside">
                <li>Automatic reconnection</li>
                <li>Continue on failure</li>
                <li>Platform-specific latency</li>
                <li>Configurable retry limits</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integration Guide */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Integration Guide</h3>

          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <p className="text-white font-medium mb-2">1. Platform Selection</p>
              <p>
                Users check boxes to select which platforms to stream to.
                Enables independent management of each platform.
              </p>
            </div>

            <div>
              <p className="text-white font-medium mb-2">2. Encoding Configuration</p>
              <p>
                Shared encoding settings (resolution, FPS, bitrate) apply to all
                platforms. Individual platform bitrates are optimized based on
                their capabilities.
              </p>
            </div>

            <div>
              <p className="text-white font-medium mb-2">3. Real-Time Monitoring</p>
              <p>
                Per-platform stats show viewers, bitrate, latency, and connection
                status. Users can identify and fix issues on specific platforms
                without affecting others.
              </p>
            </div>

            <div>
              <p className="text-white font-medium mb-2">4. Failover Protection</p>
              <p>
                If a platform disconnects, the system can automatically reconnect
                while keeping other streams active. Configurable reconnection
                attempts and continuation policy.
              </p>
            </div>

            <div>
              <p className="text-white font-medium mb-2">5. Platform-Specific Tuning</p>
              <p>
                Each platform has custom latency delays and server selections.
                Users can fine-tune latency compensation per platform (e.g.,
                YouTube +10s, Twitch +5s).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
