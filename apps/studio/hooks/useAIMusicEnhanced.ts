'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AIGeneratorState,
  CustomVoice,
  CustomModel,
  ExportOptions,
  GeneratedTrack,
  GenerationMode,
  GenerationParams,
  LyricLine,
  MusicLibrary,
  MultitrackTimeline,
  PersonaStyle,
  SoundType,
  StemTrack,
  UserTaste,
  VoiceRecordingSession,
  TimelineTrack,
  Mashup,
  LyricsEditorState,
  TempoRamp,
  TimeSignature,
} from '../types/aimusic';

const GENRES = [
  'Electronic',
  'Hip-Hop',
  'Pop',
  'Rock',
  'Jazz',
  'Classical',
  'Ambient',
  'Lofi',
  'Synthwave',
  'Indie',
  'Experimental',
  'R&B',
];

const MOODS = [
  'Happy',
  'Sad',
  'Energetic',
  'Calm',
  'Mysterious',
  'Aggressive',
  'Dreamy',
  'Melancholic',
  'Uplifting',
  'Dark',
];

const INSTRUMENTS = [
  'Piano',
  'Guitar',
  'Drums',
  'Synth',
  'Strings',
  'Brass',
  'Bass',
  'Flute',
  'Violin',
  'Cello',
];

const SOUND_TYPES: SoundType[] = ['foley', 'percussion', 'synth', 'ambience', 'vocal'];

const DEFAULT_USER_TASTE: UserTaste = {
  favoriteGenres: ['Electronic', 'Ambient'],
  favoriteMoods: ['Calm', 'Dreamy'],
  preferredTempoRange: [80, 140],
  preferredDuration: 60,
  favoriteInstruments: ['Synth', 'Piano'],
  generationHistory: [],
  magicWandEnabled: true,
};

const INITIAL_STATE: AIGeneratorState = {
  library: {
    tracks: [],
    personas: [],
    customVoices: [],
    customModels: [],
    favorites: [],
    playlists: [],
  },
  currentGenerationMode: 'text-to-song',
  currentGeneration: null,
  generatingTracks: new Map(),
  isGenerating: false,
  activeTab: 'generate',
  userTaste: DEFAULT_USER_TASTE,
  voiceRecordingSession: null,
  currentTimeline: null,
  currentLyricsEditor: null,
  error: null,
};

export const useAIMusicEnhanced = () => {
  const [state, setState] = useState<AIGeneratorState>(INITIAL_STATE);
  const generationIntervalRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load persisted library from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wise2-music-library');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, library: parsed }));
      } catch {
        console.error('Failed to load saved library');
      }
    }
  }, []);

  // Persist library to localStorage
  useEffect(() => {
    localStorage.setItem('wise2-music-library', JSON.stringify(state.library));
  }, [state.library]);

  // Generate waveform data
  const generateWaveformData = useCallback((): number[] => {
    const data: number[] = [];
    for (let i = 0; i < 256; i++) {
      data.push(Math.random() * 100 - 50);
    }
    return data;
  }, []);

  // Generate stems
  const generateStems = useCallback((): StemTrack[] => {
    const stemNames: StemTrack['name'][] = ['vocals', 'drums', 'bass', 'synths'];
    return stemNames.map((name) => ({
      id: `stem-${name}-${Date.now()}`,
      name,
      waveformData: generateWaveformData(),
      volume: 1,
      pan: 0,
      isDry: false,
    }));
  }, [generateWaveformData]);

  // Main generation logic
  const generateMusic = useCallback(
    async (params: GenerationParams): Promise<GeneratedTrack | null> => {
      if (state.isGenerating) {
        setState((prev) => ({ ...prev, error: 'Already generating. Please wait.' }));
        return null;
      }

      try {
        setState((prev) => ({ ...prev, error: null }));

        const trackId = `track-${Date.now()}`;
        const estimatedTime = 30 + Math.random() * 30;

        const newTrack: GeneratedTrack = {
          id: trackId,
          type: params.mode === 'sounds' ? 'sound' : 'song',
          genre: 'genre' in params ? params.genre : 'Electronic',
          mood: 'mood' in params ? params.mood : 'Happy',
          tempo: 'tempo' in params ? params.tempo : 120,
          duration: 'duration' in params ? params.duration : 60,
          instruments: 'instruments' in params ? params.instruments : [],
          prompt: 'description' in params ? params.description : params.prompt,
          createdAt: new Date(),
          modifiedAt: new Date(),
          status: 'generating',
          progress: 0,
          estimatedTime,
          isFavorite: false,
          tags: [],
          waveformData: [],
          stems: [],
          lyricLine: [],
        };

        setState((prev) => ({
          ...prev,
          isGenerating: true,
          currentGeneration: newTrack,
          generatingTracks: new Map(prev.generatingTracks).set(trackId, newTrack),
          library: {
            ...prev.library,
            tracks: [newTrack, ...prev.library.tracks],
          },
        }));

        // Simulate generation progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;

          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            generationIntervalRef.current.delete(trackId);

            // Mark as complete with stems
            setState((prev) => ({
              ...prev,
              library: {
                ...prev.library,
                tracks: prev.library.tracks.map((t) =>
                  t.id === trackId
                    ? {
                        ...t,
                        status: 'complete' as const,
                        progress: 100,
                        waveformData: generateWaveformData(),
                        stems: generateStems(),
                        url: `data:audio/wav;base64,${Math.random().toString(36).slice(2)}`,
                      }
                    : t
                ),
              },
              isGenerating: false,
              currentGeneration: null,
              generatingTracks: new Map(
                Array.from(prev.generatingTracks).filter(([id]) => id !== trackId)
              ),
            }));
          } else {
            setState((prev) => ({
              ...prev,
              library: {
                ...prev.library,
                tracks: prev.library.tracks.map((t) =>
                  t.id === trackId
                    ? { ...t, progress: Math.min(progress, 99) }
                    : t
                ),
              },
              currentGeneration:
                prev.currentGeneration?.id === trackId
                  ? { ...prev.currentGeneration, progress: Math.min(progress, 99) }
                  : prev.currentGeneration,
            }));
          }
        }, 500);

        generationIntervalRef.current.set(trackId, interval);
        return newTrack;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate music';
        setState((prev) => ({
          ...prev,
          error: errorMsg,
          isGenerating: false,
          currentGeneration: null,
        }));
        return null;
      }
    },
    [state.isGenerating, generateWaveformData, generateStems]
  );

  // Voice recording
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const sessionId = `recording-${Date.now()}`;

      setState((prev) => ({
        ...prev,
        voiceRecordingSession: {
          id: sessionId,
          startTime: new Date(),
          duration: 0,
          waveformData: [],
          isRecording: true,
        },
      }));

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: 'Microphone access denied',
      }));
    }
  }, []);

  const stopVoiceRecording = useCallback(async (): Promise<CustomVoice | null> => {
    if (!mediaRecorderRef.current || !state.voiceRecordingSession) return null;

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newVoice: CustomVoice = {
          id: `voice-${Date.now()}`,
          name: `Voice ${state.library.customVoices.length + 1}`,
          type: 'recorded',
          description: `Recorded voice ${new Date().toLocaleString()}`,
          sampleUrl: audioUrl,
          createdAt: new Date(),
          isActive: false,
        };

        setState((prev) => ({
          ...prev,
          library: {
            ...prev.library,
            customVoices: [...prev.library.customVoices, newVoice],
          },
          voiceRecordingSession: null,
        }));

        resolve(newVoice);
      };

      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    });
  }, [state.voiceRecordingSession, state.library.customVoices]);

  // Custom model training
  const trainCustomModel = useCallback(
    (referenceTrackId: string, name: string): CustomModel => {
      const newModel: CustomModel = {
        id: `model-${Date.now()}`,
        name,
        referenceTrackId,
        description: `Trained model based on ${referenceTrackId}`,
        trainingProgress: 0,
        status: 'training',
        createdAt: new Date(),
        characteristics: [],
      };

      setState((prev) => ({
        ...prev,
        library: {
          ...prev.library,
          customModels: [...prev.library.customModels, newModel],
        },
      }));

      // Simulate training progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          setState((prev) => ({
            ...prev,
            library: {
              ...prev.library,
              customModels: prev.library.customModels.map((m) =>
                m.id === newModel.id
                  ? {
                      ...m,
                      trainingProgress: 100,
                      status: 'ready' as const,
                      characteristics: ['deep', 'atmospheric', 'emotional'],
                    }
                  : m
              ),
            },
          }));
        } else {
          setState((prev) => ({
            ...prev,
            library: {
              ...prev.library,
              customModels: prev.library.customModels.map((m) =>
                m.id === newModel.id ? { ...m, trainingProgress: progress } : m
              ),
            },
          }));
        }
      }, 1000);

      return newModel;
    },
    []
  );

  // Stem extraction (simulate)
  const extractStems = useCallback(
    (trackId: string): StemTrack[] => {
      const track = state.library.tracks.find((t) => t.id === trackId);
      if (!track) return [];

      const stems: StemTrack[] = [
        { id: 'vocals', name: 'vocals', volume: 1, pan: 0, isDry: false, waveformData: generateWaveformData() },
        { id: 'drums', name: 'drums', volume: 1, pan: 0, isDry: false, waveformData: generateWaveformData() },
        { id: 'bass', name: 'bass', volume: 1, pan: 0, isDry: false, waveformData: generateWaveformData() },
        { id: 'synths', name: 'synths', volume: 1, pan: 0, isDry: false, waveformData: generateWaveformData() },
      ];

      setState((prev) => ({
        ...prev,
        library: {
          ...prev.library,
          tracks: prev.library.tracks.map((t) =>
            t.id === trackId ? { ...t, stems } : t
          ),
        },
      }));

      return stems;
    },
    [state.library.tracks, generateWaveformData]
  );

  // Mashup creation
  const createMashup = useCallback(
    (track1Id: string, track2Id: string, mixRatio: number = 50): Mashup => {
      const mashup: Mashup = {
        id: `mashup-${Date.now()}`,
        name: `Mashup - ${track1Id} & ${track2Id}`,
        track1Id,
        track2Id,
        mixRatio,
        createdAt: new Date(),
      };

      // Simulate mashup generation
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          library: {
            ...prev.library,
            tracks: prev.library.tracks.map((t) =>
              t.id === track1Id
                ? {
                    ...t,
                    url: `data:audio/wav;base64,${Math.random().toString(36).slice(2)}`,
                    waveformData: generateWaveformData(),
                  }
                : t
            ),
          },
        }));
      }, 3000);

      return mashup;
    },
    [generateWaveformData]
  );

  // Lyrics editing
  const updateLyrics = useCallback(
    (trackId: string, lyrics: string): void => {
      const lines: LyricLine[] = lyrics.split('\n').map((text, idx) => ({
        id: `line-${idx}`,
        text,
        startTime: idx * 5,
        endTime: (idx + 1) * 5,
        emotion: 'neutral',
      }));

      setState((prev) => ({
        ...prev,
        library: {
          ...prev.library,
          tracks: prev.library.tracks.map((t) =>
            t.id === trackId ? { ...t, lyrics, lyricLine: lines } : t
          ),
        },
        currentLyricsEditor: {
          lyrics,
          lines,
        },
      }));
    },
    []
  );

  // Timeline management
  const createTimeline = useCallback(
    (bpm: number = 120, timeSignature: TimeSignature = '4/4'): MultitrackTimeline => {
      const timeline: MultitrackTimeline = {
        id: `timeline-${Date.now()}`,
        name: 'Untitled Arrangement',
        bpm,
        timeSignature,
        tracks: [
          {
            id: 'track-1',
            name: 'Track 1',
            clips: [],
            volume: 1,
            pan: 0,
            isMuted: false,
            isSoloed: false,
            color: '#00ff41',
          },
        ],
        quantizeGrid: '1/8',
      };

      setState((prev) => ({
        ...prev,
        currentTimeline: timeline,
      }));

      return timeline;
    },
    []
  );

  // Favorite track
  const toggleFavorite = useCallback((trackId: string): void => {
    setState((prev) => ({
      ...prev,
      library: {
        ...prev.library,
        tracks: prev.library.tracks.map((t) =>
          t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t
        ),
        favorites: prev.library.favorites.includes(trackId)
          ? prev.library.favorites.filter((id) => id !== trackId)
          : [...prev.library.favorites, trackId],
      },
    }));
  }, []);

  // Delete track
  const deleteTrack = useCallback((trackId: string): void => {
    setState((prev) => ({
      ...prev,
      library: {
        ...prev.library,
        tracks: prev.library.tracks.filter((t) => t.id !== trackId),
        favorites: prev.library.favorites.filter((id) => id !== trackId),
      },
      generatingTracks: new Map(
        Array.from(prev.generatingTracks).filter(([id]) => id !== trackId)
      ),
    }));
  }, []);

  // Download track
  const downloadTrack = useCallback(
    (trackId: string, options: ExportOptions): void => {
      const track = state.library.tracks.find((t) => t.id === trackId);
      if (track && track.url) {
        const a = document.createElement('a');
        a.href = track.url;
        const ext = options.format === 'wav' ? 'wav' : options.format;
        a.download = `${track.genre}-${track.mood}-${trackId}.${ext}`;
        a.click();
      }
    },
    [state.library.tracks]
  );

  // Create persona
  const createPersona = useCallback(
    (name: string, trackIds: string[], description: string): PersonaStyle => {
      const persona: PersonaStyle = {
        id: `persona-${Date.now()}`,
        name,
        description,
        tags: ['custom'],
        referenceTrackIds: trackIds,
        genrePreference: 'Electronic',
        moodPreference: 'Calm',
        instrumentPreferences: INSTRUMENTS.slice(0, 3),
        tempoRange: [80, 140],
        characteristics: ['unique', 'personalized'],
        createdAt: new Date(),
        usageCount: 0,
      };

      setState((prev) => ({
        ...prev,
        library: {
          ...prev.library,
          personas: [...prev.library.personas, persona],
        },
      }));

      return persona;
    },
    []
  );

  // Apply persona to generation
  const applyPersona = useCallback(
    (personaId: string, params: Partial<GenerationParams>): void => {
      const persona = state.library.personas.find((p) => p.id === personaId);
      if (!persona) return;

      // This would typically enhance the generation params with persona characteristics
      setState((prev) => ({
        ...prev,
        library: {
          ...prev.library,
          personas: prev.library.personas.map((p) =>
            p.id === personaId ? { ...p, usageCount: p.usageCount + 1 } : p
          ),
        },
      }));
    },
    [state.library.personas]
  );

  // Magic wand (apply user taste)
  const applyMagicWand = useCallback(
    (baseParams: Partial<GenerationParams>): Partial<GenerationParams> => {
      const taste = state.userTaste;
      return {
        ...baseParams,
        genre: taste.favoriteGenres[0],
        mood: taste.favoriteMoods[0],
        tempo: (taste.preferredTempoRange[0] + taste.preferredTempoRange[1]) / 2,
        instruments: taste.favoriteInstruments,
      } as Partial<GenerationParams>;
    },
    [state.userTaste]
  );

  // Search and filter
  const searchTracks = useCallback(
    (query: string): GeneratedTrack[] => {
      const lowerQuery = query.toLowerCase();
      return state.library.tracks.filter(
        (t) =>
          t.prompt.toLowerCase().includes(lowerQuery) ||
          t.genre.toLowerCase().includes(lowerQuery) ||
          t.mood.toLowerCase().includes(lowerQuery) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    },
    [state.library.tracks]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      generationIntervalRef.current.forEach((interval) => clearInterval(interval));
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    // State
    state,
    library: state.library,
    currentGeneration: state.currentGeneration,
    isGenerating: state.isGenerating,
    error: state.error,
    activeTab: state.activeTab,
    userTaste: state.userTaste,
    voiceRecordingSession: state.voiceRecordingSession,
    currentTimeline: state.currentTimeline,
    currentLyricsEditor: state.currentLyricsEditor,

    // Generation
    generateMusic,
    generateWaveformData,
    generateStems,

    // Voice
    startVoiceRecording,
    stopVoiceRecording,

    // Models
    trainCustomModel,

    // Stems
    extractStems,

    // Mashup
    createMashup,

    // Lyrics
    updateLyrics,

    // Timeline
    createTimeline,

    // Library
    toggleFavorite,
    deleteTrack,
    downloadTrack,
    searchTracks,

    // Personas
    createPersona,
    applyPersona,
    applyMagicWand,

    // Tab management
    setActiveTab: (tab: AIGeneratorState['activeTab']) => {
      setState((prev) => ({ ...prev, activeTab: tab }));
    },

    // Constants
    genres: GENRES,
    moods: MOODS,
    instruments: INSTRUMENTS,
    soundTypes: SOUND_TYPES,
  };
};

export type UseAIMusicEnhancedReturn = ReturnType<typeof useAIMusicEnhanced>;
