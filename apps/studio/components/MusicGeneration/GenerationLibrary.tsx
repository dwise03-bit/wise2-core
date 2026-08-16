'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Star,
  Download,
  Play,
  Trash2,
  RefreshCw,
  Plus,
  ChevronDown,
  Filter,
  Calendar,
  Zap,
  Clock,
  Music,
  X,
} from 'lucide-react';
import { GeneratedTrack } from '@/types/aimusic';
import { MOODS, formatDuration } from '@/constants/musicGeneration';

/**
 * Music Generation Library & History
 * Comprehensive browser for generated music with search, filters, and actions
 */

// Types
type DateFilter = 'all' | '24h' | '1w' | '1m';
type SortOption = 'date-newest' | 'date-oldest' | 'quality' | 'duration';

interface FilterState {
  searchText: string;
  dateRange: DateFilter;
  genres: string[];
  moods: string[];
  durations: string[];
  status: string[];
  favorites: boolean;
}

interface GenerationLibraryProps {
  generations: GeneratedTrack[];
  onPlayGeneration: (track: GeneratedTrack) => void;
  onDeleteGeneration: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
  onRemixGeneration: (trackId: string) => void;
  onExportGeneration: (trackId: string, format: 'mp3' | 'wav' | 'flac' | 'opus' | 'ogg') => void;
  onAddToSoundLab: (trackId: string) => void;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Constants
const DURATION_FILTERS = [
  { id: 'short', label: 'Under 30s', min: 0, max: 30 },
  { id: 'medium', label: '30s - 1m', min: 30, max: 60 },
  { id: 'long', label: '1m+', min: 60, max: Infinity },
];

const STATUS_OPTIONS = [
  { id: 'complete', label: '✓ Ready', color: 'text-green-400' },
  { id: 'generating', label: '⏳ Generating', color: 'text-yellow-400' },
  { id: 'queued', label: '⏳ Queued', color: 'text-blue-400' },
  { id: 'failed', label: '✗ Failed', color: 'text-red-400' },
];

const EXPORT_FORMATS = ['MP3', 'WAV', 'FLAC', 'OPUS', 'OGG'] as const;

// Utility Functions
function getDateRangeFilter(dateRange: DateFilter): Date {
  const now = new Date();
  switch (dateRange) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '1w':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '1m':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0);
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function generateWaveformPath(height: number, samples: number = 100): string {
  const width = samples * 4;
  const mid = height / 2;
  let path = `M0,${mid}`;

  for (let i = 0; i < samples; i++) {
    const x = (i / samples) * width;
    const y = mid + (Math.random() - 0.5) * height;
    path += ` L${x},${y}`;
  }

  return path;
}

export default function GenerationLibrary({
  generations,
  onPlayGeneration,
  onDeleteGeneration,
  onToggleFavorite,
  onRemixGeneration,
  onExportGeneration,
  onAddToSoundLab,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}: GenerationLibraryProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    dateRange: 'all',
    genres: [],
    moods: [],
    durations: [],
    status: [],
    favorites: false,
  });

  const [sortBy, setSortBy] = useState<SortOption>('date-newest');
  const [selectedGeneration, setSelectedGeneration] = useState<GeneratedTrack | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<string | null>(null);

  // Get unique genres from generations
  const availableGenres = useMemo(() => {
    return Array.from(new Set(generations.map(g => g.genre))).sort();
  }, [generations]);

  // Filter and sort generations
  const filteredGenerations = useMemo(() => {
    let result = generations;

    // Text search
    if (filters.searchText) {
      const query = filters.searchText.toLowerCase();
      result = result.filter(
        g =>
          g.title?.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query) ||
          g.prompt.toLowerCase().includes(query)
      );
    }

    // Date range
    if (filters.dateRange !== 'all') {
      const cutoff = getDateRangeFilter(filters.dateRange);
      result = result.filter(g => new Date(g.createdAt) >= cutoff);
    }

    // Genre filter
    if (filters.genres.length > 0) {
      result = result.filter(g => filters.genres.includes(g.genre));
    }

    // Mood filter
    if (filters.moods.length > 0) {
      result = result.filter(g => filters.moods.includes(g.mood));
    }

    // Duration filter
    if (filters.durations.length > 0) {
      result = result.filter(g => {
        return filters.durations.some(durationId => {
          const dur = DURATION_FILTERS.find(d => d.id === durationId);
          if (!dur) return false;
          return g.duration >= dur.min && g.duration <= dur.max;
        });
      });
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(g => filters.status.includes(g.status));
    }

    // Favorites filter
    if (filters.favorites) {
      result = result.filter(g => g.isFavorite);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'quality':
          // Sort by progress (quality indication)
          return b.progress - a.progress;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    return result;
  }, [generations, filters, sortBy]);

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: any) => {
      setFilters(prev => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleToggleFilter = useCallback(
    (key: 'genres' | 'moods' | 'durations' | 'status', value: string) => {
      setFilters(prev => ({
        ...prev,
        [key]: prev[key].includes(value)
          ? prev[key].filter(v => v !== value)
          : [...prev[key], value],
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      searchText: '',
      dateRange: 'all',
      genres: [],
      moods: [],
      durations: [],
      status: [],
      favorites: false,
    });
  }, []);

  const hasActiveFilters =
    filters.searchText ||
    filters.dateRange !== 'all' ||
    filters.genres.length > 0 ||
    filters.moods.length > 0 ||
    filters.durations.length > 0 ||
    filters.status.length > 0 ||
    filters.favorites;

  if (generations.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
            <Music className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Generations Yet</h3>
          <p className="text-slate-400 mb-6">
            Generate your first track using the prompt builder to get started!
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
            <Plus className="inline-block mr-2 w-4 h-4" />
            Create First Generation
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-950 text-white overflow-hidden">
      {/* Left Sidebar - Filters */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-72 border-r border-slate-700 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by prompt..."
                value={filters.searchText}
                onChange={e => handleFilterChange('searchText', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Quick Filters</label>
            <div className="space-y-2">
              <button
                onClick={() => handleFilterChange('favorites', !filters.favorites)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  filters.favorites
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Star className="inline-block w-4 h-4 mr-2" />
                Favorites
              </button>
              <button
                onClick={() => handleFilterChange('status', ['complete'])}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  filters.status.includes('complete')
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Ready to Use
              </button>
              <button
                onClick={() => handleFilterChange('status', ['generating', 'queued'])}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  filters.status.includes('generating')
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                In Progress
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={filters.dateRange}
                onChange={e => handleFilterChange('dateRange', e.target.value as DateFilter)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="1w">Last Week</option>
                <option value="1m">Last Month</option>
              </select>
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Genres</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableGenres.map(genre => (
                <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.genres.includes(genre)}
                    onChange={() => handleToggleFilter('genres', genre)}
                    className="w-4 h-4 bg-slate-800 border-slate-600 rounded accent-cyan-500"
                  />
                  <span className="text-sm text-slate-300">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mood Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Moods</label>
            <div className="space-y-2">
              {MOODS.map(mood => (
                <label key={mood.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.moods.includes(mood.id)}
                    onChange={() => handleToggleFilter('moods', mood.id)}
                    className="w-4 h-4 bg-slate-800 border-slate-600 rounded accent-cyan-500"
                  />
                  <span className="text-sm text-slate-300">
                    {mood.emoji} {mood.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Duration</label>
            <div className="space-y-2">
              {DURATION_FILTERS.map(dur => (
                <label key={dur.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.durations.includes(dur.id)}
                    onChange={() => handleToggleFilter('durations', dur.id)}
                    className="w-4 h-4 bg-slate-800 border-slate-600 rounded accent-cyan-500"
                  />
                  <span className="text-sm text-slate-300">{dur.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Status</label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(status => (
                <label key={status.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status.id)}
                    onChange={() => handleToggleFilter('status', status.id)}
                    className="w-4 h-4 bg-slate-800 border-slate-600 rounded accent-cyan-500"
                  />
                  <span className={`text-sm ${status.color}`}>{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-all"
            >
              <X className="inline-block w-4 h-4 mr-2" />
              Clear Filters
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Generation Library</h2>
              <p className="text-slate-400 text-sm mt-1">
                {filteredGenerations.length} generations
                {hasActiveFilters && ` (filtered)`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="date-newest">Newest First</option>
                  <option value="date-oldest">Oldest First</option>
                  <option value="quality">Highest Quality</option>
                  <option value="duration">Longest Duration</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grid View */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence>
            {filteredGenerations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <Filter className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400">No generations match your filters</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGenerations.map((generation, idx) => (
                  <GenerationCard
                    key={generation.id}
                    generation={generation}
                    isSelected={selectedGeneration?.id === generation.id}
                    onSelect={() => setSelectedGeneration(generation)}
                    onPlay={() => onPlayGeneration(generation)}
                    onDelete={() => onDeleteGeneration(generation.id)}
                    onToggleFavorite={() => onToggleFavorite(generation.id)}
                    onRemix={() => onRemixGeneration(generation.id)}
                    onExport={(format) => onExportGeneration(generation.id, format)}
                    onAddToSoundLab={() => onAddToSoundLab(generation.id)}
                    showExportMenu={showExportMenu === generation.id}
                    setShowExportMenu={setShowExportMenu}
                    index={idx}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Load More Button */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-8"
            >
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 rounded-lg font-semibold text-white transition-all"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Details Panel */}
      <AnimatePresence>
        {selectedGeneration && (
          <DetailsPanel
            generation={selectedGeneration}
            onClose={() => setSelectedGeneration(null)}
            onPlay={() => onPlayGeneration(selectedGeneration)}
            onToggleFavorite={() => onToggleFavorite(selectedGeneration.id)}
            onRemix={() => onRemixGeneration(selectedGeneration.id)}
            onDelete={() => {
              onDeleteGeneration(selectedGeneration.id);
              setSelectedGeneration(null);
            }}
            onExport={(format) => onExportGeneration(selectedGeneration.id, format)}
            onAddToSoundLab={() => onAddToSoundLab(selectedGeneration.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Generation Card Component
 */
interface GenerationCardProps {
  generation: GeneratedTrack;
  isSelected: boolean;
  onSelect: () => void;
  onPlay: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onRemix: () => void;
  onExport: (format: 'mp3' | 'wav' | 'flac' | 'opus' | 'ogg') => void;
  onAddToSoundLab: () => void;
  showExportMenu: boolean;
  setShowExportMenu: (id: string | null) => void;
  index: number;
}

function GenerationCard({
  generation,
  isSelected,
  onSelect,
  onPlay,
  onDelete,
  onToggleFavorite,
  onRemix,
  onExport,
  onAddToSoundLab,
  showExportMenu,
  setShowExportMenu,
  index,
}: GenerationCardProps) {
  const moodData = MOODS.find(m => m.id === generation.mood);
  const statusIcon = {
    complete: '✓',
    generating: '⏳',
    queued: '⏳',
    failed: '✗',
  }[generation.status];

  const statusColor = {
    complete: 'text-green-400',
    generating: 'text-yellow-400',
    queued: 'text-blue-400',
    failed: 'text-red-400',
  }[generation.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20'
          : 'hover:shadow-lg hover:shadow-cyan-500/20'
      }`}
    >
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-4 space-y-3">
        {/* Waveform Background */}
        <div className="relative h-12 bg-slate-700/30 rounded-lg overflow-hidden">
          <svg
            viewBox={`0 0 ${100 * 4} 48`}
            className="w-full h-full opacity-60"
            preserveAspectRatio="none"
          >
            <path
              d={generateWaveformPath(48)}
              stroke="url(#waveGradient)"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Play Button Overlay */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={e => {
              e.stopPropagation();
              onPlay();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-6 h-6 text-white fill-white" />
          </motion.button>
        </div>

        {/* Title & Metadata */}
        <div>
          <h3 className="font-semibold text-white truncate text-sm">
            {generation.title || generation.prompt.substring(0, 50)}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2">
              {moodData && (
                <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">
                  {moodData.emoji} {generation.mood}
                </span>
              )}
              <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">
                {generation.genre}
              </span>
            </div>
            <span className={`text-xs font-medium ${statusColor}`}>{statusIcon}</span>
          </div>
        </div>

        {/* Duration & Date */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(generation.duration)}
          </span>
          <span>{formatRelativeDate(generation.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
              generation.isFavorite
                ? 'bg-yellow-600/50 text-yellow-300'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Star className="w-3 h-3 inline-block mr-1" />
            Star
          </motion.button>
          <div className="relative flex-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={e => {
                e.stopPropagation();
                setShowExportMenu(showExportMenu ? null : generation.id);
              }}
              className="w-full px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
            >
              <Download className="w-3 h-3 inline-block mr-1" />
              Export
            </motion.button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 w-32"
                  onClick={e => e.stopPropagation()}
                >
                  {EXPORT_FORMATS.map(format => (
                    <button
                      key={format}
                      onClick={() => {
                        onExport(format.toLowerCase() as any);
                        setShowExportMenu(null);
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-slate-700 text-slate-300 first:rounded-t-lg last:rounded-b-lg transition-all"
                    >
                      {format}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Favorite Badge */}
      {generation.isFavorite && (
        <div className="absolute top-2 right-2 text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Details Panel - Right Sidebar
 */
interface DetailsPanelProps {
  generation: GeneratedTrack;
  onClose: () => void;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onRemix: () => void;
  onDelete: () => void;
  onExport: (format: 'mp3' | 'wav' | 'flac' | 'opus' | 'ogg') => void;
  onAddToSoundLab: () => void;
}

function DetailsPanel({
  generation,
  onClose,
  onPlay,
  onToggleFavorite,
  onRemix,
  onDelete,
  onExport,
  onAddToSoundLab,
}: DetailsPanelProps) {
  const moodData = MOODS.find(m => m.id === generation.mood);

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      className="w-80 border-l border-slate-700 bg-slate-900/50 backdrop-blur-sm overflow-y-auto flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-slate-700 p-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Details</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Waveform */}
        <div>
          <div className="h-16 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-4">
            <svg
              viewBox="0 0 400 64"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                d={generateWaveformPath(64)}
                stroke="url(#waveGradient2)"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              <defs>
                <linearGradient
                  id="waveGradient2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Play Controls */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlay}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 rounded-lg font-semibold text-white transition-all"
          >
            <Play className="w-4 h-4 inline-block mr-2 fill-current" />
            Play
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFavorite}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              generation.isFavorite
                ? 'bg-yellow-600/50 text-yellow-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
          </motion.button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
            Title
          </label>
          <p className="text-white font-semibold break-words">
            {generation.title || '(Untitled)'}
          </p>
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
            Prompt
          </label>
          <p className="text-sm text-slate-300 leading-relaxed break-words">
            {generation.prompt}
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Genre
            </label>
            <p className="text-white">{generation.genre}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Mood
            </label>
            <p className="text-white">
              {moodData && `${moodData.emoji} `}
              {generation.mood}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Duration
            </label>
            <p className="text-white">{formatDuration(generation.duration)}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Tempo
            </label>
            <p className="text-white">{generation.tempo} BPM</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Created
            </label>
            <p className="text-white">{new Date(generation.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Instruments */}
        {generation.instruments.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
              Instruments
            </label>
            <div className="flex flex-wrap gap-2">
              {generation.instruments.map(inst => (
                <span
                  key={inst}
                  className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status & Progress */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
            Status
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                {generation.status === 'complete'
                  ? '✓ Ready'
                  : generation.status === 'generating'
                    ? '⏳ Generating'
                    : (generation.status as any) === 'queued'
                      ? '⏳ Queued'
                      : '✗ Failed'}
              </span>
              <span className="text-sm text-slate-400">{generation.progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${generation.progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-slate-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRemix}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Remix
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddToSoundLab}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Sound Lab
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onExport('mp3')}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export (MP3)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDelete}
            className="w-full px-4 py-2 bg-red-900/20 hover:bg-red-900/30 rounded-lg font-medium text-red-400 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
