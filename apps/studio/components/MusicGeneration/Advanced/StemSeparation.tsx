'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedTrack, StemTrack } from '../../../types/aimusic';

interface StemSeparationJob {
  id: string;
  trackId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  stems?: StemTrack[];
  createdAt: Date;
  completedAt?: Date;
}

interface StemSeparationProps {
  tracks: GeneratedTrack[];
  onSeparateSteams: (trackId: string) => Promise<StemTrack[]>;
  isProcessing?: boolean;
}

/**
 * Stem Separation - Split generated tracks into individual stems
 * Extract: Vocals, Drums, Bass, Melody, Strings, Brass
 * Perfect for remixing in Sound Lab or other DAWs
 */
export function StemSeparation({
  tracks,
  onSeparateSteams,
  isProcessing = false,
}: StemSeparationProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [separationJobs, setSeparationJobs] = useState<Map<string, StemSeparationJob>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const completedTracks = tracks.filter((t) => t.status === 'complete');
  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const jobsForTrack = selectedTrackId
    ? Array.from(separationJobs.values()).filter((j) => j.trackId === selectedTrackId)
    : [];

  // Standard stem names with descriptions
  const stemDefinitions = [
    { name: 'vocals' as const, icon: '🎤', description: 'Lead and backing vocals' },
    { name: 'drums' as const, icon: '🥁', description: 'Kick, snare, hi-hat, percussion' },
    { name: 'bass' as const, icon: '🎸', description: 'Bass guitar and sub bass' },
    { name: 'melody' as const, icon: '🎹', description: 'Lead melody instruments' },
    { name: 'strings' as const, icon: '🎻', description: 'Strings and pads' },
    { name: 'brass' as const, icon: '🎺', description: 'Brass and horns' },
    { name: 'synths' as const, icon: '⚡', description: 'Synths and electronic elements' },
    { name: 'ambience' as const, icon: '🌊', description: 'Atmospheric and background' },
  ];

  const handleStartSeparation = async () => {
    if (!selectedTrackId) {
      setError('Please select a track');
      return;
    }

    setError(null);

    const jobId = `sep-${Date.now()}`;
    const newJob: StemSeparationJob = {
      id: jobId,
      trackId: selectedTrackId,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    };

    setSeparationJobs((prev) => {
      const updated = new Map(prev);
      updated.set(jobId, newJob);
      return updated;
    });

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSeparationJobs((prev) => {
          const updated = new Map(prev);
          const job = updated.get(jobId);
          if (job && job.status !== 'complete') {
            const newProgress = job.progress + Math.random() * 8;
            job.progress = Math.min(newProgress, 95);

            // Determine status based on progress
            if (job.progress < 20) {
              job.status = 'queued';
            } else if (job.progress < 90) {
              job.status = 'processing';
            }

            updated.set(jobId, { ...job });
          }
          return updated;
        });
      }, 600);

      // Call actual separation
      const stems = await onSeparateSteams(selectedTrackId);

      clearInterval(progressInterval);

      setSeparationJobs((prev) => {
        const updated = new Map(prev);
        const job = updated.get(jobId);
        if (job) {
          job.status = 'complete';
          job.progress = 100;
          job.stems = stems;
          job.completedAt = new Date();
          updated.set(jobId, { ...job });
        }
        return updated;
      });

      setExpandedJobId(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to separate stems');
      setSeparationJobs((prev) => {
        const updated = new Map(prev);
        const job = updated.get(jobId);
        if (job) {
          job.status = 'failed';
          job.progress = 0;
          updated.set(jobId, { ...job });
        }
        return updated;
      });
    }
  };

  const getJobStatusColor = (status: StemSeparationJob['status']) => {
    switch (status) {
      case 'queued':
        return 'bg-wise-surface/50';
      case 'processing':
        return 'bg-wise-primary/20';
      case 'complete':
        return 'bg-wise-accent-green/20';
      case 'failed':
        return 'bg-wise-accent-red/20';
    }
  };

  const getJobStatusText = (status: StemSeparationJob['status']) => {
    switch (status) {
      case 'queued':
        return 'Queued...';
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Complete ✓';
      case 'failed':
        return 'Failed';
    }
  };

  return (
    <motion.div
      className="bg-wise-surface rounded-lg p-4 border border-wise-medium space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Stem Separation</h3>
        <div className="text-xs text-wise-text-muted">
          {jobsForTrack.filter((j) => j.status === 'complete').length} jobs complete
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
        <label className="text-xs font-semibold uppercase block mb-2">Select Track to Separate</label>
        <select
          value={selectedTrackId || ''}
          onChange={(e) => setSelectedTrackId(e.target.value || null)}
          disabled={isProcessing}
          className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary text-sm disabled:opacity-50 focus:outline-none focus:border-wise-primary transition"
        >
          <option value="">Choose a track...</option>
          {completedTracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.prompt.slice(0, 40)}... • {track.duration}s
            </option>
          ))}
        </select>
      </div>

      {/* Track Info */}
      {selectedTrack && (
        <motion.div
          className="bg-wise-surface-secondary rounded p-3 space-y-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-xs font-semibold text-wise-primary">Selected Track</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-wise-text-muted">Genre:</span> {selectedTrack.genre}
            </div>
            <div>
              <span className="text-wise-text-muted">Duration:</span> {selectedTrack.duration}s
            </div>
            <div>
              <span className="text-wise-text-muted">Tempo:</span> {selectedTrack.tempo}BPM
            </div>
          </div>
          <div className="text-xs text-wise-text-muted">
            <span className="font-semibold">Instruments:</span> {selectedTrack.instruments.join(', ')}
          </div>
        </motion.div>
      )}

      {/* Stem Information */}
      <div>
        <label className="text-xs font-semibold uppercase block mb-2">Stems to Extract</label>
        <div className="grid grid-cols-2 gap-2">
          {stemDefinitions.map((stem) => (
            <motion.div
              key={stem.name}
              className="bg-wise-surface-secondary rounded p-2 text-xs border border-wise-medium/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="font-semibold">
                {stem.icon} {stem.name}
              </div>
              <div className="text-wise-text-muted text-xs">{stem.description}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Start Separation Button */}
      <motion.button
        onClick={handleStartSeparation}
        disabled={!selectedTrackId || isProcessing}
        className="w-full py-2.5 bg-gradient-to-r from-wise-primary to-wise-primary-active hover:shadow-lg disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition"
        whileHover={!isProcessing ? { scale: 1.02 } : {}}
        whileTap={!isProcessing ? { scale: 0.98 } : {}}
      >
        {isProcessing ? (
          <motion.div className="flex items-center justify-center gap-2">
            <motion.div
              className="w-3 h-3 rounded-full bg-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            Processing...
          </motion.div>
        ) : (
          '🎚️ Start Stem Separation'
        )}
      </motion.button>

      {/* Active & Completed Jobs */}
      {jobsForTrack.length > 0 && (
        <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-xs font-semibold">Processing Queue</div>

          {jobsForTrack.map((job) => (
            <motion.div
              key={job.id}
              className={`rounded-lg p-3 border border-wise-medium space-y-2 cursor-pointer transition ${getJobStatusColor(job.status)}`}
              onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
              whileHover={{ scale: 1.01 }}
            >
              {/* Job Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold flex items-center gap-2">
                    {job.status === 'queued' && '⏳'}
                    {job.status === 'processing' && '⚙️'}
                    {job.status === 'complete' && '✅'}
                    {job.status === 'failed' && '❌'}
                    {getJobStatusText(job.status)}
                  </div>
                  <div className="text-xs text-wise-text-muted">
                    {tracks.find((t) => t.id === job.trackId)?.prompt.slice(0, 30)}...
                  </div>
                </div>
                <div className="text-xs font-semibold whitespace-nowrap">{Math.round(job.progress)}%</div>
              </div>

              {/* Progress Bar */}
              {job.status !== 'complete' && job.status !== 'failed' && (
                <motion.div className="w-full h-1 bg-wise-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-wise-primary to-wise-accent-green"
                    animate={{ width: `${job.progress}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 60 }}
                  />
                </motion.div>
              )}

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedJobId === job.id && job.status === 'complete' && job.stems && (
                  <motion.div
                    className="space-y-2 pt-2 border-t border-wise-medium/30"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="text-xs font-semibold text-wise-accent-green">
                      Extraction Complete - {job.stems.length} Stems
                    </div>

                    {/* Stem List */}
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {job.stems.map((stem, idx) => (
                        <motion.div
                          key={stem.id}
                          className="bg-wise-surface rounded p-2 flex items-center justify-between text-xs"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">
                              {stemDefinitions.find((s) => s.name === stem.name)?.icon} {stem.name}
                            </div>
                            <div className="text-wise-text-muted text-xs">
                              Volume: {Math.round(stem.volume * 100)}% • Pan:{' '}
                              {stem.pan > 0 ? 'R' : stem.pan < 0 ? 'L' : 'C'}{' '}
                              {Math.abs(stem.pan) > 0 ? Math.round(Math.abs(stem.pan) * 50) : ''}
                            </div>
                          </div>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download stem
                            }}
                            className="px-2 py-1 bg-wise-primary/20 hover:bg-wise-primary/30 text-wise-primary rounded text-xs font-semibold transition whitespace-nowrap"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            ⬇️
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Remix in Sound Lab */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open Sound Lab with stems
                      }}
                      className="w-full mt-2 py-1.5 bg-wise-accent-green/20 hover:bg-wise-accent-green/30 text-wise-accent-green rounded text-xs font-semibold transition"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎛️ Open in Sound Lab
                    </motion.button>
                  </motion.div>
                )}

                {expandedJobId === job.id && job.status === 'failed' && (
                  <motion.div
                    className="bg-wise-accent-red/20 border border-wise-accent-red/50 rounded p-2 text-wise-accent-red text-xs"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    Failed to separate stems. Please try again.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-wise-primary/10 border border-wise-primary/30 rounded p-2 text-xs text-wise-text-muted">
        <div className="font-semibold text-wise-primary mb-1">💡 Stem separation workflow</div>
        <ul className="space-y-1 text-xs">
          <li>• Isolates individual musical elements from a track</li>
          <li>• 8 stem types: Vocals, Drums, Bass, Melody, Strings, Brass, Synths, Ambience</li>
          <li>• Each stem can be downloaded separately</li>
          <li>• Import stems into Sound Lab for remixing</li>
          <li>• Adjust volume and panning per stem</li>
        </ul>
      </div>
    </motion.div>
  );
}
