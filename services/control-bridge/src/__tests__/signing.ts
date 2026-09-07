import { idempotencyKeyFor, newNonce, sign } from '../../../../packages/ops-protocol/src/index.js';
import type { Actor, Confirmation, Job, Signed } from '../../../../packages/ops-protocol/src/index.js';
import type { SigningKey } from '../../../../packages/ops-protocol/src/signature.js';

export const SIGNING_KEY: SigningKey = { keyId: 'relay-test', secret: 'control-bridge-test-signing-secret-0123456789' };

export const OWNER: Actor = { id: '123456789012345678', displayName: 'Daniel', role: 'owner' };
export const OPERATOR: Actor = { id: '876543210987654321', displayName: 'Operator', role: 'operator' };

export type JobOverrides = Partial<Job> & { key?: SigningKey };

export function buildJob(actionProfile: string, args: Record<string, string>, overrides: JobOverrides = {}): Job {
  const issuedAt = overrides.issuedAt ?? new Date().toISOString();
  const actor = overrides.actor ?? OWNER;
  const target = overrides.target ?? 'wise2-core';
  return {
    jobId: overrides.jobId ?? 'OPS-20260905-A1B2',
    actor,
    target,
    environment: overrides.environment ?? 'production',
    actionProfile,
    args,
    nonce: overrides.nonce ?? newNonce(),
    issuedAt,
    expiresAt: overrides.expiresAt ?? new Date(Date.parse(issuedAt) + 5 * 60 * 1000).toISOString(),
    idempotencyKey: overrides.idempotencyKey ?? idempotencyKeyFor({ actorId: actor.id, target, actionProfile, args, window: issuedAt.slice(0, 16) }),
  };
}

export function confirm(job: Job, overrides: Partial<Confirmation> = {}, key: SigningKey = SIGNING_KEY): Signed<Confirmation> {
  return sign({
    jobId: job.jobId,
    confirmedBy: job.actor,
    confirmedAt: new Date().toISOString(),
    environmentEcho: job.environment === 'production' ? 'production' : undefined,
    sequence: 1,
    ...overrides,
  }, key);
}

/** Builds the `{ payload }` fragment for a signed write request. */
export function signedWrite(actionProfile: string, args: Record<string, string>, overrides: JobOverrides = {}) {
  const job = buildJob(actionProfile, args, overrides);
  const key = overrides.key ?? SIGNING_KEY;
  return { payload: { job: sign(job, key), confirmations: [confirm(job)] } };
}

export function signedWriteFor(job: Job, confirmations: Signed<Confirmation>[] = [confirm(job)], key: SigningKey = SIGNING_KEY) {
  return { payload: { job: sign(job, key), confirmations } };
}
