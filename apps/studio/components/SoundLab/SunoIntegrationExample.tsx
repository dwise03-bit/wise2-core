/**
 * Suno Integration Example
 * Complete working example showing how to use all Suno components together
 *
 * USAGE:
 * Simply import and render this component to get a complete Suno music generation interface:
 *
 *   import { SunoIntegrationExample } from '@/components/SoundLab/SunoIntegrationExample';
 *
 *   export default function Page() {
 *     return <SunoIntegrationExample />;
 *   }
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSunoMusicGeneration } from '../../hooks/useSunoMusicGeneration';
import { SunoPromptBuilder } from './SunoPromptBuilder';
import { SunoGenerationQueue } from './SunoGenerationQueue';
import { SunoLibrary } from './SunoLibrary';
import { SunoTrackPreview } from './SunoTrackPreview';
import { SunoGeneration } from '../../types/suno';

type TabType = 'create' | 'queue' | 'library' | 'preview';

/**
 * Complete Suno music generation interface
 * Combines all components with state management and API integration
 */
export function SunoIntegrationExample() {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [selectedGeneration, setSelectedGeneration] = useState<SunoGeneration | null>(null);

  // Use the custom hook for state management
  const {
    generations,
    queue,
    currentGeneration,
    isLoading,
    error,
    generate,
    exportGeneration,
    retryGeneration,
    toggleFavorite,
    deleteGeneration,
    addToSoundLab,
  } = useSunoMusicGeneration({
    onGenerationStart: (generation) => {
      console.log('Generation started:', generation);
      setActiveTab('queue');
    },
    onGenerationComplete: (generation) => {
      console.log('Generation completed:', generation);
      setSelectedGeneration(generation);
      setActiveTab('preview');
    },
    onGenerationError: (error) => {
      console.error('Generation error:', error);
    },
  });

  const handleGenerate = async (params: Parameters<typeof generate>[0]) => {
    try {
      await generate(params);
    } catch (err) {
      console.error('Error generating music:', err);
    }
  };

  const handleExport = async (generation: SunoGeneration, format: 'mp3' | 'wav' | 'flac') => {
    try {
      await exportGeneration(generation.id, format);
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  const handleAddToSoundLab = async (generation: SunoGeneration) => {
    try {
      const result = await addToSoundLab(generation);
      console.log('Added to SoundLab:', result);
      // Show success toast/notification here
    } catch (err) {
      console.error('Error adding to SoundLab:', err);
    }
  };

  return (
    <div className="min-h-screen bg-studio-bg text-wise-text-primary overflow-x-hidden">
      {/* Hero Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-wise-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-wise-accent/50 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 backdrop-blur-md border-b border-wise-medium bg-studio-bg/80 z-40"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Suno Music Generator</h1>
                <p className="text-wise-text-muted mt-1">
                  Create unlimited AI-generated music with advanced controls
                </p>
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-wise-accent-red/20 border border-wise-accent-red text-wise-accent-red px-4 py-3 rounded-lg text-sm"
                >
                  {error.message}
                </motion.div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-4">
              {[
                { id: 'create', label: '✨ Create', icon: '✨' },
                { id: 'queue', label: `⏳ Queue${queue.length > 0 ? ` (${queue.length})` : ''}`, icon: '⏳' },
                { id: 'library', label: `📚 Library (${generations.length})`, icon: '📚' },
                { id: 'preview', label: '▶️ Preview', icon: '▶️', disabled: !selectedGeneration },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  disabled={tab.disabled}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'bg-wise-accent text-studio-panel'
                      : 'bg-studio-input border border-wise-medium text-wise-text-secondary hover:text-wise-text-primary disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Create Tab */}
          {activeTab === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SunoPromptBuilder onGenerate={handleGenerate} isLoading={isLoading} />
            </motion.div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SunoGenerationQueue
                queue={queue}
                currentGeneration={currentGeneration}
                recentGenerations={generations.filter(
                  (g) => g.status === 'Completed' || g.status === 'Failed'
                )}
                onRetry={retryGeneration}
              />
            </motion.div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SunoLibrary
                generations={generations}
                onAddToSoundLab={handleAddToSoundLab}
                onExport={handleExport}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && selectedGeneration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SunoTrackPreview
                generation={selectedGeneration}
                onRegenerate={() => handleGenerate(selectedGeneration.params)}
                onExport={(format) => handleExport(selectedGeneration, format)}
                onAddToSoundLab={() => handleAddToSoundLab(selectedGeneration)}
              />
            </motion.div>
          )}
        </main>

        {/* Footer Stats */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-wise-medium bg-studio-panel/50 backdrop-blur-md mt-20"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-wise-accent">
                  {generations.length}
                </p>
                <p className="text-sm text-wise-text-muted mt-2">Total Generations</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-wise-accent">
                  {generations.filter((g) => g.status === 'Completed').length}
                </p>
                <p className="text-sm text-wise-text-muted mt-2">Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-wise-accent">
                  {generations.reduce((sum, g) => sum + g.playCount, 0)}
                </p>
                <p className="text-sm text-wise-text-muted mt-2">Total Plays</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-wise-accent">
                  {generations.filter((g) => g.isFavorite).length}
                </p>
                <p className="text-sm text-wise-text-muted mt-2">Favorites</p>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default SunoIntegrationExample;
