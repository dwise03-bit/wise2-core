'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Music, HelpCircle } from 'lucide-react';

interface KeyScaleControlProps {
  selectedKey: string;
  onKeyChange: (key: string) => void;
  selectedScale: string;
  onScaleChange: (scale: string) => void;
  suggestBased?: { mood?: string; genre?: string };
}

const MUSICAL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALES = [
  {
    id: 'major',
    name: 'Major',
    description: 'Bright, happy, uplifting',
    emoji: '😊',
    formula: 'W-W-H-W-W-W-H',
  },
  {
    id: 'minor',
    name: 'Natural Minor',
    description: 'Dark, sad, introspective',
    emoji: '😢',
    formula: 'W-H-W-W-H-W-W',
  },
  {
    id: 'harmonic-minor',
    name: 'Harmonic Minor',
    description: 'Exotic, mysterious, classical',
    emoji: '🌙',
    formula: 'W-H-W-W-H-W+H-H',
  },
  {
    id: 'melodic-minor',
    name: 'Melodic Minor',
    description: 'Jazz-influenced, sophisticated',
    emoji: '🎷',
    formula: 'W-H-W-W-W-W-H',
  },
  {
    id: 'dorian',
    name: 'Dorian',
    description: 'Jazz, funk, folk flavor',
    emoji: '🎸',
    formula: 'W-H-W-W-W-H-W',
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    description: 'Spanish, flamenco, exotic',
    emoji: '💃',
    formula: 'H-W-W-W-H-W-W',
  },
  {
    id: 'lydian',
    name: 'Lydian',
    description: 'Dreamy, whimsical, adventurous',
    emoji: '✨',
    formula: 'W-W-W-H-W-W-H',
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    description: 'Blues, rock, funk groove',
    emoji: '🎤',
    formula: 'W-W-H-W-W-H-W',
  },
  {
    id: 'pentatonic-major',
    name: 'Pentatonic Major',
    description: 'Simple, Asian-inspired, accessible',
    emoji: '🌏',
    formula: 'W-W-W.5-W-W.5',
  },
  {
    id: 'pentatonic-minor',
    name: 'Pentatonic Minor',
    description: 'Blues, rock, soulful',
    emoji: '🎵',
    formula: 'W.5-W-W-W.5-W',
  },
];

const KEY_CHARACTERISTICS: Record<string, { brightness: number; warmth: number; description: string }> = {
  'C': { brightness: 5, warmth: 5, description: 'Neutral, versatile' },
  'C#': { brightness: 6, warmth: 4, description: 'Sharp, bright, piercing' },
  'D': { brightness: 7, warmth: 3, description: 'Very bright, shimmering' },
  'D#': { brightness: 6, warmth: 5, description: 'Bold, energetic' },
  'E': { brightness: 8, warmth: 2, description: 'Brilliant, luminous' },
  'F': { brightness: 3, warmth: 7, description: 'Warm, resonant, somber' },
  'F#': { brightness: 4, warmth: 8, description: 'Rich, warm, dark' },
  'G': { brightness: 5, warmth: 6, description: 'Balanced, natural' },
  'G#': { brightness: 4, warmth: 7, description: 'Dark, mysterious, heavy' },
  'A': { brightness: 6, warmth: 4, description: 'Clear, bright, standard' },
  'A#': { brightness: 5, warmth: 7, description: 'Warm, mellow' },
  'B': { brightness: 7, warmth: 3, description: 'Very bright, crisp' },
};

const MOOD_SCALE_SUGGESTIONS = {
  happy: ['major', 'lydian', 'pentatonic-major'],
  sad: ['minor', 'phrygian', 'pentatonic-minor'],
  energetic: ['mixolydian', 'major', 'dorian'],
  calm: ['major', 'lydian', 'harmonic-minor'],
  dark: ['harmonic-minor', 'phrygian', 'minor'],
  uplifting: ['major', 'lydian', 'pentatonic-major'],
  melancholic: ['minor', 'dorian', 'harmonic-minor'],
  aggressive: ['harmonic-minor', 'phrygian', 'dorian'],
};

export function KeyScaleControl({
  selectedKey,
  onKeyChange,
  selectedScale,
  onScaleChange,
  suggestBased = {},
}: KeyScaleControlProps) {
  const selectedScaleData = SCALES.find(s => s.id === selectedScale);
  const keyCharacteristics = KEY_CHARACTERISTICS[selectedKey] || KEY_CHARACTERISTICS['C'];

  const suggestedScales = useMemo(() => {
    if (!suggestBased.mood) return [];
    const moodKey = suggestBased.mood.toLowerCase() as keyof typeof MOOD_SCALE_SUGGESTIONS;
    return MOOD_SCALE_SUGGESTIONS[moodKey] || [];
  }, [suggestBased.mood]);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Key & Scale
        </label>
        <p className="text-xs text-wise-text-muted">
          Set the tonal center and scale mode. Suggestions based on mood and genre.
        </p>
      </div>

      {/* Key Selection */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-wise-text-primary mb-2">
            Key: <span className="font-bold text-wise-accent text-lg">{selectedKey}</span>
          </p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {MUSICAL_KEYS.map(key => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onKeyChange(key)}
                className={`py-2 rounded-lg font-bold transition border text-sm ${
                  selectedKey === key
                    ? 'bg-gradient-to-br from-wise-accent-dim to-wise-accent text-black border-wise-accent'
                    : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent hover:bg-studio-raised'
                }`}
              >
                {key}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Key Characteristics */}
        <motion.div
          layout
          className="p-3 bg-studio-raised border border-studio-line rounded-lg space-y-2"
        >
          <p className="text-sm font-semibold text-wise-text-primary">{keyCharacteristics.description}</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-wise-text-muted">Brightness</span>
                <span className="text-wise-accent font-bold">{keyCharacteristics.brightness}/10</span>
              </div>
              <div className="w-full h-1.5 bg-studio-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-wise-accent-dim to-wise-accent"
                  style={{ width: `${(keyCharacteristics.brightness / 10) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-wise-text-muted">Warmth</span>
                <span className="text-wise-accent font-bold">{keyCharacteristics.warmth}/10</span>
              </div>
              <div className="w-full h-1.5 bg-studio-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-wise-accent-dim to-wise-accent"
                  style={{ width: `${(keyCharacteristics.warmth / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scale Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-4 h-4 text-wise-accent" />
          <p className="text-sm font-semibold text-wise-text-primary">Scale Mode</p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {SCALES.map((scale, idx) => {
            const isSuggested = suggestedScales.includes(scale.id);
            const isSelected = selectedScale === scale.id;

            return (
              <motion.button
                key={scale.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onScaleChange(scale.id)}
                className={`w-full text-left p-3 rounded-lg transition border relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-wise-accent-dim to-wise-accent text-black border-wise-accent'
                    : isSuggested
                    ? 'bg-studio-raised border-wise-accent-dim hover:border-wise-accent'
                    : 'bg-studio-input border-studio-line hover:border-wise-accent hover:bg-studio-raised text-wise-text-primary'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{scale.emoji}</span>
                      <div>
                        <p className="font-bold text-sm">{scale.name}</p>
                        <p className="text-xs text-wise-text-muted">{scale.description}</p>
                        <p className="text-xs text-wise-text-muted font-mono mt-0.5">Formula: {scale.formula}</p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Badge */}
                  {isSuggested && !isSelected && (
                    <div className="text-xs px-2 py-1 bg-wise-accent text-black rounded font-bold whitespace-nowrap ml-2">
                      Suggested
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Scale Info */}
      {selectedScaleData && (
        <motion.div
          layout
          className="p-4 bg-studio-input border border-studio-line rounded-lg space-y-3"
        >
          <div className="flex items-start gap-2">
            <HelpCircle className="w-5 h-5 text-wise-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="text-wise-text-primary font-semibold">
                {selectedKey} {selectedScaleData.name}
              </p>
              <p className="text-wise-text-secondary">
                {selectedScaleData.description}. This scale works well for {suggestBased.mood || 'various'} tracks.
              </p>
              <p className="text-xs text-wise-text-muted">
                Scale intervals: {selectedScaleData.formula}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mood-Based Suggestions */}
      {suggestBased.mood && suggestedScales.length > 0 && (
        <motion.div
          layout
          className="p-3 bg-studio-raised border border-wise-accent-dim rounded-lg"
        >
          <p className="text-xs font-bold uppercase text-wise-accent mb-2">
            💡 Scales for {suggestBased.mood} mood
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedScales.map(scaleId => {
              const scale = SCALES.find(s => s.id === scaleId);
              return scale ? (
                <button
                  key={scaleId}
                  onClick={() => onScaleChange(scaleId)}
                  className={`text-xs px-2.5 py-1 rounded transition border ${
                    selectedScale === scaleId
                      ? 'bg-wise-accent text-black border-wise-accent'
                      : 'bg-studio-input border-studio-line text-wise-text-secondary hover:text-wise-accent'
                  }`}
                >
                  {scale.emoji} {scale.name}
                </button>
              ) : null;
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
