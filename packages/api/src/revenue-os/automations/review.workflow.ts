import { Injectable } from '@nestjs/common';
import {
  AgentType,
  ConsentChannel,
  ServiceJobStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentService } from '../consent/consent.service';
import { AgentsService } from '../agents/agents.service';
import { MockProvider } from '../providers/mock.provider';
import { ReviewRequestJob, WorkflowKey } from './workflow.types';
import {
  WorkflowRunnerService,
  WorkflowResult,
  skipped,
  succeeded,
} from './workflow-runner.service';

/** At or above this rating we offer the public review link. */
export const POSITIVE_THRESHOLD = 4;

/**
 * Workflow D — Review.
 *
 * Trigger: job.completed.
 *
 * Every customer is asked the same question. Only the *follow-up* differs:
 * happy customers get the public review link, unhappy ones get a human.
 * That is service recovery, not review gating — the distinction is that no
 * feedback is suppressed and nobody is filtered out of being asked.
 */
@Injectable()
export class ReviewWorkflow {
  constructor(
    private prisma: PrismaService,
    private runner: WorkflowRunnerService,
    private consent: ConsentService,
    private agents: AgentsService,
    private provider: MockProvider,
  ) {}

  async execute(job: ReviewRequestJob): Promise<WorkflowResult> {
    const { tenantId, serviceJobId } = job;

    return this.runner.run(
      {
        tenantId,
        workflowKey: WorkflowKey.REVIEW_REQUEST,
        entityType: 'ServiceJob',
        entityId: serviceJobId,
      },
      async () => {
        const serviceJob = await this.prisma.serviceJob.findFirst({
          where: { id: serviceJobId, tenantId },
          include: { customer: true },
        });

        if (!serviceJob) {
          return skipped('job not found for tenant');
        }

        if (serviceJob.status !== ServiceJobStatus.COMPLETED) {
          return skipped('job not completed');
        }

        if (!(await this.agents.canRun(tenantId, AgentType.REVIEW))) {
          return skipped('Review agent disabled or NEEDS_CONFIG');
        }

        if (!serviceJob.customerId) {
          return skipped('job has no customer to contact');
        }

        const allowed = await this.consent.canContact(
          tenantId,
          serviceJob.customerId,
          ConsentChannel.SMS,
        );
        if (!allowed) {
          return skipped('no SMS consent on record — not contacted');
        }

        const send = await this.provider.sendSms({
          tenantId,
          to: serviceJob.customer?.phone ?? '',
          body:
            'Thanks for choosing us today. How did we do, on a scale of 1 to 5? ' +
            'Your answer goes straight to our team.',
        });

        if (!send.sent) {
          return skipped(send.detail ?? 'messaging provider not configured');
        }

        await this.agents.recordRun(tenantId, AgentType.REVIEW);
        return succeeded('satisfaction request sent');
      },
    );
  }

  /**
   * Handle the customer's rating.
   *
   * All feedback is preserved as a Conversation regardless of score — the
   * record is written before any branching, so a negative rating cannot be
   * dropped by a later failure.
   */
  async handleSatisfaction(
    tenantId: string,
    serviceJobId: string,
    rating: number,
    comment?: string,
  ) {
    const serviceJob = await this.prisma.serviceJob.findFirst({
      where: { id: serviceJobId, tenantId },
    });
    if (!serviceJob) {
      return { recorded: false };
    }

    await this.prisma.conversation.create({
      data: {
        tenantId,
        customerId: serviceJob.customerId,
        channel: 'SMS',
        direction: 'INBOUND',
        body: `Rating ${rating}/5${comment ? `: ${comment}` : ''}`,
        aiHandled: true,
      },
    });

    if (rating >= POSITIVE_THRESHOLD) {
      const link = await this.provider.reviewLink(tenantId);
      if (!link) {
        // No configured link means no link is sent. Constructing a plausible
        // review URL is explicitly forbidden.
        return { recorded: true, positive: true, reviewLinkSent: false };
      }
      return { recorded: true, positive: true, reviewLinkSent: true, link };
    }

    // Negative feedback becomes internal service recovery, never a public ask.
    await this.prisma.automationRun.create({
      data: {
        tenantId,
        workflowKey: 'service-recovery-task',
        entityType: 'ServiceJob',
        entityId: serviceJobId,
        status: 'PENDING',
        payload: { rating, comment: comment ?? null },
      },
    });

    return { recorded: true, positive: false, recoveryTaskCreated: true };
  }
}
