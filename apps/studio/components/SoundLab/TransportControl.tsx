'use client';

/**
 * Transport Control Component
 * Playback control center for DAW
 *
 * Features:
 * - Play/Pause/Stop with keyboard shortcuts (Space, Enter)
 * - BPM/Tempo display (linked to MusicGen)
 * - Time display (bars:beats:ticks + mm:ss)
 * - Loop toggle + region controls
 * - Click track (metronome with visual feedback)
 */

import React, { useState, useCallback, useEffect } from 'react';

export interface TransportControlProps {
  /** Is playback active */
  isPlaying: boolean;
  /** Current playhead position in seconds */
  playheadPosition: number;
  /** Total project duration in seconds */
  duration: number;
  /** Tempo in BPM */
  bpm: number;
  /** Is loop enabled */
  isLooping: boolean;
  /** Loop start in seconds */
  loopStart?: number;
  /** Loop end in seconds */
  loopEnd?: number;
  /** Is click track enabled */
  isClickEnabled?: boolean;
  /** Click track volume (0-1) */
  clickVolume?: number;

  // Callbacks
  onPlayToggle?: (playing: boolean) => void;
  onStop?: () => void;
  onBpmChange?: (bpm: number) => void;
  onLoopToggle?: (enabled: boolean) => void;
  onLoopStartChange?: (position: number) => void;
  onLoopEndChange?: (position: number) => void;
  onClickToggle?: (enabled: boolean) => void;
  onClickVolumeChange?: (volume: number) => void;
}

export function TransportControl({
  isPlaying,
  playheadPosition,
  duration,
  bpm,
  isLooping,
  loopStart = 0,
  loopEnd,
  isClickEnabled = false,
  clickVolume = 0.8,
  onPlayToggle,
  onStop,
  onBpmChange,
  onLoopToggle,
  onLoopStartChange,
  onLoopEndChange,
  onClickToggle,
  onClickVolumeChange,
}: TransportControlProps) {
  const [showLoopEditor, setShowLoopEditor] = useState(false);
  const [tempBpm, setTempBpm] = useState(bpm);

  /**
   * Convert seconds to bars:beats:ticks format
   * Assumes 120 BPM and 4/4 time signature
   */
  const secondsToBarsBeatsTicks = (seconds: number): [number, number, number] => {
    const beatDuration = 60 / bpm;
    const bars = Math.floor(seconds / (beatDuration * 4));
    const beats = Math.floor((seconds % (beatDuration * 4)) / beatDuration);
    const ticks = Math.floor(((seconds % beatDuration) / beatDuration) * 480); // 480 ticks per beat
    return [bars, beats, ticks];
  };

  /**
   * Convert seconds to mm:ss format
   */
  const secondsToTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${minutes}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  const [bars, beats, ticks] = secondsToBarsBeatsTicks(playheadPosition);
  const timeDisplay = secondsToTime(playheadPosition);
  const durationDisplay = secondsToTime(duration);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't intercept in input fields

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayToggle?.(!isPlaying);
      } else if (e.code === 'Enter') {
        e.preventDefault();
        onStop?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onPlayToggle, onStop]);

  /**
   * Handle BPM change
   */
  const handleBpmChange = (newBpm: number) => {
    setTempBpm(newBpm);
    onBpmChange?.(newBpm);
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4 space-y-4">
      {/* Playback Controls */}
      <div className="flex items-center gap-3">
        {/* Stop Button */}
        <button
          onClick={() => onStop?.()}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold transition-colors"
          title="Stop playback (Enter)"
        >
          ⏹
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={() => onPlayToggle?.(!isPlaying)}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
          title={`${isPlaying ? 'Pause' : 'Play'} (Space)`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Loop Button */}
        <button
          onClick={() => onLoopToggle?.(!isLooping)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isLooping ? 'bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-500' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
          title="Toggle loop"
        >
          🔁
        </button>

        {/* Loop Settings */}
        <button
          onClick={() => setShowLoopEditor(!showLoopEditor)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded transition-colors"
          title="Edit loop points"
        >
          {isLooping && loopEnd ? `${loopStart.toFixed(2)}s - ${loopEnd.toFixed(2)}s` : 'Loop'}
        </button>

        {/* Click Track Button */}
        <button
          onClick={() => onClickToggle?.(!isClickEnabled)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isClickEnabled ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
          title="Toggle click track"
        >
          🎯
        </button>
      </div>

      {/* Time Display */}
      <div className="flex items-center justify-between bg-gray-950 border border-gray-700 rounded-lg p-3">
        <div className="flex gap-6">
          {/* Bars:Beats:Ticks */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Bars:Beats:Ticks</div>
            <div className="text-lg font-mono font-bold text-cyan-400">
              {(bars + 1).toString().padStart(3, '0')}:{(beats + 1).toString().padStart(2, '0')}:{ticks.toString().padStart(3, '0')}
            </div>
          </div>

          {/* MM:SS */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Time</div>
            <div className="text-lg font-mono font-bold text-white">
              {timeDisplay} / {durationDisplay}
            </div>
          </div>
        </div>

        {/* Playback Progress */}
        <div className="flex-1 ml-6">
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all"
              style={{ width: `${(playheadPosition / duration) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* BPM Control */}
      <div className="flex items-center gap-3 bg-gray-950 border border-gray-700 rounded-lg p-3">
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">Tempo (BPM)</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBpmChange(Math.max(40, tempBpm - 1))}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm"
            >
              −
            </button>
            <input
              type="number"
              min="40"
              max="300"
              value={tempBpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value))}
              className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-center font-mono font-bold text-lg"
              title="Adjust tempo"
            />
            <span className="text-gray-400 text-sm">BPM</span>
            <button
              onClick={() => handleBpmChange(Math.min(300, tempBpm + 1))}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Click Volume */}
        {isClickEnabled && (
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Click Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={clickVolume}
              onChange={(e) => onClickVolumeChange?.(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Loop Editor Panel */}
      {showLoopEditor && (
        <div className="bg-gray-950 border border-gray-700 rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-semibold text-white">Loop Points</h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Loop Start */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Start (seconds)</label>
              <input
                type="number"
                step="0.1"
                value={loopStart}
                onChange={(e) => onLoopStartChange?.(parseFloat(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono"
              />
            </div>

            {/* Loop End */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">End (seconds)</label>
              <input
                type="number"
                step="0.1"
                value={loopEnd || duration}
                onChange={(e) => onLoopEndChange?.(parseFloat(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono"
              />
            </div>
          </div>

          <button
            onClick={() => setShowLoopEditor(false)}
            className="w-full px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
          >
            Done
          </button>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="text-xs text-gray-500 bg-gray-950 border border-gray-700 rounded p-2 space-y-1">
        <div>
          <span className="font-semibold">Shortcuts:</span> Space = Play/Pause, Enter = Stop
        </div>
      </div>
    </div>
  );
}
