import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import { REVENUE_OS_QUEUE, WorkflowKey } from './workflow.types';
import { SpeedToLeadWorkflow } from './speed-to-lead.workflow';
import { InboundReceptionistWorkflow } from './inbound-receptionist.workflow';
import { EstimateRecoveryWorkflow } from './estimate-recovery.workflow';
import { ReviewWorkflow } from './review.workflow';
import { MembershipWorkflow } from './membership.workflow';
import { ReactivationWorkflow } from './reactivation.workflow';
import { RevenueQueueService } from './queue.service';

/**
 * Consumes the Revenue OS queue.
 *
 * Deployment topology is deliberately not forced. The worker starts only when
 * REVENUE_OS_WORKER=true, so the same image can run either as the API (flag
 * unset) or as a dedicated worker container (flag set). Running it in the API
 * process is fine for Wise HVAC's volume; splitting it out later needs no
 * code change.
 *
 * Both flags are required: with REVENUE_OS_ENABLED off, no worker runs at all.
 */
@Injectable()
export class RevenueWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('RevenueOS/Worker');
  private worker: Worker | null = null;

  constructor(
    private configService: ConfigService,
    private queue: RevenueQueueService,
    private speedToLead: SpeedToLeadWorkflow,
    private receptionist: InboundReceptionistWorkflow,
    private recovery: EstimateRecoveryWorkflow,
    private review: ReviewWorkflow,
    private membership: MembershipWorkflow,
    private reactivation: ReactivationWorkflow,
  ) {}

  onModuleInit() {
    const revenueOsEnabled =
      this.configService.get<string>('REVENUE_OS_ENABLED') === 'true';
    const workerEnabled =
      this.configService.get<string>('REVENUE_OS_WORKER') === 'true';

    if (!revenueOsEnabled || !workerEnabled) {
      this.logger.log('Revenue OS worker not started (disabled by configuration)');
      return;
    }

    const url = this.configService.get<string>('REDIS_URL') ?? 'redis://127.0.0.1:6379';
    const concurrency = parseInt(
      this.configService.get<string>('REVENUE_OS_WORKER_CONCURRENCY') ?? '5',
      10,
    );

    this.worker = new Worker(
      REVENUE_OS_QUEUE,
      async (job) => this.dispatch(job),
      { connection: { url } as any, concurrency },
    );

    this.worker.on('failed', (job, err) => {
      // BullMQ retries per the queue's backoff policy; this is a log, not a
      // terminal state, until attempts are exhausted.
      this.logger.error(
        `Job ${job?.name} ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`,
      );
    });

    this.logger.log(`Revenue OS worker started (concurrency ${concurrency})`);
  }

  /**
   * Routes a job to its workflow.
   *
   * An unknown job name is logged and dropped rather than thrown: throwing
   * would retry it forever against a handler that will never exist.
   */
  private async dispatch(job: Job) {
    switch (job.name as WorkflowKey) {
      case WorkflowKey.SPEED_TO_LEAD: {
        const result = await this.speedToLead.execute(job.data);
        // Continue the contact cadence by scheduling the next attempt.
        if (result.retryInMinutes !== undefined) {
          await this.queue.enqueue(
            WorkflowKey.SPEED_TO_LEAD,
            { ...job.data, attempt: (job.data.attempt ?? 0) + 1 },
            {
              delayMinutes: result.retryInMinutes,
              // Deterministic id keeps a duplicate delivery from doubling the
              // cadence for the same lead and attempt.
              jobId: `stl:${job.data.tenantId}:${job.data.leadId}:${(job.data.attempt ?? 0) + 1}`,
            },
          );
        }
        return result;
      }
      case WorkflowKey.INBOUND_RECEPTIONIST:
        return this.receptionist.execute(job.data);
      case WorkflowKey.ESTIMATE_RECOVERY:
        return this.recovery.execute(job.data);
      case WorkflowKey.REVIEW_REQUEST:
        return this.review.execute(job.data);
      case WorkflowKey.MEMBERSHIP_OFFER:
        return this.membership.execute(job.data);
      case WorkflowKey.REACTIVATION:
        return this.reactivation.execute(job.data);
      default:
        this.logger.warn(`Unknown workflow job "${job.name}" — dropped`);
        return { status: 'SKIPPED', detail: 'unknown workflow' };
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      // Let in-flight jobs finish so a deploy cannot abandon a half-run
      // workflow mid-send.
      await this.worker.close();
    }
  }
}
