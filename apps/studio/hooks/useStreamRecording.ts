/**
 * useStreamRecording Hook
 * Manages stream recording lifecycle, state, and UI updates
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { StreamRecorder, RecordingMetadata, RecordingConfig } from '@/lib/obs/recording';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingId: string | null;
  duration: number; // seconds
  fileSize: number; // bytes
  currentMetadata: RecordingMetadata | null;
  error: string | null;
  status: 'idle' | 'recording' | 'paused' | 'stopping' | 'error';
}

interface UseStreamRecordingOptions {
  onStart?: (metadata: RecordingMetadata) => void;
  onStop?: (metadata: RecordingMetadata) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: RecordingState) => void;
}

export function useStreamRecording(options: UseStreamRecordingOptions = {}) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    recordingId: null,
    duration: 0,
    fileSize: 0,
    currentMetadata: null,
    error: null,
    status: 'idle',
  });

  const recorderRef = useRef<StreamRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileSizeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize recorder
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (fileSizeIntervalRef.current) clearInterval(fileSizeIntervalRef.current);
      if (recorderRef.current) {
        recorderRef.current.destroy();
      }
    };
  }, []);

  // Update state with callback
  const updateState = useCallback((updates: Partial<RecordingState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      options.onStatusChange?.(newState);
      return newState;
    });
  }, [options]);

  // Start recording
  const startRecording = useCallback(
    async (
      stream: MediaStream,
      title: string,
      platform?: string,
      streamTitle?: string,
      config?: Partial<RecordingConfig>
    ) => {
      try {
        updateState({ error: null, status: 'recording' });

        // Create recorder instance
        recorderRef.current = new StreamRecorder(config);

        // Start recording
        const metadata = await recorderRef.current.startRecording(stream, title, platform, streamTitle);

        updateState({
          isRecording: true,
          isPaused: false,
          recordingId: metadata.id,
          currentMetadata: metadata,
          status: 'recording',
        });

        options.onStart?.(metadata);

        // Track duration every second
        durationIntervalRef.current = setInterval(() => {
          const duration = recorderRef.current?.getCurrentDuration() || 0;
          updateState({ duration });
        }, 1000);

        // Track file size every second
        fileSizeIntervalRef.current = setInterval(() => {
          const fileSize = recorderRef.current?.getCurrentFileSize() || 0;
          updateState({ fileSize });
        }, 1000);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to start recording';
        updateState({ error: errorMsg, status: 'error' });
        options.onError?.(errorMsg);
      }
    },
    [updateState, options]
  );

  // Pause recording
  const pauseRecording = useCallback(() => {
    try {
      if (!recorderRef.current) {
        throw new Error('No active recording');
      }

      recorderRef.current.pauseRecording();

      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (fileSizeIntervalRef.current) clearInterval(fileSizeIntervalRef.current);

      updateState({ isPaused: true, status: 'paused' });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to pause recording';
      updateState({ error: errorMsg, status: 'error' });
      options.onError?.(errorMsg);
    }
  }, [updateState, options]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    try {
      if (!recorderRef.current) {
        throw new Error('No active recording');
      }

      recorderRef.current.resumeRecording();

      updateState({ isPaused: false, status: 'recording' });

      // Resume tracking
      durationIntervalRef.current = setInterval(() => {
        const duration = recorderRef.current?.getCurrentDuration() || 0;
        updateState({ duration });
      }, 1000);

      fileSizeIntervalRef.current = setInterval(() => {
        const fileSize = recorderRef.current?.getCurrentFileSize() || 0;
        updateState({ fileSize });
      }, 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to resume recording';
      updateState({ error: errorMsg, status: 'error' });
      options.onError?.(errorMsg);
    }
  }, [updateState, options]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (!recorderRef.current) {
        throw new Error('No active recording');
      }

      updateState({ status: 'stopping' });

      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (fileSizeIntervalRef.current) clearInterval(fileSizeIntervalRef.current);

      const metadata = await recorderRef.current.stopRecording();

      updateState({
        isRecording: false,
        isPaused: false,
        recordingId: null,
        status: 'idle',
        currentMetadata: metadata,
      });

      options.onStop?.(metadata);

      // Cleanup recorder
      recorderRef.current = null;

      return metadata;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to stop recording';
      updateState({ error: errorMsg, status: 'error' });
      options.onError?.(errorMsg);
      return null;
    }
  }, [updateState, options]);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    ...state,
    formattedDuration: formatDuration(state.duration),
    formattedFileSize: formatFileSize(state.fileSize),

    // Methods
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearError,

    // Utilities
    formatFileSize,
    formatDuration,
  };
}
