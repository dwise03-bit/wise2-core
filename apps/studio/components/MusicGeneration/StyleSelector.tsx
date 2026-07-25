'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, X, Grid3x3, List } from 'lucide-react';

interface StyleSelectorProps {
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
  favorites?: string[];
  onFavoritesChange?: (favorites: string[]) => void;
}

const GENRE_CATEGORIES = {
  'Pop': ['Pop', 'K-Pop', 'J-Pop', 'Disco Pop', 'Dance-Pop', 'Pop Punk', 'Synth-Pop', 'Teen Pop'],
  'Electronic': ['EDM', 'Synthwave', 'Techno', 'House', 'Drum & Bass', 'Downtempo', 'Ambient', 'Chillwave', 'Liquid Funk'],
  'Hip-Hop': ['Trap', 'Boom Bap', 'Mumble Rap', 'Conscious Hip-Hop', 'Drill', 'Phonk', 'Emo Rap', 'UK Garage'],
  'Rock': ['Alternative Rock', 'Hard Rock', 'Indie Rock', 'Progressive Rock', 'Punk', 'Metal', 'Garage Rock', 'Grunge'],
  'Classical': ['Symphony', 'Chamber', 'Baroque', 'Romantic', 'Contemporary', 'Minimalist', 'Avant-Garde'],
  'Jazz': ['Bebop', 'Cool Jazz', 'Fusion', 'Smooth Jazz', 'Free Jazz', 'Hard Bop', 'Bossa Nova'],
  'Metal': ['Death Metal', 'Black Metal', 'Progressive Metal', 'Symphonic Metal', 'Doom Metal', 'Power Metal', 'Thrash Metal'],
  'Country': ['Outlaw Country', 'Honky-Tonk', 'Americana', 'Country Pop', 'Bluegrass', 'Folk Country'],
  'R&B': ['Contemporary R&B', 'Neo-Soul', 'Funk', 'Soul', 'Rhythm Blues', 'Quiet Storm'],
  'Reggae': ['Dancehall', 'Roots Reggae', 'Reggae Fusion', 'Dub', 'Ska', 'Reggaeton'],
  'Latin': ['Reggaeton', 'Salsa', 'Bachata', 'Cumbia', 'Mambo', 'Tango', 'Merengue'],
  'Ambient': ['Dark Ambient', 'Cinematic', 'Drone', 'Experimental', 'Space Ambient', 'Soundscape'],
  'Folk': ['Indie Folk', 'Traditional', 'Folk-Pop', 'Celtic', 'Norse Folk', 'Tribal'],
  'Anime': ['Anime OP', 'Anime ED', 'VTuber Music', 'J-Pop Anime', 'Vocaloid'],
  'Indie': ['Indie Rock', 'Indie Pop', 'Indie Folk', 'Lo-Fi Indie', 'Bedroom Pop'],
  'World': ['African', 'Indian', 'Japanese', 'Middle Eastern', 'Latin', 'Asian Fusion'],
  'Other': ['Experimental', 'Avant-Garde', 'Glitch', 'Noise', 'Musique Concrète', 'Field Recording'],
};

const GENRE_ICONS = {
  'Pop': '🎤',
  'Electronic': '🎛️',
  'Hip-Hop': '🎤',
  'Rock': '🎸',
  'Classical': '🎻',
  'Jazz': '🎷',
  'Metal': '🔥',
  'Country': '🎸',
  'R&B': '🎹',
  'Reggae': '🥁',
  'Latin': '💃',
  'Ambient': '🌌',
  'Folk': '🎸',
  'Anime': '⭐',
  'Indie': '🎵',
  'World': '🌍',
  'Other': '✨',
};

export function StyleSelector({
  selectedGenres,
  onGenresChange,
  favorites = [],
  onFavoritesChange,
}: StyleSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [customGenre, setCustomGenre] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(GENRE_CATEGORIES).slice(0, 3))
  );

  // Flatten all genres
  const allGenres = useMemo(() => {
    const genres: Array<{ name: string; category: string }> = [];
    Object.entries(GENRE_CATEGORIES).forEach(([category, items]) => {
      items.forEach(genre => {
        genres.push({ name: genre, category });
      });
    });
    return genres;
  }, []);

  // Filter genres based on search
  const filteredGenres = useMemo(() => {
    if (!searchQuery.trim()) return allGenres;
    const query = searchQuery.toLowerCase();
    return allGenres.filter(g =>
      g.name.toLowerCase().includes(query) ||
      g.category.toLowerCase().includes(query)
    );
  }, [searchQuery, allGenres]);

  const handleToggleGenre = useCallback((genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenresChange([...selectedGenres, genre]);
    }
  }, [selectedGenres, onGenresChange]);

  const handleToggleFavorite = useCallback((genre: string) => {
    if (!onFavoritesChange) return;
    if (favorites.includes(genre)) {
      onFavoritesChange(favorites.filter(f => f !== genre));
    } else {
      onFavoritesChange([...favorites, genre]);
    }
  }, [favorites, onFavoritesChange]);

  const handleAddCustomGenre = useCallback(() => {
    if (customGenre.trim() && !selectedGenres.includes(customGenre.trim())) {
      onGenresChange([...selectedGenres, customGenre.trim()]);
      setCustomGenre('');
    }
  }, [customGenre, selectedGenres, onGenresChange]);

  const handleToggleCategory = useCallback((category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  }, [expandedCategories]);

  const groupedResults = useMemo(() => {
    const grouped: Record<string, typeof filteredGenres> = {};
    filteredGenres.forEach(genre => {
      if (!grouped[genre.category]) grouped[genre.category] = [];
      grouped[genre.category].push(genre);
    });
    return grouped;
  }, [filteredGenres]);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Genre & Style
        </label>
        <p className="text-xs text-wise-text-muted">
          Select one or more genres to define your track's sound.
        </p>
      </div>

      {/* Search + View Mode */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wise-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search genres..."
            className="w-full pl-10 pr-4 py-2 bg-studio-input border border-studio-line rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-studio-input border border-studio-line rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition ${
              viewMode === 'grid'
                ? 'bg-wise-accent text-black'
                : 'text-wise-text-muted hover:text-wise-text-primary'
            }`}
            title="Grid view"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition ${
              viewMode === 'list'
                ? 'bg-wise-accent text-black'
                : 'text-wise-text-muted hover:text-wise-text-primary'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Genre Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customGenre}
          onChange={e => setCustomGenre(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAddCustomGenre()}
          placeholder="Add custom style..."
          className="flex-1 px-3 py-2 bg-studio-input border border-studio-line rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition text-sm"
        />
        <button
          onClick={handleAddCustomGenre}
          disabled={!customGenre.trim()}
          className="px-4 py-2 bg-studio-input border border-studio-line rounded-lg hover:border-wise-accent text-wise-text-primary transition disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Selected Genres Tags */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGenres.map(genre => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-wise-accent-dim to-wise-accent text-black rounded-full text-sm font-semibold"
            >
              {genre}
              <button
                onClick={() => handleToggleGenre(genre)}
                className="hover:opacity-70 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Genre List/Grid */}
      <div className="space-y-3">
        {viewMode === 'grid' ? (
          // Grid View with Categories
          Object.entries(groupedResults).map(([category, genres]) => (
            <div key={category} className="space-y-2">
              <button
                onClick={() => handleToggleCategory(category)}
                className="flex items-center gap-2 text-sm font-bold text-wise-text-secondary hover:text-wise-text-primary transition w-full"
              >
                <span className="text-lg">{GENRE_ICONS[category as keyof typeof GENRE_ICONS] || '🎵'}</span>
                {category}
                <span className="text-xs text-wise-text-muted ml-auto">({genres.length})</span>
              </button>

              <AnimatePresence>
                {expandedCategories.has(category) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-2 overflow-hidden"
                  >
                    {genres.map((genre, idx) => (
                      <motion.button
                        key={genre.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleToggleGenre(genre.name)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
                          selectedGenres.includes(genre.name)
                            ? 'bg-gradient-to-r from-wise-accent-dim to-wise-accent text-black border-wise-accent'
                            : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent hover:bg-studio-raised'
                        }`}
                      >
                        {genre.name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          // List View
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredGenres.map(genre => (
              <button
                key={`${genre.category}-${genre.name}`}
                onClick={() => handleToggleGenre(genre.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition border ${
                  selectedGenres.includes(genre.name)
                    ? 'bg-gradient-to-r from-wise-accent-dim to-wise-accent text-black border-wise-accent'
                    : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent hover:bg-studio-raised'
                }`}
              >
                <span>{genre.name}</span>
                <span className="text-xs text-wise-text-muted">{genre.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && onFavoritesChange && (
        <div className="pt-3 border-t border-studio-line">
          <p className="text-xs font-bold uppercase text-wise-text-muted mb-2">Favorites</p>
          <div className="flex flex-wrap gap-2">
            {favorites.slice(0, 5).map(genre => (
              <button
                key={genre}
                onClick={() => handleToggleGenre(genre)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition border ${
                  selectedGenres.includes(genre)
                    ? 'bg-wise-accent text-black border-wise-accent'
                    : 'bg-studio-input border-studio-line text-wise-text-primary hover:border-wise-accent'
                }`}
              >
                <Star className="w-3 h-3" />
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
