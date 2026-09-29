import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  NotFoundException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { DemoProvisioningService } from '../services/demo-provisioning.service';
import { DemoSessionService } from '../services/demo-session.service';
import { DemoScenarioService } from '../services/demo-scenario.service';
import { DemoSafetyService } from '../services/demo-safety.service';
import { DemoScenarioExecutorService } from '../services/demo-scenario-executor.service';
import { DemoEventService } from '../services/demo-event.service';

/**
 * DemoController
 *
 * API endpoints for WISE² LIVE
 *
 * Public routes:
 * - GET /api/demo/:tenantSlug - Get demo landing page data
 * - POST /api/demo/:tenantSlug/session - Create new demo session
 * - GET /api/demo/session/:token - Get session (by token)
 * - POST /api/demo/session/:id/action - Record user action
 */
@Controller('api/demo')
export class DemoController {
  private readonly logger = new Logger('Demo/Controller');

  constructor(
    private provisioning: DemoProvisioningService,
    private sessions: DemoSessionService,
    private scenarios: DemoScenarioService,
    private safety: DemoSafetyService,
    private executor: DemoScenarioExecutorService,
    private events: DemoEventService,
  ) {}

  /**
   * GET /api/demo/status/:tenantId
   * Get demo provisioning status
   */
  @Get('status/:tenantId')
  async getStatus(@Param('tenantId') tenantId: string) {
    const status = await this.provisioning.getProvisioningStatus(tenantId);
    return status;
  }

  /**
   * POST /api/demo/session
   * Create a new demo session
   */
  @Post('session')
  @HttpCode(201)
  async createSession(
    @Body()
    body: {
      demoEnvironmentId: string;
      prospectEmail?: string;
      prospectName?: string;
      source?: string;
      campaign?: string;
      salespersonId?: string;
    },
  ) {
    const session = await this.sessions.createSession({
      demoEnvironmentId: body.demoEnvironmentId,
      prospectEmail: body.prospectEmail,
      prospectName: body.prospectName,
      source: body.source,
      campaign: body.campaign,
      salespersonId: body.salespersonId,
    });

    return {
      id: session.id,
      sessionToken: session.sessionToken,
      createdAt: session.createdAt,
    };
  }

  /**
   * GET /api/demo/session/:token
   * Get session by token
   */
  @Get('session/:token')
  async getSession(@Param('token') token: string) {
    const session = await this.sessions.getSessionByToken(token);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  /**
   * POST /api/demo/session/:id/action
   * Record a user action in the demo
   */
  @Post('session/:id/action')
  @HttpCode(200)
  async recordAction(
    @Param('id') sessionId: string,
    @Body() body: { action: string },
  ) {
    const session = await this.sessions.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.sessions.recordAction(sessionId, body.action);

    return { success: true };
  }

  /**
   * POST /api/demo/session/:id/conversion-intent
   * Mark session as showing conversion intent
   */
  @Post('session/:id/conversion-intent')
  @HttpCode(200)
  async markConversion(@Param('id') sessionId: string) {
    const session = await this.sessions.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.sessions.markConversionIntent(sessionId);

    return { success: true };
  }

  /**
   * GET /api/demo/scenarios/:demoEnvironmentId
   * List available scenarios
   */
  @Get('scenarios/:demoEnvironmentId')
  async getScenarios(
    @Param('demoEnvironmentId') demoEnvironmentId: string,
  ) {
    const scenarios = await this.scenarios.listScenarios(demoEnvironmentId);
    return scenarios;
  }

  /**
   * GET /api/demo/safety/:tenantId
   * Check safety settings for tenant
   */
  @Get('safety/:tenantId')
  async getSafety(@Param('tenantId') tenantId: string) {
    const isDemo = await this.safety.isInDemoMode(tenantId);
    const demoEnv = await this.provisioning.getDemoEnvironment(tenantId);
    const settings = isDemo && demoEnv
      ? await this.safety.getSafetySettings(demoEnv.id)
      : null;

    return {
      isDemo,
      settings,
    };
  }

  /**
   * POST /api/demo/reset/:demoEnvironmentId
   * Reset a demo environment (remove demo data)
   */
  @Post('reset/:demoEnvironmentId')
  @HttpCode(200)
  async resetDemo(
    @Param('demoEnvironmentId') demoEnvironmentId: string,
  ) {
    const demoEnv =
      await this.provisioning.getDemoEnvironmentById(demoEnvironmentId);
    if (!demoEnv) {
      throw new NotFoundException('Demo environment not found');
    }

    if (!demoEnv.allowDemoReset) {
      throw new Error('Demo reset not allowed for this environment');
    }

    await this.provisioning.resetDemoEnvironment(demoEnvironmentId);

    return { success: true, message: 'Demo reset complete' };
  }

  /**
   * POST /api/demo/scenario/:sessionId/execute
   * Execute a demo scenario (WATCH WISE² WORK experience)
   */
  @Post('scenario/:sessionId/execute')
  @HttpCode(200)
  async executeScenario(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      demoEnvironmentId: string;
      scenarioKey: string;
      industry: string;
      automationDelay?: number;
    },
  ) {
    const session = await this.sessions.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const result = await this.executor.executeScenario({
      demoSessionId: sessionId,
      demoEnvironmentId: body.demoEnvironmentId,
      scenarioKey: body.scenarioKey,
      industry: body.industry,
      automationDelay: body.automationDelay,
    });

    return result;
  }

  /**
   * GET /api/demo/session/:sessionId/events
   * Get all events for a demo session
   */
  @Get('session/:sessionId/events')
  async getSessionEvents(
    @Param('sessionId') sessionId: string,
  ) {
    const session = await this.sessions.getSession(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const events = await this.events.getSessionEvents(sessionId);

    return {
      sessionId,
      eventCount: events.length,
      events,
    };
  }

  /**
   * GET /api/demo/environment/:demoEnvironmentId/event-stats
   * Get event statistics for demo environment
   */
  @Get('environment/:demoEnvironmentId/event-stats')
  async getEventStats(
    @Param('demoEnvironmentId') demoEnvironmentId: string,
  ) {
    const demoEnv =
      await this.provisioning.getDemoEnvironmentById(demoEnvironmentId);
    if (!demoEnv) {
      throw new NotFoundException('Demo environment not found');
    }

    const stats = await this.events.getEventStats(demoEnvironmentId);

    return stats;
  }
}
