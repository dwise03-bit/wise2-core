import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum JobType {
  SEND_EMAIL = 'send_email',
  SEND_BULK_EMAILS = 'send_bulk_emails',
  PROCESS_INVOICE = 'process_invoice',
  HANDLE_STRIPE_EVENT = 'handle_stripe_event',
  CLEANUP_SESSIONS = 'cleanup_sessions',
  ARCHIVE_EVENTS = 'archive_events',
  SEND_NOTIFICATION = 'send_notification',
  SEND_DIGEST = 'send_digest',
  PROCESS_EXPORT = 'process_export',
}

export interface Job {
  id: string
  type: JobType
  data: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retries: number
  maxRetries: number
  priority: number // 0-100, higher = more important
  createdAt: Date
  processedAt?: Date
  error?: string
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger('QueueService');
  private jobQueue: Map<string, Job> = new Map();
  private jobId = 0;

  constructor(private configService: ConfigService) {
    this.logger.log('📋 Job queue service initialized');
    this.startWorker();
  }

  /**
   * Add a job to the queue
   */
  async enqueueJob(
    type: JobType,
    data: Record<string, any>,
    options?: { priority?: number; maxRetries?: number }
  ): Promise<string> {
    const id = `job-${++this.jobId}-${Date.now()}`;
    const job: Job = {
      id,
      type,
      data,
      status: 'pending',
      retries: 0,
      maxRetries: options?.maxRetries || 3,
      priority: options?.priority || 50,
      createdAt: new Date(),
    };

    this.jobQueue.set(id, job);
    this.logger.log(`📍 Job enqueued: ${type} (ID: ${id})`);

    return id;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): Job | null {
    return this.jobQueue.get(jobId) || null;
  }

  /**
   * Process jobs from queue
   */
  private startWorker(): void {
    // Process one job every 5 seconds
    setInterval(() => {
      this.processNextJob();
    }, 5000);
  }

  private async processNextJob(): Promise<void> {
    try {
      // Find pending job with highest priority
      let nextJob: Job | null = null;
      let nextJobId: string | null = null;

      for (const [id, job] of this.jobQueue.entries()) {
        if (job.status === 'pending') {
          if (!nextJob || job.priority > nextJob.priority) {
            nextJob = job;
            nextJobId = id;
          }
        }
      }

      if (!nextJob || !nextJobId) {
        return;
      }

      // Process the job
      nextJob.status = 'processing';
      nextJob.processedAt = new Date();

      try {
        await this.executeJob(nextJob);
        nextJob.status = 'completed';
        this.logger.log(`✅ Job completed: ${nextJob.id}`);
      } catch (error) {
        nextJob.retries++;
        if (nextJob.retries >= nextJob.maxRetries) {
          nextJob.status = 'failed';
          nextJob.error = error instanceof Error ? error.message : String(error);
          this.logger.error(`❌ Job failed after ${nextJob.retries} retries: ${nextJob.id}`);
        } else {
          nextJob.status = 'pending';
          this.logger.warn(`⚠️  Job retry ${nextJob.retries}/${nextJob.maxRetries}: ${nextJob.id}`);
        }
      }
    } catch (error) {
      this.logger.error(`Worker error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a job based on its type
   */
  private async executeJob(job: Job): Promise<void> {
    switch (job.type) {
      case JobType.SEND_EMAIL:
        await this.executeSendEmail(job);
        break;
      case JobType.SEND_BULK_EMAILS:
        await this.executeSendBulkEmails(job);
        break;
      case JobType.PROCESS_INVOICE:
        await this.executeProcessInvoice(job);
        break;
      case JobType.HANDLE_STRIPE_EVENT:
        await this.executeHandleStripeEvent(job);
        break;
      case JobType.CLEANUP_SESSIONS:
        await this.executeCleanupSessions(job);
        break;
      case JobType.ARCHIVE_EVENTS:
        await this.executeArchiveEvents(job);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  private async executeSendEmail(job: Job): Promise<void> {
    // TODO: Call email service to send email
    this.logger.log(`📧 Executing send_email job: ${job.data.to}`);
  }

  private async executeSendBulkEmails(job: Job): Promise<void> {
    // TODO: Send multiple emails
    this.logger.log(`📧 Executing send_bulk_emails job: ${job.data.count} emails`);
  }

  private async executeProcessInvoice(job: Job): Promise<void> {
    // TODO: Process invoice generation
    this.logger.log(`💳 Executing process_invoice job: ${job.data.invoiceId}`);
  }

  private async executeHandleStripeEvent(job: Job): Promise<void> {
    // TODO: Handle Stripe webhook event
    this.logger.log(`🪝 Executing handle_stripe_event job: ${job.data.eventType}`);
  }

  private async executeCleanupSessions(job: Job): Promise<void> {
    // TODO: Clean up old sessions
    this.logger.log(`🧹 Executing cleanup_sessions job`);
  }

  private async executeArchiveEvents(job: Job): Promise<void> {
    // TODO: Archive old events
    this.logger.log(`📦 Executing archive_events job`);
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
  } {
    const stats = {
      total: this.jobQueue.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    for (const job of this.jobQueue.values()) {
      if (job.status === 'pending') stats.pending++;
      else if (job.status === 'processing') stats.processing++;
      else if (job.status === 'completed') stats.completed++;
      else if (job.status === 'failed') stats.failed++;
    }

    return stats;
  }
}
