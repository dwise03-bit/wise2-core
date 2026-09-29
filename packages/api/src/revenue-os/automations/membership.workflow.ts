import { Injectable } from '@nestjs/common';
import {
  AgentType,
  ConsentChannel,
  MembershipStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { withTenant } from '../../common/prisma/tenant-isolation';
import { ConsentService } from '../consent/consent.service';
import { AgentsService } from '../agents/agents.service';
import { MockProvider } from '../providers/mock.provider';
import { MembershipOfferJob, WorkflowKey } from './workflow.types';
import {
  WorkflowRunnerService,
  WorkflowResult,
  skipped,
  succeeded,
} from './workflow-runner.service';

/**
 * Workflow E — Membership.
 *
 * Trigger: completed job, or a seasonal campaign cohort.
 *
 * The agent offers only the membership the tenant has configured. If no plan
 * is configured it says nothing at all — an invented plan name or price is
 * a commitment the business then has to honour.
 */
@Injectable()
export class MembershipWorkflow {
  constructor(
    private prisma: PrismaService,
    private runner: WorkflowRunnerService,
    private consent: ConsentService,
    private agents: AgentsService,
    private provider: MockProvider,
  ) {}

  async execute(job: MembershipOfferJob): Promise<WorkflowResult> {
    const { tenantId, customerId } = job;

    return this.runner.run(
      {
        tenantId,
        workflowKey: WorkflowKey.MEMBERSHIP_OFFER,
        entityType: 'RevenueCustomer',
        entityId: customerId,
      },
      async () => {
        const customer = await this.prisma.revenueCustomer.findFirst({
          where: withTenant(tenantId, { id: customerId }),
        });

        if (!customer) {
          return skipped('customer not found for tenant');
        }

        if (customer.membershipStatus === MembershipStatus.ACTIVE) {
          return skipped('customer already a member');
        }

        if (!(await this.agents.canRun(tenantId, AgentType.MEMBERSHIP))) {
          return skipped('Membership agent disabled or NEEDS_CONFIG');
        }

        const plan = await this.configuredPlan(tenantId);
        if (!plan) {
          // No configured plan, no offer. This is the guardrail that stops
          // the agent inventing membership pricing.
          return skipped('no membership plan configured for tenant');
        }

        const allowed = await this.consent.canContact(
          tenantId,
          customerId,
          ConsentChannel.SMS,
        );
        if (!allowed) {
          return skipped('no SMS consent on record — not contacted');
        }

        const send = await this.provider.sendSms({
          tenantId,
          to: customer.phone ?? '',
          body:
            `Would you like to hear about our ${plan.name}? ` +
            'It covers routine maintenance and priority scheduling.',
        });

        if (!send.sent) {
          return skipped(send.detail ?? 'messaging provider not configured');
        }

        await this.agents.recordRun(tenantId, AgentType.MEMBERSHIP);
        return succeeded('membership offer sent', { data: { plan: plan.name } });
      },
    );
  }

  /**
   * Reads the tenant's configured plan from the Membership agent config.
   * Returns null when unset — deliberately no default plan exists.
   */
  private async configuredPlan(
    tenantId: string,
  ): Promise<{ name: string } | null> {
    const agent = await this.prisma.agentConfig.findFirst({
      where: withTenant(tenantId, { type: AgentType.MEMBERSHIP }),
      select: { config: true },
    });

    const config = agent?.config as Record<string, unknown> | null;
    const plan = config?.['membershipPlan'] as { name?: string } | undefined;

    return plan?.name ? { name: plan.name } : null;
  }

  /** Records interest so a human can close it; the agent never sells it. */
  async recordInterest(tenantId: string, customerId: string) {
    return this.prisma.automationRun.create({
      data: {
        tenantId,
        workflowKey: 'membership-interest',
        entityType: 'RevenueCustomer',
        entityId: customerId,
        status: 'PENDING',
      },
    });
  }
}
