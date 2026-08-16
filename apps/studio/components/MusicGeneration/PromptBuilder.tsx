'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Music, Volume2, Clock, Wand2 } from 'lucide-react';

/**
 * Music Generation Prompt Builder
 * Production-grade component for AI music generation
 * Features: textarea, genre/mood selectors, tempo control, duration, voices, instruments, advanced settings
 */

// Types
interface PromptBuilderState {
  description: string;
  genre: string;
  genres: string[];
  mood: string;
  tempo: number;
  duration: number;
  voice?: string;
  instruments: string[];
  key: string;
  scale: string;
  intensity: number;
  variants: number;
  quality: 'standard' | 'high' | 'ultra';
}

interface SavedPrompt {
  id: string;
  name: string;
  timestamp: number;
  state: PromptBuilderState;
}

// Genre categories and data
const GENRE_CATEGORIES = {
  'Electronic': ['EDM', 'Synthwave', 'Techno', 'House', 'Drum & Bass', 'Downtempo', 'Ambient', 'Chillwave'],
  'Hip-Hop': ['Trap', 'Boom Bap', 'Mumble Rap', 'Conscious Hip-Hop', 'Drill', 'Phonk'],
  'Pop': ['K-Pop', 'J-Pop', 'Disco Pop', 'Dance-Pop', 'Pop Punk', 'Synth-Pop'],
  'Rock': ['Alternative Rock', 'Hard Rock', 'Indie Rock', 'Progressive Rock', 'Punk', 'Metal'],
  'Classical': ['Symphony', 'Chamber', 'Baroque', 'Romantic', 'Contemporary'],
  'Jazz': ['Bebop', 'Cool Jazz', 'Fusion', 'Smooth Jazz', 'Free Jazz'],
  'Ambient': ['Dark Ambient', 'Cinematic', 'Drone', 'Experimental'],
  'Folk': ['Indie Folk', 'Traditional', 'Folk-Pop', 'Celtic'],
  'EDM': ['Festival EDM', 'Minimal', 'Trance', 'Deep House'],
  'Metal': ['Death Metal', 'Black Metal', 'Progressive Metal', 'Symphonic Metal'],
  'Country': ['Outlaw Country', 'Honky-Tonk', 'Americana', 'Country Pop'],
  'Reggae': ['Dancehall', 'Roots Reggae', 'Reggae Fusion'],
  'Latin': ['Reggaeton', 'Salsa', 'Bachata', 'Cumbia'],
  'R&B': ['Contemporary R&B', 'Neo-Soul', 'Funk', 'Soul'],
  'Anime': ['Anime OP', 'Anime ED', 'VTuber Music', 'J-Pop Anime'],
};

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'from-yellow-500 to-orange-500', sample: '/samples/happy.mp3' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'from-blue-500 to-indigo-500', sample: '/samples/sad.mp3' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', color: 'from-red-500 to-pink-500', sample: '/samples/energetic.mp3' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: 'from-cyan-500 to-blue-400', sample: '/samples/calm.mp3' },
  { id: 'dark', label: 'Dark', emoji: '🌑', color: 'from-purple-900 to-black', sample: '/samples/dark.mp3' },
  { id: 'uplifting', label: 'Uplifting', emoji: '✨', color: 'from-green-400 to-cyan-500', sample: '/samples/uplifting.mp3' },
  { id: 'melancholic', label: 'Melancholic', emoji: '🎻', color: 'from-slate-600 to-slate-800', sample: '/samples/melancholic.mp3' },
  { id: 'aggressive', label: 'Aggressive', emoji: '🔥', color: 'from-red-700 to-orange-600', sample: '/samples/aggressive.mp3' },
];

const INSTRUMENTS = [
  { id: 'drums', label: 'Drums', emoji: '🥁' },
  { id: 'bass', label: 'Bass', emoji: '🎸' },
  { id: 'piano', label: 'Piano', emoji: '🎹' },
  { id: 'guitar', label: 'Guitar', emoji: '🎸' },
  { id: 'synth', label: 'Synth', emoji: '⌨️' },
  { id: 'strings', label: 'Strings', emoji: '🎻' },
  { id: 'brass', label: 'Brass', emoji: '🎺' },
  { id: 'woodwinds', label: 'Woodwinds', emoji: '🎷' },
  { id: 'vocals', label: 'Vocals', emoji: '🎤' },
];

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES = ['Major', 'Minor', 'Harmonic Minor', 'Dorian', 'Phrygian'];

const VOICES = [
  { id: 'voice-1', name: 'Sarah', gender: 'Female', accent: 'American', sample: '/samples/voices/sarah.mp3' },
  { id: 'voice-2', name: 'James', gender: 'Male', accent: 'British', sample: '/samples/voices/james.mp3' },
  { id: 'voice-3', name: 'Luna', gender: 'Female', accent: 'European', sample: '/samples/voices/luna.mp3' },
  { id: 'voice-4', name: 'Chen', gender: 'Male', accent: 'Asian', sample: '/samples/voices/chen.mp3' },
  { id: 'voice-5', name: 'Alex', gender: 'Neutral', accent: 'American', sample: '/samples/voices/alex.mp3' },
  { id: 'voice-6', name: 'Sofia', gender: 'Female', accent: 'European', sample: '/samples/voices/sofia.mp3' },
];

const POPULAR_GENRES = ['Pop', 'Electronic', 'Hip-Hop', 'Classical'];

const TEMPO_PRESETS = [
  { label: 'Slow', bpm: 60 },
  { label: 'Walking', bpm: 90 },
  { label: 'Moderate', bpm: 120 },
  { label: 'Upbeat', bpm: 140 },
  { label: 'Fast', bpm: 160 },
];

// Main Component
export function MusicGenerationPromptBuilder() {
  const [state, setState] = useState<PromptBuilderState>({
    description: '',
    genre: '',
    genres: [],
    mood: 'happy',
    tempo: 120,
    duration: 30,
    voice: undefined,
    instruments: [],
    key: 'C',
    scale: 'Major',
    intensity: 5,
    variants: 1,
    quality: 'standard',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchGenre, setSearchGenre] = useState('');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showVoiceFilter, setShowVoiceFilter] = useState(false);
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<string>('');
  const [voiceAccentFilter, setVoiceAccentFilter] = useState<string>('');
  const [moodPreviewPlaying, setMoodPreviewPlaying] = useState<string | null>(null);
  const [tapTempoCount, setTapTempoCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('musicPromptBuilder');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved prompt:', e);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('musicPromptBuilder', JSON.stringify(state));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  // Filter voices based on gender and accent
  const filteredVoices = useMemo(() => {
    return VOICES.filter(
      v =>
        (!voiceGenderFilter || v.gender === voiceGenderFilter) &&
        (!voiceAccentFilter || v.accent === voiceAccentFilter)
    );
  }, [voiceGenderFilter, voiceAccentFilter]);

  // Filter genres based on search
  const filteredGenres = useMemo(() => {
    if (!searchGenre) return [];
    const query = searchGenre.toLowerCase();
    const results: Array<{ category: string; genre: string }> = [];
    Object.entries(GENRE_CATEGORIES).forEach(([category, genres]) => {
      genres.forEach(g => {
        if (g.toLowerCase().includes(query)) {
          results.push({ category, genre: g });
        }
      });
    });
    return results;
  }, [searchGenre]);

  // Handle tempo tap
  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    if (lastTapTime && now - lastTapTime < 2000) {
      const interval = now - lastTapTime;
      const bpm = Math.round(60000 / interval);
      if (bpm >= 40 && bpm <= 200) {
        setState(s => ({ ...s, tempo: bpm }));
        setTapTempoCount(c => c + 1);
      }
    }
    setLastTapTime(now);
    if (tapTempoCount >= 3) setTapTempoCount(0);
  }, [lastTapTime, tapTempoCount]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    // Validation
    if (!state.description.trim()) {
      alert('Please enter a music description');
      return;
    }
    if (state.genres.length === 0) {
      alert('Please select at least one genre');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setEta(null);

    try {
      // Calculate estimated time based on quality and duration
      const qualityMultipliers = { standard: 45, high: 75, ultra: 120 };
      const estimatedDuration = qualityMultipliers[state.quality] + (state.duration / 30) * 20;
      setEta(estimatedDuration);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 25;
          if (next >= 95) clearInterval(progressInterval);
          return Math.min(next, 95);
        });
      }, 1000);

      const response = await fetch('/api/suno/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'text-to-song',
          description: state.description,
          genres: state.genres,
          mood: state.mood,
          tempo: state.tempo,
          instruments: state.instruments,
          duration: state.duration,
          customVoiceId: state.voice,
          key: state.key,
          scale: state.scale,
          intensity: state.intensity,
          variants: state.variants,
          quality: state.quality,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        alert('Music generation complete! Check your library.');
        setIsLoading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate music. Please try again.');
      setIsLoading(false);
      setProgress(0);
    }
  }, [state]);

  const characterCount = state.description.length;
  const charLimit = 500;
  const charPercentage = (characterCount / charLimit) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-wise-text-primary flex items-center gap-3">
          <Music className="w-8 h-8 text-wise-accent" />
          Music Generation
        </h1>
        <p className="text-wise-text-secondary">Describe your perfect track and let AI bring it to life</p>
      </div>

      {/* Main Form Container */}
      <div className="space-y-5 bg-studio-panel/50 backdrop-blur-lg border border-studio-line rounded-xl p-6">
        {/* 1. Description Textarea */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase text-wise-text-muted block">
            Music Description
          </label>
          <div className="relative">
            <textarea
              value={state.description}
              onChange={e => setState(s => ({ ...s, description: e.target.value.slice(0, charLimit) }))}
              placeholder="Describe the music you want... e.g., 'upbeat electronic dance track with bright synths and pulsing bassline'"
              className="w-full min-h-[120px] bg-studio-input border border-studio-line rounded-lg p-4 text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition resize-none"
            />
            {/* Character Counter */}
            <div className="absolute bottom-3 right-3 space-y-1">
              <div className="w-32 h-1 bg-studio-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-wise-accent-dim to-wise-accent transition-all"
                  style={{ width: `${charPercentage}%` }}
                />
              </div>
              <p className="text-xs text-wise-text-muted text-right">
                {characterCount} / {charLimit}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Genre Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase text-wise-text-muted block">
            Genre
          </label>

          {/* Popular Quick Selects */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {POPULAR_GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => setState(s => ({
                  ...s,
                  genres: s.genres.includes(genre)
                    ? s.genres.filter(g => g !== genre)
                    : [...s.genres, genre]
                }))}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  state.genres.includes(genre)
                    ? 'bg-wise-accent text-black'
                    : 'bg-studio-raised border border-studio-line text-wise-text-primary hover:border-wise-accent'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Genre Search Dropdown */}
          <div className="relative">
            <input
              type="text"
              value={searchGenre}
              onChange={e => setSearchGenre(e.target.value)}
              onFocus={() => setShowGenreDropdown(true)}
              placeholder="Search genres..."
              className="w-full bg-studio-input border border-studio-line rounded-lg px-4 py-2 text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition"
            />
            <AnimatePresence>
              {showGenreDropdown && filteredGenres.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-studio-raised border border-studio-line rounded-lg max-h-60 overflow-y-auto z-10 shadow-lg"
                >
                  {filteredGenres.map(({ category, genre }) => (
                    <button
                      key={`${category}-${genre}`}
                      onClick={() => {
                        setState(s => ({
                          ...s,
                          genres: s.genres.includes(genre) ? s.genres.filter(g => g !== genre) : [...s.genres, genre]
                        }));
                        setSearchGenre('');
                        setShowGenreDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-studio-line transition flex justify-between items-center text-wise-text-primary"
                    >
                      <span>{genre}</span>
                      {state.genres.includes(genre) && <span className="text-wise-accent">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Genre Categories Display */}
            {Object.entries(GENRE_CATEGORIES).length > 0 && !searchGenre && showGenreDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 w-full bg-studio-raised border border-studio-line rounded-lg max-h-60 overflow-y-auto z-10 shadow-lg p-3 space-y-2"
              >
                {Object.entries(GENRE_CATEGORIES).slice(0, 5).map(([category, genres]) => (
                  <div key={category} className="space-y-1">
                    <p className="text-xs font-bold text-wise-accent uppercase">{category}</p>
                    <div className="flex flex-wrap gap-1">
                      {genres.slice(0, 3).map(genre => (
                        <button
                          key={genre}
                          onClick={() => {
                            setState(s => ({
                              ...s,
                              genres: [...s.genres, genre]
                            }));
                            setShowGenreDropdown(false);
                          }}
                          className="text-xs px-2 py-1 bg-studio-input border border-studio-line rounded hover:border-wise-accent text-wise-text-secondary hover:text-wise-accent transition"
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Selected Genres Display */}
          {state.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {state.genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setState(s => ({ ...s, genres: s.genres.filter(g => g !== genre) }))}
                  className="px-3 py-1 bg-studio-input border border-studio-line rounded-full text-xs text-wise-text-secondary hover:border-wise-accent transition flex items-center gap-2"
                >
                  {genre}
                  <span className="text-wise-accent">×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Mood Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase text-wise-text-muted block">
            Mood
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOODS.map(mood => (
              <motion.button
                key={mood.id}
                onClick={() => setState(s => ({ ...s, mood: mood.id }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg transition relative group ${
                  state.mood === mood.id
                    ? `bg-gradient-to-br ${mood.color} text-black font-bold`
                    : 'bg-studio-input border border-studio-line text-wise-text-primary hover:border-wise-accent'
                }`}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className="text-xs font-semibold">{mood.label}</div>

                {/* Preview Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMoodPreviewPlaying(moodPreviewPlaying === mood.id ? null : mood.id);
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 4. Tempo Control */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold uppercase text-wise-text-muted">Tempo (BPM)</label>
            <span className="text-2xl font-bold text-wise-accent">{state.tempo}</span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="40"
            max="200"
            step="5"
            value={state.tempo}
            onChange={e => setState(s => ({ ...s, tempo: parseInt(e.target.value) }))}
            className="w-full h-2 bg-studio-line rounded-lg appearance-none cursor-pointer accent-wise-accent"
          />

          {/* Numeric Input */}
          <input
            type="number"
            value={state.tempo}
            onChange={e => {
              const val = parseInt(e.target.value);
              if (val >= 40 && val <= 200) setState(s => ({ ...s, tempo: val }));
            }}
            min="40"
            max="200"
            className="w-full bg-studio-input border border-studio-line rounded-lg px-3 py-2 text-wise-text-primary focus:outline-none focus:ring-2 focus:ring-wise-accent transition"
          />

          {/* Tap Tempo Button */}
          <button
            onClick={handleTapTempo}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              tapTempoCount > 0
                ? 'bg-wise-accent text-black'
                : 'bg-studio-raised border border-studio-line text-wise-text-primary hover:border-wise-accent'
            }`}
          >
            🎵 Tap Tempo {tapTempoCount > 0 && `(${tapTempoCount})`}
          </button>

          {/* Preset Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {TEMPO_PRESETS.map(preset => (
              <button
                key={preset.bpm}
                onClick={() => setState(s => ({ ...s, tempo: preset.bpm }))}
                className={`px-2 py-2 rounded text-xs font-semibold transition ${
                  state.tempo === preset.bpm
                    ? 'bg-wise-accent text-black'
                    : 'bg-studio-raised border border-studio-line text-wise-text-secondary hover:border-wise-accent'
                }`}
              >
                <div className="font-bold">{preset.bpm}</div>
                <div className="text-xs opacity-75">{preset.label}</div>
              </button>
            ))}
          </div>

          {/* Visual BPM Indicator */}
          <div className="flex justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 60 / state.tempo, repeat: Infinity }}
              className="w-4 h-4 rounded-full bg-wise-accent shadow-lg shadow-wise-accent"
            />
          </div>
        </div>

        {/* 5. Duration Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase text-wise-text-muted block">
            Duration
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[10, 30, 60].map(dur => (
              <button
                key={dur}
                onClick={() => setState(s => ({ ...s, duration: dur }))}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  state.duration === dur
                    ? 'bg-wise-accent text-black'
                    : 'bg-studio-raised border border-studio-line text-wise-text-primary hover:border-wise-accent'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
          <input
            type="number"
            value={state.duration}
            onChange={e => {
              const val = parseInt(e.target.value);
              if (val >= 10 && val <= 120) setState(s => ({ ...s, duration: val }));
            }}
            min="10"
            max="120"
            className="w-full bg-studio-input border border-studio-line rounded-lg px-3 py-2 text-wise-text-primary focus:outline-none focus:ring-2 focus:ring-wise-accent transition"
            placeholder="Custom duration (10-120s)"
          />
          <p className="text-xs text-wise-text-muted">
            Duration: ~{Math.floor(state.duration / 60)}:{(state.duration % 60).toString().padStart(2, '0')} ({state.duration < 30 ? 'short' : state.duration < 60 ? 'medium' : 'full'})
          </p>
        </div>

        {/* 6. Voice Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase text-wise-text-muted block">
            Singing Voice
          </label>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowVoiceFilter(!showVoiceFilter)}
              className="px-3 py-1 text-xs bg-studio-input border border-studio-line rounded text-wise-text-secondary hover:border-wise-accent transition"
            >
              Filter by Gender/Accent
            </button>
          </div>

          {/* Voice Filters - Expandable */}
          <AnimatePresence>
            {showVoiceFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div>
                  <p className="text-xs font-semibold text-wise-text-muted mb-1">Gender</p>
                  <div className="flex gap-2 flex-wrap">
                    {['Female', 'Male', 'Neutral'].map(g => (
                      <button
                        key={g}
                        onClick={() => setVoiceGenderFilter(voiceGenderFilter === g ? '' : g)}
                        className={`px-2 py-1 text-xs rounded transition ${
                          voiceGenderFilter === g
                            ? 'bg-wise-accent text-black'
                            : 'bg-studio-input border border-studio-line text-wise-text-secondary'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-wise-text-muted mb-1">Accent</p>
                  <div className="flex gap-2 flex-wrap">
                    {['American', 'British', 'European', 'Asian'].map(a => (
                      <button
                        key={a}
                        onClick={() => setVoiceAccentFilter(voiceAccentFilter === a ? '' : a)}
                        className={`px-2 py-1 text-xs rounded transition ${
                          voiceAccentFilter === a
                            ? 'bg-wise-accent text-black'
                            : 'bg-studio-input border border-studio-line text-wise-text-secondary'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredVoices.map(voice => (
              <motion.button
                key={voice.id}
                onClick={() => setState(s => ({ ...s, voice: s.voice === voice.id ? undefined : voice.id }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg transition text-center group ${
                  state.voice === voice.id
                    ? 'bg-wise-accent text-black'
                    : 'bg-studio-input border border-studio-line text-wise-text-primary hover:border-wise-accent'
                }`}
              >
                <div className="font-bold text-sm">{voice.name}</div>
                <div className="text-xs opacity-75">{voice.gender} • {voice.accent}</div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMoodPreviewPlaying(moodPreviewPlaying === voice.id ? null : voice.id);
                  }}
                  className="mt-2 opacity-0 group-hover:opacity-100 transition"
                >
                  <Volume2 className="w-3 h-3 mx-auto" />
                </button>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 7. Instrument Picker */}
        <div className="space-y-3">
          <label className="text-sm font-bold uppercase text-wise-text-muted block">
            Instruments
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {INSTRUMENTS.map(inst => (
              <motion.button
                key={inst.id}
                onClick={() => setState(s => ({
                  ...s,
                  instruments: s.instruments.includes(inst.id)
                    ? s.instruments.filter(i => i !== inst.id)
                    : [...s.instruments, inst.id]
                }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition text-center ${
                  state.instruments.includes(inst.id)
                    ? 'bg-wise-accent text-black'
                    : 'bg-studio-input border border-studio-line text-wise-text-primary hover:border-wise-accent'
                }`}
              >
                <div className="text-xl mb-1">{inst.emoji}</div>
                <div className="text-xs font-semibold">{inst.label}</div>
              </motion.button>
            ))}
          </div>

          {/* Arrangement Complexity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-wise-text-muted">Arrangement Complexity</label>
              <span className="text-sm text-wise-accent">{state.instruments.length > 0 ? 'Multi-layer' : 'Simple'}</span>
            </div>
            <input
              type="range"
              min="1"
              max="9"
              value={Math.max(1, state.instruments.length)}
              disabled
              className="w-full h-2 bg-studio-line rounded-lg appearance-none cursor-not-allowed accent-wise-accent opacity-50"
            />
          </div>
        </div>

        {/* 8. Key/Scale Control */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-wise-text-muted block">Key</label>
            <select
              value={state.key}
              onChange={e => setState(s => ({ ...s, key: e.target.value }))}
              className="w-full bg-studio-input border border-studio-line rounded-lg px-3 py-2 text-wise-text-primary focus:outline-none focus:ring-2 focus:ring-wise-accent transition"
            >
              {KEYS.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase text-wise-text-muted block">Scale</label>
            <select
              value={state.scale}
              onChange={e => setState(s => ({ ...s, scale: e.target.value }))}
              className="w-full bg-studio-input border border-studio-line rounded-lg px-3 py-2 text-wise-text-primary focus:outline-none focus:ring-2 focus:ring-wise-accent transition"
            >
              {SCALES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-detect Mood Button */}
        <button
          onClick={() => {
            const moodKey = state.mood === 'sad' || state.mood === 'dark' ? 'A' : 'C';
            const moodScale = state.mood === 'sad' ? 'Minor' : 'Major';
            setState(s => ({ ...s, key: moodKey, scale: moodScale }));
          }}
          className="w-full px-3 py-2 bg-studio-input border border-studio-line rounded-lg text-wise-text-secondary hover:border-wise-accent hover:text-wise-accent transition text-sm font-semibold"
        >
          Auto-detect Key from Mood
        </button>

        {/* 9. Advanced Settings */}
        <motion.div
          className="border-t border-studio-line pt-4 space-y-3"
        >
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-3 py-2 bg-studio-input border border-studio-line rounded-lg hover:border-wise-accent transition text-wise-text-secondary hover:text-wise-text-primary"
          >
            <span className="text-sm font-semibold flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Advanced Settings
            </span>
            <ChevronDown className={`w-4 h-4 transition ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Intensity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold uppercase text-wise-text-muted">Intensity</label>
                    <span className="text-sm text-wise-accent">{state.intensity}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={state.intensity}
                    onChange={e => setState(s => ({ ...s, intensity: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-studio-line rounded-lg appearance-none cursor-pointer accent-wise-accent"
                  />
                </div>

                {/* Number of Variants */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-wise-text-muted block">Variants to Generate</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        onClick={() => setState(s => ({ ...s, variants: v }))}
                        className={`py-2 rounded-lg text-sm font-semibold transition ${
                          state.variants === v
                            ? 'bg-wise-accent text-black'
                            : 'bg-studio-input border border-studio-line text-wise-text-secondary hover:border-wise-accent'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Preset */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-wise-text-muted block">Quality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['standard', 'high', 'ultra'] as const).map(q => (
                      <button
                        key={q}
                        onClick={() => setState(s => ({ ...s, quality: q }))}
                        className={`py-2 rounded-lg text-xs font-semibold transition ${
                          state.quality === q
                            ? 'bg-wise-accent text-black'
                            : 'bg-studio-input border border-studio-line text-wise-text-secondary hover:border-wise-accent'
                        }`}
                      >
                        {q.charAt(0).toUpperCase() + q.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-wise-text-muted">
                    {state.quality === 'standard' && '~45-60 seconds'}
                    {state.quality === 'high' && '~75-90 seconds'}
                    {state.quality === 'ultra' && '~120-150 seconds'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
          isLoading
            ? 'bg-wise-accent-dim text-wise-accent-soft cursor-not-allowed opacity-75'
            : 'bg-wise-accent text-black hover:shadow-lg hover:shadow-wise-accent/50 active:scale-95'
        }`}
      >
        <Zap className="w-5 h-5" />
        {isLoading ? `Generating... ${Math.round(progress)}%` : '⚡ Generate Music'}
      </motion.button>

      {/* Progress Bar and ETA */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="w-full h-2 bg-studio-line rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-wise-accent-dim to-wise-accent"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
            {eta && (
              <p className="text-sm text-wise-text-muted text-center">
                Generating... ~{Math.round(eta * (1 - progress / 100))}s remaining
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-wise-text-muted">
        <div className="bg-studio-raised border border-studio-line p-3 rounded-lg">
          <p className="font-semibold text-wise-accent mb-1">💾 Auto-Save</p>
          Your prompt is saved to localStorage
        </div>
        <div className="bg-studio-raised border border-studio-line p-3 rounded-lg">
          <p className="font-semibold text-wise-accent mb-1">🎵 Multi-Variant</p>
          Generate up to 5 variations per prompt
        </div>
        <div className="bg-studio-raised border border-studio-line p-3 rounded-lg">
          <p className="font-semibold text-wise-accent mb-1">⚡ Quality</p>
          Choose Standard, High, or Ultra quality
        </div>
      </div>
    </div>
  );
}

export default MusicGenerationPromptBuilder;
