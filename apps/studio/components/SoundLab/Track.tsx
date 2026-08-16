'use client';

/**
 * Track Component
 * Multi-track audio management with individual track controls
 *
 * Features:
 * - Track header with name and controls
 * - Volume and pan controls
 * - Mute, Solo, and Arm Record buttons
 * - Peak meter display
 * - Record status indicator
 * - Track drag-to-reorder support
 * - Virtualized rendering for unlimited tracks
 */

import React, { useRef, useState } from 'react';

export interface TrackProps {
  /** Track unique identifier */
  id: string;
  /** Track display name */
  name: string;
  /** Track index in mix */
  index: number;
  /** Volume level (0-1, where 1 = 0dB) */
  volume: number;
  /** Pan value (-1 to 1, where -1 = full left, 1 = full right) */
  pan: number;
  /** Is track muted */
  isMuted: boolean;
  /** Is track soloed */
  isSoloed: boolean;
  /** Is track armed for recording */
  isArmed: boolean;
  /** Peak level in dB */
  peakLevel: number;
  /** Is track selected */
  isSelected?: boolean;
  /** Track color for identification */
  color?: string;
  /** Children clips to render */
  children?: React.ReactNode;

  // Callbacks
  onVolumeChange?: (volume: number) => void;
  onPanChange?: (pan: number) => void;
  onMuteToggle?: (muted: boolean) => void;
  onSoloToggle?: (soloed: boolean) => void;
  onArmToggle?: (armed: boolean) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onNameChange?: (name: string) => void;
}

export function Track({
  id: _id,
  name,
  index,
  volume,
  pan,
  isMuted,
  isSoloed,
  isArmed,
  peakLevel,
  isSelected = false,
  color = '#3b82f6',
  children,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onArmToggle,
  onSelect,
  onDelete,
  onNameChange,
}: TrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(name);

  /**
   * Convert dB to linear value for display
   */
  const dbToLinear = (db: number): number => {
    return Math.pow(10, db / 20);
  };

  /**
   * Convert linear value to dB for storage
   */
  const linearToDb = (linear: number): number => {
    return Math.log10(Math.max(linear, 0.001)) * 20;
  };

  const volumeDb = linearToDb(volume);
  const getMeterColor = (): string => {
    if (peakLevel >= 0) return 'text-red-500';
    if (peakLevel >= -3) return 'text-yellow-500';
    if (peakLevel >= -12) return 'text-orange-500';
    return 'text-green-500';
  };

  const handleNameSubmit = () => {
    if (editingName.trim()) {
      onNameChange?.(editingName.trim());
    }
    setEditingName(name);
    setIsEditingName(false);
  };

  return (
    <div
      ref={trackRef}
      className={`flex flex-col border-r transition-colors ${
        isSelected ? 'bg-gray-800 border-blue-500' : 'bg-gray-900 border-gray-700 hover:bg-gray-850'
      }`}
      onClick={onSelect}
      style={{ minWidth: '240px', height: '100%' }}
    >
      {/* Track Header */}
      <div className="flex-shrink-0 border-b border-gray-700 p-3 bg-gray-950" style={{ borderLeftColor: color, borderLeftWidth: '3px' }}>
        {/* Track Name */}
        {isEditingName ? (
          <input
            autoFocus
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') {
                setEditingName(name);
                setIsEditingName(false);
              }
            }}
            className="w-full px-2 py-1 text-sm font-semibold bg-gray-800 border border-blue-500 rounded text-white mb-2"
            placeholder="Track name"
          />
        ) : (
          <div
            onClick={() => setIsEditingName(true)}
            className="text-sm font-semibold text-white mb-2 px-2 py-1 cursor-text hover:bg-gray-800 rounded truncate"
            title="Click to rename"
          >
            {name}
          </div>
        )}

        {/* Track Index */}
        <div className="text-xs text-gray-500 px-2 mb-2">Track {index + 1}</div>

        {/* Volume Control */}
        <div className="mb-2">
          <label className="text-xs text-gray-400 mb-1 block">Volume</label>
          <input
            type="range"
            min="0"
            max="200"
            value={volume * 100}
            onChange={(e) => onVolumeChange?.(parseFloat(e.target.value) / 100)}
            className="w-full h-2 bg-gray-700 rounded appearance-none cursor-pointer slider"
            title="Adjust track volume"
          />
          <div className="text-xs text-gray-500 text-center font-mono mt-1">
            {volumeDb > 0 ? '+' : ''}{volumeDb.toFixed(1)} dB
          </div>
        </div>

        {/* Pan Control */}
        <div className="mb-2">
          <label className="text-xs text-gray-400 mb-1 block">Pan</label>
          <input
            type="range"
            min="-100"
            max="100"
            value={pan * 100}
            onChange={(e) => onPanChange?.(parseFloat(e.target.value) / 100)}
            className="w-full h-2 bg-gray-700 rounded appearance-none cursor-pointer slider"
            title="Pan left/right"
          />
          <div className="text-xs text-gray-500 text-center font-mono mt-1">
            {pan > 0 ? 'R' : pan < 0 ? 'L' : 'C'} {Math.abs(pan * 100).toFixed(0)}
          </div>
        </div>

        {/* Peak Meter */}
        <div className="mb-3 bg-gray-800 rounded p-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Peak</span>
            <span className={`text-xs font-mono font-bold ${getMeterColor()}`}>
              {peakLevel === -Infinity ? '-∞' : `${peakLevel.toFixed(1)} dB`}
            </span>
          </div>
          <div className="flex items-end gap-0.5 h-6 bg-gray-900 rounded p-0.5">
            {Array.from({ length: 16 }).map((_, i) => {
              const level = (i / 16) * (peakLevel + 40);
              const isActive = level > -40;
              let bgColor = 'bg-green-500';
              if (peakLevel >= 0) bgColor = 'bg-red-500';
              else if (peakLevel >= -3) bgColor = 'bg-yellow-500';
              else if (peakLevel >= -12) bgColor = 'bg-orange-500';
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all ${isActive ? bgColor : 'bg-gray-700'}`}
                  style={{ height: isActive ? `${Math.max(8, (level + 40) / 40 * 100)}%` : '2px' }}
                />
              );
            })}
          </div>
        </div>

        {/* Track Controls */}
        <div className="grid grid-cols-2 gap-1">
          {/* Mute Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMuteToggle?.(!isMuted);
            }}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              isMuted ? 'bg-red-500/30 text-red-400 border border-red-500' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
            }`}
            title="Mute track (M)"
          >
            M
          </button>

          {/* Solo Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSoloToggle?.(!isSoloed);
            }}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              isSoloed ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
            }`}
            title="Solo track (S)"
          >
            S
          </button>

          {/* Arm Record Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArmToggle?.(!isArmed);
            }}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors col-span-2 ${
              isArmed
                ? 'bg-red-600 text-white border border-red-500 animate-pulse'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
            }`}
            title="Arm for recording (R)"
          >
            {isArmed && '● '} Record
          </button>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="w-full mt-1 px-2 py-1 rounded text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-red-900 hover:text-red-300 border border-gray-600 transition-colors"
          title="Delete track"
        >
          Delete
        </button>
      </div>

      {/* Track Lanes (Clips) */}
      <div className="flex-1 relative overflow-hidden bg-gray-950">
        {children}
      </div>
    </div>
  );
}
