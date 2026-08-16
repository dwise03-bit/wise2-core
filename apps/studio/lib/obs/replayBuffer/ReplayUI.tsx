'use client';

/**
 * Replay Buffer UI Component
 *
 * Provides controls for:
 * - Duration selector (10s, 30s, 60s, custom)
 * - Save Replay button with hotkey display
 * - Recent replays list with play/download options
 * - Auto-saving status indicators
 */

import React, { useState } from 'react';
import { ReplayUIProps, ReplaySave } from './types';
import { useReplayBuffer } from './useReplayBuffer';

interface ReplayUIExtendedProps extends ReplayUIProps {
  className?: string;
  showAdvanced?: boolean;
}

export function ReplayUI({
  isStreaming,
  onReplaySaved,
  onError,
  className = '',
  showAdvanced = false,
}: ReplayUIExtendedProps) {
  const {
    status,
    savedReplays,
    selectedDuration,
    isSaving,
    error,
    startCapture,
    stopCapture,
    saveReplay,
    deleteReplay,
    downloadReplay,
    playReplay,
    setSelectedDuration,
    formatBytes,
    formatDuration,
  } = useReplayBuffer({
    enabled: isStreaming,
    config: { maxDurationSeconds: selectedDuration },
    onReplaySaved,
    onError,
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [customDuration, setCustomDuration] = useState('');

  // Start/stop capture when streaming status changes
  React.useEffect(() => {
    if (isStreaming && !status.isRecording) {
      startCapture();
    } else if (!isStreaming && status.isRecording) {
      stopCapture();
    }
  }, [isStreaming, status.isRecording, startCapture, stopCapture]);

  const durationOptions = [
    { label: '10 sec', value: 10 },
    { label: '30 sec', value: 30 },
    { label: '60 sec', value: 60 },
  ];

  const handleDurationChange = (value: number) => {
    setSelectedDuration(value);
    setCustomDuration('');
  };

  const handleCustomDuration = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 300) {
      setCustomDuration(value);
      setSelectedDuration(num);
    }
  };

  const handleSaveReplay = async () => {
    try {
      await saveReplay();
    } catch (err) {
      console.error('Failed to save replay:', err);
    }
  };

  return (
    <div className={`replay-ui ${className}`}>
      {/* Main Control Panel */}
      <div className="replay-control-panel">
        <div className="replay-header">
          <h3 className="replay-title">
            <span className="replay-icon">⏱️</span> Instant Replay
          </h3>
          <button
            className="replay-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Toggle replay buffer panel"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {isExpanded && (
          <>
            {/* Duration Selector */}
            <div className="replay-section">
              <label className="replay-label">Duration</label>
              <div className="duration-selector">
                {durationOptions.map(option => (
                  <button
                    key={option.value}
                    className={`duration-btn ${selectedDuration === option.value ? 'active' : ''}`}
                    onClick={() => handleDurationChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Custom Duration Input */}
              <div className="custom-duration">
                <input
                  type="number"
                  min="1"
                  max="300"
                  placeholder="Custom (1-300s)"
                  value={customDuration}
                  onChange={e => handleCustomDuration(e.target.value)}
                  className="custom-duration-input"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="replay-section">
              <button
                className={`save-replay-btn ${isSaving ? 'saving' : ''} ${!isStreaming ? 'disabled' : ''}`}
                onClick={handleSaveReplay}
                disabled={!isStreaming || isSaving}
                title="Save Replay (Shift+Ctrl+R or Shift+Cmd+R)"
              >
                {isSaving ? (
                  <>
                    <span className="spinner"></span> Saving...
                  </>
                ) : (
                  <>
                    <span className="save-icon">💾</span> Save Replay
                  </>
                )}
              </button>
              <div className="hotkey-hint">Hotkey: Shift+Ctrl+R</div>
            </div>

            {/* Buffer Status */}
            {showAdvanced && status.isRecording && (
              <div className="replay-section replay-status">
                <div className="status-item">
                  <span className="status-label">Duration:</span>
                  <span className="status-value">{formatDuration(status.currentDuration)}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Buffer Size:</span>
                  <span className="status-value">{formatBytes(status.bufferSize)}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Frames:</span>
                  <span className="status-value">{status.frameCount}</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="replay-error">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{error.message}</span>
              </div>
            )}

            {/* Recent Replays List */}
            {savedReplays.length > 0 && (
              <div className="replay-section">
                <label className="replay-label">Recent Replays ({savedReplays.length})</label>
                <div className="replays-list">
                  {savedReplays.map(replay => (
                    <ReplayItem
                      key={replay.id}
                      replay={replay}
                      onPlay={() => playReplay(replay.id)}
                      onDownload={() => downloadReplay(replay.id)}
                      onDelete={() => deleteReplay(replay.id)}
                      formatBytes={formatBytes}
                      formatDuration={formatDuration}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .replay-ui {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .replay-control-panel {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid #0f3460;
          border-radius: 8px;
          padding: 12px;
          color: #e0e0e0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .replay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .replay-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .replay-icon {
          font-size: 16px;
        }

        .replay-toggle {
          background: none;
          border: none;
          color: #e0e0e0;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .replay-toggle:hover {
          color: #00d4ff;
          transform: scale(1.1);
        }

        .replay-section {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(15, 52, 96, 0.5);
        }

        .replay-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .replay-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #a0a0a0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        /* Duration Selector */
        .duration-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-bottom: 8px;
        }

        .duration-btn {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid #0f3460;
          color: #00d4ff;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .duration-btn:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: #00d4ff;
        }

        .duration-btn.active {
          background: rgba(0, 212, 255, 0.3);
          border-color: #00d4ff;
          box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
        }

        .custom-duration {
          display: flex;
        }

        .custom-duration-input {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #0f3460;
          color: #e0e0e0;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .custom-duration-input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
        }

        /* Save Button */
        .save-replay-btn {
          width: 100%;
          background: linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%);
          border: none;
          color: #000;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .save-replay-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }

        .save-replay-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-replay-btn.saving {
          background: linear-gradient(135deg, #666 0%, #444 100%);
          color: #e0e0e0;
        }

        .save-icon {
          font-size: 14px;
        }

        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(0, 0, 0, 0.3);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hotkey-hint {
          font-size: 11px;
          color: #666;
          margin-top: 4px;
          text-align: center;
        }

        /* Status Display */
        .replay-status {
          background: rgba(0, 0, 0, 0.2);
          padding: 8px;
          border-radius: 4px;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .status-item:last-child {
          margin-bottom: 0;
        }

        .status-label {
          color: #888;
        }

        .status-value {
          color: #00d4ff;
          font-weight: 600;
        }

        /* Error Display */
        .replay-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 4px;
          padding: 8px;
          color: #ff6b6b;
          font-size: 12px;
        }

        .error-icon {
          font-size: 14px;
        }

        .error-message {
          flex: 1;
        }

        /* Replays List */
        .replays-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        @media (prefers-color-scheme: light) {
          .replay-control-panel {
            background: linear-gradient(135deg, #f5f5f5 0%, #efefef 100%);
            border-color: #ddd;
            color: #333;
          }

          .replay-toggle {
            color: #333;
          }

          .replay-toggle:hover {
            color: #0088cc;
          }

          .replay-label {
            color: #666;
          }

          .duration-btn {
            background: rgba(0, 136, 204, 0.1);
            border-color: #ddd;
            color: #0088cc;
          }

          .duration-btn:hover {
            background: rgba(0, 136, 204, 0.2);
            border-color: #0088cc;
          }

          .duration-btn.active {
            background: rgba(0, 136, 204, 0.3);
            box-shadow: 0 0 8px rgba(0, 136, 204, 0.3);
          }

          .custom-duration-input {
            background: rgba(0, 0, 0, 0.05);
            border-color: #ddd;
            color: #333;
          }

          .custom-duration-input:focus {
            border-color: #0088cc;
            box-shadow: 0 0 8px rgba(0, 136, 204, 0.2);
          }

          .replay-status {
            background: rgba(0, 136, 204, 0.05);
            border-color: rgba(0, 136, 204, 0.2);
          }

          .status-label {
            color: #666;
          }

          .status-value {
            color: #0088cc;
          }

          .hotkey-hint {
            color: #999;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Individual Replay Item Component
 */
interface ReplayItemProps {
  replay: ReplaySave;
  onPlay: () => void;
  onDownload: () => void;
  onDelete: () => void;
  formatBytes: (bytes: number) => string;
  formatDuration: (seconds: number) => string;
}

function ReplayItem({
  replay,
  onPlay,
  onDownload,
  onDelete,
  formatBytes,
  formatDuration,
}: ReplayItemProps) {
  return (
    <div className="replay-item">
      <div className="replay-item-info">
        <div className="replay-item-title">{replay.filename}</div>
        <div className="replay-item-meta">
          <span>{formatDuration(replay.duration)}</span>
          <span>•</span>
          <span>{formatBytes(replay.fileSize)}</span>
          <span>•</span>
          <span>{replay.frameRate}fps</span>
        </div>
      </div>
      <div className="replay-item-actions">
        <button
          className="replay-btn play-btn"
          onClick={onPlay}
          title="Play replay"
        >
          ▶
        </button>
        <button
          className="replay-btn download-btn"
          onClick={onDownload}
          title="Download replay"
        >
          ↓
        </button>
        <button
          className="replay-btn delete-btn"
          onClick={onDelete}
          title="Delete replay"
        >
          🗑
        </button>
      </div>

      <style jsx>{`
        .replay-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 212, 255, 0.1);
          border-radius: 4px;
          padding: 8px;
          gap: 12px;
        }

        .replay-item-info {
          flex: 1;
          min-width: 0;
        }

        .replay-item-title {
          font-size: 12px;
          font-weight: 500;
          color: #e0e0e0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .replay-item-meta {
          font-size: 11px;
          color: #888;
          margin-top: 2px;
          display: flex;
          gap: 4px;
        }

        .replay-item-actions {
          display: flex;
          gap: 4px;
        }

        .replay-btn {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          color: #00d4ff;
          width: 24px;
          height: 24px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .replay-btn:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: #00d4ff;
        }

        .delete-btn {
          color: #ff6b6b;
          border-color: rgba(255, 107, 107, 0.3);
          background: rgba(255, 107, 107, 0.1);
        }

        .delete-btn:hover {
          background: rgba(255, 107, 107, 0.2);
          border-color: #ff6b6b;
        }

        @media (prefers-color-scheme: light) {
          .replay-item {
            background: rgba(0, 136, 204, 0.05);
            border-color: rgba(0, 136, 204, 0.1);
          }

          .replay-item-title {
            color: #333;
          }

          .replay-item-meta {
            color: #666;
          }

          .replay-btn {
            background: rgba(0, 136, 204, 0.1);
            border-color: rgba(0, 136, 204, 0.3);
            color: #0088cc;
          }

          .replay-btn:hover {
            background: rgba(0, 136, 204, 0.2);
            border-color: #0088cc;
          }

          .delete-btn {
            color: #cc3333;
            border-color: rgba(204, 51, 51, 0.3);
            background: rgba(204, 51, 51, 0.1);
          }

          .delete-btn:hover {
            background: rgba(204, 51, 51, 0.2);
            border-color: #cc3333;
          }
        }
      `}</style>
    </div>
  );
}
