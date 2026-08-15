'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Represents the metering data for a single audio channel
 */
export interface ChannelMeter {
  id: string;
  name: string;
  peak: number;              // Peak level in dB (dBFS scale: -60 to +6)
  rms: number;               // RMS level in dB
  isClipping: boolean;       // True when peak >= 0 dB
  muted: boolean;
  solo: boolean;
  volume: number;            // 0 to 1
}

/**
 * Complete audio meter data including all channels and master level
 */
export interface AudioMeterData {
  channels: ChannelMeter[];
  master: number;            // Peak level in dB
  rms: number;               // RMS level in dB
  isClipping: boolean;       // True when any channel or master is clipping
  audioContextAvailable: boolean;
  isPlaying: boolean;
}

/**
 * Control interface for audio meter
 */
export interface AudioMeterControls {
  resetPeaks: () => void;
  toggleChannelMute: (channelId: string) => void;
  toggleChannelSolo: (channelId: string) => void;
  setChannelVolume: (channelId: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
}

// Mock channel configuration
const MOCK_CHANNELS = [
  { id: 'mic1', name: 'Mic 1' },
  { id: 'mic2', name: 'Mic 2' },
  { id: 'system', name: 'System' },
  { id: 'music', name: 'Music' },
  { id: 'guest', name: 'Guest' },
];

/**
 * Generate realistic mock meter data with subtle variations
 * Uses sine wave oscillation to simulate natural level changes
 */
function generateMockMeterData(
  time: number,
  channels: typeof MOCK_CHANNELS
): Omit<AudioMeterData, 'audioContextAvailable'> {
  const now = Date.now();
  const channelData = channels.map((channel) => {
    // Create subtle variation per channel using unique frequency offsets
    const offset = parseInt(channel.id.charCodeAt(0).toString());
    const baseLevel = -20 + Math.sin((now + offset * 1000) / 2000) * 8;
    const peak = baseLevel + (Math.random() * 4 - 2);
    const rms = peak - 6 - Math.random() * 3;

    return {
      id: channel.id,
      name: channel.name,
      peak: Math.max(-60, Math.min(6, peak)),
      rms: Math.max(-60, Math.min(0, rms)),
      isClipping: peak >= 0,
      muted: false,
      solo: false,
      volume: 1,
    };
  });

  // Calculate master levels from channels
  const masterPeak = Math.max(...channelData.map((c) => c.peak));
  const masterRms = channelData.reduce((sum, c) => sum + c.rms, 0) / channelData.length;

  return {
    channels: channelData,
    master: masterPeak,
    rms: masterRms,
    isClipping: masterPeak >= 0 || channelData.some((c) => c.isClipping),
    isPlaying: true,
  };
}

/**
 * Convert Uint8Array from analyser node to dB level
 * @param dataArray - Frequency bin data from AnalyserNode
 * @returns Level in dBFS
 */
function calculateDbLevel(dataArray: Uint8Array): number {
  if (dataArray.length === 0) return -60;

  // Calculate peak (maximum value in the range)
  const peak = Math.max(...Array.from(dataArray));
  const normalized = peak / 255;

  // Convert to dBFS: 20 * log10(normalized)
  // Minimum -60 dB, maximum +6 dB (with headroom)
  if (normalized === 0) return -60;
  const db = 20 * Math.log10(Math.max(normalized, 0.001));
  return Math.max(-60, Math.min(6, db));
}

/**
 * Calculate RMS (Root Mean Square) level from frequency data
 * @param dataArray - Frequency bin data from AnalyserNode
 * @returns RMS level in dB
 */
function calculateRmsLevel(dataArray: Uint8Array): number {
  if (dataArray.length === 0) return -60;

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const normalized = dataArray[i] / 255;
    sum += normalized * normalized;
  }

  const rms = Math.sqrt(sum / dataArray.length);
  if (rms === 0) return -60;

  const db = 20 * Math.log10(Math.max(rms, 0.001));
  return Math.max(-60, Math.min(0, db));
}

/**
 * useAudioMeter - React hook for real-time audio metering
 *
 * Provides real-time audio peak and RMS levels from Web Audio API.
 * Falls back to realistic mock data when Web Audio is unavailable.
 *
 * @param options - Configuration options
 * @returns Audio meter data and control functions
 *
 * @example
 * const { data, controls } = useAudioMeter({
 *   updateFrequency: 100,
 *   onClipping: () => console.log('Clipping detected!')
 * });
 *
 * return (
 *   <>
 *     {data.channels.map(ch => (
 *       <div key={ch.id}>
 *         {ch.name}: {ch.peak.toFixed(1)} dB
 *       </div>
 *     ))}
 *   </>
 * );
 */
export const useAudioMeter = (options?: {
  updateFrequency?: number;
  onClipping?: () => void;
  channels?: typeof MOCK_CHANNELS;
}) => {
  const { updateFrequency = 100, onClipping, channels = MOCK_CHANNELS } = options || {};

  // State
  const [data, setData] = useState<AudioMeterData>({
    channels: channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      peak: -60,
      rms: -60,
      isClipping: false,
      muted: false,
      solo: false,
      volume: 1,
    })),
    master: -60,
    rms: -60,
    isClipping: false,
    audioContextAvailable: false,
    isPlaying: false,
  });

  // Refs for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map());
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();
  const channelMuteRef = useRef<Map<string, boolean>>(new Map());
  const channelSoloRef = useRef<Map<string, boolean>>(new Map());
  const channelVolumeRef = useRef<Map<string, number>>(new Map());
  const masterVolumeRef = useRef<number>(1);
  const lastClippingStateRef = useRef<boolean>(false);

  /**
   * Initialize Web Audio API
   */
  const initializeAudioContext = useCallback(async () => {
    try {
      if (audioContextRef.current) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not available, using mock data');
        return;
      }

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Resume context if needed (for browser autoplay policies)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create master gain node
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = 0.8;
      masterGainRef.current = masterGain;

      // Create analyser nodes for each channel
      channels.forEach((channel) => {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserNodesRef.current.set(channel.id, analyser);

        const gain = audioContext.createGain();
        gain.connect(masterGain);
        gainNodesRef.current.set(channel.id, gain);

        channelVolumeRef.current.set(channel.id, 1);
      });

      setData((prev) => ({ ...prev, audioContextAvailable: true }));
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      // Continue with mock data
    }
  }, [channels]);

  /**
   * Try to connect to audio stream (microphone, etc.)
   */
  const connectAudioStream = useCallback(async (stream: MediaStream) => {
    try {
      if (!audioContextRef.current) {
        await initializeAudioContext();
      }

      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      const source = audioContext.createMediaStreamSource(stream);

      // For now, connect to the first channel (Mic 1)
      const micAnalyser = analyserNodesRef.current.get('mic1');
      if (micAnalyser) {
        source.connect(micAnalyser);
      }

      setData((prev) => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Failed to connect audio stream:', error);
    }
  }, [initializeAudioContext]);

  /**
   * Update meter readings from analyser nodes
   */
  const updateMeters = useCallback(() => {
    if (!audioContextRef.current) {
      // Use mock data
      const mockData = generateMockMeterData(Date.now(), channels);
      const newIsClipping = mockData.isClipping;

      if (newIsClipping && !lastClippingStateRef.current) {
        onClipping?.();
      }
      lastClippingStateRef.current = newIsClipping;

      setData((prev) => ({
        ...prev,
        ...mockData,
        audioContextAvailable: false,
      }));
      return;
    }

    // Get real data from analyser nodes
    const updatedChannels = channels.map((channel) => {
      const analyser = analyserNodesRef.current.get(channel.id);
      const isMuted = channelMuteRef.current.get(channel.id) ?? false;
      const isSolo = channelSoloRef.current.get(channel.id) ?? false;
      const volume = channelVolumeRef.current.get(channel.id) ?? 1;

      if (!analyser) {
        return {
          id: channel.id,
          name: channel.name,
          peak: -60,
          rms: -60,
          isClipping: false,
          muted: isMuted,
          solo: isSolo,
          volume,
        };
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      const peak = calculateDbLevel(dataArray);
      const rms = calculateRmsLevel(dataArray);

      return {
        id: channel.id,
        name: channel.name,
        peak,
        rms,
        isClipping: peak >= 0,
        muted: isMuted,
        solo: isSolo,
        volume,
      };
    });

    // Calculate master levels
    const masterPeak = Math.max(...updatedChannels.map((c) => c.peak));
    const masterRms = updatedChannels.reduce((sum, c) => sum + c.rms, 0) / updatedChannels.length;
    const isClipping = updatedChannels.some((c) => c.isClipping);

    // Trigger callback on clipping state change
    if (isClipping && !lastClippingStateRef.current) {
      onClipping?.();
    }
    lastClippingStateRef.current = isClipping;

    setData({
      channels: updatedChannels,
      master: masterPeak,
      rms: masterRms,
      isClipping,
      audioContextAvailable: true,
      isPlaying: true,
    });
  }, [channels, onClipping]);

  /**
   * Reset peak levels
   */
  const resetPeaks = useCallback(() => {
    setData((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) => ({
        ...ch,
        peak: -60,
        rms: -60,
        isClipping: false,
      })),
      master: -60,
      rms: -60,
      isClipping: false,
    }));
    lastClippingStateRef.current = false;
  }, []);

  /**
   * Toggle mute for a channel
   */
  const toggleChannelMute = useCallback((channelId: string) => {
    const current = channelMuteRef.current.get(channelId) ?? false;
    const newMuteState = !current;
    channelMuteRef.current.set(channelId, newMuteState);

    const gain = gainNodesRef.current.get(channelId);
    if (gain) {
      const time = audioContextRef.current?.currentTime || 0;
      gain.gain.setValueAtTime(newMuteState ? 0 : (channelVolumeRef.current.get(channelId) ?? 1), time);
    }

    setData((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) =>
        ch.id === channelId ? { ...ch, muted: newMuteState } : ch
      ),
    }));
  }, []);

  /**
   * Toggle solo for a channel
   */
  const toggleChannelSolo = useCallback((channelId: string) => {
    const current = channelSoloRef.current.get(channelId) ?? false;
    const newSoloState = !current;

    // When soloing a channel, mute all others
    if (newSoloState) {
      channels.forEach((ch) => {
        if (ch.id !== channelId) {
          channelMuteRef.current.set(ch.id, true);
          const gain = gainNodesRef.current.get(ch.id);
          if (gain) {
            const time = audioContextRef.current?.currentTime || 0;
            gain.gain.setValueAtTime(0, time);
          }
        }
      });
    } else {
      // Restore mute states when unsolo
      channels.forEach((ch) => {
        const wasMuted = channelMuteRef.current.get(ch.id) ?? false;
        if (ch.id !== channelId && !wasMuted) {
          const gain = gainNodesRef.current.get(ch.id);
          if (gain) {
            const time = audioContextRef.current?.currentTime || 0;
            gain.gain.setValueAtTime(channelVolumeRef.current.get(ch.id) ?? 1, time);
          }
        }
      });
    }

    channelSoloRef.current.set(channelId, newSoloState);

    setData((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) =>
        ch.id === channelId
          ? { ...ch, solo: newSoloState, muted: newSoloState ? ch.muted : false }
          : { ...ch, muted: newSoloState ? true : ch.muted }
      ),
    }));
  }, [channels]);

  /**
   * Set channel volume (0 to 1)
   */
  const setChannelVolume = useCallback((channelId: string, volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    channelVolumeRef.current.set(channelId, clampedVolume);

    const gain = gainNodesRef.current.get(channelId);
    if (gain) {
      const time = audioContextRef.current?.currentTime || 0;
      const isMuted = channelMuteRef.current.get(channelId) ?? false;
      gain.gain.setValueAtTime(isMuted ? 0 : clampedVolume, time);
    }

    setData((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) =>
        ch.id === channelId ? { ...ch, volume: clampedVolume } : ch
      ),
    }));
  }, []);

  /**
   * Set master volume (0 to 1)
   */
  const setMasterVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    masterVolumeRef.current = clampedVolume;

    if (masterGainRef.current) {
      const time = audioContextRef.current?.currentTime || 0;
      masterGainRef.current.gain.setValueAtTime(clampedVolume, time);
    }
  }, []);

  /**
   * Setup update interval for meter readings
   */
  useEffect(() => {
    // Initialize on first render
    initializeAudioContext();

    // Setup update interval
    updateIntervalRef.current = setInterval(() => {
      updateMeters();
    }, updateFrequency);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateFrequency, updateMeters, initializeAudioContext]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Note: Don't close AudioContext on unmount as it may be shared
    };
  }, []);

  const controls: AudioMeterControls = {
    resetPeaks,
    toggleChannelMute,
    toggleChannelSolo,
    setChannelVolume,
    setMasterVolume,
  };

  return {
    data,
    controls,
    initializeAudioContext,
    connectAudioStream,
  };
};
