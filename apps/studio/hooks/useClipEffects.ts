'use client';

/**
 * Clip Effects Chain Hook
 * Manage audio effects (EQ, reverb, delay, compression) for clips
 * Supports undo/redo and routing to mixer
 */

import { useCallback, useState, useRef } from 'react';

export interface EffectNode {
  id: string;
  type: 'eq' | 'reverb' | 'delay' | 'compression' | 'distortion';
  name: string;
  enabled: boolean;
  params: {
    // EQ
    lowGain?: number; // dB
    midGain?: number; // dB
    highGain?: number; // dB

    // Reverb
    wet?: number; // 0-1
    decay?: number; // 0-10 seconds

    // Delay
    time?: number; // milliseconds
    feedback?: number; // 0-1

    // Compression
    threshold?: number; // dB
    ratio?: number; // 1-16
    attack?: number; // ms
    release?: number; // ms

    // Distortion
    drive?: number; // 0-1
    tone?: number; // 0-1
  };
}

export interface ClipEffectsChain {
  clipId: string;
  trackId: string;
  volume: number; // 0-1
  pan: number; // -1 to 1
  effects: EffectNode[];
  isMuted: boolean;
}

interface EffectHistory {
  clipId: string;
  before: ClipEffectsChain;
  after: ClipEffectsChain;
  timestamp: number;
}

export function useClipEffects() {
  const [chains, setChains] = useState<Map<string, ClipEffectsChain>>(new Map());
  const historyRef = useRef<EffectHistory[]>([]);
  const historyIndexRef = useRef(-1);

  /**
   * Initialize effects chain for a clip
   */
  const initializeChain = useCallback((clipId: string, trackId: string) => {
    setChains(prev => {
      if (!prev.has(clipId)) {
        const newChains = new Map(prev);
        newChains.set(clipId, {
          clipId,
          trackId,
          volume: 1,
          pan: 0,
          effects: [],
          isMuted: false,
        });
        return newChains;
      }
      return prev;
    });
  }, []);

  /**
   * Get effects chain for a clip
   */
  const getChain = useCallback((clipId: string): ClipEffectsChain | undefined => {
    return chains.get(clipId);
  }, [chains]);

  /**
   * Add effect to chain
   */
  const addEffect = useCallback(
    (clipId: string, effectType: EffectNode['type'], params: EffectNode['params'] = {}) => {
      const chain = chains.get(clipId);
      if (!chain) return null;

      const effectId = `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newEffect: EffectNode = {
        id: effectId,
        type: effectType,
        name: effectType.charAt(0).toUpperCase() + effectType.slice(1),
        enabled: true,
        params,
      };

      const before = { ...chain };
      const after = { ...chain, effects: [...chain.effects, newEffect] };

      setChains(prev => {
        const newChains = new Map(prev);
        newChains.set(clipId, after);
        return newChains;
      });

      // Record in history
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push({ clipId, before, after, timestamp: Date.now() });
      historyIndexRef.current++;

      return effectId;
    },
    [chains]
  );

  /**
   * Remove effect from chain
   */
  const removeEffect = useCallback((clipId: string, effectId: string) => {
    const chain = chains.get(clipId);
    if (!chain) return;

    const before = { ...chain };
    const after = {
      ...chain,
      effects: chain.effects.filter(e => e.id !== effectId),
    };

    setChains(prev => {
      const newChains = new Map(prev);
      newChains.set(clipId, after);
      return newChains;
    });

    // Record in history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push({ clipId, before, after, timestamp: Date.now() });
    historyIndexRef.current++;
  }, [chains]);

  /**
   * Update effect parameters
   */
  const updateEffect = useCallback(
    (clipId: string, effectId: string, params: Partial<EffectNode['params']>) => {
      const chain = chains.get(clipId);
      if (!chain) return;

      const before = { ...chain };
      const after = {
        ...chain,
        effects: chain.effects.map(e =>
          e.id === effectId ? { ...e, params: { ...e.params, ...params } } : e
        ),
      };

      setChains(prev => {
        const newChains = new Map(prev);
        newChains.set(clipId, after);
        return newChains;
      });

      // Record in history
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push({ clipId, before, after, timestamp: Date.now() });
      historyIndexRef.current++;
    },
    [chains]
  );

  /**
   * Toggle effect on/off
   */
  const toggleEffect = useCallback((clipId: string, effectId: string) => {
    const chain = chains.get(clipId);
    if (!chain) return;

    const before = { ...chain };
    const after = {
      ...chain,
      effects: chain.effects.map(e =>
        e.id === effectId ? { ...e, enabled: !e.enabled } : e
      ),
    };

    setChains(prev => {
      const newChains = new Map(prev);
      newChains.set(clipId, after);
      return newChains;
    });

    // Record in history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push({ clipId, before, after, timestamp: Date.now() });
    historyIndexRef.current++;
  }, [chains]);

  /**
   * Set clip volume
   */
  const setVolume = useCallback(
    (clipId: string, volume: number) => {
      const chain = chains.get(clipId);
      if (!chain) return;

      const before = { ...chain };
      const after = { ...chain, volume: Math.max(0, Math.min(1, volume)) };

      setChains(prev => {
        const newChains = new Map(prev);
        newChains.set(clipId, after);
        return newChains;
      });

      // Record in history
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push({ clipId, before, after, timestamp: Date.now() });
      historyIndexRef.current++;
    },
    [chains]
  );

  /**
   * Set clip pan
   */
  const setPan = useCallback(
    (clipId: string, pan: number) => {
      const chain = chains.get(clipId);
      if (!chain) return;

      const before = { ...chain };
      const after = { ...chain, pan: Math.max(-1, Math.min(1, pan)) };

      setChains(prev => {
        const newChains = new Map(prev);
        newChains.set(clipId, after);
        return newChains;
      });

      // Record in history
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push({ clipId, before, after, timestamp: Date.now() });
      historyIndexRef.current++;
    },
    [chains]
  );

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(
    (clipId: string) => {
      const chain = chains.get(clipId);
      if (!chain) return;

      const before = { ...chain };
      const after = { ...chain, isMuted: !chain.isMuted };

      setChains(prev => {
        const newChains = new Map(prev);
        newChains.set(clipId, after);
        return newChains;
      });

      // Record in history
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push({ clipId, before, after, timestamp: Date.now() });
      historyIndexRef.current++;
    },
    [chains]
  );

  /**
   * Undo last effect change
   */
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const action = historyRef.current[historyIndexRef.current];

      setChains(prev => {
        const newChains = new Map(prev);
        newChains.set(action.clipId, { ...action.before });
        return newChains;
      });
    }
  }, []);

  /**
   * Redo last undone effect change
   */
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const action = historyRef.current[historyIndexRef.current + 1];
      historyIndexRef.current++;

      setChains(prev => {
        const newChains = new Map(prev);
        newChains.set(action.clipId, { ...action.after });
        return newChains;
      });
    }
  }, []);

  /**
   * Get history info
   */
  const getHistoryInfo = useCallback(
    () => ({
      canUndo: historyIndexRef.current >= 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
      historyLength: historyRef.current.length,
      currentIndex: historyIndexRef.current,
    }),
    []
  );

  return {
    chains,
    initializeChain,
    getChain,
    addEffect,
    removeEffect,
    updateEffect,
    toggleEffect,
    setVolume,
    setPan,
    toggleMute,
    undo,
    redo,
    getHistoryInfo,
  };
}
