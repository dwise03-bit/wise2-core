/**
 * Suno API Integration Layer - Main Export
 *
 * This module provides a complete integration with the Suno music generation API:
 * - Client for API communication
 * - Queue system for job management and rate limiting
 * - Mock implementation for MVP/testing
 *
 * Usage:
 * ```typescript
 * import { sunoQueue, submitAndWaitForGeneration } from '@/lib/suno';
 *
 * // Submit a generation
 * const { generationId } = await sunoQueue.submitGeneration(userId, params);
 *
 * // Wait for completion with progress
 * const result = await sunoQueue.pollUntilComplete(generationId, (progress, status) => {
 *   console.log(`${progress}% - ${status}`);
 * });
 * ```
 */

// ============================================================================
// SUNO CLIENT EXPORTS
// ============================================================================

export {
  SunoClient,
  SunoConfig,
  SunoError,
  initSunoClient,
  getSunoClient,
} from './sunoClient';

// ============================================================================
// SUNO QUEUE EXPORTS
// ============================================================================

export {
  SunoGenerationQueue,
  sunoQueue,
  submitAndWaitForGeneration,
  submitGenerationBatch,
} from './sunoQueue';

export type {
  QueuedGeneration,
  RateLimitInfo,
  QueueStats,
} from './sunoQueue';

// ============================================================================
// SUNO MOCK EXPORTS
// ============================================================================

export {
  createMockGeneration,
  createMockGenerationResponse,
  createMockStatusResponse,
  generateMockAudio,
  createMockGenerationHistory,
  createMockExportResponse,
  createMockUsageStats,
  MockSunoClient,
  createMockClient,
} from './sunoMock';

export type {
  MockGenerationData,
} from './sunoMock';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  SunoGenerationParams,
  SunoGeneration,
  SunoQueueItem,
  SunoLibraryFilters,
  SunoExportOptions,
  SunoLibraryState,
  SunoGenre,
  SunoMood,
  SunoVoice,
  SunoKey,
  SunoScale,
  GenerationStatus,
  VocalType,
} from '@/types/suno';

export type {
  SunoGenerationRequest,
  SunoGenerationResponse,
  SunoStatusResponse,
  SunoHistoryItem,
  SunoHistoryResponse,
  SunoExportRequest,
  SunoExportResponse,
  GenerationMetadata,
  GenerationRequest,
  GenerationResponse,
  GenerationStatusResponse,
  GenerationResultResponse,
} from '@/types/api';

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

export const SUNO_CONSTANTS = {
  MAX_GENERATIONS_PER_DAY: 10, // MVP rate limit
  POLL_INTERVAL_MS: 2000,
  POLL_TIMEOUT_MS: 300000,
  RETRY_MAX_ATTEMPTS: 3,
  RETRY_BASE_DELAY_MS: 1000,
} as const;

/**
 * Initialize Suno queue with mock mode
 * Useful for development/testing
 */
export const initMockSunoQueue = () => sunoQueue.setMockMode(true);

/**
 * Initialize Suno queue with real API
 */
export const initRealSunoQueue = () => sunoQueue.setMockMode(false);

/**
 * Get current Suno queue state (for debugging)
 */
export const getSunoQueueState = () => sunoQueue.exportState();

/**
 * Get Suno queue statistics
 */
export const getSunoQueueStats = () => sunoQueue.getQueueStats();
