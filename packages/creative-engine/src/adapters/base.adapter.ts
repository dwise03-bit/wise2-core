import { Logger } from 'pino';
import {
  ProviderAdapter,
  ProviderType,
  GenerationResult,
  ProviderCredits,
  CreationRequest,
} from '../types';

export abstract class BaseProviderAdapter implements ProviderAdapter {
  abstract name: ProviderType;
  protected logger: Logger;
  protected apiKey: string;
  protected baseUrl: string;

  constructor(logger: Logger, apiKey: string, baseUrl: string) {
    this.logger = logger;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  abstract generateImage(request: any): Promise<GenerationResult[]>;
  abstract generateVideo(request: any): Promise<GenerationResult[]>;
  abstract imageToVideo(request: any): Promise<GenerationResult[]>;
  abstract getCredits(): Promise<ProviderCredits>;
  abstract getStatus(): Promise<{ online: boolean; rateLimitRemaining?: number }>;
  abstract estimateCost(request: CreationRequest): Promise<number>;

  protected logOperation(message: string, data?: any) {
    this.logger.info({ provider: this.name, ...data }, message);
  }

  protected logError(message: string, error: any) {
    this.logger.error({ provider: this.name, error }, message);
  }
}
