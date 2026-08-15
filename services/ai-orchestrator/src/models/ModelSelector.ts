import pino from 'pino';
import { Intent } from '../intent/IntentDetector.js';
import { Context } from '../context/ContextRetriever.js';

const logger = pino();

export interface SelectedModel {
  name: string;
  provider: 'anthropic' | 'openai' | 'google' | 'local';
  confidenceScore: number;
  costEstimate: number;
  latencyEstimate: number;
  fallbacks: SelectedModel[];
}

interface ModelProfile {
  name: string;
  provider: 'anthropic' | 'openai' | 'google' | 'local';
  strength: string[];
  weakness: string[];
  costPerKToken: number;
  avgLatency: number; // ms
  contextWindow: number;
  trainingData: string;
}

export class ModelSelector {
  private models: Map<string, ModelProfile> = new Map();
  private performanceScores: Map<string, number> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels(): void {
    // Claude 3.5 Sonnet - Best for reasoning
    this.models.set('claude-3-5-sonnet', {
      name: 'claude-3-5-sonnet',
      provider: 'anthropic',
      strength: ['reasoning', 'complex-analysis', 'code', 'creativity'],
      weakness: ['speed', 'cost'],
      costPerKToken: 0.003,
      avgLatency: 800,
      contextWindow: 200000,
      trainingData: 'April 2024',
    });

    // Claude 3 Opus - Fast reasoning
    this.models.set('claude-3-opus', {
      name: 'claude-3-opus',
      provider: 'anthropic',
      strength: ['reasoning', 'instruction-following', 'nuance'],
      weakness: ['speed'],
      costPerKToken: 0.0015,
      avgLatency: 500,
      contextWindow: 200000,
      trainingData: 'August 2023',
    });

    // GPT-4 Turbo - Fast & capable
    this.models.set('gpt-4-turbo', {
      name: 'gpt-4-turbo',
      provider: 'openai',
      strength: ['speed', 'versatility', 'code'],
      weakness: ['cost', 'context-length'],
      costPerKToken: 0.001,
      avgLatency: 600,
      contextWindow: 128000,
      trainingData: 'April 2024',
    });

    // GPT-4 - Balanced
    this.models.set('gpt-4', {
      name: 'gpt-4',
      provider: 'openai',
      strength: ['reasoning', 'accuracy'],
      weakness: ['speed', 'cost'],
      costPerKToken: 0.0015,
      avgLatency: 1000,
      contextWindow: 8192,
      trainingData: 'April 2023',
    });

    // Gemini Pro - Fast & cheap
    this.models.set('gemini-pro', {
      name: 'gemini-pro',
      provider: 'google',
      strength: ['speed', 'cost', 'multimodal'],
      weakness: ['reasoning', 'complex-tasks'],
      costPerKToken: 0.0005,
      avgLatency: 400,
      contextWindow: 32000,
      trainingData: 'April 2024',
    });

    // Llama 2 (Local) - Privacy & control
    this.models.set('llama-2', {
      name: 'llama-2',
      provider: 'local',
      strength: ['privacy', 'cost', 'speed'],
      weakness: ['reasoning', 'quality'],
      costPerKToken: 0,
      avgLatency: 300,
      contextWindow: 4096,
      trainingData: 'July 2023',
    });

    logger.info('Model profiles initialized');
  }

  /**
   * Select best model for query
   */
  selectModel(intent: Intent, context: Context, query: string): SelectedModel {
    const candidates = this.rankModels(intent, context, query);

    if (candidates.length === 0) {
      throw new Error('No suitable models available');
    }

    const primary = candidates[0];
    const fallbacks = candidates.slice(1, 3);

    logger.debug(`Selected model: ${primary.name} (confidence: ${primary.confidenceScore})`);

    return {
      ...primary,
      fallbacks: fallbacks.map((m) => ({
        ...m,
        fallbacks: [],
      })),
    };
  }

  private rankModels(intent: Intent, context: Context, query: string): SelectedModel[] {
    const scores: Array<[string, number]> = [];

    for (const [modelName, profile] of this.models.entries()) {
      let score = 0.5; // Base score

      // Intent-based scoring
      score += this.scoreByIntent(profile, intent) * 0.3;

      // Context-based scoring
      score += this.scoreByContext(profile, context, query) * 0.2;

      // Performance history
      const historicalScore = this.performanceScores.get(modelName) || 0.5;
      score += historicalScore * 0.2;

      // Cost considerations
      if (intent.confidence > 0.8) {
        score += (1 - profile.costPerKToken / 0.003) * 0.15;
      }

      // Speed considerations
      if (query.length < 100) {
        score += (1 - profile.avgLatency / 1000) * 0.15;
      }

      scores.push([modelName, Math.min(score, 1)]);
    }

    // Sort by score
    scores.sort((a, b) => b[1] - a[1]);

    // Convert to SelectedModel objects
    return scores.map(([name, score]) => {
      const profile = this.models.get(name)!;
      return {
        name,
        provider: profile.provider,
        confidenceScore: score,
        costEstimate: profile.costPerKToken * (query.length / 4 / 1000),
        latencyEstimate: profile.avgLatency,
        fallbacks: [],
      };
    });
  }

  private scoreByIntent(profile: ModelProfile, intent: Intent): number {
    let score = 0;

    // Check strengths
    for (const strength of profile.strength) {
      if (intent.primary.includes(strength) || intent.category.includes(strength)) {
        score += 0.3;
      }
    }

    // Check weaknesses
    for (const weakness of profile.weakness) {
      if (intent.primary.includes(weakness)) {
        score -= 0.2;
      }
    }

    return Math.max(0, Math.min(score + 0.4, 1));
  }

  private scoreByContext(profile: ModelProfile, context: Context, query: string): number {
    let score = 0.5;

    // Check context window adequacy
    const estimatedTokens = (context.sources.length * 200 + query.length) / 4;
    if (estimatedTokens > profile.contextWindow) {
      score -= 0.3;
    } else if (estimatedTokens < profile.contextWindow * 0.5) {
      score += 0.1;
    }

    // Check relevance
    if (context.relevanceScore > 0.8) {
      score += 0.2;
    }

    return Math.max(0, Math.min(score, 1));
  }

  /**
   * Record model performance
   */
  recordPerformance(modelName: string, success: boolean, executionTime: number): void {
    const currentScore = this.performanceScores.get(modelName) || 0.5;
    const adjustment = success ? 0.05 : -0.1;
    const newScore = Math.max(0, Math.min(currentScore + adjustment, 1));

    this.performanceScores.set(modelName, newScore);

    logger.debug(`Model performance updated: ${modelName} = ${newScore}`);
  }

  /**
   * Get model stats
   */
  getModelStats(modelName: string): Record<string, any> {
    const profile = this.models.get(modelName);
    if (!profile) {
      return { error: 'Model not found' };
    }

    return {
      name: profile.name,
      provider: profile.provider,
      performance: this.performanceScores.get(modelName) || 0.5,
      costPerKToken: profile.costPerKToken,
      avgLatency: profile.avgLatency,
      contextWindow: profile.contextWindow,
      strength: profile.strength,
      weakness: profile.weakness,
    };
  }
}
