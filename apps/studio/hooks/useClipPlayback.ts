'use client';

/**
 * Clip Playback Integration Hook
 *
 * Comprehensive clip playback management through Web Audio API with support for:
 * - Individual clip playback with fade in/out
 * - Multi-track playback with synchronization
 * - Playhead position tracking
 * - Pause/resume functionality
 * - Per-clip and per-track volume control
 * - Efficient buffer management and cleanup
 *
 * @module useClipPlayback
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { ClipData } from './useClips';
import {
  createTrimmedClipBuffer,
  getClipVolumeEnvelope,
  getClipPlaybackOffset,
  type ClipPlaybackInfo,
} from '../utils/clipPlayback';

/**
 * Information about a playing clip source
 * @internal
 */
interface PlayingClipSource {
  clipId: string;
  trackId: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  endTime: number;
  pauseTime?: number; // Set when paused to resume from correct position
  isMuted: boolean;
  originalVolume: number;
}

/**
 * Audio playback state
 * @internal
 */
interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
}

/**
 * Options for the useClipPlayback hook
 */
export interface UseClipPlaybackOptions {
  /** Master gain node for all clip playback (optional, hook creates if not provided) */
  masterGainNode?: GainNode;
  /** Callback when a clip finishes playback */
  onClipEnded?: (clipId: string) => void;
  /** Fade duration in seconds (default: 0.1) */
  fadeDuration?: number;
}

/**
 * Return type for useClipPlayback hook
 */
export interface UseClipPlaybackReturn {
  /**
   * Start playback of a single clip
   * @param clipId - ID of the clip to play
   * @param fromTime - Optional time offset to start playback from (in seconds)
   * @returns Promise that resolves when playback starts
   */
  playClip: (clipId: string, fromTime?: number) => Promise<void>;

  /**
   * Stop playback of a single clip
   * @param clipId - ID of the clip to stop
   */
  stopClip: (clipId: string) => void;

  /**
   * Stop all currently playing clips
   */
  stopAllClips: () => void;

  /**
   * Pause all currently playing clips
   */
  pauseAllClips: () => void;

  /**
   * Resume all paused clips
   */
  resumeAllClips: () => void;

  /**
   * Set volume for a specific clip (0.0 to 1.0)
   * @param clipId - ID of the clip
   * @param volume - Volume level (0.0 to 1.0)
   */
  setClipVolume: (clipId: string, volume: number) => void;

  /**
   * Set volume for all clips in a track
   * @param trackId - ID of the track
   * @param volume - Volume level (0.0 to 1.0)
   */
  setTrackVolume: (trackId: string, volume: number) => void;

  /**
   * Mute a specific clip
   * @param clipId - ID of the clip
   */
  muteClip: (clipId: string) => void;

  /**
   * Unmute a specific clip
   * @param clipId - ID of the clip
   */
  unmuteClip: (clipId: string) => void;

  /**
   * Check if a clip is currently playing
   * @param clipId - ID of the clip
   * @returns true if the clip is currently playing
   */
  isClipPlaying: (clipId: string) => boolean;

  /**
   * Get array of currently playing clip IDs
   */
  playingClips: string[];

  /**
   * Get the master gain node (for manual control if needed)
   */
  getMasterGain: () => GainNode | null;

  /**
   * Set master volume (0.0 to 1.0)
   * @param volume - Volume level
   */
  setMasterVolume: (volume: number) => void;

  /**
   * Register a clip for playback tracking
   * @param clip - Clip data
   */
  registerClip: (clip: ClipData) => void;

  /**
   * Unregister a clip
   * @param clipId - ID of the clip to unregister
   */
  unregisterClip: (clipId: string) => void;
}

/**
 * React hook for managing audio clip playback
 *
 * Provides a comprehensive interface for playing audio clips through the Web Audio API
 * with support for multi-track playback, fading, volume control, and pause/resume.
 *
 * @param options - Configuration options
 * @returns Playback control interface
 *
 * @example
 * ```tsx
 * const playback = useClipPlayback();
 *
 * // Play a clip from the beginning
 * await playback.playClip(clipId);
 *
 * // Play multiple clips for multi-track playback
 * await Promise.all([
 *   playback.playClip(clipId1),
 *   playback.playClip(clipId2),
 * ]);
 *
 * // Control playback
 * playback.pauseAllClips();
 * playback.setClipVolume(clipId, 0.8);
 * playback.resumeAllClips();
 * ```
 */
export function useClipPlayback(options: UseClipPlaybackOptions = {}): UseClipPlaybackReturn {
  const { masterGainNode: providedMasterGain, onClipEnded, fadeDuration = 0.1 } = options;

  // Refs for maintaining state across renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(providedMasterGain || null);
  const playingClipsRef = useRef<Map<string, PlayingClipSource>>(new Map());
  const registeredClipsRef = useRef<Map<string, ClipData>>(new Map());
  const trimmedBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const playbackStateRef = useRef<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
  });

  // State for triggering re-renders
  const [playingClipIds, setPlayingClipIds] = useState<string[]>([]);

  /**
   * Initialize or get the audio context
   * @internal
   */
  const initializeAudioContext = useCallback((): AudioContext | null => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    try {
      // Try to get context from window (for browser environments)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create master gain node if not provided
      if (!masterGainRef.current && audioContext) {
        const masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGainRef.current = masterGain;
      }

      return audioContext;
    } catch (error) {
      console.error('[useClipPlayback] Failed to initialize audio context:', error);
      return null;
    }
  }, []);

  /**
   * Get or create trimmed buffer with fades for a clip
   * Cached to avoid recreating the same buffer multiple times
   * @internal
   */
  const getTrimmedBuffer = useCallback(
    (clip: ClipData): AudioBuffer | null => {
      const ctx = audioContextRef.current;
      if (!ctx) return null;

      // Create cache key based on clip trim and fade parameters
      const cacheKey = `${clip.id}:${clip.displayStart}:${clip.displayEnd}:${clip.fadeIn}:${clip.fadeOut}`;

      // Return cached buffer if available
      if (trimmedBufferCacheRef.current.has(cacheKey)) {
        return trimmedBufferCacheRef.current.get(cacheKey)!;
      }

      // Create playback info for trimming
      const playbackInfo: ClipPlaybackInfo = {
        audioBuffer: clip.audioBuffer,
        startTime: clip.startTime,
        displayStart: clip.displayStart,
        displayEnd: clip.displayEnd,
        fadeIn: clip.fadeIn,
        fadeOut: clip.fadeOut,
      };

      try {
        const trimmedBuffer = createTrimmedClipBuffer(ctx, playbackInfo);
        trimmedBufferCacheRef.current.set(cacheKey, trimmedBuffer);
        return trimmedBuffer;
      } catch (error) {
        console.error('[useClipPlayback] Failed to create trimmed buffer:', error);
        return null;
      }
    },
    []
  );

  /**
   * Update the playing clips state for re-renders
   * @internal
   */
  const updatePlayingClipsState = useCallback(() => {
    const clipIds = Array.from(playingClipsRef.current.keys());
    setPlayingClipIds(clipIds);
  }, []);

  /**
   * Clean up a source node and remove it from tracking
   * @internal
   */
  const cleanupSource = useCallback(
    (clipId: string, source: PlayingClipSource) => {
      try {
        // Try to stop the source (may already be stopped)
        source.source.stop();
      } catch {
        // Source already stopped, ignore
      }

      // Remove from playing clips
      playingClipsRef.current.delete(clipId);
      updatePlayingClipsState();
    },
    [updatePlayingClipsState]
  );

  /**
   * Apply fade to a clip's gain node
   * @internal
   */
  const applyFade = useCallback(
    (
      gainNode: GainNode,
      fromVolume: number,
      toVolume: number,
      duration: number = fadeDuration
    ) => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      gainNode.gain.setValueAtTime(fromVolume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(toVolume, ctx.currentTime + duration);
    },
    [fadeDuration]
  );

  /**
   * Start playback of a clip
   * @internal
   */
  const startClipPlayback = useCallback(
    (clip: ClipData, offsetInClip: number = 0): PlayingClipSource | null => {
      const ctx = initializeAudioContext();
      if (!ctx || !masterGainRef.current) {
        console.error('[useClipPlayback] Audio context not available');
        return null;
      }

      // Get trimmed buffer with fades
      const trimmedBuffer = getTrimmedBuffer(clip);
      if (!trimmedBuffer) {
        console.error('[useClipPlayback] Failed to get trimmed buffer for clip:', clip.id);
        return null;
      }

      try {
        // Create source node
        const source = ctx.createBufferSource();
        source.buffer = trimmedBuffer;

        // Create gain node for individual clip volume
        const gainNode = ctx.createGain();
        const initialVolume = 1.0;
        gainNode.gain.setValueAtTime(initialVolume, ctx.currentTime);

        // Connect chain: source -> gain -> master
        source.connect(gainNode);
        gainNode.connect(masterGainRef.current);

        // Calculate playback parameters
        const clipDuration = clip.displayEnd - clip.displayStart;
        const startOffset = Math.max(0, Math.min(offsetInClip, clipDuration));
        const remainingDuration = clipDuration - startOffset;

        // Schedule playback
        source.start(ctx.currentTime, startOffset);
        source.stop(ctx.currentTime + remainingDuration);

        // Create source info
        const sourceInfo: PlayingClipSource = {
          clipId: clip.id,
          trackId: clip.trackId,
          source,
          gainNode,
          startTime: clip.startTime,
          endTime: clip.startTime + clipDuration,
          isMuted: false,
          originalVolume: initialVolume,
        };

        // Handle source end
        source.onended = () => {
          cleanupSource(clip.id, sourceInfo);
          onClipEnded?.(clip.id);
        };

        return sourceInfo;
      } catch (error) {
        console.error('[useClipPlayback] Failed to start clip playback:', error);
        return null;
      }
    },
    [initializeAudioContext, getTrimmedBuffer, cleanupSource, onClipEnded]
  );

  /**
   * Play a single clip
   */
  const playClip = useCallback(
    async (clipId: string, fromTime?: number): Promise<void> => {
      try {
        // Ensure audio context is initialized
        if (!initializeAudioContext()) {
          throw new Error('Failed to initialize audio context');
        }

        // Get clip data
        const clip = registeredClipsRef.current.get(clipId);
        if (!clip) {
          console.error('[useClipPlayback] Clip not registered:', clipId);
          return;
        }

        // Stop if already playing
        if (playingClipsRef.current.has(clipId)) {
          stopClip(clipId);
        }

        // Calculate offset
        const offset = fromTime ?? 0;

        // Start playback
        const sourceInfo = startClipPlayback(clip, offset);
        if (!sourceInfo) {
          throw new Error('Failed to start clip playback');
        }

        // Track the playing clip
        playingClipsRef.current.set(clipId, sourceInfo);
        updatePlayingClipsState();

        // Mark as playing
        playbackStateRef.current.isPlaying = true;
      } catch (error) {
        console.error('[useClipPlayback] Error playing clip:', error);
        throw error;
      }
    },
    [initializeAudioContext, startClipPlayback, updatePlayingClipsState]
  );

  /**
   * Stop a single clip
   */
  const stopClip = useCallback(
    (clipId: string) => {
      const sourceInfo = playingClipsRef.current.get(clipId);
      if (!sourceInfo) return;

      // Apply fade out
      if (fadeDuration > 0) {
        applyFade(sourceInfo.gainNode, sourceInfo.gainNode.gain.value, 0, fadeDuration);

        // Schedule stop after fade
        const ctx = audioContextRef.current;
        if (ctx) {
          sourceInfo.source.stop(ctx.currentTime + fadeDuration);
        }
      } else {
        cleanupSource(clipId, sourceInfo);
      }
    },
    [fadeDuration, applyFade, cleanupSource]
  );

  /**
   * Stop all clips
   */
  const stopAllClips = useCallback(() => {
    const clipsToStop = Array.from(playingClipsRef.current.keys());
    clipsToStop.forEach((clipId) => stopClip(clipId));
  }, [stopClip]);

  /**
   * Pause all clips
   */
  const pauseAllClips = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    playingClipsRef.current.forEach((sourceInfo) => {
      // Record pause time
      sourceInfo.pauseTime = ctx.currentTime;

      // Apply fade out
      if (fadeDuration > 0) {
        applyFade(sourceInfo.gainNode, sourceInfo.gainNode.gain.value, 0, fadeDuration / 2);
      }

      // Stop after fade
      sourceInfo.source.stop(ctx.currentTime + fadeDuration / 2);
    });

    playbackStateRef.current.isPaused = true;
    playbackStateRef.current.isPlaying = false;
  }, [fadeDuration, applyFade]);

  /**
   * Resume all paused clips
   * Note: Due to Web Audio API limitations, this re-creates the sources
   */
  const resumeAllClips = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !playbackStateRef.current.isPaused) return;

    const clipsToResume = Array.from(playingClipsRef.current.values());
    playingClipsRef.current.clear();

    clipsToResume.forEach((oldSourceInfo) => {
      const clip = registeredClipsRef.current.get(oldSourceInfo.clipId);
      if (!clip) return;

      // Calculate offset based on pause time
      const clipDuration = clip.displayEnd - clip.displayStart;
      let offset = 0;

      if (oldSourceInfo.pauseTime !== undefined) {
        offset = Math.max(0, oldSourceInfo.pauseTime - oldSourceInfo.startTime);
        offset = Math.min(offset, clipDuration);
      }

      // Restart playback
      const newSourceInfo = startClipPlayback(clip, offset);
      if (newSourceInfo) {
        newSourceInfo.isMuted = oldSourceInfo.isMuted;
        newSourceInfo.originalVolume = oldSourceInfo.originalVolume;
        playingClipsRef.current.set(oldSourceInfo.clipId, newSourceInfo);
      }
    });

    playbackStateRef.current.isPaused = false;
    playbackStateRef.current.isPlaying = true;
    updatePlayingClipsState();
  }, [startClipPlayback, updatePlayingClipsState]);

  /**
   * Set volume for a clip
   */
  const setClipVolume = useCallback((clipId: string, volume: number) => {
    const sourceInfo = playingClipsRef.current.get(clipId);
    if (!sourceInfo) return;

    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Clamp volume to 0-1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    sourceInfo.originalVolume = clampedVolume;

    // Apply volume unless muted
    const effectiveVolume = sourceInfo.isMuted ? 0 : clampedVolume;
    sourceInfo.gainNode.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
  }, []);

  /**
   * Set volume for all clips in a track
   */
  const setTrackVolume = useCallback(
    (trackId: string, volume: number) => {
      playingClipsRef.current.forEach((sourceInfo) => {
        if (sourceInfo.trackId === trackId) {
          setClipVolume(sourceInfo.clipId, volume);
        }
      });
    },
    [setClipVolume]
  );

  /**
   * Mute a clip
   */
  const muteClip = useCallback((clipId: string) => {
    const sourceInfo = playingClipsRef.current.get(clipId);
    if (!sourceInfo) return;

    sourceInfo.isMuted = true;
    const ctx = audioContextRef.current;
    if (ctx) {
      sourceInfo.gainNode.gain.setValueAtTime(0, ctx.currentTime);
    }
  }, []);

  /**
   * Unmute a clip
   */
  const unmuteClip = useCallback((clipId: string) => {
    const sourceInfo = playingClipsRef.current.get(clipId);
    if (!sourceInfo) return;

    sourceInfo.isMuted = false;
    const ctx = audioContextRef.current;
    if (ctx) {
      sourceInfo.gainNode.gain.setValueAtTime(sourceInfo.originalVolume, ctx.currentTime);
    }
  }, []);

  /**
   * Check if a clip is playing
   */
  const isClipPlaying = useCallback((clipId: string): boolean => {
    return playingClipsRef.current.has(clipId);
  }, []);

  /**
   * Get master gain node
   */
  const getMasterGain = useCallback((): GainNode | null => {
    return masterGainRef.current;
  }, []);

  /**
   * Set master volume
   */
  const setMasterVolume = useCallback((volume: number) => {
    if (!masterGainRef.current) {
      initializeAudioContext();
    }

    if (!masterGainRef.current) return;

    const ctx = audioContextRef.current;
    if (!ctx) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    masterGainRef.current.gain.setValueAtTime(clampedVolume, ctx.currentTime);
  }, [initializeAudioContext]);

  /**
   * Register a clip for tracking
   */
  const registerClip = useCallback((clip: ClipData) => {
    registeredClipsRef.current.set(clip.id, clip);
  }, []);

  /**
   * Unregister a clip
   */
  const unregisterClip = useCallback((clipId: string) => {
    registeredClipsRef.current.delete(clipId);
    // Also stop if currently playing
    if (playingClipsRef.current.has(clipId)) {
      stopClip(clipId);
    }
  }, [stopClip]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Stop all playback
      stopAllClips();

      // Clear caches
      trimmedBufferCacheRef.current.clear();
      playingClipsRef.current.clear();
      registeredClipsRef.current.clear();

      // Don't close audio context - it may be shared
      // Just disconnect nodes if needed
    };
  }, [stopAllClips]);

  return {
    playClip,
    stopClip,
    stopAllClips,
    pauseAllClips,
    resumeAllClips,
    setClipVolume,
    setTrackVolume,
    muteClip,
    unmuteClip,
    isClipPlaying,
    playingClips: playingClipIds,
    getMasterGain,
    setMasterVolume,
    registerClip,
    unregisterClip,
  };
}
