import { Injectable } from '@nestjs/common';
import type { ImageReferenceAsset } from './image.types';

@Injectable()
export class ImageLockService {
  normalizeReferences(refs?: ImageReferenceAsset[]): ImageReferenceAsset[] {
    if (!refs || refs.length === 0) {
      return [];
    }

    const lockedKinds = new Set([
      'person',
      'logo',
      'hardware',
      'screenshot',
      'approved-art',
    ]);

    return refs.map((ref) => ({
      ...ref,
      role:
        ref.role ??
        (lockedKinds.has(ref.kind ?? 'other') ? 'LOCKED' : 'EDITABLE'),
    }));
  }
}
