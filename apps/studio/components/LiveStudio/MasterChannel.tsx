'use client';

/**
 * Master Channel Component
 * Master output controls with audio delay compensation and monitoring
 *
 * Features:
 * - Master fader control (-60dB to +6dB)
 * - Master metering (peak and RMS)
 * - Audio delay compensation (0-500ms)
 * - Output monitor selector (headphones, output, both)
 * - Loudness standards reference (LUFS)
 * - Clipping detection and warnings
 * - Headroom indicator
 */

import React, { useState } from 'react';

interface MasterChannelProps {
  /** Master volume in dB */
  masterVolume: number;
  /** Master peak level in dB */
  masterPeakLevel: number;
  /** Master RMS level in dB */
  masterRmsLevel: number;
  /** Master LUFS level (integrated loudness) */
  masterLUFS?: number;
  /** Is master clipping */
  isClipping?: boolean;
  /** Current output destination */
  outputDestination?: 'headphones' | 'output' | 'both';
  /** Audio delay in ms */
  audioDelay?: number;
  /** Callbacks */
  onVolumeChange?: (volume: number) => void;
  onDelayChange?: (delayMs: number) => void;
  onOutputChange?: (destination: 'headphones' | 'output' | 'both') => void;
  onReset?: () => void;
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
  return Math.max(0, Math.min(100, ((level + 96) / 96) * 100));
}

/**
 * Get loudness category for LUFS
 */
function getLoudnessCategory(lufs: number | undefined): { category: string; color: string } {
  if (!lufs || lufs === -Infinity) return { category: '-∞', color: 'text-gray-400' };
  if (lufs < -23) return { category: 'Quiet', color: 'text-blue-400' };
  if (lufs < -19) return { category: 'Good', color: 'text-green-400' };
  if (lufs < -14) return { category: 'Loud', color: 'text-yellow-400' };
  return { category: 'Too Loud', color: 'text-red-400' };
}

export function MasterChannel({
  masterVolume,
  masterPeakLevel,
  masterRmsLevel,
  masterLUFS,
  isClipping = false,
  outputDestination = 'both',
  audioDelay = 0,
  onVolumeChange,
  onDelayChange,
  onOutputChange,
  onReset,
}: MasterChannelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const peakHeight = getMeterHeight(masterPeakLevel);
  const rmsHeight = getMeterHeight(masterRmsLevel);
  const loudness = getLoudnessCategory(masterLUFS);

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Master Output</h2>
          <p className="text-xs text-gray-400 mt-1">Stream destination audio mixing</p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-2 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAdvanced ? 'Basic' : 'Advanced'}
        </button>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Volume Section */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            Volume
          </label>
          <div className="flex flex-col items-center gap-3">
            <input
              type="range"
              min="-60"
              max="6"
              step="0.1"
              value={masterVolume}
              onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
              className="h-32 w-12 bg-gradient-to-t from-gray-600 to-gray-700 rounded cursor-pointer appearance-none"
              style={{
                writingMode: 'bt-lr',
                WebkitAppearance: 'slider-vertical',
              }}
              title={`Master Volume: ${masterVolume.toFixed(1)} dB`}
            />
            <div className="text-sm font-mono font-bold text-white">
              {masterVolume > 0 ? '+' : ''}{masterVolume.toFixed(1)} dB
            </div>
            <div className="text-xs text-gray-400 text-center">
              Headroom: {Math.max(0, (6 - masterPeakLevel).toFixed(1))} dB
            </div>
          </div>
        </div>

        {/* Metering Section */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            Levels
          </label>
          <div className="flex gap-2">
            {/* Peak Meter */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-400 mb-1">Peak</div>
              <div className="relative h-24 w-full bg-gray-700 rounded overflow-hidden border border-gray-600">
                <div
                  className={`absolute bottom-0 left-0 right-0 ${getMeterColor(masterPeakLevel)} opacity-80 transition-all`}
                  style={{ height: `${peakHeight}%` }}
                  title={`Peak: ${masterPeakLevel.toFixed(1)} dB`}
                />
                <div className="absolute top-1 left-1 right-1 text-xs font-mono text-white/50">0dB</div>
              </div>
              <div className="text-xs font-mono text-white mt-1">
                {masterPeakLevel === -Infinity ? '-∞' : `${masterPeakLevel.toFixed(0)}`}dB
              </div>
            </div>

            {/* RMS Meter */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-400 mb-1">RMS</div>
              <div className="relative h-24 w-full bg-gray-700 rounded overflow-hidden border border-gray-600">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-500 opacity-60 transition-all"
                  style={{ height: `${rmsHeight}%` }}
                  title={`RMS: ${masterRmsLevel.toFixed(1)} dB`}
                />
              </div>
              <div className="text-xs font-mono text-white mt-1">
                {masterRmsLevel === -Infinity ? '-∞' : `${masterRmsLevel.toFixed(0)}`}dB
              </div>
            </div>

            {/* LUFS Meter */}
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-400 mb-1">LUFS</div>
              <div className="h-24 w-full bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                <div className={`text-xs font-bold ${loudness.color}`}>
                  {masterLUFS === undefined || masterLUFS === -Infinity ? '-∞' : `${masterLUFS.toFixed(1)}`}
                </div>
              </div>
              <div className={`text-xs font-semibold mt-1 ${loudness.color}`}>
                {loudness.category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Monitor Selector */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider block">
          Output Monitor
        </label>
        <div className="flex gap-2">
          {['headphones', 'output', 'both'].map((destination) => (
            <button
              key={destination}
              onClick={() => onOutputChange?.(destination as any)}
              className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-all ${
                outputDestination === destination
                  ? 'bg-blue-600 text-white border border-blue-500 shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              {destination === 'headphones' ? '🎧 Headphones' : destination === 'output' ? '🔊 Output' : '🔊 Both'}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="space-y-4">
            {/* Audio Delay Compensation */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider block">
                Audio Delay Compensation
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="1"
                  value={audioDelay}
                  onChange={(e) => onDelayChange?.(parseFloat(e.target.value))}
                  className="flex-1 bg-gray-700 rounded cursor-pointer"
                  title={`Delay: ${audioDelay}ms`}
                />
                <span className="text-sm font-mono text-white min-w-12">{audioDelay}ms</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Synchronize video and audio timing (0-500ms)
              </p>
            </div>

            {/* Clipping Warning */}
            {isClipping && (
              <div className="bg-red-500/10 border border-red-500 rounded p-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <h4 className="text-sm font-bold text-red-400">Clipping Detected</h4>
                    <p className="text-xs text-red-300 mt-1">
                      Master output is exceeding 0dB. Reduce volume to prevent audio distortion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loudness Standards Info */}
            <div className="bg-gray-800 border border-gray-700 rounded p-3">
              <h4 className="text-xs font-bold text-white mb-2 uppercase">Loudness Standards</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div>
                  <span className="block font-semibold text-gray-300">YouTube/Streaming</span>
                  <span>-16 to -24 LUFS</span>
                </div>
                <div>
                  <span className="block font-semibold text-gray-300">Podcast</span>
                  <span>-16 to -18 LUFS</span>
                </div>
                <div>
                  <span className="block font-semibold text-gray-300">Music</span>
                  <span>-14 to -18 LUFS</span>
                </div>
                <div>
                  <span className="block font-semibold text-gray-300">Broadcast</span>
                  <span>-23 LUFS (EBU R128)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={onReset}
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded text-sm font-semibold transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

export default MasterChannel;
