import { describe, expect, it } from 'vitest';
import { createIdempotencyStore, createNonceStore } from '../replay.js';

describe('nonce store', () => {
  it('accepts a nonce once', () => {
    const store = createNonceStore(() => 1000);
    expect(store.claim('n1', 5000)).toBe(true);
    expect(store.claim('n1', 5000)).toBe(false);
  });

  it('forgets nonces once they can no longer be replayed', () => {
    let now = 1000;
    const store = createNonceStore(() => now);
    store.claim('n1', 2000);
    now = 3000;
    expect(store.size()).toBe(0);
  });
});

describe('idempotency store', () => {
  it('returns the prior result for a repeated key', () => {
    const store = createIdempotencyStore<string>(1000, () => 0);
    store.remember('k', 'OPS-1');
    expect(store.lookup('k')).toBe('OPS-1');
  });

  it('expires entries after the ttl', () => {
    let now = 0;
    const store = createIdempotencyStore<string>(1000, () => now);
    store.remember('k', 'OPS-1');
    now = 2000;
    expect(store.lookup('k')).toBeUndefined();
  });
});
