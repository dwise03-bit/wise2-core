import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DemoScenario } from '@prisma/client';
import { getScenariosForIndustry } from '../constants/scenarios';

/**
 * DemoScenarioService
 *
 * Manages demo scenarios (NEW_LEAD, MISSED_CALL, etc).
 * Scenarios are predefined business workflows that show WISE² capabilities.
 */
@Injectable()
export class DemoScenarioService {
  private readonly logger = new Logger('Demo/ScenarioService');

  constructor(private prisma: PrismaService) {}

  /**
   * Get scenario by ID
   */
  async getScenario(scenarioId: string): Promise<DemoScenario | null> {
    return this.prisma.demoScenario.findUnique({
      where: { id: scenarioId },
    });
  }

  /**
   * List scenarios for a demo environment
   */
  async listScenarios(
    demoEnvironmentId: string,
    options?: {
      enabled?: boolean;
    },
  ): Promise<DemoScenario[]> {
    return this.prisma.demoScenario.findMany({
      where: {
        demoEnvironmentId,
        enabled: options?.enabled ?? true,
      },
      orderBy: { sequenceNumber: 'asc' },
    });
  }

  /**
   * Get scenario by key
   */
  async getScenarioByKey(
    demoEnvironmentId: string,
    key: string,
  ): Promise<DemoScenario | null> {
    return this.prisma.demoScenario.findUnique({
      where: {
        demoEnvironmentId_key: {
          demoEnvironmentId,
          key,
        },
      },
    });
  }

  /**
   * Execute a scenario (generate events)
   * This will be implemented fully in Phase 4
   */
  async executeScenario(
    demoSessionId: string,
    scenarioId: string,
  ): Promise<void> {
    this.logger.log(
      `Executing scenario ${scenarioId} for session ${demoSessionId}`,
    );

    // Implementation details will go here
    // - Generate demo events
    // - Create demo records
    // - Trigger automations
    // - Record engagement
  }

  /**
   * Get scenarios for industry
   */
  getAvailableScenariosForIndustry(
    industry: string,
  ): Array<{
    key: string;
    name: string;
    description: string;
  }> {
    const scenarios = getScenariosForIndustry(industry);
    return scenarios.map((s) => ({
      key: s.key,
      name: s.name,
      description: s.description,
    }));
  }
}
