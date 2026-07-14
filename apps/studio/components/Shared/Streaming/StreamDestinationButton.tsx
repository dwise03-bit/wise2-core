'use client';

import { useState } from 'react';
import type { StreamDestination } from '../../../types/streaming';

export interface StreamDestinationButtonProps {
  destination: StreamDestination;
  onConnect: (destination: StreamDestination) => void;
  onDisconnect: (id: string) => void;
  onSettings: (destination: StreamDestination) => void;
  isLoading?: boolean;
}

export function StreamDestinationButton({
  destination,
  onConnect,
  onDisconnect,
  onSettings,
  isLoading = false,
}: StreamDestinationButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getDestinationColor = (type: string) => {
    const colors: Record<string, string> = {
      youtube: 'text-red-500 border-red-500/30 bg-red-500/10 hover:border-red-500/60',
      twitch: 'text-purple-500 border-purple-500/30 bg-purple-500/10 hover:border-purple-500/60',
      facebook: 'text-blue-600 border-blue-600/30 bg-blue-600/10 hover:border-blue-600/60',
      linkedin: 'text-blue-400 border-blue-400/30 bg-blue-400/10 hover:border-blue-400/60',
      rtmp: 'text-orange-500 border-orange-500/30 bg-orange-500/10 hover:border-orange-500/60',
      custom: 'text-gray-400 border-gray-500/30 bg-gray-500/10 hover:border-gray-500/60',
    };
    return colors[type] || colors.custom;
  };

  const getStatusColor = (isConnected: boolean) => {
    return isConnected
      ? 'bg-green-500'
      : 'bg-gray-500';
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

  const handleToggleConnection = () => {
    if (destination.isConnected) {
      onDisconnect(destination.id);
    } else {
      onConnect(destination);
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${getDestinationColor(destination.type)}`}
        disabled={isLoading}
      >
        {/* Status Indicator */}
        <div className="flex items-center gap-2 flex-1">
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor(destination.isConnected)} ${
              destination.isConnected ? 'animate-pulse' : ''
            }`}
          />
          <span className="text-sm font-medium">{getDestinationLabel(destination.type)}</span>
        </div>

        {/* Status Badge */}
        <span className="text-xs px-2 py-1 rounded bg-black/20">
          {destination.isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 min-w-max">
          <button
            onClick={handleToggleConnection}
            disabled={isLoading}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-800 transition-colors first:rounded-t-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {destination.isConnected ? '⊘ Disconnect' : '+ Connect'}
          </button>

          <button
            onClick={() => {
              onSettings(destination);
              setShowMenu(false);
            }}
            disabled={isLoading}
            className={`w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-gray-800 transition-colors border-t border-gray-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ⚙ Settings
          </button>

          <button
            onClick={() => setShowMenu(false)}
            className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-gray-800 transition-colors border-t border-gray-700 last:rounded-b-lg"
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
