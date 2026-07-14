'use client';

import { useState, useEffect } from 'react';
import { VUMeter } from './VUMeter';

/**
 * Demo component showcasing VU Meter features
 * Shows inline small meters and a large panel meter with interactive controls
 */
export function VUMeterDemo() {
  // Simulated peak levels for multiple channels
  const [channelLevels, setChannelLevels] = useState<number[]>([
    -12, -15, -20, -18, -6, -8,
  ]);

  // Simulated master level
  const [masterLevel, setMasterLevel] = useState(-10);

  /**
   * Simulate audio levels with realistic peaks and decays
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setChannelLevels((prev) =>
        prev.map((level) => {
          // Occasional peaks
          if (Math.random() < 0.1) {
            return Math.max(level, -Math.random() * 10);
          }
          // Natural decay
          return level - Math.random() * 2;
        })
      );

      // Master level simulation
      setMasterLevel((prev) => {
        if (Math.random() < 0.05) {
          return Math.max(prev, -Math.random() * 5);
        }
        return prev - Math.random() * 1.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-6 bg-gray-950 rounded-lg">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">VU Meter Component Demo</h2>
        <p className="text-gray-400">
          Professional canvas-based VU meter visualization with smooth animation and peak hold
        </p>
      </div>

      {/* Small Inline Meters - Channel Strip */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Inline Meters (Channel Strip)</h3>
        <div className="grid grid-cols-6 gap-4">
          {channelLevels.map((level, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="w-full">
                <VUMeter peakLevel={level} size="small" showPeakHold={true} />
              </div>
              <div className="text-xs text-gray-500 text-center">Channel {index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Meter - Large Display */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Large Panel Meter (Master)</h3>
        <div className="max-w-md">
          <VUMeter
            peakLevel={masterLevel}
            size="large"
            showPeakHold={true}
            peakHoldDuration={1500}
            onPeakReset={() => console.log('Peak reset')}
          />
        </div>
      </div>

      {/* Features Explanation */}
      <div className="border-t border-gray-700 pt-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Features</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Feature 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="font-semibold text-gray-300">Canvas-based Animation</span>
            </div>
            <p className="text-sm text-gray-500 ml-5">
              Smooth hardware-accelerated rendering for responsive, jitter-free animation at 60 FPS
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="font-semibold text-gray-300">Color Zone Coding</span>
            </div>
            <p className="text-sm text-gray-500 ml-5">
              Green (safe ≤-6dB) → Yellow (caution -6 to -3dB) → Red (clipping ≥-3dB)
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="font-semibold text-gray-300">Peak Hold Indicator</span>
            </div>
            <p className="text-sm text-gray-500 ml-5">
              Displays maximum level reached with configurable hold duration (default 1000ms)
            </p>
          </div>

          {/* Feature 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="font-semibold text-gray-300">Peak Reset Button</span>
            </div>
            <p className="text-sm text-gray-500 ml-5">
              Manually reset peak hold in large display mode with optional callback
            </p>
          </div>

          {/* Feature 5 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400" />
              <span className="font-semibold text-gray-300">Responsive Design</span>
            </div>
            <p className="text-sm text-gray-500 ml-5">
              Scales smoothly to container size with automatic DPI scaling for retina displays
            </p>
          </div>

          {/* Feature 6 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="font-semibold text-gray-300">Real-time Data Integration</span>
            </div>
            <p className="text-sm text-gray-500 ml-5">
              Direct integration with audio engine peak level data from MixerChannelConfig
            </p>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="border-t border-gray-700 pt-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Technical Specifications</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div>
            <span className="font-semibold text-gray-300">dB Range:</span> -60 dB to +6 dB (display range)
          </div>
          <div>
            <span className="font-semibold text-gray-300">Color Zones:</span>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Green: -60 to -6 dB (safe)</li>
              <li>• Yellow: -6 to -3 dB (caution)</li>
              <li>• Red: -3 to +6 dB (clipping risk)</li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-gray-300">Animation:</span> 60 FPS requestAnimationFrame with smooth easing
          </div>
          <div>
            <span className="font-semibold text-gray-300">Attack:</span> 30% per frame (fast response)
          </div>
          <div>
            <span className="font-semibold text-gray-300">Release:</span> 5% per frame (smooth decay)
          </div>
          <div>
            <span className="font-semibold text-gray-300">Peak Hold:</span> Configurable duration, auto-reset after timeout
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="border-t border-gray-700 pt-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Usage</h3>
        <pre className="bg-gray-900 p-4 rounded border border-gray-700 overflow-x-auto text-xs text-gray-300">
{`import { VUMeter } from '@/components/Shared/Mixer/VUMeter';

// Small inline meter (channel strip)
<VUMeter
  peakLevel={-12}
  size="small"
  showPeakHold={true}
/>

// Large dedicated panel
<VUMeter
  peakLevel={-12}
  size="large"
  showPeakHold={true}
  peakHoldDuration={1000}
  onPeakReset={() => console.log('Peak reset')}
/>`}
        </pre>
      </div>
    </div>
  );
}
