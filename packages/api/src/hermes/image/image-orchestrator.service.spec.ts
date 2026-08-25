import { Test, TestingModule } from '@nestjs/testing';
import { ImageOrchestratorService } from './image-orchestrator.service';
import { ImageLockService } from './image-lock.service';
import { ImagePromptService } from './image-prompt.service';
import { ImageProviderService } from './image-provider.service';
import { ImageValidatorService } from './image-validator.service';
import type { HermesImageRequest } from './image.types';

describe('ImageOrchestratorService', () => {
  let service: ImageOrchestratorService;
  let lockService: ImageLockService;
  let promptService: ImagePromptService;
  let providerService: ImageProviderService;
  let validatorService: ImageValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageOrchestratorService,
        ImageLockService,
        ImagePromptService,
        {
          provide: ImageProviderService,
          useValue: {
            generate: jest.fn(),
          },
        },
        ImageValidatorService,
      ],
    }).compile();

    service = module.get<ImageOrchestratorService>(ImageOrchestratorService);
    lockService = module.get<ImageLockService>(ImageLockService);
    promptService = module.get<ImagePromptService>(ImagePromptService);
    providerService = module.get<ImageProviderService>(ImageProviderService);
    validatorService = module.get<ImageValidatorService>(ImageValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('orchestrates full workflow: normalize -> build -> generate -> validate', async () => {
      const request: HermesImageRequest = {
        instruction: 'Add blue gauges',
        references: [
          {
            id: 'master',
            url: 'https://x/master.png',
            kind: 'approved-art',
          },
        ],
        aspectRatio: '16:9',
      };

      jest.spyOn(providerService, 'generate').mockResolvedValue({
        imageUrl: 'https://x/output.png',
        provider: 'test',
        preservedReferenceIds: ['master'],
      });

      const result = await service.generate(request);

      expect(result.status).toBe('completed');
      expect(result.imageUrl).toBe('https://x/output.png');
      expect(result.lockedAssetIds).toContain('master');
      expect(result.instruction).toBe('Add blue gauges');
    });

    it('returns failed status on provider error', async () => {
      const request: HermesImageRequest = {
        instruction: 'test',
        references: [],
      };

      jest
        .spyOn(providerService, 'generate')
        .mockRejectedValue(new Error('Provider unavailable'));

      const result = await service.generate(request);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Provider unavailable');
      expect(result.imageUrl).toBeUndefined();
    });

    it('returns failed status on validator error', async () => {
      const request: HermesImageRequest = {
        instruction: 'test',
        references: [
          { id: 'lock1', url: 'https://x/l.png', kind: 'person' },
        ],
      };

      jest.spyOn(providerService, 'generate').mockResolvedValue({
        imageUrl: 'https://x/output.png',
        provider: 'test',
        preservedReferenceIds: [], // Missing lock1
      });

      const result = await service.generate(request);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('locked reference preservation failed');
    });

    it('assigns unique jobId to each result', async () => {
      const request: HermesImageRequest = {
        instruction: 'test',
        references: [],
      };

      jest.spyOn(providerService, 'generate').mockResolvedValue({
        imageUrl: 'https://x/1.png',
        provider: 'test',
      });

      const result1 = await service.generate(request);
      const result2 = await service.generate(request);

      expect(result1.jobId).not.toBe(result2.jobId);
    });

    it('includes locked asset count in result', async () => {
      const request: HermesImageRequest = {
        instruction: 'test',
        references: [
          { id: 'lock1', url: 'https://x/l1.png', kind: 'person' },
          { id: 'lock2', url: 'https://x/l2.png', kind: 'logo' },
          { id: 'edit1', url: 'https://x/e1.png', role: 'EDITABLE' },
        ],
      };

      jest.spyOn(providerService, 'generate').mockResolvedValue({
        imageUrl: 'https://x/output.png',
        provider: 'test',
        preservedReferenceIds: ['lock1', 'lock2'],
      });

      const result = await service.generate(request);

      expect(result.lockedAssetIds.length).toBe(2);
      expect(result.lockedAssetIds).toContain('lock1');
      expect(result.lockedAssetIds).toContain('lock2');
    });

    it('uses default aspectRatio if not specified', async () => {
      const request: HermesImageRequest = {
        instruction: 'test',
        references: [],
      };

      let capturedRequest: any;
      jest.spyOn(providerService, 'generate').mockImplementation((req) => {
        capturedRequest = req;
        return Promise.resolve({
          imageUrl: 'https://x/out.png',
          provider: 'test',
        });
      });

      await service.generate(request);

      expect(capturedRequest.aspectRatio).toBe('16:9');
    });

    it('preserves instruction text in result', async () => {
      const instruction = 'Keep the HVAC system locked. Add new temperature gauges.';
      const request: HermesImageRequest = {
        instruction,
        references: [],
      };

      jest.spyOn(providerService, 'generate').mockResolvedValue({
        imageUrl: 'https://x/out.png',
        provider: 'test',
      });

      const result = await service.generate(request);

      expect(result.instruction).toBe(instruction);
    });
  });
});
