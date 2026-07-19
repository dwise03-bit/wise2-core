'use client';

/**
 * React hook for managing cloud project persistence
 * Syncs projects between browser and backend (Postgres + S3)
 * Handles auto-save, conflict resolution, and offline queuing
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProjectAPI } from '../lib/project-api';
import type { Track, Mixer, Playback } from '@wise2/audio';

export interface CloudProjectMetadata {
  id: string;
  name: string;
  description?: string;
  updatedAt: number;
  projectSize: number;
}

export interface CloudPersistenceState {
  isSaving: boolean;
  isLoading: boolean;
  isUploading: boolean;
  lastSynced: number | null;
  error: string | null;
  uploadProgress: number;
  isOnline: boolean;
}

export interface CloudRecording {
  id: string;
  name: string;
  description?: string;
  s3Url: string;
  fileSize: number;
  duration?: number;
  uploadStatus: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  uploadProgress: number;
}

const SAVE_DEBOUNCE_MS = 3000;
const SYNC_INTERVAL_MS = 30000; // Sync every 30 seconds if changes detected
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export function useCloudPersistence() {
  const [state, setState] = useState<CloudPersistenceState>({
    isSaving: false,
    isLoading: false,
    isUploading: false,
    lastSynced: null,
    error: null,
    uploadProgress: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  const currentProjectIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStateRef = useRef<any>(null);
  const offlineQueueRef = useRef<Array<{ action: string; data: any }>>([]);

  /**
   * Initialize cloud persistence and load project
   */
  const initializeProject = useCallback(
    async (projectId: string, projectName: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        currentProjectIdRef.current = projectId;

        // Try to load existing project from cloud
        try {
          const project = await ProjectAPI.getProject(projectId);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            lastSynced: Date.now(),
            error: null,
          }));
          return project;
        } catch (error: any) {
          // If project doesn't exist, create it
          if (error.statusCode === 404) {
            const newProject = await ProjectAPI.createProject(projectName);
            currentProjectIdRef.current = newProject.id;
            setState((prev) => ({
              ...prev,
              isLoading: false,
              lastSynced: Date.now(),
              error: null,
            }));
            return newProject;
          }
          throw error;
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to initialize project';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Save project state to cloud
   */
  const saveProject = useCallback(
    async (
      projectId: string,
      projectName: string,
      tracks: Track[],
      mixer: Mixer | null,
      playback: Playback | null,
      masterVolume: number,
      bpm: number
    ): Promise<boolean> => {
      if (!state.isOnline) {
        // Queue for offline sync
        offlineQueueRef.current.push({
          action: 'saveProject',
          data: {
            projectId,
            projectName,
            tracks,
            mixer,
            playback,
            masterVolume,
            bpm,
          },
        });
        return true;
      }

      try {
        const mixerState = {
          tracks: tracks.map((t) => ({
            id: t.getId(),
            name: t.getName(),
            volume: t.getVolume(),
            pan: t.getPan(),
            isMuted: t.isMutedTrack(),
            isSolo: t.isSoloTrack(),
          })),
          masterVolume,
          bpm,
          playbackPosition: 0, // Playback position not accessible from public API
        };

        const currentState = JSON.stringify(mixerState);
        const lastState = lastStateRef.current ? JSON.stringify(lastStateRef.current) : null;

        // Only save if state has changed
        if (lastState === currentState) {
          return true;
        }

        setState((prev) => ({ ...prev, isSaving: true }));

        // Retry logic
        let lastError: any;
        for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
          try {
            await ProjectAPI.updateProject(projectId, {
              name: projectName,
              mixerState,
            });

            lastStateRef.current = mixerState;
            setState((prev) => ({
              ...prev,
              isSaving: false,
              lastSynced: Date.now(),
              error: null,
            }));
            return true;
          } catch (error) {
            lastError = error;
            if (attempt < RETRY_ATTEMPTS - 1) {
              await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
            }
          }
        }

        throw lastError;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to save project';
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: errorMsg,
        }));
        console.error('Failed to save project:', errorMsg);
        return false;
      }
    },
    [state.isOnline]
  );

  /**
   * Debounced save that's called on state changes
   */
  const debouncedSaveProject = useCallback(
    (
      projectId: string,
      projectName: string,
      tracks: Track[],
      mixer: Mixer | null,
      playback: Playback | null,
      masterVolume: number,
      bpm: number
    ) => {
      setState((prev) => ({ ...prev, isSaving: true }));

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveProject(projectId, projectName, tracks, mixer, playback, masterVolume, bpm);
      }, SAVE_DEBOUNCE_MS);
    },
    [saveProject]
  );

  /**
   * Upload audio recording
   */
  const uploadRecording = useCallback(
    async (
      projectId: string,
      fileBuffer: ArrayBuffer,
      name: string,
      description?: string
    ): Promise<CloudRecording | null> => {
      if (!state.isOnline) {
        // Queue for offline sync
        offlineQueueRef.current.push({
          action: 'uploadRecording',
          data: { projectId, fileBuffer, name, description },
        });
        setState((prev) => ({ ...prev, uploadProgress: 100 }));
        return null;
      }

      try {
        setState((prev) => ({ ...prev, isUploading: true, uploadProgress: 0 }));

        const recording = await ProjectAPI.uploadRecording(
          projectId,
          fileBuffer,
          name,
          description,
          (progress) => {
            setState((prev) => ({ ...prev, uploadProgress: progress }));
          }
        );

        setState((prev) => ({
          ...prev,
          isUploading: false,
          uploadProgress: 100,
          error: null,
        }));

        return recording;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to upload recording';
        setState((prev) => ({
          ...prev,
          isUploading: false,
          uploadProgress: 0,
          error: errorMsg,
        }));
        console.error('Failed to upload recording:', errorMsg);
        return null;
      }
    },
    [state.isOnline]
  );

  /**
   * Load project from cloud
   */
  const loadProject = useCallback(async (projectId: string): Promise<any | null> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const project = await ProjectAPI.getProject(projectId);
      currentProjectIdRef.current = projectId;
      lastStateRef.current = project.mixerState;

      setState((prev) => ({
        ...prev,
        isLoading: false,
        lastSynced: Date.now(),
        error: null,
      }));

      return project;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to load project';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      console.error('Failed to load project:', errorMsg);
      return null;
    }
  }, []);

  /**
   * List all projects
   */
  const listProjects = useCallback(async (): Promise<CloudProjectMetadata[]> => {
    try {
      const projects = await ProjectAPI.listProjects();
      return projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        updatedAt: new Date(p.updatedAt).getTime(),
        projectSize: p.projectSize,
      }));
    } catch (error: any) {
      console.error('Failed to list projects:', error.message);
      return [];
    }
  }, []);

  /**
   * Delete a project
   */
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      await ProjectAPI.deleteProject(projectId);
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to delete project';
      setState((prev) => ({ ...prev, error: errorMsg }));
      console.error('Failed to delete project:', errorMsg);
      return false;
    }
  }, []);

  /**
   * Process offline queue when connection is restored
   */
  const syncOfflineQueue = useCallback(async () => {
    if (!state.isOnline || offlineQueueRef.current.length === 0) {
      return;
    }

    const queue = [...offlineQueueRef.current];
    offlineQueueRef.current = [];

    for (const item of queue) {
      try {
        if (item.action === 'saveProject') {
          await saveProject(
            item.data.projectId,
            item.data.projectName,
            item.data.tracks,
            item.data.mixer,
            item.data.playback,
            item.data.masterVolume,
            item.data.bpm
          );
        } else if (item.action === 'uploadRecording') {
          await uploadRecording(
            item.data.projectId,
            item.data.fileBuffer,
            item.data.name,
            item.data.description
          );
        }
      } catch (error) {
        console.error('Failed to sync offline item:', error);
        // Re-add to queue for retry
        offlineQueueRef.current.push(item);
      }
    }
  }, [state.isOnline, saveProject, uploadRecording]);

  /**
   * Handle online/offline status
   */
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [syncOfflineQueue]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    state,

    // Initialization
    initializeProject,

    // Save/Load
    saveProject,
    debouncedSaveProject,
    loadProject,

    // Project management
    listProjects,
    deleteProject,

    // Recordings
    uploadRecording,

    // Offline
    syncOfflineQueue,
    getOfflineQueueSize: () => offlineQueueRef.current.length,
  };
}
