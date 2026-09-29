'use client';

/**
 * Suno AI Music Generator Store
 * Manages generation requests, history, and track management
 * Built with Zustand for optimal React integration and performance
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  GeneratedTrack,
  GenerationParams,
  GenerationMode,
  PersonaStyle,
  CustomVoice,
  Playlist,
} from '../types/aimusic';

/**
 * Suno Store State Interface
 */
export interface SunoStoreState {
  // Current generation state
  currentGeneration: {
    id: string | null;
    prompt: string;
    settings: Partial<GenerationParams>;
    status: 'idle' | 'queued' | 'generating' | 'complete' | 'error';
    progress: number; // 0-100
    estimatedTimeRemaining: number; // seconds
    error: string | null;
  };

  // Generation history
  generationHistory: GeneratedTrack[];
  historyFilter: {
    searchQuery: string;
    sortBy: 'recent' | 'popular' | 'genre' | 'mood';
    filterTags: string[];
  };

  // Selected track for preview/editing
  selectedTrack: GeneratedTrack | null;
  previewState: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  };

  // Library management
  favorites: string[]; // track IDs
  playlists: Playlist[];
  customVoices: CustomVoice[];
  personas: PersonaStyle[];

  // UI state
  activeTab: 'generate' | 'library' | 'voices' | 'personas' | 'playlists';
  expandedTrackId: string | null;

  // Actions
  submitGeneration: (params: GenerationParams) => Promise<void>;
  updateGenerationStatus: (
    status: SunoStoreState['currentGeneration']['status'],
    progress?: number
  ) => void;
  setGenerationProgress: (progress: number, estimatedTime?: number) => void;
  setGenerationError: (error: string | null) => void;
  completeGeneration: (track: GeneratedTrack) => void;

  addToHistory: (track: GeneratedTrack) => void;
  removeFromHistory: (trackId: string) => void;
  clearHistory: () => void;
  searchHistory: (query: string) => GeneratedTrack[];
  getHistoryByFilter: (filter: Partial<SunoStoreState['historyFilter']>) => GeneratedTrack[];

  setSelectedTrack: (track: GeneratedTrack | null) => void;
  playTrack: (track: GeneratedTrack) => void;
  pauseTrack: () => void;
  updatePlaybackTime: (time: number) => void;

  addToFavorites: (trackId: string) => void;
  removeFromFavorites: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;

  createPlaylist: (name: string, description: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  getPlaylistTracks: (playlistId: string) => GeneratedTrack[];

  addCustomVoice: (voice: CustomVoice) => void;
  removeCustomVoice: (voiceId: string) => void;
  getCustomVoice: (voiceId: string) => CustomVoice | undefined;

  addPersona: (persona: PersonaStyle) => void;
  removePersona: (personaId: string) => void;
  getPersona: (personaId: string) => PersonaStyle | undefined;
  getMostUsedPersonas: (limit?: number) => PersonaStyle[];

  setActiveTab: (tab: SunoStoreState['activeTab']) => void;
  setExpandedTrack: (trackId: string | null) => void;

  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  currentGeneration: {
    id: null,
    prompt: '',
    settings: {},
    status: 'idle' as const,
    progress: 0,
    estimatedTimeRemaining: 0,
    error: null,
  },
  generationHistory: [],
  historyFilter: {
    searchQuery: '',
    sortBy: 'recent' as const,
    filterTags: [],
  },
  selectedTrack: null,
  previewState: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  },
  favorites: [],
  playlists: [],
  customVoices: [],
  personas: [],
  activeTab: 'generate' as const,
  expandedTrackId: null,
};

/**
 * Suno Zustand Store
 */
export const useSunoStore = create<SunoStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Generation actions
        submitGeneration: async (params: GenerationParams) => {
          const id = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          set((state) => ({
            currentGeneration: {
              ...state.currentGeneration,
              id,
              settings: params,
              status: 'queued' as const,
              progress: 0,
              error: null,
            },
          }));

          // Simulate API call - replace with actual API in production
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            set((state) => ({
              currentGeneration: {
                ...state.currentGeneration,
                status: 'generating' as const,
              },
            }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Generation failed';
            set((state) => ({
              currentGeneration: {
                ...state.currentGeneration,
                status: 'error' as const,
                error: message,
              },
            }));
          }
        },

        updateGenerationStatus: (status, progress) => {
          set((state) => ({
            currentGeneration: {
              ...state.currentGeneration,
              status,
              progress: progress ?? state.currentGeneration.progress,
            },
          }));
        },

        setGenerationProgress: (progress, estimatedTime) => {
          set((state) => ({
            currentGeneration: {
              ...state.currentGeneration,
              progress: Math.min(progress, 100),
              estimatedTimeRemaining: estimatedTime ?? state.currentGeneration.estimatedTimeRemaining,
            },
          }));
        },

        setGenerationError: (error) => {
          set((state) => ({
            currentGeneration: {
              ...state.currentGeneration,
              error,
              status: error ? ('error' as const) : state.currentGeneration.status,
            },
          }));
        },

        completeGeneration: (track: GeneratedTrack) => {
          set((state) => ({
            currentGeneration: {
              ...state.currentGeneration,
              status: 'complete' as const,
              progress: 100,
            },
            generationHistory: [track, ...state.generationHistory],
            selectedTrack: track,
          }));
        },

        // History actions
        addToHistory: (track: GeneratedTrack) => {
          set((state) => {
            const exists = state.generationHistory.some((t) => t.id === track.id);
            if (exists) return state;
            return {
              generationHistory: [track, ...state.generationHistory],
            };
          });
        },

        removeFromHistory: (trackId: string) => {
          set((state) => ({
            generationHistory: state.generationHistory.filter((t) => t.id !== trackId),
            selectedTrack: state.selectedTrack?.id === trackId ? null : state.selectedTrack,
          }));
        },

        clearHistory: () => {
          set({
            generationHistory: [],
            selectedTrack: null,
            favorites: [],
          });
        },

        searchHistory: (query: string) => {
          const state = get();
          const lowerQuery = query.toLowerCase();
          return state.generationHistory.filter(
            (track) =>
              track.prompt?.toLowerCase().includes(lowerQuery) ||
              track.title?.toLowerCase().includes(lowerQuery) ||
              track.genre?.toLowerCase().includes(lowerQuery) ||
              track.mood?.toLowerCase().includes(lowerQuery) ||
              track.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
          );
        },

        getHistoryByFilter: (filter) => {
          const state = get();
          let results = [...state.generationHistory];

          if (filter.searchQuery) {
            const lowerQuery = filter.searchQuery.toLowerCase();
            results = results.filter(
              (track) =>
                track.prompt?.toLowerCase().includes(lowerQuery) ||
                track.title?.toLowerCase().includes(lowerQuery)
            );
          }

          if (filter.filterTags && filter.filterTags.length > 0) {
            results = results.filter((track) =>
              filter.filterTags.every((tag) => track.tags?.includes(tag))
            );
          }

          // Sort results
          if (filter.sortBy === 'recent') {
            results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          } else if (filter.sortBy === 'popular') {
            results.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
          } else if (filter.sortBy === 'genre') {
            results.sort((a, b) => a.genre.localeCompare(b.genre));
          } else if (filter.sortBy === 'mood') {
            results.sort((a, b) => a.mood.localeCompare(b.mood));
          }

          return results;
        },

        // Preview actions
        setSelectedTrack: (track) => {
          set({
            selectedTrack: track,
            previewState: {
              isPlaying: false,
              currentTime: 0,
              duration: track?.duration ?? 0,
            },
          });
        },

        playTrack: (track: GeneratedTrack) => {
          set({
            selectedTrack: track,
            previewState: {
              isPlaying: true,
              currentTime: 0,
              duration: track.duration,
            },
          });
        },

        pauseTrack: () => {
          set((state) => ({
            previewState: {
              ...state.previewState,
              isPlaying: false,
            },
          }));
        },

        updatePlaybackTime: (time: number) => {
          set((state) => ({
            previewState: {
              ...state.previewState,
              currentTime: time,
            },
          }));
        },

        // Favorites
        addToFavorites: (trackId: string) => {
          set((state) => {
            if (state.favorites.includes(trackId)) return state;
            return {
              favorites: [...state.favorites, trackId],
              generationHistory: state.generationHistory.map((track) =>
                track.id === trackId ? { ...track, isFavorite: true } : track
              ),
            };
          });
        },

        removeFromFavorites: (trackId: string) => {
          set((state) => ({
            favorites: state.favorites.filter((id) => id !== trackId),
            generationHistory: state.generationHistory.map((track) =>
              track.id === trackId ? { ...track, isFavorite: false } : track
            ),
          }));
        },

        isFavorite: (trackId: string) => {
          return get().favorites.includes(trackId);
        },

        // Playlists
        createPlaylist: (name: string, description: string): Playlist => {
          const newPlaylist: Playlist = {
            id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name,
            description,
            trackIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublic: false,
          };
          set((state) => ({
            playlists: [...state.playlists, newPlaylist],
          }));
          return newPlaylist;
        },

        deletePlaylist: (playlistId: string) => {
          set((state) => ({
            playlists: state.playlists.filter((p) => p.id !== playlistId),
          }));
        },

        addToPlaylist: (playlistId: string, trackId: string) => {
          set((state) => ({
            playlists: state.playlists.map((p) =>
              p.id === playlistId && !p.trackIds.includes(trackId)
                ? { ...p, trackIds: [...p.trackIds, trackId], updatedAt: new Date() }
                : p
            ),
          }));
        },

        removeFromPlaylist: (playlistId: string, trackId: string) => {
          set((state) => ({
            playlists: state.playlists.map((p) =>
              p.id === playlistId
                ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId), updatedAt: new Date() }
                : p
            ),
          }));
        },

        getPlaylistTracks: (playlistId: string) => {
          const state = get();
          const playlist = state.playlists.find((p) => p.id === playlistId);
          if (!playlist) return [];
          return state.generationHistory.filter((track) => playlist.trackIds.includes(track.id));
        },

        // Custom voices
        addCustomVoice: (voice: CustomVoice) => {
          set((state) => {
            const exists = state.customVoices.some((v) => v.id === voice.id);
            if (exists) return state;
            return {
              customVoices: [...state.customVoices, voice],
            };
          });
        },

        removeCustomVoice: (voiceId: string) => {
          set((state) => ({
            customVoices: state.customVoices.filter((v) => v.id !== voiceId),
          }));
        },

        getCustomVoice: (voiceId: string) => {
          return get().customVoices.find((v) => v.id === voiceId);
        },

        // Personas
        addPersona: (persona: PersonaStyle) => {
          set((state) => {
            const exists = state.personas.some((p) => p.id === persona.id);
            if (exists) return state;
            return {
              personas: [...state.personas, persona],
            };
          });
        },

        removePersona: (personaId: string) => {
          set((state) => ({
            personas: state.personas.filter((p) => p.id !== personaId),
          }));
        },

        getPersona: (personaId: string) => {
          return get().personas.find((p) => p.id === personaId);
        },

        getMostUsedPersonas: (limit = 5) => {
          const personas = get().personas;
          return personas
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit);
        },

        // UI actions
        setActiveTab: (tab) => {
          set({ activeTab: tab });
        },

        setExpandedTrack: (trackId) => {
          set({ expandedTrackId: trackId });
        },

        // Reset
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'suno-store',
        version: 1,
      }
    )
  )
);

/**
 * Selectors for optimized re-renders
 */
export const sunoSelectors = {
  // Generation
  selectCurrentGeneration: () =>
    useSunoStore((state) => state.currentGeneration),
  selectGenerationStatus: () =>
    useSunoStore((state) => state.currentGeneration.status),
  selectGenerationProgress: () =>
    useSunoStore((state) => state.currentGeneration.progress),

  // History
  selectHistory: () =>
    useSunoStore((state) => state.generationHistory),
  selectHistoryLength: () =>
    useSunoStore((state) => state.generationHistory.length),

  // Preview
  selectSelectedTrack: () =>
    useSunoStore((state) => state.selectedTrack),
  selectIsPlaying: () =>
    useSunoStore((state) => state.previewState.isPlaying),
  selectPlaybackTime: () =>
    useSunoStore((state) => state.previewState.currentTime),

  // Favorites
  selectFavorites: () =>
    useSunoStore((state) => state.favorites),
  selectFavoriteTracks: () =>
    useSunoStore((state) =>
      state.generationHistory.filter((t) => t.isFavorite)
    ),

  // Library
  selectPlaylists: () =>
    useSunoStore((state) => state.playlists),
  selectCustomVoices: () =>
    useSunoStore((state) => state.customVoices),
  selectPersonas: () =>
    useSunoStore((state) => state.personas),

  // UI
  selectActiveTab: () =>
    useSunoStore((state) => state.activeTab),
  selectExpandedTrackId: () =>
    useSunoStore((state) => state.expandedTrackId),
};
