import pino from 'pino';
import { ModelInfo, ModelRegistry } from './ModelRegistry';

const logger = pino();

export interface RoutingContext {
  task: 'general' | 'coding' | 'reasoning' | 'rag' | 'fast';
  contextSize: number;
  requiresTools?: boolean;
  requiresStructuredOutput?: boolean;
  confidenceThreshold?: number;
}

export interface RoutingResult {
  primary: ModelInfo;
  fallbacks: ModelInfo[];
  score: number;
  reason: string;
  costEstimate: number;
}

export class DynamicModelRouter {
  private registry: ModelRegistry;
  private costPolicy: 'FREE-FIRST' | 'BALANCED' | 'PERFORMANCE' = 'FREE-FIRST';

  constructor(registry: ModelRegistry, costPolicy?: 'FREE-FIRST' | 'BALANCED' | 'PERFORMANCE') {
    this.registry = registry;
    if (costPolicy) {
      this.costPolicy = costPolicy;
    }
  }

  /**
   * Route request to best available model
   */
  route(context: RoutingContext): RoutingResult {
    const candidates = this.getCandidates(context);

    if (candidates.length === 0) {
      throw new Error(
        `No suitable models available for task: ${context.task}. Context: ${context.contextSize} tokens`
      );
    }

    // Score and rank candidates
    const scored = candidates
      .map((model) => ({
        model,
        score: this.scoreModel(model, context),
      }))
      .sort((a, b) => b.score - a.score);

    const primary = scored[0].model;
    const fallbacks = scored.slice(1, 4).map((s) => s.model); // Up to 3 fallbacks
    const primaryScore = scored[0].score;

    const costEstimate = this.estimateCost(primary, context.contextSize);
    const reason = this.getRoutingReason(primary, context, primaryScore);

    logger.info(`Routed ${context.task} to ${primary.displayName}`, {
      score: primaryScore.toFixed(2),
      fallbacks: fallbacks.length,
      cost: costEstimate.toFixed(4),
    });

    return {
      primary,
      fallbacks,
      score: primaryScore,
      reason,
      costEstimate,
    };
  }

  /**
   * Get candidate models for task
   */
  private getCandidates(context: RoutingContext): ModelInfo[] {
    let candidates = this.registry.getAvailableFreeModels();

    // Filter by task type
    const taskPreferences = this.getTaskPreferences(context.task);
    candidates = candidates.filter(
      (m) =>
        taskPreferences.some((task) =>
          m.preferredTasks.includes(task)
        ) || candidates.length <= 1
    );

    // Filter by context window
    candidates = candidates.filter((m) => m.contextWindow >= context.contextSize);

    // Filter by required capabilities
    if (context.requiresTools) {
      candidates = candidates.filter((m) => m.capabilities.tools);
    }
    if (context.requiresStructuredOutput) {
      candidates = candidates.filter((m) => m.capabilities.structuredOutput);
    }

    // If no candidates, relax context window requirement
    if (candidates.length === 0 && context.contextSize > 4096) {
      candidates = this.registry.getAvailableFreeModels();
    }

    // If still none, return ANY available model as fallback
    if (candidates.length === 0) {
      candidates = this.registry.getAvailableFreeModels();
    }

    return candidates;
  }

  /**
   * Get task-based preferences
   */
  private getTaskPreferences(task: string): string[] {
    const preferences: Record<string, string[]> = {
      coding: ['coding', 'technical'],
      reasoning: ['reasoning', 'analysis'],
      general: ['general', 'chat'],
      rag: ['knowledge', 'general'],
      fast: ['fast-response'],
    };

    return preferences[task] || ['general'];
  }

  /**
   * Score a model for the given context
   */
  private scoreModel(model: ModelInfo, context: RoutingContext): number {
    let score = 0.5; // Base score

    // Task alignment (0.3 weight)
    const taskPrefs = this.getTaskPreferences(context.task);
    const taskMatch = taskPrefs.some((pref) => model.preferredTasks.includes(pref));
    score += taskMatch ? 0.3 : 0.1;

    // Capability match (0.2 weight)
    const capScore = this.scoreCapabilities(model, context);
    score += capScore * 0.2;

    // Success rate (0.2 weight)
    score += model.successRate * 0.2;

    // Latency preference (0.15 weight)
    if (context.task === 'fast') {
      score += Math.max(0, 1 - model.avgLatencyMs / 1000) * 0.15;
    } else {
      score += 0.1; // Baseline
    }

    // Context efficiency (0.15 weight)
    const contextUtilization = context.contextSize / model.contextWindow;
    if (contextUtilization < 0.5) {
      score += 0.15; // Good headroom
    } else if (contextUtilization < 0.8) {
      score += 0.1; // Adequate
    } else {
      score += 0.05; // Tight
    }

    return Math.min(score, 1);
  }

  /**
   * Score capabilities match
   */
  private scoreCapabilities(model: ModelInfo, context: RoutingContext): number {
    let score = 0;

    const caps = model.capabilities;

    switch (context.task) {
      case 'coding':
        score += (caps.coding || 0) / 10;
        break;
      case 'reasoning':
        score += (caps.reasoning || 0) / 10;
        score += (caps.coding || 0) / 10 * 0.3; // Coding helps reasoning
        break;
      case 'rag':
        score += (caps.knowledge || 0) / 10;
        break;
      case 'fast':
        score += (caps.speed || 0) / 10;
        break;
      case 'general':
      default:
        score += ((caps.reasoning || 0) + (caps.coding || 0)) / 20;
    }

    return score;
  }

  /**
   * Estimate cost for model + context
   */
  private estimateCost(model: ModelInfo, contextSize: number): number {
    if (model.free || model.local) {
      return 0;
    }

    // Estimate: 1 token ≈ 4 characters
    const tokens = Math.ceil(contextSize / 4);
    const kTokens = tokens / 1000;

    return (model.costPer1kTokens || 0) * kTokens;
  }

  /**
   * Get human-readable routing reason
   */
  private getRoutingReason(model: ModelInfo, context: RoutingContext, score: number): string {
    const reasons = [];

    if (model.local) {
      reasons.push('local (no cost)');
    }
    if (model.free) {
      reasons.push('free tier');
    }

    const taskPrefs = this.getTaskPreferences(context.task);
    if (taskPrefs.some((p) => model.preferredTasks.includes(p))) {
      reasons.push(`preferred for ${context.task}`);
    }

    if (model.successRate > 0.9) {
      reasons.push('high reliability');
    }

    const efficiency =
      model.avgLatencyMs < 400
        ? 'fast'
        : model.avgLatencyMs < 700
          ? 'moderate'
          : 'slower';
    reasons.push(efficiency);

    return `${model.displayName}: ${reasons.join(', ')} (score: ${score.toFixed(2)})`;
  }

  /**
   * Get model for specific capability
   */
  selectByCapability(capability: 'coding' | 'reasoning' | 'speed' | 'knowledge'): ModelInfo {
    const candidates = this.registry.getAvailableFreeModels();

    let best = candidates[0];
    let bestScore = 0;

    for (const model of candidates) {
      const score = model.capabilities[capability] || 0;
      if (score > bestScore) {
        best = model;
        bestScore = score;
      }
    }

    return best;
  }

  /**
   * Get cost policy
   */
  getCostPolicy(): string {
    return this.costPolicy;
  }
}
