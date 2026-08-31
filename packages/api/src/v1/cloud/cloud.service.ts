import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getCloudPlans } from './cloud.catalog';
import { evaluateLaunchGates, isLaunchReady } from './cloud-launch';
import { CloudBillingService } from './cloud-billing.service';
import { CloudProviderFactory } from './providers/provider.factory';
import { CloudPlanId } from './cloud.types';

@Injectable()
export class CloudService {
  constructor(
    private readonly configService: ConfigService,
    private readonly providerFactory: CloudProviderFactory,
    private readonly cloudBillingService: CloudBillingService,
  ) {}

  getPlans() {
    const testMode = ['fake', 'test'].includes(
      (this.configService.get<string>('CLOUD_STRIPE_MODE') || '').toLowerCase(),
    );

    return getCloudPlans(this.configService).map((plan) => ({
      id: plan.id,
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      features: plan.features,
      highlight: plan.highlight ?? false,
      purchasable: testMode
        ? Boolean(plan.twentyIPackageTypeId)
        : Boolean(plan.stripePriceId && plan.twentyIPackageTypeId),
      twentyIPackageLabel: plan.twentyIPackageLabel,
      testMode,
    }));
  }

  createCheckout(input: {
    planId: CloudPlanId;
    email: string;
    domainName: string;
    successUrl?: string;
    cancelUrl?: string;
  }) {
    return this.cloudBillingService.createCheckout(input);
  }

  createPortalSession(input: { email: string; returnUrl?: string }) {
    return this.cloudBillingService.createPortalSession(input);
  }

  getOrder(orderId: string) {
    return this.cloudBillingService.getOrder(orderId);
  }

  getServices(email: string) {
    return this.cloudBillingService.getServices(email);
  }

  async getProviderHealth() {
    const provider = this.providerFactory.getProvider();
    let packageTypes: Awaited<ReturnType<typeof provider.listPackageTypes>> = [];
    let providerOk = false;

    try {
      packageTypes = await provider.listPackageTypes();
      providerOk = packageTypes.length > 0;
    } catch {
      providerOk = false;
    }

    return {
      ok: providerOk,
      provider: provider.constructor.name,
      packageTypeCount: packageTypes.length,
      packageTypes: packageTypes.map((type) => ({
        id: type.id,
        label: type.label ?? type.name ?? `type-${type.id}`,
      })),
      plans: this.getPlans(),
    };
  }

  async getLaunchStatus() {
    const health = await this.getProviderHealth();
    const gates = evaluateLaunchGates(this.configService, health.ok);
    const ready = isLaunchReady(gates);
    const storefrontLive =
      (this.configService.get<string>('CLOUD_STOREFRONT_LIVE') || '').toLowerCase() === 'true';

    return {
      ready,
      storefrontLive,
      cloudBaseUrl: this.configService.get<string>('CLOUD_BASE_URL') || 'https://cloud.wise2.net',
      gates,
      plans: this.getPlans(),
      provider: {
        ok: health.ok,
        name: health.provider,
        packageTypeCount: health.packageTypeCount,
      },
    };
  }
}
