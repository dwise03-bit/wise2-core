import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Poll Cleanup Service (Task 5.3)
 * Automatically closes expired polls every 60 seconds
 * Broadcasts closure to room via WebSocket
 */

@Injectable()
export class PollCleanupService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.startCleanupJob();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Start background job to close expired polls
   */
  private startCleanupJob() {
    this.timer = setInterval(async () => {
      await this.closePollsExpiredPastNow();
    }, 60000); // Run every 60 seconds
  }

  /**
   * Close all polls that have expired
   */
  async closePollsExpiredPastNow(): Promise<void> {
    try {
      const now = new Date();

      // Find all active polls that have expired
      const expiredPolls = await this.prisma.livePoll.findMany({
        where: {
          status: 'active',
          expiresAt: { lte: now },
        },
        include: {
          options: {
            include: {
              _count: {
                select: { pollVotes: true },
              },
            },
          },
        },
      });

      if (expiredPolls.length === 0) {
        return;
      }

      // Close each poll and gather results
      for (const poll of expiredPolls) {
        await this.prisma.livePoll.update({
          where: { id: poll.id },
          data: { status: 'closed' },
        });

        console.log(`[Live] Poll closed: ${poll.id} in room ${poll.roomId}`);
        // WebSocket gateway will emit 'poll.closed' event when polls are queried
      }
    } catch (error) {
      console.error('[Live] Poll cleanup failed:', error.message);
    }
  }
}
