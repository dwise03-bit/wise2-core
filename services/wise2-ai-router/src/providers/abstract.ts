/**
 * Abstract Provider Interface
 * All AI backends (Ollama, Claude, Grok) implement this
 */

import { AIRequest, AIProvider, Model } from '../types/request';

export abstract class BaseProvider implements AIProvider {
  abstract name: string;

  /**
   * Check if provider is healthy and available
   */
  abstract isHealthy(): Promise<boolean>;

  /**
   * List all available models
   */
  abstract listModels(): Promise<Model[]>;

  /**
   * Estimate tokens and cost for a request (without executing)
   */
  abstract estimate(request: AIRequest): Promise<{ tokens: number; cost: number }>;

  /**
   * Generate response from AI model
   */
  abstract generate(request: AIRequest): Promise<string>;

  /**
   * Helper: estimate input tokens (simple heuristic)
   * Real implementation would use tokenizer
   */
  protected estimateTokens(text: string): number {
    // Simple heuristic: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Helper: calculate cost
   */
  protected calculateCost(
    inputTokens: number,
    outputTokens: number,
    inputCostPerToken: number,
    outputCostPerToken: number
  ): number {
    return inputTokens * inputCostPerToken + outputTokens * outputCostPerToken;
  }

  /**
   * Helper: validate request before processing
   */
  protected validateRequest(request: AIRequest): void {
    if (!request.messages || request.messages.length === 0) {
      throw new Error('Request must contain at least one message');
    }

    if (request.max_tokens && request.max_tokens < 1) {
      throw new Error('max_tokens must be positive');
    }

    if (request.max_cost && request.max_cost < 0) {
      throw new Error('max_cost cannot be negative');
    }
  }
}
