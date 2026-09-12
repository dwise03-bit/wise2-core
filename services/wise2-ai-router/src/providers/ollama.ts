/**
 * Ollama Provider - Local AI inference
 * Calls Ollama API running on localhost:11434
 */

import axios from 'axios';
import { BaseProvider } from './abstract';
import { AIRequest, Model } from '../types/request';

export class OllamaProvider extends BaseProvider {
  name = 'ollama';
  private baseUrl: string;
  private timeout: number = 30000;
  private modelPriority: string[];

  constructor(baseUrl: string = 'http://localhost:11434', modelPriority: string[] = []) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.modelPriority = modelPriority;
  }

  /**
   * Check Ollama health
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: this.timeout,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * List available Ollama models
   */
  async listModels(): Promise<Model[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: this.timeout,
      });

      const models: Model[] = [];
      const modelData = response.data?.models || [];

      for (const m of modelData) {
        const modelId = m.name || m.model;
        const priority = this.getModelPriority(modelId);

        models.push({
          id: modelId,
          name: modelId,
          provider: 'ollama',
          contextWindow: m.details?.context_length || 4096,
          capabilities: this.getCapabilities(modelId),
          priority,
          healthy: true,
          lastHealthCheck: new Date(),
        });
      }

      return models.sort((a, b) => (a.priority || 999) - (b.priority || 999));
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  /**
   * Estimate tokens for a request (without executing)
   */
  async estimate(request: AIRequest): Promise<{ tokens: number; cost: number }> {
    this.validateRequest(request);

    // Estimate input tokens from messages
    const input = request.messages.map((m) => m.content).join('\n');
    const inputTokens = this.estimateTokens(input);

    // Estimate output (assume 50% of input)
    const outputTokens = Math.ceil(inputTokens * 0.5);

    // Ollama is local - cost is always $0
    return {
      tokens: inputTokens + outputTokens,
      cost: 0,
    };
  }

  /**
   * Generate response using Ollama
   */
  async generate(request: AIRequest): Promise<string> {
    this.validateRequest(request);

    // Format messages for Ollama
    const prompt = this.formatPrompt(request.messages);

    // Select model (use first available from priority list)
    const model = await this.selectModel(request);
    if (!model) {
      throw new Error('No suitable Ollama model available');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: model.id,
          prompt,
          stream: false,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
        },
        {
          timeout: request.max_tokens ? request.max_tokens * 10 : 60000, // Longer timeout for large requests
        }
      );

      return response.data?.response || '';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Ollama inference failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Select best model for request
   */
  private async selectModel(request: AIRequest): Promise<Model | null> {
    const models = await this.listModels();

    // Filter by capabilities
    if (request.capabilities_required && request.capabilities_required.length > 0) {
      return models.find((m) =>
        request.capabilities_required!.every((cap) => m.capabilities.includes(cap))
      ) || null;
    }

    // Filter by context window
    const inputTokens = this.estimateTokens(request.messages.map((m) => m.content).join('\n'));
    const available = models.filter((m) => m.contextWindow >= inputTokens);

    if (available.length === 0) {
      return models[0] || null; // Fallback to first model
    }

    // Return highest-priority model
    return available[0];
  }

  /**
   * Format messages as prompt string
   */
  private formatPrompt(messages: Array<{ role: string; content: string }>): string {
    return messages
      .map((m) => {
        const role = m.role.toUpperCase();
        return `${role}: ${m.content}`;
      })
      .join('\n\n');
  }

  /**
   * Get model priority from configured list
   */
  private getModelPriority(modelId: string): number {
    if (!this.modelPriority.length) {
      return 999; // Default priority
    }

    const index = this.modelPriority.findIndex((m) => modelId.includes(m));
    return index >= 0 ? index : 999;
  }

  /**
   * Infer capabilities from model name
   */
  private getCapabilities(modelId: string): string[] {
    const capabilities: string[] = [];

    // Common capability patterns
    if (modelId.includes('coder') || modelId.includes('code')) {
      capabilities.push('code-gen', 'code-analysis');
    }
    if (modelId.includes('qwen')) {
      capabilities.push('reasoning', 'analysis');
    }
    if (modelId.includes('mistral')) {
      capabilities.push('code-gen', 'reasoning');
    }
    if (modelId.includes('gemma')) {
      capabilities.push('reasoning', 'summarization');
    }

    // All models support basic capabilities
    if (capabilities.length === 0) {
      capabilities.push('chat', 'summarization');
    }

    return capabilities;
  }
}
