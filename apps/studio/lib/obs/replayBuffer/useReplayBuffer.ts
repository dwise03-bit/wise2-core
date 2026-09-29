/**
 * useReplayBuffer Hook
 *
 * React hook for managing instant replay capture.
 * Handles buffer state, saving replays, and managing hotkeys.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { ReplayBuffer } from './ReplayBuffer';
import { ReplaySave, ReplayBufferStatus, ReplayBufferConfig } from './types';

export interface UseReplayBufferOptions {
  enabled?: boolean;
  config?: Partial<ReplayBufferConfig>;
  onReplaySaved?: (replay: ReplaySave) => void;
  onError?: (error: Error) => void;
}

export function useReplayBuffer(options: UseReplayBufferOptions = {}) {
  const {
    enabled = true,
    config = {},
    onReplaySaved,
    onError,
  } = options;

  const bufferRef = useRef<ReplayBuffer | null>(null);
  const [status, setStatus] = useState<ReplayBufferStatus>({
    isRecording: false,
    currentDuration: 0,
    bufferSize: 0,
    frameCount: 0,
    audioChunkCount: 0,
    lastFrameTime: 0,
    isProcessing: false,
  });

  const [savedReplays, setSavedReplays] = useState<ReplaySave[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize buffer
  useEffect(() => {
    if (!enabled) return;

    bufferRef.current = new ReplayBuffer(config);

    // Subscribe to events
    if (bufferRef.current) {
      bufferRef.current.on('buffer-started', () => {
        updateStatus();
      });

      bufferRef.current.on('frame-added', () => {
        updateStatus();
      });

      bufferRef.current.on('audio-added', () => {
        updateStatus();
      });

      bufferRef.current.on('save-started', () => {
        setIsSaving(true);
      });

      bufferRef.current.on('save-complete', (replay: ReplaySave) => {
        setSavedReplays(prev => [replay, ...prev]);
        setIsSaving(false);
        onReplaySaved?.(replay);
      });

      bufferRef.current.on('save-failed', (error: Error) => {
        setIsSaving(false);
        setError(error);
        onError?.(error);
      });
    }

    return () => {
      bufferRef.current?.destroy();
      bufferRef.current = null;
    };
  }, [enabled, config, onReplaySaved, onError]);

  // Update status periodically
  const updateStatus = useCallback(() => {
    if (bufferRef.current) {
      setStatus(bufferRef.current.getStatus());
    }
  }, []);

  useEffect(() => {
    if (!enabled || !bufferRef.current?.getStatus().isRecording) return;

    const interval = setInterval(updateStatus, 100);
    return () => clearInterval(interval);
  }, [enabled, updateStatus]);

  // Handle hotkey for saving replay (Shift+Ctrl+R)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift+Ctrl+R (or Shift+Cmd+R on Mac)
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (e.shiftKey && ctrlKey && e.key === 'R') {
        e.preventDefault();
        saveReplay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  /**
   * Start capturing to replay buffer
   */
  const startCapture = useCallback((stream?: MediaStream) => {
    if (!bufferRef.current) return;

    try {
      bufferRef.current.start();

      // If stream provided, extract video/audio tracks
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        // In production, hook into the actual encoding pipeline
        // to capture raw frames from the stream
      }

      updateStatus();
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start replay capture');
      setError(error);
      onError?.(error);
    }
  }, [updateStatus, onError]);

  /**
   * Stop capturing to replay buffer
   */
  const stopCapture = useCallback(() => {
    if (!bufferRef.current) return;

    try {
      bufferRef.current.stop();
      updateStatus();
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop replay capture');
      setError(error);
      onError?.(error);
    }
  }, [updateStatus, onError]);

  /**
   * Add video frame to buffer (call from encoding pipeline)
   */
  const addFrame = useCallback((frameData: Uint8Array<ArrayBuffer>, isKeyFrame?: boolean, duration?: number) => {
    if (!bufferRef.current) return;

    try {
      bufferRef.current.addFrame(frameData, isKeyFrame, duration);
      updateStatus();
    } catch (err) {
      console.error('Failed to add frame to replay buffer:', err);
    }
  }, [updateStatus]);

  /**
   * Add audio chunk to buffer (call from audio pipeline)
   */
  const addAudioChunk = useCallback((audioData: Float32Array<ArrayBuffer>, sampleRate?: number) => {
    if (!bufferRef.current) return;

    try {
      bufferRef.current.addAudioChunk(audioData, sampleRate);
      updateStatus();
    } catch (err) {
      console.error('Failed to add audio chunk to replay buffer:', err);
    }
  }, [updateStatus]);

  /**
   * Save current buffer as replay
   */
  const saveReplay = useCallback(async (duration?: number) => {
    if (!bufferRef.current || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);
      const replay = await bufferRef.current.saveReplay(duration || selectedDuration);
      setSavedReplays(prev => [replay, ...prev]);
      onReplaySaved?.(replay);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save replay');
      setError(error);
      onError?.(error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedDuration, isSaving, onReplaySaved, onError]);

  /**
   * Delete a saved replay
   */
  const deleteReplay = useCallback(async (replayId: string) => {
    if (!bufferRef.current) return;

    try {
      await bufferRef.current.deleteReplay(replayId);
      setSavedReplays(prev => prev.filter(r => r.id !== replayId));
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete replay');
      setError(error);
      onError?.(error);
    }
  }, [onError]);

  /**
   * Download a saved replay
   */
  const downloadReplay = useCallback(async (replayId: string) => {
    if (!bufferRef.current) return;

    try {
      await bufferRef.current.downloadReplay(replayId);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to download replay');
      setError(error);
      onError?.(error);
    }
  }, [onError]);

  /**
   * Play a saved replay (open in video player)
   */
  const playReplay = useCallback((replayId: string) => {
    const replay = savedReplays.find(r => r.id === replayId);
    if (!replay) return;

    // Open in a new tab or modal
    window.open(`/player?replay=${replayId}`, '_blank');
  }, [savedReplays]);

  /**
   * Format bytes to human-readable size
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Format seconds to MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    status,
    savedReplays,
    selectedDuration,
    isSaving,
    error,

    // Controls
    startCapture,
    stopCapture,
    addFrame,
    addAudioChunk,
    saveReplay,
    deleteReplay,
    downloadReplay,
    playReplay,
    setSelectedDuration,

    // Utilities
    formatBytes,
    formatDuration,
  };
}
