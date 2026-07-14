'use client';

/**
 * Clips Management Hook
 * Manage all clips across all tracks
 */

import { useCallback, useRef, useState } from 'react';
import { Track } from '@wise2/audio';

export interface ClipData {
  id: string;
  trackId: string;
  name: string;
  audioBuffer: AudioBuffer;
  startTime: number; // seconds
  duration: number; // original duration
  displayStart: number; // trim start (seconds)
  displayEnd: number; // trim end (seconds)
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  isSelected: boolean;
}

interface UseClipsState {
  clips: Map<string, ClipData>;
  selectedClipId: string | null;
  recordingBuffer: AudioBuffer | null;
  recordingTrackId: string | null;
}

export function useClips() {
  const [state, setState] = useState<UseClipsState>({
    clips: new Map(),
    selectedClipId: null,
    recordingBuffer: null,
    recordingTrackId: null,
  });

  const undoStackRef = useRef<ClipData[][]>([]);

  /**
   * Add a new clip (from recording or import)
   */
  const addClip = useCallback(
    (
      trackId: string,
      audioBuffer: AudioBuffer,
      name: string = 'Untitled',
      startTime: number = 0
    ): string => {
      const clipId = `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newClip: ClipData = {
        id: clipId,
        trackId,
        name,
        audioBuffer,
        startTime,
        duration: audioBuffer.duration,
        displayStart: 0,
        displayEnd: audioBuffer.duration,
        fadeIn: 0,
        fadeOut: 0,
        isSelected: false,
      };

      setState(prev => {
        const newClips = new Map(prev.clips);
        newClips.set(clipId, newClip);
        return { ...prev, clips: newClips };
      });

      return clipId;
    },
    []
  );

  /**
   * Remove a clip
   */
  const removeClip = useCallback((clipId: string) => {
    setState(prev => {
      const newClips = new Map(prev.clips);
      newClips.delete(clipId);
      return {
        ...prev,
        clips: newClips,
        selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId,
      };
    });
  }, []);

  /**
   * Select a clip
   */
  const selectClip = useCallback((clipId: string | null) => {
    setState(prev => {
      const newClips = new Map(prev.clips);

      // Deselect all
      newClips.forEach(clip => {
        clip.isSelected = false;
      });

      // Select new one
      if (clipId && newClips.has(clipId)) {
        const clip = newClips.get(clipId)!;
        clip.isSelected = true;
      }

      return {
        ...prev,
        clips: newClips,
        selectedClipId: clipId,
      };
    });
  }, []);

  /**
   * Move clip to new start time
   */
  const moveClip = useCallback((clipId: string, newStartTime: number) => {
    setState(prev => {
      const newClips = new Map(prev.clips);
      const clip = newClips.get(clipId);
      if (clip) {
        clip.startTime = Math.max(0, newStartTime);
      }
      return { ...prev, clips: newClips };
    });
  }, []);

  /**
   * Trim clip start
   */
  const trimClipStart = useCallback((clipId: string, newTrimStart: number) => {
    setState(prev => {
      const newClips = new Map(prev.clips);
      const clip = newClips.get(clipId);
      if (clip) {
        clip.displayStart = Math.max(0, Math.min(newTrimStart, clip.displayEnd - 0.1));
      }
      return { ...prev, clips: newClips };
    });
  }, []);

  /**
   * Trim clip end
   */
  const trimClipEnd = useCallback((clipId: string, newTrimEnd: number) => {
    setState(prev => {
      const newClips = new Map(prev.clips);
      const clip = newClips.get(clipId);
      if (clip) {
        clip.displayEnd = Math.min(clip.duration, Math.max(clip.displayStart + 0.1, newTrimEnd));
      }
      return { ...prev, clips: newClips };
    });
  }, []);

  /**
   * Set fade in duration
   */
  const setFadeIn = useCallback((clipId: string, duration: number) => {
    setState(prev => {
      const newClips = new Map(prev.clips);
      const clip = newClips.get(clipId);
      if (clip) {
        const maxFade = (clip.displayEnd - clip.displayStart) / 2;
        clip.fadeIn = Math.max(0, Math.min(duration, maxFade));
      }
      return { ...prev, clips: newClips };
    });
  }, []);

  /**
   * Set fade out duration
   */
  const setFadeOut = useCallback((clipId: string, duration: number) => {
    setState(prev => {
      const newClips = new Map(prev.clips);
      const clip = newClips.get(clipId);
      if (clip) {
        const maxFade = (clip.displayEnd - clip.displayStart) / 2;
        clip.fadeOut = Math.max(0, Math.min(duration, maxFade));
      }
      return { ...prev, clips: newClips };
    });
  }, []);

  /**
   * Get clips for a specific track
   */
  const getClipsForTrack = useCallback((trackId: string): ClipData[] => {
    return Array.from(state.clips.values())
      .filter(clip => clip.trackId === trackId)
      .sort((a, b) => a.startTime - b.startTime);
  }, [state.clips]);

  /**
   * Get selected clip
   */
  const getSelectedClip = useCallback((): ClipData | undefined => {
    return state.selectedClipId ? state.clips.get(state.selectedClipId) : undefined;
  }, [state.clips, state.selectedClipId]);

  /**
   * Duplicate a clip
   */
  const duplicateClip = useCallback((clipId: string, offsetSeconds: number = 1) => {
    const clip = state.clips.get(clipId);
    if (!clip) return;

    const newClipId = addClip(
      clip.trackId,
      clip.audioBuffer,
      `${clip.name} (Copy)`,
      clip.startTime + offsetSeconds
    );

    // Copy trim/fade settings
    setState(prev => {
      const newClips = new Map(prev.clips);
      const newClip = newClips.get(newClipId);
      if (newClip) {
        newClip.displayStart = clip.displayStart;
        newClip.displayEnd = clip.displayEnd;
        newClip.fadeIn = clip.fadeIn;
        newClip.fadeOut = clip.fadeOut;
      }
      return { ...prev, clips: newClips };
    });

    return newClipId;
  }, [state.clips, addClip]);

  /**
   * Split clip at given time
   */
  const splitClip = useCallback((clipId: string, splitTime: number) => {
    const clip = state.clips.get(clipId);
    if (!clip) return;

    // Calculate offset within clip
    const offsetInClip = splitTime - clip.startTime;
    if (offsetInClip <= 0 || offsetInClip >= clip.duration) return;

    // Create second part
    const secondPartStart = clip.displayStart + offsetInClip;
    if (secondPartStart >= clip.displayEnd) return;

    const newClipId = addClip(
      clip.trackId,
      clip.audioBuffer,
      `${clip.name} (Part 2)`,
      splitTime
    );

    // Set trim on second part
    setState(prev => {
      const newClips = new Map(prev.clips);
      const secondPart = newClips.get(newClipId);
      if (secondPart) {
        secondPart.displayStart = secondPartStart;
        // Keep original displayEnd
      }

      // Trim first part
      const firstPart = newClips.get(clipId);
      if (firstPart) {
        firstPart.displayEnd = secondPartStart;
      }

      return { ...prev, clips: newClips };
    });

    return newClipId;
  }, [state.clips, addClip]);

  /**
   * Get all clips (returns array of all clip data)
   */
  const getAllClips = useCallback(() => {
    return Array.from(state.clips.values());
  }, [state.clips]);

  return {
    clips: state.clips,
    selectedClipId: state.selectedClipId,
    addClip,
    removeClip,
    selectClip,
    moveClip,
    trimClipStart,
    trimClipEnd,
    setFadeIn,
    setFadeOut,
    getClipsForTrack,
    getSelectedClip,
    getAllClips,
    duplicateClip,
    splitClip,
  };
}
