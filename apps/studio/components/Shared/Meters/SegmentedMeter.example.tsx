'use client';

import React, { useState, useEffect } from 'react';
import { SegmentedMeter } from './SegmentedMeter';

/**
 * Example usage of SegmentedMeter component
 * Demonstrates stereo metering with live level simulation
 */
export function SegmentedMeterExample() {
  const [leftLevel, setLeftLevel] = useState<number>(-60);
  const [rightLevel, setRightLevel] = useState<number>(-60);
  const [peakLeftReset, setPeakLeftReset] = useState(false);
  const [peakRightReset, setPeakRightReset] = useState(false);

  // Simulate audio level changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Random walk for more natural level movement
      setLeftLevel(prev => {
        const target = Math.random() * 6 - 30; // -30 to +6 dB
        return prev + (target - prev) * 0.05;
      });

      setRightLevel(prev => {
        const target = Math.random() * 6 - 30;
        return prev + (target - prev) * 0.05;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-8 bg-gray-950">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">SegmentedMeter Examples</h2>
        <p className="text-gray-400">Professional LED-style audio meters with peak hold</p>
      </div>

      {/* Example 1: Stereo Meters with Large Size */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Stereo Metering (Large)</h3>
        <div className="flex gap-12 bg-gray-900 rounded-lg p-6 border border-gray-700">
          <SegmentedMeter
            peakLevel={leftLevel}
            size="large"
            label="L"
            showPeakHold={true}
            peakHoldDuration={1500}
            onPeakReset={() => setPeakLeftReset(!peakLeftReset)}
          />
          <SegmentedMeter
            peakLevel={rightLevel}
            size="large"
            label="R"
            showPeakHold={true}
            peakHoldDuration={1500}
            onPeakReset={() => setPeakRightReset(!peakRightReset)}
          />
        </div>
        <div className="text-sm text-gray-400">
          Left: {leftLevel.toFixed(1)} dB | Right: {rightLevel.toFixed(1)} dB
        </div>
      </div>

      {/* Example 2: Multi-channel with Small Size */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Multi-Channel (Small)</h3>
        <div className="flex gap-6 bg-gray-900 rounded-lg p-6 border border-gray-700">
          {['Ch1', 'Ch2', 'Ch3', 'Ch4'].map((label, idx) => (
            <SegmentedMeter
              key={idx}
              peakLevel={leftLevel - idx * 2}
              size="small"
              label={label}
            />
          ))}
        </div>
      </div>

      {/* Example 3: Without Labels */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Minimal Display</h3>
        <div className="flex gap-4 bg-gray-900 rounded-lg p-6 border border-gray-700 justify-center">
          <SegmentedMeter
            peakLevel={leftLevel}
            size="large"
            showPeakHold={false}
          />
        </div>
      </div>

      {/* Example 4: Custom Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Custom Peak Hold Duration</h3>
        <div className="flex gap-6 bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div>
            <p className="text-xs text-gray-400 mb-2">500ms hold</p>
            <SegmentedMeter
              peakLevel={leftLevel}
              size="large"
              label="Fast"
              peakHoldDuration={500}
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">2000ms hold</p>
            <SegmentedMeter
              peakLevel={leftLevel}
              size="large"
              label="Slow"
              peakHoldDuration={2000}
            />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Color Zones</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-400">Green: -60 to -12 dB (Safe)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-lime-400 rounded"></div>
            <span className="text-gray-400">Lime: -12 to -6 dB (Caution)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-400 rounded"></div>
            <span className="text-gray-400">Amber: -6 to -3 dB (Warning)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-400">Orange: -3 to 0 dB (Alert)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-400">Red: 0 to +6 dB (Critical)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded"></div>
            <span className="text-gray-400">White line: Peak marker</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SegmentedMeterExample;
