import { CLOUD_PLANS_STATIC, CLOUD_TRUST_ITEMS } from './cloud-brand';

describe('WISE² Cloud customer-facing launch catalog', () => {
  it('matches the approved regional launch pricing', () => {
    expect(CLOUD_PLANS_STATIC.map(({ id, price }) => ({ id, price }))).toEqual([
      { id: 'starter', price: 29 },
      { id: 'business', price: 49 },
      { id: 'pro', price: 79 },
    ]);
  });

  it('keeps upstream infrastructure providers out of customer-facing brand copy', () => {
    const customerCopy = JSON.stringify({ CLOUD_PLANS_STATIC, CLOUD_TRUST_ITEMS }).toLowerCase();

    expect(customerCopy).not.toContain('20i');
    expect(customerCopy).not.toContain('twentyi');
    expect(customerCopy).not.toContain('hostshop');
  });
});
