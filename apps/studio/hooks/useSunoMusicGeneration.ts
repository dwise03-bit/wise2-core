/**
 * useSunoMusicGeneration Hook
 * State management and API integration for Suno music generation
 */

import { useState, useCallback, useEffect } from 'react';
import {
  SunoGeneration,
  SunoGenerationParams,
  SunoQueueItem,
  GenerationStatus,
} from '../types/suno';

interface UseSunoMusicGenerationOptions {
  onGenerationStart?: (generation: SunoGeneration) => void;
  onGenerationComplete?: (generation: SunoGeneration) => void;
  onGenerationError?: (error: Error) => void;
  autoPolling?: boolean;
  pollingInterval?: number;
}

export function useSunoMusicGeneration(options: UseSunoMusicGenerationOptions = {}) {
  const {
    onGenerationStart,
    onGenerationComplete,
    onGenerationError,
    autoPolling = true,
    pollingInterval = 2000,
  } = options;

  const [generations, setGenerations] = useState<SunoGeneration[]>([]);
  const [queue, setQueue] = useState<SunoQueueItem[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<SunoGeneration | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Generate music based on prompt parameters
   */
  const generate = useCallback(
    async (params: SunoGenerationParams) => {
      setIsLoading(true);
      setError(null);

      try {
        // Create new generation object
        const generation: SunoGeneration = {
          id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          params,
          status: 'Queued',
          createdAt: new Date(),
          duration: params.duration,
          bitrate: '320kbps',
          fileSize: '0 MB',
          tags: [params.genre, params.mood],
          isFavorite: false,
          playCount: 0,
          exportedFormats: [],
        };

        // Add to queue
        const queueItem: SunoQueueItem = {
          generationId: generation.id,
          position: queue.length,
          status: 'Queued',
          progress: 0,
          estimatedTime: params.duration + 10, // Rough estimate
        };

        setGenerations((prev) => [generation, ...prev]);
        setQueue((prev) => [...prev, queueItem]);

        // Call API to start generation
        const response = await fetch('/api/suno/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error('Failed to start generation');
        }

        const result = await response.json();
        const updatedGeneration: SunoGeneration = {
          ...generation,
          id: result.id,
          status: 'Generating',
        };

        setGenerations((prev) =>
          prev.map((g) => (g.id === generation.id ? updatedGeneration : g))
        );
        setCurrentGeneration(updatedGeneration);
        onGenerationStart?.(updatedGeneration);

        // Poll for completion
        if (autoPolling) {
          pollGenerationStatus(result.id);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onGenerationError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [queue.length, autoPolling, onGenerationStart, onGenerationError]
  );

  /**
   * Poll for generation status
   */
  const pollGenerationStatus = useCallback(
    async (generationId: string) => {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/suno/status/${generationId}`);
          if (!response.ok) throw new Error('Failed to fetch status');

          const result = await response.json();
          const status: GenerationStatus = result.status;
          const progress = result.progress || 0;

          // Update generation in state
          setGenerations((prev) =>
            prev.map((g) =>
              g.id === generationId
                ? {
                    ...g,
                    status,
                    progress,
                    audioUrl: result.audioUrl,
                    waveformData: result.waveformData,
                    completedAt: status === 'Completed' ? new Date() : undefined,
                    error: status === 'Failed' ? result.error : undefined,
                  }
                : g
            )
          );

          // Update queue
          setQueue((prev) =>
            prev.map((item) =>
              item.generationId === generationId
                ? { ...item, status, progress }
                : item
            )
          );

          // Handle completion
          if (status === 'Completed' || status === 'Failed') {
            clearInterval(pollInterval);
            const completed = generations.find((g) => g.id === generationId);
            if (completed) {
              setCurrentGeneration(undefined);
              if (status === 'Completed') {
                onGenerationComplete?.(completed);
              }
            }
          }
        } catch (err) {
          console.error('Poll error:', err);
          clearInterval(pollInterval);
        }
      }, pollingInterval);
    },
    [generations, pollingInterval, onGenerationComplete]
  );

  /**
   * Export generation in specified format
   */
  const exportGeneration = useCallback(
    async (generationId: string, format: 'mp3' | 'wav' | 'flac') => {
      try {
        const response = await fetch(`/api/suno/export/${generationId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format }),
        });

        if (!response.ok) throw new Error('Export failed');

        // Update exported formats in state
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

        // Trigger download
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generation_${generationId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Export failed');
        setError(error);
        onGenerationError?.(error);
      }
    },
    [onGenerationError]
  );

  /**
   * Retry failed generation with same parameters
   */
  const retryGeneration = useCallback(
    async (generationId: string) => {
      const generation = generations.find((g) => g.id === generationId);
      if (generation && generation.status === 'Failed') {
        await generate(generation.params);
      }
    },
    [generations, generate]
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback((generationId: string) => {
    setGenerations((prev) =>
      prev.map((g) =>
        g.id === generationId ? { ...g, isFavorite: !g.isFavorite } : g
      )
    );
  }, []);

  /**
   * Delete generation
   */
  const deleteGeneration = useCallback((generationId: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== generationId));
    setQueue((prev) => prev.filter((item) => item.generationId !== generationId));
  }, []);

  /**
   * Add generation to sound lab as clip
   */
  const addToSoundLab = useCallback(async (generation: SunoGeneration) => {
    try {
      const response = await fetch('/api/soundlab/add-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId: generation.id,
          audioUrl: generation.audioUrl,
          metadata: generation.params,
        }),
      });

      if (!response.ok) throw new Error('Failed to add to SoundLab');
      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add to SoundLab');
      setError(error);
      onGenerationError?.(error);
      throw error;
    }
  }, [onGenerationError]);

  /**
   * Load saved generations from storage
   */
  useEffect(() => {
    const loadGenerations = async () => {
      try {
        const response = await fetch('/api/suno/generations');
        if (response.ok) {
          const data = await response.json();
          setGenerations(data);
        }
      } catch (err) {
        console.error('Failed to load generations:', err);
      }
    };

    loadGenerations();
  }, []);

  return {
    // State
    generations,
    queue,
    currentGeneration,
    isLoading,
    error,

    // Actions
    generate,
    exportGeneration,
    retryGeneration,
    toggleFavorite,
    deleteGeneration,
    addToSoundLab,
  };
}
