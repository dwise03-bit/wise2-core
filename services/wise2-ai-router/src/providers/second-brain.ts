/**
 * Second Brain Client - Knowledge retrieval from Hermes/MongoDB
 * Enriches AI requests with context from the knowledge base
 */

import axios, { AxiosInstance } from 'axios';

export interface SecondBrainContext {
  id: string;
  content: string;
  relevance: number;
  source: string;
  timestamp: string;
}

export interface SecondBrainQuery {
  question: string;
  limit?: number;
  threshold?: number;
}

export interface SecondBrainResponse {
  contexts: SecondBrainContext[];
  summary: string;
  confidence: number;
}

export class SecondBrainClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.SECOND_BRAIN_URL || 'http://127.0.0.1:3012';
    this.enabled = process.env.SECOND_BRAIN_ENABLED !== 'false';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Query Second Brain for relevant context
   */
  async query(prompt: string, limit = 3): Promise<SecondBrainResponse | null> {
    if (!this.enabled) {
      console.log('⚠️ Second Brain disabled (SECOND_BRAIN_ENABLED=false)');
      return null;
    }

    try {
      const response = await this.client.post('/brain-api/search', {
        query: prompt,
        limit,
        threshold: 0.3,
      });

      if (!response.data || !response.data.contexts) {
        return null;
      }

      return {
        contexts: response.data.contexts || [],
        summary: response.data.summary || '',
        confidence: response.data.confidence || 0,
      };
    } catch (error) {
      console.warn('⚠️ Second Brain query failed (graceful degradation):', (error as Error).message);
      return null;
    }
  }

  /**
   * Build enriched prompt with context
   */
  buildContextPrompt(userPrompt: string, context: SecondBrainResponse | null): string {
    if (!context || context.contexts.length === 0) {
      return userPrompt;
    }

    const contextBlock = context.contexts
      .map((ctx, i) => `[Reference ${i + 1}] ${ctx.content}`)
      .join('\n\n');

    return `You have the following context from the knowledge base:\n\n${contextBlock}\n\nBased on this context, answer the user's question:\n\n${userPrompt}`;
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      const response = await this.client.get('/health', { timeout: 2000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
