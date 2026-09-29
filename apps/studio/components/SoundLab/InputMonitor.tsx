'use client';

/**
 * InputMonitor Component
 *
 * Real-time audio input level metering with:
 * - Peak and RMS level displays
 * - Visual level meters
 * - Clipping detection
 * - Input gain control
 * - Channel-specific metering
 */

import React, { useState, useEffect, useRef } from 'react';

export interface InputMonitorProps {
  peakLevel?: number;         // dBFS
  rmsLevel?: number;          // dBFS
  isClipping?: boolean;
  inputGain?: number;         // 0-1
  onGainChange?: (gain: number) => void;
  showChannels?: boolean;
  className?: string;
}

interface MeterAnimationState {
  peakDisplay: number;
  peakHold: number;
  peakHoldTime: number;
}

export function InputMonitor({
  peakLevel = -60,
  rmsLevel = -60,
  isClipping = false,
  inputGain = 1,
  onGainChange,
  showChannels = true,
  className = '',
}: InputMonitorProps) {
  // State
  const [meterState, setMeterState] = useState<MeterAnimationState>({
    peakDisplay: -60,
    peakHold: -60,
    peakHoldTime: 0,
  });

  const animationFrameRef = useRef<number>();
  const lastPeakTimeRef = useRef<number>(0);

  /**
   * Animate peak hold meter
   * Peak hold decays slowly for visibility
   */
  useEffect(() => {
    const animate = () => {
      setMeterState((prev) => {
        let newPeakHold = prev.peakHold;
        const now = Date.now();
        const holdDuration = 2000; // Hold peak for 2 seconds

        // Decay peak hold if time has passed
        if (now - prev.peakHoldTime > holdDuration) {
          newPeakHold = Math.max(prev.peakHold - 1, peakLevel);
        }

        // Update if input level is higher
        if (peakLevel > newPeakHold) {
          newPeakHold = peakLevel;
          lastPeakTimeRef.current = now;
        }

        return {
          peakDisplay: peakLevel,
          peakHold: newPeakHold,
          peakHoldTime: now,
        };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [peakLevel]);

  /**
   * Convert dB level to percentage (0-100%)
   * Range: -60dB to +6dB = 66dB total
   */
  const levelToPercent = (level: number): number => {
    const min = -60;
    const max = 6;
    const normalized = Math.max(0, Math.min(100, ((level - min) / (max - min)) * 100));
    return normalized;
  };

  /**
   * Get meter color based on level
   */
  const getMeterColor = (level: number): string => {
    if (level > 0) return 'bg-red-500'; // Clipping
    if (level > -6) return 'bg-orange-500'; // Hot
    if (level > -18) return 'bg-yellow-500'; // Good
    if (level > -30) return 'bg-green-500'; // Normal
    return 'bg-slate-600'; // Quiet
  };

  /**
   * Get meter color for display
   */
  const getMeterGradient = (): string => {
    const peakPercent = levelToPercent(meterState.peakDisplay);

    if (peakPercent < 50) return 'from-green-500 via-green-500 to-green-500';
    if (peakPercent < 75) return 'from-green-500 via-yellow-500 to-yellow-500';
    if (peakPercent < 90) return 'from-yellow-500 via-orange-500 to-orange-500';
    return 'from-orange-500 via-red-500 to-red-500';
  };

  return (
    <div className={`input-monitor ${className}`}>
      <div className="space-y-4 bg-slate-900 rounded-lg p-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Input Monitor</h3>
          <div
            className={`w-2 h-2 rounded-full ${
              isClipping ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
            }`}
          />
        </div>

        {/* Main Meter */}
        <div>
          <div className="text-xs text-slate-400 mb-2">Peak Level</div>

          {/* Meter bars */}
          <div className="space-y-2">
            {/* Peak meter */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-5 bg-slate-800 rounded-sm overflow-hidden relative group">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-20" />

                {/* Active level bar */}
                <div
                  className={`h-full transition-all duration-75 bg-gradient-to-r ${getMeterGradient()}`}
                  style={{
                    width: `${levelToPercent(meterState.peakDisplay)}%`,
                  }}
                />

                {/* Peak hold indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-600 shadow-lg"
                  style={{
                    left: `${levelToPercent(meterState.peakHold)}%`,
                    opacity: meterState.peakHold > -60 ? 1 : 0,
                  }}
                />

                {/* Clipping zone marker */}
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-red-500 opacity-30" />

                {/* Tooltip on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/80 backdrop-blur flex items-center justify-center text-xs text-white font-mono rounded-sm transition-opacity pointer-events-none">
                  {meterState.peakDisplay.toFixed(1)} dB
                </div>
              </div>

              {/* Numeric display */}
              <div className="text-sm font-mono text-white w-14 text-right">
                {meterState.peakDisplay.toFixed(1)}
              </div>
            </div>

            {/* RMS meter */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-slate-800 rounded-sm overflow-hidden">
                <div
                  className="h-full transition-all duration-100 bg-blue-500"
                  style={{
                    width: `${levelToPercent(rmsLevel)}%`,
                  }}
                />
              </div>
              <div className="text-xs font-mono text-slate-400 w-14 text-right">
                {rmsLevel.toFixed(1)} RMS
              </div>
            </div>
          </div>
        </div>

        {/* Scale reference */}
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex justify-between px-1">
            <span>-60 dB</span>
            <span>-30 dB</span>
            <span>0 dB</span>
            <span>+6 dB</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-300">Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-slate-300">Hot</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-300">Clipping</span>
            </div>
          </div>
        </div>

        {/* Input Gain Control */}
        {onGainChange && (
          <div className="border-t border-slate-700 pt-4">
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Input Gain: {(inputGain * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={inputGain}
              onChange={(e) => onGainChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Silent</span>
              <span>Normal</span>
              <span>Loud</span>
            </div>
          </div>
        )}

        {/* Warning Messages */}
        {isClipping && (
          <div className="bg-red-900/30 border border-red-600 rounded-sm p-2">
            <div className="text-xs text-red-300 font-semibold flex items-center gap-2">
              <span>⚠</span>
              <span>Audio is clipping - reduce input level</span>
            </div>
          </div>
        )}

        {meterState.peakDisplay > -6 && !isClipping && (
          <div className="bg-orange-900/30 border border-orange-600 rounded-sm p-2">
            <div className="text-xs text-orange-300 flex items-center gap-2">
              <span>!</span>
              <span>Input level is hot - watch for clipping</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InputMonitor;
