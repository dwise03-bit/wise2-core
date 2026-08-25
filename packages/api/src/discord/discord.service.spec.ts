import { Test, TestingModule } from '@nestjs/testing';
import { DiscordService } from './discord.service';
import { DashboardStatsService } from '../revenue-os/dashboard/dashboard-stats.service';
import { HermesService } from '../hermes/hermes.service';
import type { HermesImageResult } from '../hermes/image/image.types';

describe('DiscordService', () => {
  let service: DiscordService;
  let dashboardStatsService: DashboardStatsService;
  let hermesService: HermesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordService,
        {
          provide: DashboardStatsService,
          useValue: {
            getExecutiveKpis: jest.fn(),
            getPipelineMetrics: jest.fn(),
            getDispatchMetrics: jest.fn(),
            getAlertsPanel: jest.fn(),
          },
        },
        {
          provide: HermesService,
          useValue: {
            chat: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
    dashboardStatsService = module.get<DashboardStatsService>(DashboardStatsService);
    hermesService = module.get<HermesService>(HermesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendImageResult', () => {
    it('sends completed image result as Discord embed', async () => {
      const result: HermesImageResult = {
        jobId: 'job-123',
        status: 'completed',
        imageUrl: 'https://x/output.png',
        provider: 'test-provider',
        lockedAssetIds: ['master', 'logo'],
        instruction: 'Add blue gauges',
      };

      const sendChannelEmbedSpy = jest.spyOn(service, 'sendChannelEmbed')
        .mockResolvedValue(undefined as any);

      await service.sendImageResult(result);

      expect(sendChannelEmbedSpy).toHaveBeenCalled();
      const call = sendChannelEmbedSpy.mock.calls[0];
      expect(call[0]).toBe('images');

      const embed = call[1];
      expect(embed.title).toBe('Image Generation Result');
      expect(embed.color).toBe(0x22c55e); // green for completed
      expect(embed.image).toEqual({ url: 'https://x/output.png' });

      const fields = embed.fields as Array<{name: string; value: string}>;
      expect(fields.some(f => f.name === 'Job ID' && f.value === 'job-123')).toBe(true);
      expect(fields.some(f => f.name === 'Status' && f.value === 'COMPLETED')).toBe(true);
      expect(fields.some(f => f.name === 'Provider' && f.value === 'test-provider')).toBe(true);
      expect(fields.some(f => f.name === 'Instruction')).toBe(true);
      expect(fields.some(f => f.name === 'Locked Assets' && f.value === 'master, logo')).toBe(true);
    });

    it('sends failed result with error message', async () => {
      const result: HermesImageResult = {
        jobId: 'job-456',
        status: 'failed',
        lockedAssetIds: [],
        instruction: 'test',
        error: 'Provider unavailable',
      };

      const sendChannelEmbedSpy = jest.spyOn(service, 'sendChannelEmbed')
        .mockResolvedValue(undefined as any);

      await service.sendImageResult(result);

      const call = sendChannelEmbedSpy.mock.calls[0];
      const embed = call[1];
      expect(embed.color).toBe(0xff4d4f); // red for failed

      const fields = embed.fields as Array<{name: string; value: string}>;
      expect(fields.some(f => f.name === 'Error' && f.value === 'Provider unavailable')).toBe(true);
    });

    it('excludes image URL when status is not completed', async () => {
      const result: HermesImageResult = {
        jobId: 'job-789',
        status: 'failed',
        imageUrl: 'https://x/output.png',
        lockedAssetIds: [],
        instruction: 'test',
        error: 'failed',
      };

      const sendChannelEmbedSpy = jest.spyOn(service, 'sendChannelEmbed')
        .mockResolvedValue(undefined as any);

      await service.sendImageResult(result);

      const call = sendChannelEmbedSpy.mock.calls[0];
      const embed = call[1];
      expect(embed.image).toBeUndefined();
    });

    it('sends to specified channel', async () => {
      const result: HermesImageResult = {
        jobId: 'job-000',
        status: 'completed',
        imageUrl: 'https://x/out.png',
        provider: 'test',
        lockedAssetIds: [],
        instruction: 'test',
      };

      const sendChannelEmbedSpy = jest.spyOn(service, 'sendChannelEmbed')
        .mockResolvedValue(undefined as any);

      await service.sendImageResult(result, 'alerts');

      expect(sendChannelEmbedSpy.mock.calls[0][0]).toBe('alerts');
    });

    it('excludes missing fields from embed', async () => {
      const result: HermesImageResult = {
        jobId: 'job-111',
        status: 'pending',
        lockedAssetIds: [],
        instruction: undefined,
      };

      const sendChannelEmbedSpy = jest.spyOn(service, 'sendChannelEmbed')
        .mockResolvedValue(undefined as any);

      await service.sendImageResult(result);

      const call = sendChannelEmbedSpy.mock.calls[0];
      const embed = call[1];
      const fields = embed.fields as Array<{name: string}>;

      expect(fields.some(f => f.name === 'Instruction')).toBe(false);
      expect(fields.some(f => f.name === 'Locked Assets')).toBe(false);
      expect(fields.some(f => f.name === 'Error')).toBe(false);
    });

    it('uses pending color for pending status', async () => {
      const result: HermesImageResult = {
        jobId: 'job-222',
        status: 'pending',
        lockedAssetIds: [],
      };

      const sendChannelEmbedSpy = jest.spyOn(service, 'sendChannelEmbed')
        .mockResolvedValue(undefined as any);

      await service.sendImageResult(result);

      const call = sendChannelEmbedSpy.mock.calls[0];
      const embed = call[1];
      expect(embed.color).toBe(0xffb020); // amber for pending
    });
  });
});
