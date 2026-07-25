'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RecordingStatus, RecordingMetadata } from './types';

interface RecordingControlProps {
  onStart: (config: any) => Promise<void>;
  onStop: () => Promise<void>;
  onPause: () => void;
  onResume: () => void;
  status: RecordingStatus;
  duration: number;
  fileSize: number;
  splitCount: number;
  recording?: RecordingMetadata;
  isLoading?: boolean;
  error?: string;
}

/**
 * RecordingControl Component
 *
 * Provides UI controls for:
 * - Record toggle button (⭕ red when recording)
 * - Recording timer (mm:ss)
 * - Pause/Resume controls
 * - Stop + save button
 * - Recording folder display
 * - Open folder button
 * - Recent recordings list
 */
export const RecordingControl: React.FC<RecordingControlProps> = ({
  onStart,
  onStop,
  onPause,
  onResume,
  status,
  duration,
  fileSize,
  splitCount,
  recording,
  isLoading = false,
  error,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPauseDisabled, setIsPauseDisabled] = useState(false);
  const [pauseStart, setPauseStart] = useState<number | null>(null);

  // Update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (status === 'RECORDING') {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Enforce 30-second pause limit
  useEffect(() => {
    if (status === 'PAUSED' && pauseStart === null) {
      setPauseStart(Date.now());
    } else if (status === 'RECORDING' && pauseStart !== null) {
      setPauseStart(null);
      setIsPauseDisabled(false);
    }
  }, [status, pauseStart]);

  // Check pause duration limit
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (status === 'PAUSED' && pauseStart !== null) {
      timeout = setTimeout(() => {
        setIsPauseDisabled(true);
      }, 30000); // 30 seconds
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [status, pauseStart]);

  const handleStart = useCallback(async () => {
    try {
      await onStart({
        format: 'mp4',
        quality: 'high',
        bitrate: 5000,
      });
      setElapsedTime(0);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [onStart]);

  const handleStop = useCallback(async () => {
    try {
      await onStop();
      setElapsedTime(0);
      setPauseStart(null);
      setIsPauseDisabled(false);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, [onStop]);

  const handlePause = useCallback(() => {
    onPause();
  }, [onPause]);

  const handleResume = useCallback(() => {
    onResume();
  }, [onResume]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isRecording = status === 'RECORDING';
  const isPaused = status === 'PAUSED';

  return (
    <div className="recording-control border border-amber-500/20 rounded-lg p-6 bg-slate-900/50 backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-400">Stream Recording</h3>
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400">RECORDING</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Timer and Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Duration */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-amber-400">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Duration</div>
        </div>

        {/* File Size */}
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-cyan-400">
            {formatFileSize(fileSize)}
          </div>
          <div className="text-xs text-gray-400 mt-1">File Size</div>
        </div>

        {/* Split Parts */}
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-lime-400">
            {splitCount} {splitCount === 1 ? 'file' : 'files'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {splitCount > 1 ? 'Split' : 'Part'}
          </div>
        </div>
      </div>

      {/* Progress Bar (if recording) */}
      {isRecording && (
        <div className="mb-6">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{
                width: `${Math.min((fileSize / (5 * 1024 * 1024 * 1024)) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Next split at 1 GB
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        {/* Record Button */}
        {!isRecording && status !== 'PAUSED' && (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white rounded font-medium transition-colors"
          >
            <div className="w-4 h-4 bg-white rounded-full" />
            {isLoading ? 'Starting...' : 'Start Recording'}
          </button>
        )}

        {/* Pause Button */}
        {isRecording && (
          <button
            onClick={handlePause}
            className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition-colors"
          >
            ⏸ Pause
          </button>
        )}

        {/* Resume Button */}
        {isPaused && (
          <button
            onClick={handleResume}
            disabled={isPauseDisabled}
            className="flex-1 px-4 py-3 bg-lime-600 hover:bg-lime-700 disabled:bg-slate-600 text-white rounded font-medium transition-colors"
          >
            ▶ Resume
            {isPauseDisabled && <span className="text-xs ml-2">(Time limit exceeded)</span>}
          </button>
        )}

        {/* Stop Button */}
        {(isRecording || isPaused) && (
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded font-medium transition-colors"
          >
            ⏹ Stop & Save
          </button>
        )}
      </div>

      {/* Recording Info */}
      {recording && (
        <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Title:</span>
            <span className="text-white">{recording.title}</span>
          </div>
          {recording.platform && (
            <div className="flex justify-between">
              <span className="text-gray-400">Platform:</span>
              <span className="text-white capitalize">{recording.platform}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Format:</span>
            <span className="text-white">{recording.format}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quality:</span>
            <span className="text-white capitalize">{recording.quality}</span>
          </div>
        </div>
      )}

      {/* Open Folder Button */}
      <button className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded transition-colors">
        📁 Open Recordings Folder
      </button>
    </div>
  );
};

export default RecordingControl;
