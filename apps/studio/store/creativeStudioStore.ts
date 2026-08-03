'use client';

/**
 * Creative Studio Master Store
 * Integrates Suno (AI music) and OBS (streaming) stores
 * Provides cross-module communication and unified state management
 */

import { useEffect } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useSunoStore, type SunoStoreState } from './sunoStore';
import { useObsStore, type ObsStoreState } from './obsStore';

/**
 * Creative Studio Store State
 */
export interface CreativeStudioStoreState {
  // Module states
  sunoState: Partial<SunoStoreState>;
  obsState: Partial<ObsStoreState>;

  // Cross-module state
  activeModule: 'suno' | 'obs' | 'collaboration' | 'export';
  workflowMode: 'standalone' | 'stream-integration' | 'content-creation' | 'live-performance';

  // Linked tracks (for stream integration)
  linkedTracks: {
    sunoTrackId: string;
    obsSceneId: string;
    autoPlayOnSceneSwitch: boolean;
    syncedWith: string[]; // other linked track IDs
  }[];

  // Project state
  currentProject: {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    sunoTracksCount: number;
    streamSessionsCount: number;
  } | null;

  // UI state
  isPreviewMode: boolean;
  showTimeline: boolean;
  timelineMode: 'tracks' | 'scenes' | 'unified';
  selectedPanel: 'inspector' | 'library' | 'properties' | 'history';

  // Module integration actions
  linkTrackToScene: (sunoTrackId: string, obsSceneId: string) => void;
  unlinkTrackFromScene: (linkId: string) => void;
  autoPlayTrackOnSceneSwitch: (linkId: string, enabled: boolean) => void;

  // Workflow actions
  setActiveModule: (module: CreativeStudioStoreState['activeModule']) => void;
  setWorkflowMode: (mode: CreativeStudioStoreState['workflowMode']) => void;
  switchToModule: (module: 'suno' | 'obs') => void;

  // Project actions
  createProject: (name: string, description?: string) => void;
  updateProject: (updates: Partial<CreativeStudioStoreState['currentProject']>) => void;
  deleteProject: () => void;
  loadProject: (projectId: string) => void;

  // UI actions
  setPreviewMode: (enabled: boolean) => void;
  showTimelinePanel: (show: boolean) => void;
  setTimelineMode: (mode: 'tracks' | 'scenes' | 'unified') => void;
  selectPanel: (panel: 'inspector' | 'library' | 'properties' | 'history') => void;

  // Cross-module sync
  syncSunoToObs: (sunoTrackId: string, obsSceneId: string) => Promise<void>;
  exportProject: (format: 'json' | 'mp4' | 'stems') => Promise<void>;

  // State queries
  getLinkedTrackBySceneId: (sceneId: string) => (CreativeStudioStoreState['linkedTracks'][0]) | undefined;
  getLinkedSceneByTrackId: (trackId: string) => string | undefined;
  canPlayTrackInScene: (trackId: string, sceneId: string) => boolean;

  // Sync state from sub-stores
  syncFromSubStores: () => void;

  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  sunoState: {},
  obsState: {},
  activeModule: 'suno' as const,
  workflowMode: 'standalone' as const,
  linkedTracks: [],
  currentProject: null,
  isPreviewMode: false,
  showTimeline: true,
  timelineMode: 'unified' as const,
  selectedPanel: 'library' as const,
};

/**
 * Creative Studio Zustand Store
 */
export const useCreativeStudioStore = create<CreativeStudioStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Module integration actions
        linkTrackToScene: (sunoTrackId: string, obsSceneId: string) => {
          set((state) => ({
            linkedTracks: [
              ...state.linkedTracks,
              {
                sunoTrackId,
                obsSceneId,
                autoPlayOnSceneSwitch: false,
                syncedWith: [],
              },
            ],
          }));
        },

        unlinkTrackFromScene: (linkId: string) => {
          set((state) => ({
            linkedTracks: state.linkedTracks.filter((_, idx) => idx.toString() !== linkId),
          }));
        },

        autoPlayTrackOnSceneSwitch: (linkId: string, enabled: boolean) => {
          set((state) => ({
            linkedTracks: state.linkedTracks.map((link, idx) =>
              idx.toString() === linkId ? { ...link, autoPlayOnSceneSwitch: enabled } : link
            ),
          }));
        },

        // Workflow actions
        setActiveModule: (module) => {
          set({ activeModule: module });
        },

        setWorkflowMode: (mode) => {
          set({ workflowMode: mode });
        },

        switchToModule: (module: 'suno' | 'obs') => {
          set((state) => ({
            activeModule: module,
            workflowMode:
              module === 'suno'
                ? 'content-creation'
                : 'live-performance',
          }));
        },

        // Project actions
        createProject: (name: string, description?: string) => {
          const projectId = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const newProject: CreativeStudioStoreState['currentProject'] = {
            id: projectId,
            name,
            description: description || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: [],
            sunoTracksCount: 0,
            streamSessionsCount: 0,
          };
          set({
            currentProject: newProject,
            linkedTracks: [],
          });
        },

        updateProject: (updates) => {
          set((state) => {
            if (!state.currentProject) return state;
            return {
              currentProject: {
                ...state.currentProject,
                ...updates,
                updatedAt: new Date(),
              },
            };
          });
        },

        deleteProject: () => {
          set({
            currentProject: null,
            linkedTracks: [],
          });
        },

        loadProject: (projectId: string) => {
          // In a real app, this would fetch from a backend
          // For now, it just sets the state
          set((state) => {
            if (state.currentProject?.id === projectId) return state;
            return {
              currentProject: {
                id: projectId,
                name: `Project ${projectId}`,
                description: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: [],
                sunoTracksCount: 0,
                streamSessionsCount: 0,
              },
            };
          });
        },

        // UI actions
        setPreviewMode: (enabled: boolean) => {
          set({ isPreviewMode: enabled });
        },

        showTimelinePanel: (show: boolean) => {
          set({ showTimeline: show });
        },

        setTimelineMode: (mode: 'tracks' | 'scenes' | 'unified') => {
          set({ timelineMode: mode });
        },

        selectPanel: (panel) => {
          set({ selectedPanel: panel });
        },

        // Cross-module sync
        syncSunoToObs: async (sunoTrackId: string, obsSceneId: string) => {
          try {
            // Get track and scene info
            const sunoStore = useSunoStore.getState();
            const obsStore = useObsStore.getState();

            const track = sunoStore.generationHistory.find((t) => t.id === sunoTrackId);
            const scene = obsStore.scenes.find((s) => s.id === obsSceneId);

            if (!track || !scene) {
              throw new Error('Track or scene not found');
            }

            // Link them
            get().linkTrackToScene(sunoTrackId, obsSceneId);

            // Update project metadata
            get().updateProject({
              sunoTracksCount: sunoStore.generationHistory.length,
              streamSessionsCount: obsStore.recordings.length,
            });
          } catch (error) {
            console.error('Failed to sync Suno track to OBS scene:', error);
            throw error;
          }
        },

        exportProject: async (format: 'json' | 'mp4' | 'stems') => {
          const state = get();
          const sunoStore = useSunoStore.getState();
          const obsStore = useObsStore.getState();

          try {
            const projectData = {
              project: state.currentProject,
              linkedTracks: state.linkedTracks,
              sunoTracks: sunoStore.generationHistory,
              scenes: obsStore.scenes,
              recordings: obsStore.recordings,
              exportedAt: new Date(),
              format,
            };

            if (format === 'json') {
              // Export as JSON
              const jsonStr = JSON.stringify(projectData, null, 2);
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${state.currentProject?.name}-export.json`;
              a.click();
              URL.revokeObjectURL(url);
            } else if (format === 'mp4') {
              // Export as video (would require video processing API)
              console.log('Video export not yet implemented');
            } else if (format === 'stems') {
              // Export stems (would require stem extraction)
              console.log('Stems export not yet implemented');
            }
          } catch (error) {
            console.error(`Failed to export project as ${format}:`, error);
            throw error;
          }
        },

        // State queries
        getLinkedTrackBySceneId: (sceneId: string) => {
          return get().linkedTracks.find((link) => link.obsSceneId === sceneId);
        },

        getLinkedSceneByTrackId: (trackId: string) => {
          const link = get().linkedTracks.find((l) => l.sunoTrackId === trackId);
          return link?.obsSceneId;
        },

        canPlayTrackInScene: (trackId: string, sceneId: string) => {
          const sunoStore = useSunoStore.getState();
          const obsStore = useObsStore.getState();

          const trackExists = sunoStore.generationHistory.some((t) => t.id === trackId);
          const sceneExists = obsStore.scenes.some((s) => s.id === sceneId);
          const isLinked = get().linkedTracks.some(
            (link) => link.sunoTrackId === trackId && link.obsSceneId === sceneId
          );

          return trackExists && sceneExists && isLinked;
        },

        // Sync state from sub-stores
        syncFromSubStores: () => {
          const sunoState = useSunoStore.getState();
          const obsState = useObsStore.getState();

          set({
            sunoState: {
              currentGeneration: sunoState.currentGeneration,
              generationHistory: sunoState.generationHistory,
              selectedTrack: sunoState.selectedTrack,
              favorites: sunoState.favorites,
              playlists: sunoState.playlists,
            },
            obsState: {
              scenes: obsState.scenes,
              activeSceneId: obsState.activeSceneId,
              streamStatus: obsState.streamStatus,
              isRecording: obsState.isRecording,
              recordings: obsState.recordings,
            },
          });
        },

        reset: () => {
          set(initialState);
          useSunoStore.getState().reset();
          useObsStore.getState().reset();
        },
      }),
      {
        name: 'creative-studio-store',
        version: 1,
      }
    )
  )
);

/**
 * Selectors for optimized re-renders
 */
export const creativeStudioSelectors = {
  // Module state
  selectActiveModule: () =>
    useCreativeStudioStore((state) => state.activeModule),
  selectWorkflowMode: () =>
    useCreativeStudioStore((state) => state.workflowMode),

  // Project
  selectCurrentProject: () =>
    useCreativeStudioStore((state) => state.currentProject),

  // Linked tracks
  selectLinkedTracks: () =>
    useCreativeStudioStore((state) => state.linkedTracks),
  selectLinkCount: () =>
    useCreativeStudioStore((state) => state.linkedTracks.length),

  // UI
  selectIsPreviewMode: () =>
    useCreativeStudioStore((state) => state.isPreviewMode),
  selectTimelineMode: () =>
    useCreativeStudioStore((state) => state.timelineMode),
  selectSelectedPanel: () =>
    useCreativeStudioStore((state) => state.selectedPanel),

  // Sub-store states
  selectSunoState: () =>
    useCreativeStudioStore((state) => state.sunoState),
  selectObsState: () =>
    useCreativeStudioStore((state) => state.obsState),
};

/**
 * Composite hook for getting linked track info
 * Usage: const { track, scene } = useLinkedTrackInfo(linkId)
 */
export function useLinkedTrackInfo(linkId: string) {
  const creativeStore = useCreativeStudioStore((state) => state.linkedTracks[parseInt(linkId)]);
  const sunoStore = useSunoStore();
  const obsStore = useObsStore();

  if (!creativeStore) return { track: null, scene: null };

  const track = sunoStore.generationHistory.find((t) => t.id === creativeStore.sunoTrackId);
  const scene = obsStore.scenes.find((s) => s.id === creativeStore.obsSceneId);

  return { track, scene, link: creativeStore };
}

/**
 * Hook to sync stores on mount
 * Usage: useSyncStores()
 */
export function useSyncStores() {
  const syncFromSubStores = useCreativeStudioStore((state) => state.syncFromSubStores);

  useEffect(() => {
    syncFromSubStores();
  }, [syncFromSubStores]);
}
