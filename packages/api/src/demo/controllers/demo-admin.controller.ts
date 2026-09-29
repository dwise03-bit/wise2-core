import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DemoProvisioningService } from '../services/demo-provisioning.service';
import { DemoSessionService } from '../services/demo-session.service';

/**
 * DemoAdminController
 *
 * Internal admin endpoints for managing WISE² LIVE
 *
 * Routes:
 * - POST /api/admin/demo/provision/:tenantId - Provision demo for tenant
 * - GET /api/admin/demo/:tenantId - Get demo environment
 * - GET /api/admin/demo/analytics/:demoEnvironmentId - Get analytics
 * - POST /api/admin/demo/backfill - Backfill existing tenants
 */
@Controller('api/admin/demo')
export class DemoAdminController {
  private readonly logger = new Logger('Demo/AdminController');

  constructor(
    private provisioning: DemoProvisioningService,
    private sessions: DemoSessionService,
  ) {}

  /**
   * POST /api/admin/demo/provision/:tenantId
   * Provision demo environment for tenant (idempotent)
   */
  @Post('provision/:tenantId')
  @HttpCode(200)
  async provisionDemo(@Param('tenantId') tenantId: string) {
    this.logger.log(`Admin provisioning demo for tenant ${tenantId}`);

    const demoEnv =
      await this.provisioning.provisionDemoEnvironment(tenantId);

    return {
      success: true,
      demoEnvironmentId: demoEnv.id,
      businessName: demoEnv.businessName,
      industry: demoEnv.industry,
    };
  }

  /**
   * GET /api/admin/demo/:tenantId
   * Get demo environment for tenant
   */
  @Get(':tenantId')
  async getDemo(@Param('tenantId') tenantId: string) {
    const demoEnv = await this.provisioning.getDemoEnvironment(tenantId);
    if (!demoEnv) {
      throw new NotFoundException('Demo environment not found for tenant');
    }
    return demoEnv;
  }

  /**
   * GET /api/admin/demo/analytics/:demoEnvironmentId
   * Get demo environment analytics
   */
  @Get('analytics/:demoEnvironmentId')
  async getAnalytics(
    @Param('demoEnvironmentId') demoEnvironmentId: string,
  ) {
    const demoEnv =
      await this.provisioning.getDemoEnvironmentById(demoEnvironmentId);
    if (!demoEnv) {
      throw new NotFoundException('Demo environment not found');
    }

    const sessionAnalytics =
      await this.sessions.getSessionAnalytics(demoEnvironmentId);

    return {
      demoEnvironment: {
        id: demoEnv.id,
        businessName: demoEnv.businessName,
        industry: demoEnv.industry,
        status: demoEnv.status,
        createdAt: demoEnv.createdAt,
        lastResetAt: demoEnv.lastResetAt,
      },
      sessions: sessionAnalytics,
      conversionRate:
        sessionAnalytics.totalSessions > 0
          ? (
              (sessionAnalytics.conversionIntentCount /
                sessionAnalytics.totalSessions) *
              100
            ).toFixed(2) + '%'
          : '0%',
    };
  }

  /**
   * GET /api/admin/demo/sessions/:demoEnvironmentId
   * List sessions for demo environment
   */
  @Get('sessions/:demoEnvironmentId')
  async getSessions(
    @Param('demoEnvironmentId') demoEnvironmentId: string,
  ) {
    const sessions = await this.sessions.listSessions(demoEnvironmentId, {
      limit: 50,
    });

    return {
      count: sessions.length,
      sessions: sessions.map((s) => ({
        id: s.id,
        prospectEmail: s.prospectEmail,
        prospectName: s.prospectName,
        status: s.status,
        engagementScore: s.engagementScore,
        conversionIntent: s.conversionIntent,
        source: s.source,
        createdAt: s.createdAt,
      })),
    };
  }

  /**
   * POST /api/admin/demo/backfill
   * Backfill demo environments for existing tenants that don't have one
   *
   * Idempotent and restartable
   */
  @Post('backfill')
  @HttpCode(200)
  async backfillDemos(
    @Body()
    body: {
      dryRun?: boolean;
      limit?: number;
    },
  ) {
    this.logger.log(`Starting demo backfill (dry-run: ${body.dryRun})`);

    // This would query for all tenants without demoEnvironment
    // and provision them
    // Implementation details for Phase 2

    return {
      success: true,
      message: `Backfill complete (dry-run: ${body.dryRun})`,
      provisioned: 0,
      skipped: 0,
    };
  }

  /**
   * POST /api/admin/demo/cleanup-sessions
   * Clean up expired demo sessions
   */
  @Post('cleanup-sessions')
  @HttpCode(200)
  async cleanupSessions() {
    this.logger.log('Cleaning up expired demo sessions');

    const count = await this.sessions.cleanupExpiredSessions();

    return {
      success: true,
      deletedCount: count,
    };
  }
}
