'use client';

/* eslint-disable no-unused-vars */

/**
 * Transport controls for playback (play, pause, stop, record)
 */

import { useState } from 'react';

interface TransportControlsProps {
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  onSeek: (time: number) => void;
}

export function TransportControls({
  isPlaying,
  isRecording,
  currentTime,
  duration,
  onPlay,
  onPause,
  onStop,
  onRecord,
  onSeek,
}: TransportControlsProps) {
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    onSeek(percentage * duration);
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-950 border border-chrome/20 rounded-lg p-4">
      {/* Transport Buttons */}
      <div className="flex items-center gap-4">
        {/* Record Button */}
        <button
          onClick={onRecord}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white'
          }`}
          title="Record (R)"
        >
          ●
        </button>

        {/* Play Button */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
            isPlaying
              ? 'bg-blue-500 hover:bg-blue-400 text-white'
              : 'bg-gray-800 hover:bg-blue-600 text-gray-300'
          }`}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          className="w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center font-bold transition-all"
          title="Stop (Shift+Space)"
        >
          ⏹
        </button>

        {/* Time Display */}
        <div className="flex-1 flex items-center gap-2">
          <span className="font-mono text-sm text-gray-400 whitespace-nowrap">
            {formatTime(currentTime)}
          </span>
          <span className="text-gray-600">/</span>
          <span className="font-mono text-sm text-gray-400 whitespace-nowrap">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Timeline/Scrubber */}
      <div
        className="w-full h-6 bg-gray-900 rounded border border-chrome/20 cursor-pointer relative group"
        onMouseMove={() => setIsHoveringTimeline(true)}
        onMouseLeave={() => setIsHoveringTimeline(false)}
        onClick={handleTimelineClick}
      >
        {/* Progress bar */}
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-l transition-none"
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />

        {/* Playhead indicator */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg transition-opacity ${
            isHoveringTimeline ? 'opacity-100' : 'opacity-50'
          }`}
          style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
