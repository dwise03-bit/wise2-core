/**
 * WISE² Open Model Orchestrator
 * Intelligent routing between premium and free AI models
 * Minimizes cost while maximizing capability
 */

import axios from 'axios';

export type AIModel =
  | 'claude-opus-5'
  | 'claude-sonnet-5'
  | 'gpt-4-turbo'
  | 'gpt-4o'
  | 'gemini-2.0-pro'
  | 'deepseek-coder'
  | 'deepseek-chat'
  | 'qwen-2.5-coder'
  | 'qwen-turbo'
  | 'kimi-9b'
  | 'llama-3-70b'
  | 'mistral-large'
  | 'nemotron-4-340b';

export type ProviderName = 'anthropic' | 'openai' | 'google' | 'deepseek' | 'openrouter' | 'nvidia' | 'github';

export type TaskCategory =
  | 'code_generation'
  | 'documentation'
  | 'refactoring'
  | 'boilerplate'
  | 'testing'
  | 'research'
  | 'ui_generation'
  | 'debugging'
  | 'architecture'
  | 'security'
  | 'deployment'
  | 'rapid_prototyping';

interface ModelCapability {
  model: AIModel;
  provider: ProviderName;
  costPer1kTokens: number; // in USD
  contextWindow: number;
  speed: number; // tokens per second
  quality: number; // 0-100 rating
  capabilities: TaskCategory[];
  rateLimit: {
    rpm: number; // requests per minute
    tpm: number; // tokens per minute
  };
  isFree: boolean;
  available: boolean;
}

interface ModelHealth {
  model: AIModel;
  status: 'healthy' | 'degraded' | 'down';
  successRate: number; // 0-100
  averageLatency: number; // ms
  lastChecked: Date;
  errorCount: number;
  rateLimitRemaining: number;
}

interface RoutingDecision {
  selectedModel: AIModel;
  provider: ProviderName;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  fallbackModel: AIModel;
}

interface TaskContext {
  category: TaskCategory;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  contextSize: number;
  latencySensitive: boolean;
  costSensitive: boolean;
  quality: 'best' | 'good' | 'acceptable' | 'budget';
  preferredProviders?: ProviderName[];
}

class ModelOrchestrator {
  private modelRegistry: Map<AIModel, ModelCapability> = new Map();
  private modelHealth: Map<AIModel, ModelHealth> = new Map();
  private usageTracking: Map<AIModel, { cost: number; tokens: number; requests: number }> =
    new Map();

  constructor() {
    this.initializeModelRegistry();
    this.initializeHealthMonitoring();
  }

  /**
   * Initialize available models and their capabilities
   */
  private initializeModelRegistry(): void {
    const models: ModelCapability[] = [
      // Tier 1: Premium Models
      {
        model: 'claude-opus-5',
        provider: 'anthropic',
        costPer1kTokens: 0.03,
        contextWindow: 200000,
        speed: 100,
        quality: 100,
        capabilities: [
          'architecture',
          'security',
          'deployment',
          'debugging',
          'code_generation',
        ],
        rateLimit: { rpm: 50, tpm: 1000000 },
        isFree: false,
        available: true,
      },
      {
        model: 'gpt-4-turbo',
        provider: 'openai',
        costPer1kTokens: 0.01,
        contextWindow: 128000,
        speed: 80,
        quality: 95,
        capabilities: [
          'architecture',
          'security',
          'debugging',
          'code_generation',
          'documentation',
        ],
        rateLimit: { rpm: 40, tpm: 900000 },
        isFree: false,
        available: true,
      },
      {
        model: 'gemini-2.0-pro',
        provider: 'google',
        costPer1kTokens: 0.0075,
        contextWindow: 1000000,
        speed: 90,
        quality: 92,
        capabilities: [
          'code_generation',
          'documentation',
          'architecture',
          'research',
        ],
        rateLimit: { rpm: 60, tpm: 1200000 },
        isFree: false,
        available: true,
      },

      // Tier 2: Free/Low-Cost Models (OpenRouter, GitHub, NVIDIA)
      {
        model: 'deepseek-coder',
        provider: 'openrouter',
        costPer1kTokens: 0.0001,
        contextWindow: 4096,
        speed: 50,
        quality: 85,
        capabilities: [
          'code_generation',
          'boilerplate',
          'refactoring',
          'testing',
          'ui_generation',
        ],
        rateLimit: { rpm: 100, tpm: 2000000 },
        isFree: true,
        available: true,
      },
      {
        model: 'qwen-2.5-coder',
        provider: 'openrouter',
        costPer1kTokens: 0.00008,
        contextWindow: 32000,
        speed: 60,
        quality: 82,
        capabilities: [
          'code_generation',
          'documentation',
          'boilerplate',
          'refactoring',
          'testing',
        ],
        rateLimit: { rpm: 120, tpm: 2500000 },
        isFree: true,
        available: true,
      },
      {
        model: 'llama-3-70b',
        provider: 'github',
        costPer1kTokens: 0.0,
        contextWindow: 8000,
        speed: 70,
        quality: 80,
        capabilities: [
          'code_generation',
          'boilerplate',
          'documentation',
          'rapid_prototyping',
        ],
        rateLimit: { rpm: 200, tpm: 3000000 },
        isFree: true,
        available: true,
      },
      {
        model: 'mistral-large',
        provider: 'openrouter',
        costPer1kTokens: 0.00024,
        contextWindow: 32000,
        speed: 65,
        quality: 83,
        capabilities: [
          'code_generation',
          'documentation',
          'refactoring',
          'research',
          'ui_generation',
        ],
        rateLimit: { rpm: 150, tpm: 2800000 },
        isFree: true,
        available: true,
      },
      {
        model: 'nemotron-4-340b',
        provider: 'nvidia',
        costPer1kTokens: 0.0,
        contextWindow: 4096,
        speed: 75,
        quality: 81,
        capabilities: [
          'code_generation',
          'boilerplate',
          'documentation',
          'testing',
        ],
        rateLimit: { rpm: 180, tpm: 2700000 },
        isFree: true,
        available: true,
      },
    ];

    models.forEach((model) => {
      this.modelRegistry.set(model.model, model);
      this.usageTracking.set(model.model, { cost: 0, tokens: 0, requests: 0 });
    });
  }

  /**
   * Initialize health monitoring for all models
   */
  private initializeHealthMonitoring(): void {
    this.modelRegistry.forEach((capability) => {
      this.modelHealth.set(capability.model, {
        model: capability.model,
        status: 'healthy',
        successRate: 100,
        averageLatency: 500,
        lastChecked: new Date(),
        errorCount: 0,
        rateLimitRemaining: capability.rateLimit.rpm,
      });
    });
  }

  /**
   * Main routing decision logic
   */
  async routeTask(context: TaskContext): Promise<RoutingDecision> {
    // Score all available models
    const candidates = this.scoreModels(context);

    if (candidates.length === 0) {
      throw new Error('No suitable models available for task');
    }

    const selectedModel = candidates[0];
    const fallbackModel = candidates[1]?.model || 'claude-opus-5';

    const capability = this.modelRegistry.get(selectedModel.model)!;

    return {
      selectedModel: selectedModel.model,
      provider: capability.provider,
      reason: selectedModel.reason,
      estimatedCost: this.estimateCost(selectedModel.model, context.contextSize),
      estimatedLatency: this.estimateLatency(selectedModel.model),
      fallbackModel,
    };
  }

  /**
   * Score and rank models for a given task
   */
  private scoreModels(
    context: TaskContext
  ): Array<{ model: AIModel; score: number; reason: string }> {
    const scores: Array<{ model: AIModel; score: number; reason: string }> = [];

    this.modelRegistry.forEach((capability, model) => {
      let score = 0;
      let reason = '';

      // Check availability
      const health = this.modelHealth.get(model);
      if (!health || health.status === 'down') return;

      // Priority 1: Task capability match
      const capabilityMatch = capability.capabilities.includes(context.category);
      if (!capabilityMatch) return;
      score += 40;

      // Priority 2: Cost optimization (if cost-sensitive)
      if (context.costSensitive) {
        if (capability.isFree) {
          score += 30;
          reason = 'Free model, cost-optimized';
        } else {
          score += Math.max(0, 30 - capability.costPer1kTokens * 1000);
        }
      } else {
        score += capability.quality * 0.3;
        reason = 'Quality-focused';
      }

      // Priority 3: Complexity matching
      switch (context.complexity) {
        case 'critical':
          score += Math.min(40, capability.quality * 0.4);
          reason += ', Mission-critical';
          break;
        case 'high':
          score += Math.min(35, capability.quality * 0.35);
          reason += ', High-complexity';
          break;
        case 'medium':
          score += Math.min(25, capability.quality * 0.25);
          reason += ', Medium-complexity';
          break;
        case 'low':
          if (capability.isFree) score += 15;
          reason += ', Low-complexity';
          break;
      }

      // Priority 4: Latency (if latency-sensitive)
      if (context.latencySensitive) {
        const latencyScore = Math.max(0, 100 - capability.speed);
        score += latencyScore * 0.2;
        reason += ', Low-latency';
      }

      // Priority 5: Rate limit available
      if (health && health.rateLimitRemaining > 0) {
        score += 10;
      } else {
        score -= 30;
        reason += ', Rate-limited';
      }

      // Priority 6: Health status
      if (health) {
        score *= health.successRate / 100;
      }

      // Penalty for preferred providers mismatch
      if (context.preferredProviders && !context.preferredProviders.includes(capability.provider)) {
        score *= 0.8;
      }

      scores.push({ model, score, reason });
    });

    // Sort by score (highest first)
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Estimate cost for a task
   */
  private estimateCost(model: AIModel, contextSize: number): number {
    const capability = this.modelRegistry.get(model);
    if (!capability) return 0;

    // Estimate ~2x output tokens as input
    const estimatedTokens = contextSize + contextSize * 2;
    const costPer1k = capability.costPer1kTokens;

    return (estimatedTokens / 1000) * costPer1k;
  }

  /**
   * Estimate latency for a task
   */
  private estimateLatency(model: AIModel): number {
    const capability = this.modelRegistry.get(model);
    if (!capability) return 1000;

    const health = this.modelHealth.get(model);
    if (!health) return capability.speed * 10;

    return health.averageLatency;
  }

  /**
   * Execute task with automatic fallback
   */
  async executeWithFallback(
    prompt: string,
    context: TaskContext,
    maxRetries: number = 3
  ): Promise<{ response: string; model: AIModel; provider: ProviderName; cost: number }> {
    const routing = await this.routeTask(context);

    let lastError: Error | null = null;
    let attempts = 0;
    let currentModel = routing.selectedModel;
    let currentProvider = routing.provider;

    while (attempts < maxRetries) {
      try {
        // Execute with selected model
        const response = await this.callModel(currentModel, prompt);

        // Track usage
        this.trackUsage(currentModel, response.tokens, routing.estimatedCost);

        return {
          response: response.text,
          model: currentModel,
          provider: currentProvider,
          cost: routing.estimatedCost,
        };
      } catch (error) {
        lastError = error as Error;
        attempts++;

        // Update health status
        const health = this.modelHealth.get(currentModel);
        if (health) {
          health.errorCount++;
          health.successRate = Math.max(0, health.successRate - 10);
          if (health.successRate < 50) {
            health.status = 'degraded';
          }
          if (health.successRate < 20) {
            health.status = 'down';
          }
        }

        // Switch to fallback model
        if (attempts < maxRetries) {
          currentModel = routing.fallbackModel;
          const fallbackCapability = this.modelRegistry.get(currentModel);
          if (fallbackCapability) {
            currentProvider = fallbackCapability.provider;
          }

          console.warn(
            `Model ${routing.selectedModel} failed, switching to fallback: ${currentModel}`
          );
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Call a specific model (to be implemented with actual API calls)
   */
  private async callModel(model: AIModel, prompt: string): Promise<{ text: string; tokens: number }> {
    // This would be implemented to call the actual model via its provider's API
    // For now, return a mock response
    return {
      text: `Response from ${model}`,
      tokens: Math.ceil(prompt.length / 4),
    };
  }

  /**
   * Track usage for billing and optimization
   */
  private trackUsage(model: AIModel, tokens: number, cost: number): void {
    const tracking = this.usageTracking.get(model);
    if (tracking) {
      tracking.tokens += tokens;
      tracking.cost += cost;
      tracking.requests++;
    }
  }

  /**
   * Get current model health status
   */
  getHealthStatus(): Map<AIModel, ModelHealth> {
    return this.modelHealth;
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): Array<{
    model: AIModel;
    requests: number;
    tokens: number;
    cost: number;
    costPerRequest: number;
  }> {
    const stats: Array<{
      model: AIModel;
      requests: number;
      tokens: number;
      cost: number;
      costPerRequest: number;
    }> = [];

    this.usageTracking.forEach((usage, model) => {
      stats.push({
        model,
        requests: usage.requests,
        tokens: usage.tokens,
        cost: usage.cost,
        costPerRequest: usage.requests > 0 ? usage.cost / usage.requests : 0,
      });
    });

    return stats.sort((a, b) => b.cost - a.cost);
  }

  /**
   * Force update model health
   */
  updateModelHealth(model: AIModel, status: 'healthy' | 'degraded' | 'down'): void {
    const health = this.modelHealth.get(model);
    if (health) {
      health.status = status;
      health.lastChecked = new Date();
    }
  }

  /**
   * Get all available models
   */
  getAvailableModels(): ModelCapability[] {
    return Array.from(this.modelRegistry.values()).filter((m) => m.available);
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(category: TaskCategory): ModelCapability[] {
    return Array.from(this.modelRegistry.values()).filter((m) =>
      m.capabilities.includes(category)
    );
  }

  /**
   * Get free models only
   */
  getFreeModels(): ModelCapability[] {
    return Array.from(this.modelRegistry.values()).filter((m) => m.isFree);
  }
}

export default new ModelOrchestrator();
