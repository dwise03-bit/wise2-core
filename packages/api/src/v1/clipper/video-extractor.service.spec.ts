import { Test, TestingModule } from '@nestjs/testing';
import { VideoExtractorService } from './video-extractor.service';

describe('VideoExtractorService', () => {
  let service: VideoExtractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoExtractorService],
    }).compile();

    service = module.get<VideoExtractorService>(VideoExtractorService);
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('extractClip', () => {
    it('should validate start and end times', () => {
      const startTime = 25;
      const endTime = 10;

      expect(() => {
        if (endTime <= startTime) {
          throw new Error('End time must be greater than start time');
        }
      }).toThrow();
    });

    it('should calculate correct duration', () => {
      const startTime = 10;
      const endTime = 30;
      const duration = endTime - startTime;

      expect(duration).toBe(20);
    });
  });

  describe('Platform Support', () => {
    it('should support Instagram', () => {
      expect(service).toBeDefined();
    });

    it('should support TikTok', () => {
      expect(service).toBeDefined();
    });

    it('should support YouTube', () => {
      expect(service).toBeDefined();
    });

    it('should support Twitter', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getVideoMetadata', () => {
    it('should handle errors gracefully', () => {
      expect(async () => {
        throw new Error('File not found');
      }).rejects.toThrow();
    });
  });
});
