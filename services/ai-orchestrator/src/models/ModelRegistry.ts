import pino from 'pino';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const logger = pino();

export interface ModelCapabilities {
  vision?: boolean;
  tools?: boolean;
  structuredOutput?: boolean;
  reasoning?: number; // 1-10 scale
  coding?: number;
  speed?: number;
  knowledge?: number;
}

export interface ModelInfo {
  name: string;
  displayName: string;
  provider: 'ollama' | 'claude' | 'openai' | 'gemini' | 'local';
  available: boolean;
  free: boolean;
  local: boolean;
  capabilities: ModelCapabilities;
  contextWindow: number;
  costPer1kTokens?: number;
  lastVerified: Date;
  successRate: number;
  failures: number;
  successes: number;
  avgLatencyMs: number;
  preferredTasks: string[];
  notes?: string;
}

export class ModelRegistry {
  private models: Map<string, ModelInfo> = new Map();
  private registryPath: string;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(registryPath: string = './config/model-registry.json') {
    this.registryPath = registryPath;
  }

  /**
   * Initialize registry and discover available models
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Model Registry...');

    // Load persisted registry if exists
    await this.loadRegistry();

    // Discover models
    await this.discoverOllamaModels();

    // Verify API key availability
    this.verifyProviderKeys();

    // Start periodic health check
    this.startHealthCheck();

    logger.info(`Model Registry initialized. Found ${this.models.size} models.`);
  }

  /**
   * Discover available Ollama models
   */
  private async discoverOllamaModels(): Promise<void> {
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        timeout: 5000,
      });

      if (!response.ok) {
        logger.warn('Ollama not responding');
        return;
      }

      const data = (await response.json()) as { models: Array<{ name: string; size: number }> };
      const ollamaModels = data.models || [];

      for (const model of ollamaModels) {
        const modelName = model.name.split(':')[0]; // Remove :latest tag
        const capKey = `${modelName}:latest`;

        // Determine capabilities based on model name
        const capabilities = this.getModelCapabilities(modelName);

        this.models.set(capKey, {
          name: capKey,
          displayName: modelName.charAt(0).toUpperCase() + modelName.slice(1),
          provider: 'ollama',
          available: true,
          free: true,
          local: true,
          capabilities,
          contextWindow: this.getContextWindow(modelName),
          lastVerified: new Date(),
          successRate: 0.95,
          failures: 0,
          successes: 1,
          avgLatencyMs: this.getEstimatedLatency(modelName),
          preferredTasks: this.getPreferredTasks(modelName),
        });

        logger.info(`Discovered Ollama model: ${capKey}`);
      }
    } catch (error) {
      logger.error('Failed to discover Ollama models', { error });
    }
  }

  /**
   * Verify which paid providers have API keys
   */
  private verifyProviderKeys(): void {
    const providers = {
      claude: process.env.ANTHROPIC_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      gemini: process.env.GOOGLE_API_KEY,
    };

    for (const [provider, key] of Object.entries(providers)) {
      if (!key) {
        logger.warn(`No API key found for ${provider}`);
      }
    }
  }

  /**
   * Get model capabilities based on model name
   */
  private getModelCapabilities(modelName: string): ModelCapabilities {
    const caps: ModelCapabilities = {
      vision: false,
      tools: true,
      structuredOutput: true,
      reasoning: 6,
      coding: 6,
      speed: 7,
      knowledge: 6,
    };

    if (modelName.includes('qwen')) {
      caps.coding = 9;
      caps.reasoning = 8;
      caps.speed = 7;
    } else if (modelName.includes('llama')) {
      caps.reasoning = 8;
      caps.coding = 7;
      caps.speed = 6;
    } else if (modelName.includes('mistral')) {
      caps.coding = 8;
      caps.speed = 8;
    } else if (modelName.includes('gemma')) {
      caps.speed = 9;
      caps.reasoning = 5;
    }

    return caps;
  }

  /**
   * Get context window size for model
   */
  private getContextWindow(modelName: string): number {
    const windows: Record<string, number> = {
      qwen: 32000,
      llama: 4096,
      mistral: 8192,
      gemma: 8192,
    };

    for (const [key, size] of Object.entries(windows)) {
      if (modelName.includes(key)) {
        return size;
      }
    }

    return 4096; // Default
  }

  /**
   * Estimate latency based on model size
   */
  private getEstimatedLatency(modelName: string): number {
    if (modelName.includes('gemma')) return 300;
    if (modelName.includes('mistral')) return 500;
    if (modelName.includes('qwen')) return 600;
    if (modelName.includes('llama')) return 400;
    return 500;
  }

  /**
   * Get preferred tasks for model
   */
  private getPreferredTasks(modelName: string): string[] {
    if (modelName.includes('qwen')) {
      return ['coding', 'technical', 'reasoning'];
    } else if (modelName.includes('llama')) {
      return ['reasoning', 'analysis', 'general'];
    } else if (modelName.includes('mistral')) {
      return ['general', 'coding'];
    } else if (modelName.includes('gemma')) {
      return ['fast-response', 'general', 'chat'];
    }
    return ['general'];
  }

  /**
   * Get model by name
   */
  getModel(modelName: string): ModelInfo | undefined {
    return this.models.get(modelName);
  }

  /**
   * Get all models
   */
  getAllModels(): ModelInfo[] {
    return Array.from(this.models.values());
  }

  /**
   * Get available FREE models
   */
  getAvailableFreeModels(): ModelInfo[] {
    return Array.from(this.models.values()).filter((m) => m.available && m.free);
  }

  /**
   * Get models by preferred task
   */
  getModelsByTask(task: string): ModelInfo[] {
    return Array.from(this.models.values()).filter(
      (m) => m.available && m.preferredTasks.includes(task)
    );
  }

  /**
   * Record model success
   */
  recordSuccess(modelName: string, latencyMs: number): void {
    const model = this.models.get(modelName);
    if (model) {
      model.successes++;
      model.successRate = model.successes / (model.successes + model.failures);
      model.avgLatencyMs = Math.round(
        (model.avgLatencyMs + latencyMs) / 2
      );
      model.lastVerified = new Date();
    }
  }

  /**
   * Record model failure
   */
  recordFailure(modelName: string): void {
    const model = this.models.get(modelName);
    if (model) {
      model.failures++;
      model.successRate = model.successes / (model.successes + model.failures);
      model.lastVerified = new Date();

      // Circuit breaker: disable after 3 consecutive failures
      if (model.failures >= 3) {
        model.available = false;
        logger.warn(`Model ${modelName} disabled due to repeated failures`);
      }
    }
  }

  /**
   * Health check and recovery
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      const models = this.getAllModels();

      for (const model of models) {
        if (model.provider !== 'ollama') continue;

        try {
          const start = Date.now();
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: model.name,
              prompt: 'ok',
              stream: false,
            }),
            timeout: 10000,
          });

          if (response.ok) {
            const latency = Date.now() - start;
            this.recordSuccess(model.name, latency);

            // Re-enable if was disabled
            if (!model.available) {
              model.available = true;
              model.failures = 0;
              logger.info(`Model ${model.name} recovered`);
            }
          }
        } catch (error) {
          this.recordFailure(model.name);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Load registry from disk
   */
  private async loadRegistry(): Promise<void> {
    try {
      const data = await fs.readFile(this.registryPath, 'utf-8');
      const registry = JSON.parse(data) as Record<string, ModelInfo>;

      for (const [name, model] of Object.entries(registry)) {
        this.models.set(name, {
          ...model,
          lastVerified: new Date(model.lastVerified),
        });
      }

      logger.info(`Loaded ${this.models.size} models from registry`);
    } catch {
      logger.info('No existing registry found, will create new one');
    }
  }

  /**
   * Save registry to disk
   */
  async saveRegistry(): Promise<void> {
    try {
      const registryDir = path.dirname(this.registryPath);
      await fs.mkdir(registryDir, { recursive: true });

      const data = Object.fromEntries(this.models);
      await fs.writeFile(this.registryPath, JSON.stringify(data, null, 2));

      logger.info(`Saved registry with ${this.models.size} models`);
    } catch (error) {
      logger.error('Failed to save registry', { error });
    }
  }

  /**
   * Get registry stats
   */
  getStats() {
    const models = Array.from(this.models.values());

    return {
      total: models.length,
      available: models.filter((m) => m.available).length,
      free: models.filter((m) => m.free).length,
      local: models.filter((m) => m.local).length,
      paid: models.filter((m) => !m.free).length,
      averageSuccessRate: (
        models.reduce((sum, m) => sum + m.successRate, 0) / models.length
      ).toFixed(2),
      models: models.map((m) => ({
        name: m.name,
        available: m.available,
        successRate: m.successRate.toFixed(2),
        avgLatencyMs: m.avgLatencyMs,
      })),
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}
