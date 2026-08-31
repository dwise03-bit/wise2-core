import { FakeProvider } from './fake.provider';

describe('FakeProvider', () => {
  let provider: FakeProvider;

  beforeEach(() => {
    provider = new FakeProvider();
  });

  it('returns a stable external id for the same idempotency key', async () => {
    const input = {
      idempotencyKey: 'order-1:provision',
      packageTypeId: '1',
      domainName: 'example.wise2.net',
    };

    const first = await provider.provision(input);
    const second = await provider.provision(input);

    expect(second.externalId).toBe(first.externalId);
  });

  it('moves through suspend and unsuspend lifecycle states', async () => {
    const created = await provider.provision({
      idempotencyKey: 'order-2:provision',
      packageTypeId: '1',
      domainName: 'lifecycle.wise2.net',
    });

    await provider.suspend(created.externalId);
    expect((await provider.getStatus(created.externalId)).status).toBe('suspended');

    await provider.unsuspend(created.externalId);
    expect((await provider.getStatus(created.externalId)).status).toBe('active');

    await provider.terminate(created.externalId);
    expect((await provider.getStatus(created.externalId)).status).toBe('terminated');
  });
});
