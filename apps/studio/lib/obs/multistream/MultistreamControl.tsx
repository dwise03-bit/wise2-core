'use client';

/**
 * Multistream Control Component
 * UI for enabling multistream, selecting platforms, managing stream keys, and monitoring status
 */

import React, { useState, useCallback, useEffect } from 'react';
import { MultistreamConfig, PlatformConfig, PlatformStatus, MultistreamStatus } from './types';
import MultistreamEngine from './MultistreamEngine';

interface MultistreamControlProps {
  onStatusChange?: (status: MultistreamStatus) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

interface PlatformUIState {
  isExpanded: boolean;
  showStreamKeyInput: boolean;
}

const PLATFORM_INFO = {
  twitch: {
    name: 'Twitch',
    icon: '📺',
    maxBitrate: 51000,
    maxLatency: 'low',
  },
  youtube: {
    name: 'YouTube Live',
    icon: '📹',
    maxBitrate: 51000,
    maxLatency: 'normal (+10s)',
  },
  facebook: {
    name: 'Facebook Live',
    icon: 'f',
    maxBitrate: 8000,
    maxLatency: 'normal',
  },
  linkedin: {
    name: 'LinkedIn Live',
    icon: 'in',
    maxBitrate: 8000,
    maxLatency: 'normal',
  },
  'custom-rtmp': {
    name: 'Custom RTMP',
    icon: '⚙️',
    maxBitrate: 51000,
    maxLatency: 'custom',
  },
};

type PlatformKey = keyof typeof PLATFORM_INFO;

export const MultistreamControl: React.FC<MultistreamControlProps> = ({
  onStatusChange,
  onError,
  enabled: initialEnabled = false,
}) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isStreaming, setIsStreaming] = useState(false);
  const [engine, setEngine] = useState<MultistreamEngine | null>(null);
  const [config, setConfig] = useState<MultistreamConfig | null>(null);
  const [status, setStatus] = useState<MultistreamStatus | null>(null);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformKeys, setPlatformKeys] = useState<Record<string, string>>({});
  const [platformUIState, setPlatformUIState] = useState<Record<string, PlatformUIState>>({});
  const [videoBitrate, setVideoBitrate] = useState(4500);
  const [fps, setFps] = useState(30);
  const [resolution, setResolution] = useState<'720p' | '1080p' | '1440p' | '2160p'>('1080p');
  const [encodingPreset, setEncodingPreset] = useState<'ultrafast' | 'fast' | 'medium' | 'slow'>(
    'fast',
  );

  // Initialize engine
  useEffect(() => {
    if (isEnabled && !engine) {
      const newEngine = new MultistreamEngine();

      newEngine.on('metrics-update', (event) => {
        setStatus(event.status);
        onStatusChange?.(event.status);
      });

      newEngine.on('platform-connected', (event) => {
        console.log(`Connected to ${event.platform}`);
      });

      newEngine.on('platform-error', (event) => {
        onError?.(`${event.platform} error: ${event.error}`);
      });

      setEngine(newEngine);
    }
  }, [isEnabled, engine, onStatusChange, onError]);

  /**
   * Handle multistream toggle
   */
  const handleToggleMultistream = useCallback(async (enabled: boolean) => {
    setIsEnabled(enabled);

    if (!enabled && isStreaming) {
      // Stop multistream if currently streaming
      await handleStopStream();
    }
  }, [isStreaming]);

  /**
   * Handle platform selection
   */
  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform);
      } else {
        return [...prev, platform];
      }
    });

    // Initialize platform UI state if not exists
    if (!platformUIState[platform]) {
      setPlatformUIState((prev) => ({
        ...prev,
        [platform]: { isExpanded: false, showStreamKeyInput: false },
      }));
    }
  };

  /**
   * Handle stream key input
   */
  const handleStreamKeyChange = (platform: string, key: string) => {
    setPlatformKeys((prev) => ({
      ...prev,
      [platform]: key,
    }));
  };

  /**
   * Validate configuration before starting
   */
  const validateConfig = (): { valid: boolean; error?: string } => {
    if (selectedPlatforms.length === 0) {
      return { valid: false, error: 'Select at least one platform' };
    }

    for (const platform of selectedPlatforms) {
      if (!platformKeys[platform]) {
        return { valid: false, error: `Stream key required for ${platform}` };
      }
    }

    return { valid: true };
  };

  /**
   * Start multistream broadcast
   */
  const handleStartStream = async () => {
    const validation = validateConfig();
    if (!validation.valid) {
      onError?.(validation.error || 'Configuration invalid');
      return;
    }

    if (!engine) {
      onError?.('Engine not initialized');
      return;
    }

    try {
      // Build platform configs
      const platforms: PlatformConfig[] = selectedPlatforms.map((platform) => ({
        id: platform,
        platform: platform as any,
        name: PLATFORM_INFO[platform as PlatformKey]?.name || platform,
        streamKey: platformKeys[platform],
        isEnabled: true,
        isConnected: false,
        status: 'idle',
        settings: {
          autoReconnect: true,
        },
      }));

      // Create multistream config
      const newConfig: MultistreamConfig = {
        id: `config-${Date.now()}`,
        name: 'Live Stream',
        platforms,
        encodingPreset,
        videoBitrate,
        audioBitrate: 128,
        resolution,
        fps,
        enableFailover: true,
        failoverDelay: 5000,
        enableMetrics: true,
        metricsInterval: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setConfig(newConfig);

      // Initialize and start engine
      await engine.initialize(newConfig);
      await engine.start();

      setIsStreaming(true);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to start stream');
    }
  };

  /**
   * Stop multistream broadcast
   */
  const handleStopStream = async () => {
    if (!engine || !isStreaming) return;

    try {
      await engine.stop();
      setIsStreaming(false);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to stop stream');
    }
  };

  /**
   * Toggle platform during stream
   */
  const handleTogglePlatformDuringStream = async (platform: string) => {
    if (!engine || !isStreaming) return;

    try {
      const enabled = !selectedPlatforms.includes(platform);
      await engine.togglePlatform(platform as any, enabled);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to toggle platform');
    }
  };

  /**
   * Get status color for platform
   */
  const getStatusColor = (platformStatus: PlatformStatus) => {
    switch (platformStatus) {
      case 'live':
        return '#10b981'; // green
      case 'connecting':
        return '#f59e0b'; // amber
      case 'error':
      case 'disconnected':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className="multistream-control">
      <style>{`
        .multistream-control {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 0.75rem;
          border: 1px solid #374151;
          color: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .multistream-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid #374151;
        }

        .multistream-title {
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: 3rem;
          height: 1.5rem;
          background: ${isEnabled ? '#10b981' : '#6b7280'};
          border-radius: 9999px;
          cursor: pointer;
          transition: background 0.3s;
          border: none;
          padding: 0;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          width: 1.25rem;
          height: 1.25rem;
          background: white;
          border-radius: 50%;
          top: 0.125rem;
          left: ${isEnabled ? 'calc(100% - 1.375rem)' : '0.125rem'};
          transition: left 0.3s;
        }

        .platform-selector {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .platform-label {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9ca3af;
        }

        .platform-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .platform-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #374151;
          border-radius: 0.5rem;
          border: 1px solid #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }

        .platform-card:hover {
          background: #4b5563;
          border-color: #60708b;
        }

        .platform-card.selected {
          background: #059669;
          border-color: #10b981;
        }

        .platform-card input[type='checkbox'] {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
          accent-color: #10b981;
        }

        .platform-info {
          flex: 1;
        }

        .platform-name {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .platform-details {
          font-size: 0.75rem;
          color: #d1d5db;
          margin-top: 0.25rem;
        }

        .stream-key-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 0.375rem;
        }

        .stream-key-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: #1f2937;
          border: 1px solid #4b5563;
          border-radius: 0.375rem;
          color: #f3f4f6;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
        }

        .stream-key-input::placeholder {
          color: #6b7280;
        }

        .stream-key-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .stream-key-info {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          background: #374151;
          border-radius: 0.5rem;
        }

        .setting-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          align-items: center;
          gap: 1rem;
        }

        .setting-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #d1d5db;
        }

        .setting-control {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .slider {
          flex: 1;
          height: 0.375rem;
          border-radius: 9999px;
          appearance: none;
          background: linear-gradient(
            to right,
            #10b981 0%,
            #10b981 ${((videoBitrate - 2500) / 5000) * 100}%,
            #4b5563 ${((videoBitrate - 2500) / 5000) * 100}%,
            #4b5563 100%
          );
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }

        .select {
          padding: 0.5rem 0.75rem;
          background: #1f2937;
          border: 1px solid #4b5563;
          border-radius: 0.375rem;
          color: #f3f4f6;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .select:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .value-display {
          min-width: 3rem;
          text-align: right;
          font-weight: 600;
          color: #f3f4f6;
        }

        .controls {
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #374151;
        }

        .button {
          flex: 1;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .button-primary {
          background: #10b981;
          color: white;
        }

        .button-primary:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .button-secondary {
          background: #6b7280;
          color: white;
        }

        .button-secondary:hover:not(:disabled) {
          background: #4b5563;
        }

        .button-danger {
          background: #ef4444;
          color: white;
        }

        .button-danger:hover:not(:disabled) {
          background: #dc2626;
        }

        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          padding: 1rem;
          background: #374151;
          border-radius: 0.5rem;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #10b981;
        }

        .platform-status-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .platform-status-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: #374151;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .status-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.5rem;
        }

        .status-text {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .viewer-count {
          color: #9ca3af;
          font-size: 0.75rem;
        }

        .error-message {
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 0.375rem;
          color: #fca5a5;
          font-size: 0.875rem;
        }
      `}</style>

      {/* Header */}
      <div className="multistream-header">
        <div className="multistream-title">🌐 Multistream Broadcasting</div>
        <button
          className="toggle-switch"
          onClick={() => handleToggleMultistream(!isEnabled)}
          title={isEnabled ? 'Disable multistream' : 'Enable multistream'}
        />
      </div>

      {isEnabled && (
        <>
          {/* Platform Selection */}
          <div className="platform-selector">
            <label className="platform-label">Select Platforms</label>
            <div className="platform-grid">
              {Object.entries(PLATFORM_INFO).map(([key, info]) => (
                <label
                  key={key}
                  className={`platform-card ${selectedPlatforms.includes(key) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(key)}
                    onChange={() => handlePlatformToggle(key)}
                    disabled={isStreaming}
                  />
                  <div className="platform-info">
                    <div className="platform-name">
                      {info.icon} {info.name}
                    </div>
                    <div className="platform-details">Max: {info.maxBitrate} kbps</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Stream Keys */}
          {selectedPlatforms.length > 0 && !isStreaming && (
            <div className="stream-key-input-wrapper">
              <label className="platform-label">Stream Keys</label>
              {selectedPlatforms.map((platform) => (
                <div key={platform}>
                  <label className="platform-label" style={{ marginBottom: '0.5rem' }}>
                    {PLATFORM_INFO[platform as PlatformKey]?.name || platform}
                  </label>
                  <input
                    type="password"
                    className="stream-key-input"
                    placeholder={`Enter ${platform} stream key`}
                    value={platformKeys[platform] || ''}
                    onChange={(e) => handleStreamKeyChange(platform, e.target.value)}
                    disabled={isStreaming}
                  />
                  <div className="stream-key-info">
                    💡 Stream keys are stored securely and never shared
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Encoding Settings */}
          <div className="settings-section">
            <label className="platform-label">Encoding Settings</label>

            <div className="setting-row">
              <label className="setting-label">Video Bitrate</label>
              <div className="setting-control">
                <input
                  type="range"
                  className="slider"
                  min={2500}
                  max={51000}
                  step={500}
                  value={videoBitrate}
                  onChange={(e) => setVideoBitrate(Number(e.target.value))}
                  disabled={isStreaming}
                />
                <span className="value-display">{videoBitrate} kbps</span>
              </div>
            </div>

            <div className="setting-row">
              <label className="setting-label">Resolution</label>
              <select
                className="select"
                value={resolution}
                onChange={(e) =>
                  setResolution(e.target.value as '720p' | '1080p' | '1440p' | '2160p')
                }
                disabled={isStreaming}
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="1440p">1440p</option>
                <option value="2160p">2160p (4K)</option>
              </select>
            </div>

            <div className="setting-row">
              <label className="setting-label">Frame Rate</label>
              <select
                className="select"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                disabled={isStreaming}
              >
                <option value={30}>30 FPS</option>
                <option value={60}>60 FPS</option>
              </select>
            </div>

            <div className="setting-row">
              <label className="setting-label">Encoding Preset</label>
              <select
                className="select"
                value={encodingPreset}
                onChange={(e) =>
                  setEncodingPreset(e.target.value as 'ultrafast' | 'fast' | 'medium' | 'slow')
                }
                disabled={isStreaming}
              >
                <option value="ultrafast">Ultrafast (Low Quality, High Speed)</option>
                <option value="fast">Fast (Recommended)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="slow">Slow (High Quality, High CPU)</option>
              </select>
            </div>
          </div>

          {/* Status Display */}
          {isStreaming && status && (
            <>
              <div className="status-display">
                <div className="status-item">
                  <div className="status-label">Active Platforms</div>
                  <div className="status-value">{status.activePlatforms}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">Total Viewers</div>
                  <div className="status-value">{status.totalViewers}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">FPS</div>
                  <div className="status-value">{status.fps}</div>
                </div>
                <div className="status-item">
                  <div className="status-label">Bitrate</div>
                  <div className="status-value">{Math.round(status.videoBitrate / 1000)}M</div>
                </div>
                <div className="status-item">
                  <div className="status-label">CPU</div>
                  <div className="status-value">{Math.round(status.cpuUsage)}%</div>
                </div>
                <div className="status-item">
                  <div className="status-label">Health</div>
                  <div className="status-value" style={{ color: getStatusColor('live') }}>
                    {status.healthStatus}
                  </div>
                </div>
              </div>

              {/* Platform Status List */}
              <div className="platform-selector">
                <label className="platform-label">Platform Status</label>
                <div className="platform-status-list">
                  {Object.entries(status.platforms).map(([platform, platformStatus]) => (
                    <div key={platform} className="platform-status-item">
                      <div className="status-text">
                        <span
                          className="status-dot"
                          style={{ background: getStatusColor(platformStatus.status) }}
                        />
                        {PLATFORM_INFO[platform as PlatformKey]?.name || platform}
                      </div>
                      <div className="status-text" style={{ justifyContent: 'flex-end' }}>
                        <span
                          style={{
                            textTransform: 'capitalize',
                            color: getStatusColor(platformStatus.status),
                          }}
                        >
                          {platformStatus.status}
                        </span>
                        {platformStatus.viewerCount !== undefined && (
                          <span className="viewer-count">
                            👁️ {platformStatus.viewerCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Controls */}
          <div className="controls">
            {!isStreaming ? (
              <button
                className="button button-primary"
                onClick={handleStartStream}
                disabled={selectedPlatforms.length === 0}
              >
                🔴 Start Streaming
              </button>
            ) : (
              <>
                <button className="button button-danger" onClick={handleStopStream}>
                  ⏹️ Stop Streaming
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MultistreamControl;
