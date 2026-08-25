import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type {
  ImageProviderRequest,
  ImageProviderResponse,
} from './image.types';

@Injectable()
export class ImageProviderService {
  private readonly logger = new Logger('ImageProviderService');

  private readonly endpoint = process.env.HERMES_IMAGE_ENDPOINT;
  private readonly apiKey = process.env.HERMES_IMAGE_API_KEY;
  private readonly provider = process.env.HERMES_IMAGE_PROVIDER || 'custom';
  private readonly timeoutMs =
    parseInt(process.env.HERMES_IMAGE_TIMEOUT_MS || '120000', 10);

  constructor(private readonly httpService: HttpService) {}

  isConfigured(): boolean {
    return !!this.endpoint && !!this.apiKey;
  }

  async generate(request: ImageProviderRequest): Promise<ImageProviderResponse> {
    if (!this.isConfigured()) {
      throw new Error('Hermes image backend is not configured');
    }

    const payload = {
      prompt: request.prompt,
      references: request.references.map(({ id, url, role, kind }) => ({
        id,
        url,
        role,
        kind,
      })),
      aspectRatio: request.aspectRatio,
      preserveLockedReferences: true,
    };

    try {
      this.logger.log(`Calling image backend: ${this.provider}`);

      const response = await firstValueFrom(
        this.httpService.post(this.endpoint!, payload, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.timeoutMs,
        }),
      );

      const data = response.data;

      // Validate required fields
      if (!data.imageUrl || typeof data.imageUrl !== 'string') {
        throw new Error('Backend response missing or invalid imageUrl');
      }

      return {
        imageUrl: data.imageUrl,
        provider: data.provider || this.provider,
        preservedReferenceIds: data.preservedReferenceIds,
        preservationGuaranteed: data.preservationGuaranteed,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Image generation failed: ${message}`);
      throw error;
    }
  }
}
