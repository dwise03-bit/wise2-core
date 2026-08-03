/**
 * useRecording - React Hook for Recording System
 *
 * Simplifies recording integration in React components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  RecordingEngine,
  getRecordingEngine,
  resetRecordingEngine,
} from './RecordingEngine';
import {
  RecordingStatus,
  RecordingMetadata,
  RecordingConfig,
  RecordingFile,
} from './types';

interface UseRecordingOptions {
  config?: Partial<RecordingConfig>;
  autoFetch?: boolean;
}

interface UseRecordingReturn {
  // State
  status: RecordingStatus;
  duration: number;
  fileSize: number;
  splitCount: number;
  isLoading: boolean;
  error: string | null;

  // Metadata
  currentRecording: RecordingMetadata | null;
  recordings: RecordingFile[];

  // Controls
  startRecording: (
    stream: MediaStream,
    title: string,
    config?: { platform?: string; streamTitle?: string }
  ) => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;

  // Management
  fetchRecordings: (platform?: string) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  downloadRecording: (id: string) => Promise<void>;

  // Engine
  engine: RecordingEngine | null;
}

export function useRecording(options: UseRecordingOptions = {}): UseRecordingReturn {
  const [status, setStatus] = useState<RecordingStatus>('IDLE');
  const [duration, setDuration] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [splitCount, setSplitCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentRecording, setCurrentRecording] = useState<RecordingMetadata | null>(
    null
  );
  const [recordings, setRecordings] = useState<RecordingFile[]>([]);

  const engineRef = useRef<RecordingEngine | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = getRecordingEngine(options.config);
    }

    const engine = engineRef.current;

    // Subscribe to events
    engine.on('start', ({ recordingId }) => {
      setStatus('RECORDING');
      setError(null);
      console.log('Recording started:', recordingId);
    });

    engine.on('pause', () => {
      setStatus('PAUSED');
      console.log('Recording paused');
    });

    engine.on('resume', () => {
      setStatus('RECORDING');
      console.log('Recording resumed');
    });

    engine.on('stop', ({ recordingId }) => {
      setStatus('STOPPED');
      console.log('Recording stopped:', recordingId);
    });

    engine.on('size-update', ({ size, parts }) => {
      setFileSize(size);
      setSplitCount(parts);
    });

    engine.on('split', ({ part }) => {
      setSplitCount(part);
      console.log(`Recording split to part ${part}`);
    });

    engine.on('error', ({ message }) => {
      setStatus('FAILED');
      setError(message);
      console.error('Recording error:', message);
    });

    engine.on('file-saved', ({ path }) => {
      console.log('File saved:', path);
    });

    engine.on('audio-track-saved', ({ trackIndex }) => {
      console.log(`Audio track ${trackIndex} saved`);
    });

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [options.config]);

  // Update duration every second
  useEffect(() => {
    if (status === 'RECORDING') {
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [status]);

  // Fetch recordings on mount
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchRecordings();
    }
  }, []);

  // Start recording
  const startRecording = useCallback(
    async (
      stream: MediaStream,
      title: string,
      config?: { platform?: string; streamTitle?: string }
    ) => {
      if (!engineRef.current) {
        setError('Recording engine not initialized');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDuration(0);
        setFileSize(0);
        setSplitCount(1);

        const metadata = await engineRef.current.startRecording(stream, title, config);
        setCurrentRecording(metadata);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start recording';
        setError(message);
        setStatus('FAILED');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!engineRef.current) {
      setError('Recording engine not initialized');
      return;
    }

    try {
      setIsLoading(true);
      const metadata = await engineRef.current.stopRecording();
      setCurrentRecording(metadata);
      setStatus('STOPPED');

      // Refresh recordings list
      await fetchRecordings();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(message);
      setStatus('FAILED');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (!engineRef.current) {
      setError('Recording engine not initialized');
      return;
    }

    try {
      engineRef.current.pauseRecording();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pause recording';
      setError(message);
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (!engineRef.current) {
      setError('Recording engine not initialized');
      return;
    }

    try {
      engineRef.current.resumeRecording();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resume recording';
      setError(message);
    }
  }, []);

  // Fetch recordings from server
  const fetchRecordings = useCallback(async (platform?: string) => {
    try {
      const url = new URL('/api/obs/recordings', window.location.origin);
      if (platform) {
        url.searchParams.append('platform', platform);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }

      const data = await response.json();
      const recordingFiles: RecordingFile[] = (data.recordings || []).map(
        (rec: any) => ({
          id: rec.id,
          name: rec.title,
          path: rec.filePath,
          size: rec.fileSize,
          duration: rec.duration,
          format: rec.format,
          platform: rec.platform,
          createdAt: new Date(rec.createdAt),
          bitrate: rec.bitrate,
          isSplit: rec.isSplit,
          splitParts: rec.splitParts,
          audioTracks: rec.audioTracks,
        })
      );
      setRecordings(recordingFiles);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recordings';
      console.error('Fetch error:', message);
    }
  }, []);

  // Delete recording
  const deleteRecording = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/obs/recordings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recording');
      }

      // Refresh list
      await fetchRecordings();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete recording';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecordings]);

  // Download recording
  const downloadRecording = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/obs/recordings/${id}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to download recording');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download recording';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  return {
    status,
    duration,
    fileSize,
    splitCount,
    isLoading,
    error,
    currentRecording,
    recordings,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    fetchRecordings,
    deleteRecording,
    downloadRecording,
    engine: engineRef.current,
  };
}

export default useRecording;
