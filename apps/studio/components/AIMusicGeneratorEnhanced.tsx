'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIMusicEnhanced } from '../hooks/useAIMusicEnhanced';
import { GeneratedTrack, ExportOptions } from '../types/aimusic';

/**
 * Enhanced AI Music Generator Component - Complete Suno.com Feature Set
 * Production-grade implementation with TypeScript, animations, and accessibility
 */

export function AIMusicGeneratorEnhanced() {
  const music = useAIMusicEnhanced();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  // Tab Content Components
  const GenerateTab = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 flex flex-col flex-1"
    >
      {/* Mode Selection */}
      <div className="bg-wise-surface rounded-lg p-4 border border-wise-medium">
        <label className="text-xs font-bold uppercase text-wise-text-muted mb-3 block">
          Generation Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['text-to-song', 'sounds', 'audio-to-song'].map((mode) => (
            <motion.button
              key={mode}
              onClick={() => music.setActiveTab('generate')}
              className={`px-3 py-2 rounded text-sm font-semibold transition ${
                music.state.currentGenerationMode === mode
                  ? 'bg-wise-primary text-white'
                  : 'bg-wise-surface-secondary text-wise-text-primary hover:bg-wise-surface'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mode === 'text-to-song' && '🎵 Text-to-Song'}
              {mode === 'sounds' && '🔊 Sounds'}
              {mode === 'audio-to-song' && '🎙️ Audio-to-Song'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Generation Form */}
      <TextToSongForm music={music} />

      {/* Generation Progress */}
      <GenerationProgress music={music} />
    </motion.div>
  );

  const VoicesTab = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 flex flex-col flex-1"
    >
      <VoiceRecorder music={music} />
      <VoiceLibrary music={music} />
    </motion.div>
  );

  const ModelsTab = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 flex flex-col flex-1"
    >
      <ModelTrainer music={music} />
      <ModelLibrary music={music} />
    </motion.div>
  );

  const EditTab = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 flex flex-col flex-1"
    >
      <StudioTools music={music} selectedTrackId={selectedTrackId} />
    </motion.div>
  );

  const LyricsTab = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 flex flex-col flex-1"
    >
      <LyricsEditor music={music} selectedTrackId={selectedTrackId} />
    </motion.div>
  );

  const LibraryTab = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 flex flex-col flex-1"
    >
      <LibraryBrowser music={music} searchQuery={searchQuery} onSearchChange={setSearchQuery} onSelectTrack={setSelectedTrackId} onPlayTrack={setPlayingTrackId} playingTrackId={playingTrackId} />
    </motion.div>
  );

  const ExportTab = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 flex flex-col flex-1"
    >
      <ExportPanel music={music} selectedTrackId={selectedTrackId} />
    </motion.div>
  );

  const tabs = [
    { id: 'generate', label: '✨ Generate', component: GenerateTab },
    { id: 'voices', label: '🎤 Voices', component: VoicesTab },
    { id: 'models', label: '🤖 Models', component: ModelsTab },
    { id: 'edit', label: '✏️ Edit', component: EditTab },
    { id: 'lyrics', label: '📝 Lyrics', component: LyricsTab },
    { id: 'library', label: '📚 Library', component: LibraryTab },
    { id: 'export', label: '⬇️ Export', component: ExportTab },
  ] as const;

  const CurrentTabComponent = tabs.find((t) => t.id === music.activeTab)?.component || GenerateTab;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4 h-full flex flex-col"
    >
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

      {/* Tab Navigation */}
      <motion.div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => music.setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              music.activeTab === tab.id
                ? 'bg-wise-primary text-white shadow-lg'
                : 'bg-wise-surface text-wise-text-primary hover:bg-wise-surface-secondary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CurrentTabComponent />
      </div>
    </motion.div>
  );
}

// Sub-components

function TextToSongForm({ music }: { music: ReturnType<typeof useAIMusicEnhanced> }) {
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Electronic');
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [tempo, setTempo] = useState(120);
  const [duration, setDuration] = useState(60);
  const [useMagicWand, setUseMagicWand] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim() && !useMagicWand) {
      alert('Please enter a music prompt or use Magic Wand');
      return;
    }

    const params = useMagicWand
      ? music.applyMagicWand({ prompt: prompt || 'Generate music with user preferences' })
      : {
          prompt,
          genre: selectedGenre,
          mood: selectedMood,
          tempo,
          duration,
        };

    music.generateMusic({
      mode: 'text-to-song',
      description: prompt,
      genre: selectedGenre,
      mood: selectedMood,
      tempo,
      instruments: [],
      duration,
    } as any);
  };

  return (
    <motion.div
      className="bg-wise-surface rounded-lg p-4 border border-wise-medium space-y-4 flex-1"
      whileHover={{ scale: 1.01 }}
    >
      {/* Prompt Input */}
      <div>
        <label className="text-sm font-semibold block mb-2">Music Description</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the music you want... e.g., 'Upbeat synthwave with 80s vibes and driving bass'"
          className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-sm resize-none focus:outline-none focus:border-wise-primary transition h-20"
        />
      </div>

      {/* Genre, Mood Controls */}
      <div className="grid grid-cols-2 gap-3">
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
            max="300"
            step="10"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 accent-wise-primary"
          />
        </div>
      </div>

      {/* Magic Wand Toggle */}
      <motion.label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={useMagicWand}
          onChange={(e) => setUseMagicWand(e.target.checked)}
          className="w-4 h-4 accent-wise-primary"
        />
        <span className="text-sm font-semibold">✨ Magic Wand (Apply My Taste)</span>
      </motion.label>

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
    </motion.div>
  );
}

function GenerationProgress({ music }: { music: ReturnType<typeof useAIMusicEnhanced> }) {
  if (!music.currentGeneration) return null;

  return (
    <motion.div
      className="bg-wise-surface-secondary rounded p-3 space-y-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold">Generation Progress</span>
        <span className="text-xs text-wise-text-muted">
          ~{Math.max(30 - Math.floor((music.currentGeneration.progress || 0) / 3), 0)}s remaining
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
  );
}

function VoiceRecorder({ music }: { music: ReturnType<typeof useAIMusicEnhanced> }) {
  const isRecording = music.voiceRecordingSession?.isRecording ?? false;

  return (
    <motion.div
      className="bg-wise-surface rounded-lg p-4 border border-wise-medium"
      whileHover={{ scale: 1.01 }}
    >
      <h3 className="font-semibold mb-3 text-sm">Record Voice</h3>
      <motion.button
        onClick={isRecording ? music.stopVoiceRecording : music.startVoiceRecording}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          isRecording
            ? 'bg-wise-accent-red hover:bg-wise-accent-red/80 text-white'
            : 'bg-wise-accent-green hover:bg-wise-accent-green/80 text-white'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
      </motion.button>
      {isRecording && (
        <motion.div className="mt-2 flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-wise-accent-red"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs text-wise-text-muted">Recording...</span>
        </motion.div>
      )}
    </motion.div>
  );
}

function VoiceLibrary({ music }: { music: ReturnType<typeof useAIMusicEnhanced> }) {
  return (
    <motion.div className="bg-wise-surface rounded-lg p-4 border border-wise-medium flex-1 flex flex-col min-h-0">
      <h3 className="font-semibold mb-3 text-sm">Custom Voices ({music.library.customVoices.length})</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {music.library.customVoices.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center py-8">
            <div className="text-wise-text-muted">
              <div className="text-2xl mb-2">🎤</div>
              <div className="text-sm">No custom voices yet</div>
              <div className="text-xs">Record your voice above</div>
            </div>
          </div>
        ) : (
          music.library.customVoices.map((voice) => (
            <motion.div
              key={voice.id}
              className="bg-wise-surface-secondary rounded p-2 cursor-pointer hover:bg-wise-surface transition"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-xs font-semibold">{voice.name}</div>
              <div className="text-xs text-wise-text-muted">{voice.description}</div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function ModelTrainer({ music }: { music: ReturnType<typeof useAIMusicEnhanced> }) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  return (
    <motion.div className="bg-wise-surface rounded-lg p-4 border border-wise-medium">
      <h3 className="font-semibold mb-3 text-sm">Train Custom Model</h3>
      <select
        value={selectedTrackId || ''}
        onChange={(e) => setSelectedTrackId(e.target.value || null)}
        className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary text-sm mb-3"
      >
        <option value="">Select a reference track...</option>
        {music.library.tracks.filter((t) => t.status === 'complete').map((t) => (
          <option key={t.id} value={t.id}>
            {t.prompt.slice(0, 50)}
          </option>
        ))}
      </select>
      <motion.button
        onClick={() => selectedTrackId && music.trainCustomModel(selectedTrackId, `Model-${Date.now()}`)}
        disabled={!selectedTrackId}
        className="w-full py-2 bg-wise-primary hover:bg-wise-primary-active disabled:opacity-50 text-white rounded-lg font-semibold transition"
        whileHover={selectedTrackId ? { scale: 1.05 } : {}}
        whileTap={selectedTrackId ? { scale: 0.95 } : {}}
      >
        🤖 Train Model
      </motion.button>
    </motion.div>
  );
}

function ModelLibrary({ music }: { music: ReturnType<typeof useAIMusicEnhanced> }) {
  return (
    <motion.div className="bg-wise-surface rounded-lg p-4 border border-wise-medium flex-1 flex flex-col min-h-0">
      <h3 className="font-semibold mb-3 text-sm">Custom Models ({music.library.customModels.length})</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {music.library.customModels.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center py-8">
            <div className="text-wise-text-muted">
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-sm">No custom models yet</div>
              <div className="text-xs">Train a model above</div>
            </div>
          </div>
        ) : (
          music.library.customModels.map((model) => (
            <motion.div
              key={model.id}
              className="bg-wise-surface-secondary rounded p-2 space-y-1"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold">{model.name}</div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    model.status === 'ready'
                      ? 'bg-wise-accent-green/20 text-wise-accent-green'
                      : model.status === 'training'
                        ? 'bg-wise-primary/20 text-wise-primary'
                        : 'bg-wise-accent-red/20 text-wise-accent-red'
                  }`}
                >
                  {model.status.toUpperCase()}
                </span>
              </div>
              {model.status === 'training' && (
                <motion.div className="w-full h-1 bg-wise-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-wise-primary"
                    animate={{ width: `${model.trainingProgress}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 60 }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function StudioTools({ music, selectedTrackId }: { music: ReturnType<typeof useAIMusicEnhanced>; selectedTrackId: string | null }) {
  return (
    <motion.div className="bg-wise-surface rounded-lg p-4 border border-wise-medium">
      <h3 className="font-semibold mb-3 text-sm">Studio Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          onClick={() => selectedTrackId && music.extractStems(selectedTrackId)}
          disabled={!selectedTrackId}
          className="py-2 bg-wise-primary hover:bg-wise-primary-active disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
          whileHover={selectedTrackId ? { scale: 1.05 } : {}}
          whileTap={selectedTrackId ? { scale: 0.95 } : {}}
        >
          🎚️ Extract Stems
        </motion.button>
        <motion.button
          onClick={() => music.createTimeline()}
          className="py-2 bg-wise-primary hover:bg-wise-primary-active text-white rounded-lg text-sm font-semibold transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📊 Create Timeline
        </motion.button>
      </div>
      {music.library.tracks.length > 1 && (
        <motion.button
          className="w-full mt-2 py-2 bg-wise-accent-green/20 hover:bg-wise-accent-green/30 text-wise-accent-green rounded-lg text-sm font-semibold transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎛️ Create Mashup
        </motion.button>
      )}
    </motion.div>
  );
}

function LyricsEditor({ music, selectedTrackId }: { music: ReturnType<typeof useAIMusicEnhanced>; selectedTrackId: string | null }) {
  const [lyrics, setLyrics] = useState('');

  if (!selectedTrackId) {
    return (
      <div className="bg-wise-surface rounded-lg p-4 border border-wise-medium flex items-center justify-center h-full">
        <div className="text-wise-text-muted">Select a track from the library to edit lyrics</div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-wise-surface rounded-lg p-4 border border-wise-medium flex flex-col flex-1 min-h-0"
      whileHover={{ scale: 1.01 }}
    >
      <h3 className="font-semibold mb-3 text-sm">Lyrics Editor</h3>
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder="Enter lyrics here..."
        className="flex-1 px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-sm resize-none focus:outline-none focus:border-wise-primary transition"
      />
      <motion.button
        onClick={() => music.updateLyrics(selectedTrackId, lyrics)}
        className="w-full mt-3 py-2 bg-wise-primary hover:bg-wise-primary-active text-white rounded-lg font-semibold transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        💾 Save Lyrics
      </motion.button>
    </motion.div>
  );
}

function LibraryBrowser({
  music,
  searchQuery,
  onSearchChange,
  onSelectTrack,
  onPlayTrack,
  playingTrackId,
}: {
  music: ReturnType<typeof useAIMusicEnhanced>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTrack: (trackId: string | null) => void;
  onPlayTrack: (trackId: string | null) => void;
  playingTrackId: string | null;
}) {
  const filteredTracks = useMemo(() => {
    return searchQuery ? music.searchTracks(searchQuery) : music.library.tracks;
  }, [searchQuery, music, music.library.tracks]);

  return (
    <motion.div className="bg-wise-surface rounded-lg p-4 border border-wise-medium flex flex-col flex-1 min-h-0">
      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by description, genre, mood..."
        className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-sm mb-3 focus:outline-none focus:border-wise-primary transition"
      />

      {/* Tracks List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
        <AnimatePresence mode="popLayout">
          {filteredTracks.length === 0 ? (
            <motion.div className="flex items-center justify-center h-full text-center py-12">
              <div className="text-wise-text-muted">
                <div className="text-2xl mb-2">📚</div>
                <div>No tracks found</div>
              </div>
            </motion.div>
          ) : (
            filteredTracks.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                index={index}
                isSelected={false}
                isPlaying={playingTrackId === track.id}
                onSelect={() => onSelectTrack(track.id)}
                onPlay={() => onPlayTrack(playingTrackId === track.id ? null : track.id)}
                onFavorite={() => music.toggleFavorite(track.id)}
                onDelete={() => music.deleteTrack(track.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TrackCard({
  track,
  index,
  isSelected,
  isPlaying,
  onSelect,
  onPlay,
  onFavorite,
  onDelete,
}: {
  track: GeneratedTrack;
  index: number;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPlay: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      className={`bg-wise-surface-secondary rounded-lg p-3 border transition cursor-pointer ${
        isSelected ? 'border-wise-primary' : 'border-wise-medium'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
    >
      {/* Track Header */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{track.prompt.slice(0, 50)}</div>
          <div className="text-xs text-wise-text-muted">
            {track.genre} • {track.mood} • {track.tempo} BPM • {track.duration}s
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
          {track.status === 'generating' ? `${track.progress}%` : track.status.toUpperCase()}
        </motion.div>
      </div>

      {/* Waveform Preview */}
      {track.waveformData && track.waveformData.length > 0 && (
        <motion.div className="h-8 bg-wise-surface rounded flex items-center p-1 mb-2 gap-px overflow-hidden">
          {track.waveformData.slice(0, 64).map((value, i) => (
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
        <motion.div className="w-full h-1 bg-wise-surface rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gradient-to-r from-wise-primary to-wise-accent-green"
            animate={{ width: `${track.progress}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 60 }}
          />
        </motion.div>
      )}

      {/* Actions */}
      {track.status === 'complete' && (
        <div className="flex gap-1">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition ${
              isPlaying
                ? 'bg-wise-primary text-white'
                : 'bg-wise-surface text-wise-text-primary hover:bg-wise-surface-secondary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? '⏸' : '▶'}
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition ${
              track.isFavorite
                ? 'bg-wise-accent-yellow/20 text-wise-accent-yellow'
                : 'bg-wise-surface text-wise-text-primary hover:bg-wise-surface-secondary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {track.isFavorite ? '⭐' : '☆'}
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1 px-2 py-1 bg-wise-accent-red/20 hover:bg-wise-accent-red/30 text-wise-accent-red rounded text-xs font-semibold transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🗑
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

function ExportPanel({ music, selectedTrackId }: { music: ReturnType<typeof useAIMusicEnhanced>; selectedTrackId: string | null }) {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('mp3');

  if (!selectedTrackId) {
    return (
      <div className="bg-wise-surface rounded-lg p-4 border border-wise-medium flex items-center justify-center h-full">
        <div className="text-wise-text-muted">Select a track from the library to export</div>
      </div>
    );
  }

  const track = music.library.tracks.find((t) => t.id === selectedTrackId);
  if (!track) return null;

  return (
    <motion.div className="bg-wise-surface rounded-lg p-4 border border-wise-medium space-y-4">
      <h3 className="font-semibold text-sm">Export Options</h3>

      <div>
        <label className="text-xs font-semibold block mb-2 uppercase">Format</label>
        <div className="grid grid-cols-2 gap-2">
          {['mp3', 'wav', 'stems', 'midi'].map((format) => (
            <motion.button
              key={format}
              onClick={() => setSelectedFormat(format as ExportOptions['format'])}
              className={`px-3 py-2 rounded text-sm font-semibold transition ${
                selectedFormat === format
                  ? 'bg-wise-primary text-white'
                  : 'bg-wise-surface-secondary text-wise-text-primary hover:bg-wise-surface'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {format.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={() => music.downloadTrack(selectedTrackId, { format: selectedFormat })}
        className="w-full py-3 bg-gradient-to-r from-wise-accent-green to-wise-primary text-white rounded-lg font-semibold hover:shadow-lg transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ⬇️ Download {selectedFormat.toUpperCase()}
      </motion.button>
    </motion.div>
  );
}
