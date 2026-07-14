'use client';

import { useState } from 'react';

export interface MixerChannelProps {
  name: string;
  label: string;
  volume: number;
  peakLevel: number;
  isMuted: boolean;
  isSolo: boolean;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  index?: number;
}

export function MixerChannel({
  name,
  label,
  volume,
  peakLevel,
  isMuted,
  isSolo,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
  index = 0,
}: MixerChannelProps) {
  const getColorFromLevel = (level: number) => {
    if (level > -3) return 'bg-red-500';
    if (level > -6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex flex-col items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
      <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{name}</div>

      {/* VU Meter */}
      <div className="w-8 h-24 bg-gray-950 rounded border border-gray-700 flex flex-col-reverse justify-start overflow-hidden">
        <div
          className={`w-full transition-all duration-100 ${getColorFromLevel(peakLevel)}`}
          style={{ height: `${Math.max(0, (peakLevel + 80) / 80) * 100}%` }}
        />
      </div>

      {/* Fader */}
      <input
        type="range"
        min="-60"
        max="6"
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="h-32 w-8 cursor-pointer appearance-none bg-transparent"
        style={{
          writingMode: 'bt-lr',
        }}
      />

      {/* Level Display */}
      <div className="text-xs font-mono text-blue-400">{Math.round(volume)} dB</div>

      {/* Mute/Solo Buttons */}
      <div className="flex gap-1">
        <button
          onClick={onMuteToggle}
          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
            isMuted
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          title="Mute"
        >
          M
        </button>
        <button
          onClick={onSoloToggle}
          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
            isSolo
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          title="Solo"
        >
          S
        </button>
      </div>

      {/* Channel Label */}
      <div className="text-xs text-gray-500 text-center">{label}</div>
    </div>
  );
}
