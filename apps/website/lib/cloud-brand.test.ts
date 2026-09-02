import { CLOUD_PLANS_STATIC, CLOUD_TRUST_ITEMS } from './cloud-brand';

describe('WISE² Cloud customer-facing brand', () => {
  it('matches the production backend catalog exactly', () => {
    expect(CLOUD_PLANS_STATIC.map(({ id, name, price }) => ({ id, name, price }))).toEqual([
      { id: 'starter', name: 'WISE² Cloud Starter', price: 19 },
      { id: 'business', name: 'WISE² Cloud Business', price: 39 },
      { id: 'pro', name: 'WISE² Cloud Pro', price: 59 },
    ]);
  });

  it('does not expose upstream reseller/provider branding in customer copy', () => {
    const customerCopy = JSON.stringify({ CLOUD_PLANS_STATIC, CLOUD_TRUST_ITEMS }).toLowerCase();

    expect(customerCopy).not.toContain('20i');
    expect(customerCopy).not.toContain('twentyi');
    expect(customerCopy).not.toContain('hostshop');
    expect(customerCopy).not.toContain('piff city');
  });
});
