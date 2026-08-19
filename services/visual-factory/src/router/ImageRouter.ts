import { Logger } from 'winston';
import { GenerationRequest, GenerationJob, GeneratedAsset, CustomerBrandProfile, WorkflowTemplate, GenerationResult } from '../types.js';
import { ComfyUIClient } from '../comfyui/ComfyUIClient.js';
import { WorkflowManager } from '../workflows/WorkflowManager.js';
import { BrandProfileManager } from '../brand/BrandProfileManager.js';
import { v4 as uuidv4 } from 'uuid';

export class ImageRouter {
  private comfyui: ComfyUIClient;
  private workflowManager: WorkflowManager;
  private brandManager: BrandProfileManager;
  private logger: Logger;
  private jobQueue: Map<string, GenerationJob>;
  private maxConcurrentJobs: number;

  constructor(
    comfyui: ComfyUIClient,
    workflowManager: WorkflowManager,
    brandManager: BrandProfileManager,
    logger: Logger,
    maxConcurrentJobs: number = 4
  ) {
    this.comfyui = comfyui;
    this.workflowManager = workflowManager;
    this.brandManager = brandManager;
    this.logger = logger;
    this.jobQueue = new Map();
    this.maxConcurrentJobs = maxConcurrentJobs;
  }

  async routeGenerationRequest(request: GenerationRequest): Promise<GenerationJob> {
    const jobId = uuidv4();
    const job: GenerationJob = {
      jobId,
      request,
      status: 'QUEUED',
      progress: 0,
      outputAssets: [],
      retriesLeft: 3,
      logs: [],
    };

    this.jobQueue.set(jobId, job);
    this.logger.info(`Generation job queued: ${jobId}`, { tenantId: request.tenantId, type: request.type });

    // Start processing asynchronously
    this.processJob(job).catch(error => {
      this.logger.error(`Job processing failed: ${jobId}`, error);
      job.status = 'FAILED';
      job.error = error.message;
    });

    return job;
  }

  private async processJob(job: GenerationJob): Promise<void> {
    try {
      job.status = 'PREPARING';
      job.startedAt = new Date();

      const request = job.request;
      this.logger.info(`Processing job: ${job.jobId}`, { type: request.type });

      // Load brand profile if available
      let brandProfile: CustomerBrandProfile | null = null;
      if (request.brandId) {
        try {
          brandProfile = await this.brandManager.loadBrandProfile(request.customerId, request.brandId);
        } catch (e) {
          this.logger.warn(`Failed to load brand profile: ${request.brandId}`, e);
        }
      }

      // Select appropriate workflow
      const workflow = this.selectWorkflow(request, brandProfile);
      this.logger.debug(`Selected workflow: ${workflow.id}`, { jobId: job.jobId });

      // Enhance prompt based on brand
      const enhancedPrompt = this.enhancePrompt(request.prompt, brandProfile, workflow);
      const enhancedNegativePrompt = this.enhanceNegativePrompt(request.negativePrompt || '', brandProfile);

      // Select model based on requirements and hardware
      const model = await this.selectModel(request, workflow);
      job.logs.push(`Selected model: ${model.name}`);

      // Build ComfyUI workflow
      job.status = 'GENERATING';
      const comfyWorkflow = this.buildComfyUIWorkflow(
        workflow,
        enhancedPrompt,
        enhancedNegativePrompt,
        request.width,
        request.height,
        request.steps,
        request.guidance,
        request.seed || Math.floor(Math.random() * 2147483647),
        model.path
      );

      // Submit to ComfyUI
      const startTime = Date.now();
      const result = await this.comfyui.executeWorkflow(comfyWorkflow);
      const generationTime = Date.now() - startTime;

      // Process and store outputs
      job.status = 'PROCESSING';
      job.progress = 85;
      job.logs.push(`Generation completed in ${generationTime}ms`);

      const asset = await this.processGenerationOutput(
        job.jobId,
        request,
        result,
        model.name,
        generationTime
      );

      job.outputAssets.push(asset);
      job.generationTime = generationTime;
      job.status = 'COMPLETED';
      job.progress = 100;
      job.completedAt = new Date();

      this.logger.info(`Job completed: ${job.jobId}`, {
        tenantId: request.tenantId,
        generationTime,
        assetId: asset.assetId,
      });
    } catch (error) {
      job.status = 'FAILED';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.logs.push(`ERROR: ${job.error}`);

      if (job.retriesLeft > 0) {
        job.retriesLeft--;
        job.logs.push(`Retrying... (${job.retriesLeft} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.processJob(job);
      }

      this.logger.error(`Job failed permanently: ${job.jobId}`, error);
    }
  }

  private selectWorkflow(request: GenerationRequest, brandProfile: CustomerBrandProfile | null): WorkflowTemplate {
    // Determine appropriate workflow based on request type
    const workflowId = this.getWorkflowIdForType(request.type);
    const workflow = this.workflowManager.getWorkflow(workflowId);

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return workflow;
  }

  private getWorkflowIdForType(type: string): string {
    const mapping: Record<string, string> = {
      'text-to-image': '01-text-to-image',
      'image-edit': '02-image-edit',
      'image-variation': '05-image-variations',
      'upscale': '06-upscale',
      'background-remove': '07-background-removal',
      'reference-driven': '04-multi-reference',
    };

    return mapping[type] || '01-text-to-image';
  }

  private enhancePrompt(basePrompt: string, brandProfile: CustomerBrandProfile | null, workflow: WorkflowTemplate): string {
    let enhanced = basePrompt;

    if (brandProfile) {
      enhanced += ` [${brandProfile.visualStyle}]`;
      if (brandProfile.brandName) {
        enhanced += ` [brand: ${brandProfile.brandName}]`;
      }
    }

    // Add quality/style modifiers based on workflow
    if (workflow.type === 'text-to-image') {
      enhanced += ', ultra-detailed, professional, premium quality, commercial photography';
    }

    return enhanced.trim();
  }

  private enhanceNegativePrompt(baseNegative: string, brandProfile: CustomerBrandProfile | null): string {
    const defaultNegatives = 'blurry, low quality, deformed, distorted, duplicate, watermark, text artifacts';
    let enhanced = baseNegative ? `${baseNegative}, ${defaultNegatives}` : defaultNegatives;

    if (brandProfile && brandProfile.negativePrompts.length > 0) {
      enhanced += ', ' + brandProfile.negativePrompts.join(', ');
    }

    return enhanced;
  }

  private async selectModel(request: GenerationRequest, workflow: WorkflowTemplate) {
    // Priority: user specified > workflow preferred > system default
    let modelName = request.model;

    if (!modelName) {
      modelName = workflow.supportedModels[0] || 'FLUX.2-klein-4B';
    }

    const model = await this.comfyui.getModelInfo(modelName);

    if (!model) {
      throw new Error(`Model not available: ${modelName}`);
    }

    return model;
  }

  private buildComfyUIWorkflow(
    template: WorkflowTemplate,
    prompt: string,
    negativePrompt: string,
    width: number,
    height: number,
    steps: number,
    guidance: number,
    seed: number,
    modelPath: string
  ): Record<string, any> {
    // Build ComfyUI workflow JSON based on template
    // This will be a complete workflow with all nodes properly connected
    return this.workflowManager.buildWorkflow(
      template.id,
      {
        prompt,
        negativePrompt,
        width,
        height,
        steps,
        guidance,
        seed,
        modelPath,
      }
    );
  }

  private async processGenerationOutput(
    jobId: string,
    request: GenerationRequest,
    result: any,
    model: string,
    generationTime: number
  ): Promise<GeneratedAsset> {
    const assetId = uuidv4();
    const path = `/media/tenants/${request.tenantId}/generated/${jobId}/output.png`;

    return {
      assetId,
      tenantId: request.tenantId,
      customerId: request.customerId,
      jobId,
      type: 'image',
      format: 'png',
      path,
      width: request.width,
      height: request.height,
      sizeBytes: result.sizeBytes || 0,
      prompt: request.prompt,
      model,
      seed: request.seed || 0,
      generationTimeMs: generationTime,
      createdAt: new Date(),
      metadata: {
        negativePrompt: request.negativePrompt,
        steps: request.steps,
        guidance: request.guidance,
        qualityTier: request.qualityTier,
        stylePreset: request.stylePreset,
      },
    };
  }

  getJob(jobId: string): GenerationJob | undefined {
    return this.jobQueue.get(jobId);
  }

  getAllJobs(): GenerationJob[] {
    return Array.from(this.jobQueue.values());
  }

  getJobsByStatus(status: string): GenerationJob[] {
    return Array.from(this.jobQueue.values()).filter(job => job.status === status);
  }

  getQueueStats() {
    const jobs = Array.from(this.jobQueue.values());
    return {
      queued: jobs.filter(j => j.status === 'QUEUED').length,
      preparing: jobs.filter(j => j.status === 'PREPARING').length,
      generating: jobs.filter(j => j.status === 'GENERATING').length,
      processing: jobs.filter(j => j.status === 'PROCESSING').length,
      completed: jobs.filter(j => j.status === 'COMPLETED').length,
      failed: jobs.filter(j => j.status === 'FAILED').length,
      cancelled: jobs.filter(j => j.status === 'CANCELLED').length,
      averageGenerationTime: jobs
        .filter(j => j.generationTime)
        .reduce((sum, j) => sum + (j.generationTime || 0), 0) / Math.max(jobs.filter(j => j.generationTime).length, 1),
      totalJobsProcessed: jobs.length,
    };
  }
}
