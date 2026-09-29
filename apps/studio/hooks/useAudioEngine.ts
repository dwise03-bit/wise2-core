'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioTrack {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  analyser?: AnalyserNode;
  gain?: GainNode;
}

export interface AudioLevels {
  peak: number;
  rms: number;
}

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analysersRef = useRef<Map<string, AnalyserNode>>(new Map());
  const gainsRef = useRef<Map<string, GainNode>>(new Map());
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioLevels, setAudioLevels] = useState<Record<string, AudioLevels>>({});
  const animationFrameRef = useRef<number>();

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create master gain node
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = 0.8;
      masterGainRef.current = masterGain;

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, []);

  // Create a new track with audio nodes
  const createTrack = useCallback((trackId: string) => {
    if (!audioContextRef.current || !masterGainRef.current) {
      initializeAudioContext();
      return;
    }

    const audioContext = audioContextRef.current;
    const masterGain = masterGainRef.current;

    // Create gain node for this track
    const trackGain = audioContext.createGain();
    trackGain.gain.value = 0.8;
    trackGain.connect(masterGain);

    // Create analyser for this track
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    trackGain.connect(analyser);

    // Create oscillator for testing
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    oscillator.connect(trackGain);

    gainsRef.current.set(trackId, trackGain);
    analysersRef.current.set(trackId, analyser);
    oscillatorsRef.current.set(trackId, oscillator);
  }, [initializeAudioContext]);

  // Set track volume
  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    const gain = gainsRef.current.get(trackId);
    if (gain) {
      gain.gain.setValueAtTime(volume, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Mute/unmute track
  const setTrackMute = useCallback((trackId: string, muted: boolean) => {
    const gain = gainsRef.current.get(trackId);
    if (gain) {
      gain.gain.setValueAtTime(muted ? 0 : 0.8, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Start playback
  const startPlayback = useCallback((trackIds: string[]) => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    trackIds.forEach((trackId) => {
      const oscillator = oscillatorsRef.current.get(trackId);
      if (oscillator) {
        try {
          oscillator.start();
        } catch (e) {
          // Oscillator already started
        }
      }
    });
  }, []);

  // Stop playback
  const stopPlayback = useCallback((trackIds: string[]) => {
    if (!audioContextRef.current) return;

    trackIds.forEach((trackId) => {
      const oscillator = oscillatorsRef.current.get(trackId);
      if (oscillator) {
        try {
          oscillator.stop();
        } catch (e) {
          // Oscillator already stopped
        }
      }
    });
  }, []);

  // Set master volume
  const setMasterVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Analyze audio levels
  const updateAudioLevels = useCallback(() => {
    if (!audioContextRef.current) return;

    const levels: Record<string, AudioLevels> = {};

    analysersRef.current.forEach((analyser, trackId) => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      // Calculate peak
      const peak = Math.max(...Array.from(dataArray));
      const peakDb = (peak / 255) * -60;

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += (dataArray[i] / 255) ** 2;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const rmsDb = (rms * -60) - 12;

      levels[trackId] = {
        peak: peakDb,
        rms: rmsDb,
      };
    });

    setAudioLevels(levels);
  }, []);

  // Animation loop for level updates
  useEffect(() => {
    const loop = () => {
      updateAudioLevels();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    if (isInitialized) {
      animationFrameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, updateAudioLevels]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isInitialized,
    audioContext: audioContextRef.current,
    initializeAudioContext,
    createTrack,
    setTrackVolume,
    setTrackMute,
    startPlayback,
    stopPlayback,
    setMasterVolume,
    audioLevels,
  };
};
