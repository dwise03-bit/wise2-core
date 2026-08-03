'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Download, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface GenerationJob {
  id: string;
  prompt: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: number;
  eta?: number;
  createdAt: number;
  completedAt?: number;
  genre?: string;
  duration?: number;
  audioUrl?: string;
  error?: string;
}

interface GenerationQueueProps {
  jobs?: GenerationJob[];
  onCancel?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onDownload?: (jobId: string, audioUrl: string) => void;
  autoScroll?: boolean;
}

const MOCK_JOBS: GenerationJob[] = [
  {
    id: '1',
    prompt: 'upbeat electronic dance track with bright synths',
    status: 'completed',
    progress: 100,
    createdAt: Date.now() - 3600000,
    completedAt: Date.now() - 3300000,
    genre: 'EDM',
    duration: 30,
    audioUrl: '/samples/generated/track-1.mp3',
  },
  {
    id: '2',
    prompt: 'melancholic indie folk with acoustic guitar',
    status: 'generating',
    progress: 65,
    eta: 45,
    createdAt: Date.now() - 120000,
    genre: 'Folk',
    duration: 60,
  },
  {
    id: '3',
    prompt: 'dark ambient drone with evolving textures',
    status: 'queued',
    progress: 0,
    eta: 120,
    createdAt: Date.now() - 30000,
    genre: 'Ambient',
    duration: 30,
  },
];

const formatTime = (ms: number) => {
  if (ms < 1000) return 'just now';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-500';
    case 'generating':
      return 'text-blue-500';
    case 'queued':
      return 'text-yellow-500';
    case 'failed':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5" />;
    case 'generating':
      return <Zap className="w-5 h-5 animate-pulse" />;
    case 'queued':
      return <Clock className="w-5 h-5" />;
    case 'failed':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return null;
  }
};

export function GenerationQueue({
  jobs = MOCK_JOBS,
  onCancel,
  onRetry,
  onDownload,
  autoScroll = true,
}: GenerationQueueProps) {
  const [localJobs, setLocalJobs] = useState<GenerationJob[]>(jobs);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  // Simulate progress updates for queued jobs
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalJobs(prevJobs =>
        prevJobs.map(job => {
          if (job.status === 'generating' && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 15, 95);
            return { ...job, progress: newProgress };
          }
          return job;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeJobs = localJobs.filter(j => j.status !== 'completed' && j.status !== 'failed');
  const completedJobs = localJobs.filter(j => j.status === 'completed');
  const failedJobs = localJobs.filter(j => j.status === 'failed');

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-bold uppercase text-wise-text-muted block">
          Generation Queue
        </label>
        <p className="text-xs text-wise-text-muted">
          Monitor your music generation jobs in real-time.
        </p>
      </div>

      {/* Queue Summary */}
      {(activeJobs.length > 0 || completedJobs.length > 0 || failedJobs.length > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {activeJobs.length > 0 && (
            <div className="bg-blue-900 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{activeJobs.length}</p>
              <p className="text-xs text-blue-300">Active</p>
            </div>
          )}
          {completedJobs.length > 0 && (
            <div className="bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{completedJobs.length}</p>
              <p className="text-xs text-green-300">Completed</p>
            </div>
          )}
          {failedJobs.length > 0 && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{failedJobs.length}</p>
              <p className="text-xs text-red-300">Failed</p>
            </div>
          )}
        </div>
      )}

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-wise-text-muted">Processing</p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {activeJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className={`mt-0.5 flex-shrink-0 ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-wise-text-primary truncate">{job.prompt}</p>
                        <p className="text-xs text-wise-text-muted mt-1">
                          {job.genre && <span>{job.genre} • </span>}
                          {job.duration && <span>{job.duration}s • </span>}
                          {formatTime(Date.now() - job.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-xs px-2.5 py-1 bg-studio-input rounded-full font-bold text-wise-accent flex-shrink-0">
                      {job.status === 'queued' && 'Queued'}
                      {job.status === 'generating' && `${Math.round(job.progress)}%`}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(job.status === 'generating' || job.status === 'queued') && (
                    <div className="space-y-1">
                      <div className="h-2 bg-studio-line rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-wise-accent-dim to-wise-accent"
                          initial={{ width: '0%' }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      {job.eta && (
                        <p className="text-xs text-wise-text-muted text-right">
                          ~{Math.ceil(job.eta / 60)}s remaining
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-studio-line">
                    {job.status === 'generating' && onCancel && (
                      <button
                        onClick={() => onCancel(job.id)}
                        className="flex-1 px-3 py-1.5 text-sm font-semibold bg-studio-input border border-studio-line rounded hover:border-red-500 hover:text-red-400 transition text-wise-text-primary"
                      >
                        Cancel
                      </button>
                    )}
                    {job.status === 'failed' && onRetry && (
                      <button
                        onClick={() => onRetry(job.id)}
                        className="flex-1 px-3 py-1.5 text-sm font-semibold bg-studio-input border border-studio-line rounded hover:border-wise-accent hover:text-wise-accent transition text-wise-text-primary"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setExpandedJobId(expandedJobId === 'completed' ? null : 'completed')}
            className="w-full text-left text-xs font-bold uppercase text-wise-accent hover:text-wise-accent-bright transition flex items-center justify-between"
          >
            Completed ({completedJobs.length})
            <span className="text-sm">{expandedJobId === 'completed' ? '▼' : '▶'}</span>
          </button>

          <AnimatePresence>
            {expandedJobId === 'completed' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden max-h-60 overflow-y-auto"
              >
                {completedJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-green-900 bg-opacity-10 border border-green-600 border-opacity-30 rounded-lg p-3 flex items-start justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-wise-text-primary truncate">{job.prompt}</p>
                      <p className="text-xs text-wise-text-muted mt-1">
                        Completed {job.completedAt && formatTime(Date.now() - job.completedAt)}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {job.audioUrl && (
                        <>
                          <button
                            onClick={() => new Audio(job.audioUrl).play()}
                            className="p-2 bg-green-600 hover:bg-green-500 rounded transition text-black"
                            title="Play preview"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          {onDownload && (
                            <button
                              onClick={() => onDownload(job.id, job.audioUrl!)}
                              className="p-2 bg-studio-input border border-studio-line rounded hover:border-wise-accent transition text-wise-text-primary"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Failed Jobs */}
      {failedJobs.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setExpandedJobId(expandedJobId === 'failed' ? null : 'failed')}
            className="w-full text-left text-xs font-bold uppercase text-red-400 hover:text-red-300 transition flex items-center justify-between"
          >
            Failed ({failedJobs.length})
            <span className="text-sm">{expandedJobId === 'failed' ? '▼' : '▶'}</span>
          </button>

          <AnimatePresence>
            {expandedJobId === 'failed' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden max-h-60 overflow-y-auto"
              >
                {failedJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-red-900 bg-opacity-10 border border-red-600 border-opacity-30 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-wise-text-primary truncate">{job.prompt}</p>
                        {job.error && (
                          <p className="text-xs text-red-400 mt-1">{job.error}</p>
                        )}
                      </div>
                    </div>
                    {onRetry && (
                      <button
                        onClick={() => onRetry(job.id)}
                        className="w-full py-1.5 text-sm font-semibold bg-red-600 hover:bg-red-500 rounded transition text-white"
                      >
                        Retry
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {localJobs.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-wise-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-sm text-wise-text-muted">No generation jobs yet</p>
          <p className="text-xs text-wise-text-muted mt-1">Start creating music to see jobs here</p>
        </div>
      )}
    </div>
  );
}
