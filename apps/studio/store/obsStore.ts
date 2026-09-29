'use client';

/**
 * OBS-like Streaming Store
 * Manages scenes, sources, stream configuration, and live metrics
 * Built with Zustand for performant real-time updates
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Scene,
  SceneSource,
  StreamConfig,
  StreamDestination,
  StreamStatusInfo,
  StreamStatus,
  MixerChannelConfig,
  SystemMetrics,
  StreamHealth,
  Recording,
} from '../types/streaming';

/**
 * OBS Store State Interface
 */
export interface ObsStoreState {
  // Scene management
  scenes: Scene[];
  activeSceneId: string | null;
  activeScene: Scene | null;

  // Stream configuration
  streamConfig: StreamConfig;
  streamDestinations: StreamDestination[];
  activeDestinations: string[]; // destination IDs

  // Stream status
  streamStatus: StreamStatus;
  streamStatusInfo: StreamStatusInfo;
  isRecording: boolean;
  recordingTime: number; // seconds

  // Mixer
  mixerChannels: MixerChannelConfig[];
  masterVolume: number; // -60 to 6 dB

  // System metrics
  systemMetrics: SystemMetrics;
  streamHealth: StreamHealth;

  // Recording history
  recordings: Recording[];

  // UI state
  isMixerVisible: boolean;
  isSourcesVisible: boolean;
  expandedSceneId: string | null;

  // Scene actions
  addScene: (name: string, description?: string) => Scene;
  deleteScene: (sceneId: string) => void;
  switchScene: (sceneId: string) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  duplicateScene: (sceneId: string) => Scene;
  reorderScenes: (sceneIds: string[]) => void;

  // Source actions
  addSource: (sceneId: string, source: SceneSource) => void;
  removeSource: (sceneId: string, sourceId: string) => void;
  updateSource: (sceneId: string, sourceId: string, updates: Partial<SceneSource>) => void;
  enableSource: (sceneId: string, sourceId: string) => void;
  disableSource: (sceneId: string, sourceId: string) => void;
  reorderSources: (sceneId: string, sourceIds: string[]) => void;

  // Stream actions
  updateStreamConfig: (config: Partial<StreamConfig>) => void;
  addStreamDestination: (destination: StreamDestination) => void;
  removeStreamDestination: (destinationId: string) => void;
  activateDestination: (destinationId: string) => void;
  deactivateDestination: (destinationId: string) => void;

  // Stream control
  startStream: () => Promise<void>;
  stopStream: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => Recording | null;
  pauseRecording: () => void;
  resumeRecording: () => void;

  // Status updates
  updateStreamStatus: (status: StreamStatus) => void;
  updateStreamStatusInfo: (info: Partial<StreamStatusInfo>) => void;
  updateSystemMetrics: (metrics: Partial<SystemMetrics>) => void;
  updateStreamHealth: (health: Partial<StreamHealth>) => void;

  // Mixer actions
  addMixerChannel: (channel: MixerChannelConfig) => void;
  removeMixerChannel: (channelId: string) => void;
  updateMixerChannel: (channelId: string, updates: Partial<MixerChannelConfig>) => void;
  setChannelVolume: (channelId: string, volume: number) => void;
  muteChannel: (channelId: string, muted: boolean) => void;
  soloChannel: (channelId: string, solo: boolean) => void;
  setMasterVolume: (volume: number) => void;

  // Recording management
  addRecording: (recording: Recording) => void;
  removeRecording: (recordingId: string) => void;
  archiveRecording: (recordingId: string) => void;

  // UI state
  setMixerVisible: (visible: boolean) => void;
  setSourcesVisible: (visible: boolean) => void;
  setExpandedScene: (sceneId: string | null) => void;

  // Utility
  getSceneById: (sceneId: string) => Scene | undefined;
  getSourcesBySceneId: (sceneId: string) => SceneSource[];
  isStreamLive: () => boolean;

  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  scenes: [],
  activeSceneId: null,
  activeScene: null,
  streamConfig: {
    title: 'My Stream',
    description: '',
    category: 'Creative',
    tags: [],
    visibility: 'private' as const,
  },
  streamDestinations: [],
  activeDestinations: [],
  streamStatus: 'idle' as const,
  streamStatusInfo: {
    isLive: false,
    status: 'idle' as const,
    viewerCount: 0,
    uptime: 0,
    bitrate: 0,
    resolution: '1080p',
    frameRate: 60,
  },
  isRecording: false,
  recordingTime: 0,
  mixerChannels: [],
  masterVolume: 0,
  systemMetrics: {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    diskTotal: 0,
    networkBandwidth: 0,
  },
  streamHealth: {
    status: 'excellent' as const,
    bitrate: 0,
    frameDrops: 0,
    latency: 0,
    bufferHealth: 100,
  },
  recordings: [],
  isMixerVisible: false,
  isSourcesVisible: true,
  expandedSceneId: null,
};

/**
 * OBS Zustand Store
 */
export const useObsStore = create<ObsStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Scene actions
        addScene: (name: string, description?: string): Scene => {
          const newScene: Scene = {
            id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name,
            description,
            sources: [],
            isActive: false,
          };
          set((state) => ({
            scenes: [...state.scenes, newScene],
            activeSceneId: state.activeSceneId || newScene.id,
            activeScene: state.activeSceneId ? state.activeScene : newScene,
          }));
          return newScene;
        },

        deleteScene: (sceneId: string) => {
          set((state) => {
            const newScenes = state.scenes.filter((s) => s.id !== sceneId);
            const newActiveSceneId = state.activeSceneId === sceneId ? newScenes[0]?.id || null : state.activeSceneId;
            return {
              scenes: newScenes,
              activeSceneId: newActiveSceneId,
              activeScene: newScenes.find((s) => s.id === newActiveSceneId) || null,
            };
          });
        },

        switchScene: (sceneId: string) => {
          set((state) => {
            const scene = state.scenes.find((s) => s.id === sceneId);
            if (!scene) return state;
            return {
              scenes: state.scenes.map((s) => ({
                ...s,
                isActive: s.id === sceneId,
              })),
              activeSceneId: sceneId,
              activeScene: scene,
            };
          });
        },

        updateScene: (sceneId: string, updates: Partial<Scene>) => {
          set((state) => {
            const scenes = state.scenes.map((s) =>
              s.id === sceneId ? { ...s, ...updates } : s
            );
            return {
              scenes,
              activeScene: state.activeSceneId === sceneId
                ? scenes.find((s) => s.id === sceneId) || null
                : state.activeScene,
            };
          });
        },

        duplicateScene: (sceneId: string): Scene => {
          const state = get();
          const sceneToClone = state.scenes.find((s) => s.id === sceneId);
          if (!sceneToClone) throw new Error(`Scene ${sceneId} not found`);

          const duplicatedScene: Scene = {
            ...sceneToClone,
            id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: `${sceneToClone.name} (Copy)`,
            isActive: false,
          };

          set((state) => ({
            scenes: [...state.scenes, duplicatedScene],
          }));
          return duplicatedScene;
        },

        reorderScenes: (sceneIds: string[]) => {
          set((state) => {
            const sceneMap = new Map(state.scenes.map((s) => [s.id, s]));
            const orderedScenes = sceneIds.map((id) => sceneMap.get(id)!).filter(Boolean);
            return { scenes: orderedScenes };
          });
        },

        // Source actions
        addSource: (sceneId: string, source: SceneSource) => {
          set((state) => ({
            scenes: state.scenes.map((s) =>
              s.id === sceneId
                ? {
                    ...s,
                    sources: [...s.sources, source],
                  }
                : s
            ),
          }));
        },

        removeSource: (sceneId: string, sourceId: string) => {
          set((state) => ({
            scenes: state.scenes.map((s) =>
              s.id === sceneId
                ? {
                    ...s,
                    sources: s.sources.filter((src) => src.id !== sourceId),
                  }
                : s
            ),
          }));
        },

        updateSource: (sceneId: string, sourceId: string, updates: Partial<SceneSource>) => {
          set((state) => ({
            scenes: state.scenes.map((s) =>
              s.id === sceneId
                ? {
                    ...s,
                    sources: s.sources.map((src) =>
                      src.id === sourceId ? { ...src, ...updates } : src
                    ),
                  }
                : s
            ),
          }));
        },

        enableSource: (sceneId: string, sourceId: string) => {
          get().updateSource(sceneId, sourceId, { enabled: true });
        },

        disableSource: (sceneId: string, sourceId: string) => {
          get().updateSource(sceneId, sourceId, { enabled: false });
        },

        reorderSources: (sceneId: string, sourceIds: string[]) => {
          set((state) => ({
            scenes: state.scenes.map((s) => {
              if (s.id !== sceneId) return s;
              const sourceMap = new Map(s.sources.map((src) => [src.id, src]));
              const orderedSources = sourceIds
                .map((id) => sourceMap.get(id)!)
                .filter(Boolean);
              return { ...s, sources: orderedSources };
            }),
          }));
        },

        // Stream configuration
        updateStreamConfig: (config: Partial<StreamConfig>) => {
          set((state) => ({
            streamConfig: { ...state.streamConfig, ...config },
          }));
        },

        addStreamDestination: (destination: StreamDestination) => {
          set((state) => {
            const exists = state.streamDestinations.some((d) => d.id === destination.id);
            if (exists) return state;
            return {
              streamDestinations: [...state.streamDestinations, destination],
            };
          });
        },

        removeStreamDestination: (destinationId: string) => {
          set((state) => ({
            streamDestinations: state.streamDestinations.filter((d) => d.id !== destinationId),
            activeDestinations: state.activeDestinations.filter((id) => id !== destinationId),
          }));
        },

        activateDestination: (destinationId: string) => {
          set((state) => {
            if (state.activeDestinations.includes(destinationId)) return state;
            return {
              activeDestinations: [...state.activeDestinations, destinationId],
              streamDestinations: state.streamDestinations.map((d) =>
                d.id === destinationId ? { ...d, isActive: true } : d
              ),
            };
          });
        },

        deactivateDestination: (destinationId: string) => {
          set((state) => ({
            activeDestinations: state.activeDestinations.filter((id) => id !== destinationId),
            streamDestinations: state.streamDestinations.map((d) =>
              d.id === destinationId ? { ...d, isActive: false } : d
            ),
          }));
        },

        // Stream control
        startStream: async () => {
          try {
            set((state) => ({
              streamStatus: 'starting' as const,
              streamStatusInfo: {
                ...state.streamStatusInfo,
                isLive: true,
                status: 'starting' as const,
              },
            }));

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            set((state) => ({
              streamStatus: 'streaming' as const,
              streamStatusInfo: {
                ...state.streamStatusInfo,
                status: 'streaming' as const,
              },
            }));
          } catch (error) {
            set((state) => ({
              streamStatus: 'error' as const,
              streamStatusInfo: {
                ...state.streamStatusInfo,
                isLive: false,
                status: 'error' as const,
              },
            }));
            throw error;
          }
        },

        stopStream: async () => {
          try {
            set((state) => ({
              streamStatus: 'stopping' as const,
              streamStatusInfo: {
                ...state.streamStatusInfo,
                status: 'stopping' as const,
              },
            }));

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            set((state) => ({
              streamStatus: 'idle' as const,
              streamStatusInfo: {
                ...state.streamStatusInfo,
                isLive: false,
                status: 'idle' as const,
                viewerCount: 0,
                uptime: 0,
              },
            }));
          } catch (error) {
            set((state) => ({
              streamStatus: 'error' as const,
            }));
            throw error;
          }
        },

        startRecording: () => {
          set((state) => ({
            isRecording: true,
            recordingTime: 0,
          }));
        },

        stopRecording: (): Recording | null => {
          const state = get();
          if (!state.isRecording) return null;

          const recording: Recording = {
            id: `rec-${Date.now()}`,
            title: state.streamConfig.title,
            startTime: new Date(Date.now() - state.recordingTime * 1000),
            endTime: new Date(),
            duration: state.recordingTime,
            fileSize: Math.random() * 5000000000, // Random size for demo
            trackCount: state.mixerChannels.length,
            isArchived: false,
          };

          set((state) => ({
            isRecording: false,
            recordingTime: 0,
            recordings: [recording, ...state.recordings],
          }));

          return recording;
        },

        pauseRecording: () => {
          // Implement pause logic if needed
        },

        resumeRecording: () => {
          // Implement resume logic if needed
        },

        // Status updates
        updateStreamStatus: (status: StreamStatus) => {
          set((state) => ({
            streamStatus: status,
            streamStatusInfo: {
              ...state.streamStatusInfo,
              status,
            },
          }));
        },

        updateStreamStatusInfo: (info: Partial<StreamStatusInfo>) => {
          set((state) => ({
            streamStatusInfo: {
              ...state.streamStatusInfo,
              ...info,
            },
          }));
        },

        updateSystemMetrics: (metrics: Partial<SystemMetrics>) => {
          set((state) => ({
            systemMetrics: {
              ...state.systemMetrics,
              ...metrics,
            },
          }));
        },

        updateStreamHealth: (health: Partial<StreamHealth>) => {
          set((state) => ({
            streamHealth: {
              ...state.streamHealth,
              ...health,
            },
          }));
        },

        // Mixer actions
        addMixerChannel: (channel: MixerChannelConfig) => {
          set((state) => {
            const exists = state.mixerChannels.some((c) => c.id === channel.id);
            if (exists) return state;
            return {
              mixerChannels: [...state.mixerChannels, channel],
            };
          });
        },

        removeMixerChannel: (channelId: string) => {
          set((state) => ({
            mixerChannels: state.mixerChannels.filter((c) => c.id !== channelId),
          }));
        },

        updateMixerChannel: (channelId: string, updates: Partial<MixerChannelConfig>) => {
          set((state) => ({
            mixerChannels: state.mixerChannels.map((c) =>
              c.id === channelId ? { ...c, ...updates } : c
            ),
          }));
        },

        setChannelVolume: (channelId: string, volume: number) => {
          const clampedVolume = Math.max(-60, Math.min(6, volume));
          get().updateMixerChannel(channelId, { volume: clampedVolume });
        },

        muteChannel: (channelId: string, muted: boolean) => {
          get().updateMixerChannel(channelId, { isMuted: muted });
        },

        soloChannel: (channelId: string, solo: boolean) => {
          set((state) => ({
            mixerChannels: state.mixerChannels.map((c) =>
              c.type === 'master'
                ? c
                : c.id === channelId
                ? { ...c, isSolo: solo }
                : { ...c, isSolo: false }
            ),
          }));
        },

        setMasterVolume: (volume: number) => {
          const clampedVolume = Math.max(-60, Math.min(6, volume));
          set((state) => ({
            mixerChannels: state.mixerChannels.map((c) =>
              c.type === 'master' ? { ...c, volume: clampedVolume } : c
            ),
            masterVolume: clampedVolume,
          }));
        },

        // Recording management
        addRecording: (recording: Recording) => {
          set((state) => ({
            recordings: [recording, ...state.recordings],
          }));
        },

        removeRecording: (recordingId: string) => {
          set((state) => ({
            recordings: state.recordings.filter((r) => r.id !== recordingId),
          }));
        },

        archiveRecording: (recordingId: string) => {
          set((state) => ({
            recordings: state.recordings.map((r) =>
              r.id === recordingId ? { ...r, isArchived: true } : r
            ),
          }));
        },

        // UI state
        setMixerVisible: (visible: boolean) => {
          set({ isMixerVisible: visible });
        },

        setSourcesVisible: (visible: boolean) => {
          set({ isSourcesVisible: visible });
        },

        setExpandedScene: (sceneId: string | null) => {
          set({ expandedSceneId: sceneId });
        },

        // Utility methods
        getSceneById: (sceneId: string) => {
          return get().scenes.find((s) => s.id === sceneId);
        },

        getSourcesBySceneId: (sceneId: string) => {
          const scene = get().scenes.find((s) => s.id === sceneId);
          return scene?.sources || [];
        },

        isStreamLive: () => {
          return get().streamStatus === 'streaming';
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'obs-store',
        version: 1,
      }
    )
  )
);

/**
 * Selectors for optimized re-renders
 */
export const obsSelectors = {
  // Scenes
  selectScenes: () =>
    useObsStore((state) => state.scenes),
  selectActiveScene: () =>
    useObsStore((state) => state.activeScene),
  selectActiveSceneId: () =>
    useObsStore((state) => state.activeSceneId),

  // Stream
  selectStreamStatus: () =>
    useObsStore((state) => state.streamStatus),
  selectIsLive: () =>
    useObsStore((state) => state.streamStatusInfo.isLive),
  selectViewerCount: () =>
    useObsStore((state) => state.streamStatusInfo.viewerCount),
  selectStreamUptime: () =>
    useObsStore((state) => state.streamStatusInfo.uptime),

  // Recording
  selectIsRecording: () =>
    useObsStore((state) => state.isRecording),
  selectRecordingTime: () =>
    useObsStore((state) => state.recordingTime),

  // Mixer
  selectMixerChannels: () =>
    useObsStore((state) => state.mixerChannels),
  selectMasterVolume: () =>
    useObsStore((state) => state.masterVolume),

  // Metrics
  selectSystemMetrics: () =>
    useObsStore((state) => state.systemMetrics),
  selectStreamHealth: () =>
    useObsStore((state) => state.streamHealth),

  // UI
  selectIsMixerVisible: () =>
    useObsStore((state) => state.isMixerVisible),
  selectIsSourcesVisible: () =>
    useObsStore((state) => state.isSourcesVisible),
};
