'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music2, Zap } from 'lucide-react';

interface TempoControlProps {
  value: number;
  onChange: (bpm: number) => void;
  min?: number;
  max?: number;
}

const TEMPO_PRESETS = [
  { label: 'Ballad', bpm: 60, emoji: '🎼' },
  { label: 'Walking', bpm: 90, emoji: '🚶' },
  { label: 'Moderate', bpm: 120, emoji: '🎵' },
  { label: 'Upbeat', bpm: 140, emoji: '⚡' },
  { label: 'Fast', bpm: 160, emoji: '🏃' },
];

export function TempoControl({
  value,
  onChange,
  min = 40,
  max = 200,
}: TempoControlProps) {
  const [tapTempoCount, setTapTempoCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState(String(value));
  const [showTapFeedback, setShowTapFeedback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update input when external value changes
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  // Create click sound on mount
  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  // Handle tap tempo
  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    setShowTapFeedback(true);

    if (lastTapTime && now - lastTapTime < 2000) {
      const interval = now - lastTapTime;
      const bpm = Math.round(60000 / interval);

      if (bpm >= min && bpm <= max) {
        onChange(bpm);
        setTapTempoCount(c => (c + 1) % 4);
      }
    } else {
      setTapTempoCount(1);
    }

    setLastTapTime(now);

    // Reset feedback
    setTimeout(() => setShowTapFeedback(false), 200);
  }, [lastTapTime, onChange, min, max]);

  // Handle numeric input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim()) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= min && num <= max) {
        onChange(num);
      }
    }
  };

  // Handle slider input
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    onChange(num);
    setInputValue(String(num));
  };

  // Get tempo category
  const getTempoCategory = () => {
    if (value <= 60) return 'Very Slow';
    if (value <= 90) return 'Slow';
    if (value <= 120) return 'Moderate';
    if (value <= 140) return 'Upbeat';
    if (value <= 160) return 'Fast';
    return 'Very Fast';
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Tempo (BPM)
        </label>
        <p className="text-xs text-wise-text-muted">
          Beats per minute. Tap or drag to set the rhythm.
        </p>
      </div>

      {/* Main Display */}
      <motion.div
        layout
        className="bg-studio-input border border-studio-line rounded-lg p-6 text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-2">
          <Music2 className="w-6 h-6 text-wise-accent" />
          <span className="text-4xl md:text-5xl font-bold text-wise-text-primary">
            {value}
          </span>
          <span className="text-lg text-wise-text-muted">BPM</span>
        </div>
        <p className="text-sm text-wise-text-secondary">{getTempoCategory()} Tempo</p>
      </motion.div>

      {/* Slider Control */}
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-studio-line rounded-lg appearance-none cursor-pointer accent-wise-accent slider"
          style={{
            background: `linear-gradient(to right, var(--acc, #39FF14) 0%, var(--acc, #39FF14) ${
              ((value - min) / (max - min)) * 100
            }%, #262626 ${((value - min) / (max - min)) * 100}%, #262626 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-wise-text-muted">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Numeric Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="w-full px-4 py-2 bg-studio-input border border-studio-line rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition text-center font-mono"
            placeholder="BPM"
          />
        </div>

        {/* Tap Tempo Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTapTempo}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
            showTapFeedback
              ? 'bg-wise-accent text-black'
              : 'bg-studio-input border border-studio-line text-wise-text-primary hover:border-wise-accent'
          }`}
          title="Click in rhythm to set tempo"
        >
          <Zap className="w-4 h-4" />
          Tap
          {tapTempoCount > 0 && <span className="text-xs">({tapTempoCount})</span>}
        </motion.button>
      </div>

      {/* Tempo Presets */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-wise-text-muted">Quick Presets</p>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {TEMPO_PRESETS.map(preset => (
            <motion.button
              key={preset.bpm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(preset.bpm)}
              className={`p-2 rounded-lg text-center transition border text-sm font-semibold ${
                value === preset.bpm
                  ? 'bg-gradient-to-br from-wise-accent-dim to-wise-accent text-black border-wise-accent'
                  : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent hover:bg-studio-raised'
              }`}
            >
              <div className="text-lg">{preset.emoji}</div>
              <div className="text-xs mt-1">{preset.bpm}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tap Tempo Instructions */}
      <div className="p-3 bg-studio-raised border border-studio-line rounded-lg">
        <p className="text-xs text-wise-text-secondary">
          <strong>💡 Tip:</strong> Click the Tap button in rhythm to set the tempo. 4 taps will calculate the BPM automatically.
        </p>
      </div>

      {/* Tempo Info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-wise-text-muted p-3 bg-studio-input rounded-lg">
        <div>
          <p className="text-wise-text-muted">Beats per Minute</p>
          <p className="font-mono text-wise-text-primary">{value} BPM</p>
        </div>
        <div>
          <p className="text-wise-text-muted">Beat Duration</p>
          <p className="font-mono text-wise-text-primary">
            {(60000 / value).toFixed(0)}ms
          </p>
        </div>
      </div>
    </div>
  );
}
