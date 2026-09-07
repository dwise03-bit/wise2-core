import { chmod, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { idempotencyKeyFor, newNonce, sign } from '../../../../packages/ops-protocol/src/index.js';
import type { Actor, Confirmation, Job, Signed, TargetRecord } from '../../../../packages/ops-protocol/src/index.js';
import type { SigningKey } from '../../../../packages/ops-protocol/src/signature.js';
import type { RelayConfig } from '../types.js';
import type { TargetRegistry } from '../targets.js';

export const KEY: SigningKey = { keyId: 'relay-test', secret: 'relay-test-signing-secret-0123456789abcdef' };
export const RELAY_TOKEN = 'relay-bearer-token-of-sufficient-length-01';
export const BRIDGE_TOKEN = 'bridge-bearer-token-value';

export const OWNER: Actor = { id: '123456789012345678', displayName: 'Daniel', role: 'owner' };
export const OPERATOR: Actor = { id: '876543210987654321', displayName: 'Operator', role: 'operator' };

export const CORE: TargetRecord = {
  alias: 'wise2-core',
  address: '100.64.0.10',
  transport: 'control-bridge',
  controlPort: 3099,
  environment: 'production',
  allowedProfiles: ['status', 'services', 'logs', 'diagnose', 'restart', 'deploy', 'rollback'],
  healthCheckProfile: 'status',
  bridgeTokenRef: 'WISE2_BRIDGE_TOKEN_CORE',
};

export const TUNNELLED: TargetRecord = {
  alias: 'wise2-tunnel',
  address: '173.208.147.165',
  transport: 'ssh',
  sshUser: 'wise2-ops',
  forwardPort: 4799,
  environment: 'production',
  allowedProfiles: ['status', 'restart'],
  healthCheckProfile: 'status',
};

export function registry(targets: TargetRecord[] = [CORE, TUNNELLED]): TargetRegistry {
  return { targets, tokens: new Map([['wise2-core', BRIDGE_TOKEN]]) };
}

export async function config(overrides: Partial<RelayConfig> = {}): Promise<RelayConfig> {
  const dir = await mkdtemp(join(tmpdir(), 'control-relay-'));
  return {
    host: '127.0.0.1', port: 4600, nodeEnv: 'test', token: RELAY_TOKEN,
    targetsFile: join(dir, 'targets.json'), auditFile: join(dir, 'relay-audit.jsonl'),
    signingKeys: [KEY], requestTimeoutMs: 1_000,
    rateLimitMax: 100, rateLimitWindowMs: 60_000, jobRetentionMs: 60_000,
    ...overrides,
  };
}

export async function writeRegistryFile(contents: unknown, mode = 0o600): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'control-relay-registry-'));
  const file = join(dir, 'targets.json');
  await writeFile(file, typeof contents === 'string' ? contents : JSON.stringify(contents), 'utf8');
  await chmod(file, mode);
  return file;
}

export function buildJob(actionProfile: string, args: Record<string, string> = {}, overrides: Partial<Job> = {}): Job {
  const issuedAt = overrides.issuedAt ?? new Date().toISOString();
  const actor = overrides.actor ?? OWNER;
  const target = overrides.target ?? 'wise2-core';
  return {
    jobId: overrides.jobId ?? 'OPS-20260905-A1B2',
    actor, target,
    environment: overrides.environment ?? 'production',
    actionProfile, args,
    nonce: overrides.nonce ?? newNonce(),
    issuedAt,
    expiresAt: overrides.expiresAt ?? new Date(Date.parse(issuedAt) + 5 * 60 * 1000).toISOString(),
    idempotencyKey: overrides.idempotencyKey ?? idempotencyKeyFor({ actorId: actor.id, target, actionProfile, args, window: issuedAt.slice(0, 16) }),
  };
}

export function confirm(job: Job, overrides: Partial<Confirmation> = {}): Signed<Confirmation> {
  return sign({
    jobId: job.jobId,
    confirmedBy: job.actor,
    confirmedAt: new Date().toISOString(),
    environmentEcho: job.environment === 'production' ? 'production' : undefined,
    sequence: 1,
    ...overrides,
  }, KEY);
}

export function payloadFor(job: Job, confirmations: Signed<Confirmation>[] = [confirm(job)], key: SigningKey = KEY) {
  return { job: sign(job, key), confirmations };
}

export const auth = { authorization: `Bearer ${RELAY_TOKEN}` };

/** Records every outbound request so tests can assert what the relay actually called. */
export function recordingFetch(response: () => Response | Promise<Response>) {
  const calls: { url: string; method: string; headers: Record<string, string>; body?: string }[] = [];
  const impl = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({
      url: String(input),
      method: init?.method ?? 'GET',
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: typeof init?.body === 'string' ? init.body : undefined,
    });
    return response();
  }) as unknown as typeof globalThis.fetch;
  return { impl, calls };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
