'use client';

import React, { useState } from 'react';
import { StreamDestination } from '@/types/streaming';

interface MultistreamConfigProps {
  destinations: StreamDestination[];
}

export default function MultistreamConfig({ destinations }: MultistreamConfigProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getPlatformIcon = (type: string) => {
    const icons: Record<string, string> = {
      youtube: '▶',
      twitch: '◆',
      facebook: 'ⓕ',
      linkedin: '⊶',
      rtmp: '◉',
      custom: '⚙',
    };
    return icons[type] || '●';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase text-gray-400">Multistreaming</h3>

      <div className="space-y-2">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => setExpandedId(expandedId === dest.id ? null : dest.id)}
            className={`rounded border cursor-pointer transition-all ${
              expandedId === dest.id
                ? 'bg-studio-input border-wise-accent/50'
                : dest.isConnected && dest.isActive
                ? 'bg-studio-input border-green-500/30 hover:border-green-500/50'
                : dest.isConnected
                ? 'bg-studio-input border-studio-line hover:border-wise-accent/30'
                : 'bg-studio-input border-red-500/30 hover:border-red-500/50'
            }`}
          >
            <div className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlatformIcon(dest.type)}</span>
                  <span className="text-xs font-semibold text-white">{dest.name}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  dest.isActive && dest.isConnected
                    ? 'bg-green-400'
                    : dest.isConnected
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}></div>
              </div>

              {expandedId === dest.id && (
                <div className="mt-2 pt-2 border-t border-studio-line/50 space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ${
                        dest.isConnected ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {dest.isConnected ? 'Connected' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stream:</span>
                      <span className={`font-semibold ${
                        dest.isActive ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        {dest.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {dest.url && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL:</span>
                        <span className="text-gray-400 truncate text-xs">{dest.url}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button className={`flex-1 px-2 py-1 text-xs rounded font-semibold transition-all ${
                      dest.isActive
                        ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                    }`}>
                      {dest.isActive ? 'Stop' : 'Start'}
                    </button>
                    <button className="flex-1 px-2 py-1 text-xs rounded font-semibold bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition">
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Stream Button */}
      <button className="w-full p-2 rounded border border-dashed border-studio-line hover:border-wise-accent/50 text-xs text-gray-500 hover:text-wise-accent transition-colors">
        + Add Stream Destination
      </button>
    </div>
  );
}
