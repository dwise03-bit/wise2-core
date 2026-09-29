'use client';

import React from 'react';
import { RecordingStatus } from '@/types/streaming';

interface RecordingControlProps {
  status: RecordingStatus;
  onStart: () => void;
  onStop: () => void;
}

export default function RecordingControl({
  status,
  onStart,
  onStop,
}: RecordingControlProps) {
  const isRecording = status === 'recording';
  const isPaused = status === 'paused';

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase text-gray-400">Recording</h3>

      {/* Status Display */}
      <div className="bg-studio-input border border-studio-line rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Status</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            isRecording
              ? 'bg-red-500/20 text-red-400'
              : isPaused
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>

        {/* Recording Time */}
        {isRecording && (
          <div className="text-center py-2">
            <div className="text-2xl font-display font-black text-white">
              <span className="animate-pulse">●</span> 00:34:12
            </div>
            <div className="text-xs text-gray-500 mt-1">Recording in progress...</div>
          </div>
        )}

        {!isRecording && (
          <div className="text-center py-2 text-gray-500 text-xs">
            Ready to record
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onStart}
          disabled={isRecording}
          className={`flex-1 px-3 py-2 rounded font-semibold text-sm transition-all ${
            isRecording
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
          }`}
        >
          Start
        </button>
        <button
          onClick={onStop}
          disabled={!isRecording}
          className={`flex-1 px-3 py-2 rounded font-semibold text-sm transition-all ${
            !isRecording
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30'
          }`}
        >
          Stop
        </button>
      </div>

      {/* Settings */}
      <div className="bg-studio-input border border-studio-line rounded p-2 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Codec</span>
          <span className="text-white font-semibold">H.264</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Bitrate</span>
          <span className="text-white font-semibold">8 Mbps</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Format</span>
          <span className="text-white font-semibold">MP4</span>
        </div>
      </div>
    </div>
  );
}
