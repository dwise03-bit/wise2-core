/**
 * Suno Music Generation Queue System
 * Manages generation jobs with polling, retries, and rate limiting
 *
 * Features:
 * - Job queuing with priority support
 * - Status polling with exponential backoff
 * - Rate limiting (10 generations/day per user for MVP)
 * - Automatic retry with exponential backoff
 * - Mock mode for MVP when API unavailable
 */

import { GenerationStatus, SunoGeneration } from '@/types/suno';
import { SunoGenerationRequest, GenerationMetadata } from '@/types/api';
import { getSunoClient, SunoError } from './sunoClient';
import { createMockGeneration, generateMockAudio } from './sunoMock';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_GENERATIONS_PER_DAY = 10; // MVP rate limit
const POLL_INTERVAL_MS = 2000; // Check generation status every 2 seconds
const POLL_TIMEOUT_MS = 300000; // Stop polling after 5 minutes
const RETRY_MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000; // Start with 1 second, double each time

// ============================================================================
// TYPES
// ============================================================================

export interface QueuedGeneration {
  id: string;
  userId: string;
  generationParams: SunoGenerationRequest;
  status: GenerationStatus;
  progress: number; // 0-100
  priority: number; // 0-10, higher = sooner
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  error?: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface RateLimitInfo {
  userId: string;
  generationsToday: number;
  maxGenerationsPerDay: number;
  resetTime: Date;
  isLimited: boolean;
}

export interface QueueStats {
  totalQueued: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  averageGenerationTime: number; // milliseconds
}

// ============================================================================
// SUNO QUEUE
// ============================================================================

export class SunoGenerationQueue {
  private queue: Map<string, QueuedGeneration> = new Map();
  private processing: Set<string> = new Set();
  private userGenerationStats: Map<string, Date[]> = new Map(); // Track generation timestamps per user
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private useMock: boolean = false;
  private maxConcurrent = 5;

  constructor(useMock: boolean = false) {
    this.useMock = useMock;
  }

  /**
   * Enable mock mode (when API unavailable)
   */
  setMockMode(enabled: boolean): void {
    this.useMock = enabled;
  }

  /**
   * Submit a generation to the queue
   * Returns the generation ID for tracking
   */
  async submitGeneration(
    userId: string,
    params: SunoGenerationRequest,
    priority: number = 5
  ): Promise<{ generationId: string; estimatedTime: number }> {
    // Check rate limit
    const rateLimitInfo = this.checkRateLimit(userId);
    if (rateLimitInfo.isLimited) {
      throw new Error(
        `Rate limit exceeded. Max ${MAX_GENERATIONS_PER_DAY} generations per day. ` +
        `Resets at ${rateLimitInfo.resetTime.toISOString()}`
      );
    }

    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const queuedGen: QueuedGeneration = {
      id: generationId,
      userId,
      generationParams: params,
      status: 'Queued',
      progress: 0,
      priority: Math.max(0, Math.min(10, priority)), // Clamp 0-10
      createdAt: new Date(),
      retryCount: 0,
    };

    this.queue.set(generationId, queuedGen);
    this.recordGeneration(userId);

    // Start processing if not at capacity
    if (this.processing.size < this.maxConcurrent) {
      this.processGenerationAsync(generationId);
    }

    // Estimate based on queue size
    const estimatedTime = this.estimateGenerationTime(priority);

    return { generationId, estimatedTime };
  }

  /**
   * Get generation status
   */
  getStatus(generationId: string): QueuedGeneration | undefined {
    return this.queue.get(generationId);
  }

  /**
   * Poll for generation completion (returns once complete or timeout)
   */
  async pollUntilComplete(
    generationId: string,
    onProgress?: (progress: number, status: GenerationStatus) => void
  ): Promise<QueuedGeneration> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        const gen = this.queue.get(generationId);

        if (!gen) {
          clearInterval(interval);
          reject(new Error(`Generation ${generationId} not found`));
          return;
        }

        // Call progress callback
        onProgress?.(gen.progress, gen.status);

        if (gen.status === 'Completed') {
          clearInterval(interval);
          resolve(gen);
          return;
        }

        if (gen.status === 'Failed') {
          clearInterval(interval);
          reject(new Error(gen.error || 'Generation failed'));
          return;
        }

        // Check timeout
        if (Date.now() - startTime > POLL_TIMEOUT_MS) {
          clearInterval(interval);
          reject(new Error(`Polling timeout after ${POLL_TIMEOUT_MS / 1000} seconds`));
          return;
        }
      };

      const interval = setInterval(checkStatus, POLL_INTERVAL_MS);
      checkStatus(); // Check immediately
    });
  }

  /**
   * Cancel a generation (if still queued/processing)
   */
  async cancelGeneration(generationId: string): Promise<boolean> {
    const gen = this.queue.get(generationId);
    if (!gen) return false;

    if (gen.status === 'Completed' || gen.status === 'Failed' || gen.status === 'Cancelled') {
      return false;
    }

    // Stop polling if active
    this.stopPolling(generationId);

    // If already processing with API, try to cancel via API
    if (gen.status === 'Generating' && !this.useMock) {
      try {
        const client = getSunoClient();
        await client.cancel(generationId);
      } catch (error) {
        console.error('Failed to cancel via API:', error);
      }
    }

    gen.status = 'Cancelled';
    gen.completedAt = new Date();
    this.processing.delete(generationId);

    return true;
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): QueueStats {
    const generations = Array.from(this.queue.values());
    const completed = generations.filter(g => g.status === 'Completed');

    const avgTime = completed.length > 0
      ? completed.reduce((sum, g) => {
          if (g.startedAt && g.completedAt) {
            return sum + (g.completedAt.getTime() - g.startedAt.getTime());
          }
          return sum;
        }, 0) / completed.length
      : 0;

    return {
      totalQueued: generations.filter(g => g.status === 'Queued').length,
      totalProcessing: this.processing.size,
      totalCompleted: completed.length,
      totalFailed: generations.filter(g => g.status === 'Failed').length,
      averageGenerationTime: Math.round(avgTime),
    };
  }

  /**
   * Get user's rate limit info
   */
  checkRateLimit(userId: string): RateLimitInfo {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userGenerations = this.userGenerationStats.get(userId) || [];
    const todayGenerations = userGenerations.filter(
      date => date.getTime() >= today.getTime() && date.getTime() < tomorrow.getTime()
    );

    return {
      userId,
      generationsToday: todayGenerations.length,
      maxGenerationsPerDay: MAX_GENERATIONS_PER_DAY,
      resetTime: tomorrow,
      isLimited: todayGenerations.length >= MAX_GENERATIONS_PER_DAY,
    };
  }

  /**
   * Get user's generation history (from queue)
   */
  getUserGenerations(userId: string, limit: number = 50): QueuedGeneration[] {
    return Array.from(this.queue.values())
      .filter(g => g.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Convert to SunoGeneration type (for API responses)
   */
  toSunoGeneration(queued: QueuedGeneration): SunoGeneration {
    return {
      id: queued.id,
      params: {
        prompt: queued.generationParams.prompt,
        genre: 'Electronic' as any, // Default, should be from params
        mood: 'Energetic' as any,
        tempo: 120,
        duration: queued.generationParams.duration || 30,
        voice: 'Bella' as any,
        vocalType: 'Vocal' as any,
        key: 'C',
        scale: 'Major',
      },
      status: queued.status,
      createdAt: queued.createdAt,
      completedAt: queued.completedAt,
      audioUrl: undefined, // Will be populated when complete
      duration: queued.generationParams.duration || 30,
      bitrate: '192k',
      fileSize: '~5.7MB',
      tags: [],
      isFavorite: false,
      playCount: 0,
      exportedFormats: [],
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Process a generation asynchronously
   */
  private async processGenerationAsync(generationId: string): Promise<void> {
    const gen = this.queue.get(generationId);
    if (!gen || this.processing.has(generationId)) return;

    this.processing.add(generationId);
    gen.startedAt = new Date();
    gen.status = 'Generating';

    try {
      if (this.useMock) {
        await this.processWithMock(gen);
      } else {
        await this.processWithApi(gen);
      }
    } catch (error) {
      await this.handleGenerationError(gen, error);
    } finally {
      this.processing.delete(generationId);
      this.processNextInQueue();
    }
  }

  /**
   * Process generation using real Suno API
   */
  private async processWithApi(gen: QueuedGeneration): Promise<void> {
    const client = getSunoClient();

    try {
      // Submit generation
      const response = await client.generate(gen.generationParams);

      // Update with API response ID
      const apiGenerationId = response.id;

      // Poll for completion
      await this.pollApiGeneration(gen, apiGenerationId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Poll the API for generation status
   */
  private async pollApiGeneration(
    gen: QueuedGeneration,
    apiGenerationId: string
  ): Promise<void> {
    const client = getSunoClient();
    const startTime = Date.now();
    const maxPollTime = 600000; // 10 minutes max for API calls

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await client.getStatus(apiGenerationId);

          // Update progress
          gen.progress = status.progress ?? 0;

          if (status.status === 'completed' || status.status === 'Completed') {
            gen.status = 'Completed';
            gen.completedAt = new Date();
            gen.progress = 100;

            if (status.musicUrl) {
              // TODO: Store or reference the music URL
            }

            this.stopPolling(gen.id);
            resolve();
            return;
          }

          if (status.status === 'failed' || status.status === 'Failed') {
            gen.status = 'Failed';
            gen.error = status.errorMessage || 'Unknown API error';
            gen.completedAt = new Date();
            this.stopPolling(gen.id);
            reject(new Error(gen.error));
            return;
          }

          // Check timeout
          if (Date.now() - startTime > maxPollTime) {
            throw new Error('API polling timeout');
          }
        } catch (error) {
          this.stopPolling(gen.id);
          reject(error);
        }
      };

      const interval = setInterval(poll, POLL_INTERVAL_MS);
      this.pollingIntervals.set(gen.id, interval);
      poll(); // Poll immediately
    });
  }

  /**
   * Process generation using mock (for MVP)
   */
  private async processWithMock(gen: QueuedGeneration): Promise<void> {
    const mockGen = createMockGeneration(gen.id, gen.generationParams);

    // Simulate generation time (30-60 seconds)
    const simulationTime = Math.random() * 30000 + 30000;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const simulate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(99, Math.round((elapsed / simulationTime) * 100));

        gen.progress = progress;

        if (elapsed >= simulationTime) {
          gen.status = 'Completed';
          gen.completedAt = new Date();
          gen.progress = 100;
          this.stopPolling(gen.id);
          resolve();
          return;
        }

        this.pollingIntervals.set(gen.id, setTimeout(simulate, 500));
      };

      simulate();
    });
  }

  /**
   * Handle generation error with retry logic
   */
  private async handleGenerationError(
    gen: QueuedGeneration,
    error: any
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Don't retry on rate limit errors
    if (errorMessage.includes('Rate limit')) {
      gen.status = 'Failed';
      gen.error = errorMessage;
      gen.completedAt = new Date();
      return;
    }

    if (gen.retryCount < RETRY_MAX_ATTEMPTS) {
      // Retry with exponential backoff
      gen.retryCount++;
      gen.status = 'Queued';
      gen.progress = 0;
      gen.startedAt = undefined;

      const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, gen.retryCount - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));

      return this.processGenerationAsync(gen.id);
    } else {
      // Max retries exceeded
      gen.status = 'Failed';
      gen.error = `Failed after ${RETRY_MAX_ATTEMPTS} retries: ${errorMessage}`;
      gen.completedAt = new Date();
    }
  }

  /**
   * Process next generation in queue
   */
  private processNextInQueue(): void {
    if (this.processing.size >= this.maxConcurrent) return;

    // Find next highest priority queued generation
    let nextGen: QueuedGeneration | null = null;
    let nextId: string | null = null;

    for (const [id, gen] of this.queue.entries()) {
      if (gen.status === 'Queued' && !this.processing.has(id)) {
        if (!nextGen || gen.priority > nextGen.priority) {
          nextGen = gen;
          nextId = id;
        }
      }
    }

    if (nextId && nextGen) {
      this.processGenerationAsync(nextId);
    }
  }

  /**
   * Record generation for rate limiting
   */
  private recordGeneration(userId: string): void {
    if (!this.userGenerationStats.has(userId)) {
      this.userGenerationStats.set(userId, []);
    }
    this.userGenerationStats.get(userId)!.push(new Date());
  }

  /**
   * Stop polling for a generation
   */
  private stopPolling(generationId: string): void {
    const interval = this.pollingIntervals.get(generationId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(generationId);
    }
  }

  /**
   * Estimate generation time based on queue position
   */
  private estimateGenerationTime(priority: number): number {
    const stats = this.getQueueStats();
    const avgTime = stats.averageGenerationTime || 45000; // Default 45 seconds

    // Rough estimate: current time + (items in queue * avg time / concurrent capacity)
    const queueWaitTime = (stats.totalQueued * avgTime) / this.maxConcurrent;

    return Math.round((avgTime + queueWaitTime) / 1000); // Return in seconds
  }

  /**
   * Export queue state for debugging
   */
  exportState() {
    return {
      queue: Array.from(this.queue.values()),
      processing: Array.from(this.processing),
      stats: this.getQueueStats(),
    };
  }
}

// Export singleton instance
export const sunoQueue = new SunoGenerationQueue(false);

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Submit a generation and wait for completion
 * Useful for simple fire-and-forget scenarios
 */
export async function submitAndWaitForGeneration(
  userId: string,
  params: SunoGenerationRequest,
  onProgress?: (progress: number, status: GenerationStatus) => void
): Promise<QueuedGeneration> {
  const { generationId } = await sunoQueue.submitGeneration(userId, params, 5);
  return sunoQueue.pollUntilComplete(generationId, onProgress);
}

/**
 * Submit generation batch
 */
export async function submitGenerationBatch(
  userId: string,
  paramsArray: SunoGenerationRequest[],
  priority: number = 5
): Promise<string[]> {
  const generationIds: string[] = [];

  for (const params of paramsArray) {
    const { generationId } = await sunoQueue.submitGeneration(userId, params, priority);
    generationIds.push(generationId);
  }

  return generationIds;
}
