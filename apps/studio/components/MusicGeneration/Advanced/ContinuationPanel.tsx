'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedTrack } from '../../../types/aimusic';

interface ContinuationPanelProps {
  tracks: GeneratedTrack[];
  onContinue: (trackId: string, description: string) => Promise<GeneratedTrack>;
  isGenerating?: boolean;
  onGenerationComplete?: (track: GeneratedTrack) => void;
}

/**
 * Continuation Panel - Extend a completed track by 30 seconds
 * Maintains musical coherence and smooth transitions
 */
export function ContinuationPanel({
  tracks,
  onContinue,
  isGenerating = false,
  onGenerationComplete,
}: ContinuationPanelProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [additionalDescription, setAdditionalDescription] = useState('');
  const [continuationProgress, setContinuationProgress] = useState(0);
  const [continuedTracks, setContinuedTracks] = useState<Map<string, GeneratedTrack>>(new Map());
  const [localGenerating, setLocalGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const completedTracks = tracks.filter((t) => t.status === 'complete');

  const handleContinue = async () => {
    if (!selectedTrackId) {
      setError('Please select a track to continue');
      return;
    }

    setLocalGenerating(true);
    setContinuationProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setContinuationProgress((prev) => {
          const next = prev + Math.random() * 15;
          return next > 90 ? 90 : next;
        });
      }, 500);

      // Generate continuation
      const continuedTrack = await onContinue(selectedTrackId, additionalDescription);

      clearInterval(progressInterval);
      setContinuationProgress(100);

      // Store continued track
      setContinuedTracks((prev) => {
        const updated = new Map(prev);
        updated.set(selectedTrackId, continuedTrack);
        return updated;
      });

      if (onGenerationComplete) {
        onGenerationComplete(continuedTrack);
      }

      // Reset form
      setAdditionalDescription('');
      setSelectedTrackId(null);

      // Clear success state after 2 seconds
      setTimeout(() => {
        setContinuationProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue track');
      setContinuationProgress(0);
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
        <h3 className="font-semibold text-sm">Extend Track 30s</h3>
        <div className="text-xs text-wise-text-muted">
          {completedTracks.length} complete track{completedTracks.length !== 1 ? 's' : ''}
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

      {/* Track Selection */}
      <div>
        <label className="text-xs font-semibold uppercase block mb-2">Select Completed Track</label>
        <select
          value={selectedTrackId || ''}
          onChange={(e) => setSelectedTrackId(e.target.value || null)}
          disabled={localGenerating || isGenerating}
          className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary text-sm disabled:opacity-50 focus:outline-none focus:border-wise-primary transition"
        >
          <option value="">Choose a track...</option>
          {completedTracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.prompt.slice(0, 40)}... ({track.duration}s)
            </option>
          ))}
        </select>
      </div>

      {/* Track Preview */}
      {selectedTrack && (
        <motion.div
          className="bg-wise-surface-secondary rounded p-3 space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-wise-primary">Current Track</div>
              <div className="text-xs text-wise-text-muted line-clamp-2">{selectedTrack.prompt}</div>
            </div>
            <div className="text-xs whitespace-nowrap">
              <div className="font-semibold">{selectedTrack.duration}s</div>
              <div className="text-wise-text-muted">{selectedTrack.tempo} BPM</div>
            </div>
          </div>
          <div className="text-xs text-wise-text-muted">
            After continuation: {selectedTrack.duration + 30}s
          </div>
        </motion.div>
      )}

      {/* Additional Description */}
      <div>
        <label className="text-xs font-semibold uppercase block mb-2">
          Additional Description (Optional)
        </label>
        <textarea
          value={additionalDescription}
          onChange={(e) => setAdditionalDescription(e.target.value)}
          placeholder="Describe how you want the track to continue... e.g., 'Add more percussion and build to a climax'"
          disabled={localGenerating || isGenerating}
          className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-xs resize-none disabled:opacity-50 focus:outline-none focus:border-wise-primary transition h-16"
        />
      </div>

      {/* Progress */}
      {(localGenerating || isGenerating) && (
        <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold">Generating continuation...</span>
            <span className="text-xs text-wise-text-muted">{Math.round(continuationProgress)}%</span>
          </div>
          <motion.div className="w-full h-2 bg-wise-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-wise-primary to-wise-accent-green"
              initial={{ width: 0 }}
              animate={{ width: `${continuationProgress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 60 }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Generate Button */}
      <motion.button
        onClick={handleContinue}
        disabled={!selectedTrackId || localGenerating || isGenerating}
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
            Extending...
          </motion.div>
        ) : (
          '🎵 Continue Track (+30s)'
        )}
      </motion.button>

      {/* Continued Tracks List */}
      {continuedTracks.size > 0 && (
        <motion.div
          className="bg-wise-surface-secondary rounded p-3 space-y-2 border border-wise-accent-green/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-semibold text-wise-accent-green mb-2">
            ✓ Continued Tracks ({continuedTracks.size})
          </div>
          {Array.from(continuedTracks.values()).map((track) => (
            <div key={track.id} className="text-xs text-wise-text-muted">
              <div className="font-semibold line-clamp-1">{track.prompt.slice(0, 30)}...</div>
              <div className="text-wise-text-muted text-xs">
                New duration: {track.duration}s • Ready to loop
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-wise-primary/10 border border-wise-primary/30 rounded p-2 text-xs text-wise-text-muted">
        <div className="font-semibold text-wise-primary mb-1">💡 How it works</div>
        <ul className="space-y-1 text-xs">
          <li>• Continues track seamlessly with 30s of new music</li>
          <li>• Maintains musical style and tempo</li>
          <li>• Optional description guides the continuation</li>
          <li>• Extended track ready to loop or export</li>
        </ul>
      </div>
    </motion.div>
  );
}
