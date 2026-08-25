import { Logger } from 'pino';
import {
  CreationRequest,
  GenerationType,
  GenerationJob,
  ProviderType,
  ProviderAdapter,
  GenerationResult,
  QualityEvaluation,
} from '../types';

interface ProviderOption {
  provider: ProviderType;
  adapter: ProviderAdapter;
  priority: number;
  estimatedCost: number;
  hasCredits: boolean;
}

export class ModelRouter {
  private logger: Logger;
  private adapters: Map<ProviderType, ProviderAdapter> = new Map();
  private qualityThreshold = 70; // Minimum quality score before escalating to premium

  constructor(logger: Logger) {
    this.logger = logger;
  }

  registerAdapter(adapter: ProviderAdapter) {
    this.adapters.set(adapter.name, adapter);
    this.logger.info({ provider: adapter.name }, 'Provider adapter registered');
  }

  async selectProvider(request: CreationRequest): Promise<ProviderOption> {
    this.logger.info({ requestId: request.id, type: request.type }, 'Selecting provider');

    const candidates = await this.evaluateCandidates(request);

    if (candidates.length === 0) {
      throw new Error('No available providers for this request');
    }

    // Sort by priority: local free > cloud free > paid
    candidates.sort((a, b) => {
      if (a.hasCredits && !b.hasCredits) return -1;
      if (!a.hasCredits && b.hasCredits) return 1;
      return a.priority - b.priority;
    });

    const selected = candidates[0];

    this.logger.info(
      {
        requestId: request.id,
        provider: selected.provider,
        cost: selected.estimatedCost,
      },
      'Provider selected'
    );

    return selected;
  }

  private async evaluateCandidates(request: CreationRequest): Promise<ProviderOption[]> {
    const candidates: ProviderOption[] = [];

    for (const [providerType, adapter] of this.adapters) {
      if (!this.isProviderCompatible(request.type, providerType)) {
        continue;
      }

      try {
        const status = await adapter.getStatus();
        if (!status.online) continue;

        const credits = await adapter.getCredits();
        const estimatedCost = await adapter.estimateCost(request);
        const hasCredits =
          (credits.freeCredits > estimatedCost || credits.paidCredits > estimatedCost) &&
          credits.freeCredits + credits.paidCredits > 0;

        candidates.push({
          provider: providerType,
          adapter,
          priority: this.calculatePriority(providerType, request.quality),
          estimatedCost,
          hasCredits,
        });
      } catch (error) {
        this.logger.warn(
          { provider: providerType, error },
          'Failed to evaluate provider'
        );
      }
    }

    return candidates;
  }

  private isProviderCompatible(type: GenerationType, provider: ProviderType): boolean {
    const compatibility: Record<GenerationType, ProviderType[]> = {
      [GenerationType.IMAGE]: [
        ProviderType.KREA,
        ProviderType.OPENAI,
        ProviderType.LOCAL_DIFFUSION,
        ProviderType.COMFYUI,
      ],
      [GenerationType.VIDEO]: [
        ProviderType.KLING,
        ProviderType.HAILUO,
        ProviderType.PIXVERSE,
        ProviderType.PIKA,
      ],
      [GenerationType.IMAGE_TO_VIDEO]: [
        ProviderType.KLING,
        ProviderType.HAILUO,
        ProviderType.PIXVERSE,
        ProviderType.PIKA,
      ],
      [GenerationType.TEXT]: [ProviderType.OPENAI],
    };

    return compatibility[type]?.includes(provider) || false;
  }

  private calculatePriority(provider: ProviderType, quality?: string): number {
    // Lower number = higher priority

    // Local providers always first
    if (provider === ProviderType.COMFYUI || provider === ProviderType.LOCAL_DIFFUSION) {
      return 1;
    }

    // Free tier quality-appropriate selection
    if (quality === 'draft') {
      return 2; // Prioritize speed
    }

    if (quality === 'standard') {
      return 3; // Balanced
    }

    // Premium quality
    if (provider === ProviderType.KLING) return 4; // Best cinematic
    if (provider === ProviderType.HAILUO) return 5; // Photorealistic
    if (provider === ProviderType.HIGGSFIELD) return 10; // Premium only

    return 6; // Other providers
  }

  getAdapter(providerType: ProviderType): ProviderAdapter {
    const adapter = this.adapters.get(providerType);
    if (!adapter) {
      throw new Error(`No adapter registered for provider: ${providerType}`);
    }
    return adapter;
  }
}
