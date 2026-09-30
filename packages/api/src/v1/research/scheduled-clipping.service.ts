import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';
import { ScheduleStatus } from '@prisma/client';
import { ClipperService } from '../clipper/clipper.service';

@Injectable()
export class ScheduledClippingService {
  private readonly logger = new Logger('ScheduledClippingService');

  constructor(
    private prisma: PrismaService,
    private clipper: ClipperService,
  ) {}

  /**
   * Process scheduled clips: Execute clips that are ready
   * This runs every N minutes to extract and publish scheduled clips
   */
  async processScheduledClips(): Promise<any> {
    this.logger.log('⏱️ Processing scheduled clips...');

    // Find clips that are ready to be extracted
    const readyClips = await this.prisma.scheduledClip.findMany({
      where: {
        status: ScheduleStatus.SCHEDULED,
        scheduledFor: { lte: new Date() },
      },
      include: { creator: true },
      take: 10, // Process max 10 per run
    });

    this.logger.log(`Found ${readyClips.length} clips ready for processing`);

    const results: any[] = [];

    for (const scheduledClip of readyClips) {
      try {
        // Update status to processing
        await this.prisma.scheduledClip.update({
          where: { id: scheduledClip.id },
          data: {
            status: ScheduleStatus.PROCESSING,
            startedAt: new Date(),
          },
        });

        // Extract the video segment using clipper service
        // (This would integrate with the existing clipper system)
        const extractionResult = await this.extractClipFromSource(scheduledClip);

        // Update with extracted path
        await this.prisma.scheduledClip.update({
          where: { id: scheduledClip.id },
          data: {
            extractedPath: extractionResult.path,
            status: ScheduleStatus.EXTRACTED,
          },
        });

        // If auto-publish is enabled, publish immediately
        if (scheduledClip.publishTo.length > 0) {
          await this.publishClip(scheduledClip, extractionResult.path);
        }

        results.push({ id: scheduledClip.id, status: 'success' });
      } catch (error: any) {
        this.logger.error(`Failed to process clip ${scheduledClip.id}: ${error.message}`);

        await this.prisma.scheduledClip.update({
          where: { id: scheduledClip.id },
          data: {
            status: ScheduleStatus.FAILED,
            extractionError: error.message,
          },
        });

        results.push({ id: scheduledClip.id, status: 'failed', error: error.message });
      }
    }

    return {
      processed: readyClips.length,
      results,
    };
  }

  /**
   * Get all scheduled clips for a creator
   */
  async getScheduledClipsForCreator(creatorHandle: string): Promise<any[]> {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { handle: creatorHandle },
    });

    if (!creator) throw new Error('Creator not found');

    return this.prisma.scheduledClip.findMany({
      where: { creatorId: creator.id },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  /**
   * Get stats on scheduled clips
   */
  async getScheduledClipsStats(): Promise<any> {
    const stats = await this.prisma.scheduledClip.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      byStatus: stats.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      total: stats.reduce((sum, item) => sum + item._count, 0),
    };
  }

  /**
   * Reschedule a clip for later
   */
  async rescheduleClip(clipId: string, newScheduleTime: Date): Promise<any> {
    if (newScheduleTime <= new Date()) {
      throw new Error('Schedule time must be in the future');
    }

    return this.prisma.scheduledClip.update({
      where: { id: clipId },
      data: { scheduledFor: newScheduleTime },
    });
  }

  /**
   * Cancel a scheduled clip
   */
  async cancelScheduledClip(clipId: string): Promise<any> {
    return this.prisma.scheduledClip.delete({
      where: { id: clipId },
    });
  }

  // ====== PRIVATE HELPERS ======

  private async extractClipFromSource(scheduledClip: any) {
    this.logger.log(`🎬 Extracting clip from ${scheduledClip.sourceUrl}`);

    // TODO: Implement platform-specific extraction
    // - Download video from source
    // - Extract recommended segment
    // - Apply platform-specific optimizations
    // - Save to storage

    // For now, return mock result
    return {
      path: `/videos/extracted/${scheduledClip.id}.mp4`,
      duration: scheduledClip.recommendedEnd - (scheduledClip.recommendedStart || 0),
    };
  }

  private async publishClip(scheduledClip: any, clipPath: string) {
    this.logger.log(`📱 Publishing clip to ${scheduledClip.publishTo.join(', ')}`);

    // TODO: Publish to platforms via clipper service
    // For each platform in publishTo:
    // - Create clip in clipper system
    // - Trigger extraction
    // - Publish to platform
  }
}
