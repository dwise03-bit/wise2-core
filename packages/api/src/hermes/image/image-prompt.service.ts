import { Injectable } from '@nestjs/common';
import type { ImageReferenceAsset } from './image.types';

@Injectable()
export class ImagePromptService {
  build(instruction: string, refs: ImageReferenceAsset[]) {
    const locked = refs.filter((r) => r.role === 'LOCKED');
    const editable = refs.filter((r) => r.role === 'EDITABLE');

    const lockedSection = locked
      .map(
        (r) =>
          `${r.id}:${r.label ?? r.kind ?? 'asset'}`
      )
      .join(', ') || 'none';

    const editableSection = editable
      .map(
        (r) =>
          `${r.id}:${r.label ?? r.kind ?? 'asset'}`
      )
      .join(', ') || 'scene/new elements only';

    const prompt = [
      `TASK: ${instruction}`,
      `LOCKED: ${lockedSection}`,
      `EDITABLE: ${editableSection}`,
      'RULES: Preserve LOCKED assets exactly. Do not redraw, reinterpret, beautify, restyle, replace, or regenerate them. Modify only requested editable/new content. If exact preservation is unsupported, return an error instead of a substitute.',
    ].join('\n');

    return {
      prompt,
      lockedAssetIds: locked.map((r) => r.id),
    };
  }
}
