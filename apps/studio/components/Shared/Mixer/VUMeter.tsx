'use client';

import { useEffect, useRef, useState } from 'react';

export interface VUMeterProps {
  /**
   * Peak level in dB (-Infinity to +6dB)
   */
  peakLevel: number;

  /**
   * Display size: 'small' for inline, 'large' for dedicated panel
   */
  size?: 'small' | 'large';

  /**
   * Show peak hold indicator
   */
  showPeakHold?: boolean;
}

export function VUMeter({ peakLevel, size = 'small', showPeakHold = true }: VUMeterProps) {
  const [displayPeak, setDisplayPeak] = useState(peakLevel);
  const peakHoldRef = useRef<number>(peakLevel);
  const peakHoldTimeoutRef = useRef<NodeJS.Timeout>();

  // Smooth peak display
  useEffect(() => {
    setDisplayPeak((prev) => {
      const diff = peakLevel - prev;
      if (diff > 0) return peakLevel; // Fast attack
      return prev + diff * 0.1; // Slow decay
    });

    // Peak hold: keep the highest peak for 1 second
    if (showPeakHold && peakLevel > peakHoldRef.current) {
      peakHoldRef.current = peakLevel;
      clearTimeout(peakHoldTimeoutRef.current);
      peakHoldTimeoutRef.current = setTimeout(() => {
        peakHoldRef.current = -Infinity;
      }, 1000);
    }
  }, [peakLevel, showPeakHold]);

  // Convert dB to percentage for display (range: -60dB to +6dB = 0-100%)
  const dbMin = -60;
  const dbMax = 6;
  const range = dbMax - dbMin;
  const normalized = Math.max(0, Math.min(100, ((displayPeak - dbMin) / range) * 100));
  const peakHoldNormalized = peakHoldRef.current !== -Infinity ? Math.max(0, Math.min(100, ((peakHoldRef.current - dbMin) / range) * 100)) : 0;

  // Color based on level
  const getColor = (level: number) => {
    if (level < 50) return 'from-green-500 to-green-600';
    if (level < 75) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getBackgroundColor = (level: number) => {
    if (level < 50) return 'bg-green-500/10';
    if (level < 75) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  if (size === 'small') {
    return (
      <div className="w-full">
        <div className={`relative h-2 bg-gray-800 rounded overflow-hidden ${getBackgroundColor(normalized)}`}>
          <div
            className={`h-full bg-gradient-to-r ${getColor(normalized)} transition-all duration-75`}
            style={{ width: `${normalized}%` }}
          />
          {showPeakHold && peakHoldNormalized > 0 && (
            <div
              className="absolute top-0 h-full w-0.5 bg-white/70"
              style={{ left: `${peakHoldNormalized}%` }}
            />
          )}
        </div>
      </div>
    );
  }

  // Large display
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
      <h3 className="text-sm font-bold text-gray-300 mb-4">VU METER</h3>

      <div className="space-y-4">
        {/* Main meter */}
        <div>
          <div className="mb-2 text-xs text-gray-400">Level</div>
          <div className={`relative h-8 bg-gray-800 rounded overflow-hidden ${getBackgroundColor(normalized)}`}>
            <div
              className={`h-full bg-gradient-to-r ${getColor(normalized)} transition-all duration-75`}
              style={{ width: `${normalized}%` }}
            />
            {showPeakHold && peakHoldNormalized > 0 && (
              <div
                className="absolute top-0 h-full w-1 bg-white/80 shadow-lg"
                style={{ left: `${peakHoldNormalized}%` }}
              />
            )}
          </div>
        </div>

        {/* Numeric display */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">Current</div>
            <div className="text-lg font-mono font-bold">{displayPeak.toFixed(1)} dB</div>
          </div>
          {showPeakHold && peakHoldRef.current !== -Infinity && (
            <div>
              <div className="text-xs text-gray-400">Peak</div>
              <div className="text-lg font-mono font-bold text-red-400">{peakHoldRef.current.toFixed(1)} dB</div>
            </div>
          )}
        </div>

        {/* Scale reference */}
        <div className="border-t border-gray-700 pt-3">
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 text-center">
            <div>-60</div>
            <div>-40</div>
            <div>-20</div>
            <div>-6</div>
            <div>0</div>
            <div>3</div>
            <div>+6</div>
          </div>
          <div className="h-1 bg-gray-800 rounded mt-2 relative">
            <div className="absolute top-0 left-0 w-1 h-1 bg-gray-600" />
            <div className="absolute top-0 left-1/4 w-1 h-1 bg-gray-600" />
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-gray-600" />
            <div className="absolute top-0 left-2/3 w-1 h-1 bg-gray-600" />
            <div className="absolute top-0 right-0 w-1 h-1 bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
