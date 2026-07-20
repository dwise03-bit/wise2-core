'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Canvas visualization primitives for Creative Studio.
 * Each component handles its own rAF lifecycle and gates to visibility.
 */

interface CanvasProps {
  className?: string;
  width?: number;
  height?: number;
}

export const WaveformEditor = React.forwardRef<
  HTMLCanvasElement,
  CanvasProps & { playhead?: number; playing?: boolean; waveData?: number[] }
>(({ className = '', width = 800, height = 120, playhead = 0.28, playing = true, waveData }, ref) => {
  const phase = useRef(0);

  useEffect(() => {
    const canvas = (ref as React.MutableRefObject<HTMLCanvasElement | null>)?.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const wave = waveData || Array.from({ length: 420 }, (_, i) =>
      Math.abs(Math.sin(i * 0.21) * 0.5 + Math.sin(i * 0.053) * 0.32 + Math.sin(i * 0.011) * 0.18) *
      (0.55 + 0.45 * Math.abs(Math.sin(i * 0.0047)))
    );

    const loop = () => {
      phase.current += 0.016;
      if (playing) phase.current += 0.00045;

      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;

      // Center line
      ctx.strokeStyle = '#151515';
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(width, mid);
      ctx.stroke();

      // Waveform
      const n = wave.length;
      const bw = width / n;
      for (let i = 0; i < n; i++) {
        const played = (i / n) < playhead;
        const wob = played && playing ? 1 + 0.12 * Math.sin(phase.current * 6 + i) : 1;
        const h = wave[i] * (height * 0.44) * wob;
        ctx.fillStyle = played ? '#39FF14' : '#1f4d18';
        ctx.fillRect(i * bw, mid - h, Math.max(1, bw - 0.6), h * 2);
      }

      // Playhead
      const px = playhead * width;
      ctx.fillStyle = 'rgba(57,255,20,.9)';
      ctx.fillRect(px, 0, 2, height);
      ctx.fillStyle = 'rgba(57,255,20,.15)';
      ctx.fillRect(px - 26, 0, 26, height);
    };

    const raf = requestAnimationFrame(() => {
      loop();
    });
    const interval = setInterval(() => {
      loop();
    }, 1000 / 60);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [playhead, playing, waveData, width, height, ref]);

  return <canvas ref={ref} width={width} height={height} className={className} style={{ display: 'block' }} />;
});
WaveformEditor.displayName = 'WaveformEditor';

export const MeterLED = React.forwardRef<HTMLCanvasElement, CanvasProps & { level?: number }>(
  ({ className = '', width = 60, height = 120, level = 0.62 }, ref) => {
    const phase = useRef(0);

    useEffect(() => {
      const canvas = (ref as React.MutableRefObject<HTMLCanvasElement | null>)?.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loop = () => {
        phase.current += 0.016;

        ctx.clearRect(0, 0, width, height);

        const lv = level;
        [4, width / 2 + 2].forEach((ox) => {
          const l = Math.min(1, lv);
          for (let i = 0; i < 22; i++) {
            const y = height - 6 - (i * (height - 10)) / 22;
            const on = (i / 22) < l;
            ctx.fillStyle = !on ? '#161616' : i > 19 ? '#ff4040' : i > 16 ? '#e0a83c' : '#39FF14';
            ctx.fillRect(ox, y, width / 2 - 6, (height - 10) / 22 - 3);
          }
        });
      };

      const interval = setInterval(loop, 1000 / 60);
      loop();

      return () => clearInterval(interval);
    }, [level, width, height, ref]);

    return <canvas ref={ref} width={width} height={height} className={className} style={{ display: 'block' }} />;
  }
);
MeterLED.displayName = 'MeterLED';

export const SpectrumBars = React.forwardRef<HTMLCanvasElement, CanvasProps & { bars?: number }>(
  ({ className = '', width = 300, height = 80, bars = 26 }, ref) => {
    const phase = useRef(0);

    useEffect(() => {
      const canvas = (ref as React.MutableRefObject<HTMLCanvasElement | null>)?.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const gap = 4;
      const loop = () => {
        phase.current += 0.016;

        ctx.clearRect(0, 0, width, height);
        const bw = (width - gap * bars) / bars;

        for (let i = 0; i < bars; i++) {
          const h = height * (0.15 + 0.8 * Math.abs(Math.sin(phase.current * 4 + i * 1.3) * Math.sin(phase.current * 1.7 + i * 0.4)));
          ctx.fillStyle = '#39FF14';
          ctx.globalAlpha = 0.5 + 0.5 * (h / height);
          ctx.fillRect(i * (bw + gap), height - h, bw, h);
        }
        ctx.globalAlpha = 1;
      };

      const interval = setInterval(loop, 1000 / 60);
      loop();

      return () => clearInterval(interval);
    }, [width, height, bars, ref]);

    return <canvas ref={ref} width={width} height={height} className={className} style={{ display: 'block' }} />;
  }
);
SpectrumBars.displayName = 'SpectrumBars';

export const HorizontalMeter = React.forwardRef<HTMLCanvasElement, CanvasProps & { level?: number }>(
  ({ className = '', width = 200, height = 24, level = 0.6 }, ref) => {
    const phase = useRef(0);

    useEffect(() => {
      const canvas = (ref as React.MutableRefObject<HTMLCanvasElement | null>)?.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loop = () => {
        phase.current += 0.016;

        ctx.clearRect(0, 0, width, height);
        const segs = 24;
        const lv = level;

        for (let s = 0; s < segs; s++) {
          const on = (s / segs) < lv;
          ctx.fillStyle = !on ? '#181818' : s > 21 ? '#ff4040' : s > 18 ? '#e0a83c' : '#39FF14';
          ctx.fillRect((s * width) / segs, 0, width / segs - 2, height);
        }
      };

      const interval = setInterval(loop, 1000 / 60);
      loop();

      return () => clearInterval(interval);
    }, [level, width, height, ref]);

    return <canvas ref={ref} width={width} height={height} className={className} style={{ display: 'block' }} />;
  }
);
HorizontalMeter.displayName = 'HorizontalMeter';

export const SmoothWave = React.forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ className = '', width = 400, height = 80 }, ref) => {
    const phase = useRef(0);

    useEffect(() => {
      const canvas = (ref as React.MutableRefObject<HTMLCanvasElement | null>)?.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const mid = height / 2;

      const loop = () => {
        phase.current += 0.016;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#39FF14';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(57,255,20,.6)';
        ctx.shadowBlur = 6;
        ctx.beginPath();

        for (let i = 0; i <= width; i += 4) {
          const t = i / width;
          const env = Math.sin(t * Math.PI);
          const y =
            mid +
            env *
              mid *
              0.8 *
              Math.sin(t * 34 + phase.current * 3) *
              (0.4 + 0.6 * Math.abs(Math.sin(t * 7 + phase.current)));

          i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      const interval = setInterval(loop, 1000 / 60);
      loop();

      return () => clearInterval(interval);
    }, [width, height, ref]);

    return <canvas ref={ref} width={width} height={height} className={className} style={{ display: 'block' }} />;
  }
);
SmoothWave.displayName = 'SmoothWave';
