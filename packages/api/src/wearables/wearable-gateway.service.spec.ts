import { ConfigService } from '@nestjs/config';
import { WearableGatewayService } from './wearable-gateway.service';

describe('WearableGatewayService', () => {
  const config = new ConfigService({
    WEARABLES_ENABLED: 'true',
    META_RAYBAN_ENABLED: 'true',
    WEARABLE_DISCORD_ENABLED: 'false',
  });

  it('reports feature flags and supported adapters', () => {
    const service = new WearableGatewayService(config);
    expect(service.health()).toEqual({
      status: 'ok',
      enabled: true,
      adapters: ['simulator', 'meta-rayban'],
      discordEnabled: false,
    });
  });

  it('normalizes simulator events into WISE2 wearable events', () => {
    const service = new WearableGatewayService(config);
    const event = service.ingest({
      source: 'simulator',
      type: 'equipment_observation',
      userId: 'tech-1',
      jobId: 'job-1',
      payload: { model: 'YSC060', confidence: 0.92 },
    });

    expect(event.id).toMatch(/^wear_/);
    expect(event.source).toBe('simulator');
    expect(event.type).toBe('equipment_observation');
    expect(event.userId).toBe('tech-1');
    expect(event.jobId).toBe('job-1');
    expect(event.payload).toEqual({ model: 'YSC060', confidence: 0.92 });
    expect(new Date(event.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('rejects ingest when wearables are disabled', () => {
    const disabled = new WearableGatewayService(
      new ConfigService({ WEARABLES_ENABLED: 'false' }),
    );

    expect(() =>
      disabled.ingest({
        source: 'simulator',
        type: 'field_note',
        userId: 'tech-1',
        payload: {},
      }),
    ).toThrow('WISE2 wearables are disabled');
  });
});
