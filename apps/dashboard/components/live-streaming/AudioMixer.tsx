'use client';

import React, { useState } from 'react';

interface ChannelConfig {
  id: string;
  name: string;
  icon: string;
  volume: number;
  muted: boolean;
  peakLevel: number;
}

interface AudioMixerProps {
  channels?: ChannelConfig[];
  // eslint-disable-next-line no-unused-vars
  onChannelVolumeChange?: (channelId: string, volume: number) => void;
  // eslint-disable-next-line no-unused-vars
  onChannelMute?: (channelId: string, muted: boolean) => void;
  masterVolume?: number;
  // eslint-disable-next-line no-unused-vars
  onMasterVolumeChange?: (volume: number) => void;
}

const DEFAULT_CHANNELS: ChannelConfig[] = [
  { id: 'mic1', name: 'MIC 1', icon: '🎙️', volume: 0.85, muted: false, peakLevel: -12 },
  { id: 'mic2', name: 'MIC 2', icon: '🎙️', volume: 0.65, muted: false, peakLevel: -18 },
  { id: 'system', name: 'System Audio', icon: '🔊', volume: 0.7, muted: false, peakLevel: -14 },
  { id: 'music', name: 'Music', icon: '🎵', volume: 0.5, muted: false, peakLevel: -20 },
  { id: 'guest', name: 'Guest', icon: '👥', volume: 0.75, muted: false, peakLevel: -16 },
];

/**
 * AudioMixer Component
 * Displays audio mixer panel with multiple channels, volume sliders, and level meters
 */
export function AudioMixer({
  channels = DEFAULT_CHANNELS,
  onChannelVolumeChange,
  onChannelMute,
  masterVolume = 0.8,
  onMasterVolumeChange,
}: AudioMixerProps) {
  const [localChannels, setLocalChannels] = useState(channels);
  const [localMasterVolume, setLocalMasterVolume] = useState(masterVolume);

  const handleChannelVolumeChange = (channelId: string, volume: number) => {
    setLocalChannels(
      localChannels.map((ch) => (ch.id === channelId ? { ...ch, volume } : ch))
    );
    onChannelVolumeChange?.(channelId, volume);
  };

  const handleChannelMute = (channelId: string) => {
    setLocalChannels(
      localChannels.map((ch) =>
        ch.id === channelId ? { ...ch, muted: !ch.muted } : ch
      )
    );
    onChannelMute?.(channelId, !localChannels.find((ch) => ch.id === channelId)?.muted);
  };

  const handleMasterVolumeChange = (volume: number) => {
    setLocalMasterVolume(volume);
    onMasterVolumeChange?.(volume);
  };

  const getMeterColor = (level: number): string => {
    if (level >= 0) return 'bg-red-500';
    if (level >= -3) return 'bg-yellow-500';
    if (level >= -12) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getMeterBarColor = (level: number): string => {
    if (level >= 0) return '#ef4444';
    if (level >= -3) return '#eab308';
    if (level >= -12) return '#f97316';
    return '#22c55e';
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md space-y-md">
      {/* Header */}
      <div className="border-b border-gray-700/50 pb-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Audio Mixer</h3>
        <p className="text-xs text-gray-400 mt-1">Multi-track audio control</p>
      </div>

      {/* Channels Scroll Container */}
      <div className="space-y-sm overflow-y-auto max-h-60">
        {localChannels.map((channel) => (
          <div
            key={channel.id}
            className="bg-gray-800/50 rounded-md p-sm border border-gray-700/30 hover:border-blue-500/20 transition-colors"
          >
            {/* Channel Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{channel.icon}</span>
                <span className="text-sm font-semibold text-gray-200">{channel.name}</span>
              </div>
              <button
                onClick={() => handleChannelMute(channel.id)}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  channel.muted
                    ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {channel.muted ? '🔇' : '🔊'}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="mb-2">
              <input
                type="range"
                min="0"
                max="100"
                value={channel.volume * 100}
                onChange={(e) => handleChannelVolumeChange(channel.id, parseFloat(e.target.value) / 100)}
                disabled={channel.muted}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Volume Display and Level Meter */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {Math.round(channel.volume * 100)}%
              </span>
              {/* Level meter bars */}
              <div className="flex-1 mx-2 flex items-end gap-0.5 h-4">
                {Array.from({ length: 12 }).map((_, i) => {
                  const barLevel = channel.peakLevel + (i * 2);
                  const isActive = barLevel > -30;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm transition-all"
                      style={{
                        height: isActive ? `${Math.max(20, (barLevel + 30) / 30 * 100)}%` : '2px',
                        backgroundColor: isActive ? getMeterBarColor(barLevel) : '#4b5563',
                      }}
                    />
                  );
                })}
              </div>
              <span className={`text-xs font-mono ${getMeterColor(channel.peakLevel)} text-right w-10`}>
                {channel.peakLevel.toFixed(0)} dB
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Master Volume Section */}
      <div className="border-t border-gray-700/50 pt-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎚️</span>
            <span className="text-sm font-bold text-white">Master Volume</span>
          </div>
          <span className="text-sm font-mono text-blue-400">{Math.round(localMasterVolume * 100)}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={localMasterVolume * 100}
          onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value) / 100)}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />

        {/* Master Peak Indicator */}
        <div className="mt-3 bg-gray-800/50 rounded-md p-2 border border-gray-700/30">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-400">Peak Output</span>
            <span className="text-xs font-mono text-green-400">-6 dB</span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {Array.from({ length: 24 }).map((_, i) => {
              const level = -30 + (i * 2.5);
              const isActive = level > -6;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: isActive ? `${Math.max(8, (level + 30) / 30 * 100)}%` : '2px',
                    backgroundColor: isActive ? '#22c55e' : '#4b5563',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
