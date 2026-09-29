/**
 * React Hook for Streaming Audio Mixer
 * Manages audio mixing state and operations
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { StreamingAudioSystem, AudioSourceConfig } from '@/lib/obs/audio/StreamingAudioIntegration';
import { AudioChannel } from '@/components/LiveStudio/AudioMixer';

interface MeteringState {
  [sourceId: string]: {
    peakLevel: number;
    rmsLevel: number;
    headroom: number;
    isClipping: boolean;
  };
}

export interface UseStreamingAudioMixerState {
  // State
  isInitialized: boolean;
  isStreaming: boolean;
  channels: AudioChannel[];
  masterVolume: number;
  masterMetering: {
    peakLevel: number;
    rmsLevel: number;
    headroom: number;
    isClipping: boolean;
  };
  audioState: string;

  // Actions
  addMicrophoneSource: () => Promise<boolean>;
  addSystemAudioSource: () => Promise<boolean>;
  addSunoTrackSource: (audioUrl: string) => Promise<boolean>;
  addMediaSource: (mediaElement: HTMLMediaElement, name: string) => boolean;
  removeSource: (sourceId: string) => void;

  // Controls
  setSourceVolume: (sourceId: string, volumeDb: number) => void;
  setSourcePan: (sourceId: string, pan: number) => void;
  setSourceMute: (sourceId: string, muted: boolean) => void;
  toggleSourceSolo: (sourceId: string) => void;
  setMasterVolume: (volumeDb: number) => void;
  setAudioDelay: (sourceId: string, delayMs: number) => void;

  // Stream Controls
  connectToStream: (serverUrl: string, streamKey: string) => Promise<boolean>;
  disconnectStream: () => void;
  isStreamConnected: () => boolean;

  // Cleanup
  cleanup: () => void;
}

export function useStreamingAudioMixer(): UseStreamingAudioMixerState {
  const systemRef = useRef<StreamingAudioSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [channels, setChannels] = useState<AudioChannel[]>([]);
  const [masterVolume, setMasterVolume] = useState(-6);
  const [masterMetering, setMasterMetering] = useState({
    peakLevel: -Infinity,
    rmsLevel: -Infinity,
    headroom: 6,
    isClipping: false,
  });
  const [audioState, setAudioState] = useState('not-initialized');

  // Initialize system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const system = new StreamingAudioSystem();
        systemRef.current = system;

        const success = await system.initialize();
        if (success) {
          setIsInitialized(true);

          // Set up metering updates
          const audioManager = system.getAudioManager();
          audioManager.setMetersUpdateCallback((meters) => {
            // Update channels from metering data
            const updatedChannels = audioManager.getSources().map((source) => {
              const metering = meters.sources[source.id] || {
                peakLevel: -Infinity,
                rmsLevel: -Infinity,
              };

              return {
                id: source.id,
                name: source.name,
                type: source.type,
                volume: source.volume,
                pan: source.pan,
                isMuted: source.muted,
                isSolo: source.solo,
                peakLevel: metering.peakLevel,
                rmsLevel: metering.rmsLevel,
                isClipping: metering.isClipping,
              };
            });

            setChannels(updatedChannels);

            // Update master metering
            if (meters.master) {
              setMasterMetering({
                peakLevel: meters.master.peakLevel,
                rmsLevel: meters.master.rmsLevel,
                headroom: meters.master.headroom,
                isClipping: meters.master.isClipping,
              });
            }

            // Update audio state
            setAudioState(audioManager.getAudioState().state);
          });
        }
      } catch (error) {
        console.error('Failed to initialize streaming audio system:', error);
        setIsInitialized(false);
      }
    };

    initializeSystem();

    return () => {
      if (systemRef.current) {
        systemRef.current.close();
      }
    };
  }, []);

  /**
   * Add microphone source
   */
  const addMicrophoneSource = useCallback(async () => {
    if (!systemRef.current) return false;
    const audioManager = systemRef.current.getAudioManager();
    return audioManager.addMicrophoneSource();
  }, []);

  /**
   * Add system audio source
   */
  const addSystemAudioSource = useCallback(async () => {
    if (!systemRef.current) return false;
    const audioManager = systemRef.current.getAudioManager();
    return audioManager.addSystemAudioSource();
  }, []);

  /**
   * Add Suno track source
   */
  const addSunoTrackSource = useCallback(async (audioUrl: string) => {
    if (!systemRef.current) return false;
    const audioManager = systemRef.current.getAudioManager();
    return audioManager.addSunoTrackSource(audioUrl);
  }, []);

  /**
   * Add media source
   */
  const addMediaSource = useCallback((mediaElement: HTMLMediaElement, name: string) => {
    if (!systemRef.current) return false;
    const audioManager = systemRef.current.getAudioManager();
    return audioManager.addMediaSource(mediaElement);
  }, []);

  /**
   * Remove audio source
   */
  const removeSource = useCallback((sourceId: string) => {
    if (!systemRef.current) return;
    const audioManager = systemRef.current.getAudioManager();
    audioManager.removeSource(sourceId);
  }, []);

  /**
   * Set source volume
   */
  const setSourceVolume = useCallback((sourceId: string, volumeDb: number) => {
    if (!systemRef.current) return;
    const audioManager = systemRef.current.getAudioManager();
    audioManager.setSourceVolume(sourceId, volumeDb);
  }, []);

  /**
   * Set source pan
   */
  const setSourcePan = useCallback((sourceId: string, pan: number) => {
    if (!systemRef.current) return;
    const audioManager = systemRef.current.getAudioManager();
    audioManager.setSourcePan(sourceId, pan);
  }, []);

  /**
   * Set source mute
   */
  const setSourceMute = useCallback((sourceId: string, muted: boolean) => {
    if (!systemRef.current) return;
    const audioManager = systemRef.current.getAudioManager();
    audioManager.setSourceMute(sourceId, muted);
  }, []);

  /**
   * Toggle source solo
   */
  const toggleSourceSolo = useCallback((sourceId: string) => {
    if (!systemRef.current) return;
    const audioManager = systemRef.current.getAudioManager();
    const sources = audioManager.getSources();
    const source = sources.find((s) => s.id === sourceId);
    if (source) {
      source.solo = !source.solo;
    }
  }, []);

  /**
   * Set master volume
   */
  const handleSetMasterVolume = useCallback((volumeDb: number) => {
    if (!systemRef.current) return;
    setMasterVolume(volumeDb);
    const audioManager = systemRef.current.getAudioManager();
    audioManager.setMasterVolume(volumeDb);
  }, []);

  /**
   * Set audio delay
   */
  const setAudioDelay = useCallback((sourceId: string, delayMs: number) => {
    if (!systemRef.current) return;
    const audioManager = systemRef.current.getAudioManager();
    audioManager.setAudioDelay(sourceId, delayMs);
  }, []);

  /**
   * Connect to RTMP stream
   */
  const connectToStream = useCallback(async (serverUrl: string, streamKey: string) => {
    if (!systemRef.current) return false;
    const success = await systemRef.current.connectToStream(serverUrl, streamKey);
    if (success) {
      setIsStreaming(true);
    }
    return success;
  }, []);

  /**
   * Disconnect from stream
   */
  const disconnectStream = useCallback(() => {
    if (!systemRef.current) return;
    const rtmpOutput = systemRef.current.getRTMPOutput();
    rtmpOutput.disconnect();
    setIsStreaming(false);
  }, []);

  /**
   * Check if stream is connected
   */
  const isStreamConnected = useCallback(() => {
    if (!systemRef.current) return false;
    const rtmpOutput = systemRef.current.getRTMPOutput();
    return rtmpOutput.isStreamActive();
  }, []);

  /**
   * Cleanup
   */
  const cleanup = useCallback(() => {
    if (systemRef.current) {
      systemRef.current.close();
      systemRef.current = null;
    }
    setIsInitialized(false);
    setIsStreaming(false);
    setChannels([]);
  }, []);

  return {
    // State
    isInitialized,
    isStreaming,
    channels,
    masterVolume,
    masterMetering,
    audioState,

    // Actions
    addMicrophoneSource,
    addSystemAudioSource,
    addSunoTrackSource,
    addMediaSource,
    removeSource,

    // Controls
    setSourceVolume,
    setSourcePan,
    setSourceMute,
    toggleSourceSolo,
    setMasterVolume: handleSetMasterVolume,
    setAudioDelay,

    // Stream Controls
    connectToStream,
    disconnectStream,
    isStreamConnected,

    // Cleanup
    cleanup,
  };
}

export default useStreamingAudioMixer;
