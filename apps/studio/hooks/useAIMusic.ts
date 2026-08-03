'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface MusicGenerationParams {
  prompt: string;
  genre: string;
  mood: string;
  tempo: number;
  instrument: string;
  duration: number;
}

export interface GeneratedTrack {
  id: string;
  prompt: string;
  genre: string;
  mood: string;
  tempo: number;
  instrument: string;
  url?: string;
  waveformData?: number[];
  createdAt: Date;
  status: 'generating' | 'complete' | 'failed';
  progress: number;
}

export interface MusicGenerationState {
  tracks: GeneratedTrack[];
  isGenerating: boolean;
  currentGeneration: GeneratedTrack | null;
  estimatedTime: number;
}

const GENRES = [
  'Electronic',
  'Hip-Hop',
  'Pop',
  'Rock',
  'Jazz',
  'Classical',
  'Ambient',
  'Lofi',
  'Synthwave',
];
const MOODS = ['Happy', 'Sad', 'Energetic', 'Calm', 'Mysterious', 'Aggressive', 'Dreamy'];
const INSTRUMENTS = ['Piano', 'Guitar', 'Drums', 'Synth', 'Strings', 'Brass', 'Bass'];

export const useAIMusic = () => {
  const [state, setState] = useState<MusicGenerationState>({
    tracks: [],
    isGenerating: false,
    currentGeneration: null,
    estimatedTime: 0,
  });

  const generationIntervalRef = useRef<NodeJS.Timeout>();
  const [error, setError] = useState<string | null>(null);

  // Generate waveform data (simulated)
  const generateWaveformData = useCallback((): number[] => {
    const data: number[] = [];
    for (let i = 0; i < 256; i++) {
      data.push(Math.random() * 100 - 50);
    }
    return data;
  }, []);

  // Generate music
  const generateMusic = useCallback(
    async (params: MusicGenerationParams) => {
      if (state.isGenerating) {
        setError('Already generating. Please wait.');
        return null;
      }

      try {
        setError(null);

        const newTrack: GeneratedTrack = {
          id: `track-${Date.now()}`,
          prompt: params.prompt,
          genre: params.genre,
          mood: params.mood,
          tempo: params.tempo,
          instrument: params.instrument,
          createdAt: new Date(),
          status: 'generating',
          progress: 0,
        };

        setState((prev) => ({
          ...prev,
          isGenerating: true,
          currentGeneration: newTrack,
          estimatedTime: 30 + Math.random() * 30, // 30-60 seconds
          tracks: [newTrack, ...prev.tracks],
        }));

        // Simulate generation progress
        let progress = 0;
        let generationTime = 30000; // 30 seconds

        generationIntervalRef.current = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;

            // Mark as complete
            setState((prev) => ({
              ...prev,
              tracks: prev.tracks.map((t) =>
                t.id === newTrack.id
                  ? {
                      ...t,
                      status: 'complete',
                      progress: 100,
                      waveformData: generateWaveformData(),
                      url: `data:audio/wav;base64,${Math.random().toString(36).slice(2)}`,
                    }
                  : t
              ),
              isGenerating: false,
              currentGeneration: null,
            }));

            if (generationIntervalRef.current) {
              clearInterval(generationIntervalRef.current);
            }
          } else {
            setState((prev) => ({
              ...prev,
              tracks: prev.tracks.map((t) =>
                t.id === newTrack.id ? { ...t, progress: Math.min(progress, 99) } : t
              ),
              currentGeneration: {
                ...newTrack,
                progress: Math.min(progress, 99),
              },
            }));
          }
        }, 500);

        return newTrack;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate music';
        setError(errorMsg);
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          currentGeneration: null,
        }));
        return null;
      }
    },
    [state.isGenerating, generateWaveformData]
  );

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (generationIntervalRef.current) {
      clearInterval(generationIntervalRef.current);
    }
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      currentGeneration: null,
      tracks: prev.tracks.map((t) =>
        t.status === 'generating' ? { ...t, status: 'failed' } : t
      ),
    }));
  }, []);

  // Delete track
  const deleteTrack = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== id),
    }));
  }, []);

  // Download track
  const downloadTrack = useCallback((id: string) => {
    const track = state.tracks.find((t) => t.id === id);
    if (track && track.url) {
      const a = document.createElement('a');
      a.href = track.url;
      a.download = `${track.genre}-${track.mood}-${track.instrument}.wav`;
      a.click();
    }
  }, [state.tracks]);

  // Batch generate
  const batchGenerate = useCallback(
    async (paramsList: MusicGenerationParams[]) => {
      const results = [];
      for (const params of paramsList) {
        const result = await generateMusic(params);
        if (result) results.push(result);
        // Wait between generations
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      return results;
    },
    [generateMusic]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (generationIntervalRef.current) {
        clearInterval(generationIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    generateMusic,
    cancelGeneration,
    deleteTrack,
    downloadTrack,
    batchGenerate,
    error,
    genres: GENRES,
    moods: MOODS,
    instruments: INSTRUMENTS,
  };
};
