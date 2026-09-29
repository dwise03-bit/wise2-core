import { MockReaperAdapter, StudioService } from './contracts';

describe('StudioService', () => {
  const service = new StudioService(new MockReaperAdapter());

  it('controls transport and recording through the adapter', async () => {
    expect((await service.transport('play')).transport).toBe('playing');
    expect((await service.transport('record')).recording).toBe(true);
    expect((await service.transport('stop')).recording).toBe(false);
  });

  it('validates marker names and track identifiers', async () => {
    await expect(service.marker('')).rejects.toThrow('Marker name');
    await expect(service.setTrack(0, 'mute')).rejects.toThrow('positive');
    await expect(service.marker('TEST HOOK')).resolves.toMatchObject({ name: 'TEST HOOK' });
  });
});
