'use client';

/**
 * Audio Mixer Component for Streaming
 * Professional channel strips with metering, pan, and fading
 *
 * Features:
 * - Channel strips per audio source
 * - Volume faders (-60dB to +6dB)
 * - Pan knobs (L ← 0 → R)
 * - Mute/Solo buttons with color indicators
 * - Peak meters (green → yellow → red)
 * - RMS meters (average level)
 * - Source name and type icon
 * - Real-time level updates
 * - Horizontal scrolling for many sources
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { MeteringData } from '@/lib/obs/audio/AudioMixing';

export interface AudioChannel {
  id: string;
  name: string;
  type: 'microphone' | 'system' | 'media' | 'soundlab' | 'suno' | 'aux';
  volume: number; // -60 to +6 dB
  pan: number; // -1 to 1
  isMuted: boolean;
  isSolo: boolean;
  peakLevel: number; // dB
  rmsLevel: number; // dB
  isClipping?: boolean;
}

interface ChannelStripProps {
  channel: AudioChannel;
  onVolumeChange?: (volume: number) => void;
  onPanChange?: (pan: number) => void;
  onMuteToggle?: (muted: boolean) => void;
  onSoloToggle?: (soloed: boolean) => void;
  onSelect?: () => void;
}

/**
 * Source type icon
 */
function getSourceIcon(type: string): string {
  const icons: Record<string, string> = {
    microphone: '🎤',
    system: '🔊',
    media: '🎵',
    soundlab: '🎹',
    suno: '🤖',
    aux: '🔌',
  };
  return icons[type] || '🔌';
}

/**
 * Convert dB to linear value
 */
function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Convert linear value to dB
 */
function linearToDb(linear: number): number {
  return Math.log10(Math.max(linear, 0.001)) * 20;
}

/**
 * Get meter color based on level
 */
function getMeterColor(level: number): string {
  if (level >= 0) return 'bg-red-500';
  if (level >= -3) return 'bg-yellow-500';
  if (level >= -12) return 'bg-amber-500';
  return 'bg-green-500';
}

/**
 * Get meter height percentage
 */
function getMeterHeight(level: number): number {
  // Normalize -96dB to 0dB to 0-100%
  return Math.max(0, Math.min(100, ((level + 96) / 96) * 100));
}

/**
 * Channel Strip Component
 */
function ChannelStrip({
  channel,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onSelect,
}: ChannelStripProps) {
  const panRef = useRef<HTMLDivElement>(null);
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // Pan knob drag handler
  useEffect(() => {
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

  const peakHeight = getMeterHeight(channel.peakLevel);
  const rmsHeight = getMeterHeight(channel.rmsLevel);

  return (
    <div
      className="flex-shrink-0 bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-3 w-24 hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer"
      onClick={onSelect}
    >
      {/* Header: Icon + Name */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-lg">{getSourceIcon(channel.type)}</span>
        <div className="flex-1 text-xs font-semibold text-white truncate" title={channel.name}>
          {channel.name}
        </div>
      </div>

      {/* Clipping Indicator */}
      {channel.isClipping && (
        <div className="mb-2 px-1 py-0.5 bg-red-500/20 border border-red-500 rounded text-center">
          <span className="text-xs font-bold text-red-400">CLIP</span>
        </div>
      )}

      {/* Volume Fader */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 text-center mb-1 font-mono">
          {channel.volume > 0 ? '+' : ''}{channel.volume.toFixed(1)} dB
        </div>
        <input
          type="range"
          min="-60"
          max="6"
          step="0.1"
          value={channel.volume}
          onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
          className="w-full h-32 bg-gray-700 rounded cursor-pointer appearance-none"
          style={{
            writingMode: 'vertical-lr',
            WebkitAppearance: 'slider-vertical',
          } as any}
          title={`Volume: ${channel.volume.toFixed(1)} dB`}
          onMouseDown={() => setIsDraggingVolume(true)}
          onMouseUp={() => setIsDraggingVolume(false)}
        />
      </div>

      {/* Meter Display */}
      <div className="mb-3 flex gap-1">
        {/* Peak Meter */}
        <div className="flex-1">
          <div className="text-xs text-gray-400 text-center mb-1">Peak</div>
          <div className="relative h-16 bg-gray-700 rounded overflow-hidden">
            <div
              className={`absolute bottom-0 left-0 right-0 ${getMeterColor(channel.peakLevel)} opacity-80 transition-all`}
              style={{ height: `${peakHeight}%` }}
              title={`Peak: ${channel.peakLevel.toFixed(1)} dB`}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-xs font-mono text-white drop-shadow">
                {channel.peakLevel === -Infinity ? '-∞' : `${channel.peakLevel.toFixed(0)}`}
              </span>
            </div>
          </div>
        </div>

        {/* RMS Meter */}
        <div className="flex-1">
          <div className="text-xs text-gray-400 text-center mb-1">RMS</div>
          <div className="relative h-16 bg-gray-700 rounded overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-blue-500 opacity-60 transition-all"
              style={{ height: `${rmsHeight}%` }}
              title={`RMS: ${channel.rmsLevel.toFixed(1)} dB`}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-xs font-mono text-white drop-shadow">
                {channel.rmsLevel === -Infinity ? '-∞' : `${channel.rmsLevel.toFixed(0)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pan Knob */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 text-center mb-1">Pan</div>
        <div
          ref={panRef}
          className="relative h-2 bg-gray-700 rounded cursor-ew-resize hover:bg-gray-600 transition-colors"
          onMouseDown={() => setIsDraggingPan(true)}
          title={`Pan: ${channel.pan > 0.1 ? 'R' : channel.pan < -0.1 ? 'L' : 'C'}`}
        >
          <div
            className="absolute w-3 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded shadow top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all"
            style={{ left: `${((channel.pan + 1) / 2) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 text-center mt-1 font-mono">
          {channel.pan > 0.1 ? `R${(channel.pan * 100).toFixed(0)}` : channel.pan < -0.1 ? `L${Math.abs(channel.pan * 100).toFixed(0)}` : 'C'}
        </div>
      </div>

      {/* Mute/Solo Buttons */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle?.(!channel.isMuted);
          }}
          className={`flex-1 px-1 py-1.5 rounded text-xs font-bold transition-all ${
            channel.isMuted
              ? 'bg-red-500/80 text-white border border-red-400 shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
          }`}
          title="Toggle Mute"
        >
          M
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSoloToggle?.(!channel.isSolo);
          }}
          className={`flex-1 px-1 py-1.5 rounded text-xs font-bold transition-all ${
            channel.isSolo
              ? 'bg-yellow-500/80 text-white border border-yellow-400 shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
          }`}
          title="Toggle Solo"
        >
          S
        </button>
      </div>

      {/* Status Indicators */}
      <div className="text-center text-xs text-gray-400">
        {channel.isMuted && '🔇'}
        {channel.isSolo && '🎧'}
      </div>
    </div>
  );
}

/**
 * Audio Mixer Props
 */
export interface AudioMixerProps {
  /** Channel strips */
  channels: AudioChannel[];
  /** Master volume in dB */
  masterVolume: number;
  /** Master peak level */
  masterPeakLevel: number;
  /** Master RMS level */
  masterRmsLevel: number;
  /** Is master clipping */
  masterIsClipping?: boolean;
  /** Callbacks */
  onChannelVolumeChange?: (id: string, volume: number) => void;
  onChannelPanChange?: (id: string, pan: number) => void;
  onChannelMuteToggle?: (id: string, muted: boolean) => void;
  onChannelSoloToggle?: (id: string, soloed: boolean) => void;
  onMasterVolumeChange?: (volume: number) => void;
}

/**
 * Main Audio Mixer Component
 */
export function AudioMixer({
  channels,
  masterVolume,
  masterPeakLevel,
  masterRmsLevel,
  masterIsClipping = false,
  onChannelVolumeChange,
  onChannelPanChange,
  onChannelMuteToggle,
  onChannelSoloToggle,
  onMasterVolumeChange,
}: AudioMixerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const peakHeight = getMeterHeight(masterPeakLevel);
  const rmsHeight = getMeterHeight(masterRmsLevel);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 to-gray-900 border-t border-gray-700">
      {/* Channel Strips Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 p-4 min-w-min h-full"
        >
          {channels.length === 0 ? (
            <div className="flex items-center justify-center w-full text-gray-400">
              <div className="text-center">
                <p className="text-sm mb-2">No audio sources added</p>
                <p className="text-xs text-gray-500">Add microphone, system audio, or media sources to start mixing</p>
              </div>
            </div>
          ) : (
            channels.map((channel) => (
              <ChannelStrip
                key={channel.id}
                channel={channel}
                onVolumeChange={(volume) => onChannelVolumeChange?.(channel.id, volume)}
                onPanChange={(pan) => onChannelPanChange?.(channel.id, pan)}
                onMuteToggle={(muted) => onChannelMuteToggle?.(channel.id, muted)}
                onSoloToggle={(soloed) => onChannelSoloToggle?.(channel.id, soloed)}
              />
            ))
          )}
        </div>
      </div>

      {/* Master Output Section */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 px-4 py-3">
        <div className="flex items-end gap-4">
          {/* Master Volume */}
          <div className="flex-shrink-0">
            <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Master</h3>

            <div className="flex flex-col items-center">
              <input
                type="range"
                min="-60"
                max="6"
                step="0.1"
                value={masterVolume}
                onChange={(e) => onMasterVolumeChange?.(parseFloat(e.target.value))}
                className="h-24 w-12 bg-gray-700 rounded cursor-pointer appearance-none"
                style={{
                  writingMode: 'vertical-lr',
                  WebkitAppearance: 'slider-vertical',
                } as any}
                title={`Master Volume: ${masterVolume.toFixed(1)} dB`}
              />
              <div className="text-xs text-gray-400 text-center font-mono mt-2">
                {masterVolume > 0 ? '+' : ''}{masterVolume.toFixed(1)} dB
              </div>
            </div>
          </div>

          {/* Master Meters */}
          <div className="flex gap-2">
            {/* Peak Meter */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">Peak</div>
              <div className="relative h-24 w-8 bg-gray-700 rounded overflow-hidden border border-gray-600">
                <div
                  className={`absolute bottom-0 left-0 right-0 ${getMeterColor(masterPeakLevel)} opacity-80 transition-all`}
                  style={{ height: `${peakHeight}%` }}
                  title={`Master Peak: ${masterPeakLevel.toFixed(1)} dB`}
                />
              </div>
              <div className="text-xs text-gray-400 text-center font-mono mt-2">
                {masterPeakLevel === -Infinity ? '-∞' : `${masterPeakLevel.toFixed(0)}`}
              </div>
            </div>

            {/* RMS Meter */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">RMS</div>
              <div className="relative h-24 w-8 bg-gray-700 rounded overflow-hidden border border-gray-600">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-500 opacity-60 transition-all"
                  style={{ height: `${rmsHeight}%` }}
                  title={`Master RMS: ${masterRmsLevel.toFixed(1)} dB`}
                />
              </div>
              <div className="text-xs text-gray-400 text-center font-mono mt-2">
                {masterRmsLevel === -Infinity ? '-∞' : `${masterRmsLevel.toFixed(0)}`}
              </div>
            </div>
          </div>

          {/* Level Indicators */}
          <div className="flex gap-2 ml-2">
            {/* Headroom */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">Headroom</div>
              <div className={`text-sm font-bold ${masterPeakLevel < -6 ? 'text-green-400' : masterPeakLevel < -3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {Math.max(0, 6 - masterPeakLevel).toFixed(1)} dB
              </div>
            </div>

            {/* Clipping Alert */}
            {masterIsClipping && (
              <div className="flex flex-col items-center justify-center">
                <div className="text-2xl animate-pulse">⚠️</div>
                <div className="text-xs text-red-400 font-semibold mt-1">CLIPPING</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioMixer;
