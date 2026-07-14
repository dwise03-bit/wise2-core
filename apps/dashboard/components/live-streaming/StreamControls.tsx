'use client';

/* eslint-disable no-unused-vars */
import React from 'react';

interface StreamControlsProps {
  isLive: boolean;
  onToggleLive: (isLive: boolean) => void;
  isLoading?: boolean;
}

/**
 * StreamControls Component
 * GO LIVE and END STREAM button controls
 */
export function StreamControls({ isLive, onToggleLive, isLoading = false }: StreamControlsProps) {
  return (
    <div className="flex gap-md">
      <button
        onClick={() => onToggleLive(!isLive)}
        disabled={isLoading}
        className={`flex-1 py-md px-lg rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          isLive
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            {isLive ? 'Stopping...' : 'Starting...'}
          </>
        ) : (
          <>
            {isLive ? (
              <>
                <span>⏹</span>
                END STREAM
              </>
            ) : (
              <>
                <span>🔴</span>
                GO LIVE
              </>
            )}
          </>
        )}
      </button>

      <button
        className="px-lg py-md rounded-lg border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold transition-all duration-200"
        title="Stream settings"
      >
        ⚙️
      </button>

      <button
        className="px-lg py-md rounded-lg border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold transition-all duration-200"
        title="Stream info"
      >
        ℹ️
      </button>
    </div>
  );
}
