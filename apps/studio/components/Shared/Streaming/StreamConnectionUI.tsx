'use client';

import { useState } from 'react';
import type { StreamDestination } from '../../../types/streaming';

export interface StreamConnectionUIProps {
  destination: StreamDestination;
  onConnect: (destination: StreamDestination) => void;
  onDisconnect: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function StreamConnectionUI({
  destination,
  onConnect,
  onDisconnect,
  isLoading = false,
  error = null,
}: StreamConnectionUIProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getDestinationIcon = (type: string): string => {
    const icons: Record<string, string> = {
      youtube: '▶',
      twitch: '⚡',
      facebook: 'f',
      linkedin: 'in',
      rtmp: '📡',
      custom: '🔌',
    };
    return icons[type] || '●';
  };

  const getDestinationLabel = (type: string): string => {
    const labels: Record<string, string> = {
      youtube: 'YouTube',
      twitch: 'Twitch',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      rtmp: 'Custom RTMP',
      custom: 'Custom',
    };
    return labels[type] || type;
  };

  const handleToggle = async () => {
    if (destination.isConnected) {
      onDisconnect(destination.id);
    } else {
      onConnect(destination);
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      destination.isConnected
        ? 'bg-green-500/5 border-green-500/30'
        : error
          ? 'bg-red-500/5 border-red-500/30'
          : 'bg-gray-800/50 border-gray-700'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="text-2xl">{getDestinationIcon(destination.type)}</div>

          {/* Info */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">
              {getDestinationLabel(destination.type)}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {/* Status Indicator */}
              <div
                className={`w-2 h-2 rounded-full ${
                  destination.isConnected
                    ? 'bg-green-500 animate-pulse'
                    : error
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  destination.isConnected
                    ? 'text-green-400'
                    : error
                      ? 'text-red-400'
                      : 'text-gray-400'
                }`}
              >
                {destination.isConnected
                  ? 'Connected'
                  : error
                    ? 'Connection Failed'
                    : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            destination.isConnected
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {destination.isConnected ? 'Disconnecting...' : 'Connecting...'}
            </span>
          ) : destination.isConnected ? (
            'Disconnect'
          ) : (
            'Connect'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Connection Details */}
      {destination.isConnected && (
        <div className="bg-black/30 rounded p-3 mb-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full"
          >
            <span className="text-xs font-medium text-gray-300">
              Connection Details
            </span>
            <span className="text-xs text-gray-500">{showDetails ? '▼' : '▶'}</span>
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2 text-xs text-gray-400">
              {destination.url && (
                <div>
                  <div className="font-medium text-gray-300">URL</div>
                  <div className="font-mono text-gray-500 break-all">
                    {destination.url}
                  </div>
                </div>
              )}
              {destination.streamKey && (
                <div>
                  <div className="font-medium text-gray-300">Stream Key</div>
                  <div className="font-mono text-gray-500 flex items-center gap-2">
                    <span>{'*'.repeat(Math.max(8, destination.streamKey.length - 4))}
                      {destination.streamKey.slice(-4)}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(destination.streamKey || '');
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Copy stream key"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status Rows */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Status</span>
          <span
            className={`font-medium ${
              destination.isConnected
                ? 'text-green-400'
                : error
                  ? 'text-red-400'
                  : 'text-gray-400'
            }`}
          >
            {destination.isConnected ? 'Live' : error ? 'Error' : 'Idle'}
          </span>
        </div>

        {destination.isActive && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Activity</span>
            <span className="font-medium text-green-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Streaming
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
