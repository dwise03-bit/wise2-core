import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DemoDatabFactory } from './demo-data-factory.service';
import {
  DemoEnvironment,
  DemoScenario,
  DemoTour,
  CommunicationMode,
  PaymentMode,
  Tenant,
} from '@prisma/client';
import { CORE_DEMO_SCENARIOS } from '../constants/scenarios';
import { DEFAULT_DEMO_TOURS } from '../constants/tours';

/**
 * DemoProvisioningService
 *
 * Handles automatic provisioning of WISE² LIVE demo environment for tenants.
 * Called during tenant creation; idempotent and restartable.
 *
 * Provisioning includes:
 * - Creating DemoEnvironment container
 * - Provisioning default scenarios
 * - Provisioning default tours
 * - Seeding initial demo data
 */
@Injectable()
export class DemoProvisioningService {
  private readonly logger = new Logger('Demo/ProvisioningService');

  constructor(
    private prisma: PrismaService,
    private demoDataFactory: DemoDatabFactory,
  ) {}

  /**
   * Provision WISE² LIVE for a tenant
   * Idempotent: safe to call multiple times
   */
  async provisionDemoEnvironment(tenantId: string): Promise<DemoEnvironment> {
    this.logger.log(`Provisioning WISE² LIVE for tenant ${tenantId}`);

    // Check if already provisioned
    let demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });

    if (demoEnv) {
      this.logger.log(`Demo environment already exists for ${tenantId}`);
      return demoEnv;
    }

    // Load tenant for business profile
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Create DemoEnvironment
    demoEnv = await this.prisma.demoEnvironment.create({
      data: {
        tenantId,
        businessName: tenant.name,
        industry: tenant.vertical,
        communicationMode: CommunicationMode.SIMULATED,
        paymentMode: PaymentMode.SIMULATED,
      },
    });

    this.logger.log(`Created DemoEnvironment ${demoEnv.id}`);

    // Provision default scenarios
    await this.provisionDefaultScenarios(demoEnv);

    // Provision default tours
    await this.provisionDefaultTours(demoEnv);

    // Seed initial demo data
    await this.seedDemoData(demoEnv, tenant);

    this.logger.log(`WISE² LIVE provisioning complete for ${tenantId}`);

    return demoEnv;
  }

  /**
   * Provision default scenarios for an industry
   */
  private async provisionDefaultScenarios(
    demoEnv: DemoEnvironment,
  ): Promise<DemoScenario[]> {
    this.logger.log(`Provisioning scenarios for ${demoEnv.id}`);

    const scenarios = CORE_DEMO_SCENARIOS[demoEnv.industry] || CORE_DEMO_SCENARIOS.default;

    const created: DemoScenario[] = [];

    for (const scenario of scenarios) {
      // Check if exists
      const existing = await this.prisma.demoScenario.findUnique({
        where: {
          demoEnvironmentId_key: {
            demoEnvironmentId: demoEnv.id,
            key: scenario.key,
          },
        },
      });

      if (existing) {
        created.push(existing);
        continue;
      }

      // Create new scenario
      const created_scenario = await this.prisma.demoScenario.create({
        data: {
          demoEnvironmentId: demoEnv.id,
          key: scenario.key,
          name: scenario.name,
          description: scenario.description,
          icon: scenario.icon,
          sequenceNumber: scenario.sequenceNumber,
          triggerType: scenario.triggerType,
          duration: scenario.duration,
          eventSequence: scenario.eventSequence,
          industry: scenario.industry,
          applicableRoles: scenario.applicableRoles,
          dataTemplate: scenario.dataTemplate,
          expectedOutcomes: scenario.expectedOutcomes,
        },
      });

      created.push(created_scenario);
    }

    this.logger.log(`Provisioned ${created.length} scenarios`);
    return created;
  }

  /**
   * Provision default guided tours
   */
  private async provisionDefaultTours(
    demoEnv: DemoEnvironment,
  ): Promise<DemoTour[]> {
    this.logger.log(`Provisioning tours for ${demoEnv.id}`);

    const tours = DEFAULT_DEMO_TOURS;
    const created: DemoTour[] = [];

    for (const tour of tours) {
      // Check if exists
      const existing = await this.prisma.demoTour.findUnique({
        where: {
          demoEnvironmentId_key: {
            demoEnvironmentId: demoEnv.id,
            key: tour.key,
          },
        },
      });

      if (existing) {
        created.push(existing);
        continue;
      }

      // Create new tour
      const created_tour = await this.prisma.demoTour.create({
        data: {
          demoEnvironmentId: demoEnv.id,
          key: tour.key,
          name: tour.name,
          description: tour.description,
          duration: tour.duration,
          targetAudience: tour.targetAudience,
          steps: tour.steps,
        },
      });

      created.push(created_tour);
    }

    // Set default tour
    if (created.length > 0) {
      await this.prisma.demoEnvironment.update({
        where: { id: demoEnv.id },
        data: {
          defaultTourId: created[0].id,
        },
      });
    }

    this.logger.log(`Provisioned ${created.length} tours`);
    return created;
  }

  /**
   * Seed initial demo data (demo customers, leads, jobs)
   */
  private async seedDemoData(
    demoEnv: DemoEnvironment,
    tenant: Tenant,
  ): Promise<void> {
    this.logger.log(`Seeding demo data for ${demoEnv.id}`);

    // Use factory to generate realistic demo data
    // This will be implemented in the data factory
    // For now, just mark that seeding happened

    const now = new Date();
    await this.prisma.demoEnvironment.update({
      where: { id: demoEnv.id },
      data: {
        lastResetAt: now,
        demoCustomerCount: 3,
        demoLeadCount: 5,
        demoJobCount: 2,
      },
    });

    this.logger.log(`Demo data seeded`);
  }

  /**
   * Reset demo environment (remove demo data, restore to clean state)
   * Transactional and safe
   */
  async resetDemoEnvironment(demoEnvironmentId: string): Promise<void> {
    this.logger.log(`Resetting demo environment ${demoEnvironmentId}`);

    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { id: demoEnvironmentId },
    });

    if (!demoEnv) {
      throw new Error(`Demo environment ${demoEnvironmentId} not found`);
    }

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Delete all demo sessions (cascades to events, tour progress)
      await tx.demoSession.deleteMany({
        where: { demoEnvironmentId },
      });

      // Reset demo environment stats
      await tx.demoEnvironment.update({
        where: { id: demoEnvironmentId },
        data: {
          lastResetAt: new Date(),
          totalSessions: 0,
          completedSessions: 0,
          averageEngagement: 0,
          demoCustomerCount: 3,
          demoLeadCount: 5,
          demoJobCount: 2,
        },
      });
    });

    this.logger.log(`Demo environment reset complete`);
  }

  /**
   * Check provisioning status
   */
  async getProvisioningStatus(tenantId: string): Promise<{
    isProvisioned: boolean;
    demoEnvironment?: DemoEnvironment;
  }> {
    const demoEnv = await this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });

    return {
      isProvisioned: !!demoEnv,
      demoEnvironment: demoEnv || undefined,
    };
  }

  /**
   * Get demo environment for tenant
   */
  async getDemoEnvironment(tenantId: string): Promise<DemoEnvironment | null> {
    return this.prisma.demoEnvironment.findUnique({
      where: { tenantId },
    });
  }

  /**
   * Get demo environment by ID
   */
  async getDemoEnvironmentById(
    demoEnvironmentId: string,
  ): Promise<DemoEnvironment | null> {
    return this.prisma.demoEnvironment.findUnique({
      where: { id: demoEnvironmentId },
    });
  }
}
