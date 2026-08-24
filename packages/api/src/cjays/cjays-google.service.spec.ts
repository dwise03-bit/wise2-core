import { BadRequestException } from '@nestjs/common';
import { CjaysGoogleService } from './cjays-google.service';

describe('CjaysGoogleService approval boundary', () => {
  const service = new CjaysGoogleService(
    { get: jest.fn(() => undefined) } as any,
    { sign: jest.fn(), verify: jest.fn() } as any,
    {} as any,
  );

  it.each(['calendar', 'drive', 'gmail'] as const)('blocks %s actions without explicit approval', async (action) => {
    const input = action === 'calendar'
      ? { approved: false, title: 'Job', startTime: new Date(Date.now()+3600000).toISOString(), endTime: new Date(Date.now()+7200000).toISOString() }
      : action === 'drive'
        ? { approved: false, name: 'job.txt', content: 'draft' }
        : { approved: false, to: 'customer@example.com', subject: 'Job', body: 'draft' };
    await expect((service[action] as any)('user-1', input)).rejects.toBeInstanceOf(BadRequestException);
  });
});
