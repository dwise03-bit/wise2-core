/**
 * useAudioExport.ts
 *
 * React hook for professional audio export with state management,
 * progress tracking, and error handling.
 *
 * @module hooks/audio/useAudioExport
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExportEngine, AudioTrack, ExportProgress, ExportResult } from '@/lib/audioExport/ExportEngine';
import { ExportFormat, AudioCodec } from '@/lib/audioExport/Codecs';
import { LoudnessNormalizationOptions, LoudnessMeasurement } from '@/lib/audioExport/Loudness';

export interface UseAudioExportOptions {
  audioContext: AudioContext;
  tracks: AudioTrack[];
  duration: number;
  projectTitle?: string;
}

export interface UseAudioExportState {
  isExporting: boolean;
  progress: number;
  status: ExportProgress['status'] | null;
  error: string | null;
  results: ExportResult[];
  measurement: LoudnessMeasurement | null;
  currentTrack: number;
  totalTracks: number;
}

/**
 * Hook for audio export with full state management
 */
export function useAudioExport({
  audioContext,
  tracks,
  duration,
  projectTitle = 'export',
}: UseAudioExportOptions) {
  const engineRef = useRef<ExportEngine | null>(null);
  const [state, setState] = useState<UseAudioExportState>({
    isExporting: false,
    progress: 0,
    status: null,
    error: null,
    results: [],
    measurement: null,
    currentTrack: 0,
    totalTracks: 0,
  });

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new ExportEngine(audioContext);
    }
  }, [audioContext]);

  /**
   * Export to single format
   */
  const exportSingle = useCallback(
    async (
      format: ExportFormat,
      filename?: string,
      normalizationOptions?: LoudnessNormalizationOptions
    ): Promise<ExportResult | null> => {
      if (!engineRef.current || state.isExporting) {
        return null;
      }

      const taskId = `export_${Date.now()}`;
      setState((prev) => ({
        ...prev,
        isExporting: true,
        progress: 0,
        error: null,
        results: [],
        measurement: null,
      }));

      try {
        // Setup progress callback
        engineRef.current.onProgress(taskId, (progress) => {
          setState((prev) => ({
            ...prev,
            progress: progress.progress,
            status: progress.status,
            currentTrack: progress.currentTrack || 0,
            totalTracks: progress.totalTracks,
            measurement: progress.measurement || null,
          }));
        });

        // Perform export
        const result = await engineRef.current.export(
          tracks,
          duration,
          format,
          normalizationOptions,
          filename || `${projectTitle}${format.codec}`
        );

        if (result.success) {
          setState((prev) => ({
            ...prev,
            results: [result],
            measurement: result.measurement || null,
            isExporting: false,
            progress: 100,
            status: 'complete',
          }));
          return result;
        } else {
          setState((prev) => ({
            ...prev,
            error: result.error || 'Export failed',
            isExporting: false,
          }));
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isExporting: false,
        }));
        return null;
      }
    },
    [tracks, duration, projectTitle, state.isExporting]
  );

  /**
   * Export to multiple formats
   */
  const exportBatch = useCallback(
    async (
      formats: ExportFormat[],
      baseFilename?: string,
      normalizationOptions?: LoudnessNormalizationOptions
    ): Promise<ExportResult[]> => {
      if (!engineRef.current || state.isExporting) {
        return [];
      }

      const taskId = `batch_${Date.now()}`;
      setState((prev) => ({
        ...prev,
        isExporting: true,
        progress: 0,
        error: null,
        results: [],
        measurement: null,
      }));

      try {
        // Setup progress callback
        engineRef.current.onProgress(taskId, (progress) => {
          setState((prev) => ({
            ...prev,
            progress: progress.progress,
            status: progress.status,
            measurement: progress.measurement || null,
          }));
        });

        // Perform batch export
        const results = await engineRef.current.batchExport(
          tracks,
          duration,
          formats,
          baseFilename || projectTitle,
          normalizationOptions
        );

        setState((prev) => ({
          ...prev,
          results,
          measurement: results[0]?.measurement || null,
          isExporting: false,
          progress: 100,
          status: 'complete',
        }));

        return results;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isExporting: false,
        }));
        return [];
      }
    },
    [tracks, duration, projectTitle, state.isExporting]
  );

  /**
   * Download result
   */
  const downloadResult = useCallback((result: ExportResult) => {
    if (!engineRef.current || !result.blob) {
      return;
    }
    engineRef.current.downloadBlob(result.blob, result.filename);
  }, []);

  /**
   * Download all results
   */
  const downloadAll = useCallback(() => {
    if (!engineRef.current) {
      return;
    }
    for (const result of state.results) {
      if (result.blob) {
        engineRef.current.downloadBlob(result.blob, result.filename);
      }
    }
  }, [state.results]);

  /**
   * Cancel export
   */
  const cancel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isExporting: false,
      error: 'Export cancelled',
    }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isExporting: false,
      progress: 0,
      status: null,
      error: null,
      results: [],
      measurement: null,
      currentTrack: 0,
      totalTracks: 0,
    });
  }, []);

  return {
    // State
    ...state,

    // Methods
    exportSingle,
    exportBatch,
    downloadResult,
    downloadAll,
    cancel,
    clearError,
    reset,
  };
}

/**
 * Hook for audio preview before export
 */
export function useAudioPreview(audioContext: AudioContext) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(async (blob: Blob) => {
    if (!audioRef.current) {
      return;
    }

    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    await audioRef.current.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const handleEnded = () => setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
      return () => audioRef.current?.removeEventListener('ended', handleEnded);
    }
  }, []);

  return {
    audioRef,
    isPlaying,
    play,
    pause,
    stop,
  };
}

/**
 * Convenience hook combining export and preview
 */
export function useAudioExportWithPreview(options: UseAudioExportOptions) {
  const exportState = useAudioExport(options);
  const preview = useAudioPreview(options.audioContext);

  const previewExport = useCallback(
    async (format: ExportFormat) => {
      const result = await exportState.exportSingle(format);
      if (result?.blob) {
        await preview.play(result.blob);
      }
    },
    [exportState, preview]
  );

  return {
    ...exportState,
    preview,
    previewExport,
  };
}

/**
 * Hook for batch export with auto-download
 */
export function useBatchAudioExport(options: UseAudioExportOptions) {
  const exportState = useAudioExport(options);

  const exportAndDownload = useCallback(
    async (
      formats: ExportFormat[],
      baseFilename?: string,
      normalizationOptions?: LoudnessNormalizationOptions
    ) => {
      const results = await exportState.exportBatch(
        formats,
        baseFilename,
        normalizationOptions
      );

      // Auto-download all results
      setTimeout(() => {
        for (const result of results) {
          if (result.blob) {
            exportState.downloadResult(result);
          }
        }
      }, 500);

      return results;
    },
    [exportState]
  );

  return {
    ...exportState,
    exportAndDownload,
  };
}

export default useAudioExport;
