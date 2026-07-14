'use client';

/**
 * Track control panel - shows individual track with name, controls, and metering
 */

import { Track } from '@wise2/audio';
import { useState } from 'react';

interface TrackPanelProps {
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  peakLevel: number;
}

export function TrackPanel({
  track,
  isSelected,
  onSelect,
  onRemove,
  peakLevel,
}: TrackPanelProps) {
  const [volume, setVolume] = useState<number>(track.getVolume() * 100);
  const [pan, setPan] = useState<number>((track.getPan() + 1) * 50);
  const [isMuted, setIsMuted] = useState<boolean>(track.isMutedTrack());
  const [isSoloed, setIsSoloed] = useState<boolean>(track.isSoloTrack());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    track.setVolume(value / 100);
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPan(value);
    track.setPan((value / 50) - 1);
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    track.setMuted(newMuted);
  };

  const handleSoloToggle = () => {
    const newSoloed = !isSoloed;
    setIsSoloed(newSoloed);
    track.setSolo(newSoloed);
  };

  return (
    <div
      className={`flex flex-col gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-500/10 border-blue-500'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      {/* Track Name & Peak Meter */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-white truncate">
            {track.getName()}
          </h4>
          <p className="text-xs text-gray-400">
            {peakLevel === -Infinity ? '-∞' : `${peakLevel.toFixed(1)} dB`}
          </p>
        </div>

        {/* Peak Meter Visual */}
        <div className="w-6 h-20 bg-gray-950 rounded border border-gray-700 relative overflow-hidden">
          {/* Red zone for clipping */}
          <div className="absolute top-0 w-full h-1 bg-red-500" />
          {/* Yellow zone for caution */}
          <div className="absolute top-1 w-full h-2 bg-yellow-500" />
          {/* Green zone for safe */}
          <div className="absolute top-3 w-full h-16 bg-green-500" />

          {/* Meter indicator */}
          <div
            className="absolute bottom-0 w-full bg-gradient-to-b from-green-400 to-blue-500 transition-all"
            style={{
              height: `${Math.max(0, (peakLevel + 40) / 40 * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Mute/Solo Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMuteToggle();
          }}
          className={`flex-1 py-1 px-2 text-xs font-semibold rounded transition-all ${
            isMuted
              ? 'bg-gray-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          M
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSoloToggle();
          }}
          className={`flex-1 py-1 px-2 text-xs font-semibold rounded transition-all ${
            isSoloed
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          S
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-1 py-1 px-2 text-xs font-semibold rounded bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white transition-all"
        >
          ✕
        </button>
      </div>

      {/* Volume Fader */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Volume</label>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="text-xs text-gray-500 text-center">
          {(volume).toFixed(0)}%
        </div>
      </div>

      {/* Pan Control */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Pan</label>
        <input
          type="range"
          min="0"
          max="100"
          value={pan}
          onChange={handlePanChange}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="text-xs text-gray-500 text-center">
          {pan < 45 ? 'L' : pan > 55 ? 'R' : 'C'}
        </div>
      </div>
    </div>
  );
}
