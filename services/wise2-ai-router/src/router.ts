/**
 * Core Router Logic - Implements AUTO/LOCAL/CLOUD routing with budget enforcement
 */

import { v4 as uuid } from 'uuid';
import { AIRequest, AIResponse, AIError } from './types/request';
import { OllamaProvider } from './providers/ollama';
import { BudgetEngine } from './budget/engine';
import { TelemetryLogger } from './telemetry/logger';

export class AIRouter {
  private ollama: OllamaProvider;
  private budget: BudgetEngine;
  private telemetry: TelemetryLogger;

  constructor(ollama: OllamaProvider, budget: BudgetEngine, telemetry: TelemetryLogger) {
    this.ollama = ollama;
    this.budget = budget;
    this.telemetry = telemetry;
  }

  /**
   * Main routing handler
   */
  async route(request: AIRequest): Promise<AIResponse | AIError> {
    const requestId = request.request_id || uuid();
    const startTime = Date.now();

    try {
      // Validate request
      this.validateRequest(request);

      // Get budget status
      const budgetStatus = this.budget.getStatus();

      // Estimate cost before deciding route
      const estimation = await this.estimateCost(request);

      // Check if request can proceed
      const canProceed = this.budget.canProceed(
        estimation.cost,
        request.route_mode === 'CLOUD',
        request.priority === 'critical'
      );

      if (!canProceed.allowed) {
        return this.createError(canProceed.reason || 'Request blocked', requestId, {
          available_providers: ['ollama'],
          suggested_action: 'Use local inference instead',
          budget_status: {
            used_pct: budgetStatus.used_pct,
            daily_budget: budgetStatus.daily_budget,
            used: budgetStatus.used,
            remaining: budgetStatus.remaining,
          },
        });
      }

      // Determine which provider to use
      const selectedProvider = await this.selectProvider(request);
      if (!selectedProvider) {
        return this.createError('No suitable provider available', requestId);
      }

      // Generate response
      const response = await selectedProvider.generate(request);
      const latency = Date.now() - startTime;

      // Log success
      const aiResponse: AIResponse = {
        response,
        usage: {
          input_tokens: estimation.inputTokens,
          output_tokens: estimation.outputTokens,
          context_bytes: JSON.stringify(request.messages).length,
        },
        routing: {
          actual_route: selectedProvider.name === 'ollama' ? 'LOCAL' : 'CLOUD',
          model: 'ollama-qwen-coder', // Would be dynamic based on selection
          provider: selectedProvider.name,
          latency_ms: latency,
          estimated_cost: estimation.cost,
        },
        cache: {
          hit: false,
        },
        telemetry_id: requestId,
      };

      // Record actual cost
      this.budget.recordCost(estimation.cost);

      // Log telemetry
      await this.telemetry.logEvent({
        timestamp: new Date(),
        project_id: request.project_id,
        agent_id: request.agent_id,
        user_id: request.user_id,
        task_type: request.task_type,

        route_mode: request.route_mode,
        actual_route: aiResponse.routing.actual_route,
        model: aiResponse.routing.model,
        provider: aiResponse.routing.provider,

        input_tokens: aiResponse.usage.input_tokens,
        output_tokens: aiResponse.usage.output_tokens,
        context_bytes: aiResponse.usage.context_bytes,
        latency_ms: aiResponse.routing.latency_ms,
        estimated_cost: aiResponse.routing.estimated_cost,

        cache_hit: false,
        budget_pct_at_request: budgetStatus.used_pct,
        threshold: canProceed.threshold,

        privacy_class: request.privacy_class || 'internal',
        priority: request.priority || 'normal',

        success: true,
      });

      return aiResponse;
    } catch (error) {
      // Log failure
      const latency = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      await this.telemetry.logEvent({
        timestamp: new Date(),
        project_id: request.project_id,
        agent_id: request.agent_id,
        user_id: request.user_id,
        task_type: request.task_type,

        route_mode: request.route_mode,
        actual_route: 'LOCAL',
        model: 'unknown',
        provider: 'unknown',

        input_tokens: 0,
        output_tokens: 0,
        context_bytes: 0,
        latency_ms: latency,
        estimated_cost: 0,

        cache_hit: false,
        budget_pct_at_request: this.budget.getStatus().used_pct,
        threshold: 'NORMAL',

        privacy_class: request.privacy_class || 'internal',
        priority: request.priority || 'normal',

        success: false,
        error_message: errorMsg,
      });

      return this.createError(errorMsg, requestId);
    }
  }

  /**
   * Select best provider based on routing mode and budget
   */
  private async selectProvider(request: AIRequest): Promise<any> {
    // For MVP, only Ollama is available
    if (request.route_mode === 'LOCAL' || request.route_mode === 'AUTO') {
      const healthy = await this.ollama.isHealthy();
      if (healthy) {
        return this.ollama;
      }
    }

    // If cloud requested and budget allows, would return cloud provider here
    if (request.route_mode === 'CLOUD') {
      throw new Error('Cloud providers not yet implemented in MVP');
    }

    return null;
  }

  /**
   * Estimate cost for a request
   */
  private async estimateCost(
    request: AIRequest
  ): Promise<{ cost: number; inputTokens: number; outputTokens: number }> {
    const estimation = await this.ollama.estimate(request);

    // Rough token counts
    const inputText = request.messages.map((m) => m.content).join('\n');
    const inputTokens = Math.ceil(inputText.length / 4);
    const outputTokens = Math.ceil(inputTokens * 0.5); // Assume 50% of input

    return {
      cost: estimation.cost,
      inputTokens,
      outputTokens,
    };
  }

  /**
   * Validate request schema
   */
  private validateRequest(request: AIRequest): void {
    if (!request.project_id) throw new Error('Missing project_id');
    if (!request.agent_id) throw new Error('Missing agent_id');
    if (!request.user_id) throw new Error('Missing user_id');
    if (!request.task_type) throw new Error('Missing task_type');
    if (!request.messages || request.messages.length === 0) {
      throw new Error('Missing messages');
    }

    for (const msg of request.messages) {
      if (!msg.role || !msg.content) {
        throw new Error('Invalid message format');
      }
    }
  }

  /**
   * Create error response
   */
  private createError(message: string, requestId: string, details: any = {}): AIError {
    return {
      error: {
        code: 'ROUTER_ERROR',
        message,
        details: {
          available_providers: ['ollama'],
          suggested_action: 'Retry with local model',
          ...details,
        },
        timestamp: new Date().toISOString(),
        request_id: requestId,
      },
    };
  }
}
