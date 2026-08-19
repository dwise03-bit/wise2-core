import { Logger } from 'winston';
import { ComfyUIClient } from '../comfyui/ComfyUIClient.js';
import { ImageRouter } from '../router/ImageRouter.js';
import { GenerationRequest } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Bridge between Claude's MCP interface and the WISE² Visual Factory
 * Provides MCP-compatible tool implementations for image generation
 */
export class ComfyMCPBridge {
  private comfyui: ComfyUIClient;
  private router: ImageRouter;
  private logger: Logger;

  constructor(comfyui: ComfyUIClient, router: ImageRouter, logger: Logger) {
    this.comfyui = comfyui;
    this.router = router;
    this.logger = logger;
  }

  /**
   * MCP Tool: run_workflow
   * Execute a ComfyUI workflow and return the result
   */
  async runWorkflow(params: {
    workflow: Record<string, any>;
  }): Promise<any> {
    try {
      const result = await this.comfyui.executeWorkflow(params.workflow);
      return {
        success: true,
        promptId: result.promptId,
        outputs: result.outputs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * MCP Tool: generate_image
   * High-level image generation using WISE² router
   */
  async generateImage(params: {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    guidance?: number;
    seed?: number;
    model?: string;
    tenantId?: string;
    customerId?: string;
    brandId?: string;
  }): Promise<any> {
    try {
      const request: GenerationRequest = {
        requestId: uuidv4(),
        tenantId: params.tenantId || 'default',
        customerId: params.customerId || params.tenantId || 'default',
        brandId: params.brandId,
        userId: 'claude-mcp',
        type: 'text-to-image',
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        width: params.width || 1024,
        height: params.height || 768,
        steps: params.steps || 20,
        guidance: params.guidance || 7.5,
        seed: params.seed,
        qualityTier: 'balanced',
        model: params.model,
        createdAt: new Date(),
        priority: 'normal',
      };

      const job = await this.router.routeGenerationRequest(request);
      return {
        success: true,
        jobId: job.jobId,
        status: job.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * MCP Tool: job_status
   * Get the status of a generation job
   */
  async jobStatus(params: { jobId: string }): Promise<any> {
    const job = this.router.getJob(params.jobId);
    if (!job) {
      return {
        success: false,
        error: 'Job not found',
      };
    }

    return {
      success: true,
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      outputAssets: job.outputAssets,
      error: job.error,
      logs: job.logs.slice(-10), // Last 10 log entries
    };
  }

  /**
   * MCP Tool: wait_for_job
   * Wait for a job to complete
   */
  async waitForJob(params: {
    jobId: string;
    timeoutMs?: number;
  }): Promise<any> {
    const timeoutMs = params.timeoutMs || 600000; // 10 minutes default
    const startTime = Date.now();
    const pollInterval = 1000; // Check every second

    while (Date.now() - startTime < timeoutMs) {
      const job = this.router.getJob(params.jobId);

      if (!job) {
        return {
          success: false,
          error: 'Job not found',
        };
      }

      if (job.status === 'COMPLETED') {
        return {
          success: true,
          jobId: job.jobId,
          status: 'COMPLETED',
          outputAssets: job.outputAssets,
          generationTime: job.generationTime,
        };
      }

      if (job.status === 'FAILED') {
        return {
          success: false,
          jobId: job.jobId,
          status: 'FAILED',
          error: job.error,
        };
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    return {
      success: false,
      error: `Job timeout after ${timeoutMs}ms`,
      status: 'TIMEOUT',
    };
  }

  /**
   * MCP Tool: server_info
   * Get information about the ComfyUI server
   */
  async serverInfo(): Promise<any> {
    try {
      const stats = await this.comfyui.getSystemStats();
      const gpu = await this.comfyui.getGPUInfo();
      const models = await this.comfyui.listModels();
      const queueStats = this.router.getQueueStats();

      return {
        success: true,
        server: {
          available: this.comfyui.isAvailable(),
          stats,
          gpu,
        },
        models: {
          available: models.length,
          items: models,
        },
        queue: queueStats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * MCP Tool: fetch_outputs
   * Get the output files from a completed job
   */
  async fetchOutputs(params: { jobId: string }): Promise<any> {
    const job = this.router.getJob(params.jobId);

    if (!job) {
      return {
        success: false,
        error: 'Job not found',
      };
    }

    if (job.status !== 'COMPLETED') {
      return {
        success: false,
        error: `Job is in ${job.status} status, not completed`,
      };
    }

    return {
      success: true,
      jobId: job.jobId,
      assets: job.outputAssets,
    };
  }

  /**
   * MCP Tool: launch_comfyui
   * Ensure ComfyUI is running (no-op if already running)
   */
  async launchComfyui(): Promise<any> {
    if (this.comfyui.isAvailable()) {
      return {
        success: true,
        message: 'ComfyUI is already running',
      };
    }

    return {
      success: false,
      error: 'ComfyUI is not available. Manual intervention required.',
    };
  }

  /**
   * MCP Tool: stop_comfyui
   * Stop ComfyUI gracefully
   */
  async stopComfyui(): Promise<any> {
    try {
      // This would require additional implementation in ComfyUIClient
      // For now, we just report that we can't stop via API
      return {
        success: false,
        error: 'ComfyUI stop is not supported via API. Use systemctl or docker commands.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Register all MCP tools with the system
   */
  static getMCPToolDefinitions(): any[] {
    return [
      {
        name: 'generate_image',
        description: 'Generate an image from a text prompt using WISE² Visual Factory',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The text prompt for image generation',
            },
            negativePrompt: {
              type: 'string',
              description: 'Things to avoid in the image',
            },
            width: {
              type: 'number',
              description: 'Image width in pixels (default: 1024)',
            },
            height: {
              type: 'number',
              description: 'Image height in pixels (default: 768)',
            },
            steps: {
              type: 'number',
              description: 'Number of inference steps (default: 20)',
            },
            guidance: {
              type: 'number',
              description: 'Guidance scale for prompt adherence (default: 7.5)',
            },
            seed: {
              type: 'number',
              description: 'Random seed for reproducible results',
            },
            model: {
              type: 'string',
              description: 'Model to use (default: FLUX.2-klein-4B)',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'job_status',
        description: 'Get the status of a generation job',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: {
              type: 'string',
              description: 'The job ID to check',
            },
          },
          required: ['jobId'],
        },
      },
      {
        name: 'wait_for_job',
        description: 'Wait for a job to complete',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: {
              type: 'string',
              description: 'The job ID to wait for',
            },
            timeoutMs: {
              type: 'number',
              description: 'Maximum time to wait in milliseconds (default: 600000)',
            },
          },
          required: ['jobId'],
        },
      },
      {
        name: 'server_info',
        description: 'Get information about the ComfyUI server and available models',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'fetch_outputs',
        description: 'Get the output files from a completed job',
        inputSchema: {
          type: 'object',
          properties: {
            jobId: {
              type: 'string',
              description: 'The job ID',
            },
          },
          required: ['jobId'],
        },
      },
      {
        name: 'run_workflow',
        description: 'Execute a raw ComfyUI workflow JSON',
        inputSchema: {
          type: 'object',
          properties: {
            workflow: {
              type: 'object',
              description: 'The ComfyUI workflow JSON',
            },
          },
          required: ['workflow'],
        },
      },
    ];
  }
}
