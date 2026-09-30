import { Test, TestingModule } from '@nestjs/testing';
import { PublishingCoordinatorService } from './publishing-coordinator.service';
import { PrismaService } from '@shared/prisma';
import { InstagramPublisher } from './publishers/instagram-publisher';
import { TikTokPublisher } from './publishers/tiktok-publisher';
import { YouTubePublisher } from './publishers/youtube-publisher';
import { TwitterPublisher } from './publishers/twitter-publisher';
import { DiscordPublisherService } from './discord-publisher.service';
import { VideoExtractorService } from './video-extractor.service';
import { ClipPlatform, PublishingJobStatus } from '@prisma/client';

describe('PublishingCoordinatorService', () => {
  let service: PublishingCoordinatorService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    clip: {
      findUnique: jest.fn(),
    },
    clipPublishingJob: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPublishers = {
    instagram: { publishClip: jest.fn() },
    tiktok: { publishClip: jest.fn() },
    youtube: { publishClip: jest.fn() },
    twitter: { publishClip: jest.fn() },
  };

  const mockDiscordPublisher = {
    publishClip: jest.fn(),
  };

  const mockVideoExtractor = {
    optimizeForPlatform: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishingCoordinatorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: InstagramPublisher,
          useValue: mockPublishers.instagram,
        },
        {
          provide: TikTokPublisher,
          useValue: mockPublishers.tiktok,
        },
        {
          provide: YouTubePublisher,
          useValue: mockPublishers.youtube,
        },
        {
          provide: TwitterPublisher,
          useValue: mockPublishers.twitter,
        },
        {
          provide: DiscordPublisherService,
          useValue: mockDiscordPublisher,
        },
        {
          provide: VideoExtractorService,
          useValue: mockVideoExtractor,
        },
      ],
    }).compile();

    service = module.get<PublishingCoordinatorService>(
      PublishingCoordinatorService,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publishToMultiplePlatforms', () => {
    it('should create publishing jobs for each platform', async () => {
      const clipId = 'clip-123';
      const platforms = [
        ClipPlatform.INSTAGRAM,
        ClipPlatform.TIKTOK,
        ClipPlatform.YOUTUBE,
      ];

      mockPrismaService.clip.findUnique.mockResolvedValue({
        id: clipId,
        title: 'Test Clip',
        clipAssets: [],
        mediaAsset: { filePath: '/video.mp4' },
      });

      mockPrismaService.clipPublishingJob.create.mockResolvedValue({});
      mockVideoExtractor.optimizeForPlatform.mockResolvedValue({
        file: '/optimized.mp4',
      });

      for (const publisher of Object.values(mockPublishers)) {
        publisher.publishClip.mockResolvedValue({
          success: true,
          platformUrl: 'https://example.com/post',
          platformPostId: 'post-123',
        });
      }

      await service.publishToMultiplePlatforms(clipId, platforms);

      expect(mockPrismaService.clipPublishingJob.create).toHaveBeenCalledTimes(
        platforms.length,
      );
    });

    it('should handle scheduled publishing', async () => {
      const clipId = 'clip-123';
      const platforms = [ClipPlatform.INSTAGRAM];
      const scheduledAt = new Date(Date.now() + 3600000);

      mockPrismaService.clip.findUnique.mockResolvedValue({
        id: clipId,
        title: 'Test Clip',
        clipAssets: [],
        mediaAsset: { filePath: '/video.mp4' },
      });

      await service.publishToMultiplePlatforms(
        clipId,
        platforms,
        scheduledAt,
      );

      expect(mockPrismaService.clipPublishingJob.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PublishingJobStatus.SCHEDULED,
            scheduledAt,
          }),
        }),
      );
    });
  });

  describe('getPublishingStatus', () => {
    it('should aggregate status across all platforms', async () => {
      const clipId = 'clip-123';
      const jobs = [
        {
          id: 'job-1',
          platform: ClipPlatform.INSTAGRAM,
          status: PublishingJobStatus.PUBLISHED,
        },
        {
          id: 'job-2',
          platform: ClipPlatform.TIKTOK,
          status: PublishingJobStatus.PENDING,
        },
        {
          id: 'job-3',
          platform: ClipPlatform.YOUTUBE,
          status: PublishingJobStatus.FAILED,
        },
      ];

      mockPrismaService.clipPublishingJob.findMany.mockResolvedValue(jobs);

      const result = await service.getPublishingStatus(clipId);

      expect(result.total).toBe(3);
      expect(result.published).toBe(1);
      expect(result.pending).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('retryFailedJobs', () => {
    it('should reset failed jobs to pending status', async () => {
      const clipId = 'clip-123';
      const failedJobs = [
        { id: 'job-1', retryCount: 0, status: PublishingJobStatus.FAILED },
        { id: 'job-2', retryCount: 1, status: PublishingJobStatus.FAILED },
      ];

      mockPrismaService.clipPublishingJob.findMany.mockResolvedValue(
        failedJobs,
      );
      mockPrismaService.clip.findUnique.mockResolvedValue({
        id: clipId,
        title: 'Test',
        clipAssets: [],
        mediaAsset: { filePath: '/video.mp4' },
      });
      mockVideoExtractor.optimizeForPlatform.mockResolvedValue({
        file: '/optimized.mp4',
      });

      for (const publisher of Object.values(mockPublishers)) {
        publisher.publishClip.mockResolvedValue({
          success: true,
          platformUrl: 'https://example.com/post',
          platformPostId: 'post-123',
        });
      }

      await service.retryFailedJobs(clipId);

      expect(mockPrismaService.clipPublishingJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1' },
          data: { status: PublishingJobStatus.PENDING },
        }),
      );
    });

    it('should not retry jobs that exceed max retries', async () => {
      const clipId = 'clip-123';
      const maxedOutJob = {
        id: 'job-1',
        retryCount: 3,
        status: PublishingJobStatus.FAILED,
      };

      mockPrismaService.clipPublishingJob.findMany.mockResolvedValue([]);

      await service.retryFailedJobs(clipId);

      // Should not find jobs with retryCount >= 3
      expect(mockPrismaService.clipPublishingJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            retryCount: { lt: 3 },
          }),
        }),
      );
    });
  });
});
