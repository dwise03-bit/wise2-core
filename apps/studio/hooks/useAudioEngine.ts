'use client';

/**
 * React hook for managing the audio engine lifecycle
 * Handles initialization, state management, and UI synchronization
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  AudioContextManager,
  Track,
  Mixer,
  Recorder,
  Playback,
  TrackConfig,
  PlaybackState,
  MeterReading,
} from '@wise2/audio';

interface AudioEngineState {
  isInitialized: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  tracks: Track[];
  mixer: Mixer | null;
  playback: Playback | null;
  recorder: Recorder | null;
  masterVolume: number;
  bpm: number;
  meterReading: MeterReading | null;
}

const initialState: AudioEngineState = {
  isInitialized: false,
  isRecording: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  tracks: [],
  mixer: null,
  playback: null,
  recorder: null,
  masterVolume: 0.8,
  bpm: 120,
  meterReading: null,
};

export function useAudioEngine() {
  const [state, setState] = useState<AudioEngineState>(initialState);
  const engineRef = useRef<{
    mixer: Mixer | null;
    playback: Playback | null;
    recorder: Recorder | null;
    meterInterval: number | null;
    metering: {
      peaks: Map<string, number>;
    };
  }>({
    mixer: null,
    playback: null,
    recorder: null,
    meterInterval: null,
    metering: {
      peaks: new Map(),
    },
  });

  /**
   * Initialize audio engine on first mount
   */
  useEffect(() => {
    const initializeEngine = async () => {
      try {
        const audioCtx = AudioContextManager.getInstance();

        // Initialize context (requires user interaction)
        await audioCtx.initialize();

        // Create mixer and playback
        const mixer = new Mixer();
        const playback = new Playback({ bpm: 120 });
        const recorder = new Recorder();

        engineRef.current.mixer = mixer;
        engineRef.current.playback = playback;
        engineRef.current.recorder = recorder;

        // Setup event listeners
        mixer.on('trackAdded', () => updateTracks());
        mixer.on('trackRemoved', () => updateTracks());
        mixer.on('masterVolumeChanged', (volume: number) => {
          setState(prev => ({ ...prev, masterVolume: volume }));
        });

        playback.on('started', () => {
          setState(prev => ({ ...prev, isPlaying: true }));
        });

        playback.on('paused', () => {
          setState(prev => ({ ...prev, isPlaying: false }));
        });

        playback.on('stopped', () => {
          setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        });

        playback.on('timeUpdated', (time: number) => {
          setState(prev => ({ ...prev, currentTime: time }));
        });

        // Start metering loop
        startMeteringLoop(mixer);

        setState(prev => ({
          ...prev,
          isInitialized: true,
          mixer,
          playback,
          recorder,
        }));
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      }
    };

    // Require user interaction before initializing
    const handleUserInteraction = async () => {
      if (!state.isInitialized) {
        await initializeEngine();
        document.removeEventListener('click', handleUserInteraction);
      }
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [state.isInitialized]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (engineRef.current.meterInterval) {
        clearInterval(engineRef.current.meterInterval);
      }
      if (engineRef.current.mixer) {
        engineRef.current.mixer.clear();
      }
      if (engineRef.current.playback) {
        engineRef.current.playback.cleanup();
      }
    };
  }, []);

  /**
   * Update tracks from mixer
   */
  const updateTracks = useCallback(() => {
    if (!engineRef.current.mixer) return;
    const tracks = engineRef.current.mixer.getTracks();
    setState(prev => ({ ...prev, tracks }));
  }, []);

  /**
   * Start metering loop for real-time level display
   */
  const startMeteringLoop = (mixer: Mixer) => {
    if (engineRef.current.meterInterval) {
      clearInterval(engineRef.current.meterInterval);
    }

    engineRef.current.meterInterval = window.setInterval(() => {
      const meterReading = mixer.getMeterReading();
      setState(prev => ({ ...prev, meterReading }));

      // Update track peak levels
      mixer.getTracks().forEach(track => {
        engineRef.current.metering.peaks.set(track.getId(), track.getPeakLevel());
      });
    }, 50) as any; // Update every 50ms
  };

  /**
   * Add a new track
   */
  const addTrack = useCallback((config: Partial<TrackConfig> = {}) => {
    if (!engineRef.current.mixer) return null;

    const trackId = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trackConfig: TrackConfig = {
      id: trackId,
      name: config.name || `Track ${engineRef.current.mixer.getTrackCount() + 1}`,
      color: config.color || '#00D9FF',
      ...config,
    };

    const track = new Track(trackConfig);
    engineRef.current.mixer.addTrack(track);
    engineRef.current.playback?.registerTrack(track);

    updateTracks();
    return track;
  }, [updateTracks]);

  /**
   * Remove a track
   */
  const removeTrack = useCallback((trackId: string) => {
    if (!engineRef.current.mixer) return;

    engineRef.current.mixer.removeTrack(trackId);
    engineRef.current.playback?.unregisterTrack(trackId);
    updateTracks();
  }, [updateTracks]);

  /**
   * Get track by ID
   */
  const getTrack = useCallback((trackId: string): Track | undefined => {
    if (!engineRef.current.mixer) return undefined;
    return engineRef.current.mixer.getTrack(trackId);
  }, []);

  /**
   * Start playback
   */
  const play = useCallback(() => {
    const audioCtx = AudioContextManager.getInstance();
    audioCtx.resume().catch(console.error);

    if (engineRef.current.playback) {
      engineRef.current.playback.play();
    }
  }, []);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (engineRef.current.playback) {
      engineRef.current.playback.pause();
    }
  }, []);

  /**
   * Stop playback and reset position
   */
  const stop = useCallback(() => {
    if (engineRef.current.playback) {
      engineRef.current.playback.stop();
    }
  }, []);

  /**
   * Seek to a specific time
   */
  const seek = useCallback((time: number) => {
    if (engineRef.current.playback) {
      engineRef.current.playback.seek(time);
    }
  }, []);

  /**
   * Set master volume
   */
  const setMasterVolume = useCallback((volume: number) => {
    if (engineRef.current.mixer) {
      engineRef.current.mixer.setMasterVolume(volume);
    }
  }, []);

  /**
   * Set BPM
   */
  const setBPM = useCallback((bpm: number) => {
    if (engineRef.current.playback) {
      engineRef.current.playback.setBPM(bpm);
      setState(prev => ({ ...prev, bpm }));
    }
  }, []);

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    const recorder = engineRef.current.recorder;
    if (!recorder) return;

    try {
      await recorder.initialize();
      recorder.startRecording();
      setState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  /**
   * Stop recording and return audio buffer
   */
  const stopRecording = useCallback(async () => {
    const recorder = engineRef.current.recorder;
    if (!recorder) return null;

    const audioBuffer = recorder.stopRecording();
    setState(prev => ({ ...prev, isRecording: false }));

    if (audioBuffer) {
      const blob = await recorder.exportAsWAV(audioBuffer);
      return { audioBuffer, blob };
    }

    return null;
  }, []);

  /**
   * Get peak level for a track
   */
  const getTrackPeakLevel = useCallback((trackId: string): number => {
    return engineRef.current.metering.peaks.get(trackId) || -Infinity;
  }, []);

  /**
   * Get all peak levels
   */
  const getAllPeakLevels = useCallback((): Map<string, number> => {
    return new Map(engineRef.current.metering.peaks);
  }, []);

  return {
    // State
    state,

    // Track management
    addTrack,
    removeTrack,
    getTrack,

    // Playback controls
    play,
    pause,
    stop,
    seek,

    // Mixer controls
    setMasterVolume,
    setBPM,

    // Recording
    startRecording,
    stopRecording,

    // Metering
    getTrackPeakLevel,
    getAllPeakLevels,

    // Raw access
    mixer: engineRef.current.mixer,
    playback: engineRef.current.playback,
    recorder: engineRef.current.recorder,
  };
}
