import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';
import { CreateMediaDto } from './dtos/create-media.dto';
import { CreateClipDto } from './dtos/create-clip.dto';
import { PublishClipDto } from './dtos/publish-clip.dto';
import { VideoExtractorService } from './video-extractor.service';
import { DiscordPublisherService } from './discord-publisher.service';
import { MomentDetectionService } from './moment-detection.service';
import { TranscriptionService } from './transcription.service';
import { CaptionGeneratorService } from './caption-generator.service';
import { ClipPlatform, PublishingJobStatus } from '@prisma/client';

@Injectable()
export class ClipperService {
  constructor(
    private prisma: PrismaService,
    private videoExtractor: VideoExtractorService,
    private discordPublisher: DiscordPublisherService,
    private momentDetection: MomentDetectionService,
    private transcription: TranscriptionService,
    private captionGenerator: CaptionGeneratorService,
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

    // Phase 2: Detect moments in media
    const moments = await this.momentDetection.detectMomentsInMedia(mediaAssetId);

    // Phase 2: Transcribe audio
    const transcript = await this.transcription.transcribeAudio(
      mediaAsset.filePath || mediaAsset.sourceUrl || '',
    );

    // Update media asset with processed status
    await this.prisma.mediaAsset.update({
      where: { id: mediaAssetId },
      data: {
        isProcessed: true,
        durationSeconds: Math.floor(transcript.duration),
      },
    });

    return {
      status: 'analyzed',
      mediaAssetId,
      detectedMoments: moments.length,
      transcriptSegments: transcript.segments.length,
      detectedLanguage: transcript.language,
    };
  }

  async createClip(userId: string, dto: CreateClipDto) {
    const mediaAsset = await this.getMediaAsset(userId, dto.mediaAssetId);

    if (dto.endTimeSeconds <= dto.startTimeSeconds) {
      throw new BadRequestException('End time must be after start time');
    }

    const durationSeconds = dto.endTimeSeconds - dto.startTimeSeconds;

    // Phase 2: Score clip quality based on detected moments
    const engagementScore = await this.momentDetection.scoreClipQuality(
      dto.mediaAssetId,
      dto.startTimeSeconds,
      dto.endTimeSeconds,
    );

    // Phase 2: Auto-generate caption from transcript if not provided
    let autoCaption = dto.autoCaption;
    if (!autoCaption) {
      try {
        const transcript = await this.transcription.transcribeAudio(
          mediaAsset.filePath || mediaAsset.sourceUrl || '',
        );
        autoCaption = await this.captionGenerator.generateClipCaption(
          transcript,
          dto.startTimeSeconds,
          dto.endTimeSeconds,
        );
      } catch (error) {
        // If transcription fails, use provided caption or default
        autoCaption = dto.autoCaption || 'Check this out!';
      }
    }

    const clip = await this.prisma.clip.create({
      data: {
        mediaAssetId: dto.mediaAssetId,
        userId,
        title: dto.title,
        description: dto.description,
        startTimeSeconds: dto.startTimeSeconds,
        endTimeSeconds: dto.endTimeSeconds,
        durationSeconds,
        engagementScore,
        autoCaption,
        hashtags: dto.hashtags || [],
      },
    });

    return clip;
  }

  async getClip(userId: string, clipId: string) {
    const clip = await this.prisma.clip.findUnique({
      where: { id: clipId },
      include: { clipAssets: true, publishingJobs: true, mediaAsset: true },
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
        clip.mediaAsset.filePath || clip.mediaAsset.sourceUrl || '',
        clip.startTimeSeconds,
        clip.endTimeSeconds,
      );

      // Update clip status
      await this.prisma.clip.update({
        where: { id: clipId },
        data: { isExtracted: true },
      });

      return { status: 'extracted', clipPath: extractedPath };
    } catch (error: any) {
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
    } catch (error: any) {
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

  async getSuggestedClips(userId: string, mediaAssetId: string, minDuration = 15, maxDuration = 60) {
    const mediaAsset = await this.getMediaAsset(userId, mediaAssetId);

    // Get all detected moments
    const moments = await this.prisma.clipMoment.findMany({
      where: { mediaAssetId },
      orderBy: { timestampSeconds: 'asc' },
    });

    if (moments.length === 0) {
      return { suggestions: [] };
    }

    // Group moments into clusters (clips)
    const clips: Array<{ startTime: number; endTime: number; moments: any[] }> = [];
    let currentCluster: any[] = [];
    let clusterStart = moments[0].timestampSeconds;

    for (const moment of moments) {
      // If moment is far from last one, start new cluster
      if (moment.timestampSeconds - (currentCluster[currentCluster.length - 1]?.timestampSeconds || clusterStart) > maxDuration) {
        if (currentCluster.length > 0) {
          clips.push({
            startTime: clusterStart,
            endTime: currentCluster[currentCluster.length - 1].timestampSeconds + 5, // Add 5s buffer
            moments: currentCluster,
          });
        }
        currentCluster = [moment];
        clusterStart = moment.timestampSeconds;
      } else {
        currentCluster.push(moment);
      }
    }

    // Add last cluster
    if (currentCluster.length > 0) {
      clips.push({
        startTime: clusterStart,
        endTime: currentCluster[currentCluster.length - 1].timestampSeconds + 5,
        moments: currentCluster,
      });
    }

    // Filter clips by duration and score
    const suggestions = clips
      .filter(clip => {
        const duration = clip.endTime - clip.startTime;
        return duration >= minDuration && duration <= maxDuration;
      })
      .map((clip, index) => ({
        id: `suggested-${mediaAssetId}-${index}`,
        mediaAssetId,
        title: `Suggested Clip ${index + 1}`,
        startTimeSeconds: Math.max(0, clip.startTime - 2), // Add 2s buffer
        endTimeSeconds: clip.endTime,
        durationSeconds: clip.endTime - clip.startTime,
        momentCount: clip.moments.length,
        momentTypes: [...new Set(clip.moments.map(m => m.momentType))],
      }));

    return {
      suggestions,
      totalMomentsDetected: moments.length,
    };
  }
}
