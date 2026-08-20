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

interface ProvisioningMetadata {
  userId: string;
  businessName: string;
  industry: string;
  stripeCustomerId: string;
}

export class ProvisioningService {
  /**
   * Start provisioning a new tenant after successful payment
   */
  async startProvisioning(context: ProvisioningContext): Promise<string> {
    logger.info('Starting tenant provisioning', {
      tenantId: context.tenantId,
      industry: context.industry,
      userId: context.userId,
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

      // Create OWNER membership immediately (idempotent)
      await db.tenantMembership.upsert({
        where: {
          tenantId_userId: {
            tenantId: context.tenantId,
            userId: context.userId,
          },
        },
        create: {
          tenantId: context.tenantId,
          userId: context.userId,
          role: 'OWNER',
        },
        update: {
          role: 'OWNER', // Ensure it's OWNER if already exists
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

    // Verify OWNER membership exists (created during startProvisioning)
    const ownerMembership = await db.tenantMembership.findFirst({
      where: { tenantId, role: 'OWNER' },
    });

    if (!ownerMembership) {
      throw new Error(`No OWNER membership found for tenant ${tenantId}. Call startProvisioning first.`);
    }

    logger.info('OWNER membership verified', { tenantId, userId: ownerMembership.userId });
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

    // Load industry-specific template based on tenant.vertical
    const templateData = this.getIndustryTemplate(tenant.vertical);

    logger.info('Loading industry template', {
      tenantId,
      industry: tenant.vertical,
      services: templateData.services.length,
    });

    // Create service catalog items for this tenant
    for (const service of templateData.services) {
      await db.serviceCatalogItem.upsert({
        where: {
          tenantId_name: {
            tenantId,
            name: service.name,
          },
        },
        create: {
          tenantId,
          name: service.name,
          description: service.description,
          basePrice: service.basePrice,
          category: service.category,
        },
        update: {
          description: service.description,
          basePrice: service.basePrice,
        },
      });
    }

    logger.info('Industry template loaded', { tenantId, serviceCount: templateData.services.length });
  }

  /**
   * Get industry template data based on vertical
   */
  private getIndustryTemplate(industry: string): any {
    const templates: Record<string, any> = {
      hvac: {
        services: [
          {
            name: 'Maintenance',
            description: 'Regular HVAC system maintenance',
            basePrice: 150,
            category: 'maintenance',
          },
          {
            name: 'Repair',
            description: 'HVAC system repair',
            basePrice: 200,
            category: 'repair',
          },
          {
            name: 'Installation',
            description: 'New HVAC system installation',
            basePrice: 3000,
            category: 'installation',
          },
          {
            name: 'Replacement',
            description: 'Full HVAC system replacement',
            basePrice: 5000,
            category: 'replacement',
          },
        ],
      },
      pressure_washing: {
        services: [
          {
            name: 'Residential Washing',
            description: 'House exterior and deck cleaning',
            basePrice: 300,
            category: 'residential',
          },
          {
            name: 'Commercial Washing',
            description: 'Commercial building cleaning',
            basePrice: 500,
            category: 'commercial',
          },
          {
            name: 'Driveway Cleaning',
            description: 'Driveway and parking lot pressure washing',
            basePrice: 250,
            category: 'driveway',
          },
          {
            name: 'Roof Cleaning',
            description: 'Roof and gutter cleaning',
            basePrice: 400,
            category: 'roof',
          },
        ],
      },
      plumbing: {
        services: [
          {
            name: 'Inspection',
            description: 'Plumbing system inspection',
            basePrice: 100,
            category: 'inspection',
          },
          {
            name: 'Repair',
            description: 'Plumbing repair and fixture replacement',
            basePrice: 150,
            category: 'repair',
          },
          {
            name: 'Installation',
            description: 'New plumbing installation',
            basePrice: 500,
            category: 'installation',
          },
          {
            name: 'Emergency Service',
            description: '24/7 emergency plumbing service',
            basePrice: 300,
            category: 'emergency',
          },
        ],
      },
      generic: {
        services: [
          {
            name: 'Consultation',
            description: 'Initial consultation',
            basePrice: 100,
            category: 'consultation',
          },
          {
            name: 'Service',
            description: 'Standard service',
            basePrice: 200,
            category: 'service',
          },
          {
            name: 'Premium Service',
            description: 'Premium service package',
            basePrice: 500,
            category: 'premium',
          },
        ],
      },
    };

    return templates[industry] || templates.generic;
  }

  private async stepCreatePipeline(tenantId: string): Promise<void> {
    logger.info('Step: CREATE_PIPELINE', { tenantId });

    // Pipeline stages are defined in LeadStatus enum and managed by application
    // Verify service catalog items were created (from template)
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const serviceCount = await db.serviceCatalogItem.count({
      where: { tenantId },
    });

    if (serviceCount === 0) {
      throw new Error(`No service catalog items found. Template may not have loaded.`);
    }

    logger.info('Pipeline verified', { tenantId, serviceCount });
  }

  private async stepCreateWorkflows(tenantId: string): Promise<void> {
    logger.info('Step: CREATE_WORKFLOWS', { tenantId });

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Create default workflows
    const workflows = [
      {
        name: 'lead-scoring',
        description: 'Automatically score and qualify leads',
        trigger: 'lead.created',
      },
      {
        name: 'follow-up-reminders',
        description: 'Send follow-up reminders for open estimates',
        trigger: 'estimate.sent',
      },
      {
        name: 'job-completion',
        description: 'Create invoice and request review after job completion',
        trigger: 'job.completed',
      },
    ];

    for (const workflow of workflows) {
      await db.workflowDefinition.upsert({
        where: {
          tenantId_name: {
            tenantId,
            name: workflow.name,
          },
        },
        create: {
          tenantId,
          name: workflow.name,
          description: workflow.description,
          trigger: workflow.trigger,
          enabled: true,
        },
        update: {
          description: workflow.description,
          enabled: true,
        },
      });
    }

    logger.info('Workflows created', { tenantId, workflowCount: workflows.length });
  }

  private async stepInitializeHermes(tenantId: string): Promise<void> {
    logger.info('Step: INITIALIZE_HERMES', { tenantId });

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Create default agent configs
    const agents = [
      {
        name: 'RECEPTIONIST',
        description: 'Customer-facing AI receptionist',
        role: 'receptionist',
      },
      {
        name: 'SPEED_TO_LEAD',
        description: 'Fast lead qualification and response',
        role: 'lead_qualifier',
      },
      {
        name: 'AI_ADVISOR',
        description: 'Business insights and recommendations',
        role: 'advisor',
      },
    ];

    for (const agent of agents) {
      await db.agentConfig.upsert({
        where: {
          tenantId_name: {
            tenantId,
            name: agent.name,
          },
        },
        create: {
          tenantId,
          name: agent.name,
          description: agent.description,
          role: agent.role,
          enabled: true,
        },
        update: {
          enabled: true,
        },
      });
    }

    logger.info('Hermes agents initialized', { tenantId, agentCount: agents.length });
  }

  private async stepProvisionDiscord(tenantId: string): Promise<void> {
    logger.info('Step: PROVISION_DISCORD', { tenantId });

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Discord provisioning is handled by Discord bot service
    // This step is a placeholder for webhook-based Discord setup
    // In production, this would:
    // 1. Call Discord API to create guild/channels
    // 2. Set up roles and permissions
    // 3. Store discordGuildId on tenant

    // For now, just log that provisioning is ready
    logger.info('Discord provisioning ready', {
      tenantId,
      note: 'Discord bot will handle workspace creation on first connection',
    });
  }

  private async stepStartOnboarding(tenantId: string): Promise<void> {
    logger.info('Step: START_ONBOARDING', { tenantId });

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Update onboarding progress
    await db.tenant.update({
      where: { id: tenantId },
      data: {
        onboardingStep: 1,
      },
    });

    // Onboarding Discord messages will be sent by bot when user joins Discord workspace
    logger.info('Onboarding initialized', { tenantId, onboardingStep: 1 });
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
