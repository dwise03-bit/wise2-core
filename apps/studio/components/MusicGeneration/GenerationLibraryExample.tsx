'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GenerationLibrary from './GenerationLibrary';
import { GeneratedTrack } from '@/types/aimusic';

/**
 * Example Integration of Generation Library
 * Shows how to use the component in your app with mock data and callbacks
 */

// Mock data generator
function generateMockGenerations(count: number = 12): GeneratedTrack[] {
  const genres = [
    'Electronic',
    'Hip-Hop',
    'Pop',
    'Rock',
    'Classical',
    'Jazz',
    'Ambient',
    'R&B',
  ];
  const moods = [
    'happy',
    'sad',
    'energetic',
    'calm',
    'dark',
    'uplifting',
    'melancholic',
    'aggressive',
  ];
  const instruments = [
    'drums',
    'bass',
    'piano',
    'guitar',
    'synth',
    'strings',
    'brass',
    'woodwinds',
    'vocals',
  ];

  const generations: GeneratedTrack[] = [];

  for (let i = 0; i < count; i++) {
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - Math.random() * 720); // Random up to 30 days ago

    generations.push({
      id: `gen-${i + 1}`,
      type: 'song',
      title: `Generated Track ${i + 1}`,
      description: `A wonderful track generated with AI music creation`,
      genre: genres[Math.floor(Math.random() * genres.length)],
      mood: moods[Math.floor(Math.random() * moods.length)] as any,
      tempo: Math.floor(Math.random() * 140 + 60), // 60-200 BPM
      timeSignature: '4/4',
      duration: Math.floor(Math.random() * 90 + 30), // 30-120 seconds
      instruments: [
        instruments[Math.floor(Math.random() * instruments.length)],
        instruments[Math.floor(Math.random() * instruments.length)],
        instruments[Math.floor(Math.random() * instruments.length)],
      ],
      lyrics: 'Generated lyrics would appear here...',
      prompt: `A ${moods[Math.floor(Math.random() * moods.length)]} ${genres[Math.floor(Math.random() * genres.length)]} track with great energy and smooth vibes`,
      url: `https://example.com/audio/${i + 1}.mp3`,
      waveformData: Array.from({ length: 100 }, () => Math.random()),
      createdAt,
      modifiedAt: createdAt,
      status: Math.random() > 0.1 ? 'complete' : Math.random() > 0.5 ? 'generating' : 'queued',
      progress: Math.random() > 0.1 ? 100 : Math.floor(Math.random() * 100),
      isFavorite: Math.random() > 0.8,
      tags: ['ai-generated', 'music', 'track'],
    });
  }

  return generations;
}

interface GenerationLibraryExampleProps {
  onGenerationLibraryOpen?: () => void;
}

export default function GenerationLibraryExample({
  onGenerationLibraryOpen,
}: GenerationLibraryExampleProps) {
  const [generations, setGenerations] = useState<GeneratedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Initialize with mock data
  useEffect(() => {
    setGenerations(generateMockGenerations(12));
    onGenerationLibraryOpen?.();
  }, [onGenerationLibraryOpen]);

  /**
   * Play a generation
   * In production, this would use your audio player component
   */
  const handlePlayGeneration = useCallback((track: GeneratedTrack) => {
    console.log('Playing generation:', track.id, track.title);

    // Example: Create and play audio
    if (track.url) {
      const audio = new Audio(track.url);
      audio.play().catch(err => console.error('Playback error:', err));
    }
  }, []);

  /**
   * Delete a generation
   * This removes it from the library
   */
  const handleDeleteGeneration = useCallback((trackId: string) => {
    console.log('Deleting generation:', trackId);
    setGenerations(prev => prev.filter(g => g.id !== trackId));

    // Optional: Show toast notification
    // toast.success('Generation deleted');
  }, []);

  /**
   * Toggle favorite status
   * This updates the isFavorite flag
   */
  const handleToggleFavorite = useCallback((trackId: string) => {
    console.log('Toggling favorite:', trackId);
    setGenerations(prev =>
      prev.map(g =>
        g.id === trackId ? { ...g, isFavorite: !g.isFavorite } : g
      )
    );
  }, []);

  /**
   * Remix a generation
   * This creates a new generation with the same settings
   */
  const handleRemixGeneration = useCallback((trackId: string) => {
    console.log('Remixing generation:', trackId);
    const generation = generations.find(g => g.id === trackId);

    if (generation) {
      // In production, this would:
      // 1. Pre-fill the prompt builder with same settings
      // 2. Allow user to make modifications
      // 3. Trigger new generation
      console.log('Remix settings:', {
        genre: generation.genre,
        mood: generation.mood,
        tempo: generation.tempo,
        duration: generation.duration,
        instruments: generation.instruments,
      });

      // Show prompt builder or remix modal
      // onShowRemixModal(generation);
    }
  }, [generations]);

  /**
   * Export a generation
   * Downloads the track in the specified format
   */
  const handleExportGeneration = useCallback(
    (trackId: string, format: 'mp3' | 'wav' | 'flac' | 'opus' | 'ogg') => {
      console.log('Exporting generation:', trackId, 'Format:', format);

      const generation = generations.find(g => g.id === trackId);
      if (generation) {
        // In production, this would:
        // 1. Convert to requested format if needed
        // 2. Trigger download
        // 3. Show download progress

        // Example download trigger:
        const link = document.createElement('a');
        link.href = generation.url || '';
        link.download = `${generation.title || 'generation'}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`Exported ${generation.title} as ${format}`);
      }
    },
    [generations]
  );

  /**
   * Add generation to Sound Lab
   * Converts the generation to a clip for editing
   */
  const handleAddToSoundLab = useCallback(
    (trackId: string) => {
      console.log('Adding to Sound Lab:', trackId);

      const generation = generations.find(g => g.id === trackId);
      if (generation) {
        // In production, this would:
        // 1. Create a new Clip from the generation
        // 2. Add it to the current project/timeline
        // 3. Switch to Sound Lab view
        // 4. Show success message

        const newClip = {
          id: `clip-${trackId}`,
          name: generation.title || 'Generated Clip',
          url: generation.url,
          duration: generation.duration,
          startTime: 0,
          endTime: generation.duration,
          source: 'generation-library',
          sourceId: trackId,
        };

        console.log('New clip created:', newClip);
        // dispatch({ type: 'ADD_CLIP', payload: newClip });
      }
    },
    [generations]
  );

  /**
   * Load more generations
   * Simulates pagination
   */
  const handleLoadMore = useCallback(() => {
    console.log('Loading more generations...');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newGenerations = generateMockGenerations(12);
      setGenerations(prev => [...prev, ...newGenerations]);
      setIsLoading(false);

      // Stop loading more after 2 loads (for demo)
      if (generations.length > 24) {
        setHasMore(false);
      }
    }, 1000);
  }, [generations.length]);

  return (
    <div className="w-full h-screen bg-slate-950">
      <GenerationLibrary
        generations={generations}
        onPlayGeneration={handlePlayGeneration}
        onDeleteGeneration={handleDeleteGeneration}
        onToggleFavorite={handleToggleFavorite}
        onRemixGeneration={handleRemixGeneration}
        onExportGeneration={handleExportGeneration}
        onAddToSoundLab={handleAddToSoundLab}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}

// INTEGRATION EXAMPLES:
// 1. Studio Page: Import GenerationLibrary in your main page component
// 2. State Management: Use Context API or Redux for generation state
// 3. API Integration: Fetch/update generations via backend endpoints
// See inline documentation above for usage patterns
