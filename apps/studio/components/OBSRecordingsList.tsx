'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Download,
  Trash2,
  Folder,
  Calendar,
  FileVideo,
  HardDrive,
  Clock,
  Loader,
  AlertCircle,
} from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileSize: number;
  duration?: number;
  format: 'MP4' | 'MKV' | 'WEBM';
  platform?: string;
  streamTitle?: string;
  status: 'IDLE' | 'RECORDING' | 'PAUSED' | 'STOPPED' | 'PROCESSING' | 'FAILED';
  quality: string;
  bitrate: number;
  startedAt: Date | string;
  stoppedAt?: Date | string;
  isSplit: boolean;
  splitParts: number;
}

interface RecordingsListProps {
  onRecordingSelect?: (recording: Recording) => void;
  maxHeight?: string;
}

export function OBSRecordingsList({ onRecordingSelect, maxHeight = 'h-96' }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'duration' | 'platform'>('date');
  const [filterFormat, setFilterFormat] = useState<string>('');
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch recordings
  useEffect(() => {
    fetchRecordings();
  }, [sortBy, filterFormat, filterPlatform]);

  const fetchRecordings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        sortOrder: 'desc',
        ...(filterFormat && { format: filterFormat }),
        ...(filterPlatform && { platform: filterPlatform }),
      });

      const response = await fetch(`/api/obs/recordings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }

      const data = await response.json();
      setRecordings(data.data?.recordings || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRecordings([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterFormat, filterPlatform]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/obs/recordings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recording');
      }

      setRecordings((prev) => prev.filter((r) => r.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error('Error deleting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete recording');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/obs/recordings/${id}/download`);
      if (!response.ok) {
        throw new Error('Failed to download recording');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to download recording');
    }
  };

  const handlePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingId(playingId === id ? null : id);
  };

  const handleOpenFolder = () => {
    // Open recordings folder in file explorer
    // This would require a backend endpoint or Electron API
    window.open('/recordings', '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-5 h-5 animate-spin text-wise-accent-blue" />
        <span className="ml-2 text-wise-text-secondary">Loading recordings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-wise-text-primary">Recordings</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenFolder}
            className="flex items-center gap-2 px-3 py-1.5 bg-wise-surface/50 hover:bg-wise-surface border border-wise-medium rounded-lg text-xs font-medium text-wise-accent-blue transition-colors"
          >
            <Folder className="w-4 h-4" />
            Open Folder
          </motion.button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-3 gap-2">
          {/* Format Filter */}
          <div>
            <label className="block text-xs font-medium text-wise-text-secondary mb-1">Format</label>
            <select
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value)}
              className="w-full px-2 py-1.5 bg-wise-surface/50 border border-wise-medium rounded text-xs text-wise-text-primary focus:border-wise-accent-blue focus:outline-none"
            >
              <option value="">All Formats</option>
              <option value="MP4">MP4</option>
              <option value="MKV">MKV</option>
              <option value="WEBM">WEBM</option>
            </select>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-xs font-medium text-wise-text-secondary mb-1">Platform</label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full px-2 py-1.5 bg-wise-surface/50 border border-wise-medium rounded text-xs text-wise-text-primary focus:border-wise-accent-blue focus:outline-none"
            >
              <option value="">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="twitch">Twitch</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="rtmp">RTMP</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-medium text-wise-text-secondary mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-1.5 bg-wise-surface/50 border border-wise-medium rounded text-xs text-wise-text-primary focus:border-wise-accent-blue focus:outline-none"
            >
              <option value="date">Date (Recent)</option>
              <option value="size">File Size</option>
              <option value="duration">Duration</option>
              <option value="platform">Platform</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-wise-accent-red/10 border border-wise-accent-red/20 rounded-lg text-sm text-wise-accent-red"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recordings List */}
      <div className={`overflow-y-auto ${maxHeight} space-y-2 pr-2`}>
        <AnimatePresence>
          {recordings.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-wise-text-secondary">
              <p className="text-sm">No recordings found</p>
            </div>
          ) : (
            recordings.map((recording, index) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedId(recording.id);
                  onRecordingSelect?.(recording);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedId === recording.id
                    ? 'bg-wise-accent-blue/10 border-wise-accent-blue'
                    : 'bg-wise-surface/30 border-wise-medium hover:border-wise-accent-blue/50'
                }`}
              >
                {/* Title and Metadata */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-wise-text-primary truncate">
                      {recording.title}
                    </h4>
                    {recording.streamTitle && (
                      <p className="text-xs text-wise-text-secondary truncate">
                        Stream: {recording.streamTitle}
                      </p>
                    )}
                  </div>
                  <span className="ml-2 px-2 py-0.5 bg-wise-accent-blue/20 text-wise-accent-blue rounded text-xs font-medium">
                    {recording.format}
                  </span>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-3 text-xs text-wise-text-secondary mb-3">
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{formatFileSize(recording.fileSize)}</span>
                  </div>
                  {recording.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(recording.duration)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(recording.startedAt)}</span>
                  </div>
                  {recording.platform && (
                    <span className="px-1.5 py-0.5 bg-wise-surface rounded text-xs">
                      {recording.platform}
                    </span>
                  )}
                  {recording.isSplit && (
                    <span className="px-1.5 py-0.5 bg-wise-accent-orange/20 text-wise-accent-orange rounded text-xs">
                      {recording.splitParts} parts
                    </span>
                  )}
                </div>

                {/* Quality Indicator */}
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <span className="text-wise-text-secondary">Quality:</span>
                  <span className="capitalize px-2 py-0.5 bg-wise-surface rounded text-wise-text-primary">
                    {recording.quality}
                  </span>
                  <span className="text-wise-text-secondary">Bitrate:</span>
                  <span className="px-2 py-0.5 bg-wise-surface rounded text-wise-text-primary">
                    {recording.bitrate} kbps
                  </span>
                </div>

                {/* Video Preview (if playing) */}
                <AnimatePresence>
                  {playingId === recording.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 overflow-hidden"
                    >
                      <video
                        src={recording.filePath}
                        controls
                        className="w-full rounded bg-black"
                        style={{ maxHeight: '200px' }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-wise-medium/30">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handlePlay(recording.id, e)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-wise-accent-blue bg-wise-accent-blue/10 hover:bg-wise-accent-blue/20 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      {playingId === recording.id ? 'Pause' : 'Play'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleDownload(recording.id, recording.title, e)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-wise-accent-green bg-wise-accent-green/10 hover:bg-wise-accent-green/20 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleDelete(recording.id, e)}
                    disabled={deletingId === recording.id}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-wise-accent-red bg-wise-accent-red/10 hover:bg-wise-accent-red/20 transition-colors disabled:opacity-50"
                  >
                    {deletingId === recording.id ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      {recordings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-3 border-t border-wise-medium/30 text-xs text-wise-text-secondary flex justify-between"
        >
          <span>{recordings.length} recording(s)</span>
          <span>
            Total: {formatFileSize(recordings.reduce((sum, r) => sum + r.fileSize, 0))}
          </span>
        </motion.div>
      )}
    </div>
  );
}
