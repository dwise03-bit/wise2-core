'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Sliders } from 'lucide-react';

interface InstrumentPickerProps {
  selectedInstruments: string[];
  onInstrumentsChange: (instruments: string[]) => void;
  complexity?: number;
  onComplexityChange?: (complexity: number) => void;
}

interface Instrument {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'Percussion' | 'Strings' | 'Keys' | 'Wind' | 'Electronics' | 'Vocals';
  complementary: string[]; // Instruments that pair well with this
  sample: string;
}

const INSTRUMENTS: Instrument[] = [
  // Percussion
  { id: 'drums', name: 'Drums', emoji: '🥁', category: 'Percussion', description: 'Kick, snare, hi-hat', complementary: ['bass', 'piano'], sample: '/samples/instruments/drums.mp3' },
  { id: 'percussion', name: 'Percussion', emoji: '🎵', category: 'Percussion', description: 'Timpani, bells, vibraphone', complementary: ['strings', 'brass'], sample: '/samples/instruments/percussion.mp3' },
  { id: 'drums-electronic', name: 'E-Drums', emoji: '⚡', category: 'Percussion', description: 'Electronic drum kit', complementary: ['synth', 'bass'], sample: '/samples/instruments/edrums.mp3' },

  // Strings
  { id: 'strings', name: 'Strings', emoji: '🎻', category: 'Strings', description: 'Violin, cello, viola', complementary: ['brass', 'piano', 'woodwinds'], sample: '/samples/instruments/strings.mp3' },
  { id: 'guitar', name: 'Guitar', emoji: '🎸', category: 'Strings', description: 'Acoustic or electric', complementary: ['drums', 'bass'], sample: '/samples/instruments/guitar.mp3' },
  { id: 'bass-guitar', name: 'Bass Guitar', emoji: '🎸', category: 'Strings', description: 'Electric bass lines', complementary: ['drums', 'guitar'], sample: '/samples/instruments/bass-guitar.mp3' },

  // Keys
  { id: 'piano', name: 'Piano', emoji: '🎹', category: 'Keys', description: 'Acoustic or digital', complementary: ['strings', 'vocals'], sample: '/samples/instruments/piano.mp3' },
  { id: 'synth', name: 'Synth', emoji: '⌨️', category: 'Keys', description: 'Electronic synthesizer', complementary: ['drums', 'bass'], sample: '/samples/instruments/synth.mp3' },
  { id: 'organ', name: 'Organ', emoji: '🎛️', category: 'Keys', description: 'Church or electronic organ', complementary: ['strings', 'brass'], sample: '/samples/instruments/organ.mp3' },

  // Wind
  { id: 'woodwinds', name: 'Woodwinds', emoji: '🎷', category: 'Wind', description: 'Flute, clarinet, saxophone', complementary: ['strings', 'drums'], sample: '/samples/instruments/woodwinds.mp3' },
  { id: 'brass', name: 'Brass', emoji: '🎺', category: 'Wind', description: 'Trumpet, trombone, horn', complementary: ['strings', 'drums'], sample: '/samples/instruments/brass.mp3' },

  // Electronics
  { id: 'bass', name: 'Bass Synth', emoji: '🌊', category: 'Electronics', description: 'Deep electronic bass', complementary: ['drums', 'synth'], sample: '/samples/instruments/bass.mp3' },
  { id: 'pad', name: 'Pad', emoji: '☁️', category: 'Electronics', description: 'Atmospheric pad layer', complementary: ['vocals', 'strings'], sample: '/samples/instruments/pad.mp3' },

  // Vocals
  { id: 'vocals', name: 'Vocals', emoji: '🎤', category: 'Vocals', description: 'Lead or backing vocals', complementary: ['strings', 'piano'], sample: '/samples/instruments/vocals.mp3' },
  { id: 'choir', name: 'Choir', emoji: '👥', category: 'Vocals', description: 'Vocal harmonies', complementary: ['strings', 'organ'], sample: '/samples/instruments/choir.mp3' },
];

export function InstrumentPicker({
  selectedInstruments,
  onInstrumentsChange,
  complexity = 5,
  onComplexityChange,
}: InstrumentPickerProps) {
  const [playingInstrument, setPlayingInstrument] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'complementary'>('all');

  // Get complementary instruments based on selection
  const complementaryInstruments = useMemo(() => {
    if (selectedInstruments.length === 0) return [];
    const complementary = new Set<string>();
    selectedInstruments.forEach(id => {
      const instrument = INSTRUMENTS.find(i => i.id === id);
      if (instrument) {
        instrument.complementary.forEach(c => complementary.add(c));
      }
    });
    return Array.from(complementary);
  }, [selectedInstruments]);

  // Group instruments by category
  const instrumentsByCategory = useMemo(() => {
    const grouped: Record<string, Instrument[]> = {};
    INSTRUMENTS.forEach(inst => {
      if (!grouped[inst.category]) grouped[inst.category] = [];
      grouped[inst.category].push(inst);
    });
    return grouped;
  }, []);

  const handleToggleInstrument = (instrumentId: string) => {
    if (selectedInstruments.includes(instrumentId)) {
      onInstrumentsChange(selectedInstruments.filter(i => i !== instrumentId));
    } else {
      onInstrumentsChange([...selectedInstruments, instrumentId]);
    }
  };

  const handlePlayPreview = async (sample: string) => {
    const audio = new Audio(sample);
    audio.volume = 0.6;
    try {
      await audio.play();
    } catch {
      console.error('Failed to play preview');
    }
  };

  const handleAddComplementary = (instrumentId: string) => {
    if (!selectedInstruments.includes(instrumentId)) {
      onInstrumentsChange([...selectedInstruments, instrumentId]);
    }
  };

  const displayedInstruments = viewMode === 'complementary' && complementaryInstruments.length > 0
    ? INSTRUMENTS.filter(i => complementaryInstruments.includes(i.id) && !selectedInstruments.includes(i.id))
    : INSTRUMENTS;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Instruments & Arrangement
        </label>
        <p className="text-xs text-wise-text-muted">
          Select instruments to build your track's sound. Mix and match for unique arrangements.
        </p>
      </div>

      {/* Complexity Slider */}
      {onComplexityChange && (
        <div className="space-y-3 bg-studio-input border border-studio-line rounded-lg p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-wise-text-primary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-wise-accent" />
              Arrangement Complexity
            </label>
            <span className="text-lg font-bold text-wise-accent">{complexity}/10</span>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            value={complexity}
            onChange={e => onComplexityChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-studio-line rounded-lg appearance-none cursor-pointer accent-wise-accent"
            style={{
              background: `linear-gradient(to right, var(--acc, #39FF14) 0%, var(--acc, #39FF14) ${
                (complexity / 10) * 100
              }%, #262626 ${(complexity / 10) * 100}%, #262626 100%)`,
            }}
          />

          <p className="text-xs text-wise-text-secondary">
            {complexity <= 3 && '🎵 Simple arrangement with basic layers'}
            {complexity > 3 && complexity <= 6 && '🎼 Standard arrangement with multiple instruments'}
            {complexity > 6 && '🎭 Full orchestral arrangement with rich textures'}
          </p>
        </div>
      )}

      {/* Selected Instruments Tags */}
      {selectedInstruments.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase text-wise-text-muted mb-2">Selected ({selectedInstruments.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedInstruments.map(instrumentId => {
              const instrument = INSTRUMENTS.find(i => i.id === instrumentId);
              return instrument ? (
                <motion.button
                  key={instrumentId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleToggleInstrument(instrumentId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-wise-accent-dim to-wise-accent text-black rounded-full text-sm font-semibold hover:from-wise-accent hover:to-wise-accent-bright transition"
                >
                  <span>{instrument.emoji}</span>
                  {instrument.name}
                  <span className="text-black text-opacity-60 ml-1">×</span>
                </motion.button>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      {complementaryInstruments.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition border ${
              viewMode === 'all'
                ? 'bg-wise-accent text-black border-wise-accent'
                : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
            }`}
          >
            All Instruments
          </button>
          <button
            onClick={() => setViewMode('complementary')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition border ${
              viewMode === 'complementary'
                ? 'bg-wise-accent text-black border-wise-accent'
                : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
            }`}
          >
            <span className="text-xs">💡 Suggested ({complementaryInstruments.filter(c => !selectedInstruments.includes(c)).length})</span>
          </button>
        </div>
      )}

      {/* Instruments Grid */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(instrumentsByCategory).map(([category, instruments]) => {
          const filteredInstruments = viewMode === 'complementary'
            ? instruments.filter(i => complementaryInstruments.includes(i.id) && !selectedInstruments.includes(i.id))
            : instruments;

          if (filteredInstruments.length === 0) return null;

          return (
            <div key={category}>
              <p className="text-sm font-bold text-wise-text-secondary mb-2">{category}</p>
              <div className="grid grid-cols-2 gap-2">
                {filteredInstruments.map((instrument, idx) => {
                  const isSelected = selectedInstruments.includes(instrument.id);
                  const isComplementary = complementaryInstruments.includes(instrument.id) && !isSelected;

                  return (
                    <motion.button
                      key={instrument.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleToggleInstrument(instrument.id)}
                      className={`p-3 rounded-lg text-center transition border relative group ${
                        isSelected
                          ? 'bg-gradient-to-br from-wise-accent-dim to-wise-accent text-black border-wise-accent'
                          : isComplementary
                          ? 'bg-studio-raised border-wise-accent-dim text-wise-text-primary hover:border-wise-accent'
                          : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent hover:bg-studio-raised'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-2xl">{instrument.emoji}</span>
                        <p className="font-semibold text-sm">{instrument.name}</p>
                        <p className="text-xs text-wise-text-muted line-clamp-1">{instrument.description}</p>

                        {/* Hover Actions */}
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handlePlayPreview(instrument.sample);
                            }}
                            className="p-1 bg-black bg-opacity-30 rounded hover:bg-wise-accent hover:text-black transition"
                            title="Play preview"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Complementary Badge */}
                      {isComplementary && (
                        <div className="absolute top-1 right-1 text-xs px-1.5 py-0.5 bg-wise-accent text-black rounded-full font-bold">
                          ✓
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrangement Tips */}
      <motion.div
        layout
        className="p-3 bg-studio-raised border border-studio-line rounded-lg"
      >
        <p className="text-sm text-wise-text-secondary">
          <strong>💡 Arrangement Tips:</strong> Start with a drum layer, add bass, then layer melodic instruments. Complementary suggestions help you build cohesive tracks.
        </p>
      </motion.div>
    </div>
  );
}
