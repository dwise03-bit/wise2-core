import { Injectable } from '@nestjs/common';
import {
  AgentType,
  ConsentChannel,
  ConsentState,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { withTenant } from '../../common/prisma/tenant-isolation';
import { ConsentService } from '../consent/consent.service';
import { AgentsService } from '../agents/agents.service';
import { MockProvider } from '../providers/mock.provider';
import { ReactivationJob, WorkflowKey } from './workflow.types';
import {
  WorkflowRunnerService,
  WorkflowResult,
  skipped,
  succeeded,
} from './workflow-runner.service';

/** Equipment at or beyond this age is a replacement conversation. */
export const AGING_EQUIPMENT_YEARS = 12;

/** Safety valve on cohort size — a runaway cohort is a mass-messaging event. */
export const MAX_COHORT_SIZE = 500;

/**
 * Workflow F — Reactivation.
 *
 * Trigger: scheduled cohort run.
 *
 * Cohort membership is driven by service history, maintenance due date and
 * equipment age. Opt-outs are excluded at the query level rather than
 * filtered afterwards, so a customer who asked not to be contacted is never
 * loaded into a campaign in the first place.
 */
@Injectable()
export class ReactivationWorkflow {
  constructor(
    private prisma: PrismaService,
    private runner: WorkflowRunnerService,
    private consent: ConsentService,
    private agents: AgentsService,
    private provider: MockProvider,
  ) {}

  async execute(job: ReactivationJob): Promise<WorkflowResult> {
    const { tenantId, dormantDays } = job;

    return this.runner.run(
      {
        tenantId,
        workflowKey: WorkflowKey.REACTIVATION,
        payload: { dormantDays },
      },
      async () => {
        if (!(await this.agents.canRun(tenantId, AgentType.REACTIVATION))) {
          return skipped('Reactivation agent disabled or NEEDS_CONFIG');
        }

        const cohort = await this.buildCohort(tenantId, dormantDays);
        if (cohort.length === 0) {
          return skipped('no customers matched the cohort');
        }

        let contacted = 0;
        let suppressed = 0;

        for (const customer of cohort) {
          // Re-check consent per customer at send time: the cohort query
          // excludes known opt-outs, but consent can change between building
          // the cohort and reaching this row.
          const allowed = await this.consent.canContact(
            tenantId,
            customer.id,
            ConsentChannel.SMS,
          );
          if (!allowed) {
            suppressed += 1;
            continue;
          }

          const send = await this.provider.sendSms({
            tenantId,
            to: customer.phone ?? '',
            body:
              'It has been a while since your last service. Would you like to ' +
              'book a maintenance visit?',
          });

          if (send.sent) {
            contacted += 1;
          } else {
            suppressed += 1;
          }
        }

        await this.agents.recordRun(tenantId, AgentType.REACTIVATION);

        if (contacted === 0) {
          return skipped(
            `cohort of ${cohort.length}, none contacted (${suppressed} suppressed)`,
          );
        }

        return succeeded(`reactivation sent to ${contacted} of ${cohort.length}`, {
          data: { cohortSize: cohort.length, contacted, suppressed },
        });
      },
    );
  }

  /**
   * Customers dormant beyond the window, or running aging equipment.
   *
   * Opt-outs and DNC are excluded in the query itself.
   */
  async buildCohort(tenantId: string, dormantDays: number) {
    const cutoff = new Date(Date.now() - dormantDays * 24 * 3600 * 1000);

    const where: Prisma.RevenueCustomerWhereInput = {
      ...withTenant(tenantId),
      OR: [
        { lastServicedAt: { lt: cutoff } },
        { lastServicedAt: null },
        { equipmentAge: { gte: AGING_EQUIPMENT_YEARS } },
      ],
      // Exclude anyone whose most recent consent signal is a refusal.
      NOT: {
        consentRecords: {
          some: {
            channel: ConsentChannel.SMS,
            state: { in: [ConsentState.OPTED_OUT, ConsentState.DNC] },
          },
        },
      },
    };

    return this.prisma.revenueCustomer.findMany({
      where,
      take: MAX_COHORT_SIZE,
      orderBy: { lastServicedAt: 'asc' },
    });
  }
}
