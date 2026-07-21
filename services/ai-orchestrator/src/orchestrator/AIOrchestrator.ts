import pino from 'pino';
import { v4 as uuid } from 'uuid';
import { IntentDetector, Intent } from '../intent/IntentDetector.js';
import { ContextRetriever, Context } from '../context/ContextRetriever.js';
import { PromptOptimizer } from '../prompt/PromptOptimizer.js';
import { ModelSelector, SelectedModel } from '../models/ModelSelector.js';
import { MemoryManager } from '../memory/MemoryManager.js';

const logger = pino();

export interface OrchestrationRequest {
  userId: string;
  sessionId: string;
  userQuery: string;
  conversationHistory?: ConversationMessage[];
  metadata?: Record<string, any>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface OrchestrationResponse {
  id: string;
  response: string;
  model: string;
  confidence: number;
  executionTime: number;
  metadata: {
    intent: Intent;
    contextUsed: Context;
    promptUsed: string;
    reasoning: string;
  };
}

export class AIOrchestrator {
  private requestCache: Map<string, OrchestrationResponse> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor(
    private intentDetector: IntentDetector,
    private contextRetriever: ContextRetriever,
    private promptOptimizer: PromptOptimizer,
    private modelSelector: ModelSelector,
    private memoryManager: MemoryManager,
  ) {
    logger.info('AI Orchestrator initialized');
  }

  /**
   * Main orchestration flow
   */
  async orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const startTime = Date.now();
    const requestId = uuid();

    try {
      logger.info(`Starting orchestration: ${requestId}`);

      // Step 1: Detect intent
      const intent = await this.intentDetector.detect(request.userQuery);
      logger.debug(`Intent detected: ${intent.primary} (confidence: ${intent.confidence})`);

      // Step 2: Retrieve context
      const context = await this.contextRetriever.retrieve(
        request.userId,
        intent,
        request.userQuery,
      );
      logger.debug(`Context retrieved: ${context.sources.length} sources`);

      // Step 3: Optimize prompt
      const optimizedPrompt = this.promptOptimizer.optimize(
        request.userQuery,
        context,
        intent,
        request.conversationHistory || [],
      );
      logger.debug('Prompt optimized');

      // Step 4: Select best model
      const selectedModel = this.modelSelector.selectModel(intent, context, request.userQuery);
      logger.debug(`Model selected: ${selectedModel.name} (${selectedModel.provider})`);

      // Step 5: Execute with fallbacks
      let response = await this.executeWithFallbacks(
        selectedModel,
        optimizedPrompt,
        intent,
        request.sessionId,
      );
      logger.debug('Model execution completed');

      // Step 6: Extract knowledge
      const extractedKnowledge = this.extractKnowledge(
        request.userQuery,
        response,
        intent,
      );

      // Step 7: Update memory
      await this.memoryManager.updateMemory(
        request.userId,
        request.sessionId,
        {
          query: request.userQuery,
          response,
          intent,
          context,
        },
        extractedKnowledge,
      );
      logger.debug('Memory updated');

      const executionTime = Date.now() - startTime;

      const orchestrationResponse: OrchestrationResponse = {
        id: requestId,
        response,
        model: selectedModel.name,
        confidence: Math.min(intent.confidence, selectedModel.confidenceScore),
        executionTime,
        metadata: {
          intent,
          contextUsed: context,
          promptUsed: optimizedPrompt,
          reasoning: `Used ${selectedModel.name} (${selectedModel.provider}) with ${context.sources.length} context sources`,
        },
      };

      // Cache response
      this.requestCache.set(requestId, orchestrationResponse);
      this.recordMetrics(selectedModel.name, executionTime);

      logger.info(`Orchestration complete: ${requestId} (${executionTime}ms)`);

      return orchestrationResponse;
    } catch (error) {
      logger.error(`Orchestration failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute with fallback models if primary fails
   */
  private async executeWithFallbacks(
    primaryModel: SelectedModel,
    prompt: string,
    intent: Intent,
    sessionId: string,
  ): Promise<string> {
    const models = [primaryModel, ...primaryModel.fallbacks];

    for (const model of models) {
      try {
        logger.info(`Attempting ${model.name} (${model.provider})`);

        const response = await this.executeModel(model, prompt, sessionId);

        logger.info(`${model.name} succeeded`);
        return response;
      } catch (error) {
        logger.warn(`${model.name} failed: ${error}`);
        if (model === models[models.length - 1]) {
          throw new Error(`All models failed for intent ${intent.primary}`);
        }
      }
    }

    throw new Error('Unexpected fallback chain termination');
  }

  /**
   * Execute individual model
   */
  private async executeModel(
    model: SelectedModel,
    prompt: string,
    sessionId: string,
  ): Promise<string> {
    switch (model.provider) {
      case 'anthropic':
        return await this.executeAnthropic(model.name, prompt);
      case 'openai':
        return await this.executeOpenAI(model.name, prompt);
      case 'google':
        return await this.executeGoogle(model.name, prompt);
      case 'local':
        return await this.executeLocal(model.name, prompt);
      default:
        throw new Error(`Unknown provider: ${model.provider}`);
    }
  }

  private async executeAnthropic(model: string, prompt: string): Promise<string> {
    // Claude API execution
    // Implementation in separate module
    logger.debug(`Executing Anthropic: ${model}`);
    return `[${model}] Response to: ${prompt.substring(0, 50)}...`;
  }

  private async executeOpenAI(model: string, prompt: string): Promise<string> {
    // OpenAI API execution
    logger.debug(`Executing OpenAI: ${model}`);
    return `[${model}] Response to: ${prompt.substring(0, 50)}...`;
  }

  private async executeGoogle(model: string, prompt: string): Promise<string> {
    // Google Gemini API execution
    logger.debug(`Executing Google: ${model}`);
    return `[${model}] Response to: ${prompt.substring(0, 50)}...`;
  }

  private async executeLocal(model: string, prompt: string): Promise<string> {
    // Local Ollama execution
    logger.debug(`Executing Local: ${model}`);
    return `[${model}] Response to: ${prompt.substring(0, 50)}...`;
  }

  /**
   * Extract learnings from response
   */
  private extractKnowledge(query: string, response: string, intent: Intent): any {
    return {
      query,
      responseLength: response.length,
      intentPrimary: intent.primary,
      timestamp: Date.now(),
      extracted: true,
    };
  }

  /**
   * Record performance metrics
   */
  private recordMetrics(modelName: string, executionTime: number): void {
    if (!this.performanceMetrics.has(modelName)) {
      this.performanceMetrics.set(modelName, []);
    }

    const metrics = this.performanceMetrics.get(modelName)!;
    metrics.push(executionTime);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Get performance statistics
   */
  getMetrics(modelName?: string): Record<string, any> {
    if (modelName) {
      const metrics = this.performanceMetrics.get(modelName) || [];
      if (metrics.length === 0) return { error: 'No metrics for model' };

      const sorted = [...metrics].sort((a, b) => a - b);
      return {
        model: modelName,
        count: metrics.length,
        average: metrics.reduce((a, b) => a + b) / metrics.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...metrics),
        max: Math.max(...metrics),
        p95: sorted[Math.floor(sorted.length * 0.95)],
      };
    }

    const allMetrics: Record<string, any> = {};
    for (const [model, times] of this.performanceMetrics.entries()) {
      const sorted = [...times].sort((a, b) => a - b);
      allMetrics[model] = {
        count: times.length,
        average: Math.round(times.reduce((a, b) => a + b) / times.length),
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...times),
        max: Math.max(...times),
      };
    }
    return allMetrics;
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    this.requestCache.clear();
    logger.info('Request cache cleared');
  }
}
