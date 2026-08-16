/**
 * Suno API Client
 * Integration with Suno music generation service
 *
 * Features:
 * - Authenticated API requests with retry logic
 * - Exponential backoff for transient failures
 * - Type-safe request/response handling
 * - Support for generation, status polling, export, and history
 */

import {
  SunoGenerationRequest,
  SunoGenerationResponse,
  SunoStatusResponse,
  SunoExportResponse,
  SunoHistoryResponse,
} from '@/types/api';

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

export interface SunoConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

/**
 * Custom error class for Suno API errors
 */
export class SunoError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any
  ) {
    super(message);
    this.name = 'SunoError';
  }
}

// ============================================================================
// SUNO CLIENT
// ============================================================================

/**
 * Main Suno API Client
 * Handles all interactions with the Suno music generation service
 */
export class SunoClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config: SunoConfig) {
    if (!config.apiKey) {
      throw new Error('SUNO_API_KEY is required');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.suno.ai';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
  }

  /**
   * Make an authenticated request to the Suno API
   * Includes retry logic with exponential backoff
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
          const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new SunoError(
              error.message || `HTTP ${response.status}`,
              response.status,
              error
            );
          }

          return await response.json();
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx) or timeouts
        if (error instanceof SunoError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.retries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to complete request after retries');
  }

  /**
   * Generate new music
   *
   * @param request Generation parameters
   * @returns Generation response with ID for polling
   */
  async generate(request: SunoGenerationRequest): Promise<SunoGenerationResponse> {
    // Validate input
    if (!request.prompt || request.prompt.length < 10) {
      throw new Error('Prompt must be at least 10 characters');
    }

    const payload = {
      prompt: request.prompt,
      style: request.style,
      duration: request.duration || 30,
      temperature: request.temperature ?? 0.7,
      tags: request.tags || [],
    };

    return this.request<SunoGenerationResponse>(
      'POST',
      '/v1/generate',
      payload
    );
  }

  /**
   * Get generation status
   *
   * @param id Generation ID
   * @returns Current status and progress
   */
  async getStatus(id: string): Promise<SunoStatusResponse> {
    if (!id) {
      throw new Error('Generation ID is required');
    }

    return this.request<SunoStatusResponse>(
      'GET',
      `/v1/generate/${id}`
    );
  }

  /**
   * Get user's generation history
   *
   * @param options Pagination and sorting options
   * @returns Paginated list of generations
   */
  async getHistory(options?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<SunoHistoryResponse> {
    const params = new URLSearchParams();

    if (options?.page) params.append('page', String(options.page));
    if (options?.pageSize) params.append('limit', String(options.pageSize));
    if (options?.sortBy) params.append('sort_by', options.sortBy);
    if (options?.sortOrder) params.append('sort_order', options.sortOrder);

    const queryString = params.toString();
    const path = queryString ? `/v1/generate?${queryString}` : '/v1/generate';

    return this.request<SunoHistoryResponse>('GET', path);
  }

  /**
   * Export music in specified format
   *
   * @param id Generation ID
   * @param format Export format (mp3, wav, flac)
   * @param options Additional export options
   * @returns Download URL for exported file
   */
  async export(
    id: string,
    format: 'mp3' | 'wav' | 'flac',
    options?: {
      bitrate?: number;
      quality?: 'high' | 'medium' | 'low';
    }
  ): Promise<SunoExportResponse> {
    if (!id) {
      throw new Error('Generation ID is required');
    }

    if (!['mp3', 'wav', 'flac'].includes(format)) {
      throw new Error(`Invalid format: ${format}. Must be mp3, wav, or flac`);
    }

    const payload: any = {
      format,
    };

    // Add optional bitrate or quality
    if (options?.bitrate) {
      payload.bitrate = options.bitrate;
    }
    if (options?.quality) {
      payload.quality = options.quality;
    }

    return this.request<SunoExportResponse>(
      'POST',
      `/v1/generate/${id}/export`,
      payload
    );
  }

  /**
   * Download music file from URL
   * Use the URL returned from getStatus or export
   *
   * @param url Music file URL
   * @returns Binary audio data
   */
  async downloadMusic(url: string): Promise<ArrayBuffer> {
    if (!url) {
      throw new Error('Music URL is required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to download music: ${response.statusText}`);
      }

      return response.arrayBuffer();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Cancel a generation
   * Only works if generation is still pending or processing
   *
   * @param id Generation ID
   * @returns Confirmation of cancellation
   */
  async cancel(id: string): Promise<{ cancelled: true }> {
    if (!id) {
      throw new Error('Generation ID is required');
    }

    return this.request<{ cancelled: true }>(
      'POST',
      `/v1/generate/${id}/cancel`
    );
  }

  /**
   * Delete a generation and free storage
   *
   * @param id Generation ID
   * @returns Confirmation of deletion
   */
  async delete(id: string): Promise<{ deleted: true }> {
    if (!id) {
      throw new Error('Generation ID is required');
    }

    return this.request<{ deleted: true }>(
      'DELETE',
      `/v1/generate/${id}`
    );
  }

  /**
   * Get API usage statistics
   */
  async getUsage() {
    return this.request(
      'GET',
      '/v1/usage'
    );
  }

  /**
   * Get available music styles and presets
   */
  async getStyles() {
    return this.request(
      'GET',
      '/v1/styles'
    );
  }

  /**
   * Check API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getUsage();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ============================================================================
// SINGLETON INITIALIZATION
// ============================================================================

let sunoClient: SunoClient | null = null;

/**
 * Initialize the Suno client
 * Call once at application startup
 *
 * @param config Optional configuration (uses SUNO_API_KEY env var if not provided)
 * @returns The initialized client
 */
export function initSunoClient(config?: Partial<SunoConfig>): SunoClient {
  if (!sunoClient) {
    const apiKey = config?.apiKey || process.env.SUNO_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Suno API key not found. Set SUNO_API_KEY environment variable or pass it to initSunoClient()'
      );
    }

    sunoClient = new SunoClient({
      apiKey,
      ...config,
    });
  }

  return sunoClient;
}

/**
 * Get the Suno client instance
 * Initializes if not already initialized
 *
 * @throws Error if SUNO_API_KEY is not set and client not initialized
 * @returns The Suno client
 */
export function getSunoClient(): SunoClient {
  if (!sunoClient) {
    return initSunoClient();
  }
  return sunoClient;
}

/**
 * Reset the Suno client (useful for testing)
 */
export function resetSunoClient(): void {
  sunoClient = null;
}
