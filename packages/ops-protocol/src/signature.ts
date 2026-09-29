import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { err, ok, type Result, type Signed } from './types.js';

/**
 * Deterministic JSON: object keys sorted at every depth, so two processes that hold the
 * same logical payload always produce byte-identical input to the HMAC. Arrays keep
 * their order (it is meaningful); `undefined` members are dropped exactly as JSON does.
 */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(item => canonicalize(item === undefined ? null : item)).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`);
  return `{${entries.join(',')}}`;
}

export type SigningKey = { keyId: string; secret: string };

function hmac(secret: string, message: string): string {
  return createHmac('sha256', secret).update(message, 'utf8').digest('hex');
}

export function sign<T>(payload: T, key: SigningKey): Signed<T> {
  return { payload, signature: hmac(key.secret, canonicalize(payload)), keyId: key.keyId };
}

function signatureEqual(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (providedBuffer.length !== expectedBuffer.length) {
    // Compare anyway so a wrong-length signature costs the same as a wrong-value one.
    timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * Verifies an envelope against a keyring. The signature covers the canonical payload,
 * so any mutation of any field — including reordering `args` keys — invalidates it.
 */
export function verify<T>(envelope: Signed<T>, keys: readonly SigningKey[]): Result<T> {
  if (!envelope || typeof envelope !== 'object' || typeof envelope.signature !== 'string' || typeof envelope.keyId !== 'string') {
    return err('MALFORMED_JOB', 'Signed envelope is malformed');
  }
  const key = keys.find(candidate => candidate.keyId === envelope.keyId);
  if (!key) return err('KEY_UNKNOWN', 'Signing key is not recognised', envelope.keyId);
  if (!signatureEqual(envelope.signature, hmac(key.secret, canonicalize(envelope.payload)))) {
    return err('SIGNATURE_INVALID', 'Signature does not match the payload');
  }
  return ok(envelope.payload);
}

export function newJobId(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `OPS-${stamp}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

export function newNonce(): string {
  return randomUUID();
}

/**
 * Stable fingerprint of what the job actually does. Two identical requests produce the
 * same key, which is how the relay collapses a double-click into a single execution.
 */
export function idempotencyKeyFor(input: { actorId: string; target: string; actionProfile: string; args: Record<string, string>; window: string }): string {
  return createHmac('sha256', 'wise2-ops-idempotency')
    .update(canonicalize(input), 'utf8')
    .digest('hex')
    .slice(0, 32);
}
