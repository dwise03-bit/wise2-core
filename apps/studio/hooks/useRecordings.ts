'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Recording } from '../types/streaming';

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load recordings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('studio_recordings');
    if (saved) {
      setRecordings(JSON.parse(saved));
    }
  }, []);

  // Save recordings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('studio_recordings', JSON.stringify(recordings));
  }, [recordings]);

  const addRecording = useCallback((recording: Omit<Recording, 'id'>) => {
    const newRecording: Recording = {
      ...recording,
      id: Math.random().toString(36),
    };
    setRecordings((prev) => [newRecording, ...prev]);
    return newRecording;
  }, []);

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getRecordingById = useCallback(
    (id: string) => {
      return recordings.find((r) => r.id === id);
    },
    [recordings]
  );

  const exportRecording = useCallback(
    async (id: string, format: 'wav' | 'mp3' | 'aac' = 'wav') => {
      const recording = getRecordingById(id);
      if (!recording) return null;

      // Simulate export
      return {
        id,
        title: recording.title,
        format,
        size: Math.round(recording.fileSize / (1024 * 1024)),
      };
    },
    [getRecordingById]
  );

  return {
    recordings,
    isLoading,
    addRecording,
    deleteRecording,
    getRecordingById,
    exportRecording,
  };
}
