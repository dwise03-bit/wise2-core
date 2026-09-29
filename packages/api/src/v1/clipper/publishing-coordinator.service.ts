import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';
import { ClipPlatform, PublishingJobStatus } from '@prisma/client';
import { BasePublisher } from './publishers/base-publisher';
import { InstagramPublisher } from './publishers/instagram-publisher';
import { TikTokPublisher } from './publishers/tiktok-publisher';
import { YouTubePublisher } from './publishers/youtube-publisher';
import { TwitterPublisher } from './publishers/twitter-publisher';
import { DiscordPublisherService } from './discord-publisher.service';
import { VideoExtractorService } from './video-extractor.service';

@Injectable()
export class PublishingCoordinatorService {
  private readonly logger = new Logger(PublishingCoordinatorService.name);

  private publishers: Map<ClipPlatform, BasePublisher> = new Map();

  constructor(
    private prisma: PrismaService,
    private instagramPublisher: InstagramPublisher,
    private tiktokPublisher: TikTokPublisher,
    private youtubePublisher: YouTubePublisher,
    private twitterPublisher: TwitterPublisher,
    private discordPublisher: DiscordPublisherService,
    private videoExtractor: VideoExtractorService,
  ) {
    this.publishers.set(ClipPlatform.INSTAGRAM, instagramPublisher);
    this.publishers.set(ClipPlatform.TIKTOK, tiktokPublisher);
    this.publishers.set(ClipPlatform.YOUTUBE, youtubePublisher);
    this.publishers.set(ClipPlatform.TWITTER, twitterPublisher);
  }

  async publishToMultiplePlatforms(
    clipId: string,
    platforms: ClipPlatform[],
    scheduledAt?: Date,
  ): Promise<void> {
    const clip = await this.prisma.clip.findUnique({
      where: { id: clipId },
      include: { clipAssets: true, mediaAsset: true },
    });

    if (!clip) throw new Error('Clip not found');

    // Create publishing jobs for each platform
    for (const platform of platforms) {
      await this.prisma.clipPublishingJob.create({
        data: {
          clipId,
          platform,
          status: scheduledAt ? PublishingJobStatus.SCHEDULED : PublishingJobStatus.PENDING,
          scheduledAt,
        },
      });
    }

    // If not scheduled, publish immediately
    if (!scheduledAt) {
      await this.publishNow(clip);
    }
  }

  private async publishNow(clip: any): Promise<void> {
    const publishingJobs = await this.prisma.clipPublishingJob.findMany({
      where: { clipId: clip.id, status: PublishingJobStatus.PENDING },
    });

    // Get or create optimized clip files for each platform
    const clipAssets = new Map<ClipPlatform, string>();

    for (const platform of [
      ClipPlatform.INSTAGRAM,
      ClipPlatform.TIKTOK,
      ClipPlatform.YOUTUBE,
      ClipPlatform.TWITTER,
      ClipPlatform.DISCORD,
    ]) {
      if (!publishingJobs.some(j => j.platform === platform)) continue;

      try {
        // Optimize video for platform
        const optimized = await this.videoExtractor.optimizeForPlatform(
          clip.mediaAsset.filePath || clip.mediaAsset.sourceUrl,
          platform.toLowerCase() as any,
        );
        clipAssets.set(platform, optimized.file);
      } catch (error) {
        this.logger.warn(`Failed to optimize for ${platform}: ${error.message}`);
      }
    }

    // Publish to each platform in parallel
    const publishTasks = publishingJobs.map(async job => {
      const clipPath = clipAssets.get(job.platform);
      if (!clipPath) {
        await this.prisma.clipPublishingJob.update({
          where: { id: job.id },
          data: {
            status: PublishingJobStatus.FAILED,
            errorMessage: `No optimized clip available for ${job.platform}`,
          },
        });
        return;
      }

      try {
        const publisher = this.publishers.get(job.platform);
        if (!publisher) {
          throw new Error(`No publisher for ${job.platform}`);
        }

        const result = await publisher.publishClip(clipPath, {
          title: clip.title,
          description: clip.autoCaption || clip.description,
          hashtags: clip.hashtags,
        });

        if (result.success) {
          await this.prisma.clipPublishingJob.update({
            where: { id: job.id },
            data: {
              status: PublishingJobStatus.PUBLISHED,
              publishedAt: new Date(),
              platformUrl: result.platformUrl,
              platformPostId: result.platformPostId,
            },
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        this.logger.error(`Failed to publish to ${job.platform}: ${error.message}`);
        await this.prisma.clipPublishingJob.update({
          where: { id: job.id },
          data: {
            status: PublishingJobStatus.FAILED,
            errorMessage: error.message,
            retryCount: (job.retryCount || 0) + 1,
          },
        });
      }
    });

    await Promise.all(publishTasks);
  }

  async retryFailedJobs(clipId: string): Promise<void> {
    const failedJobs = await this.prisma.clipPublishingJob.findMany({
      where: {
        clipId,
        status: PublishingJobStatus.FAILED,
        retryCount: { lt: 3 }, // Max 3 retries
      },
    });

    const clip = await this.prisma.clip.findUnique({
      where: { id: clipId },
      include: { clipAssets: true, mediaAsset: true },
    });

    for (const job of failedJobs) {
      await this.prisma.clipPublishingJob.update({
        where: { id: job.id },
        data: { status: PublishingJobStatus.PENDING },
      });
    }

    await this.publishNow(clip);
  }

  async getPublishingStatus(clipId: string): Promise<any> {
    const jobs = await this.prisma.clipPublishingJob.findMany({
      where: { clipId },
      orderBy: { createdAt: 'asc' },
    });

    const summary = {
      total: jobs.length,
      published: jobs.filter(j => j.status === PublishingJobStatus.PUBLISHED).length,
      pending: jobs.filter(j => j.status === PublishingJobStatus.PENDING).length,
      scheduled: jobs.filter(j => j.status === PublishingJobStatus.SCHEDULED).length,
      failed: jobs.filter(j => j.status === PublishingJobStatus.FAILED).length,
      jobs,
    };

    return summary;
  }
}
