'use client';

import React, { useState, useEffect } from 'react';
import { RecordingFile } from './types';

interface RecordingsListProps {
  recordings?: RecordingFile[];
  onDelete?: (recordingId: string) => void;
  onDownload?: (recordingId: string) => void;
  onPlay?: (recordingId: string) => void;
  onMove?: (recordingId: string, destination: string) => void;
  isLoading?: boolean;
}

/**
 * RecordingsList Component
 *
 * Browse saved recordings with:
 * - Thumbnail + duration
 * - Date + platform (Twitch/YouTube/etc)
 * - File size, bitrate
 * - Delete button
 * - Download button
 * - Play in browser (video player)
 * - Move to archive/delete
 */
export const RecordingsList: React.FC<RecordingsListProps> = ({
  recordings = [],
  onDelete,
  onDownload,
  onPlay,
  onMove,
  isLoading = false,
}) => {
  const [selectedRecordings, setSelectedRecordings] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'duration'>('date');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);

  // Get unique platforms
  const platforms = ['all', ...new Set(recordings.map((r) => r.platform).filter(Boolean))];

  // Filter recordings
  const filteredRecordings = recordings.filter((r) => {
    if (filterPlatform === 'all') return true;
    return r.platform === filterPlatform;
  });

  // Sort recordings
  const sortedRecordings = [...filteredRecordings].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'size':
        return b.size - a.size;
      case 'duration':
        return (b.duration || 0) - (a.duration || 0);
      default:
        return 0;
    }
  });

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBitrate = (bitrate: number): string => {
    return `${(bitrate / 1000).toFixed(1)} Mbps`;
  };

  const toggleSelected = (recordingId: string): void => {
    const newSelected = new Set(selectedRecordings);
    if (newSelected.has(recordingId)) {
      newSelected.delete(recordingId);
    } else {
      newSelected.add(recordingId);
    }
    setSelectedRecordings(newSelected);
  };

  const deleteSelected = (): void => {
    selectedRecordings.forEach((id) => {
      onDelete?.(id);
    });
    setSelectedRecordings(new Set());
  };

  const downloadSelected = (): void => {
    selectedRecordings.forEach((id) => {
      onDownload?.(id);
    });
  };

  if (isLoading) {
    return (
      <div className="recording-list-loading space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-slate-800 rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📹</div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No Recordings Yet</h3>
        <p className="text-gray-400">Start recording a stream to see it here</p>
      </div>
    );
  }

  return (
    <div className="recording-list space-y-4">
      {/* Controls */}
      <div className="flex gap-4 items-center justify-between pb-4 border-b border-slate-700/50">
        {/* Filters */}
        <div className="flex gap-4">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-gray-300 hover:border-slate-600 focus:outline-none focus:border-amber-500"
          >
            <option value="date">Sort: Newest</option>
            <option value="size">Sort: Largest</option>
            <option value="duration">Sort: Longest</option>
          </select>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-gray-300 hover:border-slate-600 focus:outline-none focus:border-amber-500"
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'All Platforms' : `${platform}`}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedRecordings.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={downloadSelected}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors"
            >
              ⬇ Download ({selectedRecordings.size})
            </button>
            <button
              onClick={deleteSelected}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              🗑 Delete ({selectedRecordings.size})
            </button>
          </div>
        )}
      </div>

      {/* Recordings Grid */}
      <div className="space-y-2">
        {sortedRecordings.map((recording) => (
          <div
            key={recording.id}
            className="recording-card group p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-slate-600 hover:bg-slate-800 transition-all"
          >
            <div className="flex gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedRecordings.has(recording.id)}
                onChange={() => toggleSelected(recording.id)}
                className="mt-1 w-4 h-4 accent-amber-500"
              />

              {/* Thumbnail */}
              <div className="flex-shrink-0 w-24 h-24 bg-slate-700 rounded overflow-hidden flex items-center justify-center border border-slate-600">
                {recording.thumbnail ? (
                  <img
                    src={recording.thumbnail}
                    alt={recording.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-3xl">🎥</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white truncate">{recording.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(recording.createdAt)}
                    </p>
                  </div>
                  {recording.isSplit && (
                    <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded">
                      Split ({recording.splitParts} parts)
                    </span>
                  )}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div>
                    <span className="text-gray-500">Platform:</span>
                    <span className="ml-2 text-gray-300 capitalize">
                      {recording.platform || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Format:</span>
                    <span className="ml-2 text-gray-300">{recording.format}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <span className="ml-2 text-gray-300">{formatFileSize(recording.size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 text-gray-300">
                      {formatDuration(recording.duration)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bitrate:</span>
                    <span className="ml-2 text-gray-300">
                      {formatBitrate(recording.bitrate)}
                    </span>
                  </div>
                  {recording.audioTracks && recording.audioTracks.length > 0 && (
                    <div>
                      <span className="text-gray-500">Audio Tracks:</span>
                      <span className="ml-2 text-cyan-400">
                        {recording.audioTracks.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={() => onPlay?.(recording.id)}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors"
                  title="Play in browser"
                >
                  ▶
                </button>
                <button
                  onClick={() => onDownload?.(recording.id)}
                  className="px-3 py-2 bg-lime-600 hover:bg-lime-700 text-white text-sm rounded transition-colors"
                  title="Download"
                >
                  ⬇
                </button>
                <button
                  onClick={() => onMove?.(recording.id, 'archive')}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded transition-colors"
                  title="Archive"
                >
                  📦
                </button>
                <button
                  onClick={() => onDelete?.(recording.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded border border-slate-700/50 text-sm">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-gray-500">Total Recordings:</span>
            <span className="ml-2 text-white font-semibold">{sortedRecordings.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Size:</span>
            <span className="ml-2 text-white font-semibold">
              {formatFileSize(
                sortedRecordings.reduce((sum, r) => sum + r.size, 0)
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Duration:</span>
            <span className="ml-2 text-white font-semibold">
              {formatDuration(
                sortedRecordings.reduce((sum, r) => sum + (r.duration || 0), 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingsList;
