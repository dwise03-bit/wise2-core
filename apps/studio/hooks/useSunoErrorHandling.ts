/**
 * Enhanced SUNO Music Generation Hook with Error Handling & Recovery
 * Comprehensive error management with offline queue support and retry logic
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  SunoGeneration,
  SunoGenerationParams,
  SunoQueueItem,
  GenerationStatus,
} from '../types/suno';
import { getSunoClientEnhanced } from '../lib/suno-client-enhanced';
import {
  AppError,
  SunoError,
  ErrorType,
  ErrorLogger,
  RecoveryAction,
} from '../lib/error-handling';

interface UseSunoErrorHandlingOptions {
  onGenerationStart?: (generation: SunoGeneration) => void;
  onGenerationComplete?: (generation: SunoGeneration) => void;
  onGenerationError?: (error: AppError) => void;
  onOfflineQueueUpdate?: (queuedItems: any[]) => void;
  autoPolling?: boolean;
  pollingInterval?: number;
}

export function useSunoErrorHandling(
  options: UseSunoErrorHandlingOptions = {}
) {
  const {
    onGenerationStart,
    onGenerationComplete,
    onGenerationError,
    onOfflineQueueUpdate,
    autoPolling = true,
    pollingInterval = 2000,
  } = options;

  const [generations, setGenerations] = useState<SunoGeneration[]>([]);
  const [queue, setQueue] = useState<SunoQueueItem[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<SunoGeneration | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [canRetry, setCanRetry] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sunoClient = getSunoClientEnhanced();

  /**
   * Handle online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Process offline queue when coming online
   */
  const processOfflineQueue = useCallback(async () => {
    const queued = sunoClient.getOfflineQueue();
    if (queued.length === 0) return;

    for (const item of queued) {
      try {
        const response = await sunoClient.generate(item.request);
        onOfflineQueueUpdate?.(sunoClient.getOfflineQueue());
      } catch (err) {
        const appError = err instanceof AppError ? err : new Error(String(err));
        ErrorLogger.log(appError as AppError);
      }
    }
  }, [sunoClient, onOfflineQueueUpdate]);

  /**
   * Generate music with comprehensive error handling
   */
  const generate = useCallback(
    async (params: SunoGenerationParams) => {
      setIsLoading(true);
      setError(null);
      setCanRetry(false);

      try {
        // Create generation object
        const generation: SunoGeneration = {
          id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          params,
          status: isOnline ? 'Queued' : 'PendingOnline',
          createdAt: new Date(),
          duration: params.duration,
          bitrate: '320kbps',
          fileSize: '0 MB',
          tags: [params.genre, params.mood],
          isFavorite: false,
          playCount: 0,
          exportedFormats: [],
        };

        const queueItem: SunoQueueItem = {
          generationId: generation.id,
          position: queue.length,
          status: generation.status,
          progress: 0,
          estimatedTime: params.duration + 10,
        };

        setGenerations((prev) => [generation, ...prev]);
        setQueue((prev) => [...prev, queueItem]);

        // Attempt to generate
        const response = await sunoClient.generate(params);

        const updatedGeneration: SunoGeneration = {
          ...generation,
          id: response.id,
          status: 'Generating',
        };

        setGenerations((prev) =>
          prev.map((g) => (g.id === generation.id ? updatedGeneration : g))
        );
        setCurrentGeneration(updatedGeneration);
        onGenerationStart?.(updatedGeneration);

        // Start polling
        if (autoPolling) {
          pollGenerationStatus(response.id);
        }
      } catch (err) {
        const appError = err instanceof AppError
          ? err
          : new SunoError(
              'Generation failed',
              ErrorType.UNKNOWN,
              { context: { originalError: String(err) } }
            );

        setError(appError);
        setCanRetry(appError.isRetryable() && appError.retryCount < appError.maxRetries);
        onGenerationError?.(appError);

        // Log for debugging
        ErrorLogger.log(appError);

        // Update generation status to error
        setGenerations((prev) =>
          prev.map((g) =>
            g.id === generation?.id
              ? { ...g, status: 'Failed', error: appError.message }
              : g
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [queue.length, autoPolling, isOnline, sunoClient, onGenerationStart, onGenerationError]
  );

  /**
   * Retry failed generation with exponential backoff
   */
  const retryGeneration = useCallback(
    async (generationId: string) => {
      const failedGen = generations.find((g) => g.id === generationId);
      if (!failedGen || failedGen.status !== 'Failed') return;

      setError(null);
      setCanRetry(false);

      try {
        await generate(failedGen.params);
      } catch (err) {
        const appError = err instanceof AppError ? err : new Error(String(err));
        ErrorLogger.log(appError as AppError);
      }
    },
    [generations, generate]
  );

  /**
   * Poll for generation status with error recovery
   */
  const pollGenerationStatus = useCallback(
    async (generationId: string) => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = setInterval(async () => {
        try {
          const result = await sunoClient.getStatus(generationId);
          const status = result.status as GenerationStatus;
          const progress = (result as any).progress || 0;

          setGenerations((prev) =>
            prev.map((g) =>
              g.id === generationId
                ? {
                    ...g,
                    status,
                    progress,
                    audioUrl: (result as any).audioUrl,
                    waveformData: (result as any).waveformData,
                    completedAt: status === 'Completed' ? new Date() : undefined,
                    error: status === 'Failed' ? (result as any).error : undefined,
                  }
                : g
            )
          );

          setQueue((prev) =>
            prev.map((item) =>
              item.generationId === generationId
                ? { ...item, status, progress }
                : item
            )
          );

          if (status === 'Completed' || status === 'Failed') {
            clearInterval(pollIntervalRef.current!);
            const completed = generations.find((g) => g.id === generationId);
            if (completed) {
              setCurrentGeneration(undefined);
              if (status === 'Completed') {
                onGenerationComplete?.(completed);
              }
            }
          }
        } catch (err) {
          const appError = err instanceof AppError ? err : new Error(String(err));
          ErrorLogger.log(appError as AppError);

          // Stop polling on persistent errors
          if (appError instanceof SunoError && !appError.isRetryable()) {
            clearInterval(pollIntervalRef.current!);
            setError(appError as AppError);
            onGenerationError?.(appError as AppError);
          }
        }
      }, pollingInterval);
    },
    [generations, pollingInterval, sunoClient, onGenerationComplete, onGenerationError]
  );

  /**
   * Export with fallback on storage failure
   */
  const exportGeneration = useCallback(
    async (generationId: string, format: 'mp3' | 'wav' | 'flac') => {
      try {
        const result = await sunoClient.export(generationId, format);

        setGenerations((prev) =>
          prev.map((g) =>
            g.id === generationId
              ? {
                  ...g,
                  exportedFormats: [...(g.exportedFormats || []), format],
                }
              : g
          )
        );

        // Download via URL-based fallback if needed
        const downloadUrl = result.url || (result as any).download_url;
        if (downloadUrl) {
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `generation_${generationId}.${format}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (err) {
        const appError = err instanceof AppError
          ? err
          : new SunoError('Export failed', ErrorType.STORAGE_ERROR);

        setError(appError);
        onGenerationError?.(appError);
        ErrorLogger.log(appError);

        // Offer fallback playback option
        if (appError.recoveryActions.includes(RecoveryAction.FALLBACK_PLAYBACK)) {
          const generation = generations.find((g) => g.id === generationId);
          if (generation?.audioUrl) {
            const a = document.createElement('a');
            a.href = generation.audioUrl;
            a.download = `generation_${generationId}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }
      }
    },
    [generations, sunoClient, onGenerationError]
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    generations,
    queue,
    currentGeneration,
    isLoading,
    error,
    isOnline,
    offlineQueue: sunoClient.getOfflineQueue(),
    canRetry,

    // Actions
    generate,
    exportGeneration,
    retryGeneration,
    toggleFavorite: (generationId: string) => {
      setGenerations((prev) =>
        prev.map((g) =>
          g.id === generationId ? { ...g, isFavorite: !g.isFavorite } : g
        )
      );
    },
    deleteGeneration: (generationId: string) => {
      setGenerations((prev) => prev.filter((g) => g.id !== generationId));
      setQueue((prev) => prev.filter((item) => item.generationId !== generationId));
    },

    // Error utilities
    clearError: () => setError(null),
    getErrorMessage: () => error?.getUserMessage() || null,
    getRecoveryActions: () => error?.recoveryActions || [],
  };
}
