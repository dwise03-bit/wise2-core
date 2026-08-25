import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ImageLockService } from './image-lock.service';
import { ImagePromptService } from './image-prompt.service';
import { ImageProviderService } from './image-provider.service';
import { ImageValidatorService } from './image-validator.service';
import type {
  HermesImageRequest,
  HermesImageResult,
} from './image.types';

@Injectable()
export class ImageOrchestratorService {
  private readonly logger = new Logger('ImageOrchestratorService');

  constructor(
    private readonly lockService: ImageLockService,
    private readonly promptService: ImagePromptService,
    private readonly providerService: ImageProviderService,
    private readonly validatorService: ImageValidatorService,
  ) {}

  async generate(request: HermesImageRequest): Promise<HermesImageResult> {
    const jobId = randomUUID();

    try {
      this.logger.log(`[${jobId}] Starting image generation`);

      // Step 1: Normalize references
      const refs = this.lockService.normalizeReferences(request.references);
      this.logger.debug(`[${jobId}] Normalized ${refs.length} references`);

      // Step 2: Build prompt
      const built = this.promptService.build(request.instruction, refs);
      this.logger.debug(`[${jobId}] Built prompt with ${built.lockedAssetIds.length} locked assets`);

      // Step 3: Call provider
      const raw = await this.providerService.generate({
        prompt: built.prompt,
        references: refs,
        aspectRatio: request.aspectRatio ?? '16:9',
      });
      this.logger.debug(`[${jobId}] Got response from provider: ${raw.provider}`);

      // Step 4: Validate
      const valid = this.validatorService.validate(
        built.lockedAssetIds,
        raw,
      );
      this.logger.log(`[${jobId}] Image generation completed`);

      return {
        jobId,
        status: 'completed',
        imageUrl: valid.imageUrl,
        provider: valid.provider,
        lockedAssetIds: built.lockedAssetIds,
        instruction: request.instruction,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Image generation failed';
      this.logger.error(`[${jobId}] Generation failed: ${message}`);

      return {
        jobId,
        status: 'failed',
        lockedAssetIds: [],
        instruction: request.instruction,
        error: message,
      };
    }
  }
}
