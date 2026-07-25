'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedTrack } from '../../../types/aimusic';

interface RemixVersion {
  id: string;
  originalTrackId: string;
  version: number;
  prompt: string;
  moodModification?: string;
  url?: string;
  createdAt: Date;
  votes: number;
}

interface RemixInterfaceProps {
  tracks: GeneratedTrack[];
  onRemix: (trackId: string, modifiedPrompt: string) => Promise<GeneratedTrack>;
  isGenerating?: boolean;
  onGenerationComplete?: (track: GeneratedTrack) => void;
}

/**
 * Remix Interface - Modify and compare different versions
 * A/B comparison, voting system, and version history
 */
export function RemixInterface({
  tracks,
  onRemix,
  isGenerating = false,
  onGenerationComplete,
}: RemixInterfaceProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [remixPrompt, setRemixPrompt] = useState('');
  const [moodModification, setMoodModification] = useState<
    'keep' | 'happier' | 'sadder' | 'energetic' | 'calmer'
  >('keep');
  const [localGenerating, setLocalGenerating] = useState(false);
  const [remixProgress, setRemixProgress] = useState(0);
  const [remixVersions, setRemixVersions] = useState<Map<string, RemixVersion[]>>(new Map());
  const [selectedVersionIds, setSelectedVersionIds] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [error, setError] = useState<string | null>(null);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const completedTracks = tracks.filter((t) => t.status === 'complete');
  const currentVersions = selectedTrackId ? remixVersions.get(selectedTrackId) || [] : [];

  const handleRemix = async () => {
    if (!selectedTrackId) {
      setError('Please select a track to remix');
      return;
    }

    if (!remixPrompt.trim()) {
      setError('Please enter a remix description');
      return;
    }

    setLocalGenerating(true);
    setRemixProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setRemixProgress((prev) => {
          const next = prev + Math.random() * 12;
          return next > 90 ? 90 : next;
        });
      }, 600);

      const modifiedPrompt =
        moodModification !== 'keep'
          ? `${remixPrompt} [${moodModification}]`
          : remixPrompt;

      const remixedTrack = await onRemix(selectedTrackId, modifiedPrompt);

      clearInterval(progressInterval);
      setRemixProgress(100);

      const newVersion: RemixVersion = {
        id: remixedTrack.id,
        originalTrackId: selectedTrackId,
        version: currentVersions.length + 1,
        prompt: remixPrompt,
        moodModification: moodModification !== 'keep' ? moodModification : undefined,
        url: remixedTrack.url,
        createdAt: new Date(),
        votes: 0,
      };

      setRemixVersions((prev) => {
        const updated = new Map(prev);
        const versions = updated.get(selectedTrackId) || [];
        updated.set(selectedTrackId, [...versions, newVersion]);
        return updated;
      });

      if (onGenerationComplete) {
        onGenerationComplete(remixedTrack);
      }

      // Auto-select first comparison slot if empty
      if (selectedVersionIds[0] === null) {
        setSelectedVersionIds([newVersion.id, selectedVersionIds[1]]);
      }

      setRemixPrompt('');
      setMoodModification('keep');

      setTimeout(() => {
        setRemixProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remix track');
      setRemixProgress(0);
    } finally {
      setLocalGenerating(false);
    }
  };

  const handleVote = (versionId: string, slot: 0 | 1) => {
    setRemixVersions((prev) => {
      const updated = new Map(prev);
      if (selectedTrackId) {
        const versions = updated.get(selectedTrackId) || [];
        const versionIndex = versions.findIndex((v) => v.id === versionId);
        if (versionIndex !== -1) {
          versions[versionIndex].votes += 1;
          updated.set(selectedTrackId, [...versions]);
        }
      }
      return updated;
    });
  };

  return (
    <motion.div
      className="bg-wise-surface rounded-lg p-4 border border-wise-medium space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Remix & A/B Compare</h3>
        <div className="text-xs text-wise-text-muted">
          {currentVersions.length} version{currentVersions.length !== 1 ? 's' : ''}
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
        <label className="text-xs font-semibold uppercase block mb-2">Select Track to Remix</label>
        <select
          value={selectedTrackId || ''}
          onChange={(e) => setSelectedTrackId(e.target.value || null)}
          disabled={localGenerating || isGenerating}
          className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary text-sm disabled:opacity-50 focus:outline-none focus:border-wise-primary transition"
        >
          <option value="">Choose a track...</option>
          {completedTracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.prompt.slice(0, 40)}... • {track.genre} • {track.mood}
            </option>
          ))}
        </select>
      </div>

      {/* Remix Creation */}
      {selectedTrack && (
        <motion.div
          className="bg-wise-surface-secondary rounded p-3 space-y-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="text-xs font-semibold text-wise-primary">Original Track</div>

          {/* Original Prompt */}
          <div>
            <textarea
              value={selectedTrack.prompt}
              disabled
              className="w-full px-2 py-1 bg-wise-surface border border-wise-medium rounded text-wise-text-muted text-xs resize-none h-12 opacity-60"
            />
          </div>

          {/* Mood Modification */}
          <div>
            <label className="text-xs font-semibold uppercase block mb-2">Modify Mood</label>
            <div className="grid grid-cols-3 gap-1">
              {(['keep', 'happier', 'sadder', 'energetic', 'calmer'] as const).map((mood) => (
                <motion.button
                  key={mood}
                  onClick={() => setMoodModification(mood)}
                  disabled={localGenerating || isGenerating}
                  className={`px-2 py-1 rounded text-xs font-semibold transition ${
                    moodModification === mood
                      ? 'bg-wise-primary text-white'
                      : 'bg-wise-surface text-wise-text-primary hover:bg-wise-surface-secondary disabled:opacity-50'
                  }`}
                  whileHover={!localGenerating && !isGenerating ? { scale: 1.02 } : {}}
                  whileTap={!localGenerating && !isGenerating ? { scale: 0.95 } : {}}
                >
                  {mood === 'keep' && '🔄'}
                  {mood === 'happier' && '😊'}
                  {mood === 'sadder' && '😢'}
                  {mood === 'energetic' && '⚡'}
                  {mood === 'calmer' && '🧘'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* New Remix Prompt */}
          <div>
            <label className="text-xs font-semibold uppercase block mb-2">Remix Description</label>
            <textarea
              value={remixPrompt}
              onChange={(e) => setRemixPrompt(e.target.value)}
              placeholder="Change musical elements while keeping the style... e.g., 'Switch from electronic to organic instruments'"
              disabled={localGenerating || isGenerating}
              className="w-full px-2 py-1 bg-wise-surface border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-xs resize-none disabled:opacity-50 focus:outline-none focus:border-wise-primary transition h-12"
            />
          </div>

          {/* Progress */}
          {(localGenerating || isGenerating) && (
            <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold">Remixing...</span>
                <span className="text-wise-text-muted">{Math.round(remixProgress)}%</span>
              </div>
              <motion.div className="w-full h-1 bg-wise-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-wise-primary to-wise-accent-green"
                  animate={{ width: `${remixProgress}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 60 }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Generate Button */}
          <motion.button
            onClick={handleRemix}
            disabled={!remixPrompt.trim() || localGenerating || isGenerating}
            className="w-full py-2 bg-gradient-to-r from-wise-primary to-wise-primary-active hover:shadow-lg disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition"
            whileHover={!localGenerating && !isGenerating ? { scale: 1.02 } : {}}
            whileTap={!localGenerating && !isGenerating ? { scale: 0.98 } : {}}
          >
            {localGenerating || isGenerating ? (
              <motion.div className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                Remixing...
              </motion.div>
            ) : (
              '🎛️ Generate Remix'
            )}
          </motion.button>
        </motion.div>
      )}

      {/* A/B Comparison */}
      {currentVersions.length > 0 && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-xs font-semibold text-wise-primary mb-2">A/B Comparison</div>

          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((slot) => (
              <motion.div
                key={slot}
                className="bg-wise-surface-secondary rounded p-2 border border-wise-medium space-y-2"
              >
                <div className="text-xs font-semibold text-wise-text-muted">
                  {slot === 0 ? 'Version A' : 'Version B'}
                </div>

                <select
                  value={selectedVersionIds[slot] || ''}
                  onChange={(e) => {
                    const newIds = [...selectedVersionIds] as [string | null, string | null];
                    newIds[slot] = e.target.value || null;
                    setSelectedVersionIds(newIds);
                  }}
                  className="w-full px-2 py-1 bg-wise-surface border border-wise-medium rounded text-wise-text-primary text-xs"
                >
                  <option value="">Select version...</option>
                  {currentVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version} • {v.moodModification || 'standard'}
                    </option>
                  ))}
                </select>

                {selectedVersionIds[slot] &&
                  currentVersions.find((v) => v.id === selectedVersionIds[slot]) && (
                    <motion.div
                      className="bg-wise-surface rounded p-2 text-xs space-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-wise-text-muted line-clamp-2">
                        {
                          currentVersions.find((v) => v.id === selectedVersionIds[slot])
                            ?.prompt
                        }
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-wise-text-muted">
                          {currentVersions.find((v) => v.id === selectedVersionIds[slot])?.votes} votes
                        </span>
                        <motion.button
                          onClick={() => handleVote(selectedVersionIds[slot]!, slot as 0 | 1)}
                          className="px-2 py-1 bg-wise-primary/20 hover:bg-wise-primary/30 text-wise-primary rounded text-xs font-semibold transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          👍 Vote
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
              </motion.div>
            ))}
          </div>

          {/* Version History */}
          <motion.div className="bg-wise-surface-secondary rounded p-2 border border-wise-medium/50">
            <div className="text-xs font-semibold mb-2 text-wise-text-muted">
              All Versions ({currentVersions.length})
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {currentVersions.map((v) => (
                <div key={v.id} className="text-xs bg-wise-surface rounded p-1 flex justify-between">
                  <span className="text-wise-text-muted line-clamp-1">{v.prompt}</span>
                  <span className="text-wise-text-muted ml-2 whitespace-nowrap">{v.votes} votes</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-wise-primary/10 border border-wise-primary/30 rounded p-2 text-xs text-wise-text-muted">
        <div className="font-semibold text-wise-primary mb-1">💡 Remix workflow</div>
        <ul className="space-y-1 text-xs">
          <li>• Create multiple remix versions of the same track</li>
          <li>• Use mood modifications to instantly shift tone</li>
          <li>• A/B compare side-by-side</li>
          <li>• Vote on your favorite version</li>
          <li>• Keep history for reference</li>
        </ul>
      </div>
    </motion.div>
  );
}
