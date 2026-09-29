'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, AlertCircle } from 'lucide-react';

interface DurationSelectorProps {
  value: number;
  onChange: (duration: number) => void;
  min?: number;
  max?: number;
}

const DURATION_PRESETS = [
  { label: 'Short', duration: 10, emoji: '⚡', description: 'Quick intro or outro' },
  { label: 'Standard', duration: 30, emoji: '🎵', description: 'Full track' },
  { label: 'Extended', duration: 60, emoji: '🎼', description: 'Long form' },
  { label: 'Epic', duration: 120, emoji: '🎭', description: 'Full composition' },
];

export function DurationSelector({
  value,
  onChange,
  min = 10,
  max = 120,
}: DurationSelectorProps) {
  const [customDuration, setCustomDuration] = useState(String(value));
  const [isPreviewingDuration, setIsPreviewingDuration] = useState(false);

  // Update custom duration when external value changes
  useEffect(() => {
    setCustomDuration(String(value));
  }, [value]);

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDuration(val);

    if (val.trim()) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= min && num <= max) {
        onChange(num);
      }
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    onChange(num);
    setCustomDuration(String(num));
  };

  const handlePreviewDuration = useCallback(async () => {
    setIsPreviewingDuration(true);

    // Create a simple sine wave for preview
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 440; // A4 note
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + Math.min(value / 1000, 5));

    setTimeout(() => setIsPreviewingDuration(false), Math.min(value, 5000));
  }, [value]);

  const formatSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  const estimatedTokens = Math.ceil((value / 30) * 100); // Rough estimate
  const estimatedCost = (estimatedTokens / 1000) * 0.01; // Placeholder pricing

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Duration
        </label>
        <p className="text-xs text-wise-text-muted">
          How long should your track be? Max 120 seconds.
        </p>
      </div>

      {/* Main Display */}
      <motion.div
        layout
        className="bg-studio-input border border-studio-line rounded-lg p-6 text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-3">
          <Clock className="w-6 h-6 text-wise-accent" />
          <div>
            <p className="text-3xl md:text-4xl font-bold text-wise-text-primary">
              {value}s
            </p>
            <p className="text-sm text-wise-text-secondary">{formatSeconds(value)}</p>
          </div>
        </div>
      </motion.div>

      {/* Slider Control */}
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-studio-line rounded-lg appearance-none cursor-pointer accent-wise-accent"
          style={{
            background: `linear-gradient(to right, var(--acc, #39FF14) 0%, var(--acc, #39FF14) ${
              ((value - min) / (max - min)) * 100
            }%, #262626 ${((value - min) / (max - min)) * 100}%, #262626 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-wise-text-muted">
          <span>{min}s</span>
          <span>{max}s</span>
        </div>
      </div>

      {/* Numeric Input + Preview */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="number"
            value={customDuration}
            onChange={handleCustomDurationChange}
            min={min}
            max={max}
            className="w-full px-4 py-2 bg-studio-input border border-studio-line rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition text-center font-mono"
            placeholder="Seconds"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-wise-text-muted text-sm">
            seconds
          </span>
        </div>

        {/* Preview Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePreviewDuration}
          disabled={isPreviewingDuration}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
            isPreviewingDuration
              ? 'bg-wise-accent text-black'
              : 'bg-studio-input border border-studio-line text-wise-text-primary hover:border-wise-accent'
          }`}
          title="Play audio preview of duration"
        >
          <Play className="w-4 h-4" />
          Preview
        </motion.button>
      </div>

      {/* Duration Presets */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-wise-text-muted">Common Durations</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DURATION_PRESETS.map(preset => (
            <motion.button
              key={preset.duration}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(preset.duration)}
              className={`p-3 rounded-lg text-center transition border ${
                value === preset.duration
                  ? 'bg-gradient-to-br from-wise-accent-dim to-wise-accent text-black border-wise-accent'
                  : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent hover:bg-studio-raised'
              }`}
            >
              <div className="text-2xl">{preset.emoji}</div>
              <p className="text-xs font-bold mt-1">{preset.label}</p>
              <p className="text-xs text-wise-text-muted mt-0.5">{preset.duration}s</p>
              <p className="text-xs text-wise-text-muted">{preset.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cost / Token Estimate */}
      <motion.div
        layout
        className="p-4 bg-studio-raised border border-studio-line rounded-lg space-y-2"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-wise-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1 flex-1">
            <p className="text-wise-text-secondary">
              <strong>Estimated Generation Time:</strong> {Math.ceil(value / 10)} seconds
            </p>
            <p className="text-xs text-wise-text-muted">
              Longer tracks will take more time to generate. Actual time depends on quality settings and server load.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Duration Info Table */}
      <div className="grid grid-cols-3 gap-2 text-xs p-3 bg-studio-input rounded-lg">
        <div>
          <p className="text-wise-text-muted">Duration</p>
          <p className="font-mono text-wise-text-primary">{formatSeconds(value)}</p>
        </div>
        <div>
          <p className="text-wise-text-muted">Milliseconds</p>
          <p className="font-mono text-wise-text-primary">{value * 1000}ms</p>
        </div>
        <div>
          <p className="text-wise-text-muted">Bars (120 BPM)</p>
          <p className="font-mono text-wise-text-primary">{Math.ceil((value / 60) * 8)}</p>
        </div>
      </div>
    </div>
  );
}
