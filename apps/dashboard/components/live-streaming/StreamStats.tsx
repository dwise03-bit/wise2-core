'use client';

import React from 'react';

interface StreamStatsProps {
  streamKey: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  bitrate: number; // in kbps
  resolution: string;
  frameRate: number;
  masterVolume?: number;
}

/**
 * StreamStats Component
 * Displays stream status cards: Stream Key, Health, Bitrate, Resolution, Frame Rate
 */
export function StreamStats({
  streamKey,
  health,
  bitrate,
  resolution,
  frameRate,
  masterVolume = 0,
}: StreamStatsProps) {
  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'excellent':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'good':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'fair':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'poor':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getHealthLabel = (health: string): string => {
    return health.charAt(0).toUpperCase() + health.slice(1);
  };

  const maskStreamKey = (key: string): string => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(Math.max(4, key.length - 8)) + key.substring(key.length - 4);
  };

  return (
    <div className="grid grid-cols-2 gap-md">
      {/* Stream Key Card */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md hover:border-blue-500/30 transition-colors">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Stream Key</p>
        <div className="flex items-center gap-2 mb-2">
          <code className="text-sm font-mono text-blue-400 flex-1 truncate">
            {maskStreamKey(streamKey)}
          </code>
          <button className="text-gray-400 hover:text-blue-400 transition-colors" title="Copy stream key">
            📋
          </button>
        </div>
        <p className="text-xs text-gray-500">Use with your encoder</p>
      </div>

      {/* Health Card */}
      <div className={`border rounded-lg p-md transition-all ${getHealthColor(health)}`}>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Health</p>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${health === 'excellent' ? 'bg-green-400 animate-pulse' : 'bg-current'}`} />
          <span className="font-bold text-lg">{getHealthLabel(health)}</span>
        </div>
        <p className="text-xs mt-2 opacity-75">Connection stable</p>
      </div>

      {/* Bitrate Card */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md hover:border-blue-500/30 transition-colors">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Bitrate</p>
        <div className="text-2xl font-bold text-blue-400 mb-1">{bitrate.toLocaleString()} kbps</div>
        <p className="text-xs text-gray-500">Target: 8,500 kbps</p>
      </div>

      {/* Resolution Card */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md hover:border-blue-500/30 transition-colors">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Resolution</p>
        <div className="text-2xl font-bold text-purple-400 mb-1">{resolution}</div>
        <p className="text-xs text-gray-500">High quality preset</p>
      </div>

      {/* Frame Rate Card */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md hover:border-blue-500/30 transition-colors">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Frame Rate</p>
        <div className="text-2xl font-bold text-green-400 mb-1">{frameRate} fps</div>
        <p className="text-xs text-gray-500">Smooth streaming</p>
      </div>

      {/* Master Volume Card */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md hover:border-blue-500/30 transition-colors">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Master Volume</p>
        <div className="text-2xl font-bold text-blue-400 mb-1">{Math.round(masterVolume * 100)}%</div>
        <p className="text-xs text-gray-500">Audio output level</p>
      </div>
    </div>
  );
}
