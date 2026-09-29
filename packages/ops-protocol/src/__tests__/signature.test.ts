import { describe, expect, it } from 'vitest';
import { canonicalize, idempotencyKeyFor, newJobId, sign, verify } from '../signature.js';
import { KEY, OTHER_KEY, makeJob } from './helpers.js';

describe('canonicalize', () => {
  it('is independent of key order at every depth', () => {
    const a = { b: 1, a: { d: [1, 2], c: 'x' } };
    const b = { a: { c: 'x', d: [1, 2] }, b: 1 };
    expect(canonicalize(a)).toBe(canonicalize(b));
  });

  it('preserves array order', () => {
    expect(canonicalize([1, 2])).not.toBe(canonicalize([2, 1]));
  });

  it('drops undefined members the way JSON does', () => {
    expect(canonicalize({ a: 1, b: undefined })).toBe('{"a":1}');
  });
});

describe('verify', () => {
  it('accepts an untampered envelope', () => {
    const job = makeJob();
    expect(verify(sign(job, KEY), [KEY])).toEqual({ ok: true, value: job });
  });

  it('rejects a payload mutated after signing', () => {
    const envelope = sign(makeJob(), KEY);
    envelope.payload.args = { service: 'postgres' };
    expect(verify(envelope, [KEY])).toMatchObject({ ok: false, code: 'SIGNATURE_INVALID' });
  });

  it('rejects a signature produced by a different secret', () => {
    const envelope = sign(makeJob(), OTHER_KEY);
    expect(verify(envelope, [KEY])).toMatchObject({ ok: false, code: 'SIGNATURE_INVALID' });
  });

  it('rejects an unknown key id', () => {
    const envelope = { ...sign(makeJob(), KEY), keyId: 'retired-key' };
    expect(verify(envelope, [KEY])).toMatchObject({ ok: false, code: 'KEY_UNKNOWN' });
  });

  it('rejects a truncated signature without throwing', () => {
    const envelope = sign(makeJob(), KEY);
    envelope.signature = envelope.signature.slice(0, 10);
    expect(verify(envelope, [KEY])).toMatchObject({ ok: false, code: 'SIGNATURE_INVALID' });
  });

  it('rejects a malformed envelope', () => {
    expect(verify({ payload: {}, signature: 1 as unknown as string, keyId: 'k' }, [KEY])).toMatchObject({ ok: false, code: 'MALFORMED_JOB' });
  });
});

describe('identifiers', () => {
  it('mints job ids in the OPS-YYYYMMDD-XXXX shape', () => {
    expect(newJobId(new Date('2026-09-05T00:00:00Z'))).toMatch(/^OPS-20260905-[A-Z0-9]{4}$/);
  });

  it('produces a stable idempotency key for identical requests', () => {
    const input = { actorId: '1', target: 'wise2-core', actionProfile: 'restart', args: { service: 'worker' }, window: '2026-09-05T12:00' };
    expect(idempotencyKeyFor(input)).toBe(idempotencyKeyFor({ ...input, args: { service: 'worker' } }));
  });

  it('produces a different key when the arguments differ', () => {
    const base = { actorId: '1', target: 'wise2-core', actionProfile: 'restart', window: '2026-09-05T12:00' };
    expect(idempotencyKeyFor({ ...base, args: { service: 'worker' } })).not.toBe(idempotencyKeyFor({ ...base, args: { service: 'api' } }));
  });
});
