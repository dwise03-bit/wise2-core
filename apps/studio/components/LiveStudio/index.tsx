'use client';

import React, { useState } from 'react';
import StreamingControl from './StreamingControl';
import PlatformSettings from './PlatformSettings';
import StreamStatsComponent from './StreamStats';
import StreamTransport from './StreamTransport';
import { useStreamingState } from './useStreamingState';
import type { StreamingPlatform } from './streamingTypes';

/**
 * LiveStudio Component
 *
 * Professional streaming control system for WISE² Creative Studio
 * Features:
 * - Multi-platform streaming (Twitch, YouTube, Facebook, Custom RTMP)
 * - Real-time statistics and health monitoring
 * - Advanced encoding settings
 * - Stream pause/resume with auto-timeout
 * - Screenshot capture
 * - Platform-specific OAuth authentication
 */
export default function LiveStudio() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<StreamingPlatform>('twitch');
  const [isMuted, setIsMuted] = useState(false);

  const {
    state,
    updateSettings,
    updateCredentials,
    startStream,
    stopStream,
    pauseStream,
    resumeStream,
    testStream,
    resetStreamKey,
    captureScreenshot,
  } = useStreamingState();

  const isLive = state.status === 'live' || state.status === 'paused';

  return (
    <div className="w-full space-y-6 bg-slate-950 p-6 rounded-xl">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Live Studio Control Center
        </h1>
        <p className="text-gray-400">
          Professional streaming management for multiple platforms
        </p>
      </div>

      {/* Streaming Control Panel */}
      <StreamingControl
        onStreamStart={() => {
          startStream().catch(console.error);
        }}
        onStreamStop={stopStream}
        onSettingsChange={updateSettings}
        isLive={isLive && state.status === 'live'}
        isPaused={state.isPaused}
        lastError={state.lastError}
      />

      {/* Platform Settings Modal */}
      <PlatformSettings
        platform={selectedPlatform}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(credentials) => {
          updateCredentials(credentials);
          setShowSettings(false);
        }}
        currentCredentials={state.credentials}
      />

      {/* Stream Statistics Dashboard */}
      {isLive && (
        <StreamStatsComponent
          stats={state.stats}
          isLive={isLive}
        />
      )}

      {/* Stream Transport Controls */}
      {isLive && (
        <StreamTransport
          isLive={isLive}
          isPaused={state.isPaused}
          onPause={() => pauseStream().catch(console.error)}
          onResume={() => resumeStream().catch(console.error)}
          onMute={() => setIsMuted(true)}
          onUnmute={() => setIsMuted(false)}
          onScreenshot={() => captureScreenshot().catch(console.error)}
          onDisconnect={stopStream}
          isMuted={isMuted}
          canPause={true}
        />
      )}

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-700">
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Quick Tips</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Test your stream before going live</li>
            <li>• Monitor CPU and bitrate closely</li>
            <li>• Use lower bitrate on unstable networks</li>
          </ul>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Supported Platforms</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✓ Twitch</li>
            <li>✓ YouTube Live</li>
            <li>✓ Facebook Live</li>
            <li>✓ Custom RTMP</li>
          </ul>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Current Status</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <div>
              Status:{' '}
              <span className="font-mono text-amber-400 capitalize">
                {state.status}
              </span>
            </div>
            <div>
              Platform:{' '}
              <span className="font-mono text-amber-400">
                {state.settings.platform}
              </span>
            </div>
            {isLive && (
              <div>
                Uptime:{' '}
                <span className="font-mono text-green-400">
                  {Math.floor(state.stats.uptime / 60)}m {state.stats.uptime % 60}s
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { StreamingControl, PlatformSettings, StreamStatsComponent, StreamTransport };
