/**
 * VOD Upload UI Component
 *
 * React component for managing VOD uploads with:
 * - Per-platform auto-upload toggle
 * - Visibility selector
 * - Upload progress tracking (last 10)
 * - Failed uploads retry logic
 * - Real-time upload status
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { VODUploadJob, VODPlatform, VODVisibility, VODUploadStatus } from './VODTypes';
import { getVODEngine } from './VODUploadEngine';
import { getVODQueue } from './VODUploadQueue';

interface VODUploadUIProps {
  recordingId?: string;
  recordingPath?: string;
  title?: string;
  description?: string;
  onUploadComplete?: (jobId: string) => void;
  onUploadFailed?: (jobId: string, error: string) => void;
}

interface UploadHistoryItem {
  jobId: string;
  recordingId: string;
  title: string;
  status: VODUploadStatus;
  progress: number;
  platforms: VODPlatform[];
  timestamp: Date;
  error?: string;
}

const PLATFORM_COLORS: Record<VODPlatform, string> = {
  youtube: 'bg-red-600',
  twitch: 'bg-purple-600',
  s3: 'bg-orange-600',
  custom: 'bg-blue-600',
};

const PLATFORM_LABELS: Record<VODPlatform, string> = {
  youtube: 'YouTube',
  twitch: 'Twitch',
  s3: 'AWS S3',
  custom: 'Custom',
};

export function VODUploadUI({
  recordingId,
  recordingPath,
  title = 'Stream Recording',
  description,
  onUploadComplete,
  onUploadFailed,
}: VODUploadUIProps) {
  const engine = getVODEngine();
  const queue = getVODQueue();

  const [autoUploadEnabled, setAutoUploadEnabled] = useState(true);
  const [visibility, setVisibility] = useState<VODVisibility>('unlisted');
  const [selectedPlatforms, setSelectedPlatforms] = useState<VODPlatform[]>([
    'youtube',
    's3',
  ]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [queueSize, setQueueSize] = useState(0);
  const [activeJobs, setActiveJobs] = useState<Map<string, VODUploadJob>>(
    new Map()
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Subscribe to upload events
  useEffect(() => {
    const handleUploadEvent = (event: any) => {
      switch (event.type) {
        case 'upload_started':
          setIsUploading(true);
          break;
        case 'upload_completed':
          const completedJob = engine.getJobStatus(event.jobId);
          if (completedJob) {
            addToHistory(completedJob);
            onUploadComplete?.(event.jobId);
          }
          break;
        case 'upload_failed':
          onUploadFailed?.(event.jobId, event.error || 'Unknown error');
          break;
        case 'platform_progress':
          // Update progress in real-time
          break;
      }
    };

    engine.on('upload_event', handleUploadEvent);
    return () => {
      engine.removeListener('upload_event', handleUploadEvent);
    };
  }, [engine, onUploadComplete, onUploadFailed]);

  // Update queue size periodically
  useEffect(() => {
    const updateQueueSize = () => {
      setQueueSize(queue.size());
    };

    const interval = setInterval(updateQueueSize, 1000);
    updateQueueSize();

    return () => clearInterval(interval);
  }, [queue]);

  const addToHistory = useCallback((job: VODUploadJob) => {
    setUploadHistory((prev) => [
      {
        jobId: job.id,
        recordingId: job.recordingId,
        title: job.metadata.title,
        status: job.status,
        progress: job.progress,
        platforms: job.platforms,
        timestamp: new Date(),
        error: job.error,
      },
      ...prev,
    ].slice(0, 10)); // Keep last 10
  }, []);

  const handleStartUpload = useCallback(async () => {
    if (!recordingPath) {
      console.error('Recording path is required');
      return;
    }

    if (selectedPlatforms.length === 0) {
      console.error('Select at least one platform');
      return;
    }

    const metadata = {
      id: recordingId || `rec-${Date.now()}`,
      recordingId: recordingId || `rec-${Date.now()}`,
      title,
      description,
      tags: [],
      duration: 0,
      fileSize: 0,
      resolution: '1920x1080',
      frameRate: 30,
      bitrate: 5000,
      recordedAt: new Date(),
      createdAt: new Date(),
    };

    const job = await engine.createUploadJob(
      recordingPath,
      metadata,
      selectedPlatforms,
      visibility
    );

    setIsUploading(true);
  }, [recordingPath, recordingId, title, description, selectedPlatforms, visibility, engine]);

  const handlePlatformToggle = (platform: VODPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleRetryFailed = useCallback((jobId: string) => {
    engine.resumeUpload(jobId);
  }, [engine]);

  const handleCancelUpload = useCallback((jobId: string) => {
    engine.cancelUpload(jobId);
    setUploadHistory((prev) =>
      prev.map((item) =>
        item.jobId === jobId ? { ...item, status: 'failed' } : item
      )
    );
  }, [engine]);

  const getStatusColor = (status: VODUploadStatus): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'uploading':
      case 'processing':
        return 'text-blue-600';
      case 'paused':
        return 'text-yellow-600';
      case 'pending':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-slate-900 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">VOD Upload Manager</h2>
        <p className="text-sm text-slate-400">
          Automatically upload your recordings to multiple platforms
        </p>
      </div>

      {/* Auto-Upload Toggle */}
      <div className="mb-6 p-4 bg-slate-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Auto-Upload</h3>
            <p className="text-xs text-slate-400">
              {autoUploadEnabled
                ? 'Enabled - uploads start automatically'
                : 'Disabled - manual upload only'}
            </p>
          </div>
          <button
            onClick={() => {
              setAutoUploadEnabled(!autoUploadEnabled);
              engine.setAutoUploadEnabled(!autoUploadEnabled);
            }}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              autoUploadEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {autoUploadEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Visibility Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-2">
          Visibility
        </label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as VODVisibility)}
          className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Platform Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-3">
          Upload Platforms
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(PLATFORM_LABELS).map(([platform, label]) => (
            <button
              key={platform}
              onClick={() => handlePlatformToggle(platform as VODPlatform)}
              className={`p-3 rounded-lg border-2 text-left font-medium transition-all ${
                selectedPlatforms.includes(platform as VODPlatform)
                  ? `${PLATFORM_COLORS[platform as VODPlatform]} border-opacity-50 text-white`
                  : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded border border-current ${
                    selectedPlatforms.includes(platform as VODPlatform)
                      ? 'bg-current'
                      : ''
                  }`}
                />
                {label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Start Upload Button */}
      <button
        onClick={handleStartUpload}
        disabled={selectedPlatforms.length === 0}
        className="w-full py-3 mb-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors"
      >
        {isUploading ? 'Uploading...' : 'Start Upload'}
      </button>

      {/* Queue Status */}
      {queueSize > 0 && (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">Queue Status</h4>
              <p className="text-xs text-slate-400">
                {queueSize} item{queueSize !== 1 ? 's' : ''} waiting
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-400">{queueSize}</div>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          Advanced Options
        </button>
        {showAdvanced && (
          <div className="mt-3 p-4 bg-slate-800 rounded-lg space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">
                Retry Policy
              </label>
              <p className="text-xs text-slate-500">
                Automatic retry with exponential backoff enabled
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">
                Thumbnail Generation
              </label>
              <p className="text-xs text-slate-500">
                Auto-generated from middle keyframe (1280x720 JPEG)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div className="mt-6 border-t border-slate-700 pt-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Recent Uploads (Last 10)
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {uploadHistory.map((item) => (
              <div
                key={item.jobId}
                className="p-3 bg-slate-800 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{item.title}</p>
                    <p className={`text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {/* Platform Badges */}
                <div className="flex gap-2 mb-2 flex-wrap">
                  {item.platforms.map((platform) => (
                    <span
                      key={platform}
                      className={`px-2 py-1 text-xs font-medium rounded text-white ${
                        PLATFORM_COLORS[platform]
                      }`}
                    >
                      {PLATFORM_LABELS[platform]}
                    </span>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all ${
                      item.status === 'completed'
                        ? 'bg-green-600'
                        : item.status === 'failed'
                          ? 'bg-red-600'
                          : 'bg-blue-600'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                {/* Error and Actions */}
                {item.error && (
                  <p className="text-xs text-red-400 mb-2">{item.error}</p>
                )}

                {item.status === 'failed' && (
                  <button
                    onClick={() => handleRetryFailed(item.jobId)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Retry
                  </button>
                )}

                {(item.status === 'uploading' || item.status === 'processing') && (
                  <button
                    onClick={() => handleCancelUpload(item.jobId)}
                    className="text-xs text-red-400 hover:text-red-300 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadHistory.length === 0 && !isUploading && (
        <div className="mt-6 text-center py-8 text-slate-400 text-sm">
          No uploads yet. Select platforms and start uploading!
        </div>
      )}
    </div>
  );
}

export default VODUploadUI;
