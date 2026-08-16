'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Star, Trash2, Plus, Search, Filter, Calendar, Clock } from 'lucide-react';

interface Generation {
  id: string;
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
  tempo: number;
  audioUrl: string;
  waveformUrl: string;
  createdAt: number;
  favorite: boolean;
  instrumentation?: string[];
  quality: 'standard' | 'high' | 'ultra';
  generationTime: number;
}

interface GenerationHistoryProps {
  generations?: Generation[];
  onPlay?: (id: string, audioUrl: string) => void;
  onDownload?: (id: string, audioUrl: string, prompt: string) => void;
  onDelete?: (id: string) => void;
  onAddToSoundLab?: (id: string) => void;
  onToggleFavorite?: (id: string, favorite: boolean) => void;
  viewMode?: 'grid' | 'list';
}

const MOCK_GENERATIONS: Generation[] = [
  {
    id: 'gen-1',
    prompt: 'Upbeat electronic dance track with bright synths and pulsing bassline',
    genre: 'EDM',
    mood: 'Energetic',
    duration: 30,
    tempo: 128,
    audioUrl: '/samples/gen-1.mp3',
    waveformUrl: 'data:image/svg+xml,%3Csvg...',
    createdAt: Date.now() - 86400000,
    favorite: true,
    quality: 'high',
    generationTime: 45,
  },
  {
    id: 'gen-2',
    prompt: 'Melancholic indie folk with acoustic guitar and soft vocals',
    genre: 'Folk',
    mood: 'Melancholic',
    duration: 60,
    tempo: 90,
    audioUrl: '/samples/gen-2.mp3',
    waveformUrl: 'data:image/svg+xml,%3Csvg...',
    createdAt: Date.now() - 172800000,
    favorite: false,
    quality: 'standard',
    generationTime: 55,
  },
  {
    id: 'gen-3',
    prompt: 'Dark ambient drone with evolving textures',
    genre: 'Ambient',
    mood: 'Dark',
    duration: 120,
    tempo: 60,
    audioUrl: '/samples/gen-3.mp3',
    waveformUrl: 'data:image/svg+xml,%3Csvg...',
    createdAt: Date.now() - 259200000,
    favorite: true,
    quality: 'ultra',
    generationTime: 120,
  },
];

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
};

export function GenerationHistory({
  generations = MOCK_GENERATIONS,
  onPlay,
  onDownload,
  onDelete,
  onAddToSoundLab,
  onToggleFavorite,
  viewMode = 'grid',
}: GenerationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'favorite'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>(viewMode);

  // Get unique genres and moods
  const genres = useMemo(() => [...new Set(generations.map(g => g.genre))], [generations]);
  const moods = useMemo(() => [...new Set(generations.map(g => g.mood))], [generations]);

  // Filter and sort
  const filteredGenerations = useMemo(() => {
    let filtered = generations;

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g =>
        g.prompt.toLowerCase().includes(query) ||
        g.genre.toLowerCase().includes(query) ||
        g.mood.toLowerCase().includes(query)
      );
    }

    // Genre
    if (selectedGenre) {
      filtered = filtered.filter(g => g.genre === selectedGenre);
    }

    // Mood
    if (selectedMood) {
      filtered = filtered.filter(g => g.mood === selectedMood);
    }

    // Favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(g => g.favorite);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'favorite') {
      filtered.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    }

    return filtered;
  }, [generations, searchQuery, selectedGenre, selectedMood, showFavoritesOnly, sortBy]);

  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredGenerations.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedGenerations = filteredGenerations.slice(startIdx, startIdx + itemsPerPage);

  const handleToggleFavorite = (id: string, current: boolean) => {
    if (onToggleFavorite) {
      onToggleFavorite(id, !current);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Generation History
        </label>
        <p className="text-xs text-wise-text-muted">
          Browse, search, and manage all your generated tracks.
        </p>
      </div>

      {/* Search and Controls */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wise-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by prompt, genre, mood..."
            className="w-full pl-10 pr-4 py-2 bg-studio-input border border-studio-line rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition"
          />
        </div>

        {/* Filters and Options */}
        <div className="flex flex-wrap gap-2">
          {/* Genre Filter */}
          {genres.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-studio-input border border-studio-line rounded-lg text-sm hover:border-wise-accent transition">
                <Filter className="w-4 h-4" />
                Genre
              </button>
              <div className="absolute top-full mt-1 left-0 hidden group-hover:flex flex-col bg-studio-raised border border-studio-line rounded-lg z-10 min-w-max">
                <button
                  onClick={() => {
                    setSelectedGenre(null);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 text-sm text-left hover:bg-studio-input transition ${!selectedGenre ? 'bg-studio-input text-wise-accent' : 'text-wise-text-primary'}`}
                >
                  All Genres
                </button>
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => {
                      setSelectedGenre(genre);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 text-sm text-left hover:bg-studio-input transition whitespace-nowrap ${selectedGenre === genre ? 'bg-studio-input text-wise-accent' : 'text-wise-text-primary'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mood Filter */}
          {moods.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-studio-input border border-studio-line rounded-lg text-sm hover:border-wise-accent transition">
                <Filter className="w-4 h-4" />
                Mood
              </button>
              <div className="absolute top-full mt-1 left-0 hidden group-hover:flex flex-col bg-studio-raised border border-studio-line rounded-lg z-10 min-w-max">
                <button
                  onClick={() => {
                    setSelectedMood(null);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 text-sm text-left hover:bg-studio-input transition ${!selectedMood ? 'bg-studio-input text-wise-accent' : 'text-wise-text-primary'}`}
                >
                  All Moods
                </button>
                {moods.map(mood => (
                  <button
                    key={mood}
                    onClick={() => {
                      setSelectedMood(mood);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-2 text-sm text-left hover:bg-studio-input transition whitespace-nowrap ${selectedMood === mood ? 'bg-studio-input text-wise-accent' : 'text-wise-text-primary'}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Toggle */}
          <button
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border ${
              showFavoritesOnly
                ? 'bg-yellow-600 bg-opacity-20 border-yellow-600 text-yellow-400'
                : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
            }`}
          >
            <Star className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            Favorites
          </button>

          {/* Sort */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-studio-input border border-studio-line rounded-lg text-sm hover:border-wise-accent transition">
              <Clock className="w-4 h-4" />
              Sort
            </button>
            <div className="absolute top-full mt-1 right-0 hidden group-hover:flex flex-col bg-studio-raised border border-studio-line rounded-lg z-10">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 py-2 text-sm text-left hover:bg-studio-input transition ${sortBy === 'recent' ? 'bg-studio-input text-wise-accent' : 'text-wise-text-primary'}`}
              >
                Most Recent
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-3 py-2 text-sm text-left hover:bg-studio-input transition ${sortBy === 'oldest' ? 'bg-studio-input text-wise-accent' : 'text-wise-text-primary'}`}
              >
                Oldest
              </button>
              <button
                onClick={() => setSortBy('favorite')}
                className={`px-3 py-2 text-sm text-left hover:bg-studio-input transition ${sortBy === 'favorite' ? 'bg-studio-input text-wise-accent' : 'text-wise-text-primary'}`}
              >
                Favorites First
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-wise-text-muted">
          {filteredGenerations.length} results
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Grid/List View */}
      {paginatedGenerations.length > 0 ? (
        <motion.div
          layout
          className={displayMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-2'}
        >
          <AnimatePresence>
            {paginatedGenerations.map((gen, idx) => (
              <motion.div
                key={gen.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative rounded-lg border border-studio-line bg-studio-input overflow-hidden group hover:border-wise-accent transition ${displayMode === 'list' ? 'p-3 flex items-start justify-between gap-3' : 'p-4'}`}
              >
                {displayMode === 'grid' ? (
                  // Grid Card
                  <>
                    {/* Waveform Placeholder */}
                    <div className="w-full h-32 bg-studio-raised rounded mb-3 flex items-center justify-center text-wise-text-muted opacity-50">
                      🎵
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-wise-text-primary line-clamp-2">{gen.prompt}</p>
                      <div className="flex gap-1.5">
                        <span className="text-xs px-2 py-0.5 bg-studio-line rounded text-wise-accent">{gen.genre}</span>
                        <span className="text-xs px-2 py-0.5 bg-studio-line rounded text-wise-accent">{gen.mood}</span>
                      </div>
                      <p className="text-xs text-wise-text-muted">{formatDate(gen.createdAt)} • {formatDuration(gen.duration)}</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onPlay?.(gen.id, gen.audioUrl)}
                        className="flex-1 py-1.5 bg-wise-accent text-black rounded text-sm font-semibold hover:bg-wise-accent-bright transition flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Play
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(gen.id, gen.favorite)}
                        className={`p-1.5 rounded transition ${gen.favorite ? 'bg-yellow-600 text-white' : 'bg-studio-line text-wise-text-muted hover:text-wise-accent'}`}
                      >
                        <Star className="w-4 h-4" fill={gen.favorite ? 'currentColor' : 'none'} />
                      </button>
                      {onDownload && (
                        <button
                          onClick={() => onDownload(gen.id, gen.audioUrl, gen.prompt)}
                          className="p-1.5 bg-studio-line hover:border-wise-accent rounded transition text-wise-text-primary hover:text-wise-accent border border-studio-line"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Favorite Badge */}
                    {gen.favorite && (
                      <div className="absolute top-3 right-3">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                  </>
                ) : (
                  // List Item
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-wise-text-primary truncate">{gen.prompt}</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-studio-line rounded text-wise-accent">{gen.genre}</span>
                        <span className="text-xs px-2 py-0.5 bg-studio-line rounded text-wise-accent">{gen.mood}</span>
                        <span className="text-xs px-2 py-0.5 bg-studio-line rounded text-wise-text-muted">{formatDate(gen.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onPlay?.(gen.id, gen.audioUrl)}
                        className="p-2 bg-wise-accent text-black rounded hover:bg-wise-accent-bright transition"
                        title="Play"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(gen.id, gen.favorite)}
                        className={`p-2 rounded transition ${gen.favorite ? 'bg-yellow-600 text-white' : 'bg-studio-input text-wise-text-muted hover:text-wise-accent border border-studio-line'}`}
                        title="Favorite"
                      >
                        <Star className="w-4 h-4" fill={gen.favorite ? 'currentColor' : 'none'} />
                      </button>
                      {onDownload && (
                        <button
                          onClick={() => onDownload(gen.id, gen.audioUrl, gen.prompt)}
                          className="p-2 bg-studio-input hover:border-wise-accent rounded transition text-wise-text-primary hover:text-wise-accent border border-studio-line"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(gen.id)}
                          className="p-2 bg-studio-input hover:border-red-500 rounded transition text-wise-text-primary hover:text-red-400 border border-studio-line"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-wise-text-muted">No generations found</p>
          <p className="text-xs text-wise-text-muted mt-1">Try adjusting your filters or start creating music</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-studio-input border border-studio-line rounded hover:border-wise-accent disabled:opacity-50 text-wise-text-primary transition"
          >
            ← Prev
          </button>
          <span className="text-sm text-wise-text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-studio-input border border-studio-line rounded hover:border-wise-accent disabled:opacity-50 text-wise-text-primary transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
