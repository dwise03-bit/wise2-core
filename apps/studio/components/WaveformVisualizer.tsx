'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: number;
  duration: number;
  peakLevel: number;
  rmsLevel: number;
  trackName?: string;
  animated?: boolean;
}

export function WaveformVisualizer({
  isPlaying,
  isRecording,
  currentTime,
  duration,
  peakLevel,
  rmsLevel,
  trackName = 'Track',
  animated = true,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate simulated waveform data based on levels
  useEffect(() => {
    const generateWaveform = () => {
      const bins = 64;
      const data: number[] = [];
      for (let i = 0; i < bins; i++) {
        const angle = (i / bins) * Math.PI * 2;
        // Simulate waveform with some variation
        const baseLevel = Math.abs(Math.sin(angle)) * 0.5;
        const rmsInfluence = Math.max(-60, Math.min(0, rmsLevel)) / -60 * 0.5;
        const peakInfluence = Math.max(-60, Math.min(0, peakLevel)) / -60 * 0.3;
        data.push(baseLevel + rmsInfluence + peakInfluence + Math.random() * 0.1);
      }
      setWaveformData(data);
    };

    generateWaveform();
    const interval = setInterval(generateWaveform, 50);
    return () => clearInterval(interval);
  }, [rmsLevel, peakLevel]);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      try {
        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;

        // Clear canvas with slight trail effect
        ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
        ctx.fillRect(0, 0, width, height);

        // Draw background grid
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < waveformData.length; i++) {
          const x = (i / (waveformData.length - 1)) * width;
          ctx.beginPath();
          ctx.moveTo(x, centerY - height * 0.3);
          ctx.lineTo(x, centerY + height * 0.3);
          ctx.stroke();
        }

        // Draw waveform with simple color (avoid gradient issues)
        const baseColorRgb = isRecording ? 'rgba(239, 68, 68, 1)' : 'rgba(57, 255, 20, 1)';
        ctx.strokeStyle = baseColorRgb;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < waveformData.length; i++) {
          const x = (i / (waveformData.length - 1)) * width;
          const amplitude = waveformData[i];
          const y = centerY - (amplitude * height * 0.35);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } catch (err) {
        console.error('Waveform drawing error:', err);
      }

      // Draw reflection
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      for (let i = 0; i < waveformData.length; i++) {
        const x = (i / (waveformData.length - 1)) * width;
        const amplitude = waveformData[i];
        const y = centerY + (amplitude * height * 0.35);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw playhead
      if (duration > 0) {
        const playheadX = (currentTime / duration) * width;
        ctx.strokeStyle = 'rgb(57, 255, 20)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();

        // Draw playhead indicator circle
        ctx.fillStyle = 'rgb(57, 255, 20)';
        ctx.beginPath();
        ctx.arc(playheadX, centerY - height * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();

    if (animated && (isPlaying || isRecording)) {
      animationRef.current = requestAnimationFrame(() => {
        draw();
      });
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveformData, isPlaying, isRecording, currentTime, duration, animated]);

  return (
    <motion.div
      className="w-full rounded-lg overflow-hidden bg-wise-surface border border-wise-medium"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-wise-medium bg-wise-surface-secondary">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs font-mono text-wise-text-secondary">{trackName}</span>
        </div>
        <div className="text-xs font-mono text-wise-text-muted">
          {isRecording && 'REC'}
          {isPlaying && 'PLAY'}
          {!isRecording && !isPlaying && 'READY'}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full bg-black/50">
        <canvas
          ref={canvasRef}
          width={800}
          height={120}
          className="w-full h-24 sm:h-32 block"
          style={{ maxHeight: '200px' }}
        />
      </div>
    </motion.div>
  );
}
