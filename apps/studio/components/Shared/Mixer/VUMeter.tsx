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

  /**
   * Peak hold duration in milliseconds
   */
  peakHoldDuration?: number;

  /**
   * Callback when peak is reset
   */
  onPeakReset?: () => void;
}

/**
 * Professional VU meter component with canvas-based smooth animation
 * Displays dB levels from -Infinity to +6dB with color zones:
 * - Green: ≤ -6dB (safe)
 * - Yellow: -6dB to -3dB (caution)
 * - Red: ≥ -3dB (clipping risk)
 */
export function VUMeter({
  peakLevel,
  size = 'small',
  showPeakHold = true,
  peakHoldDuration = 1000,
  onPeakReset,
}: VUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayPeak, setDisplayPeak] = useState(peakLevel);
  const peakHoldRef = useRef<number>(-Infinity);
  const peakHoldTimeoutRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();

  // dB range constants
  const DB_MIN = -60;
  const DB_MAX = 6;
  const DB_YELLOW_START = -6;
  const DB_YELLOW_END = -3;
  const DB_RED_START = -3;

  /**
   * Normalize dB value to 0-1 range for display
   */
  const normalizeDC = (dB: number): number => {
    return Math.max(0, Math.min(1, (dB - DB_MIN) / (DB_MAX - DB_MIN)));
  };

  /**
   * Get color based on dB level
   */
  const getColorForLevel = (dB: number): string => {
    if (dB >= DB_RED_START) return '#EF4444'; // Red
    if (dB >= DB_YELLOW_START) return '#FBBF24'; // Yellow
    return '#22C55E'; // Green
  };

  /**
   * Draw the large canvas-based VU meter
   */
  const drawLargeMeter = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    normalized: number,
    peakHoldNormalized: number,
  ) => {
    const padding = 16;
    const meterHeight = height - padding * 2 - 40;
    const meterY = padding + 20;
    const meterX = padding;
    const meterWidth = width - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Draw scale background zones
    const greenWidth = normalizeDC(DB_YELLOW_START) * meterWidth;
    const yellowWidth = (normalizeDC(DB_YELLOW_END) - normalizeDC(DB_YELLOW_START)) * meterWidth;
    const redWidth = meterWidth - greenWidth - yellowWidth;

    // Green zone (safe)
    ctx.fillStyle = '#22C55E';
    ctx.globalAlpha = 0.08;
    ctx.fillRect(meterX, meterY, greenWidth, meterHeight);

    // Yellow zone (caution)
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(meterX + greenWidth, meterY, yellowWidth, meterHeight);

    // Red zone (clipping risk)
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(meterX + greenWidth + yellowWidth, meterY, redWidth, meterHeight);

    ctx.globalAlpha = 1;

    // Draw scale markings
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    const scalePoints = [-60, -40, -20, -6, 0, 3, 6];
    scalePoints.forEach((dB) => {
      const x = meterX + normalizeDC(dB) * meterWidth;
      ctx.beginPath();
      ctx.moveTo(x, meterY - 4);
      ctx.lineTo(x, meterY - 1);
      ctx.stroke();

      ctx.fillText(dB.toString(), x, meterY - 8);
    });

    // Draw level bar
    const barWidth = Math.max(1, normalized * meterWidth);
    const barColor = getColorForLevel(DB_MIN + normalized * (DB_MAX - DB_MIN));

    ctx.fillStyle = barColor;
    ctx.shadowColor = barColor;
    ctx.shadowBlur = 12;
    ctx.fillRect(meterX, meterY + 2, barWidth, meterHeight - 4);
    ctx.shadowBlur = 0;

    // Draw peak hold indicator
    if (showPeakHold && peakHoldNormalized > 0) {
      const peakX = meterX + peakHoldNormalized * meterWidth;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(peakX, meterY);
      ctx.lineTo(peakX, meterY + meterHeight);
      ctx.stroke();

      // Peak hold glow
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(peakX, meterY);
      ctx.lineTo(peakX, meterY + meterHeight);
      ctx.stroke();
    }

    // Draw top border
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(meterX, meterY);
    ctx.lineTo(meterX + meterWidth, meterY);
    ctx.stroke();
  };

  /**
   * Draw the small inline VU meter
   */
  const drawSmallMeter = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    normalized: number,
    peakHoldNormalized: number,
  ) => {
    const padding = 2;
    const meterHeight = height - padding * 2;
    const meterY = padding;
    const meterX = padding;
    const meterWidth = width - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Draw scale background zones
    const greenWidth = normalizeDC(DB_YELLOW_START) * meterWidth;
    const yellowWidth = (normalizeDC(DB_YELLOW_END) - normalizeDC(DB_YELLOW_START)) * meterWidth;
    const redWidth = meterWidth - greenWidth - yellowWidth;

    // Green zone
    ctx.fillStyle = '#22C55E';
    ctx.globalAlpha = 0.15;
    ctx.fillRect(meterX, meterY, greenWidth, meterHeight);

    // Yellow zone
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(meterX + greenWidth, meterY, yellowWidth, meterHeight);

    // Red zone
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(meterX + greenWidth + yellowWidth, meterY, redWidth, meterHeight);

    ctx.globalAlpha = 1;

    // Draw level bar with gradient
    const barWidth = Math.max(1, normalized * meterWidth);
    const barColor = getColorForLevel(DB_MIN + normalized * (DB_MAX - DB_MIN));

    ctx.fillStyle = barColor;
    ctx.shadowColor = barColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(meterX, meterY, barWidth, meterHeight);
    ctx.shadowBlur = 0;

    // Draw peak hold indicator
    if (showPeakHold && peakHoldNormalized > 0) {
      const peakX = meterX + peakHoldNormalized * meterWidth;
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillRect(peakX - 1, meterY, 2, meterHeight);
      ctx.shadowBlur = 0;
    }
  };

  /**
   * Smooth animation using requestAnimationFrame
   */
  useEffect(() => {
    const animate = () => {
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Smooth peak level transition
      setDisplayPeak((prev) => {
        const diff = peakLevel - prev;
        // Fast attack, slow release
        const attackFactor = 0.3;
        const releaseFactor = 0.05;
        const factor = diff > 0 ? attackFactor : releaseFactor;
        return prev + diff * factor;
      });

      // Update peak hold
      if (showPeakHold && peakLevel > peakHoldRef.current) {
        peakHoldRef.current = peakLevel;
        clearTimeout(peakHoldTimeoutRef.current);
        peakHoldTimeoutRef.current = setTimeout(() => {
          peakHoldRef.current = -Infinity;
        }, peakHoldDuration);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [peakLevel, showPeakHold, peakHoldDuration]);

  /**
   * Draw canvas when display peak updates
   */
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const normalized = normalizeDC(displayPeak);
    const peakHoldNormalized =
      peakHoldRef.current !== -Infinity ? normalizeDC(peakHoldRef.current) : 0;

    if (size === 'large') {
      drawLargeMeter(ctx, rect.width, rect.height, normalized, peakHoldNormalized);
    } else {
      drawSmallMeter(ctx, rect.width, rect.height, normalized, peakHoldNormalized);
    }
  }, [displayPeak, size]);

  const handlePeakReset = () => {
    peakHoldRef.current = -Infinity;
    clearTimeout(peakHoldTimeoutRef.current);
    onPeakReset?.();
  };

  if (size === 'small') {
    return (
      <div className="w-full space-y-2">
        <canvas
          ref={canvasRef}
          className="w-full h-8 rounded border border-gray-700 bg-gray-900"
          style={{ display: 'block' }}
        />
        <div className="text-xs text-gray-500 text-center font-mono">
          {displayPeak.toFixed(1)} dB
        </div>
      </div>
    );
  }

  // Large display
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">VU Meter</h3>
        {showPeakHold && peakHoldRef.current !== -Infinity && (
          <button
            onClick={handlePeakReset}
            className="px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            title="Reset peak level"
          >
            Reset Peak
          </button>
        )}
      </div>

      {/* Canvas Meter */}
      <canvas
        ref={canvasRef}
        className="w-full h-56 rounded border border-gray-700 bg-gray-950"
        style={{ display: 'block' }}
      />

      {/* Numeric Display */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Current Level</div>
          <div className="text-2xl font-mono font-bold text-blue-400">
            {displayPeak.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">dB</div>
        </div>

        {showPeakHold && peakHoldRef.current !== -Infinity && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Peak Level</div>
            <div className="text-2xl font-mono font-bold text-red-400">
              {peakHoldRef.current.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">dB</div>
          </div>
        )}
      </div>

      {/* Color Zone Legend */}
      <div className="border-t border-gray-700 pt-4 space-y-2">
        <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Zones</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <div className="text-sm text-gray-400">
              Safe Zone: ≤ -6 dB
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <div className="text-sm text-gray-400">
              Caution: -6 to -3 dB
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <div className="text-sm text-gray-400">
              Clipping Risk: ≥ -3 dB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
