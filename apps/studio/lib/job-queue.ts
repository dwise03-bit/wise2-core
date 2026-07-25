/**
 * Job Queue System for Music Generation
 * Implements priority queue with retry logic and timeout handling
 * For production, replace with Redis + Celery
 */

import { GenerationMetadata } from '@/types/api';
import { generationDb } from './generation-db';

// ============================================================================
// JOB TYPES
// ============================================================================

export interface Job {
  id: string;
  userId: string;
  type: 'generation';
  payload: any;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number; // 0-10, higher is priority
  retries: number;
  maxRetries: number;
  timeout: number; // milliseconds
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
}

// ============================================================================
// JOB QUEUE
// ============================================================================

class JobQueue {
  private queue: Job[] = [];
  private processing: Set<string> = new Set();
  private maxConcurrent = 5; // Parallel jobs
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Add a job to the queue
   */
  enqueue(job: Job): void {
    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    this.startProcessing();
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job | undefined {
    return this.queue.find(j => j.id === jobId);
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queued: number;
    processing: number;
    capacity: number;
  } {
    return {
      queued: this.queue.filter(j => j.status === 'queued').length,
      processing: this.processing.size,
      capacity: this.maxConcurrent,
    };
  }

  /**
   * Start processing queue
   */
  private startProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processNext();
    }, 1000); // Check every second
  }

  /**
   * Stop processing
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Process next job in queue
   */
  private async processNext(): Promise<void> {
    // Can only process if under concurrent limit
    if (this.processing.size >= this.maxConcurrent) {
      return;
    }

    // Get next queued job
    const job = this.queue.find(j => j.status === 'queued');
    if (!job) {
      // Stop interval if queue is empty
      if (this.queue.every(j => j.status !== 'queued')) {
        this.stopProcessing();
      }
      return;
    }

    // Start processing
    this.processing.add(job.id);
    job.status = 'processing';
    job.startedAt = new Date().toISOString();

    try {
      // Call job processor
      await this.processJob(job);
    } catch (error) {
      // Handle failure with retry logic
      this.handleJobFailure(job, error);
    } finally {
      this.processing.delete(job.id);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<void> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Job timeout'));
      }, job.timeout);
    });

    if (job.type === 'generation') {
      try {
        // Call MusicGen service with timeout
        const result = await Promise.race([
          this.callGenerationService(job),
          timeoutPromise,
        ]);

        // Mark as complete
        job.status = 'completed';
        job.completedAt = new Date().toISOString();

        // Update database
        const generation = generationDb.getById(job.payload.generationId);
        if (generation) {
          generationDb.markComplete(job.payload.generationId, result.audioUrl, {
            generationTime: new Date(job.completedAt).getTime() - new Date(job.startedAt!).getTime(),
            modelVersion: result.modelVersion,
            qualityScore: result.qualityScore,
          });
        }
      } catch (error) {
        throw error;
      }
    }
  }

  /**
   * Call MusicGen service
   */
  private async callGenerationService(job: Job): Promise<{
    audioUrl: string;
    modelVersion: string;
    qualityScore: number;
  }> {
    const { prompt, genre, mood, tempo, duration, key, intensity } = job.payload;

    // TODO: Replace with actual MusicGen API call
    // For now, simulate generation with delay
    const generationTime = Math.random() * 30000 + 10000; // 10-40 seconds
    await new Promise(resolve => setTimeout(resolve, generationTime));

    // Simulate audio URL and quality score
    return {
      audioUrl: `s3://wise2-generations/${job.id}.wav`,
      modelVersion: 'musicgen-v1.0',
      qualityScore: Math.floor(Math.random() * 30 + 70), // 70-100
    };
  }

  /**
   * Handle job failure with retry logic
   */
  private handleJobFailure(job: Job, error: any): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (job.retries < job.maxRetries) {
      // Retry with exponential backoff
      job.retries++;
      job.status = 'queued';
      job.startedAt = undefined;

      // Update priority based on retries (lower priority for retries)
      job.priority = Math.max(0, job.priority - 1);

      // Update generation status
      const generation = generationDb.getById(job.payload.generationId);
      if (generation) {
        generationDb.updateStatus(job.payload.generationId, 'queued', {
          progress: 0,
        });
      }
    } else {
      // Max retries exceeded
      job.status = 'failed';
      job.error = errorMessage;
      job.completedAt = new Date().toISOString();

      // Update generation status
      const generation = generationDb.getById(job.payload.generationId);
      if (generation) {
        generationDb.markFailed(job.payload.generationId, errorMessage);
      }
    }
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Export queue state (for debugging)
   */
  exportState(): {
    queue: Job[];
    processing: Set<string>;
  } {
    return {
      queue: this.queue,
      processing: this.processing,
    };
  }
}

// Export singleton instance
export const jobQueue = new JobQueue();

// ============================================================================
// JOB CREATION UTILITIES
// ============================================================================

export function createGenerationJob(
  userId: string,
  generationId: string,
  params: {
    prompt: string;
    genre?: string;
    mood?: string;
    tempo?: number;
    duration?: number;
    key?: string;
    intensity?: number;
  },
  priority: number = 5
): Job {
  return {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: 'generation',
    payload: {
      generationId,
      ...params,
    },
    status: 'queued',
    priority,
    retries: 0,
    maxRetries: 3,
    timeout: 120000, // 2 minutes
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// QUEUE STATISTICS
// ============================================================================

export function getQueueStats(): {
  totalQueued: number;
  totalProcessing: number;
  averageWaitTime: number;
  totalCompleted: number;
  totalFailed: number;
} {
  const state = jobQueue.exportState();
  const allGenerations = generationDb.exportAll();

  const queued = state.queue.filter(j => j.status === 'queued').length;
  const processing = state.processing.size;

  // Calculate average wait time
  const waitTimes = state.queue
    .filter(j => j.status === 'queued')
    .map(j => new Date().getTime() - new Date(j.createdAt).getTime());
  const averageWaitTime = waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b) / waitTimes.length) : 0;

  const completed = allGenerations.filter(g => g.status === 'completed').length;
  const failed = allGenerations.filter(g => g.status === 'failed').length;

  return {
    totalQueued: queued,
    totalProcessing: processing,
    averageWaitTime,
    totalCompleted: completed,
    totalFailed: failed,
  };
}
