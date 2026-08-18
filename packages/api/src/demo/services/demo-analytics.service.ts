import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * DemoAnalyticsService (Phase 8)
 *
 * Tracks demo engagement and conversion metrics.
 * Provides sales intelligence for sales team follow-up.
 *
 * Key metrics:
 * - Engagement score (0-100)
 * - Scenario participation
 * - Tour completion rates
 * - Time-to-conversion
 * - Intent signals
 */
@Injectable()
export class DemoAnalyticsService {
  private readonly logger = new Logger('Demo/AnalyticsService');

  constructor(private prisma: PrismaService) {}

  /**
   * Get engagement funnel for demo environment
   */
  async getEngagementFunnel(demoEnvironmentId: string) {
    const sessions = await this.prisma.demoSession.findMany({
      where: { demoEnvironmentId },
    });

    if (sessions.length === 0) {
      return {
        demoEnvironmentId,
        totalVisitors: 0,
        engagementLevels: {
          inactive: 0,
          viewing: 0,
          exploring: 0,
          engaged: 0,
          highly_engaged: 0,
        },
        avgEngagementScore: 0,
      };
    }

    const engagementBreakdown = sessions.reduce(
      (acc, session) => {
        const score = session.engagementScore || 0;
        if (score === 0) acc.inactive++;
        else if (score < 25) acc.viewing++;
        else if (score < 50) acc.exploring++;
        else if (score < 75) acc.engaged++;
        else acc.highly_engaged++;
        return acc;
      },
      { inactive: 0, viewing: 0, exploring: 0, engaged: 0, highly_engaged: 0 },
    );

    const avgEngagement =
      sessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) /
      sessions.length;

    return {
      demoEnvironmentId,
      totalVisitors: sessions.length,
      engagementLevels: engagementBreakdown,
      avgEngagementScore: Math.round(avgEngagement * 100) / 100,
      conversionReadyCount: sessions.filter((s) => (s.engagementScore || 0) >= 75).length,
    };
  }

  /**
   * Get conversion funnel: demo → demo-to-live promotion
   */
  async getConversionFunnel(demoEnvironmentId: string) {
    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { id: demoEnvironmentId },
    });

    const sessions = await this.prisma.demoSession.findMany({
      where: { demoEnvironmentId },
    });

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: demoEnv?.tenantId },
    });

    return {
      demoEnvironmentId,
      totalSessions: sessions.length,
      avgSessionDuration: sessions.length
        ? Math.round(
            sessions.reduce((sum, s) => {
              const startTime = s.startedAt?.getTime() || 0;
              const endTime = s.completedAt?.getTime() || startTime + 60000;
              return sum + (endTime - startTime);
            }, 0) / sessions.length,
          )
        : 0,
      scenariosExecuted: sessions.reduce((sum, s) => sum + (s.stepsCompleted || 0), 0),
      toursStarted: sessions.filter((s) => s.stepsCompleted > 0).length,
      toursCompleted: sessions.filter((s) => s.status === 'COMPLETED').length,
      conversionReady: sessions.filter((s) => (s.engagementScore || 0) >= 75),
      converted: tenant?.demoMode === false ? 1 : 0,
      conversionRate:
        sessions.length > 0
          ? ((tenant?.demoMode === false ? 1 : 0) / sessions.length) * 100
          : 0,
    };
  }

  /**
   * Get detailed analytics for sales team
   */
  async getSalesIntelligence(demoEnvironmentId: string) {
    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { id: demoEnvironmentId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!demoEnv) {
      return null;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: demoEnv.tenantId },
    });

    // Calculate quality signals
    const highEngagementSessions = demoEnv.sessions.filter(
      (s) => (s.engagementScore || 0) >= 75,
    );

    const tourCompletedSessions = demoEnv.sessions.filter(
      (s) => s.status === 'COMPLETED' && s.stepsCompleted >= 5,
    );

    const multipleScenarioSessions = demoEnv.sessions.filter(
      (s) => s.stepsCompleted >= 3,
    );

    // Engagement progression
    const engagementTrend = demoEnv.sessions
      .slice()
      .reverse()
      .slice(0, 10)
      .map((s) => ({
        date: s.createdAt,
        engagementScore: s.engagementScore || 0,
        actions: s.actionsPerformed?.length || 0,
      }));

    return {
      demoEnvironmentId,
      businessName: demoEnv.businessName,
      industry: demoEnv.industry,

      // Overall health
      totalVisitors: demoEnv.sessions.length,
      avgEngagement: Math.round(
        (demoEnv.sessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) /
          demoEnv.sessions.length) *
          100,
      ) / 100,

      // Quality signals
      qualitySignals: {
        highEngagement: highEngagementSessions.length,
        toursCompleted: tourCompletedSessions.length,
        multipleScenarios: multipleScenarioSessions.length,
        converted: tenant?.demoMode === false ? 1 : 0,
      },

      // Conversion readiness
      readyToConvert: {
        count: highEngagementSessions.length,
        percentage: Math.round(
          (highEngagementSessions.length / Math.max(demoEnv.sessions.length, 1)) *
            100,
        ),
        topContacts: highEngagementSessions.slice(0, 5).map((s) => ({
          email: s.visitorEmail || 'unknown',
          engagementScore: s.engagementScore,
          completedAt: s.completedAt,
          actionsPerformed: s.actionsPerformed,
        })),
      },

      // Sales insights
      salesInsights: {
        bestPerformer: demoEnv.sessions.sort(
          (a, b) => (b.engagementScore || 0) - (a.engagementScore || 0),
        )[0],
        avgTimeToEngagement: Math.round(
          demoEnv.sessions
            .filter((s) => (s.engagementScore || 0) > 0)
            .reduce((sum, s) => {
              const start = s.startedAt?.getTime() || 0;
              const firstAction = s.createdAt?.getTime() || start;
              return sum + Math.max(0, firstAction - start);
            }, 0) / Math.max(demoEnv.sessions.filter((s) => (s.engagementScore || 0) > 0).length, 1),
        ),
        conversionRate: tenant?.demoMode === false ? 100 : 0,
        nextAction: highEngagementSessions.length > 0 ? 'Send sales email' : 'Follow up on engagement',
      },

      // Trend
      engagementTrend,

      // Status
      currentStatus: tenant?.demoMode ? 'DEMO_ACTIVE' : 'CONVERTED',
    };
  }

  /**
   * Track visitor action for engagement scoring
   */
  async recordAction(
    demoSessionId: string,
    action: string,
  ): Promise<{ engagementScore: number }> {
    const session = await this.prisma.demoSession.findUnique({
      where: { id: demoSessionId },
    });

    if (!session) {
      throw new Error(`Session not found: ${demoSessionId}`);
    }

    // Action weights
    const actionWeights: Record<string, number> = {
      tour_started: 10,
      tour_completed: 30,
      scenario_executed: 20,
      feature_explored: 5,
      form_submitted: 25,
      schedule_demo: 50,
    };

    const weight = actionWeights[action] || 5;

    // Calculate new engagement
    const currentActions = session.actionsPerformed || [];
    const newActions = [...currentActions, action];
    const newEngagement = Math.min(100, (session.engagementScore || 0) + weight);

    // Update session
    const updated = await this.prisma.demoSession.update({
      where: { id: demoSessionId },
      data: {
        engagementScore: newEngagement,
        actionsPerformed: newActions,
      },
    });

    this.logger.log(
      `Action recorded: ${action} → engagement ${newEngagement} (session: ${demoSessionId})`,
    );

    return {
      engagementScore: updated.engagementScore || 0,
    };
  }

  /**
   * Export analytics for external sales tools (Salesforce, HubSpot, etc)
   */
  async exportForSalesTools(demoEnvironmentId: string) {
    const intelligence = await this.getSalesIntelligence(demoEnvironmentId);

    if (!intelligence) {
      return null;
    }

    return {
      // CRM-compatible format
      opportunity: {
        name: `${intelligence.businessName} - WISE² Demo (${intelligence.industry})`,
        stage: intelligence.qualitySignals.converted > 0 ? 'Closed Won' : 'Demo Completed',
        engagementScore: intelligence.qualitySignals.highEngagement,
        estimatedValue: intelligence.qualitySignals.highEngagement > 0 ? '$5,000+' : null,
      },
      contacts: intelligence.readyToConvert.topContacts.map((contact) => ({
        email: contact.email,
        engagementScore: contact.engagementScore,
        demographics: {
          industry: intelligence.industry,
          businessSize: 'Unknown', // Would come from qualification flow
        },
      })),
      summary: `${intelligence.totalVisitors} visitors, ${intelligence.qualitySignals.highEngagement} high-engagement, ready for sales ${intelligence.readyToConvert.percentage}%`,
    };
  }
}
