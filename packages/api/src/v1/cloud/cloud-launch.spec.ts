import { ConfigService } from '@nestjs/config';
import { evaluateLaunchGates, isLaunchReady } from './cloud-launch';

describe('cloud launch gates', () => {
  function config(values: Record<string, string>) {
    return {
      get: (key: string) => values[key],
    } as unknown as ConfigService;
  }

  it('blocks live sales when storefront flag is false', () => {
    const gates = evaluateLaunchGates(
      config({
        CLOUD_BASE_URL: 'https://cloud.wise2.net',
        CLOUD_STRIPE_MODE: 'live',
        CLOUD_STOREFRONT_LIVE: 'false',
        STRIPE_SECRET_KEY: 'sk_live_test',
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
        STRIPE_CLOUD_STARTER_PRICE_ID: 'price_1',
        STRIPE_CLOUD_BUSINESS_PRICE_ID: 'price_2',
        STRIPE_CLOUD_PRO_PRICE_ID: 'price_3',
        TWENTYI_PACKAGE_TYPE_STARTER: '302135',
        TWENTYI_PACKAGE_TYPE_BUSINESS: '302133',
        TWENTYI_PACKAGE_TYPE_PRO: '302129',
        SENDGRID_API_KEY: 'SG.test',
      }),
      true,
    );

    expect(isLaunchReady(gates)).toBe(false);
    expect(gates.find((gate) => gate.id === 'storefront')?.status).toBe('fail');
  });

  it('passes when storefront is live and dependencies are configured', () => {
    const gates = evaluateLaunchGates(
      config({
        CLOUD_BASE_URL: 'https://cloud.wise2.net',
        CLOUD_STRIPE_MODE: 'live',
        CLOUD_STOREFRONT_LIVE: 'true',
        STRIPE_SECRET_KEY: 'sk_live_test',
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
        STRIPE_CLOUD_STARTER_PRICE_ID: 'price_1',
        STRIPE_CLOUD_BUSINESS_PRICE_ID: 'price_2',
        STRIPE_CLOUD_PRO_PRICE_ID: 'price_3',
        TWENTYI_PACKAGE_TYPE_STARTER: '302135',
        TWENTYI_PACKAGE_TYPE_BUSINESS: '302133',
        TWENTYI_PACKAGE_TYPE_PRO: '302129',
        SENDGRID_API_KEY: 'SG.test',
      }),
      true,
    );

    expect(isLaunchReady(gates)).toBe(true);
  });
});
