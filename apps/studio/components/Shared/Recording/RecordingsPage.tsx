'use client';

import { useState } from 'react';
import { RecordingsLibrary } from './RecordingsLibrary';
import { ExportModal } from './ExportModal';
import { ShareModal } from './ShareModal';
import { useRecordings } from '../../../hooks/useRecordings';
import type { Recording } from '../../../types/streaming';
import type { ExportFormat } from '../../../utils/recordingExport';

export interface RecordingsPageProps {
  /**
   * Title to display
   */
  title?: string;

  /**
   * Show as full page (default) or modal-like
   */
  isModal?: boolean;

  /**
   * Callback when closing (if modal)
   */
  onClose?: () => void;

  /**
   * Callback when playing a recording
   */
  onPlay?: (recording: Recording) => void;
}

export function RecordingsPage({
  title = 'RECORDINGS',
  isModal = false,
  onClose,
  onPlay,
}: RecordingsPageProps) {
  const { exportRecording } = useRecordings();
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportClick = (recording: Recording) => {
    setSelectedRecording(recording);
    setExportModalOpen(true);
  };

  const handleShareClick = (recording: Recording) => {
    setSelectedRecording(recording);
    setShareModalOpen(true);
  };

  const handleExportConfirm = async (format: ExportFormat, bitrate?: number) => {
    if (!selectedRecording) return;

    setIsExporting(true);
    try {
      await exportRecording(selectedRecording.id, format);
      setExportModalOpen(false);
      setSelectedRecording(null);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={isModal ? 'bg-gray-900 rounded-lg p-6' : 'min-h-screen bg-gray-950 p-6'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            title="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Library */}
      <RecordingsLibrary
        title={isModal ? '' : title}
        showHeader={!isModal}
        onPlay={onPlay}
        onExport={handleExportClick}
        onShare={handleShareClick}
      />

      {/* Export Modal */}
      {selectedRecording && (
        <>
          <ExportModal
            recording={selectedRecording}
            isOpen={exportModalOpen}
            isExporting={isExporting}
            onClose={() => setExportModalOpen(false)}
            onExport={handleExportConfirm}
          />

          <ShareModal
            recording={selectedRecording}
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
