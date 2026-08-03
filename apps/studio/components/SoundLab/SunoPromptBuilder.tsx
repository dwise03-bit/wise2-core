'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Music, Zap, Settings } from 'lucide-react';
import { SunoGenerationParams, SunoGenre, SunoMood, SunoVoice, SunoKey } from '../../types/suno';

interface SunoPromptBuilderProps {
  onGenerate: (params: SunoGenerationParams) => Promise<void>;
  isLoading?: boolean;
}

const GENRES: SunoGenre[] = [
  'Pop', 'Electronic', 'Hip-Hop', 'Classical', 'Jazz', 'Ambient', 'Folk',
  'Rock', 'R&B', 'Country', 'Indie', 'Alternative', 'Reggae', 'Blues',
  'Metal', 'Punk', 'Disco', 'House', 'Techno', 'Trance', 'Dubstep',
  'Trap', 'K-Pop', 'J-Pop', 'Afrobeats', 'Ska', 'Grunge', 'Emo',
  'Gospel', 'Soul', 'Funk', 'Bossa Nova', 'Latin', 'Salsa', 'Reggaeton',
  'Experimental', 'Psychedelic', 'Synthwave', 'Lo-Fi', 'Vaporwave', 'Chillwave',
  'Orchestral', 'Cinematic', 'Ambient Electronic', 'Industrial', 'Post-Punk',
  'New Wave', 'Synthpop', 'Dream Pop', 'Shoegaze', 'Indie Pop',
];

const MOODS: SunoMood[] = ['Happy', 'Sad', 'Energetic', 'Calm', 'Dark', 'Uplifting'];

const VOICES: SunoVoice[] = [
  'Bella', 'Marco', 'Skye', 'Bossa', 'Guidian', 'Zephyr',
  'Chorus', 'Ivy', 'River', 'Alex', 'Karl', 'Luna',
];

const KEYS: SunoKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function SunoPromptBuilder({ onGenerate, isLoading = false }: SunoPromptBuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<SunoGenre>('Electronic');
  const [mood, setMood] = useState<SunoMood>('Energetic');
  const [tempo, setTempo] = useState(120);
  const [duration, setDuration] = useState(30);
  const [voice, setVoice] = useState<SunoVoice>('Bella');
  const [vocalType, setVocalType] = useState<'Vocal' | 'Instrumental'>('Vocal');
  const [key, setKey] = useState<SunoKey>('C');
  const [scale, setScale] = useState<'Major' | 'Minor'>('Major');

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    try {
      await onGenerate({
        prompt,
        genre,
        mood,
        tempo,
        duration,
        voice,
        vocalType,
        key,
        scale,
      });
    } catch (error) {
      console.error('Generation error:', error);
    }
  }, [prompt, genre, mood, tempo, duration, voice, vocalType, key, scale, onGenerate]);

  const characterCount = prompt.length;
  const maxCharacters = 500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-gradient-to-br from-studio-panel to-studio-bg border border-wise-medium rounded-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-wise-accent/20 rounded-lg">
            <Music className="w-5 h-5 text-wise-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-wise-text-primary">WISE² Prompt Builder</h2>
            <p className="text-sm text-wise-text-muted">AI-powered music generation</p>
          </div>
        </div>

        {/* Main Prompt Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-wise-text-primary">
            Music Prompt
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, maxCharacters))}
              placeholder="Describe the music you want to generate... (e.g., 'upbeat electronic dance track with synth drops')"
              className="w-full h-32 px-4 py-3 bg-studio-input border border-wise-medium rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent focus:ring-1 focus:ring-wise-accent/50 resize-none"
            />
            <div className="absolute bottom-3 right-3 text-xs text-wise-text-muted">
              {characterCount}/{maxCharacters}
            </div>
          </div>
        </div>

        {/* Genre & Mood Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Genre Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-wise-text-primary">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value as SunoGenre)}
              className="w-full px-4 py-2 bg-studio-input border border-wise-medium rounded-lg text-wise-text-primary focus:outline-none focus:border-wise-accent focus:ring-1 focus:ring-wise-accent/50"
            >
              {GENRES.map((g) => (
                <option key={g} value={g} className="bg-studio-panel">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Mood Radio Buttons */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-wise-text-primary">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <motion.label
                  key={m}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-studio-input border border-wise-medium rounded-lg cursor-pointer hover:border-wise-accent transition"
                >
                  <input
                    type="radio"
                    name="mood"
                    value={m}
                    checked={mood === m}
                    onChange={(e) => setMood(e.target.value as SunoMood)}
                    className="w-4 h-4 cursor-pointer accent-wise-accent"
                  />
                  <span className="text-xs font-medium text-wise-text-primary">{m}</span>
                </motion.label>
              ))}
            </div>
          </div>
        </div>

        {/* Tempo Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-wise-text-primary">Tempo (BPM)</label>
            <span className="text-lg font-bold text-wise-accent font-mono">{tempo}</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="40"
              max="200"
              step="5"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              className="flex-1 h-2 bg-studio-line rounded-lg appearance-none cursor-pointer slider accent-wise-accent"
            />
            <div className="flex gap-2">
              {[80, 120, 160].map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTempo(t)}
                  className={`px-2 py-1 text-xs font-medium rounded transition ${
                    tempo === t
                      ? 'bg-wise-accent text-studio-panel'
                      : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
                  }`}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Duration Buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-wise-text-primary">Duration</label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 30, 60].map((d) => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDuration(d)}
                className={`py-3 px-4 rounded-lg font-semibold text-sm transition ${
                  duration === d
                    ? 'bg-wise-accent text-studio-panel'
                    : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
                }`}
              >
                {d}s
              </motion.button>
            ))}
          </div>
        </div>

        {/* Voice & Vocal Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-wise-text-primary">AI Voice</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value as SunoVoice)}
              className="w-full px-4 py-2 bg-studio-input border border-wise-medium rounded-lg text-wise-text-primary focus:outline-none focus:border-wise-accent focus:ring-1 focus:ring-wise-accent/50"
            >
              {VOICES.map((v) => (
                <option key={v} value={v} className="bg-studio-panel">
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Vocal Type Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-wise-text-primary">Type</label>
            <div className="flex gap-2">
              {(['Vocal', 'Instrumental'] as const).map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVocalType(type)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
                    vocalType === type
                      ? 'bg-wise-accent text-studio-panel'
                      : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
                  }`}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Key & Scale Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-wise-text-primary">Key</label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value as SunoKey)}
              className="w-full px-4 py-2 bg-studio-input border border-wise-medium rounded-lg text-wise-text-primary focus:outline-none focus:border-wise-accent focus:ring-1 focus:ring-wise-accent/50"
            >
              {KEYS.map((k) => (
                <option key={k} value={k} className="bg-studio-panel">
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-wise-text-primary">Scale</label>
            <div className="flex gap-2">
              {(['Major', 'Minor'] as const).map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition ${
                    scale === s
                      ? 'bg-wise-accent text-studio-panel'
                      : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
                  }`}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-4 px-6 bg-gradient-to-r from-wise-accent to-wise-accent-bright text-studio-panel font-bold rounded-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-wise-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-studio-panel border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generate Music
            </>
          )}
        </motion.button>

        {/* Quick Tips */}
        <div className="bg-studio-input/50 border border-wise-medium rounded-lg p-4 space-y-2">
          <div className="flex gap-2 items-start">
            <Settings className="w-4 h-4 text-wise-accent mt-0.5 flex-shrink-0" />
            <div className="text-xs text-wise-text-secondary space-y-1">
              <p className="font-semibold">Pro Tips:</p>
              <ul className="space-y-1 text-wise-text-muted">
                <li>• Be specific: mention instruments, tempo, and style</li>
                <li>• Combine genres: "electronic jazz fusion"</li>
                <li>• Describe the vibe: "dark, moody, introspective"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
