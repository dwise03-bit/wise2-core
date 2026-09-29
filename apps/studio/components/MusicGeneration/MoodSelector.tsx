'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface MoodSelectorProps {
  value: string;
  onChange: (mood: string) => void;
  showPreviews?: boolean;
}

const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    description: 'Uplifting & joyful',
    color: 'from-yellow-500 to-orange-500',
    accentColor: '#FFD700',
    sample: '/samples/moods/happy.mp3',
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    description: 'Melancholic & reflective',
    color: 'from-blue-500 to-indigo-500',
    accentColor: '#4169E1',
    sample: '/samples/moods/sad.mp3',
  },
  {
    id: 'energetic',
    label: 'Energetic',
    emoji: '⚡',
    description: 'Dynamic & powerful',
    color: 'from-red-500 to-pink-500',
    accentColor: '#FF1744',
    sample: '/samples/moods/energetic.mp3',
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '😌',
    description: 'Relaxing & peaceful',
    color: 'from-cyan-500 to-blue-400',
    accentColor: '#00BCD4',
    sample: '/samples/moods/calm.mp3',
  },
  {
    id: 'dark',
    label: 'Dark',
    emoji: '🌑',
    description: 'Mysterious & intense',
    color: 'from-purple-900 to-black',
    accentColor: '#663399',
    sample: '/samples/moods/dark.mp3',
  },
  {
    id: 'uplifting',
    label: 'Uplifting',
    emoji: '✨',
    description: 'Inspiring & hopeful',
    color: 'from-green-400 to-cyan-500',
    accentColor: '#00FF00',
    sample: '/samples/moods/uplifting.mp3',
  },
  {
    id: 'melancholic',
    label: 'Melancholic',
    emoji: '🎻',
    description: 'Tender & emotional',
    color: 'from-slate-600 to-slate-800',
    accentColor: '#708090',
    sample: '/samples/moods/melancholic.mp3',
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    emoji: '🔥',
    description: 'Intense & bold',
    color: 'from-red-700 to-orange-600',
    accentColor: '#FF4500',
    sample: '/samples/moods/aggressive.mp3',
  },
];

export function MoodSelector({
  value,
  onChange,
  showPreviews = true,
}: MoodSelectorProps) {
  const [playingMood, setPlayingMood] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement | null>>({});

  // Initialize audio elements
  useEffect(() => {
    const audioMap: Record<string, HTMLAudioElement | null> = {};
    MOODS.forEach(mood => {
      const audio = new Audio(mood.sample);
      audio.volume = 0.5;
      audioMap[mood.id] = audio;
    });
    setAudioElements(audioMap);

    return () => {
      Object.values(audioMap).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const handlePlayPreview = async (moodId: string) => {
    if (playingMood === moodId) {
      // Stop playing
      const audio = audioElements[moodId];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingMood(null);
    } else {
      // Stop previous audio
      if (playingMood) {
        const prevAudio = audioElements[playingMood];
        if (prevAudio) {
          prevAudio.pause();
          prevAudio.currentTime = 0;
        }
      }

      // Play new audio
      const audio = audioElements[moodId];
      if (audio) {
        setPlayingMood(moodId);
        try {
          await audio.play();
          audio.onended = () => setPlayingMood(null);
        } catch (error) {
          console.error('Failed to play audio:', error);
          setPlayingMood(null);
        }
      }
    }
  };

  const selectedMood = MOODS.find(m => m.id === value);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Mood & Vibe
        </label>
        <p className="text-xs text-wise-text-muted">
          Choose the emotional tone of your track.
        </p>
      </div>

      {/* Selected Mood Display */}
      {selectedMood && (
        <motion.div
          layout
          className={`p-4 rounded-lg border-2 bg-gradient-to-br ${selectedMood.color} bg-opacity-10 border-opacity-30`}
          style={{ borderColor: selectedMood.accentColor }}
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedMood.emoji}</span>
            <div>
              <p className="font-bold text-wise-text-primary text-lg">{selectedMood.label}</p>
              <p className="text-sm text-wise-text-secondary">{selectedMood.description}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mood Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MOODS.map((mood, idx) => {
          const isSelected = value === mood.id;
          const isPlaying = playingMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => onChange(mood.id)}
              className={`group relative flex flex-col items-center justify-center p-4 rounded-lg transition border-2 ${
                isSelected
                  ? `bg-gradient-to-br ${mood.color} bg-opacity-20 border-opacity-100`
                  : 'bg-studio-input border-studio-line hover:border-opacity-50'
              }`}
              style={{
                borderColor: isSelected ? mood.accentColor : undefined,
              }}
            >
              {/* Glow Effect on Hover */}
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition blur-lg"
                style={{ backgroundColor: mood.accentColor }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                <span className="text-3xl md:text-4xl transition group-hover:scale-110">
                  {mood.emoji}
                </span>
                <p className="font-semibold text-sm text-wise-text-primary">{mood.label}</p>
                <p className="text-xs text-wise-text-muted line-clamp-1">{mood.description}</p>

                {/* Preview Button */}
                {showPreviews && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={e => {
                      e.stopPropagation();
                      handlePlayPreview(mood.id);
                    }}
                    className={`mt-2 p-1.5 rounded transition ${
                      isPlaying
                        ? 'bg-wise-accent text-black'
                        : 'bg-studio-line text-wise-text-muted hover:text-wise-accent'
                    }`}
                    title={isPlaying ? 'Stop preview' : 'Play preview'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="moodSelector"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-wise-accent"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Mood Description */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-studio-input border border-studio-line rounded-lg"
        >
          <p className="text-sm text-wise-text-secondary">
            <strong>{selectedMood.label} tracks</strong> typically feature
            {selectedMood.id === 'happy' && ' bright melodies, major keys, and uplifting instrumentation.'}
            {selectedMood.id === 'sad' && ' minor keys, slow tempos, and emotional instrumental arrangements.'}
            {selectedMood.id === 'energetic' && ' fast tempos, driving beats, and powerful dynamics.'}
            {selectedMood.id === 'calm' && ' slower tempos, soft tones, and soothing textures.'}
            {selectedMood.id === 'dark' && ' minor keys, deep bass, and mysterious atmospheres.'}
            {selectedMood.id === 'uplifting' && ' major keys, inspiring melodies, and positive energy.'}
            {selectedMood.id === 'melancholic' && ' emotional depth, introspective melodies, and tender arrangements.'}
            {selectedMood.id === 'aggressive' && ' intense rhythms, heavy instrumentation, and bold dynamics.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
