import {
  createNonceStore,
  verifyJob,
  type Confirmation,
  type Job,
  type NonceStore,
  type Signed,
  type TargetRecord,
  type ValidationErrorCode,
} from '../../../packages/ops-protocol/src/index.js';
import type { ControlConfig } from './types.js';

export type WriteRequestBody = {
  job?: Signed<Job>;
  confirmations?: Signed<Confirmation>[];
};

export type AuthorizedWrite = {
  job: Job;
  /** Fingerprint of the request, used to collapse retries into one execution. */
  idempotencyKey: string;
};

export type AuthorizationFailure = {
  code: ValidationErrorCode | 'SIGNED_JOB_REQUIRED' | 'JOB_ACTION_MISMATCH' | 'RELEASE_MISMATCH';
  message: string;
  detail?: string;
};

export type AuthorizationResult =
  | { ok: true; write: AuthorizedWrite | null }
  | { ok: false; failure: AuthorizationFailure };

/**
 * The bridge is its own registry entry: it knows which alias it answers to and which
 * environment it is, so a job minted for a different host cannot execute here even if it
 * reaches this port.
 */
export function selfTarget(config: ControlConfig): TargetRecord {
  return {
    alias: config.targetAlias,
    address: '127.0.0.1',
    transport: 'control-bridge',
    controlPort: config.port,
    environment: config.targetEnvironment,
    allowedProfiles: config.allowedProfiles,
    healthCheckProfile: 'status',
  };
}

export function createJobNonceStore(): NonceStore {
  return createNonceStore();
}

export type AuthorizeInput = {
  config: ControlConfig;
  body: unknown;
  /** Profile this endpoint implements. The signed job must ask for exactly this. */
  expectedProfile: string;
  /** Signed argument values that must match what the URL asked for. */
  expectedArgs: Record<string, string>;
  nonces: NonceStore;
  now?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Second line of defence behind the relay. Verifies the signed job envelope, then checks
 * that the signed intent is the same action the URL is about to perform — a valid
 * signature for `restart api` must never be able to restart `postgres`.
 */
export function authorizeWrite(input: AuthorizeInput): AuthorizationResult {
  const { config, body, expectedProfile, expectedArgs, nonces } = input;

  if (!config.requireSignedWrites) return { ok: true, write: null };

  if (!isRecord(body) || !isRecord(body.job)) {
    return { ok: false, failure: { code: 'SIGNED_JOB_REQUIRED', message: 'A signed job envelope is required for write actions' } };
  }

  const result = verifyJob({
    envelope: body.job as unknown as Signed<Job>,
    keys: config.signingKeys,
    targets: [selfTarget(config)],
    confirmations: Array.isArray(body.confirmations) ? (body.confirmations as Signed<Confirmation>[]) : [],
    nonces,
    now: input.now,
  });
  if (!result.ok) return { ok: false, failure: { code: result.code, message: result.message, detail: result.detail } };

  const { job } = result.value;
  if (job.actionProfile !== expectedProfile) {
    return { ok: false, failure: { code: 'JOB_ACTION_MISMATCH', message: 'Signed job does not authorize this action', detail: job.actionProfile } };
  }
  for (const [name, expected] of Object.entries(expectedArgs)) {
    if (job.args[name] !== expected) {
      return { ok: false, failure: { code: 'JOB_ACTION_MISMATCH', message: 'Signed job arguments do not match the requested action', detail: name } };
    }
  }

  return { ok: true, write: { job, idempotencyKey: job.idempotencyKey } };
}

/**
 * A short release id is accepted as a prefix of the full commit, which is how operators
 * actually type them. Anything else is a mismatch: the operator confirmed one release and
 * must not get another.
 */
export function releaseMatches(requested: string | undefined, actual: string | undefined): boolean {
  if (!requested) return true;
  if (!actual) return false;
  return actual === requested || (requested.length >= 7 && actual.startsWith(requested));
}
