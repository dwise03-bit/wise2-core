'use client';

import React, { useState } from 'react';

interface Destination {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  viewers?: number;
}

interface StreamDestinationsProps {
  destinations?: Destination[];
  // eslint-disable-next-line no-unused-vars
  onDestinationToggle?: (destinationId: string, isActive: boolean) => void;
}

const DEFAULT_DESTINATIONS: Destination[] = [
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'text-red-500', isActive: true, status: 'connected', viewers: 487 },
  { id: 'facebook', name: 'Facebook', icon: '👍', color: 'text-blue-600', isActive: true, status: 'connected', viewers: 342 },
  { id: 'twitch', name: 'Twitch', icon: '💜', color: 'text-purple-500', isActive: true, status: 'connected', viewers: 521 },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'text-blue-700', isActive: false, status: 'disconnected', viewers: 0 },
  { id: 'custom', name: 'Custom RTMP', icon: '🔗', color: 'text-gray-400', isActive: false, status: 'disconnected', viewers: 0 },
];

/**
 * StreamDestinations Component
 * Displays stream destination platforms with live status indicators
 */
export function StreamDestinations({
  destinations = DEFAULT_DESTINATIONS,
  onDestinationToggle,
}: StreamDestinationsProps) {
  const [localDestinations, setLocalDestinations] = useState(destinations);

  const handleToggle = (destinationId: string) => {
    const destination = localDestinations.find((d) => d.id === destinationId);
    if (destination) {
      const newIsActive = !destination.isActive;
      setLocalDestinations(
        localDestinations.map((d) =>
          d.id === destinationId
            ? { ...d, isActive: newIsActive, status: newIsActive ? 'connecting' : 'disconnected' }
            : d
        )
      );
      onDestinationToggle?.(destinationId, newIsActive);

      // Simulate connection
      if (newIsActive) {
        setTimeout(() => {
          setLocalDestinations((prev) =>
            prev.map((d) =>
              d.id === destinationId ? { ...d, status: 'connected' } : d
            )
          );
        }, 1000);
      }
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'connecting':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const totalViewers = localDestinations
    .filter((d) => d.isActive && d.status === 'connected')
    .reduce((sum, d) => sum + (d.viewers || 0), 0);

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md space-y-md">
      {/* Header */}
      <div className="border-b border-gray-700/50 pb-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Stream Destinations</h3>
            <p className="text-xs text-gray-400 mt-1">Multi-platform broadcast</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">{totalViewers.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Total viewers</p>
          </div>
        </div>
      </div>

      {/* Destinations List */}
      <div className="space-y-sm">
        {localDestinations.map((destination) => (
          <div
            key={destination.id}
            className={`flex items-center justify-between p-sm rounded-lg border transition-all ${
              destination.isActive
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-gray-800/20 border-gray-700/30'
            }`}
          >
            {/* Destination Info */}
            <div className="flex items-center gap-md flex-1">
              <span className="text-2xl">{destination.icon}</span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{destination.name}</h4>
                <p className="text-xs text-gray-500">
                  {destination.isActive && destination.viewers ? `${destination.viewers} viewers` : 'Inactive'}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(destination.status)}`}>
              <span>{getStatusIcon(destination.status)}</span>
              <span className="capitalize">{destination.status}</span>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => handleToggle(destination.id)}
              className={`ml-md px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                destination.isActive
                  ? 'bg-green-500/30 text-green-400 hover:bg-green-500/40 border border-green-500/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {destination.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>

      {/* Add Custom Destination */}
      <div className="border-t border-gray-700/50 pt-md">
        <button className="w-full px-md py-sm rounded-lg border border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 text-sm font-semibold transition-colors">
          + Add Custom RTMP
        </button>
      </div>
    </div>
  );
}
