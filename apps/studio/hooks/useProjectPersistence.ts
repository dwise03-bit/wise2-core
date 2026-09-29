'use client';

/**
 * Project persistence hook - saves and loads projects from localStorage
 */

import { useCallback, useState } from 'react';

export interface SerializedProject {
  id: string;
  name: string;
  bpm: number;
  masterVolume: number;
  tracks: Array<{
    id: string;
    name: string;
    volume: number;
    pan: number;
    muted: boolean;
    solo: boolean;
    color: string;
  }>;
  createdAt: number;
  updatedAt: number;
}

export type ProjectMetadata = SerializedProject;

const STORAGE_KEY_PREFIX = 'soundlabs_project_';
const PROJECT_LIST_KEY = 'soundlabs_projects_list';

export function useProjectPersistence() {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const getProjectList = useCallback((): SerializedProject[] => {
    try {
      const listJson = localStorage.getItem(PROJECT_LIST_KEY);
      if (!listJson) return [];
      return JSON.parse(listJson);
    } catch (error) {
      console.error('Failed to get project list:', error);
      return [];
    }
  }, []);

  const getTotalStorageUsed = useCallback((): number => {
    let total = 0;
    try {
      for (let key in localStorage) {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          const item = localStorage[key];
          if (item) total += item.length;
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage:', error);
    }
    return total;
  }, []);

  const saveProject = useCallback(
    async (project: SerializedProject): Promise<boolean> => {
      try {
        setSaveStatus('saving');
        setSaveError(null);

        const key = STORAGE_KEY_PREFIX + project.id;
        const projectJson = JSON.stringify(project);

        localStorage.setItem(key, projectJson);

        const list = getProjectList();
        const existingIndex = list.findIndex(p => p.id === project.id);

        if (existingIndex >= 0) {
          list[existingIndex] = project;
        } else {
          list.push(project);
        }

        localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save project';
        console.error('Save project error:', error);
        setSaveError(errorMessage);
        setSaveStatus('error');
        return false;
      }
    },
    [getProjectList]
  );

  const loadProject = useCallback((projectId: string): SerializedProject | null => {
    try {
      const key = STORAGE_KEY_PREFIX + projectId;
      const json = localStorage.getItem(key);
      if (!json) return null;
      return JSON.parse(json);
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }, []);

  const deleteProject = useCallback((projectId: string): boolean => {
    try {
      const key = STORAGE_KEY_PREFIX + projectId;
      localStorage.removeItem(key);

      const list = getProjectList();
      const filtered = list.filter(p => p.id !== projectId);
      localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(filtered));

      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }, [getProjectList]);

  return {
    saveProject,
    loadProject,
    deleteProject,
    getProjectList,
    getTotalStorageUsed,
    saveStatus,
    saveError,
  };
}
