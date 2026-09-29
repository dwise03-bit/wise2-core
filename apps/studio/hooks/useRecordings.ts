'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Recording } from '../types/streaming';
import { exportRecording as performExport, type ExportFormat } from '../utils/recordingExport';

export type SortBy = 'date' | 'duration' | 'size' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface UseRecordingsOptions {
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  searchQuery?: string;
  minDuration?: number;
  maxDuration?: number;
  archived?: boolean | null;
}

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Load recordings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studio_recordings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecordings(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load recordings from localStorage:', error);
    }
  }, []);

  // Save recordings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('studio_recordings', JSON.stringify(recordings));
    } catch (error) {
      console.error('Failed to save recordings to localStorage:', error);
    }
  }, [recordings]);

  /**
   * Filter and sort recordings
   */
  const getFilteredAndSortedRecordings = useCallback(
    (options: UseRecordingsOptions = {}) => {
      let filtered = [...recordings];

      // Search by title
      if (options.searchQuery?.trim()) {
        const query = options.searchQuery.toLowerCase();
        filtered = filtered.filter((r) => r.title.toLowerCase().includes(query));
      }

      // Filter by duration
      if (options.minDuration !== undefined) {
        filtered = filtered.filter((r) => r.duration >= options.minDuration!);
      }
      if (options.maxDuration !== undefined) {
        filtered = filtered.filter((r) => r.duration <= options.maxDuration!);
      }

      // Filter by archived status
      if (options.archived !== null && options.archived !== undefined) {
        filtered = filtered.filter((r) => r.isArchived === options.archived);
      }

      // Sort
      const sortByVal = options.sortBy || sortBy;
      const sortOrderVal = options.sortOrder || sortOrder;

      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortByVal) {
          case 'date':
            comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            break;
          case 'duration':
            comparison = a.duration - b.duration;
            break;
          case 'size':
            comparison = a.fileSize - b.fileSize;
            break;
          case 'name':
            comparison = a.title.localeCompare(b.title);
            break;
        }

        return sortOrderVal === 'desc' ? -comparison : comparison;
      });

      return filtered;
    },
    [recordings, sortBy, sortOrder]
  );

  const addRecording = useCallback((recording: Omit<Recording, 'id'>) => {
    const newRecording: Recording = {
      ...recording,
      id: Math.random().toString(36).slice(2, 11),
    };
    setRecordings((prev) => [newRecording, ...prev]);
    return newRecording;
  }, []);

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const deleteMultipleRecordings = useCallback((ids: string[]) => {
    setRecordings((prev) => prev.filter((r) => !ids.includes(r.id)));
  }, []);

  const getRecordingById = useCallback(
    (id: string) => {
      return recordings.find((r) => r.id === id);
    },
    [recordings]
  );

  const updateRecording = useCallback((id: string, updates: Partial<Recording>) => {
    setRecordings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const archiveRecording = useCallback((id: string) => {
    updateRecording(id, { isArchived: true });
  }, [updateRecording]);

  const unarchiveRecording = useCallback((id: string) => {
    updateRecording(id, { isArchived: false });
  }, [updateRecording]);

  const exportRecording = useCallback(
    async (id: string, format: ExportFormat = 'wav') => {
      const recording = getRecordingById(id);
      if (!recording) return null;

      try {
        const result = await performExport(
          id,
          recording.title,
          recording.duration,
          recording.trackCount,
          format
        );
        return result;
      } catch (error) {
        console.error('Export failed:', error);
        return null;
      }
    },
    [getRecordingById]
  );

  const getRecordingStats = useCallback(() => {
    return {
      totalRecordings: recordings.length,
      archivedCount: recordings.filter((r) => r.isArchived).length,
      totalDuration: recordings.reduce((sum, r) => sum + r.duration, 0),
      totalSize: recordings.reduce((sum, r) => sum + r.fileSize, 0),
      averageDuration:
        recordings.length > 0
          ? recordings.reduce((sum, r) => sum + r.duration, 0) / recordings.length
          : 0,
      recentRecording: recordings[0],
    };
  }, [recordings]);

  return {
    // State
    recordings,
    isLoading,
    sortBy,
    sortOrder,
    searchQuery,

    // Set state
    setSortBy,
    setSortOrder,
    setSearchQuery,

    // Filtering
    getFilteredAndSortedRecordings,

    // CRUD operations
    addRecording,
    deleteRecording,
    deleteMultipleRecordings,
    getRecordingById,
    updateRecording,
    archiveRecording,
    unarchiveRecording,

    // Export
    exportRecording,

    // Stats
    getRecordingStats,
  };
}
