import { Test, TestingModule } from '@nestjs/testing';
import { ImageValidatorService } from './image-validator.service';
import type { ImageProviderResponse } from './image.types';

describe('ImageValidatorService', () => {
  let service: ImageValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageValidatorService],
    }).compile();

    service = module.get<ImageValidatorService>(ImageValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('validates a successful response with all locked assets preserved', () => {
      const lockedIds = ['person-1', 'logo-1'];
      const response: ImageProviderResponse = {
        imageUrl: 'https://x/out.png',
        provider: 'test',
        preservedReferenceIds: ['person-1', 'logo-1'],
      };

      const result = service.validate(lockedIds, response);

      expect(result.imageUrl).toBe('https://x/out.png');
      expect(result.provider).toBe('test');
    });

    it('rejects a result that reports a missing locked asset', () => {
      const lockedIds = ['person-1', 'logo-1'];
      const response: ImageProviderResponse = {
        imageUrl: 'https://x/out.png',
        provider: 'test',
        preservedReferenceIds: [], // Missing locked IDs
      };

      expect(() => service.validate(lockedIds, response)).toThrow(
        /locked reference preservation failed/i,
      );
    });

    it('accepts a response with preservationGuaranteed flag even if IDs not listed', () => {
      const lockedIds = ['person-1'];
      const response: ImageProviderResponse = {
        imageUrl: 'https://x/out.png',
        provider: 'test',
        preservationGuaranteed: true,
      };

      const result = service.validate(lockedIds, response);

      expect(result.imageUrl).toBe('https://x/out.png');
    });

    it('accepts response with no locked assets to validate', () => {
      const response: ImageProviderResponse = {
        imageUrl: 'https://x/out.png',
        provider: 'test',
      };

      const result = service.validate([], response);

      expect(result.imageUrl).toBe('https://x/out.png');
    });

    it('rejects response without imageUrl', () => {
      const response: ImageProviderResponse = {
        imageUrl: '',
        provider: 'test',
      };

      expect(() => service.validate([], response)).toThrow(
        /imageUrl/i,
      );
    });

    it('treats missing preservation metadata as failure when locked assets exist', () => {
      const lockedIds = ['person-1'];
      const response: ImageProviderResponse = {
        imageUrl: 'https://x/out.png',
        provider: 'test',
        // No preservedReferenceIds or preservationGuaranteed
      };

      expect(() => service.validate(lockedIds, response)).toThrow();
    });

    it('validates partial lock preservation (subset of required IDs)', () => {
      const lockedIds = ['person-1', 'logo-1', 'hardware-1'];
      const response: ImageProviderResponse = {
        imageUrl: 'https://x/out.png',
        provider: 'test',
        preservedReferenceIds: ['person-1', 'logo-1'], // Missing hardware-1
      };

      expect(() => service.validate(lockedIds, response)).toThrow();
    });
  });
});
