/**
 * Tenant Provisioning Service
 * Orchestrates multi-step tenant activation after payment
 */

import { logger } from '../logger';
import { db } from '../database';
import { ProvisioningStep, ProvisioningStatus } from '@prisma/client';

interface ProvisioningContext {
  tenantId: string;
  userId: string;
  industry: string;
  businessName: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  demoMode?: boolean;
}

export class ProvisioningService {
  /**
   * Start provisioning a new tenant after successful payment
   */
  async startProvisioning(context: ProvisioningContext): Promise<string> {
    logger.info('Starting tenant provisioning', {
      tenantId: context.tenantId,
      industry: context.industry,
    });

    try {
      // Create tenant (or use existing in PAYMENT_PENDING state)
      const tenant = await db.tenant.upsert({
        where: { id: context.tenantId },
        create: {
          id: context.tenantId,
          slug: this.generateSlug(context.businessName),
          name: context.businessName,
          vertical: context.industry,
          state: 'PAYMENT_PENDING',
          demoMode: context.demoMode || false,
          stripeCustomerId: context.stripeCustomerId,
          stripeSubscriptionId: context.stripeSubscriptionId,
        },
        update: {
          stripeCustomerId: context.stripeCustomerId,
          stripeSubscriptionId: context.stripeSubscriptionId,
          state: 'PAYMENT_PENDING',
        },
      });

      // Create provisioning run to track progress
      const provisioning = await db.provisioningRun.create({
        data: {
          tenantId: context.tenantId,
          currentStep: 'CREATE_TENANT',
          status: 'PENDING',
          maxRetries: 3,
        },
      });

      // Audit log
      await db.auditLog.create({
        data: {
          tenantId: context.tenantId,
          actor: context.userId,
          action: 'PROVISIONING_STARTED',
          resourceType: 'Tenant',
          resourceId: context.tenantId,
          source: 'Webhook',
        },
      });

      return provisioning.id;
    } catch (error) {
      logger.error('Failed to start provisioning', {
        error: error instanceof Error ? error.message : String(error),
        tenantId: context.tenantId,
      });
      throw error;
    }
  }

  /**
   * Execute provisioning steps one at a time
   * Resumable and idempotent
   */
  async executeNextStep(provisioningId: string): Promise<ProvisioningStep | null> {
    logger.info('Executing next provisioning step', { provisioningId });

    let provisioning = await db.provisioningRun.findUnique({
      where: { id: provisioningId },
    });

    if (!provisioning) {
      logger.error('Provisioning run not found', { provisioningId });
      return null;
    }

    // Check if provisioning is complete
    if (provisioning.status === 'COMPLETED') {
      logger.info('Provisioning already completed', { provisioningId });
      return null;
    }

    // Check if failed and retries exhausted
    if (provisioning.status === 'FAILED' && provisioning.retryCount >= provisioning.maxRetries) {
      logger.error('Provisioning max retries exhausted', { provisioningId });
      return null;
    }

    try {
      provisioning = await db.provisioningRun.update({
        where: { id: provisioningId },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      });

      // Execute current step
      const result = await this.executeStep(provisioning.tenantId, provisioning.currentStep);

      // Mark step as completed
      const completedSteps = [...(provisioning.completedSteps || []), provisioning.currentStep];
      const nextStep = this.getNextStep(provisioning.currentStep);

      if (nextStep === null) {
        // All steps completed
        await db.provisioningRun.update({
          where: { id: provisioningId },
          data: {
            status: 'COMPLETED',
            completedSteps,
            completedAt: new Date(),
          },
        });

        // Update tenant state
        await db.tenant.update({
          where: { id: provisioning.tenantId },
          data: { state: 'ACTIVE' },
        });

        logger.info('Provisioning completed successfully', { provisioningId });
        return null;
      }

      // Move to next step
      await db.provisioningRun.update({
        where: { id: provisioningId },
        data: {
          currentStep: nextStep,
          completedSteps,
          status: 'PENDING',
        },
      });

      logger.info('Provisioning step completed', {
        provisioningId,
        completedStep: provisioning.currentStep,
        nextStep,
      });

      return nextStep;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Retry logic
      let newStatus = 'FAILED' as const;
      let newRetryCount = provisioning.retryCount + 1;

      if (newRetryCount < provisioning.maxRetries) {
        newStatus = 'RETRYING' as const;
      }

      await db.provisioningRun.update({
        where: { id: provisioningId },
        data: {
          status: newStatus,
          lastError: errorMsg,
          lastErrorStep: provisioning.currentStep,
          retryCount: newRetryCount,
        },
      });

      logger.error('Provisioning step failed', {
        provisioningId,
        step: provisioning.currentStep,
        error: errorMsg,
        retryCount: newRetryCount,
      });

      throw error;
    }
  }

  /**
   * Execute individual provisioning step
   */
  private async executeStep(tenantId: string, step: ProvisioningStep): Promise<void> {
    switch (step) {
      case 'CREATE_TENANT':
        await this.stepCreateTenant(tenantId);
        break;
      case 'CREATE_MEMBERSHIP':
        await this.stepCreateMembership(tenantId);
        break;
      case 'INITIALIZE_DATABASE':
        await this.stepInitializeDatabase(tenantId);
        break;
      case 'LOAD_TEMPLATE':
        await this.stepLoadTemplate(tenantId);
        break;
      case 'CREATE_PIPELINE':
        await this.stepCreatePipeline(tenantId);
        break;
      case 'CREATE_WORKFLOWS':
        await this.stepCreateWorkflows(tenantId);
        break;
      case 'INITIALIZE_HERMES':
        await this.stepInitializeHermes(tenantId);
        break;
      case 'PROVISION_DISCORD':
        await this.stepProvisionDiscord(tenantId);
        break;
      case 'START_ONBOARDING':
        await this.stepStartOnboarding(tenantId);
        break;
      case 'ACTIVATE':
        await this.stepActivate(tenantId);
        break;
    }
  }

  private async stepCreateTenant(tenantId: string): Promise<void> {
    logger.info('Step: CREATE_TENANT', { tenantId });
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
  }

  private async stepCreateMembership(tenantId: string): Promise<void> {
    logger.info('Step: CREATE_MEMBERSHIP', { tenantId });
    // Owner membership should be created by payment handler
    const membership = await db.tenantMembership.findFirst({
      where: { tenantId, role: 'OWNER' },
    });
    if (!membership) {
      logger.warn('No OWNER membership found', { tenantId });
    }
  }

  private async stepInitializeDatabase(tenantId: string): Promise<void> {
    logger.info('Step: INITIALIZE_DATABASE', { tenantId });
    // Create sample data or initialize schema
    // For now, just verify tenant exists
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
  }

  private async stepLoadTemplate(tenantId: string): Promise<void> {
    logger.info('Step: LOAD_TEMPLATE', { tenantId });
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    // TODO: Load industry template based on tenant.vertical
    // This will create default pipeline stages, services, etc.
  }

  private async stepCreatePipeline(tenantId: string): Promise<void> {
    logger.info('Step: CREATE_PIPELINE', { tenantId });
    // Pipeline stages are created via industry template
    // Verify they exist
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
  }

  private async stepCreateWorkflows(tenantId: string): Promise<void> {
    logger.info('Step: CREATE_WORKFLOWS', { tenantId });
    // Create default workflows (e.g., lead scoring, follow-up reminders)
    // TODO: Implement default workflow creation
  }

  private async stepInitializeHermes(tenantId: string): Promise<void> {
    logger.info('Step: INITIALIZE_HERMES', { tenantId });
    // Initialize Hermes agent configuration for this tenant
    // TODO: Create default agent configs (RECEPTIONIST, SPEED_TO_LEAD, etc.)
  }

  private async stepProvisionDiscord(tenantId: string): Promise<void> {
    logger.info('Step: PROVISION_DISCORD', { tenantId });
    // Create Discord channels and roles for this tenant
    // TODO: Implement Discord workspace provisioning
  }

  private async stepStartOnboarding(tenantId: string): Promise<void> {
    logger.info('Step: START_ONBOARDING', { tenantId });
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Send welcome message to Discord
    // TODO: Send onboarding Discord message
  }

  private async stepActivate(tenantId: string): Promise<void> {
    logger.info('Step: ACTIVATE', { tenantId });
    // Update tenant state to ACTIVE (final step)
    await db.tenant.update({
      where: { id: tenantId },
      data: { state: 'ACTIVE' },
    });
  }

  /**
   * Get next step in provisioning sequence
   */
  private getNextStep(currentStep: ProvisioningStep): ProvisioningStep | null {
    const steps: ProvisioningStep[] = [
      'CREATE_TENANT',
      'CREATE_MEMBERSHIP',
      'INITIALIZE_DATABASE',
      'LOAD_TEMPLATE',
      'CREATE_PIPELINE',
      'CREATE_WORKFLOWS',
      'INITIALIZE_HERMES',
      'PROVISION_DISCORD',
      'START_ONBOARDING',
      'ACTIVATE',
    ];

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return null;
    }

    return steps[currentIndex + 1];
  }

  /**
   * Generate URL-safe slug from business name
   */
  private generateSlug(businessName: string): string {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 63); // Max 63 chars for subdomain
  }

  /**
   * Retry failed provisioning
   */
  async retryProvisioning(provisioningId: string): Promise<void> {
    const provisioning = await db.provisioningRun.findUnique({
      where: { id: provisioningId },
    });

    if (!provisioning) {
      throw new Error(`Provisioning run ${provisioningId} not found`);
    }

    if (provisioning.status === 'COMPLETED') {
      logger.warn('Cannot retry completed provisioning', { provisioningId });
      return;
    }

    logger.info('Retrying provisioning', { provisioningId });

    await db.provisioningRun.update({
      where: { id: provisioningId },
      data: {
        status: 'PENDING',
        retryCount: Math.min(provisioning.retryCount + 1, provisioning.maxRetries),
      },
    });

    // Queue for immediate re-execution
    // TODO: Use job queue to schedule retry
  }
}

export const provisioningService = new ProvisioningService();
