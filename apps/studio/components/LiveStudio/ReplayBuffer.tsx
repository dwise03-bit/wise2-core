'use client';

import React from 'react';

interface ReplayBufferProps {
  active: boolean;
  duration: number;
  onToggle: () => void;
  onSaveClip: () => void;
  onDurationChange: (duration: number) => void;
}

export default function ReplayBuffer({
  active,
  duration,
  onToggle,
  onSaveClip,
  onDurationChange,
}: ReplayBufferProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase text-gray-400">Replay Buffer</h3>

      {/* Status */}
      <div className="bg-studio-input border border-studio-line rounded p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Status</span>
          <button
            onClick={onToggle}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              active
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-gray-700 border border-gray-600 text-gray-400'
            }`}
          >
            {active ? 'Active' : 'Inactive'}
          </button>
        </div>

        {active && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-gray-400">Buffer recording...</span>
            </div>
            <div className="text-xs text-gray-500">
              Keeping last {duration} seconds ready to save
            </div>
          </div>
        )}

        {!active && (
          <div className="text-xs text-gray-500">
            Enable to buffer stream for instant clip saving
          </div>
        )}
      </div>

      {/* Duration Control */}
      <div className="bg-studio-input border border-studio-line rounded p-3 space-y-2">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-400">Buffer Duration</span>
          <span className="text-white font-semibold">{duration}s</span>
        </div>
        <div className="flex gap-2">
          {[30, 60, 120, 300].map(dur => (
            <button
              key={dur}
              onClick={() => onDurationChange(dur)}
              className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                duration === dur
                  ? 'bg-wise-accent/20 border border-wise-accent/50 text-wise-accent'
                  : 'bg-studio-raised border border-studio-line text-gray-400 hover:border-wise-accent/30'
              }`}
            >
              {dur}s
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSaveClip}
        disabled={!active}
        className={`w-full px-3 py-2 rounded font-semibold text-sm transition-all ${
          active
            ? 'bg-wise-accent/20 border border-wise-accent/50 text-wise-accent hover:bg-wise-accent/30'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        Save Clip
      </button>

      {/* Settings */}
      <div className="bg-studio-input border border-studio-line rounded p-2 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Max Clips:</span>
          <span className="text-white font-semibold">10</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Auto Upload:</span>
          <span className="text-white font-semibold">Off</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Format:</span>
          <span className="text-white font-semibold">MP4</span>
        </div>
      </div>
    </div>
  );
}
