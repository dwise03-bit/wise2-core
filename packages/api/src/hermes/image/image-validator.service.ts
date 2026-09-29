import { Injectable, Logger } from '@nestjs/common';
import type { ImageProviderResponse } from './image.types';

@Injectable()
export class ImageValidatorService {
  private readonly logger = new Logger('ImageValidatorService');

  validate(lockedIds: string[], response: ImageProviderResponse): ImageProviderResponse {
    // Validate imageUrl is present and non-empty
    if (!response.imageUrl || typeof response.imageUrl !== 'string') {
      throw new Error(
        'Validator: imageUrl is required and must be a valid string',
      );
    }

    // If no locked assets, validation passes
    if (lockedIds.length === 0) {
      return response;
    }

    // If preservationGuaranteed flag is set, trust it
    if (response.preservationGuaranteed === true) {
      this.logger.log('Locked references guaranteed by provider');
      return response;
    }

    // Otherwise, verify all locked IDs are in preservedReferenceIds
    const preservedIds = response.preservedReferenceIds || [];
    const missingLocks = lockedIds.filter(
      (id) => !preservedIds.includes(id)
    );

    if (missingLocks.length > 0) {
      throw new Error(
        `Validator: locked reference preservation failed. Missing IDs: ${missingLocks.join(
          ', ',
        )}`,
      );
    }

    return response;
  }
}
