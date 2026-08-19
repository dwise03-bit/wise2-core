import { Logger } from 'winston';
import { WorkflowTemplate } from '../types.js';

export class WorkflowManager {
  private workflows: Map<string, WorkflowTemplate>;
  private logger: Logger;

  constructor(logger: Logger) {
    this.workflows = new Map();
    this.logger = logger;
    this.initializeDefaultWorkflows();
  }

  private initializeDefaultWorkflows(): void {
    // Text to Image - FLUX.2 Klein
    this.workflows.set('01-text-to-image', {
      id: '01-text-to-image',
      name: 'Text to Image',
      description: 'Generate images from text prompts using FLUX.2 Klein',
      type: 'text-to-image',
      requiredNodes: ['CheckpointLoader', 'CLIPTextEncode', 'KSampler', 'VAEDecode', 'SaveImage'],
      supportedModels: ['FLUX.2-klein-4B', 'SDXL'],
      defaultSettings: {
        steps: 20,
        guidance: 7.5,
        samplerName: 'euler',
        scheduler: 'normal',
      },
      inputSchema: {
        prompt: { type: 'string', required: true },
        negativePrompt: { type: 'string', required: false },
        width: { type: 'number', minimum: 512, maximum: 2048, default: 1024 },
        height: { type: 'number', minimum: 512, maximum: 2048, default: 768 },
        steps: { type: 'number', minimum: 1, maximum: 150, default: 20 },
        guidance: { type: 'number', minimum: 1, maximum: 30, default: 7.5 },
        seed: { type: 'number', default: -1 },
      },
    });

    // Image to Image / Edit
    this.workflows.set('02-image-edit', {
      id: '02-image-edit',
      name: 'Image Edit',
      description: 'Edit or transform existing images',
      type: 'image-edit',
      requiredNodes: ['CheckpointLoader', 'CLIPTextEncode', 'KSampler', 'VAEDecode', 'VAEEncode', 'SaveImage'],
      supportedModels: ['FLUX.2-klein-4B', 'SDXL'],
      defaultSettings: {
        steps: 20,
        guidance: 7.5,
        denoise: 0.75,
      },
      inputSchema: {
        referenceImage: { type: 'string', required: true },
        prompt: { type: 'string', required: true },
        negativePrompt: { type: 'string', required: false },
        steps: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        guidance: { type: 'number', minimum: 1, maximum: 30, default: 7.5 },
        denoise: { type: 'number', minimum: 0, maximum: 1, default: 0.75 },
      },
    });

    // Upscale
    this.workflows.set('06-upscale', {
      id: '06-upscale',
      name: 'Image Upscale',
      description: 'Upscale images to 2K or 4K resolution',
      type: 'upscale',
      requiredNodes: ['LoadImage', 'UpscaleModel', 'ImageUpscaleWithModel', 'SaveImage'],
      supportedModels: ['RealESRGAN_x4plus', 'RealESRGAN_x2plus'],
      defaultSettings: {
        scale: 4,
      },
      inputSchema: {
        referenceImage: { type: 'string', required: true },
        scale: { type: 'number', enum: [2, 4], default: 4 },
      },
    });

    // Background Removal
    this.workflows.set('07-background-removal', {
      id: '07-background-removal',
      name: 'Background Removal',
      description: 'Remove backgrounds from images',
      type: 'background-remove',
      requiredNodes: ['LoadImage', 'RemBG', 'SaveImage'],
      supportedModels: ['RemBG'],
      defaultSettings: {},
      inputSchema: {
        referenceImage: { type: 'string', required: true },
      },
    });

    // Image Variations
    this.workflows.set('05-image-variations', {
      id: '05-image-variations',
      name: 'Image Variations',
      description: 'Generate variations of an existing image',
      type: 'image-variation',
      requiredNodes: ['LoadImage', 'CheckpointLoader', 'CLIPTextEncode', 'KSampler', 'VAEDecode', 'VAEEncode', 'SaveImage'],
      supportedModels: ['FLUX.2-klein-4B', 'SDXL'],
      defaultSettings: {
        steps: 20,
        guidance: 7.5,
        denoise: 0.5,
      },
      inputSchema: {
        referenceImage: { type: 'string', required: true },
        prompt: { type: 'string', required: false },
        steps: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        denoise: { type: 'number', minimum: 0, maximum: 1, default: 0.5 },
      },
    });

    // Multi-reference (Character/Reference Driven)
    this.workflows.set('04-multi-reference', {
      id: '04-multi-reference',
      name: 'Multi-Reference Generation',
      description: 'Generate images constrained by multiple reference images',
      type: 'reference-driven',
      requiredNodes: ['LoadImage', 'CheckpointLoader', 'CLIPTextEncode', 'ControlNetLoader', 'ControlNetApply', 'KSampler', 'VAEDecode', 'SaveImage'],
      supportedModels: ['FLUX.2-klein-4B', 'SDXL'],
      defaultSettings: {
        steps: 25,
        guidance: 7.5,
        controlnetStrength: 1.0,
      },
      inputSchema: {
        referenceImages: { type: 'array', minItems: 1, maxItems: 4, required: true },
        prompt: { type: 'string', required: true },
        negativePrompt: { type: 'string', required: false },
        steps: { type: 'number', minimum: 1, maximum: 100, default: 25 },
      },
    });
  }

  getWorkflow(id: string): WorkflowTemplate | null {
    return this.workflows.get(id) || null;
  }

  listWorkflows(): WorkflowTemplate[] {
    return Array.from(this.workflows.values());
  }

  buildWorkflow(
    templateId: string,
    params: {
      prompt: string;
      negativePrompt?: string;
      width: number;
      height: number;
      steps: number;
      guidance: number;
      seed: number;
      modelPath: string;
    }
  ): Record<string, any> {
    const template = this.workflows.get(templateId);
    if (!template) {
      throw new Error(`Workflow template not found: ${templateId}`);
    }

    // Build actual ComfyUI workflow JSON
    // This creates a complete DAG of ComfyUI nodes
    return this.buildTextToImageWorkflow(params);
  }

  private buildTextToImageWorkflow(params: any): Record<string, any> {
    const seed = params.seed;
    const steps = params.steps;
    const guidance = params.guidance;
    const prompt = params.prompt;
    const negativePrompt = params.negativePrompt || '';
    const width = params.width;
    const height = params.height;
    const modelPath = params.modelPath;

    // ComfyUI workflow structure for text-to-image with FLUX.2 Klein
    return {
      '1': {
        inputs: {
          ckpt_name: modelPath,
        },
        class_type: 'CheckpointLoaderSimple',
        _meta: {
          title: 'Load Checkpoint',
        },
      },
      '2': {
        inputs: {
          clip: ['1', 1],
          text: prompt,
        },
        class_type: 'CLIPTextEncode',
        _meta: {
          title: 'CLIP Text Encode (Positive)',
        },
      },
      '3': {
        inputs: {
          clip: ['1', 1],
          text: negativePrompt,
        },
        class_type: 'CLIPTextEncode',
        _meta: {
          title: 'CLIP Text Encode (Negative)',
        },
      },
      '4': {
        inputs: {
          width: width,
          height: height,
          length: 1,
          batch_size: 1,
        },
        class_type: 'EmptyLatentImage',
        _meta: {
          title: 'Empty Latent Image',
        },
      },
      '5': {
        inputs: {
          seed: seed,
          steps: steps,
          cfg: guidance,
          sampler_name: 'euler',
          scheduler: 'karras',
          denoise: 1,
          model: ['1', 0],
          positive: ['2', 0],
          negative: ['3', 0],
          latent_image: ['4', 0],
        },
        class_type: 'KSampler',
        _meta: {
          title: 'KSampler',
        },
      },
      '6': {
        inputs: {
          samples: ['5', 0],
          vae: ['1', 2],
        },
        class_type: 'VAEDecode',
        _meta: {
          title: 'VAE Decode',
        },
      },
      '7': {
        inputs: {
          images: ['6', 0],
          filename_prefix: 'wise2_generation',
        },
        class_type: 'SaveImage',
        _meta: {
          title: 'Save Image',
        },
      },
    };
  }

  registerCustomWorkflow(template: WorkflowTemplate): void {
    this.workflows.set(template.id, template);
    this.logger.info(`Custom workflow registered: ${template.id}`);
  }
}
