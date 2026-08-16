/**
 * Enhanced Suno API Client with Comprehensive Error Handling
 * Integration with Suno music generation service with robust error recovery
 *
 * Features:
 * - Exponential backoff with jitter
 * - Offline queue management
 * - Fallback playback (URL-based)
 * - Storage failure recovery
 * - Detailed error classification and recovery actions
 */

import {
  SunoGenerationRequest,
  SunoGenerationResponse,
  SunoStatusResponse,
  SunoExportResponse,
} from '@/types/api';
import {
  AppError,
  SunoError,
  ErrorType,
  ErrorSeverity,
  ErrorLogger,
  RecoveryAction,
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
  RetryConfig,
} from './error-handling';

export interface SunoConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryConfig?: Partial<RetryConfig>;
  enableOfflineQueue?: boolean;
}

/**
 * Queued generation for offline support
 */
interface QueuedGeneration {
  id: string;
  request: SunoGenerationRequest;
  timestamp: number;
  attempts: number;
}

/**
 * Enhanced Suno API Client with error handling
 */
export class SunoClientEnhanced {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private retryConfig: RetryConfig;
  private enableOfflineQueue: boolean;
  private offlineQueue: Map<string, QueuedGeneration> = new Map();
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor(config: SunoConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.suno.ai';
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.retries || 3;
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retryConfig,
    };
    this.enableOfflineQueue = config.enableOfflineQueue !== false;

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Handle coming online - process queued requests
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.processOfflineQueue();
  }

  /**
   * Handle going offline
   */
  private handleOffline(): void {
    this.isOnline = false;
  }

  /**
   * Make an authenticated request to the Suno API with retry logic
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any,
    attempt: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    try {
      // Check if offline
      if (!this.isOnline) {
        throw new SunoError(
          'No internet connection. Request will be queued for later.',
          ErrorType.NETWORK_OFFLINE,
          {
            code: 'OFFLINE',
            context: { path, method },
          }
        );
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorType = this.classifyHttpError(response.status);

        throw new SunoError(
          errorData.message || `HTTP ${response.status}`,
          errorType,
          {
            code: `HTTP_${response.status}`,
            context: {
              status: response.status,
              errorData,
              path,
              method,
            },
          }
        );
      }

      return await response.json();
    } catch (error) {
      // Categorize and handle different error types
      if (error instanceof SunoError) {
        // Retry if retryable and attempts remaining
        if (error.isRetryable() && attempt < this.maxRetries) {
          const delay = calculateBackoffDelay(attempt, this.retryConfig);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.request<T>(method, path, body, attempt + 1);
        }

        ErrorLogger.log(error);
        throw error;
      }

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new SunoError(
          'Request timeout. The server took too long to respond.',
          ErrorType.GENERATION_TIMEOUT,
          {
            code: 'TIMEOUT',
            context: { path, method, timeout: this.timeout },
            maxRetries: this.maxRetries,
          }
        );

        if (attempt < this.maxRetries) {
          const delay = calculateBackoffDelay(attempt, this.retryConfig);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.request<T>(method, path, body, attempt + 1);
        }

        ErrorLogger.log(timeoutError);
        throw timeoutError;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new SunoError(
          'Network error. Please check your internet connection.',
          ErrorType.NETWORK_OFFLINE,
          {
            code: 'NETWORK_ERROR',
            context: { path, method },
          }
        );

        if (attempt < this.maxRetries) {
          const delay = calculateBackoffDelay(attempt, this.retryConfig);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.request<T>(method, path, body, attempt + 1);
        }

        ErrorLogger.log(networkError);
        throw networkError;
      }

      // Handle unknown errors
      const unknownError = new SunoError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        ErrorType.UNKNOWN,
        {
          context: {
            path,
            method,
            originalError: error instanceof Error ? error.toString() : String(error),
          },
        }
      );

      ErrorLogger.log(unknownError);
      throw unknownError;
    }
  }

  /**
   * Classify HTTP error to ErrorType
   */
  private classifyHttpError(status: number): ErrorType {
    if (status === 401 || status === 403) {
      return ErrorType.AUTH_ERROR;
    }
    if (status === 404) {
      return ErrorType.NOT_FOUND;
    }
    if (status === 429) {
      return ErrorType.RATE_LIMIT;
    }
    if (status >= 400 && status < 500) {
      return ErrorType.INVALID_REQUEST;
    }
    if (status >= 500) {
      return ErrorType.SERVER_ERROR;
    }
    return ErrorType.API_ERROR;
  }

  /**
   * Generate new music
   */
  async generate(request: SunoGenerationRequest): Promise<SunoGenerationResponse> {
    try {
      // Validate input
      if (!request.prompt || request.prompt.length < 10) {
        throw new SunoError(
          'Prompt must be at least 10 characters',
          ErrorType.INVALID_REQUEST,
          { code: 'INVALID_PROMPT' }
        );
      }

      const payload = {
        prompt: request.prompt,
        style: request.style,
        duration: request.duration || 180,
        temperature: request.temperature ?? 0.7,
        tags: request.tags || [],
      };

      const result = await this.request<SunoGenerationResponse>(
        'POST',
        '/v1/generate',
        payload
      );

      // Remove from queue if it was retried
      this.offlineQueue.delete(result.id);

      return result;
    } catch (error) {
      // Queue for later if offline and queueing enabled
      if (
        error instanceof SunoError &&
        error.type === ErrorType.NETWORK_OFFLINE &&
        this.enableOfflineQueue
      ) {
        const queuedId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.offlineQueue.set(queuedId, {
          id: queuedId,
          request,
          timestamp: Date.now(),
          attempts: 0,
        });

        // Create a pending response
        return {
          id: queuedId,
          status: 'Queued',
          progress: 0,
        } as SunoGenerationResponse;
      }

      throw error;
    }
  }

  /**
   * Get generation status with retry
   */
  async getStatus(id: string): Promise<SunoStatusResponse> {
    try {
      if (!id.startsWith('gen_')) {
        throw new SunoError(
          'Invalid generation ID format',
          ErrorType.INVALID_REQUEST,
          { code: 'INVALID_ID_FORMAT' }
        );
      }

      return await this.request<SunoStatusResponse>(
        'GET',
        `/v1/generate/${id}`
      );
    } catch (error) {
      if (error instanceof SunoError) {
        throw error;
      }
      throw new SunoError(
        'Failed to fetch generation status',
        ErrorType.API_ERROR,
        {
          context: { generationId: id },
        }
      );
    }
  }

  /**
   * Get user's generation history
   */
  async getHistory(options?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const params = new URLSearchParams();

      if (options?.page) params.append('page', String(options.page));
      if (options?.pageSize) params.append('limit', String(options.pageSize));
      if (options?.sortBy) params.append('sort_by', options.sortBy);
      if (options?.sortOrder) params.append('sort_order', options.sortOrder);

      const queryString = params.toString();
      const path = queryString ? `/v1/generate?${queryString}` : '/v1/generate';

      return await this.request(
        'GET',
        path
      );
    } catch (error) {
      if (error instanceof SunoError) {
        throw error;
      }
      throw new SunoError(
        'Failed to fetch generation history',
        ErrorType.API_ERROR
      );
    }
  }

  /**
   * Export music in specified format with fallback to URL-based playback
   */
  async export(
    id: string,
    format: 'mp3' | 'wav' | 'flac',
    options?: {
      bitrate?: number;
    }
  ): Promise<SunoExportResponse> {
    try {
      if (!id.startsWith('gen_')) {
        throw new SunoError(
          'Invalid generation ID format',
          ErrorType.INVALID_REQUEST,
          { code: 'INVALID_ID_FORMAT' }
        );
      }

      if (!['mp3', 'wav', 'flac'].includes(format)) {
        throw new SunoError(
          `Invalid format: ${format}`,
          ErrorType.INVALID_REQUEST,
          { code: 'INVALID_FORMAT' }
        );
      }

      const payload = {
        format,
        bitrate: options?.bitrate || (format === 'mp3' ? 192 : undefined),
      };

      return await this.request<SunoExportResponse>(
        'POST',
        `/v1/generate/${id}/export`,
        payload
      );
    } catch (error) {
      // Fallback to URL-based playback if export fails
      if (error instanceof SunoError && error.type === ErrorType.STORAGE_ERROR) {
        // Return URL-based response as fallback
        return {
          url: `${this.baseUrl}/v1/generate/${id}/audio`,
          format: 'stream',
          size: 0,
        } as any;
      }

      if (error instanceof SunoError) {
        throw error;
      }
      throw new SunoError(
        'Failed to export music',
        ErrorType.STORAGE_ERROR,
        {
          context: { generationId: id, format },
        }
      );
    }
  }

  /**
   * Fetch music file from URL with fallback on failure
   */
  async fetchMusic(url: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new SunoError(
          `Failed to fetch music: ${response.statusText}`,
          ErrorType.STORAGE_ERROR,
          {
            code: 'FETCH_FAILED',
            context: { url, status: response.status },
            }
        );
      }

      return response.arrayBuffer();
    } catch (error) {
      if (error instanceof SunoError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new SunoError(
          'Music fetch timed out',
          ErrorType.GENERATION_TIMEOUT,
          {
            code: 'FETCH_TIMEOUT',
            context: { url },
          }
        );
      }

      throw new SunoError(
        'Failed to fetch music file',
        ErrorType.STORAGE_ERROR,
        {
          context: {
            url,
            error: error instanceof Error ? error.message : String(error),
          },
        }
      );
    }
  }

  /**
   * Cancel a generation
   */
  async cancel(id: string): Promise<{ cancelled: true }> {
    try {
      if (!id.startsWith('gen_')) {
        throw new SunoError(
          'Invalid generation ID format',
          ErrorType.INVALID_REQUEST
        );
      }

      // Remove from offline queue if exists
      this.offlineQueue.delete(id);

      return await this.request(
        'POST',
        `/v1/generate/${id}/cancel`
      );
    } catch (error) {
      if (error instanceof SunoError) {
        throw error;
      }
      throw new SunoError(
        'Failed to cancel generation',
        ErrorType.API_ERROR,
        { context: { generationId: id } }
      );
    }
  }

  /**
   * Delete a generation and free storage
   */
  async delete(id: string): Promise<{ deleted: true }> {
    try {
      if (!id.startsWith('gen_')) {
        throw new SunoError(
          'Invalid generation ID format',
          ErrorType.INVALID_REQUEST
        );
      }

      this.offlineQueue.delete(id);

      return await this.request(
        'DELETE',
        `/v1/generate/${id}`
      );
    } catch (error) {
      if (error instanceof SunoError) {
        throw error;
      }
      throw new SunoError(
        'Failed to delete generation',
        ErrorType.API_ERROR,
        { context: { generationId: id } }
      );
    }
  }

  /**
   * Get API usage statistics
   */
  async getUsage() {
    try {
      return await this.request('GET', '/v1/usage');
    } catch (error) {
      if (error instanceof SunoError) {
        throw error;
      }
      throw new SunoError(
        'Failed to fetch API usage',
        ErrorType.API_ERROR
      );
    }
  }

  /**
   * Get available music styles and presets
   */
  async getStyles() {
    try {
      return await this.request('GET', '/v1/styles');
    } catch (error) {
      if (error instanceof SunoError) {
        throw error;
      }
      throw new SunoError(
        'Failed to fetch styles',
        ErrorType.API_ERROR
      );
    }
  }

  /**
   * Process offline queue when coming online
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.size === 0) return;

    const queueItems = Array.from(this.offlineQueue.values());

    for (const item of queueItems) {
      try {
        await this.generate(item.request);
        this.offlineQueue.delete(item.id);
      } catch (error) {
        if (error instanceof SunoError && error.type === ErrorType.NETWORK_OFFLINE) {
          // Still offline, stop processing
          break;
        }

        // Update attempt count
        item.attempts += 1;
        if (item.attempts >= this.maxRetries) {
          this.offlineQueue.delete(item.id);
          ErrorLogger.log(
            new SunoError(
              'Queued generation failed after max retries',
              ErrorType.GENERATION_FAILED,
              { context: { queuedId: item.id, attempts: item.attempts } }
            )
          );
        }
      }
    }
  }

  /**
   * Get pending offline queue
   */
  getOfflineQueue(): QueuedGeneration[] {
    return Array.from(this.offlineQueue.values());
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isOnline;
  }
}

/**
 * Create and export a singleton Suno client
 */
let sunoClient: SunoClientEnhanced | null = null;

export function initSunoClientEnhanced(config?: Partial<SunoConfig>): SunoClientEnhanced {
  if (!sunoClient) {
    const apiKey = config?.apiKey || process.env.SUNO_API_KEY;

    if (!apiKey) {
      throw new SunoError(
        'SUNO_API_KEY environment variable is not set',
        ErrorType.AUTH_ERROR,
        { code: 'MISSING_API_KEY' }
      );
    }

    sunoClient = new SunoClientEnhanced({
      apiKey,
      ...config,
    });
  }

  return sunoClient;
}

export function getSunoClientEnhanced(): SunoClientEnhanced {
  if (!sunoClient) {
    return initSunoClientEnhanced();
  }
  return sunoClient;
}
