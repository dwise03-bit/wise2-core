import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DemoEvent } from '@prisma/client';

/**
 * DemoEventService
 *
 * Records and manages demo events in the event log.
 * All demo interactions are captured for analysis and replay.
 *
 * Event types: lead.created, estimate.sent, payment.simulated, etc
 */
@Injectable()
export class DemoEventService {
  private readonly logger = new Logger('Demo/EventService');

  constructor(private prisma: PrismaService) {}

  /**
   * Record a demo event
   */
  async recordEvent(input: {
    demoSessionId: string;
    demoEnvironmentId: string;
    scenarioId?: string;
    eventType: string;
    category: string;
    action: string;
    dataSnapshot?: Record<string, unknown>;
    affectedRecords?: string[];
    success?: boolean;
    message?: string;
    userInitiated?: boolean;
  }): Promise<DemoEvent> {
    const event = await this.prisma.demoEvent.create({
      data: {
        demoSessionId: input.demoSessionId,
        demoEnvironmentId: input.demoEnvironmentId,
        scenarioId: input.scenarioId,
        eventType: input.eventType,
        category: input.category,
        action: input.action,
        dataSnapshot: input.dataSnapshot ? JSON.parse(JSON.stringify(input.dataSnapshot)) : {},
        affectedRecords: input.affectedRecords || [],
        success: input.success ?? true,
        message: input.message,
        userInitiated: input.userInitiated ?? false,
      },
    });

    this.logger.debug(`Recorded event: ${input.eventType} for session ${input.demoSessionId}`);
    return event;
  }

  /**
   * Record sequence of events (for scenario automation)
   */
  async recordEventSequence(
    demoSessionId: string,
    demoEnvironmentId: string,
    scenarioId: string,
    events: Array<{
      eventType: string;
      category: string;
      action: string;
      dataSnapshot?: Record<string, unknown>;
      affectedRecords?: string[];
      delay?: number; // milliseconds to wait before this event
    }>,
  ): Promise<DemoEvent[]> {
    this.logger.log(
      `Recording ${events.length} events for scenario ${scenarioId}`,
    );

    const createdEvents: DemoEvent[] = [];

    for (const eventConfig of events) {
      // Wait if delay specified (for sequential automation)
      if (eventConfig.delay && eventConfig.delay > 0) {
        await this.sleep(eventConfig.delay);
      }

      const event = await this.recordEvent({
        demoSessionId,
        demoEnvironmentId,
        scenarioId,
        eventType: eventConfig.eventType,
        category: eventConfig.category,
        action: eventConfig.action,
        dataSnapshot: eventConfig.dataSnapshot,
        affectedRecords: eventConfig.affectedRecords,
        userInitiated: false, // Scenario events are system-triggered
      });

      createdEvents.push(event);
    }

    this.logger.log(`Recorded ${createdEvents.length} events`);
    return createdEvents;
  }

  /**
   * Get events for a session
   */
  async getSessionEvents(
    demoSessionId: string,
    options?: {
      eventType?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<DemoEvent[]> {
    return this.prisma.demoEvent.findMany({
      where: {
        demoSessionId,
        eventType: options?.eventType,
      },
      take: options?.limit || 100,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get events for a scenario
   */
  async getScenarioEvents(
    demoEnvironmentId: string,
    scenarioId: string,
    options?: {
      limit?: number;
    },
  ): Promise<DemoEvent[]> {
    return this.prisma.demoEvent.findMany({
      where: {
        demoEnvironmentId,
        scenarioId,
      },
      take: options?.limit || 1000,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get event statistics for a demo environment
   */
  async getEventStats(demoEnvironmentId: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByCategory: Record<string, number>;
    successCount: number;
    failureCount: number;
  }> {
    const events = await this.prisma.demoEvent.findMany({
      where: { demoEnvironmentId },
    });

    const eventsByType: Record<string, number> = {};
    const eventsByCategory: Record<string, number> = {};
    let successCount = 0;
    let failureCount = 0;

    for (const event of events) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
      if (event.success) successCount++;
      else failureCount++;
    }

    return {
      totalEvents: events.length,
      eventsByType,
      eventsByCategory,
      successCount,
      failureCount,
    };
  }

  /**
   * Helper: Sleep for delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
