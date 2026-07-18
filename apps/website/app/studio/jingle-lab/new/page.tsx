'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AppShell from '@/components/AppShell';
import { Sparkles, ChevronRight, ArrowLeft } from 'lucide-react';

const creationTypes = [
  {
    id: 'song',
    title: 'Full Song',
    description: 'Create a complete original song with vocals and instruments',
    icon: '🎵',
    tags: ['Popular', 'Professional'],
  },
  {
    id: 'jingle',
    title: 'Brand Jingle',
    description: 'Catchy, memorable audio that represents your brand',
    icon: '🎺',
    tags: ['Branding'],
  },
  {
    id: 'podcast',
    title: 'Podcast Intro/Outro',
    description: 'Professional audio for podcast episodes',
    icon: '🎙️',
    tags: ['Audio', 'Content'],
  },
  {
    id: 'commercial',
    title: 'Commercial Spot',
    description: '15-60 second audio for advertising',
    icon: '📢',
    tags: ['Marketing'],
  },
  {
    id: 'ambient',
    title: 'Ambient Music',
    description: 'Background music for videos, streams, or workspaces',
    icon: '☁️',
    tags: ['Background'],
  },
  {
    id: 'logo',
    title: 'Audio Logo',
    description: 'Distinctive sound that identifies your brand',
    icon: '◆',
    tags: ['Branding'],
  },
];

const moods = [
  'Happy', 'Sad', 'Energetic', 'Calm', 'Dramatic',
  'Playful', 'Dark', 'Hopeful', 'Aggressive', 'Melancholic',
  'Professional', 'Uplifting', 'Mysterious', 'Romantic', 'Corporate',
];

const genres = [
  'Electronic', 'Pop', 'Rock', 'Hip-Hop', 'Jazz',
  'Classical', 'R&B', 'Country', 'Latin', 'Ambient',
  'Experimental', 'Indie', 'Corporate', 'World', 'Orchestral',
];

export default function NewJinglePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mood: 'Energetic',
    genre: 'Electronic',
    duration: 30,
    useVocals: true,
  });

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setStep('details');
  };

  const handleCreate = async () => {
    const projectData = {
      ...formData,
      type: selectedType,
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const { id } = await response.json();
        router.push(`/studio/jingle-lab/${id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const selectedTypeData = creationTypes.find(t => t.id === selectedType);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {step === 'type' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <Sparkles className="w-10 h-10 text-blue-400" />
                What would you like to create?
              </h1>
              <p className="text-gray-400">
                Choose a generation type to get started with your AI music creation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creationTypes.map((type, idx) => (
                <motion.button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left p-6 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg hover:border-blue-400/50 transition-all hover:shadow-lg hover:shadow-blue-500/20 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{type.icon}</span>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{type.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{type.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {type.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Back Button */}
            <button
              onClick={() => setStep('type')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{selectedTypeData?.icon}</span>
                <div>
                  <h1 className="text-4xl font-bold">{selectedTypeData?.title}</h1>
                  <p className="text-gray-400">{selectedTypeData?.description}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <motion.div
              className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-lg p-8 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Brand Jingle - WISE² Enterprise"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the style, vibe, or any specific instructions..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                />
              </div>

              {/* Genre & Mood */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                  >
                    {genres.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Mood</label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                  >
                    {moods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Duration: {formData.duration} seconds
                </label>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Vocals Toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useVocals}
                    onChange={(e) => setFormData({ ...formData, useVocals: e.target.checked })}
                    className="w-5 h-5 rounded bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                  <span className="text-white font-medium">Include vocals</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-700">
                <button
                  onClick={() => setStep('type')}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!formData.title}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/50"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Create & Generate
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
