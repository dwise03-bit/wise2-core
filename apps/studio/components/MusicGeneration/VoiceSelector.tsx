'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Filter, Star, Search } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice?: string;
  onVoiceChange: (voiceId: string | undefined) => void;
  favorites?: string[];
  onFavoritesChange?: (favorites: string[]) => void;
  showPreview?: boolean;
}

interface Voice {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Neutral';
  accent: string;
  description: string;
  sample: string;
  category: 'Vocal' | 'Instrumental' | 'Effects';
}

const VOICES: Voice[] = [
  // Female Vocals
  { id: 'voice-f-1', name: 'Luna', gender: 'Female', accent: 'American', description: 'Bright, youthful soprano', category: 'Vocal', sample: '/samples/voices/luna.mp3' },
  { id: 'voice-f-2', name: 'Aria', gender: 'Female', accent: 'British', description: 'Rich, warm contralto', category: 'Vocal', sample: '/samples/voices/aria.mp3' },
  { id: 'voice-f-3', name: 'Sofia', gender: 'Female', accent: 'European', description: 'Smooth, elegant mezzo', category: 'Vocal', sample: '/samples/voices/sofia.mp3' },
  { id: 'voice-f-4', name: 'Eva', gender: 'Female', accent: 'Neutral', description: 'Clear, precise soprano', category: 'Vocal', sample: '/samples/voices/eva.mp3' },
  { id: 'voice-f-5', name: 'Nina', gender: 'Female', accent: 'Asian', description: 'Delicate, ethereal voice', category: 'Vocal', sample: '/samples/voices/nina.mp3' },
  { id: 'voice-f-6', name: 'Sage', gender: 'Female', accent: 'Australian', description: 'Bold, confident delivery', category: 'Vocal', sample: '/samples/voices/sage.mp3' },

  // Male Vocals
  { id: 'voice-m-1', name: 'James', gender: 'Male', accent: 'British', description: 'Deep, resonant baritone', category: 'Vocal', sample: '/samples/voices/james.mp3' },
  { id: 'voice-m-2', name: 'Alex', gender: 'Male', accent: 'American', description: 'Smooth, warm tenor', category: 'Vocal', sample: '/samples/voices/alex.mp3' },
  { id: 'voice-m-3', name: 'Chen', gender: 'Male', accent: 'Asian', description: 'Refined, measured delivery', category: 'Vocal', sample: '/samples/voices/chen.mp3' },
  { id: 'voice-m-4', name: 'Marcus', gender: 'Male', accent: 'American', description: 'Rich, powerful bass', category: 'Vocal', sample: '/samples/voices/marcus.mp3' },
  { id: 'voice-m-5', name: 'David', gender: 'Male', accent: 'European', description: 'Crisp, articulate delivery', category: 'Vocal', sample: '/samples/voices/david.mp3' },
  { id: 'voice-m-6', name: 'Diego', gender: 'Male', accent: 'Latin', description: 'Passionate, expressive tone', category: 'Vocal', sample: '/samples/voices/diego.mp3' },

  // Neutral Vocals
  { id: 'voice-n-1', name: 'Sam', gender: 'Neutral', accent: 'American', description: 'Versatile, neutral tone', category: 'Vocal', sample: '/samples/voices/sam.mp3' },
  { id: 'voice-n-2', name: 'Morgan', gender: 'Neutral', accent: 'British', description: 'Adaptable, professional voice', category: 'Vocal', sample: '/samples/voices/morgan.mp3' },
  { id: 'voice-n-3', name: 'Alex', gender: 'Neutral', accent: 'Neutral', description: 'Clear, balanced tone', category: 'Vocal', sample: '/samples/voices/alex-neutral.mp3' },

  // Instrumental + Effects
  { id: 'voice-inst-1', name: 'String Pad', gender: 'Neutral', accent: 'Orchestral', description: 'Lush string ensemble', category: 'Instrumental', sample: '/samples/voices/string-pad.mp3' },
  { id: 'voice-inst-2', name: 'Synth Lead', gender: 'Neutral', accent: 'Electronic', description: 'Bright synthesizer', category: 'Instrumental', sample: '/samples/voices/synth-lead.mp3' },
  { id: 'voice-inst-3', name: 'Brass Section', gender: 'Neutral', accent: 'Jazz', description: 'Warm trumpet & trombone', category: 'Instrumental', sample: '/samples/voices/brass.mp3' },
];

export function VoiceSelector({
  selectedVoice,
  onVoiceChange,
  favorites = [],
  onFavoritesChange,
  showPreview = true,
}: VoiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female' | 'Neutral'>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Vocal' | 'Instrumental' | 'Effects'>('All');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter voices
  const filteredVoices = useMemo(() => {
    return VOICES.filter(voice => {
      const matchesSearch = !searchQuery.trim() ||
        voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender = genderFilter === 'All' || voice.gender === genderFilter;
      const matchesCategory = categoryFilter === 'All' || voice.category === categoryFilter;

      return matchesSearch && matchesGender && matchesCategory;
    });
  }, [searchQuery, genderFilter, categoryFilter]);

  // Group by category
  const voicesByCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredVoices> = {};
    filteredVoices.forEach(voice => {
      if (!grouped[voice.category]) grouped[voice.category] = [];
      grouped[voice.category].push(voice);
    });
    return grouped;
  }, [filteredVoices]);

  const handlePlayPreview = async (voiceId: string, voiceSample: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(voiceId);
      const audio = new Audio(voiceSample);
      audio.volume = 0.6;
      try {
        await audio.play();
        audio.onended = () => setPlayingVoice(null);
      } catch {
        setPlayingVoice(null);
      }
    }
  };

  const handleToggleFavorite = useCallback((voiceId: string) => {
    if (!onFavoritesChange) return;
    if (favorites.includes(voiceId)) {
      onFavoritesChange(favorites.filter(f => f !== voiceId));
    } else {
      onFavoritesChange([...favorites, voiceId]);
    }
  }, [favorites, onFavoritesChange]);

  const selectedVoiceData = VOICES.find(v => v.id === selectedVoice);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Voice & Narrator
        </label>
        <p className="text-xs text-wise-text-muted">
          Choose a vocal or instrumental voice for your track.
        </p>
      </div>

      {/* Selected Voice Display */}
      {selectedVoiceData && (
        <motion.div
          layout
          className="p-4 bg-studio-raised border border-studio-line rounded-lg space-y-2"
        >
          <p className="text-xs font-bold uppercase text-wise-text-muted">Selected Voice</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-wise-text-primary">{selectedVoiceData.name}</p>
              <p className="text-sm text-wise-text-secondary">{selectedVoiceData.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 bg-studio-input rounded text-wise-accent">
                  {selectedVoiceData.gender}
                </span>
                <span className="text-xs px-2 py-0.5 bg-studio-input rounded text-wise-accent">
                  {selectedVoiceData.accent}
                </span>
              </div>
            </div>
            {showPreview && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePlayPreview(selectedVoiceData.id, selectedVoiceData.sample)}
                className="p-3 bg-wise-accent text-black rounded-lg hover:bg-wise-accent-bright transition"
              >
                <Volume2 className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Search + Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wise-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search voices..."
              className="w-full pl-10 pr-4 py-2 bg-studio-input border border-studio-line rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg transition border ${
              showFilters
                ? 'bg-wise-accent text-black border-wise-accent'
                : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
            }`}
            title="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Gender Filter */}
              <div>
                <p className="text-xs font-bold uppercase text-wise-text-muted mb-2">Gender</p>
                <div className="flex gap-2">
                  {(['All', 'Male', 'Female', 'Neutral'] as const).map(gender => (
                    <button
                      key={gender}
                      onClick={() => setGenderFilter(gender)}
                      className={`px-3 py-1 text-sm rounded transition border ${
                        genderFilter === gender
                          ? 'bg-wise-accent text-black border-wise-accent'
                          : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <p className="text-xs font-bold uppercase text-wise-text-muted mb-2">Category</p>
                <div className="flex gap-2 flex-wrap">
                  {(['All', 'Vocal', 'Instrumental', 'Effects'] as const).map(category => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-3 py-1 text-sm rounded transition border ${
                        categoryFilter === category
                          ? 'bg-wise-accent text-black border-wise-accent'
                          : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voices Grid */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(voicesByCategory).length === 0 ? (
          <div className="text-center py-8 text-wise-text-muted">
            No voices match your criteria.
          </div>
        ) : (
          Object.entries(voicesByCategory).map(([category, voices]) => (
            <div key={category}>
              <p className="text-sm font-bold text-wise-text-secondary mb-2">{category}</p>
              <div className="space-y-2">
                {voices.map((voice, idx) => (
                  <motion.button
                    key={voice.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onVoiceChange(voice.id)}
                    className={`w-full flex items-start justify-between p-3 rounded-lg transition border ${
                      selectedVoice === voice.id
                        ? 'bg-gradient-to-r from-wise-accent-dim to-wise-accent text-black border-wise-accent'
                        : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent hover:bg-studio-raised'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{voice.name}</p>
                      <p className="text-xs text-wise-text-muted">{voice.description}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-xs px-1.5 py-0.5 bg-black bg-opacity-30 rounded">
                          {voice.gender}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-black bg-opacity-30 rounded">
                          {voice.accent}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {onFavoritesChange && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleFavorite(voice.id);
                          }}
                          className={`p-2 rounded transition ${
                            favorites.includes(voice.id)
                              ? 'text-yellow-500'
                              : 'text-wise-text-muted hover:text-wise-accent'
                          }`}
                        >
                          <Star className="w-4 h-4" fill={favorites.includes(voice.id) ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      {showPreview && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={e => {
                            e.stopPropagation();
                            handlePlayPreview(voice.id, voice.sample);
                          }}
                          className={`p-2 rounded transition ${
                            playingVoice === voice.id
                              ? 'bg-wise-accent text-black'
                              : 'bg-black bg-opacity-30 text-wise-text-muted hover:text-wise-accent'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="pt-3 border-t border-studio-line">
          <p className="text-xs font-bold uppercase text-wise-text-muted mb-2">Favorite Voices</p>
          <div className="flex flex-wrap gap-2">
            {favorites.slice(0, 5).map(voiceId => {
              const voice = VOICES.find(v => v.id === voiceId);
              return voice ? (
                <button
                  key={voiceId}
                  onClick={() => onVoiceChange(voiceId)}
                  className={`text-xs px-2 py-1 rounded transition border ${
                    selectedVoice === voiceId
                      ? 'bg-wise-accent text-black border-wise-accent'
                      : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
                  }`}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  {voice.name}
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
