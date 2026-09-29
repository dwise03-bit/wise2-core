// REAPER Audit Queue Service - M1
// BullMQ queue management and job coordination

import { Queue, Worker, QueueScheduler } from 'bullmq';
import { AuditJobData, AuditJobProcessor } from '../jobs/audit-job-processor';

/**
 * Audit Queue Service
 * Manages BullMQ queue for audit jobs
 */
export class AuditQueueService {
  private queue: Queue<AuditJobData>;
  private worker: Worker<AuditJobData>;
  private scheduler: QueueScheduler;
  private processor: AuditJobProcessor;
  private redisConnection: { host: string; port: number };

  constructor(redisConfig = { host: 'localhost', port: 6379 }) {
    this.redisConnection = redisConfig;
    this.processor = new AuditJobProcessor();

    // Initialize queue
    this.queue = new Queue('reaper-audits', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: false,
        removeOnFail: false,
      },
    });

    // Initialize worker
    this.worker = new Worker('reaper-audits', this.processJob.bind(this), {
      connection: redisConnection,
      concurrency: 2, // Process 2 audits concurrently
      settings: {
        lockDuration: 30000, // 30 seconds
        lockRenewTime: 15000, // Renew every 15 seconds
      },
    });

    // Initialize scheduler for delayed jobs
    this.scheduler = new QueueScheduler('reaper-audits', {
      connection: redisConnection,
    });

    this.setupEventHandlers();
  }

  /**
   * Queue an audit job
   */
  async queueAudit(data: AuditJobData): Promise<string> {
    const job = await this.queue.add(data, {
      jobId: `audit-${data.auditRunId}`,
      priority: this.getPriority(data.auditType),
    });

    return job.id;
  }

  /**
   * Get job priority based on audit type
   */
  private getPriority(auditType: string): number {
    switch (auditType) {
      case 'WEBSITE':
        return 1; // Highest priority
      case 'SOCIAL':
        return 2;
      case 'REPUTATION':
        return 3;
      case 'FULL':
        return 0; // Lowest (most comprehensive)
      default:
        return 5;
    }
  }

  /**
   * Process a job
   */
  private async processJob(job: any): Promise<void> {
    const data: AuditJobData = job.data;

    try {
      switch (data.auditType) {
        case 'WEBSITE':
          await this.processor.processWebsiteAudit(job);
          break;
        case 'SOCIAL':
          await this.processor.processSocialAudit(job);
          break;
        case 'REPUTATION':
          await this.processor.processReputationAudit(job);
          break;
        case 'FULL':
          await this.processor.processFullAudit(job);
          break;
        default:
          throw new Error(`Unknown audit type: ${data.auditType}`);
      }
    } catch (error) {
      // Retry logic handled by BullMQ
      throw error;
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Worker events
    this.worker.on('completed', (job) => {
      console.log(`✓ Audit completed: ${job.id}`);
      // M1: Update audit_run status to COMPLETED
    });

    this.worker.on('failed', (job, err) => {
      console.error(`✗ Audit failed: ${job?.id} - ${err.message}`);
      // M1: Update audit_run status to FAILED with error message
    });

    this.worker.on('progress', (job, progress) => {
      console.log(`→ Audit progress: ${job.id} - ${progress}%`);
      // M1: Update audit progress in real-time via WebSocket
    });

    // Queue events
    this.queue.on('waiting', (job) => {
      console.log(`⧐ Audit queued: ${job.id}`);
      // M1: Update audit_run status to PENDING
    });

    this.queue.on('active', (job) => {
      console.log(`⟳ Audit started: ${job.id}`);
      // M1: Update audit_run status to RUNNING
    });
  }

  /**
   * Get audit job status
   */
  async getJobStatus(jobId: string): Promise<{
    status: string;
    progress: number;
    attempts: number;
    failedReason?: string;
  }> {
    const job = await this.queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    let status = 'unknown';
    if (await job.isCompleted()) status = 'completed';
    else if (await job.isFailed()) status = 'failed';
    else if (await job.isActive()) status = 'active';
    else if (await job.isWaiting()) status = 'waiting';
    else if (await job.isDelayed()) status = 'delayed';

    return {
      status,
      progress: job.progress() as number,
      attempts: job.attemptsMade,
      failedReason: job.failedReason,
    };
  }

  /**
   * Get queue stats
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const counts = await this.queue.getJobCounts();

    return {
      waiting: counts.waiting,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
    };
  }

  /**
   * Cleanup (for graceful shutdown)
   */
  async shutdown(): Promise<void> {
    await this.worker.close();
    await this.scheduler.close();
    await this.queue.close();
  }
}

/**
 * Singleton instance
 */
let queueService: AuditQueueService;

export function getAuditQueueService(redisConfig?: {
  host: string;
  port: number;
}): AuditQueueService {
  if (!queueService) {
    queueService = new AuditQueueService(redisConfig);
  }
  return queueService;
}
