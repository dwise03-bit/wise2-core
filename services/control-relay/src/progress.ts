import type { JobPhase, JobProgress } from './types.js';

export type ProgressTracker = {
  start(progress: Omit<JobProgress, 'updatedAt' | 'phase'>): JobProgress;
  advance(jobId: string, phase: JobPhase, patch?: Partial<JobProgress>): JobProgress | undefined;
  get(jobId: string): JobProgress | undefined;
  list(): JobProgress[];
};

/**
 * Sanitized, pollable job state for the Discord result card. Kept in memory: a relay
 * restart loses the card, never a decision — the audit log is the durable record.
 */
export function createProgressTracker(retentionMs = 60 * 60 * 1000, now: () => number = Date.now): ProgressTracker {
  const jobs = new Map<string, JobProgress>();
  const sweep = (): void => {
    const cutoff = now() - retentionMs;
    for (const [jobId, progress] of jobs) {
      if (Date.parse(progress.updatedAt) <= cutoff) jobs.delete(jobId);
    }
  };
  return {
    start(input) {
      sweep();
      const progress: JobProgress = { ...input, phase: 'accepted', updatedAt: new Date(now()).toISOString() };
      jobs.set(progress.jobId, progress);
      return progress;
    },
    advance(jobId, phase, patch = {}) {
      const current = jobs.get(jobId);
      if (!current) return undefined;
      const finished = phase === 'complete' || phase === 'failed' || phase === 'blocked';
      const next: JobProgress = {
        ...current,
        ...patch,
        phase,
        updatedAt: new Date(now()).toISOString(),
        finishedAt: finished ? new Date(now()).toISOString() : current.finishedAt,
      };
      jobs.set(jobId, next);
      return next;
    },
    get(jobId) {
      sweep();
      return jobs.get(jobId);
    },
    list() {
      sweep();
      return [...jobs.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  };
}
