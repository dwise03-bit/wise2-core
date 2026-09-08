/**
 * Replay defences. Both stores are intentionally in-memory and bounded: the relay is a
 * single local process, and a restart must fail closed by forgetting nothing dangerous —
 * a forgotten nonce simply means the job's own expiry (max 10 minutes) is the backstop.
 */

export type NonceStore = {
  /** Returns false when the nonce has been seen before. */
  claim(nonce: string, expiresAt: number): boolean;
  size(): number;
};

export function createNonceStore(now: () => number = Date.now): NonceStore {
  const seen = new Map<string, number>();
  const sweep = (): void => {
    const current = now();
    for (const [nonce, expiry] of seen) if (expiry <= current) seen.delete(nonce);
  };
  return {
    claim(nonce, expiresAt) {
      sweep();
      if (seen.has(nonce)) return false;
      seen.set(nonce, expiresAt);
      return true;
    },
    size() {
      sweep();
      return seen.size;
    },
  };
}

export type IdempotencyRecord<T> = { value: T; storedAt: number };

export type IdempotencyStore<T> = {
  /** Returns the previous result when this key has already been executed. */
  lookup(key: string): T | undefined;
  remember(key: string, value: T): void;
  size(): number;
};

export function createIdempotencyStore<T>(ttlMs = 60 * 60 * 1000, now: () => number = Date.now): IdempotencyStore<T> {
  const store = new Map<string, IdempotencyRecord<T>>();
  const sweep = (): void => {
    const cutoff = now() - ttlMs;
    for (const [key, record] of store) if (record.storedAt <= cutoff) store.delete(key);
  };
  return {
    lookup(key) {
      sweep();
      return store.get(key)?.value;
    },
    remember(key, value) {
      sweep();
      store.set(key, { value, storedAt: now() });
    },
    size() {
      sweep();
      return store.size;
    },
  };
}
