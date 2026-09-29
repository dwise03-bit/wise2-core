'use client';

/**
 * Mixer Component
 * Professional multi-track mixer with channel strips
 *
 * Features:
 * - Channel strips (one per track)
 * - Volume faders (−∞ to +12dB)
 * - Pan knobs (L ← 0 → R)
 * - Mute/Solo buttons (color change on active)
 * - Peak meter (green → yellow → red)
 * - Input monitor (recording level)
 * - Master output fader
 * - Horizontal scrolling for unlimited channels
 */

import React, { useRef, useState } from 'react';

export interface ChannelStrip {
  id: string;
  name: string;
  volume: number; // 0-1
  pan: number; // -1 to 1
  isMuted: boolean;
  isSoloed: boolean;
  peakLevel: number; // dB
  inputLevel?: number; // dB (for recording)
}

export interface MixerProps {
  /** All channel strips */
  channels: ChannelStrip[];
  /** Master volume (0-1) */
  masterVolume: number;
  /** Master peak level (dB) */
  masterPeakLevel: number;
  /** Hover over channel to show details */
  hoveredChannelId?: string;

  // Callbacks
  onChannelVolumeChange?: (id: string, volume: number) => void;
  onChannelPanChange?: (id: string, pan: number) => void;
  onChannelMuteToggle?: (id: string, muted: boolean) => void;
  onChannelSoloToggle?: (id: string, soloed: boolean) => void;
  onChannelSelect?: (id: string) => void;
  onMasterVolumeChange?: (volume: number) => void;
}

/**
 * Channel Strip Component
 */
interface ChannelStripProps {
  channel: ChannelStrip;
  isHovered?: boolean;
  onVolumeChange?: (volume: number) => void;
  onPanChange?: (pan: number) => void;
  onMuteToggle?: (muted: boolean) => void;
  onSoloToggle?: (soloed: boolean) => void;
  onSelect?: () => void;
}

function ChannelStripComponent({
  channel,
  isHovered = false,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onSelect,
}: ChannelStripProps) {
  const panRef = useRef<HTMLDivElement>(null);
  const [isDraggingPan, setIsDraggingPan] = useState(false);

  /**
   * Convert dB to linear value
   */
  const dbToLinear = (db: number): number => {
    return Math.pow(10, db / 20);
  };

  /**
   * Convert linear value to dB
   */
  const linearToDb = (linear: number): number => {
    return Math.log10(Math.max(linear, 0.001)) * 20;
  };

  const volumeDb = linearToDb(channel.volume);

  /**
   * Get meter color based on level
   */
  const getMeterColor = (level: number): string => {
    if (level >= 0) return 'bg-red-500';
    if (level >= -3) return 'bg-yellow-500';
    if (level >= -12) return 'bg-orange-500';
    return 'bg-green-500';
  };

  /**
   * Handle pan knob drag
   */
  const handlePanMouseDown = () => {
    setIsDraggingPan(true);
  };

  React.useEffect(() => {
    if (!isDraggingPan) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panRef.current) return;
      const rect = panRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const pan = (x * 2) - 1; // -1 to 1
      onPanChange?.(Math.max(-1, Math.min(1, pan)));
    };

    const handleMouseUp = () => {
      setIsDraggingPan(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPan, onPanChange]);

  return (
    <div
      className="flex-shrink-0 bg-gray-900 border border-gray-700 rounded-lg p-3 transition-all hover:border-gray-600 hover:bg-gray-850"
      style={{ width: '100px' }}
      onClick={onSelect}
    >
      {/* Channel Name */}
      <div className="text-xs font-semibold text-white text-center truncate mb-2 text-ellipsis overflow-hidden" title={channel.name}>
        {channel.name}
      </div>

      {/* Input Level Indicator (if recording) */}
      {channel.inputLevel !== undefined && (
        <div className="mb-2 text-xs text-gray-400 text-center">Input: {channel.inputLevel.toFixed(1)} dB</div>
      )}

      {/* Volume Fader */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max="200"
          value={channel.volume * 100}
          onChange={(e) => onVolumeChange?.(parseFloat(e.target.value) / 100)}
          className="w-full h-24 bg-gray-700 rounded appearance-none cursor-pointer slider-vertical"
          style={{
            WebkitAppearance: 'slider-vertical',
            writingMode: 'bt-lr' as any,
            width: '40px',
            height: '100px',
            margin: '0 auto',
          }}
          title={`Volume: ${volumeDb.toFixed(1)} dB`}
        />
        <div className="text-xs text-gray-400 text-center font-mono mt-1">
          {volumeDb > 0 ? '+' : ''}{volumeDb.toFixed(1)} dB
        </div>
      </div>

      {/* Peak Meter */}
      <div className="mb-2">
        <div
          className={`h-8 rounded ${getMeterColor(channel.peakLevel)} opacity-70`}
          style={{ height: `${Math.min(32, Math.max(4, (channel.peakLevel + 40) / 40 * 32))}px` }}
          title={`Peak: ${channel.peakLevel.toFixed(1)} dB`}
        />
        <div className="text-xs text-gray-400 text-center font-mono mt-0.5">
          {channel.peakLevel === -Infinity ? '-∞' : `${channel.peakLevel.toFixed(0)} dB`}
        </div>
      </div>

      {/* Pan Knob */}
      <div className="mb-2" onMouseDown={handlePanMouseDown}>
        <div className="text-xs text-gray-400 text-center mb-1">Pan</div>
        <div
          ref={panRef}
          className="relative h-2 bg-gray-700 rounded cursor-ew-resize"
          title={`Pan: ${channel.pan > 0 ? 'R' : channel.pan < 0 ? 'L' : 'C'} ${Math.abs(channel.pan * 100).toFixed(0)}`}
        >
          <div
            className="absolute w-1 h-4 bg-blue-400 rounded top-1/2 transform -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${((channel.pan + 1) / 2) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 text-center font-mono mt-1">
          {channel.pan > 0.1 ? 'R' : channel.pan < -0.1 ? 'L' : 'C'} {Math.abs(channel.pan * 100).toFixed(0)}
        </div>
      </div>

      {/* Mute/Solo Buttons */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle?.(!channel.isMuted);
          }}
          className={`flex-1 px-1 py-1 rounded text-xs font-bold transition-colors ${
            channel.isMuted ? 'bg-red-500/30 text-red-400 border border-red-500' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
          }`}
          title="Mute"
        >
          M
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSoloToggle?.(!channel.isSoloed);
          }}
          className={`flex-1 px-1 py-1 rounded text-xs font-bold transition-colors ${
            channel.isSoloed ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
          }`}
          title="Solo"
        >
          S
        </button>
      </div>

      {/* Channel State Indicators */}
      {(channel.isMuted || channel.isSoloed) && (
        <div className="text-xs text-gray-400 text-center">
          {channel.isMuted && '🔇'}
          {channel.isSoloed && '🎧'}
        </div>
      )}
    </div>
  );
}

/**
 * Main Mixer Component
 */
export function Mixer({
  channels,
  masterVolume,
  masterPeakLevel,
  hoveredChannelId,
  onChannelVolumeChange,
  onChannelPanChange,
  onChannelMuteToggle,
  onChannelSoloToggle,
  onChannelSelect,
  onMasterVolumeChange,
}: MixerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Convert dB to linear value
   */
  const dbToLinear = (db: number): number => {
    return Math.pow(10, db / 20);
  };

  /**
   * Convert linear value to dB
   */
  const linearToDb = (linear: number): number => {
    return Math.log10(Math.max(linear, 0.001)) * 20;
  };

  const masterVolumeDb = linearToDb(masterVolume);

  /**
   * Get meter color based on level
   */
  const getMeterColor = (level: number): string => {
    if (level >= 0) return 'bg-red-500';
    if (level >= -3) return 'bg-yellow-500';
    if (level >= -12) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex flex-col bg-gray-950 border-t border-gray-700 h-full">
      {/* Channel Strips Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 p-3 min-w-min"
          style={{ minHeight: '320px' }}
        >
          {/* Individual Channel Strips */}
          {channels.map((channel) => (
            <ChannelStripComponent
              key={channel.id}
              channel={channel}
              isHovered={hoveredChannelId === channel.id}
              onVolumeChange={(volume) => onChannelVolumeChange?.(channel.id, volume)}
              onPanChange={(pan) => onChannelPanChange?.(channel.id, pan)}
              onMuteToggle={(muted) => onChannelMuteToggle?.(channel.id, muted)}
              onSoloToggle={(soloed) => onChannelSoloToggle?.(channel.id, soloed)}
              onSelect={() => onChannelSelect?.(channel.id)}
            />
          ))}
        </div>
      </div>

      {/* Master Output Section */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 p-4">
        <div className="flex items-end gap-4">
          {/* Master Volume */}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-3">MASTER</h3>

            <div className="flex gap-4">
              {/* Volume Fader */}
              <div className="flex flex-col items-center">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={masterVolume * 100}
                  onChange={(e) => onMasterVolumeChange?.(parseFloat(e.target.value) / 100)}
                  className="h-24 bg-gray-700 rounded appearance-none cursor-pointer slider-vertical"
                  style={{
                    WebkitAppearance: 'slider-vertical',
                    writingMode: 'bt-lr' as any,
                    width: '40px',
                    height: '100px',
                  }}
                  title={`Master Volume: ${masterVolumeDb.toFixed(1)} dB`}
                />
                <div className="text-xs text-gray-400 text-center font-mono mt-2">
                  {masterVolumeDb > 0 ? '+' : ''}{masterVolumeDb.toFixed(1)} dB
                </div>
              </div>

              {/* Meter Display */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-400 mb-2">Peak</div>
                <div className={`w-8 h-24 rounded ${getMeterColor(masterPeakLevel)}`} title={`Master Peak: ${masterPeakLevel.toFixed(1)} dB`} />
                <div className="text-xs text-gray-400 text-center font-mono mt-2">
                  {masterPeakLevel === -Infinity ? '-∞' : `${masterPeakLevel.toFixed(0)} dB`}
                </div>
              </div>

              {/* Meter Breakdown */}
              <div className="flex flex-col gap-1">
                <div className="text-xs text-gray-400">Levels</div>
                {Array.from({ length: 6 }).map((_, i) => {
                  const db = -40 + i * 8;
                  const isActive = masterPeakLevel >= db;
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 font-mono w-8">{db}dB</span>
                      <div
                        className={`w-12 h-2 rounded ${isActive ? getMeterColor(db) : 'bg-gray-800'}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Clipping Indicator */}
              {masterPeakLevel >= 0 && (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-red-500 text-sm font-bold animate-pulse">⚠</div>
                  <div className="text-xs text-red-400 font-semibold">CLIP</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
