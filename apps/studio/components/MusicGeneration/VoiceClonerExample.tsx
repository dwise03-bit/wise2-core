'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VoiceCloner } from './VoiceCloner';

/**
 * VoiceCloner Component - Integration Example
 * Shows how to use VoiceCloner in the studio application
 *
 * Usage:
 * 1. Import the VoiceCloner component
 * 2. Include in your page or modal
 * 3. Handle voice selection/generation in parent component
 */

interface ClonedVoice {
  id: string;
  name: string;
  trainingStatus: 'queued' | 'processing' | 'ready' | 'failed';
}

/**
 * Example 1: Standalone Voice Cloner Page
 * Perfect for a dedicated voice cloning interface
 */
export function VoiceClonerPage() {
  return (
    <div className="min-h-screen bg-studio-bg">
      <div className="container mx-auto px-4 py-8">
        <VoiceCloner />
      </div>
    </div>
  );
}

/**
 * Example 2: Voice Cloner Modal
 * Embedded in music generation workflow
 */
interface VoiceClonerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSelected?: (voice: ClonedVoice) => void;
}

export function VoiceClonerModal({
  isOpen,
  onClose,
  onVoiceSelected,
}: VoiceClonerModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-studio-bg rounded-xl border border-wise-medium"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-studio-panel border-b border-wise-medium px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-wise-text-primary">Voice Cloning Studio</h2>
          <button
            onClick={onClose}
            className="text-wise-text-muted hover:text-wise-text-primary transition text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <VoiceCloner />
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Example 3: Music Generation Workflow
 * Integrates VoiceCloner with music generation
 */
export function MusicGenerationWithVoiceCloning() {
  const [showVoiceCloner, setShowVoiceCloner] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<ClonedVoice | null>(null);
  const [generatedMusic, setGeneratedMusic] = useState<any[]>([]);

  const handleVoiceSelected = (voice: ClonedVoice) => {
    setSelectedVoice(voice);
    setShowVoiceCloner(false);
  };

  return (
    <div className="min-h-screen bg-studio-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-wise-text-primary mb-2">
            AI Music Generation Studio
          </h1>
          <p className="text-wise-text-muted">
            Create music with custom cloned voices
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Voice Cloning Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 bg-studio-panel border border-wise-medium rounded-xl p-6 h-fit"
          >
            <h3 className="font-bold text-wise-text-primary mb-4">Voice Setup</h3>

            {selectedVoice ? (
              <div className="space-y-3">
                <div className="bg-studio-raised rounded-lg p-3">
                  <p className="text-xs text-wise-text-muted uppercase">Selected Voice</p>
                  <p className="font-semibold text-wise-text-primary">
                    {selectedVoice.name}
                  </p>
                  <p className="text-xs text-wise-accent-green mt-1">
                    ✓ {selectedVoice.trainingStatus === 'ready' ? 'Ready' : 'Training...'}
                  </p>
                </div>
                <button
                  onClick={() => setShowVoiceCloner(true)}
                  className="w-full px-4 py-2 rounded-lg bg-wise-surface-secondary hover:bg-wise-surface text-wise-text-primary font-semibold transition text-sm"
                >
                  Change Voice
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowVoiceCloner(true)}
                className="w-full px-4 py-3 rounded-lg bg-wise-accent text-studio-bg font-semibold hover:bg-wise-accent-bright transition"
              >
                Clone a Voice
              </button>
            )}
          </motion.div>

          {/* Music Generation Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-2 bg-studio-panel border border-wise-medium rounded-xl p-6"
          >
            <h3 className="font-bold text-wise-text-primary mb-4">Generate Music</h3>

            {selectedVoice ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-wise-text-primary mb-2">
                    Music Description
                  </label>
                  <textarea
                    placeholder="Describe the music you want to create..."
                    className="w-full px-4 py-3 rounded-lg bg-studio-input border border-wise-medium text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent resize-none h-24"
                  />
                </div>

                <button className="w-full px-6 py-3 rounded-lg bg-wise-accent text-studio-bg font-semibold hover:bg-wise-accent-bright transition">
                  Generate Music
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-wise-text-muted mb-4">
                  Clone a voice first to enable music generation
                </p>
                <button
                  onClick={() => setShowVoiceCloner(true)}
                  className="inline-flex px-6 py-2 rounded-lg bg-wise-primary text-white font-semibold hover:bg-wise-primary-hover transition"
                >
                  Get Started
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Generated Music Library */}
        {generatedMusic.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-studio-panel border border-wise-medium rounded-xl p-6"
          >
            <h3 className="font-bold text-wise-text-primary mb-4">Generated Music</h3>
            <div className="grid grid-cols-3 gap-4">
              {generatedMusic.map((track, idx) => (
                <div
                  key={idx}
                  className="bg-studio-raised rounded-lg p-4 border border-wise-medium hover:border-wise-accent/50 transition cursor-pointer"
                >
                  <div className="aspect-square bg-gradient-to-br from-wise-accent/20 to-wise-primary/20 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                  <p className="font-semibold text-wise-text-primary text-sm">
                    Track {idx + 1}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Voice Cloner Modal */}
      <VoiceClonerModal
        isOpen={showVoiceCloner}
        onClose={() => setShowVoiceCloner(false)}
        onVoiceSelected={handleVoiceSelected}
      />
    </div>
  );
}

/**
 * Example 4: Minimal Voice Cloner
 * Just the voice cloner component embedded
 */
export function MinimalVoiceCloner() {
  return (
    <div className="w-full">
      <VoiceCloner />
    </div>
  );
}

/**
 * Example 5: Voice Cloner with State Management
 * Handles voice library state and callbacks
 */
interface VoiceWithState {
  id: string;
  name: string;
  samples: number;
  trainingStatus: 'queued' | 'processing' | 'ready' | 'failed';
  qualityScore: number;
}

export function VoiceClonerWithState() {
  const [voices, setVoices] = useState<VoiceWithState[]>([]);
  const [activeVoice, setActiveVoice] = useState<string | null>(null);

  const handleVoiceTrained = (newVoice: VoiceWithState) => {
    setVoices((prev) => [...prev, newVoice]);
  };

  return (
    <div className="min-h-screen bg-studio-bg p-8">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-wise-text-primary mb-2">
            Voice Cloning Studio
          </h1>
          <p className="text-wise-text-muted">
            {voices.length} voice{voices.length !== 1 ? 's' : ''} trained
          </p>
        </div>

        {/* Component */}
        <div className="bg-studio-panel border border-wise-medium rounded-xl p-8">
          <VoiceCloner />
        </div>

        {/* Voice Status Cards */}
        {voices.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold text-wise-text-primary">Your Voices</h2>
            <div className="grid grid-cols-3 gap-4">
              {voices.map((voice) => (
                <motion.div
                  key={voice.id}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-studio-raised rounded-lg p-4 border-2 cursor-pointer transition ${
                    activeVoice === voice.id
                      ? 'border-wise-accent'
                      : 'border-wise-medium'
                  }`}
                  onClick={() => setActiveVoice(voice.id)}
                >
                  <p className="font-semibold text-wise-text-primary">{voice.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-wise-text-muted">
                      {voice.samples} samples
                    </span>
                    <span className="text-sm font-bold text-wise-accent">
                      {voice.qualityScore}/5
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-2 font-semibold capitalize ${
                      voice.trainingStatus === 'ready'
                        ? 'text-wise-accent-green'
                        : 'text-wise-text-muted'
                    }`}
                  >
                    {voice.trainingStatus}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Export all example components
 */
export const VoiceClonerExamples = {
  Page: VoiceClonerPage,
  Modal: VoiceClonerModal,
  MusicGeneration: MusicGenerationWithVoiceCloning,
  Minimal: MinimalVoiceCloner,
  WithState: VoiceClonerWithState,
};

export default VoiceClonerPage;
