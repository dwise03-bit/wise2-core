import { BusinessOsLeadClaimStore } from './business-os-lead-claim.store';

describe('BusinessOsLeadClaimStore', () => {
  let store: BusinessOsLeadClaimStore;

  beforeEach(() => {
    store = new BusinessOsLeadClaimStore();
  });

  it('allows only one successful claim per lead under concurrency', async () => {
    const leadId = 'lead-concurrent';
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        store.tryClaim(leadId, `user-${index}`),
      ),
    );

    const successes = results.filter(Boolean);
    expect(successes).toHaveLength(1);
    expect(successes[0]?.claimedBy).toBe('user-0');
  });

  it('returns the record for the winning claimant', async () => {
    const record = await store.tryClaim('lead-solo', 'user-a');
    expect(record).not.toBeNull();
    expect(record?.leadId).toBe('lead-solo');
    expect(record?.claimedBy).toBe('user-a');
    expect(record?.claimedAt).toBeInstanceOf(Date);
  });

  it('returns null for a second claimant on the same lead', async () => {
    await store.tryClaim('lead-taken', 'user-first');
    const result = await store.tryClaim('lead-taken', 'user-second');
    expect(result).toBeNull();
  });

  it('is idempotent for the original claimer', async () => {
    await store.tryClaim('lead-idem', 'user-original');
    const repeat = await store.tryClaim('lead-idem', 'user-original');
    expect(repeat?.claimedBy).toBe('user-original');
  });

  it('get returns the stored claim', async () => {
    await store.tryClaim('lead-get', 'user-z');
    const record = await store.get('lead-get');
    expect(record?.claimedBy).toBe('user-z');
  });

  it('get returns undefined for unclaimed lead', async () => {
    expect(await store.get('lead-unknown')).toBeUndefined();
  });

  it('clear resets the store', async () => {
    await store.tryClaim('lead-clear', 'user-x');
    store.clear();
    expect(await store.get('lead-clear')).toBeUndefined();
  });

  it('allows independent claims for different leads', async () => {
    const r1 = await store.tryClaim('lead-a', 'user-1');
    const r2 = await store.tryClaim('lead-b', 'user-2');
    expect(r1?.leadId).toBe('lead-a');
    expect(r2?.leadId).toBe('lead-b');
  });
});
