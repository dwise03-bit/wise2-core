'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type Template = 'intro' | 'outro' | 'transition';
export type Mood = 'upbeat' | 'calm' | 'dramatic';

interface TemplateCardProps {
  template: Template;
  selected: boolean;
  onClick: () => void;
}

const TEMPLATE_CONFIG: Record<Template, { icon: string; label: string; description: string }> = {
  intro: {
    icon: '▶️',
    label: 'Intro',
    description: 'Perfect for podcast introductions',
  },
  outro: {
    icon: '⏹️',
    label: 'Outro',
    description: 'Conclusion and sign-off music',
  },
  transition: {
    icon: '⟿',
    label: 'Transition',
    description: 'Segment transitions and breaks',
  },
};

export function TemplateCard({ template, selected, onClick }: TemplateCardProps) {
  const config = TEMPLATE_CONFIG[template];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-6 rounded-2xl transition-all text-left ${
        selected
          ? 'bg-gradient-to-br from-purple-500/40 to-blue-500/40 border-2 border-purple-400 shadow-lg shadow-purple-500/50'
          : 'bg-purple-500/10 border-2 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20'
      }`}
    >
      <div className="text-3xl mb-3">{config.icon}</div>
      <h3 className="font-bold text-lg mb-1">{config.label}</h3>
      <p className="text-sm text-gray-300">{config.description}</p>

      {selected && (
        <motion.div
          layoutId="selectedBorder"
          className="absolute inset-0 rounded-2xl border-2 border-purple-400"
          transition={{ type: 'spring', bounce: 0.2 }}
        />
      )}
    </motion.button>
  );
}

interface MoodCardProps {
  mood: Mood;
  selected: boolean;
  onClick: () => void;
}

const MOOD_CONFIG: Record<Mood, { icon: string; label: string; description: string }> = {
  upbeat: {
    icon: '😊',
    label: 'Upbeat',
    description: 'Energetic and fun',
  },
  calm: {
    icon: '😌',
    label: 'Calm',
    description: 'Relaxed and soothing',
  },
  dramatic: {
    icon: '😲',
    label: 'Dramatic',
    description: 'Intense and impactful',
  },
};

export function MoodCard({ mood, selected, onClick }: MoodCardProps) {
  const config = MOOD_CONFIG[mood];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-6 rounded-2xl transition-all text-left ${
        selected
          ? 'bg-gradient-to-br from-blue-500/40 to-purple-500/40 border-2 border-blue-400 shadow-lg shadow-blue-500/50'
          : 'bg-blue-500/10 border-2 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/20'
      }`}
    >
      <div className="text-3xl mb-3">{config.icon}</div>
      <h3 className="font-bold text-lg mb-1">{config.label}</h3>
      <p className="text-sm text-gray-300">{config.description}</p>

      {selected && (
        <motion.div
          layoutId="selectedMood"
          className="absolute inset-0 rounded-2xl border-2 border-blue-400"
          transition={{ type: 'spring', bounce: 0.2 }}
        />
      )}
    </motion.button>
  );
}
