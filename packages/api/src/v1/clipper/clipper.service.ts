import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';
import { CreateMediaDto } from './dtos/create-media.dto';
import { CreateClipDto } from './dtos/create-clip.dto';
import { PublishClipDto } from './dtos/publish-clip.dto';
import { VideoExtractorService } from './video-extractor.service';
import { DiscordPublisherService } from './discord-publisher.service';
import { ClipPlatform, PublishingJobStatus } from '@prisma/client';

@Injectable()
export class ClipperService {
  constructor(
    private prisma: PrismaService,
    private videoExtractor: VideoExtractorService,
    private discordPublisher: DiscordPublisherService,
  ) {}

  async createMediaAsset(userId: string, dto: CreateMediaDto) {
    const mediaAsset = await this.prisma.mediaAsset.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        sourceType: dto.sourceType,
        sourceUrl: dto.sourceUrl,
        transcriptUrl: dto.transcriptUrl,
      },
    });
    return mediaAsset;
  }

  async getMediaAsset(userId: string, mediaAssetId: string) {
    const mediaAsset = await this.prisma.mediaAsset.findUnique({
      where: { id: mediaAssetId },
      include: { clips: true },
    });

    if (!mediaAsset) throw new NotFoundException('Media asset not found');
    if (mediaAsset.userId !== userId) throw new BadRequestException('Unauthorized');

    return mediaAsset;
  }

  async analyzeMedia(userId: string, mediaAssetId: string) {
    const mediaAsset = await this.getMediaAsset(userId, mediaAssetId);

    // For Phase 1, just mark as processed
    // Phase 2 will add actual analysis
    await this.prisma.mediaAsset.update({
      where: { id: mediaAssetId },
      data: { isProcessed: true },
    });

    return { status: 'analyzed', mediaAssetId };
  }

  async createClip(userId: string, dto: CreateClipDto) {
    const mediaAsset = await this.getMediaAsset(userId, dto.mediaAssetId);

    if (dto.endTimeSeconds <= dto.startTimeSeconds) {
      throw new BadRequestException('End time must be after start time');
    }

    const clip = await this.prisma.clip.create({
      data: {
        mediaAssetId: dto.mediaAssetId,
        userId,
        title: dto.title,
        description: dto.description,
        startTimeSeconds: dto.startTimeSeconds,
        endTimeSeconds: dto.endTimeSeconds,
        durationSeconds: dto.endTimeSeconds - dto.startTimeSeconds,
        autoCaption: dto.autoCaption,
        hashtags: dto.hashtags || [],
      },
    });

    return clip;
  }

  async getClip(userId: string, clipId: string) {
    const clip = await this.prisma.clip.findUnique({
      where: { id: clipId },
      include: { clipAssets: true, publishingJobs: true },
    });

    if (!clip) throw new NotFoundException('Clip not found');
    if (clip.userId !== userId) throw new BadRequestException('Unauthorized');

    return clip;
  }

  async extractClip(userId: string, clipId: string) {
    const clip = await this.getClip(userId, clipId);

    try {
      // Extract video using FFmpeg (with GPU acceleration)
      const extractedPath = await this.videoExtractor.extractClip(
        clip.mediaAsset.filePath || clip.mediaAsset.sourceUrl,
        clip.startTimeSeconds,
        clip.endTimeSeconds,
      );

      // Update clip status
      await this.prisma.clip.update({
        where: { id: clipId },
        data: { isExtracted: true },
      });

      return { status: 'extracted', clipPath: extractedPath };
    } catch (error) {
      await this.prisma.clip.update({
        where: { id: clipId },
        data: { extractionError: error.message },
      });
      throw error;
    }
  }

  async publishClip(userId: string, clipId: string, dto: PublishClipDto) {
    const clip = await this.getClip(userId, clipId);

    if (!clip.isExtracted) {
      throw new BadRequestException('Clip must be extracted before publishing');
    }

    const publishingJob = await this.prisma.clipPublishingJob.create({
      data: {
        clipId,
        platform: dto.platform,
        status: dto.scheduledAt ? PublishingJobStatus.SCHEDULED : PublishingJobStatus.PENDING,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
    });

    // For Phase 1, immediately publish to Discord if platform is DISCORD
    if (dto.platform === ClipPlatform.DISCORD && !dto.scheduledAt) {
      await this.publishToDiscord(publishingJob);
    }

    return publishingJob;
  }

  private async publishToDiscord(publishingJob: any) {
    try {
      const clip = await this.prisma.clip.findUnique({ where: { id: publishingJob.clipId } });
      // Discord publishing logic
      await this.discordPublisher.publishClip(clip);

      await this.prisma.clipPublishingJob.update({
        where: { id: publishingJob.id },
        data: {
          status: PublishingJobStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.clipPublishingJob.update({
        where: { id: publishingJob.id },
        data: {
          status: PublishingJobStatus.FAILED,
          errorMessage: error.message,
        },
      });
    }
  }

  async getPublishingJobs(userId: string, clipId: string) {
    const clip = await this.getClip(userId, clipId);
    return this.prisma.clipPublishingJob.findMany({
      where: { clipId },
    });
  }
}
