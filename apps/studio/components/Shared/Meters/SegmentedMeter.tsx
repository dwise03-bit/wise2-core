'use client';

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';

export interface SegmentedMeterProps {
  peakLevel: number; // -Infinity to +6 dB
  size?: 'small' | 'large'; // Default: 'small'
  showPeakHold?: boolean; // Default: true
  peakHoldDuration?: number; // Default: 1000ms
  onPeakReset?: () => void;
  label?: string; // Optional channel label
}

// Color zone definitions
const COLOR_ZONES = [
  { minDb: -60, maxDb: -12, colorVar: '--meter-safe', label: 'Green' },
  { minDb: -12, maxDb: -6, colorVar: '--meter-caution', label: 'Lime' },
  { minDb: -6, maxDb: -3, colorVar: '--meter-warning', label: 'Amber' },
  { minDb: -3, maxDb: 0, colorVar: '--meter-alert', label: 'Orange' },
  { minDb: 0, maxDb: 6, colorVar: '--meter-critical', label: 'Red' },
];

const SEGMENT_COUNT = 12;
const PEAK_HOLD_TIMEOUT = 1000; // ms
const ATTACK_TIME = 0.05; // seconds - fast response
const RELEASE_TIME = 0.2; // seconds - smooth decay

interface ColorZone {
  minDb: number;
  maxDb: number;
  colorVar: string;
  label: string;
  color?: string; // Computed at runtime
}

export const SegmentedMeter: React.FC<SegmentedMeterProps> = ({
  peakLevel,
  size = 'small',
  showPeakHold = true,
  peakHoldDuration = PEAK_HOLD_TIMEOUT,
  onPeakReset,
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // State for smooth animation and peak hold
  const [displayLevel, setDisplayLevel] = useState<number>(-Infinity);
  const [peakHoldLevel, setPeakHoldLevel] = useState<number>(-Infinity);
  const [peakHoldTimeout, setPeakHoldTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Computed values
  const sizeConfig = useMemo(() => {
    return {
      small: {
        width: 40,
        height: 260,
        padding: 4,
        segmentGap: 2,
        borderRadius: 4,
      },
      large: {
        width: 80,
        height: 260,
        padding: 6,
        segmentGap: 3,
        borderRadius: 6,
      },
    }[size];
  }, [size]);

  // Convert dB to segment index (0-11)
  const dbToSegmentIndex = useCallback((db: number): number => {
    if (!isFinite(db)) return -1;
    const normalized = Math.max(-60, Math.min(6, db));
    const ratio = (normalized - (-60)) / (6 - (-60)); // 0 to 1
    return Math.floor(ratio * SEGMENT_COUNT);
  }, []);

  // Get color for a segment index
  const getSegmentColor = useCallback(
    (segmentIndex: number, computedColors: Record<string, string>): string => {
      const db = ((segmentIndex / SEGMENT_COUNT) * 66) - 60;
      for (const zone of COLOR_ZONES) {
        if (db >= zone.minDb && db < zone.maxDb) {
          return computedColors[zone.colorVar] || '#888888';
        }
      }
      return computedColors[COLOR_ZONES[COLOR_ZONES.length - 1].colorVar] || '#888888';
    },
    []
  );

  // Smooth animation: attack and release
  const smoothLevel = useCallback(
    (current: number, target: number, deltaTime: number): number => {
      if (!isFinite(current)) current = -Infinity;
      if (!isFinite(target)) target = -Infinity;

      if (target > current) {
        // Attack (fast)
        const attackStep = (ATTACK_TIME * 1000) / deltaTime;
        return current + (target - current) * Math.min(1, 1 / attackStep);
      } else {
        // Release (slow)
        const releaseStep = (RELEASE_TIME * 1000) / deltaTime;
        return current + (target - current) * Math.min(1, 1 / releaseStep);
      }
    },
    []
  );

  // Compute CSS variables from root
  const computeColors = useCallback((): Record<string, string> => {
    const root = document.documentElement;
    const colors: Record<string, string> = {};
    for (const zone of COLOR_ZONES) {
      const computed = getComputedStyle(root).getPropertyValue(zone.colorVar).trim();
      colors[zone.colorVar] = computed || '#888888';
    }
    return colors;
  }, []);

  // Draw the meter on canvas
  const drawMeter = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      dpiScale: number,
      displayLevelValue: number,
      peakHoldValue: number,
      computedColors: Record<string, string>
    ) => {
      const w = sizeConfig.width * dpiScale;
      const h = sizeConfig.height * dpiScale;
      const p = sizeConfig.padding * dpiScale;
      const gap = sizeConfig.segmentGap * dpiScale;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, w, h);

      const meterWidth = w - p * 2;
      const segmentHeight = (h - p * 2 - gap * (SEGMENT_COUNT - 1)) / SEGMENT_COUNT;

      const displaySegmentIndex = dbToSegmentIndex(displayLevelValue);
      const peakSegmentIndex = dbToSegmentIndex(peakHoldValue);

      // Draw segments (bottom to top, index 0 at bottom)
      for (let i = 0; i < SEGMENT_COUNT; i++) {
        const isLit = i <= displaySegmentIndex;
        const yPos = h - p - (i + 1) * (segmentHeight + gap);

        // Background color (dim if unlit)
        const segmentColor = getSegmentColor(i, computedColors);
        ctx.fillStyle = isLit
          ? segmentColor
          : adjustColorOpacity(segmentColor, 0.2);

        // Draw segment with rounded corners
        ctx.fillRect(p, yPos, meterWidth, segmentHeight);
      }

      // Draw peak marker (bright white line)
      if (isFinite(peakHoldValue) && peakSegmentIndex >= 0) {
        const peakYPos = h - p - (peakSegmentIndex + 1) * (segmentHeight + gap) + segmentHeight / 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2 * dpiScale;
        ctx.beginPath();
        ctx.moveTo(p, peakYPos);
        ctx.lineTo(w - p, peakYPos);
        ctx.stroke();
      }

      // Draw border
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
      ctx.lineWidth = 1 * dpiScale;
      ctx.strokeRect(p, p, meterWidth, h - p * 2);
    },
    [sizeConfig, dbToSegmentIndex, getSegmentColor]
  );

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Compute DPI scale
    const dpiScale = window.devicePixelRatio || 1;
    canvas.width = sizeConfig.width * dpiScale;
    canvas.height = sizeConfig.height * dpiScale;
    ctx.scale(dpiScale, dpiScale);

    // Compute colors once per animation frame
    const computedColors = computeColors();

    let lastTime = performance.now();
    let lastDisplayLevel = -Infinity;

    const animate = (currentTime: number) => {
      const deltaTime = Math.max(1, currentTime - lastTime);
      lastTime = currentTime;

      // Smooth the display level
      const newDisplayLevel = smoothLevel(lastDisplayLevel, peakLevel, deltaTime);
      lastDisplayLevel = newDisplayLevel;
      setDisplayLevel(newDisplayLevel);

      // Update peak hold
      if (peakLevel > peakHoldLevel) {
        setPeakHoldLevel(peakLevel);

        // Clear existing timeout
        if (peakHoldTimeout) {
          clearTimeout(peakHoldTimeout);
        }

        // Set new timeout for peak decay
        const timeout = setTimeout(() => {
          setPeakHoldLevel(-Infinity);
          onPeakReset?.();
        }, peakHoldDuration);

        setPeakHoldTimeout(timeout);
      }

      // Draw the meter
      drawMeter(ctx, 1, newDisplayLevel, peakHoldLevel, computedColors);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (peakHoldTimeout) {
        clearTimeout(peakHoldTimeout);
      }
    };
  }, [
    peakLevel,
    peakHoldLevel,
    peakHoldDuration,
    sizeConfig,
    drawMeter,
    smoothLevel,
    computeColors,
    peakHoldTimeout,
    onPeakReset,
  ]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-2"
      style={{
        '--meter-safe': '#22C55E',
        '--meter-caution': '#84CC16',
        '--meter-warning': '#FBBF24',
        '--meter-alert': '#F97316',
        '--meter-critical': '#EF4444',
      } as React.CSSProperties}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
        style={{
          width: `${sizeConfig.width}px`,
          height: `${sizeConfig.height}px`,
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: `${sizeConfig.width}px`,
            height: `${sizeConfig.height}px`,
          }}
        />
      </div>
      {label && (
        <div className="text-xs font-medium text-gray-400 text-center">
          {label}
        </div>
      )}
    </div>
  );
};

// Helper: adjust color opacity
function adjustColorOpacity(color: string, opacity: number): string {
  // Handle CSS color names and hex
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }

  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Fallback for named colors (convert to rgba)
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return color;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const imageData = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, ${opacity})`;
}

export default SegmentedMeter;
