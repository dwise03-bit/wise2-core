'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, Loader2, Play } from 'lucide-react';
import { SunoGeneration, GenerationStatus, SunoQueueItem } from '../../types/suno';

interface SunoGenerationQueueProps {
  queue: SunoQueueItem[];
  currentGeneration?: SunoGeneration;
  recentGenerations: SunoGeneration[];
  onRetry?: (generationId: string) => void;
}

const getStatusIcon = (status: GenerationStatus) => {
  switch (status) {
    case 'Generating':
      return <Loader2 className="w-5 h-5 animate-spin text-wise-accent" />;
    case 'Completed':
      return <CheckCircle2 className="w-5 h-5 text-wise-accent-green" />;
    case 'Failed':
      return <AlertCircle className="w-5 h-5 text-wise-accent-red" />;
    case 'Queued':
      return <Clock className="w-5 h-5 text-wise-text-muted" />;
    default:
      return null;
  }
};

const getStatusColor = (status: GenerationStatus): string => {
  switch (status) {
    case 'Queued':
      return 'bg-studio-input border-wise-medium text-wise-text-secondary';
    case 'Generating':
      return 'bg-wise-accent/20 border-wise-accent text-wise-accent';
    case 'Completed':
      return 'bg-wise-accent-green/20 border-wise-accent-green text-wise-accent-green';
    case 'Failed':
      return 'bg-wise-accent-red/20 border-wise-accent-red text-wise-accent-red';
    case 'Cancelled':
      return 'bg-studio-input border-wise-medium text-wise-text-muted';
    default:
      return '';
  }
};

const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.round(seconds / 60)}m`;
};

const formatPromptSnippet = (prompt: string, maxLength: number = 50): string => {
  return prompt.length > maxLength ? `${prompt.slice(0, maxLength)}...` : prompt;
};

export function SunoGenerationQueue({
  queue,
  currentGeneration,
  recentGenerations,
  onRetry,
}: SunoGenerationQueueProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    currentGeneration?.id || null
  );

  // Sort recent generations by date (newest first)
  const sortedRecent = [...recentGenerations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* Current Generation Section */}
      {currentGeneration && (
        <div className="bg-gradient-to-br from-studio-panel to-studio-bg border border-wise-accent/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-wise-accent/20 rounded-lg">
                <Loader2 className="w-5 h-5 text-wise-accent animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-wise-text-primary">Currently Generating</h3>
                <p className="text-sm text-wise-text-muted">
                  {formatPromptSnippet(currentGeneration.params.prompt, 60)}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-wise-accent">
              {queue[0]?.estimatedTime ? `~${formatTimeRemaining(queue[0].estimatedTime)}` : 'Processing...'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-wise-text-muted">
              <span>Progress</span>
              <span className="font-mono">{queue[0]?.progress || 0}%</span>
            </div>
            <div className="h-2 bg-studio-line rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${queue[0]?.progress || 0}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-wise-accent to-wise-accent-bright rounded-full"
              />
            </div>
          </div>

          {/* Generation Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-studio-input/50 rounded-lg p-3">
              <p className="text-wise-text-muted mb-1">Genre</p>
              <p className="font-semibold text-wise-text-primary">{currentGeneration.params.genre}</p>
            </div>
            <div className="bg-studio-input/50 rounded-lg p-3">
              <p className="text-wise-text-muted mb-1">Mood</p>
              <p className="font-semibold text-wise-text-primary">{currentGeneration.params.mood}</p>
            </div>
            <div className="bg-studio-input/50 rounded-lg p-3">
              <p className="text-wise-text-muted mb-1">Tempo</p>
              <p className="font-semibold text-wise-text-primary font-mono">{currentGeneration.params.tempo} BPM</p>
            </div>
            <div className="bg-studio-input/50 rounded-lg p-3">
              <p className="text-wise-text-muted mb-1">Duration</p>
              <p className="font-semibold text-wise-text-primary">{currentGeneration.params.duration}s</p>
            </div>
          </div>
        </div>
      )}

      {/* Queue Section */}
      {queue.length > 0 && (
        <div className="bg-studio-panel border border-wise-medium rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-bold text-wise-text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-wise-text-muted" />
            Queue ({queue.length})
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            <AnimatePresence>
              {queue.slice(1).map((item, index) => (
                <motion.div
                  key={item.generationId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between px-4 py-2 bg-studio-input rounded-lg border border-wise-medium/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-bold text-wise-text-muted w-6">{index + 2}</span>
                    <span className="text-sm text-wise-text-secondary truncate">
                      Generation {item.generationId.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-xs text-wise-text-muted ml-auto">
                    {formatTimeRemaining(item.estimatedTime)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Recent Generations Section */}
      {sortedRecent.length > 0 && (
        <div className="bg-studio-panel border border-wise-medium rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-wise-text-primary">Recent Generations</h3>

          <div className="space-y-2">
            <AnimatePresence>
              {sortedRecent.slice(0, 10).map((generation) => (
                <motion.div
                  key={generation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() =>
                    setExpandedId(expandedId === generation.id ? null : generation.id)
                  }
                  className="cursor-pointer"
                >
                  {/* Collapsed View */}
                  <div className="bg-studio-input border border-wise-medium rounded-lg p-4 hover:border-wise-accent transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getStatusIcon(generation.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-wise-text-primary truncate">
                            {formatPromptSnippet(generation.params.prompt, 60)}
                          </p>
                          <p className="text-xs text-wise-text-muted">
                            {generation.params.genre} • {generation.params.duration}s
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        {generation.status === 'Completed' && generation.audioUrl && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-wise-accent/20 rounded-lg transition"
                            title="Play generation"
                          >
                            <Play className="w-4 h-4 text-wise-accent" />
                          </motion.button>
                        )}
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(
                            generation.status
                          )}`}
                        >
                          {generation.status}
                        </span>
                      </div>
                    </div>

                    {/* Expanded View */}
                    <AnimatePresence>
                      {expandedId === generation.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-wise-medium space-y-3"
                        >
                          {/* Tags */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-wise-text-muted uppercase">Tags</p>
                            <div className="flex flex-wrap gap-2">
                              {generation.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs rounded bg-wise-accent/20 text-wise-accent"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-wise-text-muted">Duration</p>
                              <p className="font-semibold text-wise-text-primary">
                                {generation.duration}s
                              </p>
                            </div>
                            <div>
                              <p className="text-wise-text-muted">File Size</p>
                              <p className="font-semibold text-wise-text-primary">
                                {generation.fileSize}
                              </p>
                            </div>
                            <div>
                              <p className="text-wise-text-muted">Bitrate</p>
                              <p className="font-semibold text-wise-text-primary">
                                {generation.bitrate}
                              </p>
                            </div>
                            <div>
                              <p className="text-wise-text-muted">Plays</p>
                              <p className="font-semibold text-wise-text-primary">
                                {generation.playCount}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          {generation.status === 'Failed' && onRetry && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRetry(generation.id);
                              }}
                              className="w-full py-2 px-3 bg-wise-accent/20 border border-wise-accent rounded-lg text-sm font-semibold text-wise-accent hover:bg-wise-accent/30 transition"
                            >
                              Retry Generation
                            </motion.button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {queue.length === 0 && recentGenerations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-studio-panel border border-wise-medium rounded-xl p-8 text-center space-y-3"
        >
          <Clock className="w-12 h-12 text-wise-text-muted mx-auto opacity-50" />
          <div>
            <h3 className="text-lg font-bold text-wise-text-primary">No Generations Yet</h3>
            <p className="text-sm text-wise-text-muted">
              Start creating music with the prompt builder above
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
