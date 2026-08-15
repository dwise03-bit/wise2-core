/**
 * Suno API Client
 * Integration with Suno music generation service
 *
 * This module provides a typed client for interacting with the Suno API.
 * It handles request/response formatting, error handling, and retries.
 */

import {
  SunoGenerationRequest,
  SunoGenerationResponse,
  SunoStatusResponse,
  SunoExportResponse,
} from '@/types/api';

export interface SunoConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

/**
 * Suno API Client
 * Handles all interactions with the Suno service
 */
export class SunoClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config: SunoConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.suno.ai';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
  }

  /**
   * Make an authenticated request to the Suno API
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
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new SunoError(
            error.message || `HTTP ${response.status}`,
            response.status,
            error
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx)
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
      duration: request.duration || 180,
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
    if (!id.startsWith('gen_')) {
      throw new Error('Invalid generation ID format');
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
  }) {
    const params = new URLSearchParams();

    if (options?.page) params.append('page', String(options.page));
    if (options?.pageSize) params.append('limit', String(options.pageSize));
    if (options?.sortBy) params.append('sort_by', options.sortBy);
    if (options?.sortOrder) params.append('sort_order', options.sortOrder);

    const queryString = params.toString();
    const path = queryString ? `/v1/generate?${queryString}` : '/v1/generate';

    return this.request(
      'GET',
      path
    );
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
    }
  ): Promise<SunoExportResponse> {
    if (!id.startsWith('gen_')) {
      throw new Error('Invalid generation ID format');
    }

    if (!['mp3', 'wav', 'flac'].includes(format)) {
      throw new Error(`Invalid format: ${format}`);
    }

    const payload = {
      format,
      bitrate: options?.bitrate || (format === 'mp3' ? 192 : undefined),
    };

    return this.request<SunoExportResponse>(
      'POST',
      `/v1/generate/${id}/export`,
      payload
    );
  }

  /**
   * Fetch music file from URL
   * Use the URL returned from getStatus or export
   *
   * @param url Music file URL
   * @returns Binary audio data
   */
  async fetchMusic(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch music: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  /**
   * Cancel a generation
   * Only works if generation is still pending or processing
   *
   * @param id Generation ID
   */
  async cancel(id: string): Promise<{ cancelled: true }> {
    if (!id.startsWith('gen_')) {
      throw new Error('Invalid generation ID format');
    }

    return this.request(
      'POST',
      `/v1/generate/${id}/cancel`
    );
  }

  /**
   * Delete a generation and free storage
   *
   * @param id Generation ID
   */
  async delete(id: string): Promise<{ deleted: true }> {
    if (!id.startsWith('gen_')) {
      throw new Error('Invalid generation ID format');
    }

    return this.request(
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

/**
 * Create and export a singleton Suno client
 * Initialize with SUNO_API_KEY environment variable
 */
let sunoClient: SunoClient | null = null;

export function initSunoClient(config?: Partial<SunoConfig>): SunoClient {
  if (!sunoClient) {
    const apiKey = config?.apiKey || process.env.SUNO_API_KEY;

    if (!apiKey) {
      throw new Error('SUNO_API_KEY environment variable is not set');
    }

    sunoClient = new SunoClient({
      apiKey,
      ...config,
    });
  }

  return sunoClient;
}

export function getSunoClient(): SunoClient {
  if (!sunoClient) {
    return initSunoClient();
  }
  return sunoClient;
}
