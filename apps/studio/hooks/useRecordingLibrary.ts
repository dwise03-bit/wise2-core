'use client';

import { useState, useCallback } from 'react';
import type { Recording } from '../types/streaming';
import type { ExportFormat } from '../utils/recordingExport';

export interface RecordingLibraryState {
  isLibraryOpen: boolean;
  selectedRecording: Recording | null;
  isExportModalOpen: boolean;
  isShareModalOpen: boolean;
  isPlaybackModalOpen: boolean;
  isExporting: boolean;
  selectedRecordings: Set<string>;
}

/**
 * Hook to manage Recording Library UI state
 * Handles opening/closing modals and selecting recordings
 */
export function useRecordingLibrary() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [playbackModalOpen, setPlaybackModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRecordings, setSelectedRecordings] = useState<Set<string>>(new Set());

  const openLibrary = useCallback(() => {
    setLibraryOpen(true);
  }, []);

  const closeLibrary = useCallback(() => {
    setLibraryOpen(false);
    setSelectedRecording(null);
    setExportModalOpen(false);
    setShareModalOpen(false);
    setPlaybackModalOpen(false);
  }, []);

  const selectRecording = useCallback((recording: Recording) => {
    setSelectedRecording(recording);
  }, []);

  const openExportModal = useCallback((recording: Recording) => {
    setSelectedRecording(recording);
    setExportModalOpen(true);
  }, []);

  const closeExportModal = useCallback(() => {
    setExportModalOpen(false);
  }, []);

  const openShareModal = useCallback((recording: Recording) => {
    setSelectedRecording(recording);
    setShareModalOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalOpen(false);
  }, []);

  const openPlaybackModal = useCallback((recording: Recording) => {
    setSelectedRecording(recording);
    setPlaybackModalOpen(true);
  }, []);

  const closePlaybackModal = useCallback(() => {
    setPlaybackModalOpen(false);
  }, []);

  const startExporting = useCallback(() => {
    setIsExporting(true);
  }, []);

  const finishExporting = useCallback(() => {
    setIsExporting(false);
    setExportModalOpen(false);
  }, []);

  const toggleRecordingSelection = useCallback((id: string) => {
    setSelectedRecordings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRecordings(new Set());
  }, []);

  return {
    // State
    libraryOpen,
    selectedRecording,
    exportModalOpen,
    shareModalOpen,
    playbackModalOpen,
    isExporting,
    selectedRecordings,

    // Library actions
    openLibrary,
    closeLibrary,
    selectRecording,

    // Export modal
    openExportModal,
    closeExportModal,
    startExporting,
    finishExporting,

    // Share modal
    openShareModal,
    closeShareModal,

    // Playback modal
    openPlaybackModal,
    closePlaybackModal,

    // Selection
    toggleRecordingSelection,
    clearSelection,
  };
}
