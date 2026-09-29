import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DemoSession,
  DemoExperienceMode,
  DemoSessionStatus,
} from '@prisma/client';
import { randomUUID } from 'crypto';

interface CreateDemoSessionInput {
  demoEnvironmentId: string;
  scenarioId?: string;
  prospectEmail?: string;
  prospectName?: string;
  source?: string;
  campaign?: string;
  salespersonId?: string;
}

/**
 * DemoSessionService
 *
 * Manages demo visitor sessions.
 * One session per demo URL visit or sharing.
 * Tracks engagement, actions, and conversion signals.
 */
@Injectable()
export class DemoSessionService {
  private readonly logger = new Logger('Demo/SessionService');

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new demo session
   */
  async createSession(
    input: CreateDemoSessionInput,
  ): Promise<DemoSession> {
    const sessionToken = this.generateSessionToken();

    const session = await this.prisma.demoSession.create({
      data: {
        demoEnvironmentId: input.demoEnvironmentId,
        scenarioId: input.scenarioId,
        prospectEmail: input.prospectEmail,
        prospectName: input.prospectName,
        sessionToken,
        source: input.source || 'direct',
        campaign: input.campaign,
        salespersonId: input.salespersonId,
        status: DemoSessionStatus.ACTIVE,
        selectedMode: DemoExperienceMode.ENTRY,
      },
    });

    this.logger.log(`Created demo session ${session.id}`);
    return session;
  }

  /**
   * Get session by token (secure lookup)
   */
  async getSessionByToken(
    sessionToken: string,
  ): Promise<DemoSession | null> {
    return this.prisma.demoSession.findUnique({
      where: { sessionToken },
    });
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<DemoSession | null> {
    return this.prisma.demoSession.findUnique({
      where: { id: sessionId },
    });
  }

  /**
   * Update session mode (what the visitor is viewing)
   */
  async setMode(
    sessionId: string,
    mode: DemoExperienceMode,
  ): Promise<DemoSession> {
    return this.prisma.demoSession.update({
      where: { id: sessionId },
      data: {
        selectedMode: mode,
        lastActivityAt: new Date(),
      },
    });
  }

  /**
   * Record user action in session
   */
  async recordAction(sessionId: string, action: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const actions = session.actionsPerformed || [];
    actions.push(action);

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(
      100,
      Math.max(0, 10 + actions.length * 5), // Base 10 + 5 per action
    );

    await this.prisma.demoSession.update({
      where: { id: sessionId },
      data: {
        actionsPerformed: actions,
        engagementScore,
        lastActivityAt: new Date(),
        stepsCompleted: actions.length,
      },
    });
  }

  /**
   * Mark session as showing conversion intent
   * (user clicked "Activate WISE²" or similar CTA)
   */
  async markConversionIntent(sessionId: string): Promise<void> {
    await this.prisma.demoSession.update({
      where: { id: sessionId },
      data: {
        conversionIntent: true,
        conversionIntentAt: new Date(),
      },
    });
  }

  /**
   * Complete a session
   */
  async completeSession(sessionId: string): Promise<DemoSession> {
    return this.prisma.demoSession.update({
      where: { id: sessionId },
      data: {
        status: DemoSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  /**
   * List sessions for a demo environment
   */
  async listSessions(
    demoEnvironmentId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: DemoSessionStatus;
    },
  ): Promise<DemoSession[]> {
    return this.prisma.demoSession.findMany({
      where: {
        demoEnvironmentId,
        status: options?.status,
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get session analytics for demo environment
   */
  async getSessionAnalytics(demoEnvironmentId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    avgEngagementScore: number;
    conversionIntentCount: number;
  }> {
    const sessions = await this.prisma.demoSession.findMany({
      where: { demoEnvironmentId },
    });

    const activeSessions = sessions.filter(
      (s) => s.status === DemoSessionStatus.ACTIVE,
    ).length;

    const completedSessions = sessions.filter(
      (s) => s.status === DemoSessionStatus.COMPLETED,
    ).length;

    const avgEngagementScore =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.engagementScore, 0) /
          sessions.length
        : 0;

    const conversionIntentCount = sessions.filter(
      (s) => s.conversionIntent,
    ).length;

    return {
      totalSessions: sessions.length,
      activeSessions,
      completedSessions,
      avgEngagementScore: Math.round(avgEngagementScore * 100) / 100,
      conversionIntentCount,
    };
  }

  /**
   * Clean up expired sessions
   * Call periodically (e.g., via cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.demoSession.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    this.logger.log(
      `Cleaned up ${result.count} expired demo sessions`,
    );
    return result.count;
  }

  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    return `demo_${randomUUID().replace(/-/g, '').substring(0, 24)}`;
  }
}
