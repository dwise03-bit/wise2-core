'use client';

/**
 * React hook for managing the audio engine lifecycle
 * Handles initialization, state management, UI synchronization, and error recovery
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
import { useErrorHandler } from './useErrorHandler';
import { useProjectPersistence } from './useProjectPersistence';
import type { SerializedProject } from '../utils/projectSerializer';
import { deserializeProjectState, serializeProjectState } from '../utils/projectSerializer';

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
  isError: boolean;
  errorMessage: string | null;
  projectId: string;
  projectName: string;
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
  isError: false,
  errorMessage: null,
  projectId: `project-${Date.now()}`,
  projectName: 'Untitled Project',
};

export function useAudioEngine() {
  const [state, setState] = useState<AudioEngineState>(initialState);
  const { addError, addWarning, addSuccess, wrapAsync } = useErrorHandler();
  const persistence = useProjectPersistence();

  const engineRef = useRef<{
    mixer: Mixer | null;
    playback: Playback | null;
    recorder: Recorder | null;
    meterInterval: number | null;
    metering: {
      peaks: Map<string, number>;
    };
    audioContextFailed: boolean;
  }>({
    mixer: null,
    playback: null,
    recorder: null,
    meterInterval: null,
    metering: {
      peaks: new Map(),
    },
    audioContextFailed: false,
  });

  /**
   * Update tracks from mixer (defined before effects so they can reference it)
   */
  const updateTracks = useCallback(() => {
    if (!engineRef.current.mixer) return;
    const tracks = engineRef.current.mixer.getTracks();
    setState(prev => ({ ...prev, tracks }));
  }, []);

  /**
   * Check if browser supports Web Audio API
   */
  const checkAudioApiSupport = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const audioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;

    if (!audioContext) {
      addError('audio-context-not-supported');
      engineRef.current.audioContextFailed = true;
      return false;
    }

    return true;
  }, [addError]);

  /**
   * Initialize audio engine on first mount
   */
  useEffect(() => {
    const initializeEngine = async () => {
      try {
        // Check for audio API support first
        if (!checkAudioApiSupport()) {
          setState(prev => ({
            ...prev,
            isError: true,
            errorMessage: 'Web Audio API not supported',
          }));
          return;
        }

        const audioCtx = AudioContextManager.getInstance();

        // Initialize context (requires user interaction)
        try {
          await audioCtx.initialize();
        } catch (initError) {
          throw new Error('Failed to initialize audio context');
        }

        // Create mixer and playback with error handling
        let mixer: Mixer;
        let playback: Playback;
        let recorder: Recorder;

        try {
          mixer = new Mixer();
          playback = new Playback({ bpm: 120 });
          recorder = new Recorder();
        } catch (createError) {
          throw new Error('Failed to create audio engine components');
        }

        engineRef.current.mixer = mixer;
        engineRef.current.playback = playback;
        engineRef.current.recorder = recorder;

        // Setup playback event listeners with error handling
        const handlePlaybackError = (error: Error) => {
          console.error('Playback error:', error);
          addError('playback-failed');
          setState(prev => ({ ...prev, isPlaying: false }));
        };

        try {
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

          playback.on('masterVolumeChanged', (volume: number) => {
            setState(prev => ({ ...prev, masterVolume: volume }));
          });

          playback.on('error', handlePlaybackError);
        } catch (listenerError) {
          console.error('Failed to setup playback listeners:', listenerError);
        }

        // Start metering loop
        startMeteringLoop(mixer);

        setState(prev => ({
          ...prev,
          isInitialized: true,
          mixer,
          playback,
          recorder,
          isError: false,
          errorMessage: null,
        }));

        addSuccess('Audio Engine Initialized', 'Ready to record and play audio');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to initialize audio engine';

        console.error('Audio engine initialization failed:', error);

        addError('audio-context-initialization-failed', errorMessage, {
          timeout: 0, // Keep error visible until dismissed
          dismissible: true,
        });

        setState(prev => ({
          ...prev,
          isError: true,
          errorMessage: errorMessage,
          isInitialized: false,
        }));
      }
    };

    // Require user interaction before initializing
    const handleUserInteraction = async () => {
      if (!state.isInitialized && !engineRef.current.audioContextFailed) {
        await initializeEngine();
        document.removeEventListener('click', handleUserInteraction);
      }
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [state.isInitialized, checkAudioApiSupport, addError, addSuccess]);

  /**
   * Setup mixer event listeners (separate effect to capture updateTracks correctly)
   */
  useEffect(() => {
    if (!engineRef.current.mixer) return;

    const mixer = engineRef.current.mixer;

    // Create properly-scoped event handlers
    const handleTrackAdded = () => updateTracks();
    const handleTrackRemoved = () => updateTracks();

    // Attach listeners
    mixer.on('trackAdded', handleTrackAdded);
    mixer.on('trackRemoved', handleTrackRemoved);

    // Cleanup listeners on unmount or when updateTracks changes
    return () => {
      mixer.off('trackAdded', handleTrackAdded);
      mixer.off('trackRemoved', handleTrackRemoved);
    };
  }, [updateTracks]);

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
   * Add a new track with error handling
   */
  const addTrack = useCallback((config: Partial<TrackConfig> = {}) => {
    try {
      if (!engineRef.current.mixer) {
        addError('track-add-failed', 'Audio mixer not initialized. Please wait a moment and try again.');
        return null;
      }

      const trackId = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const trackConfig: TrackConfig = {
        id: trackId,
        name: config.name || `Track ${engineRef.current.mixer.getTrackCount() + 1}`,
        color: config.color || '#00D9FF',
        ...config,
      };

      try {
        const track = new Track(trackConfig);
        engineRef.current.mixer.addTrack(track);
        engineRef.current.playback?.registerTrack(track);

        updateTracks();
        addSuccess('Track Added', `New track "${trackConfig.name}" created successfully`);
        return track;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addError('track-add-failed', `Could not create track: ${errorMsg}`);
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addError('track-add-failed', errorMsg);
      return null;
    }
  }, [updateTracks, addError, addSuccess]);

  /**
   * Remove a track with error handling
   */
  const removeTrack = useCallback((trackId: string) => {
    try {
      if (!engineRef.current.mixer) {
        addError('track-remove-failed', 'Audio mixer not initialized');
        return;
      }

      const track = engineRef.current.mixer.getTrack(trackId);
      if (!track) {
        addError('track-not-found', `Track "${trackId}" not found`);
        return;
      }

      try {
        engineRef.current.mixer.removeTrack(trackId);
        engineRef.current.playback?.unregisterTrack(trackId);
        updateTracks();
        addSuccess('Track Removed', `Track "${track.getName()}" deleted`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addError('track-remove-failed', errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addError('track-remove-failed', errorMsg);
    }
  }, [updateTracks, addError, addSuccess]);

  /**
   * Get track by ID
   */
  const getTrack = useCallback((trackId: string): Track | undefined => {
    if (!engineRef.current.mixer) return undefined;
    return engineRef.current.mixer.getTrack(trackId);
  }, []);

  /**
   * Start playback with error handling
   */
  const play = useCallback(() => {
    try {
      const audioCtx = AudioContextManager.getInstance();

      if (!audioCtx) {
        addError('playback-not-initialized', 'Audio context not available');
        return;
      }

      try {
        audioCtx.resume().catch(resumeError => {
          console.error('Failed to resume audio context:', resumeError);
          addWarning('Audio Context', 'Audio context could not be resumed. Retrying...');
        });
      } catch (resumeError) {
        console.error('Resume error:', resumeError);
      }

      if (!engineRef.current.playback) {
        addError('playback-not-initialized', 'Playback engine not initialized');
        return;
      }

      try {
        engineRef.current.playback.play();
      } catch (playError) {
        const errorMsg = playError instanceof Error ? playError.message : 'Playback failed';
        addError('playback-failed', errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Playback error';
      addError('playback-failed', errorMsg);
    }
  }, [addError, addWarning]);

  /**
   * Pause playback with error handling
   */
  const pause = useCallback(() => {
    try {
      if (!engineRef.current.playback) {
        addError('playback-not-initialized');
        return;
      }

      engineRef.current.playback.pause();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Pause failed';
      addError('playback-failed', errorMsg);
    }
  }, [addError]);

  /**
   * Stop playback and reset position with error handling
   */
  const stop = useCallback(() => {
    try {
      if (!engineRef.current.playback) {
        addError('playback-not-initialized');
        return;
      }

      engineRef.current.playback.stop();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Stop failed';
      addError('playback-failed', errorMsg);
    }
  }, [addError]);

  /**
   * Seek to a specific time with error handling
   */
  const seek = useCallback((time: number) => {
    try {
      if (!engineRef.current.playback) {
        addError('playback-not-initialized');
        return;
      }

      if (typeof time !== 'number' || time < 0) {
        addWarning('Invalid Seek Time', 'Time must be a positive number');
        return;
      }

      engineRef.current.playback.seek(time);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Seek failed';
      addError('playback-failed', errorMsg);
    }
  }, [addError, addWarning]);

  /**
   * Set master volume with validation and error handling
   */
  const setMasterVolume = useCallback((volume: number) => {
    try {
      // Validate volume range
      if (typeof volume !== 'number' || volume < 0 || volume > 1) {
        addWarning('Invalid Volume', 'Volume must be between 0 and 1');
        return;
      }

      if (!engineRef.current.mixer) {
        addError('track-add-failed', 'Mixer not initialized');
        return;
      }

      try {
        engineRef.current.mixer.setMasterVolume(volume);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to set volume';
        addError('track-add-failed', errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Volume control error';
      addError('track-add-failed', errorMsg);
    }
  }, [addError, addWarning]);

  /**
   * Set BPM with validation and error handling
   */
  const setBPM = useCallback((bpm: number) => {
    try {
      // Validate BPM range
      if (typeof bpm !== 'number' || bpm < 20 || bpm > 300) {
        addWarning('Invalid BPM', 'BPM must be between 20 and 300');
        return;
      }

      if (!engineRef.current.playback) {
        addError('playback-not-initialized', 'Playback engine not initialized');
        return;
      }

      try {
        engineRef.current.playback.setBPM(bpm);
        setState(prev => ({ ...prev, bpm }));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to set BPM';
        addError('playback-failed', errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'BPM control error';
      addError('playback-failed', errorMsg);
    }
  }, [addError, addWarning]);

  /**
   * Start recording with comprehensive error handling
   */
  const startRecording = useCallback(async () => {
    try {
      const recorder = engineRef.current.recorder;

      if (!recorder) {
        addError('recording-failed', 'Recorder not initialized. Please wait and try again.');
        return;
      }

      if (state.isRecording) {
        addError('recording-already-active');
        return;
      }

      try {
        // Request microphone permission
        await recorder.initialize();
      } catch (initError) {
        const errorMsg = initError instanceof Error ? initError.message : '';

        if (errorMsg.includes('permission') || errorMsg.includes('NotAllowedError')) {
          addError('recording-permission-denied', 'Microphone access was denied. Check your browser settings.');
        } else {
          addError('recording-failed', `Recorder initialization failed: ${errorMsg}`);
        }
        return;
      }

      try {
        recorder.startRecording();
        setState(prev => ({ ...prev, isRecording: true }));
        addSuccess('Recording Started', 'Audio recording is now active');
      } catch (startError) {
        const errorMsg = startError instanceof Error ? startError.message : 'Unknown error';
        addError('recording-failed', `Failed to start recording: ${errorMsg}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Recording error';
      console.error('Recording startup error:', error);
      addError('recording-failed', errorMsg);
    }
  }, [state.isRecording, addError, addSuccess]);

  /**
   * Stop recording and return audio buffer with error handling
   */
  const stopRecording = useCallback(async () => {
    try {
      const recorder = engineRef.current.recorder;

      if (!recorder) {
        addError('recording-failed', 'Recorder not initialized');
        return null;
      }

      if (!state.isRecording) {
        addWarning('Not Recording', 'No active recording to stop');
        return null;
      }

      let audioBuffer: AudioBuffer | null = null;

      try {
        audioBuffer = recorder.stopRecording();
      } catch (stopError) {
        const errorMsg = stopError instanceof Error ? stopError.message : 'Unknown error';
        addError('recording-stopped-unexpectedly', errorMsg);
        setState(prev => ({ ...prev, isRecording: false }));
        return null;
      }

      setState(prev => ({ ...prev, isRecording: false }));

      if (!audioBuffer) {
        addWarning('Empty Recording', 'No audio data was captured');
        return null;
      }

      // Validate buffer
      if (audioBuffer.length === 0) {
        addWarning('Empty Recording', 'The recording contains no audio data');
        return null;
      }

      try {
        const blob = await recorder.exportAsWAV(audioBuffer);

        // Validate blob
        if (!blob || blob.size === 0) {
          addError('recording-failed', 'Failed to export audio: empty result');
          return null;
        }

        // Check file size (500MB limit)
        const maxSize = 500 * 1024 * 1024; // 500MB in bytes
        if (blob.size > maxSize) {
          addError('file-too-large', `Recording is ${(blob.size / (1024 * 1024)).toFixed(2)}MB. Max is 500MB.`);
          return null;
        }

        addSuccess('Recording Saved', `Audio exported successfully (${(blob.size / 1024).toFixed(2)}KB)`);
        return { audioBuffer, blob };
      } catch (exportError) {
        const errorMsg = exportError instanceof Error ? exportError.message : 'Export failed';
        addError('recording-failed', `Failed to export audio: ${errorMsg}`);
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Recording error';
      console.error('Recording stop error:', error);
      setState(prev => ({ ...prev, isRecording: false }));
      addError('recording-failed', errorMsg);
      return null;
    }
  }, [state.isRecording, addError, addWarning, addSuccess]);

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

  /**
   * Save project to localStorage
   */
  const saveProject = useCallback(async () => {
    if (!engineRef.current.mixer) {
      addError('track-add-failed', 'Mixer not initialized');
      return false;
    }

    const project = serializeProjectState(
      state.projectId,
      state.projectName,
      state.tracks,
      state.bpm,
      state.masterVolume
    );

    const success = await persistence.saveProject(project);
    if (success) {
      addSuccess('Project Saved', `"${state.projectName}" saved`);
    } else {
      addError('file-invalid-format', persistence.saveError || 'Failed to save');
    }
    return success;
  }, [state.projectId, state.projectName, state.tracks, state.bpm, state.masterVolume, persistence, addError, addSuccess]);

  /**
   * Load project from localStorage
   */
  const loadProject = useCallback((projectId: string) => {
    const serialized = persistence.loadProject(projectId);
    if (!serialized) {
      addError('file-invalid-format', 'Project not found');
      return false;
    }

    setState((prev) => ({
      ...prev,
      projectId: serialized.id,
      projectName: serialized.name,
      bpm: serialized.bpm,
      masterVolume: serialized.masterVolume,
    }));

    addSuccess('Project Loaded', `"${serialized.name}" loaded`);
    return true;
  }, [persistence, addError, addSuccess]);

  /**
   * Create new project
   */
  const createNewProject = useCallback((projectName: string = 'Untitled Project') => {
    try {
      const projectId = `project-${Date.now()}`;

      // Clear existing tracks
      if (engineRef.current.mixer) {
        const currentTracks = engineRef.current.mixer.getTracks();
        currentTracks.forEach((track) => {
          engineRef.current.mixer?.removeTrack(track.getId());
        });
      }

      // Reset state
      setState((prev) => ({
        ...initialState,
        projectId,
        projectName,
        isInitialized: prev.isInitialized,
        mixer: prev.mixer,
        playback: prev.playback,
        recorder: prev.recorder,
      }));

      addSuccess('New Project', `"${projectName}" has been created.`);
      return projectId;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addError('track-add-failed', `Failed to create project: ${errorMsg}`);
      console.error('Error creating project:', error);
      return null;
    }
  }, [addError, addSuccess]);

  /**
   * Rename current project
   */
  const renameProject = useCallback((newName: string) => {
    if (!newName.trim()) {
      addError('track-add-failed', 'Project name cannot be empty.');
      return false;
    }

    setState((prev) => ({
      ...prev,
      projectName: newName.trim(),
    }));

    addSuccess('Project Renamed', `Project renamed to "${newName.trim()}".`);
    return true;
  }, [addError, addSuccess]);

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

    // Error state
    isError: state.isError,
    errorMessage: state.errorMessage,

    // Project persistence
    saveProject,
    loadProject,
    createNewProject,
    renameProject,
    projectPersistence: persistence,

    // Raw access
    mixer: engineRef.current.mixer,
    playback: engineRef.current.playback,
    recorder: engineRef.current.recorder,
  };
}
