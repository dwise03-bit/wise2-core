/**
 * AI Provider Manager
 * Routes requests to the appropriate AI provider
 */

import { BaseAIProvider, AIMessage, AIResponse, AIStreamEvent } from './providers/base';
import { OllamaProvider } from './providers/ollama';
import { ClaudeProvider } from './providers/claude';
import { ChatGPTProvider } from './providers/chatgpt';
import { GeminiProvider } from './providers/gemini';
import { AI_MODELS, AIProvider } from './config';

export class AIManager {
  private providers: Map<string, BaseAIProvider> = new Map();
  private defaultModel: string = 'claude-opus';

  constructor(defaultModel?: string) {
    if (defaultModel) {
      this.defaultModel = defaultModel;
    }
  }

  private getProvider(modelId: string): BaseAIProvider {
    // Return cached provider if available
    if (this.providers.has(modelId)) {
      return this.providers.get(modelId)!;
    }

    const model = AI_MODELS[modelId];
    if (!model) {
      throw new Error(`Unknown model: ${modelId}`);
    }

    let provider: BaseAIProvider;

    switch (model.provider) {
      case 'ollama':
        provider = new OllamaProvider(model.modelName || modelId);
        break;
      case 'claude':
        provider = new ClaudeProvider(modelId);
        break;
      case 'chatgpt':
        provider = new ChatGPTProvider(modelId);
        break;
      case 'gemini':
        provider = new GeminiProvider(modelId);
        break;
      default:
        throw new Error(`Unknown provider: ${model.provider}`);
    }

    this.providers.set(modelId, provider);
    return provider;
  }

  /**
   * Chat with AI model
   */
  async chat(messages: AIMessage[], modelId?: string): Promise<AIResponse> {
    const model = modelId || this.defaultModel;
    const provider = this.getProvider(model);
    return provider.chat(messages);
  }

  /**
   * Stream response from AI model
   */
  async stream(
    messages: AIMessage[],
    onChunk: (event: AIStreamEvent) => void,
    modelId?: string,
  ): Promise<void> {
    const model = modelId || this.defaultModel;
    const provider = this.getProvider(model);
    return provider.stream(messages, onChunk);
  }

  /**
   * Check health of all configured providers
   */
  async checkHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [modelId, model] of Object.entries(AI_MODELS)) {
      try {
        const provider = this.getProvider(modelId);
        health[modelId] = await provider.checkHealth();
      } catch {
        health[modelId] = false;
      }
    }

    return health;
  }

  /**
   * Check if a specific model is available
   */
  async isModelAvailable(modelId: string): Promise<boolean> {
    try {
      const provider = this.getProvider(modelId);
      return await provider.checkHealth();
    } catch {
      return false;
    }
  }

  /**
   * Get all available models
   */
  getAvailableModels(): typeof AI_MODELS {
    return AI_MODELS;
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: AIProvider) {
    return Object.entries(AI_MODELS)
      .filter(([, model]) => model.provider === provider)
      .reduce(
        (acc, [id, model]) => {
          acc[id] = model;
          return acc;
        },
        {} as Record<string, (typeof AI_MODELS)[keyof typeof AI_MODELS]>,
      );
  }

  /**
   * Set default model
   */
  setDefaultModel(modelId: string): void {
    if (!AI_MODELS[modelId]) {
      throw new Error(`Unknown model: ${modelId}`);
    }
    this.defaultModel = modelId;
  }

  /**
   * Get current default model
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }
}

// Export singleton instance
export const aiManager = new AIManager();
