'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid3x3,
  List,
  Star,
  Download,
  Plus,
  Filter,
  X,
  Music,
} from 'lucide-react';
import { SunoGeneration, SunoLibraryFilters, SunoGenre, SunoMood } from '../../types/suno';

interface SunoLibraryProps {
  generations: SunoGeneration[];
  onAddToSoundLab?: (generation: SunoGeneration) => void;
  onExport?: (generation: SunoGeneration, format: 'mp3' | 'wav' | 'flac') => Promise<void>;
  isLoading?: boolean;
}

export function SunoLibrary({
  generations,
  onAddToSoundLab,
  onExport,
  isLoading = false,
}: SunoLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SunoLibraryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(generations.filter((g) => g.isFavorite).map((g) => g.id))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter and search logic
  const filtered = useMemo(() => {
    let result = [...generations];

    // Search by prompt
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((g) =>
        g.params.prompt.toLowerCase().includes(query)
      );
    }

    // Filter by genres
    if (filters.genres && filters.genres.length > 0) {
      result = result.filter((g) => filters.genres!.includes(g.params.genre));
    }

    // Filter by moods
    if (filters.moods && filters.moods.length > 0) {
      result = result.filter((g) => filters.moods!.includes(g.params.mood));
    }

    // Filter by durations
    if (filters.durations && filters.durations.length > 0) {
      result = result.filter((g) => filters.durations!.includes(g.params.duration));
    }

    // Filter by status
    if (filters.statuses && filters.statuses.length > 0) {
      result = result.filter((g) => filters.statuses!.includes(g.status));
    }

    // Filter by favorites
    if (filters.favorites) {
      result = result.filter((g) => favorites.has(g.id));
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [generations, searchQuery, filters, favorites]);

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const genres = Array.from(new Set(generations.map((g) => g.params.genre)));
  const moods = Array.from(new Set(generations.map((g) => g.params.mood)));
  const durations = Array.from(new Set(generations.map((g) => g.params.duration))).sort((a, b) => a - b);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-studio-panel to-studio-bg border border-wise-medium rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-wise-accent/20 rounded-lg">
            <Music className="w-5 h-5 text-wise-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-wise-text-primary">Suno Library</h2>
            <p className="text-sm text-wise-text-muted">
              {filtered.length} generation{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-wise-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search by prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-studio-input border border-wise-medium rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent focus:ring-1 focus:ring-wise-accent/50"
            />
          </div>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              showFilters
                ? 'bg-wise-accent text-studio-panel'
                : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-studio-input border border-wise-medium rounded-lg p-1">
            {(['grid', 'list'] as const).map((mode) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded transition ${
                  viewMode === mode
                    ? 'bg-wise-accent text-studio-panel'
                    : 'text-wise-text-muted hover:text-wise-text-primary'
                }`}
              >
                {mode === 'grid' ? (
                  <Grid3x3 className="w-4 h-4" />
                ) : (
                  <List className="w-4 h-4" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-studio-panel border border-wise-medium rounded-xl p-6 space-y-6"
          >
            {/* Genre Filter */}
            {genres.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-wise-text-primary">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <motion.button
                      key={genre}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const currentGenres = filters.genres || [];
                        const newGenres = currentGenres.includes(genre)
                          ? currentGenres.filter((g) => g !== genre)
                          : [...currentGenres, genre];
                        setFilters({ ...filters, genres: newGenres });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        filters.genres?.includes(genre)
                          ? 'bg-wise-accent text-studio-panel'
                          : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
                      }`}
                    >
                      {genre}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Filter */}
            {moods.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-wise-text-primary">Moods</label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const currentMoods = filters.moods || [];
                        const newMoods = currentMoods.includes(mood)
                          ? currentMoods.filter((m) => m !== mood)
                          : [...currentMoods, mood];
                        setFilters({ ...filters, moods: newMoods });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        filters.moods?.includes(mood)
                          ? 'bg-wise-accent text-studio-panel'
                          : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
                      }`}
                    >
                      {mood}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Filter */}
            {durations.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-wise-text-primary">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {durations.map((duration) => (
                    <motion.button
                      key={duration}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const currentDurations = filters.durations || [];
                        const newDurations = currentDurations.includes(duration)
                          ? currentDurations.filter((d) => d !== duration)
                          : [...currentDurations, duration];
                        setFilters({ ...filters, durations: newDurations });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        filters.durations?.includes(duration)
                          ? 'bg-wise-accent text-studio-panel'
                          : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
                      }`}
                    >
                      {duration}s
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {Object.keys(filters).length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilters({})}
                className="w-full py-2 px-4 bg-studio-input border border-wise-medium rounded-lg text-sm font-semibold text-wise-text-secondary hover:text-wise-text-primary transition"
              >
                Clear All Filters
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((generation) => (
              <motion.div
                key={generation.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-studio-panel border border-wise-medium rounded-lg overflow-hidden hover:border-wise-accent transition cursor-pointer group"
                onClick={() => setExpandedId(expandedId === generation.id ? null : generation.id)}
              >
                {/* Waveform Placeholder */}
                <div className="h-24 bg-gradient-to-br from-studio-input to-studio-line flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-wise-accent rounded-full"
                        style={{
                          height: `${20 + Math.random() * 60}%`,
                          opacity: 0.3 + Math.random() * 0.7,
                        }}
                      />
                    ))}
                  </div>
                  <div className="relative z-10 text-center">
                    <Music className="w-8 h-8 text-wise-accent/50 mx-auto mb-1" />
                    <span className="text-xs text-wise-text-muted">{generation.params.duration}s</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-wise-text-primary truncate">
                        {generation.params.genre}
                      </p>
                      <p className="text-xs text-wise-text-muted truncate">
                        {generation.params.prompt}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(generation.id);
                      }}
                      className="flex-shrink-0 mt-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.has(generation.id)
                            ? 'fill-wise-accent text-wise-accent'
                            : 'text-wise-text-muted hover:text-wise-accent'
                        }`}
                      />
                    </motion.button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 text-xs rounded bg-wise-accent/20 text-wise-accent">
                      {generation.params.mood}
                    </span>
                    <span className="px-2 py-1 text-xs rounded bg-studio-input text-wise-text-muted">
                      {generation.params.tempo} BPM
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-1 rounded font-semibold ${
                        generation.status === 'Completed'
                          ? 'bg-wise-accent-green/20 text-wise-accent-green'
                          : generation.status === 'Failed'
                          ? 'bg-wise-accent-red/20 text-wise-accent-red'
                          : 'bg-studio-input text-wise-text-muted'
                      }`}
                    >
                      {generation.status}
                    </span>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedId === generation.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-wise-medium space-y-2"
                      >
                        <div className="flex gap-2">
                          {generation.status === 'Completed' && onAddToSoundLab && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToSoundLab(generation);
                              }}
                              className="flex-1 py-2 px-3 bg-wise-accent/20 border border-wise-accent rounded text-xs font-semibold text-wise-accent hover:bg-wise-accent/30 transition flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add to SoundLab
                            </motion.button>
                          )}
                          {generation.status === 'Completed' && onExport && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onExport(generation, 'mp3');
                              }}
                              className="flex-1 py-2 px-3 bg-studio-input border border-wise-medium rounded text-xs font-semibold text-wise-text-primary hover:border-wise-accent transition flex items-center justify-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Export
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((generation) => (
              <motion.div
                key={generation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-studio-panel border border-wise-medium rounded-lg p-4 hover:border-wise-accent transition cursor-pointer"
                onClick={() => setExpandedId(expandedId === generation.id ? null : generation.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <Music className="w-5 h-5 text-wise-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-wise-text-primary truncate">
                        {generation.params.prompt}
                      </p>
                      <p className="text-xs text-wise-text-muted">
                        {generation.params.genre} • {generation.params.mood} • {generation.params.tempo} BPM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {generation.status === 'Completed' && generation.audioUrl && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-wise-accent/20 rounded-lg transition"
                      >
                        <Music className="w-4 h-4 text-wise-accent" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(generation.id);
                      }}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favorites.has(generation.id)
                            ? 'fill-wise-accent text-wise-accent'
                            : 'text-wise-text-muted hover:text-wise-accent'
                        }`}
                      />
                    </motion.button>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        generation.status === 'Completed'
                          ? 'bg-wise-accent-green/20 text-wise-accent-green'
                          : generation.status === 'Failed'
                          ? 'bg-wise-accent-red/20 text-wise-accent-red'
                          : 'bg-studio-input text-wise-text-muted'
                      }`}
                    >
                      {generation.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-studio-panel border border-wise-medium rounded-xl p-12 text-center space-y-3"
        >
          <Music className="w-12 h-12 text-wise-text-muted mx-auto opacity-50" />
          <div>
            <h3 className="text-lg font-bold text-wise-text-primary">No Generations Found</h3>
            <p className="text-sm text-wise-text-muted">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start by creating a new generation above'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-studio-panel border border-wise-medium rounded-xl p-12 text-center"
        >
          <div className="inline-block">
            <div className="w-8 h-8 border-2 border-wise-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-wise-text-muted">Loading your library...</p>
        </motion.div>
      )}
    </motion.div>
  );
}
