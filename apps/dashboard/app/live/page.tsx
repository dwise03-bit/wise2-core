'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  StreamViewer,
  StreamControls,
  StreamStats,
  AudioMixer,
  SceneSwitcher,
  StreamDestinations,
  StreamInfo,
  LiveChat,
  StreamAnalytics,
} from '../../components/live-streaming';

/**
 * Live Streaming Page
 * Professional streaming interface with all controls, metrics, and communication tools
 * Integrates audio engine from WISE² studio
 */
export default function LiveStreamingPage() {
  // Stream State
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);

  // Viewer and Metrics State
  const [viewerCount, setViewerCount] = useState(1256);
  const [bitrate, setBitrate] = useState(8450);
  // eslint-disable-next-line no-unused-vars
  const [health] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [masterVolume, setMasterVolume] = useState(0.8);

  // Stream Configuration
  const streamKey = 'rtmp-stream-key-1a2b3c4d5e6f7g8h9i0j';
  const streamTitle = 'Premium Audio Stream - Live Session';

  // Simulate duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  // Simulate viewer count changes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setViewerCount((prev) => prev + Math.floor(Math.random() * 10 - 3));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  // Simulate bitrate fluctuations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setBitrate((prev) => {
          const change = Math.floor(Math.random() * 400 - 200);
          const newBitrate = prev + change;
          return Math.max(6000, Math.min(10000, newBitrate));
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const handleToggleLive = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (!isLive) {
        setIsLive(true);
        setStreamDuration(0);
        setViewerCount(100);
      } else {
        setIsLive(false);
        setStreamDuration(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLive]);

  const handleChannelVolumeChange = (channelId: string, volume: number) => {
    console.log(`Channel ${channelId} volume changed to ${volume}`);
  };

  const handleChannelMute = (channelId: string, muted: boolean) => {
    console.log(`Channel ${channelId} muted: ${muted}`);
  };

  const handleMasterVolumeChange = (volume: number) => {
    setMasterVolume(volume);
    console.log(`Master volume changed to ${volume}`);
  };

  const handleSceneChange = (sceneId: string) => {
    console.log(`Scene changed to ${sceneId}`);
  };

  const handleDestinationToggle = (destinationId: string, isActive: boolean) => {
    console.log(`Destination ${destinationId} toggled to ${isActive}`);
  };

  const handleStreamInfoUpdate = (info: any) => {
    console.log('Stream info updated:', info);
  };

  const handleSendMessage = (message: string) => {
    console.log('Chat message:', message);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-chrome overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur sticky top-0 z-40">
        <div className="px-lg py-md max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">LIVE STREAMING</h1>
            <p className="text-sm text-gray-400 mt-1">Professional broadcast control center</p>
          </div>

          {/* Quick Status */}
          {isLive && (
            <div className="flex items-center gap-md">
              <div className="text-right">
                <div className="text-sm text-gray-300">
                  <span className="font-mono font-bold text-blue-400">
                    {formatDuration(streamDuration)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="h-12 w-0.5 bg-gray-700" />
              <div className="text-right">
                <div className="text-sm text-gray-300">
                  <span className="font-mono font-bold text-green-400">
                    {viewerCount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Viewers</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-lg py-lg max-w-7xl mx-auto space-y-lg">
        {/* Top Section: Stream Viewer and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Stream Viewer - Left 2/3 */}
          <div className="lg:col-span-2 space-y-md">
            <StreamViewer isLive={isLive} streamTitle={streamTitle} />

            <StreamControls
              isLive={isLive}
              onToggleLive={handleToggleLive}
              isLoading={isLoading}
            />

            <StreamStats
              streamKey={streamKey}
              health={health}
              bitrate={bitrate}
              resolution="1920x1080"
              frameRate={60}
              masterVolume={masterVolume}
            />
          </div>

          {/* Right Column: Chat and Analytics Preview */}
          <div className="space-y-md">
            <StreamAnalytics
              viewers={viewerCount}
              bitrate={bitrate}
              health={health}
            />
          </div>
        </div>

        {/* Middle Section: Audio and Scene Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Audio Mixer */}
          <AudioMixer
            onChannelVolumeChange={handleChannelVolumeChange}
            onChannelMute={handleChannelMute}
            masterVolume={masterVolume}
            onMasterVolumeChange={handleMasterVolumeChange}
          />

          {/* Scene Switcher */}
          <SceneSwitcher onSceneChange={handleSceneChange} />
        </div>

        {/* Bottom Section: Destinations, Info, and Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Stream Destinations - Left */}
          <div>
            <StreamDestinations onDestinationToggle={handleDestinationToggle} />
          </div>

          {/* Stream Info - Middle */}
          <div>
            <StreamInfo onUpdate={handleStreamInfoUpdate} isEditable={true} />
          </div>

          {/* Live Chat - Right */}
          <div className="h-full">
            <LiveChat
              viewerCount={viewerCount}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="border-t border-gray-800 pt-md">
          <div className="grid grid-cols-4 gap-md text-sm">
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Uptime</p>
              <p className="text-lg font-bold text-blue-400">
                {formatDuration(streamDuration)}
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Viewers</p>
              <p className="text-lg font-bold text-green-400">
                {viewerCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bitrate</p>
              <p className="text-lg font-bold text-purple-400">
                {(bitrate / 1000).toFixed(1)} Mbps
              </p>
            </div>
            <div className={`rounded-lg p-md border ${
              health === 'excellent'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
            }`}>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
              <p className="text-lg font-bold capitalize">{health}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-900/80 border border-gray-700 rounded-lg p-md text-xs text-gray-300 max-w-xs">
          <p className="font-bold mb-1">Stream State:</p>
          <p>Status: {isLive ? 'LIVE' : 'OFFLINE'}</p>
          <p>Viewers: {viewerCount}</p>
          <p>Bitrate: {bitrate} kbps</p>
          <p>Master Vol: {Math.round(masterVolume * 100)}%</p>
        </div>
      )}
    </div>
  );
}
