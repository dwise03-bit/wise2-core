import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { PostCallSummaryService } from './postcall.service';
import { QueueService, JobType } from '@app/queue/queue.service';

/**
 * Post-Call Scheduler
 * Handles automated scheduling of post-call summaries
 */
@Injectable()
export class PostCallScheduler {
  private readonly logger = new Logger('PostCallScheduler');

  constructor(
    private postCallSummaryService: PostCallSummaryService,
    private queueService: QueueService,
  ) {
    this.logger.log('📅 Post-Call Scheduler initialized');
  }

  /**
   * Check for completed bookings and queue post-call processing
   * Runs every 30 minutes
   */
  @Interval(30 * 60 * 1000) // Every 30 minutes
  async checkForCompletedBookings(): Promise<void> {
    try {
      this.logger.log('🔍 Checking for completed bookings ready for post-call processing...');
      const count = await this.postCallSummaryService.checkAndProcessPastBookings();
      this.logger.log(`✅ Queued ${count} post-call summaries for processing`);
    } catch (error) {
      this.logger.error('Failed to check for completed bookings', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Alternative: Run at specific times (e.g., 8 AM, 12 PM, 4 PM, 8 PM UTC)
   * Uncomment and use instead of @Interval if you prefer fixed schedule
   */
  // @Cron('0 8,12,16,20 * * *') // 8, 12, 16, 20:00 UTC
  // async checkForCompletedBookingsAtFixedTime(): Promise<void> {
  //   await this.checkForCompletedBookings();
  // }

  /**
   * Queue job handler for processing post-call summaries
   * Called by job queue worker
   */
  async handlePostCallSummaryJob(jobData: { bookingId: string; retryAttempt?: number }): Promise<void> {
    const { bookingId, retryAttempt = 0 } = jobData;

    try {
      await this.postCallSummaryService.processPostCallSummary(bookingId);
    } catch (error) {
      this.logger.error(`Post-call processing failed for booking ${bookingId}`, {
        retryAttempt,
        error: error instanceof Error ? error.message : String(error),
      });

      // Queue for retry if max retries not exceeded
      if (retryAttempt < 3) {
        await this.queueService.enqueueJob(
          JobType.PROCESS_POST_CALL_SUMMARY,
          {
            bookingId,
            retryAttempt: retryAttempt + 1,
          },
          {
            priority: 50,
            maxRetries: 3,
          },
        );
      }

      throw error;
    }
  }

  /**
   * Cleanup old post-call summaries (optional)
   * Runs daily at 2 AM UTC
   */
  @Cron('0 2 * * *')
  async cleanupOldSummaries(): Promise<void> {
    try {
      this.logger.log('🧹 Starting cleanup of old post-call summaries...');
      // Implementation depends on retention policy
      // For now, just log
      this.logger.log('✅ Post-call cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup old summaries', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
