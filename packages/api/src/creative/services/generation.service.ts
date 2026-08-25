import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  CreativeOrchestrator,
  CreationRequest,
  GenerationType,
  BrandProfile,
  CreditWalletService,
} from '@wise2/creative-engine';
import { CreateGenerationDto, GenerationStatusDto, CreditWalletStatusDto } from '../dto/create-generation.dto';

@Injectable()
export class CreativeGenerationService {
  private readonly logger = new Logger(CreativeGenerationService.name);
  private orchestrator: CreativeOrchestrator;
  private creditWallet: CreditWalletService;
  private qualityThreshold = 70;
  private jobStore: Map<string, any> = new Map();
  private userJobMap: Map<string, string[]> = new Map();

  constructor(
    orchestrator: CreativeOrchestrator,
    creditWallet: CreditWalletService
  ) {
    this.orchestrator = orchestrator;
    this.creditWallet = creditWallet;
  }

  async createGeneration(
    dto: CreateGenerationDto,
    userId: string
  ): Promise<GenerationStatusDto> {
    const jobId = uuidv4();

    const request: CreationRequest = {
      id: jobId,
      type: dto.type,
      brand: dto.brand as BrandProfile,
      prompt: dto.prompt,
      style: dto.style,
      count: dto.count || 1,
      duration: dto.duration,
      quality: dto.quality || 'standard',
      userId,
      timestamp: new Date(),
      metadata: dto.metadata,
    };

    this.logger.log(`Creating generation job ${jobId} for user ${userId}`);

    // Track user's jobs
    const userJobs = this.userJobMap.get(userId) || [];
    userJobs.push(jobId);
    this.userJobMap.set(userId, userJobs);

    // Start orchestration asynchronously
    this.orchestrator.orchestrateGeneration(request).then((job) => {
      this.jobStore.set(jobId, job);
    }).catch((error) => {
      this.logger.error(`Generation failed for ${jobId}:`, error);
      const failedJob = {
        id: jobId,
        request,
        status: 'failed',
        errors: [error.message],
      };
      this.jobStore.set(jobId, failedJob);
    });

    return {
      id: jobId,
      status: 'queued',
      progress: 0,
      provider: '',
      estimatedCost: 0,
      actualCost: 0,
      resultsCount: 0,
      qualityScore: 0,
      errors: [],
      createdAt: new Date(),
    };
  }

  async getGenerationStatus(
    jobId: string,
    userId: string
  ): Promise<GenerationStatusDto> {
    const userJobs = this.userJobMap.get(userId) || [];
    if (!userJobs.includes(jobId)) {
      throw new Error('Unauthorized or job not found');
    }

    const job = this.jobStore.get(jobId);
    if (!job) {
      return {
        id: jobId,
        status: 'queued',
        progress: 0,
        provider: '',
        estimatedCost: 0,
        actualCost: 0,
        resultsCount: 0,
        qualityScore: 0,
        errors: [],
        createdAt: new Date(),
      };
    }

    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      provider: job.provider,
      estimatedCost: job.estimatedCost,
      actualCost: job.actualCost,
      resultsCount: job.results?.length || 0,
      qualityScore: job.qualityScore,
      errors: job.errors || [],
      createdAt: job.request.timestamp,
      completedAt: job.completedAt,
    };
  }

  async getCreditStatus(userId: string): Promise<CreditWalletStatusDto> {
    const wallet = await this.creditWallet.getWalletStatus(userId);

    const successRate =
      wallet.generationCount > 0
        ? Math.round((wallet.successCount / wallet.generationCount) * 100)
        : 0;

    return {
      userId,
      totalFreeCredits: wallet.totalFreeCredits,
      totalPaidCredits: wallet.totalPaidCredits,
      monthlyCost: wallet.monthlyCost,
      estimatedRetailValue: wallet.estimatedRetailValue,
      generationCount: wallet.generationCount,
      successCount: wallet.successCount,
      failedCount: wallet.failedCount,
      successRate,
    };
  }

  async getProvidersStatus(): Promise<any> {
    // Would query all registered providers for their status
    return {
      providers: [
        { name: 'local-comfyui', online: true, freeCredits: 'unlimited' },
        { name: 'kling', online: true, freeCredits: 'checking...' },
        { name: 'hailuo', online: true, freeCredits: 'checking...' },
      ],
    };
  }

  getQualityThreshold(): number {
    return this.qualityThreshold;
  }

  setQualityThreshold(threshold: number) {
    this.qualityThreshold = threshold;
    this.orchestrator.setQualityThreshold(threshold);
  }
}
