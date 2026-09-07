import { findProfile, roleSatisfies } from './profiles.js';
import { findTarget } from './registry.js';
import { verify, type SigningKey } from './signature.js';
import type { NonceStore } from './replay.js';
import {
  err, ok,
  type ActionProfile, type Confirmation, type Job, type Result, type Signed, type TargetRecord,
} from './types.js';

/** Longest life a job may be given, per the safety model. */
export const MAX_JOB_TTL_MS = 10 * 60 * 1000;
/** Tolerance for clock drift between the Discord backend and the relay. */
export const CLOCK_SKEW_MS = 30 * 1000;

const ROLES = new Set(['viewer', 'operator', 'owner']);
const JOB_ID = /^OPS-[0-9]{8}-[A-Z0-9]{4}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTime(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Structural check. Runs before anything is trusted enough to be looked up. */
export function parseJob(input: unknown): Result<Job> {
  if (!isRecord(input)) return err('MALFORMED_JOB', 'Job must be an object');
  const { jobId, actor, target, environment, actionProfile, args, nonce, issuedAt, expiresAt, idempotencyKey } = input;
  if (typeof jobId !== 'string' || !JOB_ID.test(jobId)) return err('MALFORMED_JOB', 'Job id is invalid');
  if (!isRecord(actor) || typeof actor.id !== 'string' || !/^[0-9]{5,32}$/.test(actor.id)) return err('MALFORMED_JOB', 'Actor id is invalid');
  if (typeof actor.displayName !== 'string' || actor.displayName.length > 64) return err('MALFORMED_JOB', 'Actor display name is invalid');
  if (typeof actor.role !== 'string' || !ROLES.has(actor.role)) return err('MALFORMED_JOB', 'Actor role is invalid');
  if (typeof target !== 'string') return err('MALFORMED_JOB', 'Target alias is required');
  if (environment !== 'development' && environment !== 'staging' && environment !== 'production') return err('MALFORMED_JOB', 'Environment is invalid');
  if (typeof actionProfile !== 'string') return err('MALFORMED_JOB', 'Action profile is required');
  if (!isRecord(args) || Object.values(args).some(value => typeof value !== 'string')) return err('MALFORMED_JOB', 'Args must be a flat string map');
  if (typeof nonce !== 'string' || nonce.length < 8) return err('MALFORMED_JOB', 'Nonce is invalid');
  if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 8) return err('MALFORMED_JOB', 'Idempotency key is invalid');
  if (parseTime(issuedAt) === undefined) return err('MALFORMED_JOB', 'issuedAt is not a valid timestamp');
  if (parseTime(expiresAt) === undefined) return err('MALFORMED_JOB', 'expiresAt is not a valid timestamp');
  return ok(input as unknown as Job);
}

/** Every declared arg exists in the profile, is present when required, and matches its spec. */
export function validateArgs(profile: ActionProfile, args: Record<string, string>): Result<Record<string, string>> {
  const specNames = new Set(profile.args.map(spec => spec.name));
  const extra = Object.keys(args).find(name => !specNames.has(name));
  if (extra) return err('ARG_UNKNOWN', 'Argument is not accepted by this profile', extra);
  for (const spec of profile.args) {
    const value = args[spec.name];
    if (value === undefined) {
      if (spec.required) return err('ARG_MISSING', 'Required argument is missing', spec.name);
      continue;
    }
    if (value.length === 0 || value.length > (spec.maxLength ?? 128)) return err('ARG_INVALID', 'Argument length is out of range', spec.name);
    if (spec.values && !spec.values.includes(value)) return err('ARG_INVALID', 'Argument is not an accepted value', spec.name);
    if (spec.pattern && !spec.pattern.test(value)) return err('ARG_INVALID', 'Argument does not match the accepted pattern', spec.name);
  }
  return ok(args);
}

export type ConfirmationEnvelope = Signed<Confirmation>;

export type VerifyJobInput = {
  envelope: Signed<Job>;
  keys: readonly SigningKey[];
  targets: readonly TargetRecord[];
  confirmations?: readonly ConfirmationEnvelope[];
  nonces?: NonceStore;
  now?: number;
};

export type VerifiedJob = {
  job: Job;
  profile: ActionProfile;
  target: TargetRecord;
};

/**
 * The single gate every write passes through. Ordered cheapest-first, and deliberately
 * fails closed: anything unrecognised — key, target, profile, argument, confirmation —
 * is a rejection, never a fallback.
 */
export function verifyJob(input: VerifyJobInput): Result<VerifiedJob> {
  const now = input.now ?? Date.now();

  const verified = verify(input.envelope, input.keys);
  if (!verified.ok) return verified;

  const parsed = parseJob(verified.value);
  if (!parsed.ok) return parsed;
  const job = parsed.value;

  const issuedAt = Date.parse(job.issuedAt);
  const expiresAt = Date.parse(job.expiresAt);
  if (expiresAt - issuedAt > MAX_JOB_TTL_MS) return err('JOB_TTL_TOO_LONG', 'Job lifetime exceeds the 10 minute maximum');
  if (issuedAt - CLOCK_SKEW_MS > now) return err('JOB_NOT_YET_VALID', 'Job was issued in the future');
  if (expiresAt + CLOCK_SKEW_MS <= now) return err('JOB_EXPIRED', 'Job has expired; request it again');

  const target = findTarget(input.targets, job.target);
  if (!target) return err('TARGET_UNKNOWN', 'Target alias is not in the registry', job.target);
  if (target.environment !== job.environment) return err('ENVIRONMENT_MISMATCH', 'Job environment does not match the target', job.target);

  const profile = findProfile(job.actionProfile);
  if (!profile) return err('PROFILE_UNKNOWN', 'Action profile does not exist', job.actionProfile);
  if (!target.allowedProfiles.includes(profile.id)) return err('PROFILE_NOT_ALLOWED_ON_TARGET', 'Target does not allow this profile', `${job.target}:${profile.id}`);
  if (!roleSatisfies(job.actor.role, profile.minRole)) return err('ROLE_DENIED', 'Actor role may not run this profile', `${job.actor.role}<${profile.minRole}`);

  const args = validateArgs(profile, job.args);
  if (!args.ok) return args;

  const confirmed = checkConfirmations(job, profile, input.confirmations ?? [], input.keys, now);
  if (!confirmed.ok) return confirmed;

  // Claimed last: a job rejected for any other reason must not burn its nonce, so that a
  // fixed re-issue is still possible, while an accepted nonce can never be replayed.
  if (input.nonces && !input.nonces.claim(job.nonce, expiresAt + CLOCK_SKEW_MS)) {
    return err('NONCE_REPLAYED', 'This job has already been submitted');
  }

  return ok({ job, profile, target });
}

function checkConfirmations(
  job: Job,
  profile: ActionProfile,
  envelopes: readonly ConfirmationEnvelope[],
  keys: readonly SigningKey[],
  now: number,
): Result<true> {
  if (!profile.requiresConfirmation) return ok(true);
  const required = profile.requiresDoubleConfirmation ? 2 : 1;

  const accepted: Confirmation[] = [];
  for (const envelope of envelopes) {
    const verified = verify(envelope, keys);
    if (!verified.ok) return verified;
    const confirmation = verified.value;
    if (confirmation.jobId !== job.jobId) return err('CONFIRMATION_MISMATCH', 'Confirmation is for a different job', confirmation.jobId);
    if (confirmation.confirmedBy.id !== job.actor.id) return err('CONFIRMATION_ACTOR_MISMATCH', 'Confirmation was issued by a different actor');
    if (!roleSatisfies(confirmation.confirmedBy.role, profile.minRole)) return err('ROLE_DENIED', 'Confirming actor may not approve this profile');
    const confirmedAt = Date.parse(confirmation.confirmedAt);
    if (!Number.isFinite(confirmedAt)) return err('CONFIRMATION_MISMATCH', 'Confirmation timestamp is invalid');
    if (confirmedAt + MAX_JOB_TTL_MS + CLOCK_SKEW_MS <= now) return err('CONFIRMATION_EXPIRED', 'Confirmation expired; request the action again');
    if (job.environment === 'production' && profile.requiresEnvironmentConfirmation && confirmation.environmentEcho !== 'production') {
      return err('ENVIRONMENT_CONFIRMATION_REQUIRED', 'Production writes require the environment to be typed back as `production`');
    }
    if (accepted.some(existing => existing.sequence === confirmation.sequence)) {
      return err('CONFIRMATION_MISMATCH', 'Duplicate confirmation sequence', String(confirmation.sequence));
    }
    accepted.push(confirmation);
  }

  if (accepted.length < required) {
    return err('CONFIRMATION_REQUIRED', `This action requires ${required} confirmation(s); ${accepted.length} provided`);
  }
  return ok(true);
}
