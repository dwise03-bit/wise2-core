'use client';

/**
 * Example Component: Clip Playback Integration
 *
 * Demonstrates how to use the useClipPlayback hook for managing
 * multi-track audio playback with volume control and pause/resume.
 *
 * This component serves as a reference implementation for:
 * - Registering clips from useClips hook
 * - Managing playback state
 * - Controlling volume per clip and track
 * - Handling pause/resume workflow
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useClipPlayback } from '@/hooks/useClipPlayback';
import { useClips, type ClipData } from '@/hooks/useClips';

/**
 * Playback state for the component
 */
interface PlaybackUIState {
  isPlaying: boolean;
  isPaused: boolean;
  selectedClipId: string | null;
  clipVolumes: Record<string, number>;
  trackVolumes: Record<string, number>;
}

/**
 * Example component demonstrating clip playback
 */
export function ClipPlaybackExample() {
  // Initialize hooks
  const playback = useClipPlayback({
    fadeDuration: 0.15,
    onClipEnded: (clipId) => {
      console.log(`[ClipPlayback] Clip ended: ${clipId}`);
    },
  });

  const { clips, addClip, removeClip, getClip } = useClips();

  // Local UI state
  const [uiState, setUiState] = useState<PlaybackUIState>({
    isPlaying: false,
    isPaused: false,
    selectedClipId: null,
    clipVolumes: {},
    trackVolumes: {},
  });

  /**
   * Register/unregister clips when they change
   */
  useEffect(() => {
    clips.forEach((clip) => {
      playback.registerClip(clip);
      setUiState((prev) => ({
        ...prev,
        clipVolumes: {
          ...prev.clipVolumes,
          [clip.id]: 1.0,
        },
      }));
    });

    return () => {
      const currentClips = Array.from(playback.playingClips);
      if (currentClips.length > 0) {
        playback.stopAllClips();
      }
    };
  }, [clips, playback]);

  /**
   * Play all clips (multi-track playback)
   */
  const handlePlayAll = useCallback(async () => {
    try {
      // Get all clip IDs
      const clipIds = clips.map((clip) => clip.id);

      // Start playback of all clips simultaneously
      await Promise.all(clipIds.map((clipId) => playback.playClip(clipId)));

      setUiState((prev) => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
      }));

      console.log(`[ClipPlayback] Started playback of ${clipIds.length} clips`);
    } catch (error) {
      console.error('[ClipPlayback] Error playing clips:', error);
    }
  }, [clips, playback]);

  /**
   * Pause all clips
   */
  const handlePauseAll = useCallback(() => {
    playback.pauseAllClips();
    setUiState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
    }));
  }, [playback]);

  /**
   * Resume from pause
   */
  const handleResume = useCallback(() => {
    playback.resumeAllClips();
    setUiState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
    }));
  }, [playback]);

  /**
   * Stop all playback
   */
  const handleStopAll = useCallback(() => {
    playback.stopAllClips();
    setUiState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));
  }, [playback]);

  /**
   * Play a specific clip
   */
  const handlePlayClip = useCallback(
    async (clipId: string) => {
      try {
        // Stop if already playing
        if (playback.isClipPlaying(clipId)) {
          playback.stopClip(clipId);
        } else {
          await playback.playClip(clipId);
          setUiState((prev) => ({
            ...prev,
            isPlaying: true,
          }));
        }
      } catch (error) {
        console.error(`[ClipPlayback] Error playing clip ${clipId}:`, error);
      }
    },
    [playback]
  );

  /**
   * Handle clip volume change
   */
  const handleClipVolumeChange = useCallback(
    (clipId: string, volume: number) => {
      playback.setClipVolume(clipId, volume);
      setUiState((prev) => ({
        ...prev,
        clipVolumes: {
          ...prev.clipVolumes,
          [clipId]: volume,
        },
      }));
    },
    [playback]
  );

  /**
   * Handle track volume change
   */
  const handleTrackVolumeChange = useCallback(
    (trackId: string, volume: number) => {
      playback.setTrackVolume(trackId, volume);
      setUiState((prev) => ({
        ...prev,
        trackVolumes: {
          ...prev.trackVolumes,
          [trackId]: volume,
        },
      }));
    },
    [playback]
  );

  /**
   * Handle master volume change
   */
  const handleMasterVolumeChange = useCallback(
    (volume: number) => {
      playback.setMasterVolume(volume);
    },
    [playback]
  );

  /**
   * Toggle mute for a clip
   */
  const handleToggleMute = useCallback(
    (clipId: string) => {
      if (playback.isClipPlaying(clipId)) {
        // Toggle based on current volume
        const currentVolume = uiState.clipVolumes[clipId] || 1.0;
        if (currentVolume > 0) {
          playback.muteClip(clipId);
        } else {
          playback.unmuteClip(clipId);
        }
      }
    },
    [playback, uiState.clipVolumes]
  );

  /**
   * Delete a clip
   */
  const handleDeleteClip = useCallback(
    (clipId: string) => {
      // Stop if playing
      if (playback.isClipPlaying(clipId)) {
        playback.stopClip(clipId);
      }

      // Unregister
      playback.unregisterClip(clipId);

      // Remove from clips
      removeClip(clipId);

      // Deselect if selected
      if (uiState.selectedClipId === clipId) {
        setUiState((prev) => ({
          ...prev,
          selectedClipId: null,
        }));
      }
    },
    [playback, removeClip, uiState.selectedClipId]
  );

  /**
   * Group clips by track for rendering
   */
  const clipsByTrack = React.useMemo(() => {
    const grouped: Record<string, ClipData[]> = {};
    clips.forEach((clip) => {
      if (!grouped[clip.trackId]) {
        grouped[clip.trackId] = [];
      }
      grouped[clip.trackId].push(clip);
    });
    return grouped;
  }, [clips]);

  return (
    <div className="clip-playback-example">
      <style>{`
        .clip-playback-example {
          padding: 20px;
          background: #0f0f0f;
          color: #fff;
          border-radius: 8px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 24px;
        }

        .header h2 {
          margin: 0 0 12px 0;
          font-size: 20px;
          font-weight: 600;
        }

        .master-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 20px;
          padding: 16px;
          background: #1a1a1a;
          border-radius: 6px;
        }

        .master-controls button {
          padding: 8px 16px;
          background: #00d9ff;
          color: #000;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .master-controls button:hover {
          background: #00b8d4;
        }

        .master-controls button:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .master-controls .status {
          margin-left: auto;
          font-size: 14px;
          color: #00d9ff;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: 12px;
          min-width: 200px;
        }

        .volume-control label {
          font-size: 12px;
          color: #aaa;
        }

        .volume-control input {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          cursor: pointer;
        }

        .tracks-container {
          display: grid;
          gap: 16px;
        }

        .track {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 16px;
        }

        .track-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #333;
        }

        .track-name {
          font-weight: 600;
          font-size: 14px;
        }

        .track-volume {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #aaa;
        }

        .track-volume input {
          width: 100px;
          height: 4px;
          cursor: pointer;
        }

        .clips-list {
          display: grid;
          gap: 8px;
        }

        .clip-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #252525;
          border-radius: 4px;
          border-left: 3px solid #00d9ff;
          transition: background 0.2s;
          cursor: pointer;
        }

        .clip-item:hover {
          background: #2a2a2a;
        }

        .clip-item.playing {
          background: #1a3a3a;
          border-left-color: #00ff00;
        }

        .clip-item.selected {
          border-left-color: #ffff00;
          background: #2a2a2a;
        }

        .clip-name {
          font-weight: 500;
          font-size: 14px;
          flex: 0 0 auto;
          min-width: 150px;
        }

        .clip-controls {
          display: flex;
          gap: 8px;
          margin-left: auto;
          align-items: center;
        }

        .clip-controls button {
          padding: 4px 8px;
          font-size: 12px;
          background: #333;
          color: #fff;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .clip-controls button:hover {
          background: #444;
        }

        .clip-controls .play-btn {
          background: #00d9ff;
          color: #000;
          font-weight: 600;
        }

        .clip-controls .play-btn:hover {
          background: #00b8d4;
        }

        .clip-volume {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #aaa;
        }

        .clip-volume input {
          width: 80px;
          height: 4px;
          cursor: pointer;
        }

        .empty-state {
          padding: 32px;
          text-align: center;
          color: #666;
        }
      `}</style>

      <div className="header">
        <h2>Clip Playback Manager</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#aaa' }}>
          Multi-track audio playback with volume control and synchronization
        </p>
      </div>

      {/* Master Controls */}
      <div className="master-controls">
        <button onClick={handlePlayAll} disabled={uiState.isPlaying && !uiState.isPaused}>
          Play All
        </button>

        {!uiState.isPaused && uiState.isPlaying && (
          <button onClick={handlePauseAll}>Pause</button>
        )}

        {uiState.isPaused && (
          <button onClick={handleResume}>Resume</button>
        )}

        <button onClick={handleStopAll} disabled={!uiState.isPlaying && !uiState.isPaused}>
          Stop All
        </button>

        <div className="volume-control">
          <label htmlFor="master-volume">Master:</label>
          <input
            id="master-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue="1"
            onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
          />
        </div>

        <div className="status">
          Playing: {playback.playingClips.length} | Total: {clips.length}
        </div>
      </div>

      {/* Tracks and Clips */}
      {clips.length === 0 ? (
        <div className="empty-state">
          <p>No clips loaded. Import audio files to get started.</p>
        </div>
      ) : (
        <div className="tracks-container">
          {Object.entries(clipsByTrack).map(([trackId, trackClips]) => (
            <div key={trackId} className="track">
              <div className="track-header">
                <div className="track-name">Track {trackId.split('-').pop()}</div>
                <div className="track-volume">
                  <label htmlFor={`track-volume-${trackId}`}>Volume:</label>
                  <input
                    id={`track-volume-${trackId}`}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="1"
                    onChange={(e) =>
                      handleTrackVolumeChange(trackId, parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="clips-list">
                {trackClips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`clip-item ${
                      playback.isClipPlaying(clip.id) ? 'playing' : ''
                    } ${uiState.selectedClipId === clip.id ? 'selected' : ''}`}
                    onClick={() =>
                      setUiState((prev) => ({
                        ...prev,
                        selectedClipId: prev.selectedClipId === clip.id ? null : clip.id,
                      }))
                    }
                  >
                    <div className="clip-name">{clip.name}</div>

                    <div className="clip-volume">
                      <label htmlFor={`clip-volume-${clip.id}`}>Vol:</label>
                      <input
                        id={`clip-volume-${clip.id}`}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={uiState.clipVolumes[clip.id] || 1}
                        onChange={(e) =>
                          handleClipVolumeChange(clip.id, parseFloat(e.target.value))
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="clip-controls">
                      <button
                        className="play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayClip(clip.id);
                        }}
                      >
                        {playback.isClipPlaying(clip.id) ? 'Stop' : 'Play'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMute(clip.id);
                        }}
                      >
                        {(uiState.clipVolumes[clip.id] || 1) > 0 ? 'Mute' : 'Unmute'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClip(clip.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
