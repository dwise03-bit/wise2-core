'use client';

/**
 * Suno Clip Playback Hook
 * Extends useClipPlayback with support for Suno-generated audio streams
 * Handles fetching, buffering, and effects application to generated tracks
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import type { ClipData } from './useClips';
import type { UseClipPlaybackReturn } from './useClipPlayback';

interface GeneratedAudioBuffer {
  clipId: string;
  audioBuffer: AudioBuffer;
  url: string;
  isLoading: boolean;
  error?: string;
}

/**
 * Hook for extended playback of Suno-generated clips
 * Integrates with Web Audio API and FX chain
 */
export function useSunoClipPlayback(playbackHook: UseClipPlaybackReturn) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const generatedBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const fetchQueueRef = useRef<Map<string, Promise<AudioBuffer>>>(new Map());

  const [loadingClips, setLoadingClips] = useState<Set<string>>(new Set());
  const [errorClips, setErrorClips] = useState<Map<string, string>>(new Map());

  /**
   * Initialize audio context on first use
   */
  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('[useSunoClipPlayback] Failed to initialize audio context:', error);
      }
    }
  }, []);

  /**
   * Fetch and decode audio from Suno URL
   * Cached to avoid repeated fetches
   */
  const fetchGeneratedAudio = useCallback(
    async (audioUrl: string, clipId: string): Promise<AudioBuffer> => {
      const ctx = audioContextRef.current;
      if (!ctx) {
        throw new Error('Audio context not initialized');
      }

      // Check cache first
      if (generatedBufferCacheRef.current.has(clipId)) {
        return generatedBufferCacheRef.current.get(clipId)!;
      }

      // Check if already fetching
      if (fetchQueueRef.current.has(clipId)) {
        return await fetchQueueRef.current.get(clipId)!;
      }

      // Create fetch promise
      const fetchPromise = (async () => {
        try {
          setLoadingClips(prev => new Set([...prev, clipId]));

          // Fetch audio from URL
          const response = await fetch(audioUrl, {
            headers: {
              'Accept': 'audio/*',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

          // Cache the buffer
          generatedBufferCacheRef.current.set(clipId, audioBuffer);

          // Clear error if fetch succeeded
          setErrorClips(prev => {
            const newMap = new Map(prev);
            newMap.delete(clipId);
            return newMap;
          });

          return audioBuffer;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[useSunoClipPlayback] Failed to fetch audio for ${clipId}:`, error);

          setErrorClips(prev => new Map([...prev, [clipId, errorMsg]]));
          throw error;
        } finally {
          setLoadingClips(prev => {
            const newSet = new Set(prev);
            newSet.delete(clipId);
            return newSet;
          });

          fetchQueueRef.current.delete(clipId);
        }
      })();

      // Track the fetch promise
      fetchQueueRef.current.set(clipId, fetchPromise);

      return await fetchPromise;
    },
    []
  );

  /**
   * Play a generated clip with full integration
   * Fetches audio, applies effects, and starts playback
   */
  const playGeneratedClip = useCallback(
    async (clip: ClipData, fromTime?: number): Promise<void> => {
      if (clip.source !== 'generated' || !clip.sunoMetadata?.audioUrl) {
        throw new Error('Invalid generated clip: missing audio URL');
      }

      try {
        // Fetch the audio buffer
        const audioBuffer = await fetchGeneratedAudio(
          clip.sunoMetadata.audioUrl,
          clip.id
        );

        // Create a temporary clip with the fetched buffer for playback
        const playableClip: ClipData = {
          ...clip,
          audioBuffer, // Replace with fetched buffer
        };

        // Use the main playback hook to play
        await playbackHook.playClip(playableClip.id, fromTime);
      } catch (error) {
        console.error('[useSunoClipPlayback] Failed to play generated clip:', error);
        throw error;
      }
    },
    [fetchGeneratedAudio, playbackHook]
  );

  /**
   * Preload generated clip audio in background
   * Useful for preparing audio before playback
   */
  const preloadGeneratedClip = useCallback(
    async (clip: ClipData): Promise<void> => {
      if (clip.source !== 'generated' || !clip.sunoMetadata?.audioUrl) {
        return; // Silently skip non-generated clips
      }

      try {
        await fetchGeneratedAudio(clip.sunoMetadata.audioUrl, clip.id);
      } catch (error) {
        console.error('[useSunoClipPlayback] Failed to preload clip:', error);
        // Don't throw - preloading failures shouldn't block other operations
      }
    },
    [fetchGeneratedAudio]
  );

  /**
   * Batch preload multiple generated clips
   */
  const preloadGeneratedClips = useCallback(
    async (clips: ClipData[]): Promise<void> => {
      const generatedClips = clips.filter(c => c.source === 'generated');

      await Promise.allSettled(
        generatedClips.map(clip => preloadGeneratedClip(clip))
      );
    },
    [preloadGeneratedClip]
  );

  /**
   * Clear cache for a specific clip or all clips
   */
  const clearCache = useCallback(
    (clipId?: string) => {
      if (clipId) {
        generatedBufferCacheRef.current.delete(clipId);
      } else {
        generatedBufferCacheRef.current.clear();
      }
    },
    []
  );

  /**
   * Get loading status for a clip
   */
  const isClipLoading = useCallback(
    (clipId: string): boolean => {
      return loadingClips.has(clipId);
    },
    [loadingClips]
  );

  /**
   * Get error message for a clip
   */
  const getClipError = useCallback(
    (clipId: string): string | undefined => {
      return errorClips.get(clipId);
    },
    [errorClips]
  );

  /**
   * Get cache status
   */
  const getCacheInfo = useCallback(
    () => ({
      cachedClipCount: generatedBufferCacheRef.current.size,
      cachedClipIds: Array.from(generatedBufferCacheRef.current.keys()),
    }),
    []
  );

  return {
    // Playback
    playGeneratedClip,

    // Preloading
    preloadGeneratedClip,
    preloadGeneratedClips,

    // Status
    isClipLoading,
    getClipError,
    isAnyClipLoading: loadingClips.size > 0,

    // Cache management
    clearCache,
    getCacheInfo,
  };
}

export type UseSunoClipPlaybackReturn = ReturnType<typeof useSunoClipPlayback>;
