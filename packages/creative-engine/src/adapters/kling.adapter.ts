import axios from 'axios';
import { Logger } from 'pino';
import {
  GenerationResult,
  ProviderCredits,
  CreationRequest,
  ProviderType,
  ImageGenerationRequest,
  VideoGenerationRequest,
  ImageToVideoRequest,
} from '../types';
import { BaseProviderAdapter } from './base.adapter';

export class KlingAdapter extends BaseProviderAdapter {
  name = ProviderType.KLING;
  private creditsCache: ProviderCredits | null = null;
  private creditsCacheTTL = 5 * 60 * 1000; // 5 minutes
  private creditsCacheTime = 0;

  constructor(logger: Logger, apiKey: string, baseUrl: string = 'https://api.klingai.com/v1') {
    super(logger, apiKey, baseUrl);
  }

  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult[]> {
    // Kling is primarily a video generator; fallback to another provider for images
    throw new Error(
      'Use dedicated image provider for images; Kling optimized for video generation'
    );
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResult[]> {
    this.logOperation('Starting Kling video generation', {
      duration: request.duration,
      prompt: request.prompt,
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/videos/text-to-video`,
        {
          prompt: request.prompt,
          duration: Math.min(request.duration, 60),
          quality: request.quality || 'standard',
          aspect_ratio: '16:9',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result: GenerationResult = {
        id: request.id,
        url: response.data.video_url,
        format: 'mp4',
        size: {
          width: 1920,
          height: 1080,
          duration: request.duration,
        },
        metadata: {
          model: 'Kling',
          provider: this.name,
          prompt: request.prompt,
          generatedAt: new Date(),
        },
      };

      this.logOperation('Kling video generation complete');
      return [result];
    } catch (error) {
      this.logError('Kling video generation failed', error);
      throw error;
    }
  }

  async imageToVideo(request: ImageToVideoRequest): Promise<GenerationResult[]> {
    this.logOperation('Starting Kling image-to-video', {
      duration: request.duration,
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/videos/image-to-video`,
        {
          image_url: request.imageUrl,
          prompt: request.prompt,
          duration: Math.min(request.duration, 30),
          quality: request.quality || 'standard',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result: GenerationResult = {
        id: request.id,
        url: response.data.video_url,
        format: 'mp4',
        size: {
          width: 1920,
          height: 1080,
          duration: request.duration,
        },
        metadata: {
          model: 'Kling',
          provider: this.name,
          prompt: request.prompt,
          generatedAt: new Date(),
        },
      };

      this.logOperation('Kling image-to-video complete');
      return [result];
    } catch (error) {
      this.logError('Kling image-to-video failed', error);
      throw error;
    }
  }

  async getCredits(): Promise<ProviderCredits> {
    // Check cache first
    if (this.creditsCache && Date.now() - this.creditsCacheTime < this.creditsCacheTTL) {
      return this.creditsCache;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/account/credits`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      this.creditsCache = {
        provider: this.name,
        freeCredits: response.data.free_credits || 0,
        paidCredits: response.data.paid_credits || 0,
        resetDate: response.data.reset_date
          ? new Date(response.data.reset_date)
          : undefined,
        lastUpdated: new Date(),
      };

      this.creditsCacheTime = Date.now();
      return this.creditsCache;
    } catch (error) {
      this.logError('Failed to fetch Kling credits', error);
      // Return unknown state rather than failing
      return {
        provider: this.name,
        freeCredits: 0,
        paidCredits: 0,
        lastUpdated: new Date(),
      };
    }
  }

  async getStatus(): Promise<{ online: boolean; rateLimitRemaining?: number }> {
    try {
      const response = await axios.get(`${this.baseUrl}/status`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 5000,
      });

      return {
        online: response.data.status === 'operational',
        rateLimitRemaining: response.data.rate_limit_remaining,
      };
    } catch {
      return { online: false };
    }
  }

  async estimateCost(request: CreationRequest): Promise<number> {
    // Kling costs vary by quality and duration
    // Draft: ~0.02 per 10 seconds
    // Standard: ~0.05 per 10 seconds
    // Premium: ~0.10 per 10 seconds
    const quality = request.quality || 'standard';
    const duration = (request.metadata?.duration || 10) / 10;

    const costPerDuration = {
      draft: 0.02,
      standard: 0.05,
      premium: 0.1,
    };

    return (costPerDuration[quality] || costPerDuration.standard) * duration;
  }
}
