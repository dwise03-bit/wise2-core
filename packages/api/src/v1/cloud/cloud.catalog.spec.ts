import { ConfigService } from '@nestjs/config';
import { getCloudPlans } from './cloud.catalog';

describe('WISE² Cloud production catalog', () => {
  it('uses the approved regional launch pricing', () => {
    const config = {
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;

    expect(
      getCloudPlans(config).map(({ id, name, priceMonthly }) => ({ id, name, priceMonthly })),
    ).toEqual([
      { id: 'starter', name: 'Starter', priceMonthly: 29 },
      { id: 'business', name: 'Business', priceMonthly: 49 },
      { id: 'pro', name: 'Pro', priceMonthly: 79 },
    ]);
  });
});
