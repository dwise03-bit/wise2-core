import { idempotencyKeyFor, newNonce, sign, type SigningKey } from '../signature.js';
import type { Actor, Confirmation, Job, Role, Signed, TargetRecord } from '../types.js';

export const KEY: SigningKey = { keyId: 'relay-2026-09', secret: 'test-secret-not-a-real-key-0123456789' };
export const OTHER_KEY: SigningKey = { keyId: 'relay-2026-09', secret: 'a-different-secret-0123456789abcdef' };

export const NOW = Date.parse('2026-09-05T12:00:00.000Z');

export const OWNER: Actor = { id: '123456789012345678', displayName: 'Daniel', role: 'owner' };
export const OPERATOR: Actor = { id: '876543210987654321', displayName: 'Operator', role: 'operator' };

export const TARGETS: TargetRecord[] = [
  {
    alias: 'wise2-core',
    address: '100.64.0.10',
    transport: 'control-bridge',
    controlPort: 3099,
    environment: 'production',
    allowedProfiles: ['status', 'services', 'logs', 'diagnose', 'restart', 'deploy', 'rollback', 'maintenance', 'emergency-stop'],
    healthCheckProfile: 'status',
  },
  {
    alias: 'wise2-dev',
    address: '100.64.0.20',
    transport: 'control-bridge',
    environment: 'staging',
    allowedProfiles: ['status', 'logs', 'restart'],
    healthCheckProfile: 'status',
  },
];

export function makeJob(overrides: Partial<Job> = {}): Job {
  const issuedAt = new Date(NOW).toISOString();
  const base: Job = {
    jobId: 'OPS-20260905-A1B2',
    actor: OWNER,
    target: 'wise2-core',
    environment: 'production',
    actionProfile: 'restart',
    args: { service: 'worker' },
    nonce: newNonce(),
    issuedAt,
    expiresAt: new Date(NOW + 5 * 60 * 1000).toISOString(),
    idempotencyKey: 'placeholder-key-value',
    ...overrides,
  };
  return {
    ...base,
    idempotencyKey: overrides.idempotencyKey ?? idempotencyKeyFor({
      actorId: base.actor.id,
      target: base.target,
      actionProfile: base.actionProfile,
      args: base.args,
      window: base.issuedAt.slice(0, 16),
    }),
  };
}

export function signJob(job: Job, key: SigningKey = KEY): Signed<Job> {
  return sign(job, key);
}

export function makeConfirmation(job: Job, overrides: Partial<Confirmation> = {}, role: Role = 'owner'): Signed<Confirmation> {
  return sign({
    jobId: job.jobId,
    confirmedBy: { ...OWNER, role },
    confirmedAt: new Date(NOW + 1000).toISOString(),
    environmentEcho: job.environment === 'production' ? 'production' : undefined,
    sequence: 1,
    ...overrides,
  }, KEY);
}
