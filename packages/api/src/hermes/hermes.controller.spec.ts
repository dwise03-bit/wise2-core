import { Test, TestingModule } from '@nestjs/testing';
import { HermesController } from './hermes.controller';
import { HermesService } from './hermes.service';
import { ImageOrchestratorService } from './image/image-orchestrator.service';
import type { HermesImageRequestDto } from './hermes.dto';
import type { HermesImageResult } from './image/image.types';

describe('HermesController', () => {
  let controller: HermesController;
  let hermesService: HermesService;
  let imageOrchestrator: ImageOrchestratorService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HermesController],
      providers: [
        {
          provide: HermesService,
          useValue: {
            getDailyBrief: jest.fn(),
            chat: jest.fn(),
            createAction: jest.fn(),
            listActions: jest.fn(),
            getAction: jest.fn(),
            approveAction: jest.fn(),
            rejectAction: jest.fn(),
          },
        },
        {
          provide: ImageOrchestratorService,
          useValue: {
            generate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HermesController>(HermesController);
    hermesService = module.get<HermesService>(HermesService);
    imageOrchestrator = module.get<ImageOrchestratorService>(
      ImageOrchestratorService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateImage', () => {
    it('calls imageOrchestrator.generate with request data', async () => {
      const dto: HermesImageRequestDto = {
        instruction: 'Add blue gauges to dashboard',
        references: [
          {
            id: 'master',
            url: 'https://x/master.png',
            kind: 'approved-art',
          },
        ],
        aspectRatio: '16:9',
      };

      const result: HermesImageResult = {
        jobId: 'job-123',
        status: 'completed',
        imageUrl: 'https://x/output.png',
        provider: 'test',
        lockedAssetIds: ['master'],
        instruction: 'Add blue gauges to dashboard',
      };

      jest.spyOn(imageOrchestrator, 'generate').mockResolvedValue(result);

      const response = await controller.generateImage(mockUser, dto);

      expect(imageOrchestrator.generate).toHaveBeenCalledWith({
        instruction: dto.instruction,
        references: dto.references,
        aspectRatio: dto.aspectRatio,
      });

      expect(response).toEqual(result);
    });

    it('returns failed result on orchestrator error', async () => {
      const dto: HermesImageRequestDto = {
        instruction: 'test',
        references: [],
      };

      const failedResult: HermesImageResult = {
        jobId: 'job-456',
        status: 'failed',
        lockedAssetIds: [],
        instruction: 'test',
        error: 'Provider unavailable',
      };

      jest
        .spyOn(imageOrchestrator, 'generate')
        .mockResolvedValue(failedResult);

      const response = await controller.generateImage(mockUser, dto);

      expect(response.status).toBe('failed');
      expect(response.error).toBe('Provider unavailable');
    });

    it('preserves reference metadata through request', async () => {
      const dto: HermesImageRequestDto = {
        instruction: 'Keep HVAC locked, update gauges',
        references: [
          {
            id: 'hvac-1',
            url: 'https://x/hvac.png',
            kind: 'hardware',
          },
          {
            id: 'gauge-1',
            url: 'https://x/gauge.png',
            kind: 'logo',
          },
        ],
        aspectRatio: '9:16',
      };

      const result: HermesImageResult = {
        jobId: 'job-789',
        status: 'completed',
        imageUrl: 'https://x/result.png',
        provider: 'test',
        lockedAssetIds: ['hvac-1'],
        instruction: dto.instruction,
      };

      jest.spyOn(imageOrchestrator, 'generate').mockResolvedValue(result);

      await controller.generateImage(mockUser, dto);

      expect(imageOrchestrator.generate).toHaveBeenCalledWith({
        instruction: dto.instruction,
        references: dto.references,
        aspectRatio: dto.aspectRatio,
      });
    });

    it('uses default aspectRatio from orchestrator if not provided', async () => {
      const dto: HermesImageRequestDto = {
        instruction: 'test',
        references: [],
      };

      const result: HermesImageResult = {
        jobId: 'job-000',
        status: 'completed',
        imageUrl: 'https://x/out.png',
        provider: 'test',
        lockedAssetIds: [],
        instruction: 'test',
      };

      jest.spyOn(imageOrchestrator, 'generate').mockResolvedValue(result);

      await controller.generateImage(mockUser, dto);

      expect(imageOrchestrator.generate).toHaveBeenCalledWith({
        instruction: dto.instruction,
        references: dto.references,
        aspectRatio: undefined,
      });
    });
  });
});
