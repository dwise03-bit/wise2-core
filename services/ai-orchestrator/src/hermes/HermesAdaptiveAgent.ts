import pino from 'pino';
import { DynamicModelRouter, RoutingContext, RoutingResult } from '../models/DynamicModelRouter';
import { ModelRegistry } from '../models/ModelRegistry';

const logger = pino();

export interface HermesRequest {
  query: string;
  context?: Record<string, any>;
  requiresStructuredOutput?: boolean;
  priority?: 'speed' | 'quality' | 'cost';
}

export interface HermesResponse {
  answer: string;
  model: string;
  modelDisplayName: string;
  confidence: number;
  latencyMs: number;
  cost: number;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

export class HermesAdaptiveAgent {
  private router: DynamicModelRouter;
  private registry: ModelRegistry;
  private maxFallbackAttempts = 3;

  constructor(registry: ModelRegistry, router: DynamicModelRouter) {
    this.registry = registry;
    this.router = router;
  }

  /**
   * Process request with adaptive model selection
   */
  async process(request: HermesRequest): Promise<HermesResponse> {
    const startTime = Date.now();

    try {
      // Classify task intent
      const taskType = this.classifyIntent(request.query);
      const contextSize = this.estimateContextSize(request.query, request.context);

      // Route to best model
      const routingContext: RoutingContext = {
        task: taskType,
        contextSize,
        requiresStructuredOutput: request.requiresStructuredOutput,
        confidenceThreshold: request.priority === 'quality' ? 0.8 : 0.6,
      };

      const routing = this.router.route(routingContext);

      // Execute with fallback chain
      return await this.executeWithFallback(
        request,
        routing,
        startTime
      );
    } catch (error) {
      logger.error('Hermes processing failed', { error, query: request.query });
      throw error;
    }
  }

  /**
   * Execute request with automatic fallback
   */
  private async executeWithFallback(
    request: HermesRequest,
    routing: RoutingResult,
    startTime: number
  ): Promise<HermesResponse> {
    const modelsToTry = [routing.primary, ...routing.fallbacks];
    let lastError: Error | null = null;
    let fallbackUsed = false;
    let fallbackReason = '';

    for (let i = 0; i < modelsToTry.length && i < this.maxFallbackAttempts; i++) {
      const model = modelsToTry[i];

      try {
        logger.info(`Executing on ${model.displayName}`, {
          attempt: i + 1,
          fallback: i > 0,
        });

        const answer = await this.callModel(model.name, request);
        const latencyMs = Date.now() - startTime;

        // Validate response
        if (!this.validateResponse(answer, request)) {
          throw new Error('Response validation failed');
        }

        // Record success
        this.registry.recordSuccess(model.name, latencyMs);

        return {
          answer,
          model: model.name,
          modelDisplayName: model.displayName,
          confidence: routing.score,
          latencyMs,
          cost: routing.costEstimate,
          fallbackUsed,
          fallbackReason: fallbackUsed ? fallbackReason : undefined,
        };
      } catch (error) {
        lastError = error as Error;

        // Record failure
        this.registry.recordFailure(model.name);

        if (i < modelsToTry.length - 1) {
          const nextModel = modelsToTry[i + 1];
          fallbackUsed = true;
          fallbackReason = `${model.displayName} failed: ${(error as Error).message}. Retrying with ${nextModel.displayName}.`;

          logger.warn('Model failed, attempting fallback', {
            failedModel: model.name,
            reason: (error as Error).message,
            nextModel: nextModel.name,
          });

          // Brief delay before retry
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }

    // All models failed
    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }

  /**
   * Call the actual model
   */
  private async callModel(modelName: string, request: HermesRequest): Promise<string> {
    // Determine provider and call appropriate endpoint
    if (modelName.includes(':')) {
      // Ollama model
      return this.callOllama(modelName, request);
    } else if (modelName.startsWith('claude')) {
      // Claude model
      return this.callClaude(modelName, request);
    } else if (modelName.startsWith('gpt')) {
      // OpenAI model
      return this.callOpenAI(modelName, request);
    }

    throw new Error(`Unknown model provider: ${modelName}`);
  }

  /**
   * Call Ollama model
   */
  private async callOllama(modelName: string, request: HermesRequest): Promise<string> {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: request.query,
        stream: false,
      }),
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = (await response.json()) as { response: string };
    return data.response || '';
  }

  /**
   * Call Claude model (placeholder)
   */
  private async callClaude(modelName: string, request: HermesRequest): Promise<string> {
    // Would use Anthropic SDK in production
    throw new Error('Claude API integration not yet implemented');
  }

  /**
   * Call OpenAI model (placeholder)
   */
  private async callOpenAI(modelName: string, request: HermesRequest): Promise<string> {
    // Would use OpenAI SDK in production
    throw new Error('OpenAI API integration not yet implemented');
  }

  /**
   * Classify request intent to determine best task type
   */
  private classifyIntent(query: string): 'general' | 'coding' | 'reasoning' | 'rag' | 'fast' {
    const lowerQuery = query.toLowerCase();

    // Coding indicators
    if (
      lowerQuery.match(
        /\b(code|function|class|method|bug|debug|error|exception|syntax|algorithm)\b/
      )
    ) {
      return 'coding';
    }

    // Reasoning indicators
    if (
      lowerQuery.match(
        /\b(analyze|why|how|explain|reason|logic|decision|strategy|plan)\b/
      )
    ) {
      return 'reasoning';
    }

    // RAG indicators
    if (lowerQuery.match(/\b(what|who|where|knowledge|fact|find|search|retrieve)\b/)) {
      return 'rag';
    }

    // Speed preference indicators
    if (query.length < 50 || lowerQuery.includes('quick')) {
      return 'fast';
    }

    return 'general';
  }

  /**
   * Estimate context size in tokens
   */
  private estimateContextSize(query: string, context?: Record<string, any>): number {
    // Rough estimate: 1 token ≈ 4 characters
    let size = query.length / 4;

    if (context) {
      const contextStr = JSON.stringify(context);
      size += contextStr.length / 4;
    }

    return Math.ceil(size);
  }

  /**
   * Validate model response
   */
  private validateResponse(answer: string, request: HermesRequest): boolean {
    // Basic validation
    if (!answer || answer.length === 0) {
      return false;
    }

    // Structured output validation
    if (request.requiresStructuredOutput) {
      try {
        JSON.parse(answer);
        return true;
      } catch {
        logger.warn('Structured output validation failed');
        return false;
      }
    }

    return true;
  }

  /**
   * Get registry stats for monitoring
   */
  getRegistryStats() {
    return this.registry.getStats();
  }
}
