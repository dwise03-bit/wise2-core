import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, JobsOptions } from 'bullmq';
import { REVENUE_OS_QUEUE, WorkflowJob, WorkflowKey } from './workflow.types';

/**
 * Durable queue for Revenue OS workflows (Phase 6).
 *
 * Uses BullMQ on the Redis already in the stack. The pre-existing
 * QueueService in this package is an in-memory Map — fine for best-effort
 * email, unacceptable for booked jobs and follow-ups, which must survive a
 * deploy.
 *
 * The queue is created lazily and only when Revenue OS is enabled, so with
 * the feature flag off no Redis connection is opened and no worker runs.
 */
@Injectable()
export class RevenueQueueService implements OnModuleDestroy {
  private readonly logger = new Logger('RevenueOS/Queue');
  private queue: Queue | null = null;

  constructor(private configService: ConfigService) {}

  private get enabled(): boolean {
    return this.configService.get<string>('REVENUE_OS_ENABLED') === 'true';
  }

  private getQueue(): Queue | null {
    if (!this.enabled) {
      return null;
    }

    if (!this.queue) {
      const url = this.configService.get<string>('REDIS_URL') ?? 'redis://127.0.0.1:6379';
      this.queue = new Queue(REVENUE_OS_QUEUE, {
        connection: { url } as any,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 30_000 },
          removeOnComplete: { age: 7 * 24 * 3600, count: 5000 },
          removeOnFail: { age: 30 * 24 * 3600 },
        },
      });
      this.logger.log(`Revenue OS queue connected (${REVENUE_OS_QUEUE})`);
    }

    return this.queue;
  }

  /**
   * Enqueue a workflow. Returns null when Revenue OS is disabled — callers
   * treat that as "not scheduled" rather than assuming success.
   *
   * `jobId` makes enqueuing idempotent: the same entity cannot be queued
   * twice for the same workflow attempt, which matters when a webhook is
   * delivered more than once.
   */
  async enqueue(
    key: WorkflowKey,
    job: WorkflowJob,
    opts: { delayMinutes?: number; jobId?: string } = {},
  ): Promise<string | null> {
    const queue = this.getQueue();
    if (!queue) {
      this.logger.debug(`Revenue OS disabled; ${key} not enqueued`);
      return null;
    }

    const options: JobsOptions = {
      ...(opts.delayMinutes ? { delay: opts.delayMinutes * 60_000 } : {}),
      ...(opts.jobId ? { jobId: opts.jobId } : {}),
    };

    const added = await queue.add(key, job, options);
    return added.id ?? null;
  }

  async onModuleDestroy() {
    if (this.queue) {
      await this.queue.close();
    }
  }
}
