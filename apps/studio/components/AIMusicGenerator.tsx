'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIMusic, MusicGenerationParams } from '../hooks/useAIMusic';

export function AIMusicGenerator() {
  const music = useAIMusic();
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Electronic');
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [selectedInstrument, setSelectedInstrument] = useState('Synth');
  const [tempo, setTempo] = useState(120);
  const [duration, setDuration] = useState(30);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      alert('Please enter a music prompt');
      return;
    }

    const params: MusicGenerationParams = {
      prompt,
      genre: selectedGenre,
      mood: selectedMood,
      instrument: selectedInstrument,
      tempo,
      duration,
    };

    music.generateMusic(params);
  };

  const togglePlayback = (trackId: string) => {
    setPlayingTrackId(playingTrackId === trackId ? null : trackId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4 h-full flex flex-col"
    >
      {/* Generation Form */}
      <motion.div
        className="bg-wise-surface rounded-lg p-4 border border-wise-medium space-y-4"
        whileHover={{ scale: 1.01 }}
      >
        {/* Prompt Input */}
        <div>
          <label className="text-sm font-semibold block mb-2">Music Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the music you want to generate... e.g., 'Upbeat synthwave with 80s vibes and a driving bass'"
            className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-sm resize-none focus:outline-none focus:border-wise-primary transition h-20"
          />
        </div>

        {/* Genre, Mood, Instrument */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold block mb-2 uppercase">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary text-sm"
            >
              {music.genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-2 uppercase">Mood</label>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary text-sm"
            >
              {music.moods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-2 uppercase">Instrument</label>
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(e.target.value)}
              className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary text-sm"
            >
              {music.instruments.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tempo and Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold block mb-2 uppercase">
              Tempo: {tempo} BPM
            </label>
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full h-2 accent-wise-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-2 uppercase">
              Duration: {duration}s
            </label>
            <input
              type="range"
              min="10"
              max="120"
              step="10"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 accent-wise-primary"
            />
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={music.isGenerating}
          className="w-full py-3 bg-gradient-to-r from-wise-primary to-wise-primary-active hover:shadow-lg disabled:opacity-50 text-white rounded-lg font-semibold transition"
          whileHover={!music.isGenerating ? { scale: 1.05 } : {}}
          whileTap={!music.isGenerating ? { scale: 0.95 } : {}}
        >
          {music.isGenerating ? (
            <motion.div className="flex items-center justify-center gap-2">
              <motion.div
                className="w-4 h-4 rounded-full bg-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Generating... ({music.currentGeneration?.progress || 0}%)
            </motion.div>
          ) : (
            '✨ Generate Music'
          )}
        </motion.button>

        {music.currentGeneration && (
          <motion.div
            className="bg-wise-surface-secondary rounded p-3 space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Generation Progress</span>
              <span className="text-xs text-wise-text-muted">
                ~{Math.max(30 - Math.floor(music.currentGeneration.progress / 3), 0)}s
              </span>
            </div>
            <motion.div className="w-full h-2 bg-wise-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-wise-primary to-wise-accent-green"
                initial={{ width: 0 }}
                animate={{ width: `${music.currentGeneration.progress}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 60 }}
              />
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {music.error && (
          <motion.div
            className="bg-wise-accent-red/20 border border-wise-accent-red rounded-lg p-3 text-wise-accent-red text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {music.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracks Library */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">
            Library ({music.tracks.length})
          </h3>
          {music.tracks.length > 0 && (
            <motion.button
              onClick={() => music.batchGenerate(music.tracks.filter(t => t.status === 'complete').map(t => ({
                prompt: t.prompt,
                genre: t.genre,
                mood: t.mood,
                tempo: t.tempo,
                instrument: t.instrument,
                duration: 30,
              })))}
              className="text-xs px-2 py-1 bg-wise-surface hover:bg-wise-surface/80 text-wise-text-primary rounded transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Batch Regen
            </motion.button>
          )}
        </div>

        {/* Tracks List */}
        <motion.div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <AnimatePresence mode="popLayout">
            {music.tracks.map((track, index) => (
              <motion.div
                key={track.id}
                className="bg-wise-surface rounded-lg p-3 border border-wise-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Track Header */}
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{track.prompt}</div>
                    <div className="text-xs text-wise-text-muted">
                      {track.genre} • {track.mood} • {track.instrument} • {track.tempo} BPM
                    </div>
                  </div>
                  <motion.div
                    className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                      track.status === 'complete'
                        ? 'bg-wise-accent-green/20 text-wise-accent-green'
                        : track.status === 'generating'
                        ? 'bg-wise-primary/20 text-wise-primary'
                        : 'bg-wise-accent-red/20 text-wise-accent-red'
                    }`}
                  >
                    {track.status === 'generating'
                      ? `${track.progress}%`
                      : track.status.toUpperCase()}
                  </motion.div>
                </div>

                {/* Waveform Preview */}
                {track.waveformData && (
                  <motion.div className="h-12 bg-wise-surface-secondary rounded flex items-center p-2 mb-2 gap-px overflow-hidden">
                    {track.waveformData.map((value, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-wise-primary to-wise-accent-green rounded-sm"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.abs(value) * 0.5}%` }}
                        transition={{ delay: i * 0.01 }}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Progress Bar */}
                {track.status === 'generating' && (
                  <motion.div className="w-full h-1 bg-wise-surface-secondary rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-wise-primary to-wise-accent-green"
                      animate={{ width: `${track.progress}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 60 }}
                    />
                  </motion.div>
                )}

                {/* Actions */}
                {track.status === 'complete' && (
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => togglePlayback(track.id)}
                      className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition ${
                        playingTrackId === track.id
                          ? 'bg-wise-primary text-white'
                          : 'bg-wise-surface-secondary text-wise-text-primary hover:bg-wise-surface'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {playingTrackId === track.id ? '⏸ Pause' : '▶ Play'}
                    </motion.button>
                    <motion.button
                      onClick={() => music.downloadTrack(track.id)}
                      className="flex-1 px-3 py-2 bg-wise-accent-green/20 hover:bg-wise-accent-green/30 text-wise-accent-green rounded text-sm font-semibold transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📥 Download
                    </motion.button>
                    <motion.button
                      onClick={() => music.deleteTrack(track.id)}
                      className="flex-1 px-3 py-2 bg-wise-accent-red/20 hover:bg-wise-accent-red/30 text-wise-accent-red rounded text-sm font-semibold transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🗑 Delete
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {music.tracks.length === 0 && (
            <motion.div
              className="flex items-center justify-center h-full text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-wise-text-muted">
                <div className="text-2xl mb-2">🎵</div>
                <div>No tracks yet</div>
                <div className="text-xs">Generate your first track above</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
