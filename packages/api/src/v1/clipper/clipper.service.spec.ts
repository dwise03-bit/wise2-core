import { Test, TestingModule } from '@nestjs/testing';
import { ClipperService } from './clipper.service';
import { PrismaService } from '@shared/prisma';
import { VideoExtractorService } from './video-extractor.service';
import { MomentDetectionService } from './moment-detection.service';
import { TranscriptionService } from './transcription.service';
import { PublishingCoordinatorService } from './publishing-coordinator.service';

describe('ClipperService', () => {
  let service: ClipperService;
  let prismaService: PrismaService;
  let videoExtractor: VideoExtractorService;

  const mockPrismaService = {
    mediaAsset: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    clip: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockVideoExtractor = {
    extractClip: jest.fn(),
    getVideoMetadata: jest.fn(),
  };

  const mockMomentDetection = {
    detectMomentsInMedia: jest.fn(),
  };

  const mockTranscription = {
    transcribeAudio: jest.fn(),
  };

  const mockPublishingCoordinator = {
    publishToMultiplePlatforms: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClipperService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: VideoExtractorService,
          useValue: mockVideoExtractor,
        },
        {
          provide: MomentDetectionService,
          useValue: mockMomentDetection,
        },
        {
          provide: TranscriptionService,
          useValue: mockTranscription,
        },
        {
          provide: PublishingCoordinatorService,
          useValue: mockPublishingCoordinator,
        },
      ],
    }).compile();

    service = module.get<ClipperService>(ClipperService);
    prismaService = module.get<PrismaService>(PrismaService);
    videoExtractor = module.get<VideoExtractorService>(VideoExtractorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMediaAsset', () => {
    it('should create a media asset', async () => {
      const userId = 'user-123';
      const dto = {
        title: 'Test Video',
        sourceUrl: 'https://example.com/video.mp4',
        sourceType: 'UPLOAD' as const,
      };

      mockPrismaService.mediaAsset.create.mockResolvedValue({
        id: 'media-123',
        userId,
        ...dto,
      });

      const result = await service.createMediaAsset(userId, dto);

      expect(result.id).toBe('media-123');
      expect(result.title).toBe('Test Video');
      expect(mockPrismaService.mediaAsset.create).toHaveBeenCalled();
    });
  });

  describe('createClip', () => {
    it('should create a clip with engagement score', async () => {
      const userId = 'user-123';
      const dto = {
        mediaAssetId: 'media-123',
        title: 'Funny Moment',
        startTimeSeconds: 10,
        endTimeSeconds: 25,
      };

      mockPrismaService.mediaAsset.findUnique.mockResolvedValue({
        id: 'media-123',
        userId,
      });

      const clipData = {
        id: 'clip-123',
        ...dto,
        userId,
        durationSeconds: 15,
        engagementScore: 85,
      };

      mockPrismaService.clip.create.mockResolvedValue(clipData);

      const result = await service.createClip(userId, dto);

      expect(result.id).toBe('clip-123');
      expect(result.engagementScore).toBeGreaterThanOrEqual(0);
      expect(result.engagementScore).toBeLessThanOrEqual(100);
    });
  });

  describe('extractClip', () => {
    it('should extract clip using FFmpeg', async () => {
      const userId = 'user-123';
      const clipId = 'clip-123';
      const mockClip = {
        id: clipId,
        userId,
        startTimeSeconds: 10,
        endTimeSeconds: 25,
        mediaAsset: {
          filePath: '/path/to/video.mp4',
        },
      };

      mockPrismaService.clip.findUnique.mockResolvedValue(mockClip);
      mockVideoExtractor.extractClip.mockResolvedValue({
        file: '/output/clip.mp4',
        duration: 15,
      });

      const result = await service.extractClip(userId, clipId);

      expect(result.status).toBe('extracted');
      expect(mockVideoExtractor.extractClip).toHaveBeenCalled();
    });
  });

  describe('getSuggestedClips', () => {
    it('should return suggested clips based on moments', async () => {
      const userId = 'user-123';
      const mediaAssetId = 'media-123';

      mockPrismaService.mediaAsset.findUnique.mockResolvedValue({
        id: mediaAssetId,
        userId,
      });

      mockMomentDetection.detectMomentsInMedia.mockResolvedValue([
        { type: 'LAUGHTER', confidence: 0.95, startTime: 10, endTime: 15 },
        { type: 'APPLAUSE', confidence: 0.88, startTime: 45, endTime: 50 },
      ]);

      const result = await service.getSuggestedClips(userId, mediaAssetId);

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });
});
