import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../email/email.service';
import { getCloudPlan } from './cloud.catalog';
import { CloudOrderStore } from './cloud-order.store';
import { CloudProviderFactory } from './providers/provider.factory';

@Injectable()
export class CloudProvisioningService {
  private readonly logger = new Logger(CloudProvisioningService.name);
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly orderStore: CloudOrderStore,
    private readonly providerFactory: CloudProviderFactory,
    @Optional() private readonly emailService?: EmailService,
  ) {}

  async enqueueProvision(orderId: string): Promise<void> {
    if (this.inFlight.has(orderId)) {
      return;
    }

    const order = this.orderStore.get(orderId);
    if (!order) {
      throw new Error(`Cloud order not found: ${orderId}`);
    }

    if (order.state === 'active' && order.externalServiceId) {
      return;
    }

    if (!['paid', 'queued', 'provisioning', 'failed'].includes(order.state)) {
      throw new Error(`Cloud order ${orderId} is not ready for provisioning (${order.state})`);
    }

    this.inFlight.add(orderId);
    this.orderStore.transition(orderId, 'provisioning');

    try {
      const plan = getCloudPlan(this.configService, order.planId);
      if (!plan?.twentyIPackageTypeId) {
        throw new Error(`20i package type is not configured for plan ${order.planId}`);
      }

      const provider = this.providerFactory.getProvider();
      const result = await provider.provision({
        idempotencyKey: `${orderId}:provision`,
        packageTypeId: plan.twentyIPackageTypeId,
        domainName: order.domainName,
        label: `WISE² Cloud ${plan.name}`,
        customerEmail: order.email,
      });

      this.orderStore.transition(orderId, 'active', {
        externalServiceId: result.externalId,
        failureReason: undefined,
      });
      await this.sendWelcomeEmail(orderId);
      this.logger.log(`Cloud order ${orderId} active on 20i package ${result.externalId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.orderStore.transition(orderId, 'failed', { failureReason: message });
      this.logger.error(`Cloud provisioning failed for ${orderId}: ${message}`);
      throw error;
    } finally {
      this.inFlight.delete(orderId);
    }
  }

  async suspendService(orderId: string): Promise<void> {
    const order = this.orderStore.get(orderId);
    if (!order?.externalServiceId) {
      return;
    }

    const provider = this.providerFactory.getProvider();
    await provider.suspend(order.externalServiceId);
    this.logger.log(`Suspended 20i package ${order.externalServiceId} for order ${orderId}`);
  }

  async unsuspendService(orderId: string): Promise<void> {
    const order = this.orderStore.get(orderId);
    if (!order?.externalServiceId) {
      return;
    }

    const provider = this.providerFactory.getProvider();
    await provider.unsuspend(order.externalServiceId);
    this.logger.log(`Unsuspended 20i package ${order.externalServiceId} for order ${orderId}`);
  }

  private async sendWelcomeEmail(orderId: string): Promise<void> {
    const order = this.orderStore.get(orderId);
    if (!order || order.welcomeEmailSentAt) {
      return;
    }

    const plan = getCloudPlan(this.configService, order.planId);
    const cloudBaseUrl =
      this.configService.get<string>('CLOUD_BASE_URL') || 'https://cloud.wise2.net';

    if (this.emailService) {
      await this.emailService.sendNotification(
        order.email,
        'Your WISE² Cloud service is live',
        `Your ${plan?.name ?? 'WISE² Cloud'} hosting for ${order.domainName} is active. Package ID: ${order.externalServiceId}.`,
        `${cloudBaseUrl}/order/${order.id}`,
        'View service status',
      );
    }

    this.orderStore.update(orderId, {
      welcomeEmailSentAt: new Date().toISOString(),
    });
  }
}
