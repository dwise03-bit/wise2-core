import { Logger } from 'pino';
import {
  CreationRequest,
  GenerationJob,
  GenerationType,
  ProviderType,
  QualityEvaluation,
  BrandAssets,
} from '../types';
import { ModelRouter } from '../routers/model-router';
import { QualityEvaluator } from './quality-evaluator';
import { CreditWalletService } from './credit-wallet';

export interface GenerationJobStore {
  createJob(job: GenerationJob): Promise<void>;
  updateJob(job: GenerationJob): Promise<void>;
  getJob(jobId: string): Promise<GenerationJob | null>;
}

export interface BrandAssetStore {
  getBrandAssets(brand: string): Promise<BrandAssets | null>;
}

export class CreativeOrchestrator {
  private logger: Logger;
  private router: ModelRouter;
  private qualityEvaluator: QualityEvaluator;
  private creditWallet: CreditWalletService;
  private jobStore: GenerationJobStore;
  private brandStore: BrandAssetStore;
  private maxRetries = 3;
  private qualityThreshold = 70;

  constructor(
    logger: Logger,
    router: ModelRouter,
    qualityEvaluator: QualityEvaluator,
    creditWallet: CreditWalletService,
    jobStore: GenerationJobStore,
    brandStore: BrandAssetStore
  ) {
    this.logger = logger;
    this.router = router;
    this.qualityEvaluator = qualityEvaluator;
    this.creditWallet = creditWallet;
    this.jobStore = jobStore;
    this.brandStore = brandStore;
  }

  async orchestrateGeneration(request: CreationRequest): Promise<GenerationJob> {
    const jobId = request.id;
    const job: GenerationJob = {
      id: jobId,
      request,
      status: 'queued',
      progress: 0,
      provider: ProviderType.COMFYUI,
      estimatedCost: 0,
      actualCost: 0,
      results: [],
      qualityScore: 0,
      errors: [],
    };

    await this.jobStore.createJob(job);

    try {
      this.logger.info({ jobId }, 'Starting generation orchestration');

      // Step 1: Select provider based on quality, cost, availability
      job.status = 'generating';
      job.progress = 10;
      await this.jobStore.updateJob(job);

      const providerOption = await this.router.selectProvider(request);
      job.provider = providerOption.provider;
      job.estimatedCost = providerOption.estimatedCost;

      this.logger.info(
        { jobId, provider: providerOption.provider, cost: providerOption.estimatedCost },
        'Provider selected'
      );

      // Step 2: Load brand assets if available
      const brandAssets = await this.brandStore.getBrandAssets(request.brand);

      // Step 3: Generate with selected provider
      job.progress = 30;
      await this.jobStore.updateJob(job);

      const adapter = this.router.getAdapter(job.provider);
      let results;

      if (request.type === GenerationType.IMAGE) {
        results = await adapter.generateImage(request as any);
      } else if (request.type === GenerationType.VIDEO) {
        results = await adapter.generateVideo(request as any);
      } else if (request.type === GenerationType.IMAGE_TO_VIDEO) {
        results = await adapter.imageToVideo(request as any);
      } else {
        throw new Error(`Unsupported generation type: ${request.type}`);
      }

      job.results = results;
      job.progress = 60;
      await this.jobStore.updateJob(job);

      // Step 4: Quality evaluation
      job.status = 'quality_check';
      job.progress = 70;
      await this.jobStore.updateJob(job);

      let bestQuality = 0;
      const evaluations: QualityEvaluation[] = [];

      for (const result of results) {
        const evaluation = await this.qualityEvaluator.evaluateGeneration(
          result,
          request,
          brandAssets
        );
        evaluations.push(evaluation);
        bestQuality = Math.max(bestQuality, evaluation.score);
      }

      job.qualityScore = bestQuality;

      // Step 5: Retry if quality below threshold
      if (bestQuality < this.qualityThreshold && job.progress < 80) {
        job.status = 'generating';
        job.progress = 40;

        // Try alternative provider
        const altProvider = await this.findAlternativeProvider(request, job.provider);
        if (altProvider) {
          this.logger.info(
            { jobId, previousProvider: job.provider, newProvider: altProvider.provider },
            'Retrying with alternative provider'
          );

          job.provider = altProvider.provider;
          const altAdapter = this.router.getAdapter(altProvider.provider);

          if (request.type === GenerationType.IMAGE) {
            results = await altAdapter.generateImage(request as any);
          } else if (request.type === GenerationType.VIDEO) {
            results = await altAdapter.generateVideo(request as any);
          } else if (request.type === GenerationType.IMAGE_TO_VIDEO) {
            results = await altAdapter.imageToVideo(request as any);
          }

          job.results = results;

          for (const result of results) {
            const evaluation = await this.qualityEvaluator.evaluateGeneration(
              result,
              request,
              brandAssets
            );
            evaluations.push(evaluation);
            bestQuality = Math.max(bestQuality, evaluation.score);
          }

          job.qualityScore = bestQuality;
        }
      }

      // Step 6: Upscale/enhance if needed
      if (
        job.qualityScore >= this.qualityThreshold &&
        request.quality === 'premium'
      ) {
        job.status = 'enhancing';
        job.progress = 80;
        await this.jobStore.updateJob(job);

        // Upscaling would happen here
        this.logger.info({ jobId }, 'Enhancing results');
      }

      // Step 7: Record in credit wallet
      await this.creditWallet.recordGeneration(
        request.userId,
        request,
        job.provider,
        job.actualCost,
        true
      );

      job.status = 'complete';
      job.progress = 100;
      job.completedAt = new Date();

      this.logger.info(
        { jobId, quality: job.qualityScore, resultsCount: job.results.length },
        'Generation orchestration complete'
      );
    } catch (error) {
      job.status = 'failed';
      job.errors.push(error instanceof Error ? error.message : String(error));
      job.completedAt = new Date();

      await this.creditWallet.recordGeneration(
        request.userId,
        request,
        job.provider,
        0,
        false
      );

      this.logger.error({ jobId, error }, 'Generation orchestration failed');
    }

    await this.jobStore.updateJob(job);
    return job;
  }

  private async findAlternativeProvider(
    request: CreationRequest,
    excludeProvider: ProviderType
  ): Promise<any> {
    // Try to find a different provider
    // In production, would evaluate multiple options
    return null;
  }

  setQualityThreshold(threshold: number) {
    this.qualityThreshold = threshold;
    this.qualityEvaluator.setAcceptanceThreshold(threshold);
  }
}
