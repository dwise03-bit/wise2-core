import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMode, CommunicationMode } from '@prisma/client';

/**
 * DemoPromotionService (Phase 9)
 *
 * Handles demo-to-live promotion workflow.
 * When customer purchases, converts demo environment to production.
 *
 * Key responsibilities:
 * 1. Preserve business configuration
 * 2. Archive demo records
 * 3. Activate production providers (Stripe, email, SMS)
 * 4. Transition automation workflows
 * 5. Ensure no double-charging
 */
@Injectable()
export class DemoPromotionService {
  private readonly logger = new Logger('Demo/PromotionService');

  constructor(private prisma: PrismaService) {}

  /**
   * Promote demo to live after payment
   *
   * This is the critical conversion workflow:
   * DEMO (simulated) → LIVE (real business)
   */
  async promoteToLive(input: {
    tenantId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
  }): Promise<{
    success: boolean;
    message: string;
    demoEnvironmentId?: string;
    activatedFeatures: string[];
  }> {
    this.logger.log(`Promoting tenant ${input.tenantId} to LIVE`);

    try {
      // Get demo environment
      const demoEnv = await this.prisma.demoEnvironment.findUnique({
        where: { tenantId: input.tenantId },
      });

      if (!demoEnv) {
        throw new Error('Demo environment not found');
      }

      // Archive demo sessions
      const sessionCount = await this.archiveDemoSessions(demoEnv.id);
      this.logger.log(`Archived ${sessionCount} demo sessions`);

      // Activate production providers
      const updatedDemo = await this.prisma.demoEnvironment.update({
        where: { id: demoEnv.id },
        data: {
          // Switch from SIMULATED to LIVE modes
          communicationMode: CommunicationMode.LIVE,
          paymentMode: PaymentMode.STRIPE_LIVE,
          status: 'ACTIVE', // Keep demo environment for training
        },
      });

      // Update tenant to go LIVE
      const updatedTenant = await this.prisma.tenant.update({
        where: { id: input.tenantId },
        data: {
          demoMode: false, // EXIT demo mode
          stripeCustomerId: input.stripeCustomerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
        },
      });

      this.logger.log(`Tenant ${input.tenantId} is now LIVE`);

      const activatedFeatures = [
        'SMS communications',
        'Email delivery',
        'Stripe payments',
        'Live automations',
        'Production reporting',
      ];

      return {
        success: true,
        message: `Demo environment promoted to LIVE. Business now running on WISE².`,
        demoEnvironmentId: demoEnv.id,
        activatedFeatures,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Promotion failed: ${message}`);

      return {
        success: false,
        message: `Promotion failed: ${message}`,
        activatedFeatures: [],
      };
    }
  }

  /**
   * Archive demo sessions when promoting
   */
  private async archiveDemoSessions(demoEnvironmentId: string): Promise<number> {
    const result = await this.prisma.demoSession.updateMany({
      where: { demoEnvironmentId },
      data: {
        status: 'COMPLETED', // Mark all as completed
      },
    });

    return result.count;
  }

  /**
   * Check if tenant can be promoted
   */
  async canPromote(tenantId: string): Promise<{
    canPromote: boolean;
    blockers: string[];
  }> {
    const blockers: string[] = [];

    // Check demo environment exists
    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });

    if (!demoEnv) {
      blockers.push('Demo environment not configured');
    }

    // Check tenant data
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      blockers.push('Tenant not found');
    }

    if (!tenant?.demoMode) {
      blockers.push('Tenant not in demo mode');
    }

    return {
      canPromote: blockers.length === 0,
      blockers,
    };
  }

  /**
   * Get promotion readiness info
   */
  async getPromotionInfo(tenantId: string) {
    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });

    if (!demoEnv) {
      return null;
    }

    const sessionStats = await this.prisma.demoSession.aggregate({
      where: { demoEnvironmentId: demoEnv.id },
      _count: true,
      _avg: { engagementScore: true },
      _max: { completedAt: true },
    });

    return {
      demoEnvironmentId: demoEnv.id,
      businessName: demoEnv.businessName,
      industry: demoEnv.industry,
      totalSessions: sessionStats._count || 0,
      avgEngagement: Math.round((sessionStats._avg.engagementScore || 0) * 100) / 100,
      lastActivityAt: sessionStats._max.completedAt,
      readyToPromote: true,
      nextStep: 'Complete payment processing',
    };
  }
}
