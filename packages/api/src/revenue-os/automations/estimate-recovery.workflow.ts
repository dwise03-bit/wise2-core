import { Injectable } from '@nestjs/common';
import { AgentType, ConsentChannel, EstimateStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentService } from '../consent/consent.service';
import { AgentsService } from '../agents/agents.service';
import { MockProvider } from '../providers/mock.provider';
import { EstimateRecoveryJob, WorkflowKey } from './workflow.types';
import {
  WorkflowRunnerService,
  WorkflowResult,
  skipped,
  succeeded,
} from './workflow-runner.service';

/** Terminal states — recovery stops rather than nagging. */
const CLOSED_STATES: EstimateStatus[] = [
  EstimateStatus.SOLD,
  EstimateStatus.DECLINED,
  EstimateStatus.EXPIRED,
];

/**
 * Workflow C — Unsold Estimate Recovery.
 *
 * Trigger: an open estimate past the configured threshold.
 *
 * The agent's job is to surface an objection and hand it to a human. It does
 * not negotiate: every pricing question is escalated, because an AI that
 * discounts to close a job costs margin on every future one.
 */
@Injectable()
export class EstimateRecoveryWorkflow {
  constructor(
    private prisma: PrismaService,
    private runner: WorkflowRunnerService,
    private consent: ConsentService,
    private agents: AgentsService,
    private provider: MockProvider,
  ) {}

  async execute(job: EstimateRecoveryJob): Promise<WorkflowResult> {
    const { tenantId, estimateId } = job;

    return this.runner.run(
      {
        tenantId,
        workflowKey: WorkflowKey.ESTIMATE_RECOVERY,
        entityType: 'Estimate',
        entityId: estimateId,
      },
      async () => {
        const estimate = await this.prisma.estimate.findFirst({
          where: { id: estimateId, tenantId },
          include: { customer: true },
        });

        if (!estimate) {
          return skipped('estimate not found for tenant');
        }

        if (CLOSED_STATES.includes(estimate.status)) {
          return skipped(`estimate already ${estimate.status.toLowerCase()}`);
        }

        if (!(await this.agents.canRun(tenantId, AgentType.RECOVERY))) {
          return skipped('Recovery agent disabled or NEEDS_CONFIG');
        }

        if (!estimate.customerId) {
          return skipped('estimate has no customer to contact');
        }

        const allowed = await this.consent.canContact(
          tenantId,
          estimate.customerId,
          ConsentChannel.SMS,
        );
        if (!allowed) {
          return skipped('no SMS consent on record — not contacted');
        }

        // Copy deliberately asks an open question and quotes no figure. The
        // amount already exists on the estimate the customer received; the
        // agent restating or adjusting it is how invented pricing creeps in.
        const send = await this.provider.sendSms({
          tenantId,
          to: estimate.customer?.phone ?? '',
          body:
            'Following up on the estimate we sent. Is there anything holding ' +
            'you back, or any questions we can pass to your technician?',
        });

        if (!send.sent) {
          return skipped(send.detail ?? 'messaging provider not configured');
        }

        await this.prisma.estimate.updateMany({
          where: { id: estimateId, tenantId },
          data: { status: EstimateStatus.VIEWED, followUpAt: new Date() },
        });

        await this.agents.recordRun(tenantId, AgentType.RECOVERY);

        return succeeded('recovery follow-up sent');
      },
    );
  }

  /**
   * Records a captured objection and flags whether it needs a human.
   *
   * Pricing and technical objections always escalate — the agent is not
   * permitted to answer either.
   */
  async recordObjection(tenantId: string, estimateId: string, objection: string) {
    const needsHuman = /price|cost|expensive|cheaper|discount|finance|warrant/i.test(
      objection,
    );

    await this.prisma.estimate.updateMany({
      where: { id: estimateId, tenantId },
      data: { objection },
    });

    return { needsHuman };
  }
}
