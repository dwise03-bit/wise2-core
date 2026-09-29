'use client';

import type { Recording } from '../../../types/streaming';

export interface RecordingCardProps {
  recording: Recording;
  onPlay?: (recording: Recording) => void;
  onExport?: (recording: Recording) => void;
  onDelete?: (id: string) => void;
  onShare?: (recording: Recording) => void;
}

export function RecordingCard({ recording, onPlay, onExport, onDelete, onShare }: RecordingCardProps) {
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 hover:border-blue-500 transition-colors">
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-3 flex items-center justify-center border border-gray-700">
        <div className="text-gray-500 text-center">
          <div className="text-3xl mb-2">🎙️</div>
          <div className="text-xs">{recording.trackCount} track{recording.trackCount !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-3">
        <h4 className="font-semibold text-sm text-gray-200 truncate">{recording.title}</h4>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>
            <div className="text-gray-500">Duration</div>
            <div className="text-gray-300 font-mono">{formatDuration(recording.duration)}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500">Size</div>
            <div className="text-gray-300 font-mono">{formatFileSize(recording.fileSize)}</div>
          </div>
        </div>

        <div className="text-xs text-gray-500">{formatDate(recording.startTime)}</div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onPlay && (
          <button
            onClick={() => onPlay(recording)}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
            title="Play recording"
          >
            ▶ Play
          </button>
        )}
        {onExport && (
          <button
            onClick={() => onExport(recording)}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded transition-colors"
            title="Export recording"
          >
            ⬇ Export
          </button>
        )}
        {onShare && (
          <button
            onClick={() => onShare(recording)}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded transition-colors"
            title="Share recording"
          >
            🔗
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(recording.id)}
            className="px-3 py-2 bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-400 text-xs font-semibold rounded transition-colors"
            title="Delete recording"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
