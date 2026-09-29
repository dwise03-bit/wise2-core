import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CommunicationMode,
  PaymentMode,
  DemoEnvironment,
} from '@prisma/client';

/**
 * DemoSafetyService
 *
 * Enforces demo mode safety boundaries.
 *
 * Prevents:
 * - Real SMS from escaping demo
 * - Real emails from escaping demo
 * - Real payments/charges
 * - Production data contamination
 *
 * Core principle: SIMULATED mode never calls real external providers.
 */
@Injectable()
export class DemoSafetyService {
  private readonly logger = new Logger('Demo/SafetyService');

  constructor(private prisma: PrismaService) {}

  /**
   * Check if tenant is in demo mode
   */
  async isInDemoMode(tenantId: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    return tenant?.demoMode ?? false;
  }

  /**
   * Get demo environment safety settings
   */
  async getSafetySettings(
    demoEnvironmentId: string,
  ): Promise<{
    communicationMode: CommunicationMode;
    paymentMode: PaymentMode;
  }> {
    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { id: demoEnvironmentId },
    });

    if (!demoEnv) {
      throw new Error(`Demo environment ${demoEnvironmentId} not found`);
    }

    return {
      communicationMode: demoEnv.communicationMode,
      paymentMode: demoEnv.paymentMode,
    };
  }

  /**
   * Verify SMS can be sent (demo mode check)
   *
   * Throws ForbiddenException if SMS would be sent in LIVE mode
   * (which should never happen in demo)
   */
  async verifySMSSafe(tenantId: string): Promise<void> {
    const isDemo = await this.isInDemoMode(tenantId);

    if (!isDemo) {
      throw new ForbiddenException(
        'SMS verification failed: tenant not in demo mode',
      );
    }

    // Additional check: ensure communication mode is SIMULATED
    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });

    if (
      !demoEnv ||
      demoEnv.communicationMode !== CommunicationMode.SIMULATED
    ) {
      throw new ForbiddenException('SMS: Communication mode not SIMULATED');
    }

    this.logger.log(`SMS verified safe for tenant ${tenantId}`);
  }

  /**
   * Verify email can be sent (demo mode check)
   */
  async verifyEmailSafe(tenantId: string): Promise<void> {
    const isDemo = await this.isInDemoMode(tenantId);

    if (!isDemo) {
      throw new ForbiddenException(
        'Email verification failed: tenant not in demo mode',
      );
    }

    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });

    if (
      !demoEnv ||
      demoEnv.communicationMode !== CommunicationMode.SIMULATED
    ) {
      throw new ForbiddenException('Email: Communication mode not SIMULATED');
    }

    this.logger.log(`Email verified safe for tenant ${tenantId}`);
  }

  /**
   * Verify payment is safe (demo mode check)
   *
   * CRITICAL: Demo payments must never be charged.
   * This guard prevents any real Stripe charges.
   */
  async verifyPaymentSafe(tenantId: string): Promise<void> {
    const isDemo = await this.isInDemoMode(tenantId);

    if (!isDemo) {
      throw new ForbiddenException(
        'Payment verification failed: tenant not in demo mode',
      );
    }

    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });

    if (!demoEnv || demoEnv.paymentMode !== PaymentMode.SIMULATED) {
      throw new ForbiddenException(
        'Payment: PaymentMode not SIMULATED - blocking real charge',
      );
    }

    this.logger.log(
      `Payment verified safe (simulated) for tenant ${tenantId}`,
    );
  }

  /**
   * Verify no real external calls will be made
   */
  async verifyAllProvidersSafe(tenantId: string): Promise<{
    sms: boolean;
    email: boolean;
    payment: boolean;
    calls: boolean;
  }> {
    const isDemo = await this.isInDemoMode(tenantId);

    if (!isDemo) {
      return {
        sms: false,
        email: false,
        payment: false,
        calls: false,
      };
    }

    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });

    return {
      sms: demoEnv?.communicationMode === CommunicationMode.SIMULATED,
      email: demoEnv?.communicationMode === CommunicationMode.SIMULATED,
      payment: demoEnv?.paymentMode === PaymentMode.SIMULATED,
      calls: demoEnv?.communicationMode === CommunicationMode.SIMULATED,
    };
  }

  /**
   * Log a blocked external call (for audit trail)
   */
  async logBlockedProviderCall(
    tenantId: string,
    providerType: 'sms' | 'email' | 'payment' | 'call',
    details: Record<string, unknown>,
  ): Promise<void> {
    this.logger.warn(`Blocked ${providerType} call for tenant ${tenantId}`, {
      details,
    });

    // Could also save to audit log table if needed
  }
}
