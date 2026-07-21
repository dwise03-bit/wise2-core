import pino from 'pino';
import { APIResponse, MetricsResponse, HealthResponse, ActivityResponse } from '@types/api';

const logger = pino();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      logger.error({ endpoint, error }, 'API GET request failed');
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      logger.error({ endpoint, error }, 'API POST request failed');
      throw error;
    }
  }

  async getMetrics(): Promise<MetricsResponse> {
    return this.get<MetricsResponse>('/metrics');
  }

  async getHealth(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/health');
  }

  async getActivity(since?: number): Promise<ActivityResponse> {
    const params = since ? `?since=${since}` : '';
    return this.get<ActivityResponse>(`/activity${params}`);
  }

  async getOrchestratorMetrics() {
    return this.get('/metrics/orchestrator');
  }

  async getSystemMetrics() {
    return this.get('/metrics/system');
  }

  async getSecondBrainMetrics() {
    return this.get('/metrics/second-brain');
  }

  async getDiscordMetrics() {
    return this.get('/metrics/discord');
  }
}

export const apiClient = new APIClient();
