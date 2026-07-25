'use client';

/**
 * MetronomeControl Component
 *
 * Professional metronome interface with:
 * - BPM control (40-240)
 * - Time signature selector (4/4, 3/4, 6/8, etc.)
 * - Pre-count bars setting
 * - Visual beat indicator
 * - Click volume control
 * - Start/stop buttons
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ClickTrack, type ClickTrackConfig } from '@/lib/audioRecording';

export interface MetronomeControlProps {
  audioContext?: AudioContext;
  onConfigChange?: (config: ClickTrackConfig) => void;
  onBeatUpdate?: (beat: number, bar: number) => void;
  className?: string;
}

const TIME_SIGNATURES = [
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 8],
  [7, 8],
  [9, 8],
  [12, 8],
] as const;

export function MetronomeControl({
  audioContext,
  onConfigChange,
  onBeatUpdate,
  className = '',
}: MetronomeControlProps) {
  // State
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState<[number, number]>([4, 4]);
  const [preCountBars, setPreCountBars] = useState(2);
  const [clickVolume, setClickVolume] = useState(0.8);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentBar, setCurrentBar] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Click track instance
  const clickTrackRef = React.useRef<ClickTrack | null>(null);

  /**
   * Initialize click track
   */
  useEffect(() => {
    if (!audioContext) return;

    try {
      const config: ClickTrackConfig = {
        bpm,
        timeSignature,
        preCountBars,
        volume: clickVolume,
        accentFirst: true,
      };

      const clickTrack = new ClickTrack(audioContext, config);

      // Register beat callback
      clickTrack.onBeat((beat, bar) => {
        setCurrentBeat(beat);
        setCurrentBar(bar);
        onBeatUpdate?.(beat, bar);
      });

      clickTrackRef.current = clickTrack;

      return () => {
        clickTrack.dispose();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize metronome');
    }
  }, [audioContext, onBeatUpdate]);

  /**
   * Handle play/stop
   */
  const handlePlayToggle = useCallback(() => {
    const clickTrack = clickTrackRef.current;
    if (!clickTrack) return;

    try {
      if (isRunning) {
        clickTrack.stop();
        setIsRunning(false);
      } else {
        clickTrack.start();
        setIsRunning(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback error');
    }
  }, [isRunning]);

  /**
   * Update BPM
   */
  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(newBpm);
    if (clickTrackRef.current) {
      clickTrackRef.current.setBpm(newBpm);
    }
  }, []);

  /**
   * Update time signature
   */
  const handleTimeSignatureChange = useCallback((sig: [number, number]) => {
    setTimeSignature(sig);
    if (clickTrackRef.current) {
      clickTrackRef.current.setTimeSignature(sig[0], sig[1]);
    }
  }, []);

  /**
   * Update volume
   */
  const handleVolumeChange = useCallback((volume: number) => {
    setClickVolume(volume);
    if (clickTrackRef.current) {
      clickTrackRef.current.setVolume(volume);
    }
  }, []);

  return (
    <div className={`metronome-control ${className}`}>
      <div className="space-y-4 bg-slate-900 rounded-lg p-4">
        {/* Title and Status */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Metronome</h3>
          <div
            className={`text-xs font-bold px-2 py-1 rounded ${
              isRunning
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {isRunning ? 'Running' : 'Stopped'}
          </div>
        </div>

        {/* BPM Control */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Tempo (BPM)
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBpmChange(Math.max(40, bpm - 10))}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
              aria-label="Decrease BPM"
            >
              −10
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="40"
                max="240"
                step="1"
                value={bpm}
                onChange={(e) => handleBpmChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="text-3xl font-mono font-bold text-white w-20 text-center">
              {bpm}
            </div>

            <button
              onClick={() => handleBpmChange(Math.min(240, bpm + 10))}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
              aria-label="Increase BPM"
            >
              +10
            </button>
          </div>
          <div className="text-xs text-slate-500 text-center">
            {bpm < 60 ? 'Slow' : bpm < 100 ? 'Moderate' : bpm < 140 ? 'Fast' : 'Very Fast'}
          </div>
        </div>

        {/* Time Signature */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Time Signature
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SIGNATURES.map((sig) => (
              <button
                key={`${sig[0]}/${sig[1]}`}
                onClick={() => handleTimeSignatureChange(sig as [number, number])}
                className={`py-2 px-2 rounded text-sm font-mono transition-colors ${
                  timeSignature[0] === sig[0] && timeSignature[1] === sig[1]
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {sig[0]}/{sig[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-count Bars */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Pre-count Bars: {preCountBars}
          </label>
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            value={preCountBars}
            onChange={(e) => setPreCountBars(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="text-xs text-slate-500">
            {preCountBars === 0
              ? 'Record starts immediately'
              : `${preCountBars} bar${preCountBars !== 1 ? 's' : ''} before recording`}
          </div>
        </div>

        {/* Click Volume */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Click Volume
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={clickVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="text-sm font-mono text-white w-12 text-right">
              {(clickVolume * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Beat Indicator */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Beat Position
          </label>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400">Bar</div>
            <div className="text-lg font-mono font-bold text-white">
              {currentBar + 1}
            </div>
            <div className="text-xs text-slate-400 mx-2">•</div>
            <div className="text-xs text-slate-400">Beat</div>
            <div className="text-lg font-mono font-bold text-white">
              {currentBeat + 1}
            </div>

            {/* Visual beat display */}
            <div className="ml-auto flex gap-1">
              {Array.from({ length: timeSignature[0] }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentBeat
                      ? 'bg-yellow-400 scale-125'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Play/Stop Button */}
        <button
          onClick={handlePlayToggle}
          className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning ? '⏹ Stop Metronome' : '▶ Start Metronome'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-2">
            <div className="text-xs text-red-200">{error}</div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-slate-500 text-center">
          {isRunning
            ? 'Click track is playing - start recording when ready'
            : 'Configure metronome settings and click Play to start'}
        </div>
      </div>
    </div>
  );
}

export default MetronomeControl;
