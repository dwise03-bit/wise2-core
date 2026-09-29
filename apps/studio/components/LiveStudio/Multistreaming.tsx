'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Settings,
  Users,
  Zap,
  Eye,
  TrendingDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { StreamingPlatform } from './streamingTypes';
import { PLATFORM_CONFIGS, BITRATE_PRESETS } from './streamingConstants';

export interface PlatformStreamStatus {
  platform: StreamingPlatform;
  isEnabled: boolean;
  isConnected: boolean;
  viewerCount: number;
  bitrateCurrent: number; // kbps
  bitrateTarget: number; // kbps
  error?: string;
  latencyDelay: number; // ms
  reconnectAttempts: number;
}

export interface EncodingSettings {
  resolution: '480p' | '720p' | '1080p' | '1440p' | '2160p';
  fps: 24 | 30 | 48 | 50 | 60;
  baselineBitrate: number; // kbps
}

export interface FailoverSettings {
  enableFailover: boolean;
  continueOnDisconnect: boolean;
  maxReconnectAttempts: number;
}

interface MultistreamsProps {
  onConnect?: (platforms: StreamingPlatform[]) => void;
  onDisconnect?: (platform: StreamingPlatform) => void;
  onEncodingChange?: (settings: EncodingSettings) => void;
  onSettingsChange?: (settings: FailoverSettings) => void;
}

const PLATFORM_ICONS: Record<StreamingPlatform, React.ReactNode> = {
  twitch: (
    <div className="w-4 h-4 bg-purple-500 rounded" title="Twitch">
      Tw
    </div>
  ),
  youtube: (
    <div className="w-4 h-4 bg-red-500 rounded" title="YouTube">
      YT
    </div>
  ),
  facebook: (
    <div className="w-4 h-4 bg-blue-600 rounded" title="Facebook">
      FB
    </div>
  ),
  'custom-rtmp': (
    <div className="w-4 h-4 bg-gray-500 rounded" title="Custom RTMP">
      RT
    </div>
  ),
};

export default function Multistreaming({
  onConnect,
  onDisconnect,
  onEncodingChange,
  onSettingsChange,
}: MultistreamsProps) {
  const [enabledPlatforms, setEnabledPlatforms] = useState<
    Set<StreamingPlatform>
  >(new Set(['twitch']));
  const [platformStats, setPlatformStats] = useState<
    Map<StreamingPlatform, PlatformStreamStatus>
  >(
    new Map([
      [
        'twitch',
        {
          platform: 'twitch',
          isEnabled: true,
          isConnected: false,
          viewerCount: 0,
          bitrateCurrent: 0,
          bitrateTarget: 3500,
          latencyDelay: 5000,
          reconnectAttempts: 0,
        },
      ],
      [
        'youtube',
        {
          platform: 'youtube',
          isEnabled: false,
          isConnected: false,
          viewerCount: 0,
          bitrateCurrent: 0,
          bitrateTarget: 3500,
          latencyDelay: 10000,
          reconnectAttempts: 0,
        },
      ],
      [
        'facebook',
        {
          platform: 'facebook',
          isEnabled: false,
          isConnected: false,
          viewerCount: 0,
          bitrateCurrent: 0,
          bitrateTarget: 3500,
          latencyDelay: 7000,
          reconnectAttempts: 0,
        },
      ],
      [
        'custom-rtmp',
        {
          platform: 'custom-rtmp',
          isEnabled: false,
          isConnected: false,
          viewerCount: 0,
          bitrateCurrent: 0,
          bitrateTarget: 3500,
          latencyDelay: 3000,
          reconnectAttempts: 0,
        },
      ],
    ])
  );

  const [encoding, setEncoding] = useState<EncodingSettings>({
    resolution: '720p',
    fps: 30,
    baselineBitrate: 3500,
  });

  const [failoverSettings, setFailoverSettings] = useState<FailoverSettings>({
    enableFailover: true,
    continueOnDisconnect: true,
    maxReconnectAttempts: 5,
  });

  const [showEncodingSettings, setShowEncodingSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showPlatformSettings, setShowPlatformSettings] = useState<
    StreamingPlatform | null
  >(null);

  const platforms: StreamingPlatform[] = [
    'twitch',
    'youtube',
    'facebook',
    'custom-rtmp',
  ];

  const handlePlatformToggle = useCallback(
    (platform: StreamingPlatform) => {
      setEnabledPlatforms((prev) => {
        const updated = new Set(prev);
        if (updated.has(platform)) {
          updated.delete(platform);
          setPlatformStats((stats) => {
            const updated = new Map(stats);
            const stat = updated.get(platform);
            if (stat) {
              stat.isEnabled = false;
              stat.isConnected = false;
            }
            return updated;
          });
          onDisconnect?.(platform);
        } else {
          updated.add(platform);
          setPlatformStats((stats) => {
            const updated = new Map(stats);
            const stat = updated.get(platform);
            if (stat) {
              stat.isEnabled = true;
            }
            return updated;
          });
        }
        return updated;
      });
    },
    [onDisconnect]
  );

  const handleDisconnectPlatform = useCallback(
    (platform: StreamingPlatform) => {
      handlePlatformToggle(platform);
    },
    [handlePlatformToggle]
  );

  const handleEncodingChange = useCallback(
    (updates: Partial<EncodingSettings>) => {
      const updated = { ...encoding, ...updates };
      setEncoding(updated);
      onEncodingChange?.(updated);

      // Update target bitrates for all platforms based on resolution
      const platformBitrate =
        BITRATE_PRESETS[updated.resolution as keyof typeof BITRATE_PRESETS];
      if (platformBitrate) {
        setPlatformStats((stats) => {
          const updated = new Map(stats);
          updated.forEach((stat) => {
            stat.bitrateTarget = platformBitrate.recommended;
          });
          return updated;
        });
      }
    },
    [encoding, onEncodingChange]
  );

  const handleFailoverSettingsChange = useCallback(
    (updates: Partial<FailoverSettings>) => {
      const updated = { ...failoverSettings, ...updates };
      setFailoverSettings(updated);
      onSettingsChange?.(updated);
    },
    [failoverSettings, onSettingsChange]
  );

  const handleLatencyChange = useCallback(
    (platform: StreamingPlatform, latency: number) => {
      setPlatformStats((stats) => {
        const updated = new Map(stats);
        const stat = updated.get(platform);
        if (stat) {
          stat.latencyDelay = latency;
        }
        return updated;
      });
    },
    []
  );

  const totalViewers = useMemo(() => {
    let total = 0;
    enabledPlatforms.forEach((platform) => {
      const stat = platformStats.get(platform);
      if (stat) {
        total += stat.viewerCount;
      }
    });
    return total;
  }, [enabledPlatforms, platformStats]);

  const averageBitrate = useMemo(() => {
    if (enabledPlatforms.size === 0) return 0;
    let total = 0;
    enabledPlatforms.forEach((platform) => {
      const stat = platformStats.get(platform);
      if (stat) {
        total += stat.bitrateCurrent;
      }
    });
    return Math.round(total / enabledPlatforms.size);
  }, [enabledPlatforms, platformStats]);

  const hasErrors = useMemo(() => {
    let count = 0;
    enabledPlatforms.forEach((platform) => {
      const stat = platformStats.get(platform);
      if (stat && stat.error) {
        count++;
      }
    });
    return count;
  }, [enabledPlatforms, platformStats]);

  const connectedCount = useMemo(() => {
    let count = 0;
    enabledPlatforms.forEach((platform) => {
      const stat = platformStats.get(platform);
      if (stat && stat.isConnected) {
        count++;
      }
    });
    return count;
  }, [enabledPlatforms, platformStats]);

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-medium mb-1">
            Connected Platforms
          </div>
          <div className="text-2xl font-bold text-white">
            {connectedCount}/{enabledPlatforms.size}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {enabledPlatforms.size === 0 ? 'Select platforms' : 'Multi-streaming'}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-medium mb-1">
            Total Viewers
          </div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            {totalViewers.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-2">All platforms</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-medium mb-1">
            Avg Bitrate
          </div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            {averageBitrate}
          </div>
          <div className="text-xs text-gray-500 mt-2">kbps</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-medium mb-1">Status</div>
          <div className="flex items-center gap-2">
            {hasErrors > 0 ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-lg font-bold text-red-400">
                  {hasErrors} Error{hasErrors !== 1 ? 's' : ''}
                </span>
              </>
            ) : enabledPlatforms.size > 0 ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-lg font-bold text-green-400">Ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-bold text-gray-400">Idle</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {enabledPlatforms.size > 1 ? 'Multi-streaming' : 'Single platform'}
          </div>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Streaming Platforms
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {platforms.map((platform) => {
            const config = PLATFORM_CONFIGS[platform];
            const stat = platformStats.get(platform);

            return (
              <div
                key={platform}
                className={`p-4 border rounded-lg transition ${
                  enabledPlatforms.has(platform)
                    ? 'bg-slate-800 border-amber-500/50'
                    : 'bg-slate-800/50 border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabledPlatforms.has(platform)}
                        onChange={() => handlePlatformToggle(platform)}
                        className="w-4 h-4 rounded border-slate-500 text-amber-500 focus:ring-amber-500"
                      />
                      <span
                        className={`font-medium ${
                          enabledPlatforms.has(platform)
                            ? 'text-white'
                            : 'text-gray-400'
                        }`}
                      >
                        {config.name}
                      </span>
                    </label>
                  </div>

                  {stat?.isConnected ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : enabledPlatforms.has(platform) ? (
                    <WifiOff className="w-4 h-4 text-amber-400" />
                  ) : null}
                </div>

                {enabledPlatforms.has(platform) && stat && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
                    {/* Status Row */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <div className="flex items-center gap-2">
                        {stat.error ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-xs">Error</span>
                          </>
                        ) : stat.isConnected ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-xs">
                              Connected
                            </span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400 text-xs">
                              Disconnected
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Viewers */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        Viewers
                      </span>
                      <span className="text-white font-medium">
                        {stat.viewerCount.toLocaleString()}
                      </span>
                    </div>

                    {/* Bitrate */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        Bitrate
                      </span>
                      <span className="text-white font-mono text-xs">
                        <span
                          className={
                            stat.bitrateCurrent > stat.bitrateTarget * 1.1
                              ? 'text-red-400'
                              : stat.bitrateCurrent > stat.bitrateTarget * 0.9
                                ? 'text-amber-400'
                                : 'text-green-400'
                          }
                        >
                          {stat.bitrateCurrent}
                        </span>
                        <span className="text-gray-500 ml-1">
                          / {stat.bitrateTarget} kbps
                        </span>
                      </span>
                    </div>

                    {/* Latency Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        Latency
                      </span>
                      <span className="text-white font-mono text-xs">
                        {(stat.latencyDelay / 1000).toFixed(1)}s
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700">
                      <button
                        onClick={() => setShowPlatformSettings(platform)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-xs font-medium rounded transition"
                      >
                        <Settings className="w-3 h-3" />
                        Settings
                      </button>
                      <button
                        onClick={() => handleDisconnectPlatform(platform)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium rounded transition"
                      >
                        <X className="w-3 h-3" />
                        Disable
                      </button>
                    </div>

                    {stat.error && (
                      <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300 mt-2">
                        {stat.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shared Encoding Settings */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg">
        <button
          onClick={() => setShowEncodingSettings(!showEncodingSettings)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-800/50 transition"
        >
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Shared Encoding Settings
          </h3>
          {showEncodingSettings ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showEncodingSettings && (
          <div className="px-6 pb-6 space-y-4 border-t border-slate-700 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Resolution */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution
                </label>
                <select
                  value={encoding.resolution}
                  onChange={(e) =>
                    handleEncodingChange({
                      resolution: e.target.value as EncodingSettings['resolution'],
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {['480p', '720p', '1080p', '1440p', '2160p'].map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Applied to all platforms
                </p>
              </div>

              {/* FPS */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frame Rate
                </label>
                <select
                  value={encoding.fps}
                  onChange={(e) =>
                    handleEncodingChange({ fps: parseInt(e.target.value) as EncodingSettings['fps'] })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {[24, 30, 48, 50, 60].map((fps) => (
                    <option key={fps} value={fps}>
                      {fps} FPS
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Universal FPS for all streams
                </p>
              </div>

              {/* Baseline Bitrate */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Baseline Bitrate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={encoding.baselineBitrate}
                    onChange={(e) =>
                      handleEncodingChange({
                        baselineBitrate: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                    min="500"
                    max="20000"
                    step="100"
                  />
                  <span className="text-sm text-gray-400">kbps</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Optimized per platform
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Note:</span> These settings apply
                to all selected platforms. Individual platform bitrates are
                automatically optimized based on platform capabilities.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg">
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-800/50 transition"
        >
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-400" />
            Failover & Resilience
          </h3>
          {showAdvancedSettings ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showAdvancedSettings && (
          <div className="px-6 pb-6 space-y-4 border-t border-slate-700 pt-6">
            <div className="space-y-4">
              {/* Enable Failover */}
              <div className="flex items-start gap-4">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    checked={failoverSettings.enableFailover}
                    onChange={(e) =>
                      handleFailoverSettingsChange({
                        enableFailover: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-500 text-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Enable Failover Protection
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Automatically detect and recover from platform disconnections
                  </p>
                </div>
              </div>

              {/* Continue on Disconnect */}
              {failoverSettings.enableFailover && (
                <div className="flex items-start gap-4 ml-4 pl-4 border-l-2 border-blue-500/30">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      checked={failoverSettings.continueOnDisconnect}
                      onChange={(e) =>
                        handleFailoverSettingsChange({
                          continueOnDisconnect: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-slate-500 text-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Continue Stream on Single Platform Failure
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      Keep streaming to other platforms if one disconnects
                    </p>
                  </div>
                </div>
              )}

              {/* Max Reconnect Attempts */}
              {failoverSettings.enableFailover && (
                <div className="flex items-start gap-4 ml-4 pl-4 border-l-2 border-blue-500/30">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Reconnect Attempts
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={failoverSettings.maxReconnectAttempts}
                        onChange={(e) =>
                          handleFailoverSettingsChange({
                            maxReconnectAttempts: parseInt(e.target.value),
                          })
                        }
                        className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                        min="1"
                        max="10"
                      />
                      <span className="text-sm text-gray-400">attempts</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Number of times to retry connecting to a disconnected
                      platform
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200">
                <span className="font-medium">Failover Strategy:</span> If a
                platform disconnects, the system will attempt to reconnect while
                continuing to stream to other active platforms.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Platform-Specific Settings Modal */}
      {showPlatformSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {PLATFORM_CONFIGS[showPlatformSettings].name} Settings
              </h3>
              <button
                onClick={() => setShowPlatformSettings(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latency Delay (ms)
                </label>
                <input
                  type="number"
                  value={platformStats.get(showPlatformSettings)?.latencyDelay || 0}
                  onChange={(e) =>
                    handleLatencyChange(
                      showPlatformSettings,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  min="0"
                  max="30000"
                  step="1000"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Platform-specific latency compensation. YouTube typically has
                  10-15s latency, Twitch 3-5s.
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-sm text-gray-300">
                  <p className="font-medium mb-2">Platform Info:</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p>
                      <span className="text-gray-300">Recommended Bitrate:</span>{' '}
                      {PLATFORM_CONFIGS[showPlatformSettings].recommendedBitrate.min} -{' '}
                      {PLATFORM_CONFIGS[showPlatformSettings].recommendedBitrate.max}{' '}
                      kbps
                    </p>
                    <p>
                      <span className="text-gray-300">Supported FPS:</span>{' '}
                      {PLATFORM_CONFIGS[
                        showPlatformSettings
                      ].supportedFPS.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-6 border-t border-slate-700">
              <button
                onClick={() => setShowPlatformSettings(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 font-medium rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => setShowPlatformSettings(null)}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
