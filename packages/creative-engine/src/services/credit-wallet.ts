import { Logger } from 'pino';
import { CreationRequest, CreditWallet, ProviderCredits, ProviderType } from '../types';

export interface CreditWalletStore {
  getWallet(userId: string): Promise<CreditWallet | null>;
  saveWallet(wallet: CreditWallet): Promise<void>;
  updateProviderCredits(userId: string, provider: ProviderType, credits: ProviderCredits): Promise<void>;
}

export class CreditWalletService {
  private logger: Logger;
  private store: CreditWalletStore;
  private estimatedRetailPrices: Record<ProviderType, number> = {
    [ProviderType.KLING]: 0.05,
    [ProviderType.HAILUO]: 0.04,
    [ProviderType.PIXVERSE]: 0.03,
    [ProviderType.PIKA]: 0.04,
    [ProviderType.OPENAI]: 0.02,
    [ProviderType.KREA]: 0.03,
    [ProviderType.HIGGSFIELD]: 0.10,
    [ProviderType.COMFYUI]: 0,
    [ProviderType.LOCAL_DIFFUSION]: 0,
  };

  constructor(logger: Logger, store: CreditWalletStore) {
    this.logger = logger;
    this.store = store;
  }

  async getOrCreateWallet(userId: string): Promise<CreditWallet> {
    let wallet = await this.store.getWallet(userId);

    if (!wallet) {
      wallet = {
        userId,
        totalFreeCredits: 0,
        totalPaidCredits: 0,
        monthlyCost: 0,
        estimatedRetailValue: 0,
        providers: [],
        generationCount: 0,
        successCount: 0,
        failedCount: 0,
        lastUpdated: new Date(),
      };

      await this.store.saveWallet(wallet);
    }

    return wallet;
  }

  async recordGeneration(
    userId: string,
    request: CreationRequest,
    provider: ProviderType,
    cost: number,
    success: boolean
  ): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);

    wallet.generationCount += 1;
    if (success) {
      wallet.successCount += 1;
    } else {
      wallet.failedCount += 1;
    }

    if (cost > 0) {
      wallet.totalPaidCredits += cost;
      wallet.monthlyCost += cost;
    } else {
      wallet.totalFreeCredits += 1;
    }

    wallet.estimatedRetailValue +=
      this.estimatedRetailPrices[provider] || 0.05;

    wallet.lastUpdated = new Date();

    await this.store.saveWallet(wallet);

    this.logger.info(
      {
        userId,
        provider,
        cost,
        success,
        totalCost: wallet.monthlyCost,
      },
      'Generation recorded'
    );
  }

  async updateProviderCredits(
    userId: string,
    provider: ProviderType,
    credits: ProviderCredits
  ): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);

    const existingIdx = wallet.providers.findIndex((p) => p.provider === provider);
    if (existingIdx >= 0) {
      wallet.providers[existingIdx] = credits;
    } else {
      wallet.providers.push(credits);
    }

    wallet.lastUpdated = new Date();
    await this.store.saveWallet(wallet);
  }

  async getWalletStatus(userId: string): Promise<CreditWallet> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet;
  }

  async canGenerate(
    userId: string,
    provider: ProviderType,
    estimatedCost: number
  ): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId);
    const providerInfo = wallet.providers.find((p) => p.provider === provider);

    if (!providerInfo) {
      return false;
    }

    return (
      providerInfo.freeCredits >= estimatedCost ||
      providerInfo.paidCredits >= estimatedCost
    );
  }

  calculateMonthlySavings(estimatedRetailValue: number, actualCost: number): number {
    return estimatedRetailValue - actualCost;
  }
}
