'use client';

import { RecordingCard } from './RecordingCard';
import { useRecordings } from '../../../hooks/useRecordings';
import type { Recording } from '../../../types/streaming';

export interface RecordingsListProps {
  /**
   * Title to display
   */
  title?: string;

  /**
   * Number of recordings to show (default: all)
   */
  limit?: number;

  /**
   * Show title header
   */
  showHeader?: boolean;

  /**
   * Callbacks for recording actions
   */
  onPlay?: (recording: Recording) => void;
  onExport?: (recording: Recording) => void;
  onShare?: (recording: Recording) => void;
}

export function RecordingsList({
  title = 'RECORDINGS',
  limit,
  showHeader = true,
  onPlay,
  onExport,
  onShare,
}: RecordingsListProps) {
  const { recordings, deleteRecording } = useRecordings();

  const displayRecordings = limit ? recordings.slice(0, limit) : recordings;

  const handleDelete = (id: string) => {
    if (confirm('Delete this recording?')) {
      deleteRecording(id);
    }
  };

  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300">{title}</h3>
          {recordings.length > 0 && (
            <span className="text-xs text-gray-500">{recordings.length} recording{recordings.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      {displayRecordings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">🎙️</div>
          <p className="text-sm">No recordings yet</p>
          <p className="text-xs text-gray-600">Start recording to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayRecordings.map((recording) => (
            <RecordingCard
              key={recording.id}
              recording={recording}
              onPlay={onPlay}
              onExport={onExport}
              onDelete={handleDelete}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}
