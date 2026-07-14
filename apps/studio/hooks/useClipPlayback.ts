'use client';

/**
 * Hook for managing clip playback through the audio engine
 * Handles scheduling clips, applying trims/fades, and managing source nodes
 */

import { useEffect, useRef, useCallback } from 'react';
import { AudioContextManager } from '@wise2/audio';
import type { ClipData } from './useClips';
import {
  createTrimmedClipBuffer,
  getClipsToStart,
  getClipsToStop,
  getActiveClips,
  getClipPlaybackOffset,
  getClipVolumeEnvelope,
  type ClipPlaybackInfo,
} from '../utils/clipPlayback';

interface ClipSourceNode {
  clipId: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  endTime: number;
}

export interface UseClipPlaybackOptions {
  currentTime: number;
  isPlaying: boolean;
  clips: ClipData[];
  masterGainNode?: GainNode;
  onClipEnded?: (clipId: string) => void;
}

export function useClipPlayback(options: UseClipPlaybackOptions) {
  const engineRef = useRef<{
    activeSources: Map<string, ClipSourceNode>;
    scheduledClips: Map<string, ClipSourceNode>;
    trimmedBufferCache: Map<string, AudioBuffer>;
  }>({
    activeSources: new Map(),
    scheduledClips: new Map(),
    trimmedBufferCache: new Map(),
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context reference (safely)
  useEffect(() => {
    try {
      const manager = AudioContextManager.getInstance();
      // Only get context if it's been initialized
      if (manager) {
        audioContextRef.current = manager.getContext();
      }
    } catch (e) {
      // Audio context not yet initialized, will retry on next effect
    }
  }, []);

  /**
   * Create or get trimmed buffer with fades applied
   */
  const getTrimmedBuffer = useCallback(
    (clip: ClipData): AudioBuffer | null => {
      if (!audioContextRef.current) return null;

      const cacheKey = `${clip.id}:${clip.displayStart}:${clip.displayEnd}:${clip.fadeIn}:${clip.fadeOut}`;

      if (engineRef.current.trimmedBufferCache.has(cacheKey)) {
        return engineRef.current.trimmedBufferCache.get(cacheKey)!;
      }

      const playbackInfo: ClipPlaybackInfo = {
        audioBuffer: clip.audioBuffer,
        startTime: clip.startTime,
        displayStart: clip.displayStart,
        displayEnd: clip.displayEnd,
        fadeIn: clip.fadeIn,
        fadeOut: clip.fadeOut,
      };

      const trimmedBuffer = createTrimmedClipBuffer(audioContextRef.current, playbackInfo);
      engineRef.current.trimmedBufferCache.set(cacheKey, trimmedBuffer);

      return trimmedBuffer;
    },
    []
  );

  /**
   * Start playback of a clip
   */
  const playClip = useCallback(
    (clip: ClipData, offsetInClip: number) => {
      if (!audioContextRef.current || !options.masterGainNode) return;

      const ctx = audioContextRef.current;
      const trimmedBuffer = getTrimmedBuffer(clip);

      if (!trimmedBuffer) return;

      // Create source node
      const source = ctx.createBufferSource();
      source.buffer = trimmedBuffer;

      // Create gain node for individual clip volume
      const gainNode = ctx.createGain();

      // Calculate volume envelope (fades)
      const volume = getClipVolumeEnvelope(clip, offsetInClip);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);

      // Connect chain: source -> gain -> master
      source.connect(gainNode);
      gainNode.connect(options.masterGainNode);

      // Schedule playback
      const clipDuration = clip.displayEnd - clip.displayStart;
      const remainingDuration = clipDuration - offsetInClip;

      source.start(ctx.currentTime, offsetInClip);

      // Track the source
      const clipEndTime = clip.startTime + clipDuration;
      const sourceInfo: ClipSourceNode = {
        clipId: clip.id,
        source,
        gainNode,
        startTime: clip.startTime,
        endTime: clipEndTime,
      };

      engineRef.current.activeSources.set(clip.id, sourceInfo);

      // Stop the source when it ends
      source.onended = () => {
        engineRef.current.activeSources.delete(clip.id);
        options.onClipEnded?.(clip.id);
      };

      // Schedule stop
      source.stop(ctx.currentTime + remainingDuration);
    },
    [getTrimmedBuffer, options]
  );

  /**
   * Stop playback of a clip
   */
  const stopClip = useCallback((clipId: string) => {
    const sourceInfo = engineRef.current.activeSources.get(clipId);
    if (sourceInfo) {
      try {
        sourceInfo.source.stop();
      } catch (e) {
        // Source already stopped
      }
      engineRef.current.activeSources.delete(clipId);
    }
  }, []);

  /**
   * Stop all clips
   */
  const stopAllClips = useCallback(() => {
    engineRef.current.activeSources.forEach((sourceInfo) => {
      try {
        sourceInfo.source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    engineRef.current.activeSources.clear();
  }, []);

  /**
   * Update volume envelope for a playing clip
   */
  const updateClipVolume = useCallback((clip: ClipData, offsetInClip: number) => {
    const sourceInfo = engineRef.current.activeSources.get(clip.id);
    if (sourceInfo) {
      const volume = getClipVolumeEnvelope(clip, offsetInClip);
      sourceInfo.gainNode.gain.setValueAtTime(volume, audioContextRef.current!.currentTime);
    }
  }, []);

  /**
   * Process playback for current time
   * Called on every animation frame to manage clip scheduling
   */
  useEffect(() => {
    if (!options.isPlaying || !audioContextRef.current) {
      return;
    }

    const ctx = audioContextRef.current;

    // Convert clips to playback info format
    const clipsToPlay: ClipPlaybackInfo[] = options.clips.map((clip) => ({
      audioBuffer: clip.audioBuffer,
      startTime: clip.startTime,
      displayStart: clip.displayStart,
      displayEnd: clip.displayEnd,
      fadeIn: clip.fadeIn,
      fadeOut: clip.fadeOut,
    }));

    // Get clips that should be playing
    const activeClips = getActiveClips(clipsToPlay, options.currentTime);

    // Stop clips that are no longer active
    engineRef.current.activeSources.forEach((sourceInfo, clipId) => {
      const isActive = activeClips.some(
        (c) => c.startTime === options.clips.find((clip) => clip.id === clipId)?.startTime
      );

      if (!isActive) {
        stopClip(clipId);
      }
    });

    // Start new clips or update existing ones
    activeClips.forEach((playbackInfo) => {
      const clip = options.clips.find((c) => c.startTime === playbackInfo.startTime);
      if (!clip) return;

      const isPlaying = engineRef.current.activeSources.has(clip.id);

      if (!isPlaying) {
        // Start the clip with offset
        const offset = Math.max(0, options.currentTime - clip.startTime);
        playClip(clip, offset);
      } else {
        // Update fade envelope for playing clip
        const offset = options.currentTime - clip.startTime;
        updateClipVolume(clip, offset);
      }
    });
  }, [options.currentTime, options.isPlaying, options.clips, playClip, updateClipVolume, stopClip]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopAllClips();
      engineRef.current.trimmedBufferCache.clear();
    };
  }, [stopAllClips]);

  return {
    playClip,
    stopClip,
    stopAllClips,
    updateClipVolume,
    getActiveSources: () => new Map(engineRef.current.activeSources),
  };
}
