import axios, { AxiosInstance } from 'axios';
import { Logger } from 'winston';
import { ModelInfo, GPUInfo } from '../types.js';
import EventEmitter from 'events';

export class ComfyUIClient extends EventEmitter {
  private client: AxiosInstance;
  private baseUrl: string;
  private logger: Logger;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isHealthy: boolean = false;

  constructor(baseUrl: string, logger: Logger) {
    super();
    this.baseUrl = baseUrl;
    this.logger = logger;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 300000, // 5 minutes for long-running operations
    });
  }

  async initialize(): Promise<void> {
    try {
      const health = await this.getHealth();
      this.isHealthy = health.status === 'ok';
      this.logger.info('ComfyUI client initialized', { isHealthy: this.isHealthy });

      // Start periodic health checks
      this.startHealthChecks();
    } catch (error) {
      this.logger.error('Failed to initialize ComfyUI client', error);
      this.isHealthy = false;
    }
  }

  private startHealthChecks(): void {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);

    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealth();
        this.isHealthy = health.status === 'ok';
      } catch (error) {
        this.isHealthy = false;
        this.logger.warn('ComfyUI health check failed', error);
      }
    }, 30000); // Check every 30 seconds
  }

  async getHealth() {
    try {
      const response = await this.client.get('/system_stats');
      return { status: 'ok', ...response.data };
    } catch (error) {
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getSystemStats() {
    try {
      const response = await this.client.get('/system_stats');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get system stats', error);
      throw error;
    }
  }

  async getGPUInfo(): Promise<GPUInfo | null> {
    try {
      const stats = await this.getSystemStats();

      if (!stats.devices || stats.devices.length === 0) {
        return null;
      }

      const device = stats.devices[0]; // Get first/primary GPU

      return {
        model: device.name || 'Unknown',
        vramTotal: device.vram_total || 0,
        vramFree: device.vram_free || 0,
        vramUsed: (device.vram_total || 0) - (device.vram_free || 0),
        utilization: this.estimateUtilization(device),
        temperature: device.temperature || 0,
        cudaAvailable: !!device.name,
        driverVersion: stats.nvidia_driver_version || 'unknown',
      };
    } catch (error) {
      this.logger.warn('Failed to get GPU info', error);
      return null;
    }
  }

  private estimateUtilization(device: any): number {
    if (!device.vram_total) return 0;
    const used = device.vram_total - (device.vram_free || 0);
    return Math.round((used / device.vram_total) * 100);
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.get('/api/models');
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to list models', error);
      return [];
    }
  }

  async getModelInfo(modelName: string): Promise<ModelInfo | null> {
    try {
      const models = await this.listModels();
      return models.find(m => m.name === modelName) || null;
    } catch (error) {
      this.logger.error(`Failed to get model info: ${modelName}`, error);
      return null;
    }
  }

  async listWorkflows(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/workflows');
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to list workflows', error);
      return [];
    }
  }

  async submitPrompt(workflow: Record<string, any>): Promise<string> {
    try {
      const response = await this.client.post('/prompt', workflow);
      const promptId = response.data.prompt_id;

      if (!promptId) {
        throw new Error('No prompt_id returned from ComfyUI');
      }

      return promptId;
    } catch (error) {
      this.logger.error('Failed to submit prompt', error);
      throw error;
    }
  }

  async getPromptHistory(promptId: string): Promise<any> {
    try {
      const response = await this.client.get(`/history/${promptId}`);
      return response.data?.[promptId];
    } catch (error) {
      this.logger.error(`Failed to get prompt history: ${promptId}`, error);
      throw error;
    }
  }

  async waitForCompletion(promptId: string, maxWaitMs: number = 600000): Promise<any> {
    const startTime = Date.now();
    const pollInterval = 1000; // Check every 1 second

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const history = await this.getPromptHistory(promptId);

        if (!history) {
          // Still processing
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }

        if (history.status && history.status.status_str === 'success') {
          return history.outputs;
        }

        if (history.status && history.status.status_str === 'error') {
          throw new Error(`Generation failed: ${JSON.stringify(history.status.error)}`);
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          // Job not yet registered, wait and retry
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Generation timeout after ${maxWaitMs}ms`);
  }

  async executeWorkflow(workflow: Record<string, any>): Promise<any> {
    try {
      const promptId = await this.submitPrompt(workflow);
      this.logger.debug(`Workflow submitted with promptId: ${promptId}`);

      const outputs = await this.waitForCompletion(promptId);
      this.logger.debug(`Workflow completed: ${promptId}`);

      return {
        promptId,
        outputs,
        success: true,
      };
    } catch (error) {
      this.logger.error('Workflow execution failed', error);
      throw error;
    }
  }

  async interruptExecution(): Promise<void> {
    try {
      await this.client.post('/interrupt');
    } catch (error) {
      this.logger.error('Failed to interrupt execution', error);
    }
  }

  isAvailable(): boolean {
    return this.isHealthy;
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}
