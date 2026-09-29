import { Test, TestingModule } from '@nestjs/testing';
import { ImageProviderService } from './image-provider.service';
import type { ImageProviderRequest } from './image.types';

describe('ImageProviderService', () => {
  let service: ImageProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProviderService],
    }).compile();

    service = module.get<ImageProviderService>(ImageProviderService);

    // Mock fetch globally for tests
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('throws if backend is not configured', async () => {
      jest.spyOn(service, 'isConfigured').mockReturnValue(false);

      const request: ImageProviderRequest = {
        prompt: 'test',
        references: [],
        aspectRatio: '16:9',
      };

      await expect(service.generate(request)).rejects.toThrow(
        'Hermes image backend is not configured',
      );
    });

    it('calls the backend with proper payload structure', async () => {
      jest.spyOn(service, 'isConfigured').mockReturnValue(true);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          imageUrl: 'https://result/img.png',
          provider: 'test-provider',
          preservedReferenceIds: ['ref1'],
        }),
      });

      const request: ImageProviderRequest = {
        prompt: 'test prompt',
        references: [
          {
            id: 'ref1',
            url: 'https://x/ref1.png',
            role: 'LOCKED',
            kind: 'person',
          },
        ],
        aspectRatio: '16:9',
      };

      const result = await service.generate(request);

      expect(result.imageUrl).toBe('https://result/img.png');
      expect(result.provider).toBe('test-provider');
    });

    it('normalizes successful response to standard format', async () => {
      jest.spyOn(service, 'isConfigured').mockReturnValue(true);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          imageUrl: 'https://api/output.png',
          provider: 'custom-backend',
        }),
      });

      const request: ImageProviderRequest = {
        prompt: 'test',
        references: [],
        aspectRatio: '16:9',
      };

      const result = await service.generate(request);

      expect(result).toHaveProperty('imageUrl');
      expect(result).toHaveProperty('provider');
      expect(typeof result.imageUrl).toBe('string');
      expect(typeof result.provider).toBe('string');
    });

    it('rejects response without imageUrl', async () => {
      jest.spyOn(service, 'isConfigured').mockReturnValue(true);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          provider: 'test',
          // missing imageUrl
        }),
      });

      const request: ImageProviderRequest = {
        prompt: 'test',
        references: [],
        aspectRatio: '16:9',
      };

      await expect(service.generate(request)).rejects.toThrow();
    });

    it('throws on HTTP error from backend', async () => {
      jest.spyOn(service, 'isConfigured').mockReturnValue(true);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Backend error'));

      const request: ImageProviderRequest = {
        prompt: 'test',
        references: [],
        aspectRatio: '16:9',
      };

      await expect(service.generate(request)).rejects.toThrow('Backend error');
    });

    it('includes preserveLockedReferences flag in payload', async () => {
      jest.spyOn(service, 'isConfigured').mockReturnValue(true);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          imageUrl: 'https://result.png',
          provider: 'test',
        }),
      });

      const request: ImageProviderRequest = {
        prompt: 'test',
        references: [{ id: 'r1', url: 'https://x/r.png', role: 'LOCKED' }],
        aspectRatio: '16:9',
      };

      await service.generate(request);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const payload = JSON.parse((callArgs[1] as any).body);
      expect(payload).toHaveProperty('preserveLockedReferences', true);
    });
  });
});
