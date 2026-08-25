import axios from 'axios';
import { Logger } from 'pino';
import {
  GenerationResult,
  ProviderCredits,
  CreationRequest,
  ProviderType,
  ImageGenerationRequest,
  VideoGenerationRequest,
} from '../types';
import { BaseProviderAdapter } from './base.adapter';

export class ComfyUIAdapter extends BaseProviderAdapter {
  name = ProviderType.COMFYUI;

  constructor(logger: Logger, baseUrl: string = 'http://localhost:8188') {
    super(logger, '', baseUrl);
  }

  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult[]> {
    this.logOperation('Starting ComfyUI image generation', {
      prompt: request.prompt,
      count: request.count,
    });

    try {
      const results: GenerationResult[] = [];

      for (let i = 0; i < (request.count || 1); i++) {
        const response = await axios.post(`${this.baseUrl}/api/generate`, {
          prompt: request.prompt,
          style: request.style,
          model: 'sdxl',
          steps: 30,
          guidance: 7.5,
          seed: -1,
        });

        results.push({
          id: `${request.id}-${i}`,
          url: response.data.image_url,
          format: 'png',
          size: {
            width: 1024,
            height: 1024,
          },
          metadata: {
            model: 'SDXL',
            provider: this.name,
            prompt: request.prompt,
            generatedAt: new Date(),
          },
        });
      }

      this.logOperation('ComfyUI image generation complete', { count: results.length });
      return results;
    } catch (error) {
      this.logError('ComfyUI generation failed', error);
      throw error;
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResult[]> {
    throw new Error('ComfyUI video generation not yet implemented');
  }

  async imageToVideo(request: any): Promise<GenerationResult[]> {
    throw new Error('ComfyUI image-to-video not yet implemented');
  }

  async getCredits(): Promise<ProviderCredits> {
    return {
      provider: this.name,
      freeCredits: 999999, // Local = unlimited
      paidCredits: 0,
      lastUpdated: new Date(),
    };
  }

  async getStatus(): Promise<{ online: boolean; rateLimitRemaining?: number }> {
    try {
      await axios.get(`${this.baseUrl}/api/status`, { timeout: 5000 });
      return { online: true };
    } catch {
      return { online: false };
    }
  }

  async estimateCost(request: CreationRequest): Promise<number> {
    return 0; // Local generation = free
  }
}
