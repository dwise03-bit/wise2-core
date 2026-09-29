'use client';

import { useState, useCallback } from 'react';
import { StreamDestinationButton } from './StreamDestinationButton';
import { StreamConnectionUI } from './StreamConnectionUI';
import type { StreamDestination } from '../../../types/streaming';

export interface StreamDestinationsPanelProps {
  destinations: StreamDestination[];
  onConnect: (destination: StreamDestination) => void;
  onDisconnect: (id: string) => void;
  onSettings: (destination: StreamDestination) => void;
  isLoading?: boolean;
  loadingDestinationId?: string;
  errors?: Record<string, string>;
}

export function StreamDestinationsPanel({
  destinations,
  onConnect,
  onDisconnect,
  onSettings,
  isLoading = false,
  loadingDestinationId,
  errors = {},
}: StreamDestinationsPanelProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  // Default destinations if none provided
  const defaultDestinations: StreamDestination[] = [
    {
      id: 'youtube',
      type: 'youtube',
      name: 'YouTube',
      isConnected: false,
      isActive: false,
    },
    {
      id: 'twitch',
      type: 'twitch',
      name: 'Twitch',
      isConnected: false,
      isActive: false,
    },
    {
      id: 'facebook',
      type: 'facebook',
      name: 'Facebook',
      isConnected: false,
      isActive: false,
    },
    {
      id: 'linkedin',
      type: 'linkedin',
      name: 'LinkedIn',
      isConnected: false,
      isActive: false,
    },
    {
      id: 'rtmp',
      type: 'rtmp',
      name: 'Custom RTMP',
      isConnected: false,
      isActive: false,
    },
  ];

  const displayDestinations =
    destinations.length > 0 ? destinations : defaultDestinations;

  const connectedCount = displayDestinations.filter((d) => d.isConnected).length;
  const activeCount = displayDestinations.filter((d) => d.isActive).length;

  const handleConnect = useCallback(
    (destination: StreamDestination) => {
      onConnect(destination);
    },
    [onConnect]
  );

  const handleDisconnect = useCallback(
    (id: string) => {
      onDisconnect(id);
    },
    [onDisconnect]
  );

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Stream Destinations</h2>
          <p className="text-xs text-gray-400">
            {connectedCount} connected • {activeCount} active
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ⊞ Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ☰ List
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Connected</div>
          <div className="text-2xl font-bold text-green-400">{connectedCount}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Active</div>
          <div className="text-2xl font-bold text-blue-400">{activeCount}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-300">
            {displayDestinations.length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Health</div>
          <div className="text-2xl font-bold text-yellow-400">
            {connectedCount === displayDestinations.length ? '✓' : '○'}
          </div>
        </div>
      </div>

      {/* Destinations Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayDestinations.map((destination) => (
            <button
              key={destination.id}
              onClick={() => setSelectedDestination(
                selectedDestination === destination.id ? null : destination.id
              )}
              className="text-left transition-all"
            >
              <StreamDestinationButton
                destination={destination}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onSettings={onSettings}
                isLoading={
                  isLoading && loadingDestinationId === destination.id
                }
              />
            </button>
          ))}
        </div>
      )}

      {/* Destinations List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {displayDestinations.map((destination) => (
            <div key={destination.id}>
              <div
                onClick={() => setSelectedDestination(
                  selectedDestination === destination.id ? null : destination.id
                )}
                className="cursor-pointer"
              >
                <StreamDestinationButton
                  destination={destination}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onSettings={onSettings}
                  isLoading={
                    isLoading && loadingDestinationId === destination.id
                  }
                />
              </div>

              {/* Expanded Details */}
              {selectedDestination === destination.id && (
                <div className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <StreamConnectionUI
                    destination={destination}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    isLoading={
                      isLoading && loadingDestinationId === destination.id
                    }
                    error={errors[destination.id]}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {connectedCount > 0 && (
        <div className="border-t border-gray-700 pt-6 flex gap-3">
          <button className="flex-1 px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 rounded-lg font-medium text-sm transition-colors">
            ✓ Start All Streams
          </button>
          <button className="flex-1 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 rounded-lg font-medium text-sm transition-colors">
            ■ Stop All Streams
          </button>
        </div>
      )}

      {/* Empty State */}
      {displayDestinations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📡</div>
          <p className="text-gray-400 mb-4">No streaming destinations configured</p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
            Add Destination
          </button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-400">
          ℹ Connect multiple destinations to stream simultaneously across platforms. Each destination can be configured independently.
        </p>
      </div>
    </div>
  );
}
