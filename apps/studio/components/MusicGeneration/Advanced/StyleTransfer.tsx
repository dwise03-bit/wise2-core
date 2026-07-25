'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedTrack } from '../../../types/aimusic';

interface StyleTransferInterfaceProps {
  tracks: GeneratedTrack[];
  onStyleTransfer: (
    sourceTrackId: string,
    targetPrompt: string
  ) => Promise<GeneratedTrack>;
  isGenerating?: boolean;
  onGenerationComplete?: (track: GeneratedTrack) => void;
}

/**
 * Style Transfer - Apply musical style from one track to another content
 * Extracts characteristics (timbre, instrumentation, structure) and applies to new prompt
 */
export function StyleTransfer({
  tracks,
  onStyleTransfer,
  isGenerating = false,
  onGenerationComplete,
}: StyleTransferInterfaceProps) {
  const [sourceTrackId, setSourceTrackId] = useState<string | null>(null);
  const [targetPrompt, setTargetPrompt] = useState('');
  const [transferProgress, setTransferProgress] = useState(0);
  const [localGenerating, setLocalGenerating] = useState(false);
  const [transferredTracks, setTransferredTracks] = useState<GeneratedTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stylePreserveAmount, setStylePreserveAmount] = useState(80);

  const sourceTrack = tracks.find((t) => t.id === sourceTrackId);
  const completedTracks = tracks.filter((t) => t.status === 'complete');

  // Extract style characteristics from source track
  const extractStyleCharacteristics = (track: GeneratedTrack) => {
    return {
      timbre: track.instruments.join(', '),
      tempo: track.tempo,
      mood: track.mood,
      genre: track.genre,
      structure: `${track.duration}s with ${Math.ceil(track.duration / 16)} sections`,
      energy: track.mood.includes('Calm') ? 'Low' : 'High',
    };
  };

  const handleStyleTransfer = async () => {
    if (!sourceTrackId) {
      setError('Please select a source track for the style');
      return;
    }

    if (!targetPrompt.trim()) {
      setError('Please enter a target description');
      return;
    }

    setLocalGenerating(true);
    setTransferProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setTransferProgress((prev) => {
          const next = prev + Math.random() * 10;
          return next > 90 ? 90 : next;
        });
      }, 700);

      // Prepare enriched prompt with style transfer instructions
      const styleCharacteristics = extractStyleCharacteristics(sourceTrack!);
      const enrichedPrompt = `
Style transfer: Apply the musical style from a ${styleCharacteristics.genre} track (${styleCharacteristics.timbre}) at ${styleCharacteristics.tempo}BPM with ${styleCharacteristics.mood} mood to this new content: ${targetPrompt}

Preserve style: ${stylePreserveAmount}%
Source energy: ${styleCharacteristics.energy}
Structure: ${styleCharacteristics.structure}
      `.trim();

      const transferredTrack = await onStyleTransfer(sourceTrackId, enrichedPrompt);

      clearInterval(progressInterval);
      setTransferProgress(100);

      setTransferredTracks((prev) => [transferredTrack, ...prev.slice(0, 4)]);

      if (onGenerationComplete) {
        onGenerationComplete(transferredTrack);
      }

      setTargetPrompt('');

      setTimeout(() => {
        setTransferProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer style');
      setTransferProgress(0);
    } finally {
      setLocalGenerating(false);
    }
  };

  return (
    <motion.div
      className="bg-wise-surface rounded-lg p-4 border border-wise-medium space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Style Transfer</h3>
        <div className="text-xs text-wise-text-muted">
          {completedTracks.length} style donor{completedTracks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-wise-accent-red/20 border border-wise-accent-red rounded p-2 text-wise-accent-red text-xs"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Source Track (Style Donor) */}
        <motion.div className="space-y-2">
          <label className="text-xs font-semibold uppercase block">Source Track (Style)</label>
          <select
            value={sourceTrackId || ''}
            onChange={(e) => setSourceTrackId(e.target.value || null)}
            disabled={localGenerating || isGenerating}
            className="w-full px-2 py-1.5 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary text-xs disabled:opacity-50 focus:outline-none focus:border-wise-primary transition"
          >
            <option value="">Pick a style...</option>
            {completedTracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.prompt.slice(0, 25)}...
              </option>
            ))}
          </select>

          {/* Source Style Preview */}
          {sourceTrack && (
            <motion.div
              className="bg-wise-surface-secondary rounded p-2 space-y-1 text-xs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="font-semibold text-wise-primary">Style Profile</div>
              <div className="grid grid-cols-2 gap-1 text-xs text-wise-text-muted">
                <div>
                  <span className="font-semibold">Genre:</span> {sourceTrack.genre}
                </div>
                <div>
                  <span className="font-semibold">Tempo:</span> {sourceTrack.tempo}BPM
                </div>
                <div>
                  <span className="font-semibold">Mood:</span> {sourceTrack.mood}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span> {sourceTrack.duration}s
                </div>
              </div>
              <div className="text-xs text-wise-text-muted">
                <span className="font-semibold">Instruments:</span> {sourceTrack.instruments.slice(0, 2).join(', ')}
                {sourceTrack.instruments.length > 2 && ` +${sourceTrack.instruments.length - 2}`}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Target Prompt (Content) */}
        <motion.div className="space-y-2">
          <label className="text-xs font-semibold uppercase block">Target Content</label>
          <textarea
            value={targetPrompt}
            onChange={(e) => setTargetPrompt(e.target.value)}
            placeholder="Describe what the new track should be about..."
            disabled={localGenerating || isGenerating}
            className="w-full px-2 py-1 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-xs resize-none disabled:opacity-50 focus:outline-none focus:border-wise-primary transition h-24"
          />
        </motion.div>
      </div>

      {/* Advanced Options */}
      <motion.button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs font-semibold text-wise-primary hover:text-wise-primary-active transition flex items-center gap-1"
        whileHover={{ x: 2 }}
      >
        {showAdvanced ? '▼' : '▶'} Advanced Options
      </motion.button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            className="bg-wise-surface-secondary rounded p-3 space-y-3 border border-wise-medium/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold">Style Preservation: {stylePreserveAmount}%</label>
                <div className="text-xs text-wise-text-muted">
                  {stylePreserveAmount > 70 ? 'Strict' : stylePreserveAmount > 40 ? 'Balanced' : 'Creative'}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={stylePreserveAmount}
                onChange={(e) => setStylePreserveAmount(Number(e.target.value))}
                disabled={localGenerating || isGenerating}
                className="w-full h-1 accent-wise-primary disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-wise-text-muted mt-1">
                <span>Creative</span>
                <span>Balanced</span>
                <span>Strict</span>
              </div>
            </div>

            <div className="text-xs text-wise-text-muted space-y-1">
              <div>
                <span className="font-semibold">What will be preserved:</span>
              </div>
              <ul className="space-y-0.5 ml-2">
                <li className={stylePreserveAmount >= 50 ? 'text-wise-primary' : 'opacity-50'}>
                  ✓ Instrumentation & timbre
                </li>
                <li className={stylePreserveAmount >= 65 ? 'text-wise-primary' : 'opacity-50'}>
                  ✓ Tempo & rhythm pattern
                </li>
                <li className={stylePreserveAmount >= 80 ? 'text-wise-primary' : 'opacity-50'}>
                  ✓ Structural formula
                </li>
                <li className={stylePreserveAmount >= 90 ? 'text-wise-primary' : 'opacity-50'}>
                  ✓ Exact mood characteristics
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      {(localGenerating || isGenerating) && (
        <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold">Transferring style...</span>
            <span className="text-xs text-wise-text-muted">{Math.round(transferProgress)}%</span>
          </div>
          <motion.div className="w-full h-2 bg-wise-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-wise-primary to-wise-accent-green"
              animate={{ width: `${transferProgress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 60 }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Transfer Button */}
      <motion.button
        onClick={handleStyleTransfer}
        disabled={!sourceTrackId || !targetPrompt.trim() || localGenerating || isGenerating}
        className="w-full py-2.5 bg-gradient-to-r from-wise-primary to-wise-primary-active hover:shadow-lg disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition"
        whileHover={!localGenerating && !isGenerating ? { scale: 1.02 } : {}}
        whileTap={!localGenerating && !isGenerating ? { scale: 0.98 } : {}}
      >
        {localGenerating || isGenerating ? (
          <motion.div className="flex items-center justify-center gap-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            Transferring style...
          </motion.div>
        ) : (
          '🎨 Apply Style Transfer'
        )}
      </motion.button>

      {/* Transferred Tracks */}
      {transferredTracks.length > 0 && (
        <motion.div
          className="bg-wise-accent-green/10 border border-wise-accent-green/30 rounded p-3 space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-semibold text-wise-accent-green mb-2">
            ✓ Generated Tracks ({transferredTracks.length})
          </div>
          {transferredTracks.map((track, idx) => (
            <motion.div
              key={track.id}
              className="bg-wise-surface rounded p-2 text-xs space-y-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="font-semibold text-wise-text-primary line-clamp-1">
                {track.prompt.slice(0, 40)}...
              </div>
              <div className="text-wise-text-muted">
                {track.genre} • {track.mood} • {track.tempo}BPM
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-wise-primary/10 border border-wise-primary/30 rounded p-2 text-xs text-wise-text-muted">
        <div className="font-semibold text-wise-primary mb-1">💡 Style transfer explained</div>
        <ul className="space-y-1 text-xs">
          <li>• Extracts musical characteristics from source track</li>
          <li>• Applies style to completely new content</li>
          <li>• Control preservation level (creative to strict)</li>
          <li>• Perfect for creating thematic variations</li>
        </ul>
      </div>
    </motion.div>
  );
}
