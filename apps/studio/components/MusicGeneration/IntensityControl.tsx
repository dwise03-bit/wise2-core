'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Volume2 } from 'lucide-react';

interface IntensityControlProps {
  value: number;
  onChange: (intensity: number) => void;
  min?: number;
  max?: number;
  genreDefaults?: Record<string, number>;
}

const INTENSITY_LEVELS = [
  {
    level: 1,
    label: 'Minimal',
    emoji: '🌫️',
    color: 'from-slate-600 to-slate-500',
    description: 'Barely perceptible, subtle textures',
  },
  {
    level: 2,
    label: 'Very Soft',
    emoji: '🍃',
    color: 'from-cyan-600 to-cyan-500',
    description: 'Delicate, atmospheric',
  },
  {
    level: 3,
    label: 'Soft',
    emoji: '🌤️',
    color: 'from-blue-600 to-blue-500',
    description: 'Calm, relaxing',
  },
  {
    level: 4,
    label: 'Moderate',
    emoji: '🌤️',
    color: 'from-green-600 to-green-500',
    description: 'Balanced, gentle groove',
  },
  {
    level: 5,
    label: 'Medium',
    emoji: '⛅',
    color: 'from-yellow-600 to-yellow-500',
    description: 'Standard energy level',
  },
  {
    level: 6,
    label: 'Building',
    emoji: '🌥️',
    color: 'from-orange-600 to-orange-500',
    description: 'Growing momentum',
  },
  {
    level: 7,
    label: 'Energetic',
    emoji: '⛈️',
    color: 'from-red-600 to-red-500',
    description: 'High energy, driving beat',
  },
  {
    level: 8,
    label: 'Intense',
    emoji: '🔥',
    color: 'from-red-700 to-orange-600',
    description: 'Very powerful, aggressive',
  },
  {
    level: 9,
    label: 'Extreme',
    emoji: '💥',
    color: 'from-red-800 to-red-700',
    description: 'Explosive energy',
  },
  {
    level: 10,
    label: 'Maximum',
    emoji: '⚡',
    color: 'from-violet-900 to-red-900',
    description: 'Overwhelming intensity',
  },
];

export function IntensityControl({
  value,
  onChange,
  min = 1,
  max = 10,
  genreDefaults = {},
}: IntensityControlProps) {
  const selectedIntensity = INTENSITY_LEVELS.find(i => i.level === value);

  const genrePresets = useMemo(() => {
    return [
      { genre: 'Ambient', intensity: 2, emoji: '☁️' },
      { genre: 'Lo-Fi', intensity: 3, emoji: '🎧' },
      { genre: 'Jazz', intensity: 4, emoji: '🎷' },
      { genre: 'Pop', intensity: 6, emoji: '🎤' },
      { genre: 'Rock', intensity: 7, emoji: '🎸' },
      { genre: 'Metal', intensity: 9, emoji: '🔥' },
      { genre: 'EDM', intensity: 8, emoji: '⚡' },
      { genre: 'Classical', intensity: 5, emoji: '🎻' },
    ].map(preset => ({
      ...preset,
      intensity: genreDefaults[preset.genre] || preset.intensity,
    }));
  }, [genreDefaults]);

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  const handleQuickPreset = (intensity: number) => {
    onChange(intensity);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Intensity & Energy
        </label>
        <p className="text-xs text-wise-text-muted">
          Control the overall energy level and drive of your track.
        </p>
      </div>

      {/* Main Display */}
      {selectedIntensity && (
        <motion.div
          layout
          className={`p-6 rounded-lg bg-gradient-to-br ${selectedIntensity.color} text-center space-y-3 border border-opacity-30 border-white`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl">{selectedIntensity.emoji}</span>
            <div>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-sm font-semibold text-white text-opacity-90">/ 10</p>
            </div>
          </div>
          <div>
            <p className="font-bold text-white text-lg">{selectedIntensity.label}</p>
            <p className="text-sm text-white text-opacity-75">{selectedIntensity.description}</p>
          </div>
        </motion.div>
      )}

      {/* Slider Control */}
      <div className="space-y-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleIntensityChange}
          className="w-full h-3 bg-studio-line rounded-lg appearance-none cursor-pointer accent-wise-accent"
          style={{
            background: `linear-gradient(to right, var(--acc, #39FF14) 0%, var(--acc, #39FF14) ${
              ((value - min) / (max - min)) * 100
            }%, #262626 ${((value - min) / (max - min)) * 100}%, #262626 100%)`,
          }}
        />

        {/* Visual Level Indicators */}
        <div className="flex justify-between gap-1">
          {INTENSITY_LEVELS.map(level => (
            <motion.button
              key={level.level}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuickPreset(level.level)}
              className={`flex-1 h-8 rounded transition border text-xs font-bold flex items-center justify-center ${
                value === level.level
                  ? 'bg-gradient-to-br ' + level.color + ' text-white border-white'
                  : 'bg-studio-input border-studio-line text-wise-text-muted hover:border-wise-accent hover:text-wise-text-primary'
              }`}
              title={level.label}
            >
              <span className="hidden lg:inline text-lg">{level.emoji}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Intensity Levels Grid */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-wise-text-muted">Intensity Scale</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {INTENSITY_LEVELS.map(level => (
            <motion.button
              key={level.level}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPreset(level.level)}
              className={`p-2 rounded-lg text-center text-sm font-semibold transition border ${
                value === level.level
                  ? 'bg-gradient-to-br ' + level.color + ' text-white border-opacity-50'
                  : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
              }`}
            >
              <div className="text-2xl mb-1">{level.emoji}</div>
              <div className="text-xs">{level.label}</div>
              <div className="text-xs text-wise-text-muted mt-0.5">{level.level}/10</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Genre Intensity Defaults */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-wise-text-muted">Genre Presets</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {genrePresets.map(preset => (
            <motion.button
              key={preset.genre}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPreset(preset.intensity)}
              className={`p-2.5 rounded-lg text-center transition border ${
                value === preset.intensity
                  ? 'bg-wise-accent text-black border-wise-accent'
                  : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent hover:bg-studio-raised'
              }`}
            >
              <div className="text-2xl mb-1">{preset.emoji}</div>
              <p className="text-xs font-semibold">{preset.genre}</p>
              <p className="text-xs text-wise-text-muted mt-0.5">{preset.intensity}/10</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Intensity Characteristics */}
      <motion.div
        layout
        className="p-4 bg-studio-input border border-studio-line rounded-lg space-y-3"
      >
        <div className="flex items-start gap-2">
          <Flame className="w-5 h-5 text-wise-accent flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-wise-text-primary">At Intensity {value}:</p>
            <ul className="text-sm space-y-1 text-wise-text-secondary">
              <li>• {value <= 3 ? 'Minimal' : value <= 6 ? 'Moderate' : 'High'} drum patterns and percussion</li>
              <li>• {value <= 3 ? 'Subtle' : value <= 6 ? 'Standard' : 'Complex'} layering and arrangements</li>
              <li>• {value <= 3 ? 'Sparse' : value <= 6 ? 'Balanced' : 'Dense'} instrumentation</li>
              <li>• {value <= 3 ? 'Calm' : value <= 6 ? 'Driving' : 'Aggressive'} overall character</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        layout
        className="p-3 bg-studio-raised border border-studio-line rounded-lg"
      >
        <p className="text-xs text-wise-text-secondary">
          <strong>💡 Tip:</strong> Lower intensity (1-3) works great for background music and ambient tracks. Higher intensity (7-10) creates impactful dance and metal tracks.
        </p>
      </motion.div>
    </div>
  );
}
