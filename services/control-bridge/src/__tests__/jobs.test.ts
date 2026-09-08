import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildServer } from '../server.js';
import type { ControlConfig } from '../types.js';
import type { Runner } from '../adapters.js';
import { OPERATOR, SIGNING_KEY, buildJob, confirm, signedWrite, signedWriteFor } from './signing.js';

const TOKEN = 'test-token-with-length';
const headers = { authorization: `Bearer ${TOKEN}` };

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'control-bridge-jobs-'));
});

function config(overrides: Partial<ControlConfig> = {}): ControlConfig {
  return {
    host: '127.0.0.1', port: 3099, nodeEnv: 'test', token: TOKEN, actor: 'vitest',
    repoDir: '/repo', composeFile: '/repo/docker-compose.production.yml', composeProjectName: 'wise2-core',
    auditFile: join(dir, 'audit.jsonl'), deploymentFile: join(dir, 'deployments.jsonl'),
    idempotencyFile: join(dir, 'idempotency.jsonl'),
    dockerBinary: '/usr/bin/docker', gitBinary: '/usr/bin/git', nvidiaSmiBinary: '/usr/bin/nvidia-smi',
    allowedApps: ['website', 'api'], allowedServices: ['api', 'website', 'ollama'],
    ollamaUrl: 'http://ollama.test/api/tags', hermesUrl: 'http://hermes.test/health',
    wise2Url: 'https://wise2.net', apiHealthUrl: 'http://api.test/health',
    rateLimitMax: 100, rateLimitWindowMs: 60_000,
    targetAlias: 'wise2-core', targetEnvironment: 'production',
    allowedProfiles: ['status', 'services', 'logs', 'deploy-status', 'restart', 'deploy', 'rollback'],
    signingKeys: [SIGNING_KEY], requireSignedWrites: true,
    ...overrides,
  };
}

const okRun: Runner = async () => ({ code: 0, stdout: 'restarted', stderr: '' });

/** Builds a server that records every command it was asked to run. */
async function serverWithCalls(overrides: Partial<ControlConfig> = {}) {
  const calls: string[][] = [];
  const cfg = config(overrides);
  const app = await buildServer(cfg, { run: async (_binary, args) => { calls.push(args); return { code: 0, stdout: 'restarted', stderr: '' }; } });
  return { app, cfg, calls };
}

describe('writes require a signed job', () => {
  it('refuses a bearer-only write', async () => {
    const { app, calls } = await serverWithCalls();
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, payload: {} });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('SIGNED_JOB_REQUIRED');
    expect(calls).toEqual([]);
  });

  it('refuses a forged signature', async () => {
    const { app, calls } = await serverWithCalls();
    const forged = signedWrite('restart', { service: 'api' }, { key: { keyId: SIGNING_KEY.keyId, secret: 'a-completely-different-secret-0123456789' } });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...forged });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('SIGNATURE_INVALID');
    expect(calls).toEqual([]);
  });

  it('refuses a job whose payload was altered after signing', async () => {
    const { app, calls } = await serverWithCalls();
    const request = signedWrite('restart', { service: 'api' });
    request.payload.job.payload.args = { service: 'website' };
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/website/restart', headers, ...request });
    expect(res.statusCode).toBe(401);
    expect(calls).toEqual([]);
  });

  it('refuses a signature for one service being used to restart another', async () => {
    const { app, calls } = await serverWithCalls();
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/website/restart', headers, ...signedWrite('restart', { service: 'api' }) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('JOB_ACTION_MISMATCH');
    expect(calls).toEqual([]);
  });

  it('refuses a job signed for a different action profile', async () => {
    const { app, calls } = await serverWithCalls();
    const job = buildJob('deploy', { app: 'api', releaseId: 'abc1234' });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(job) });
    expect(res.statusCode).toBe(400);
    expect(calls).toEqual([]);
  });

  it('refuses a job minted for a different host', async () => {
    const { app, calls } = await serverWithCalls();
    const job = buildJob('restart', { service: 'api' }, { target: 'wise2-dev' });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(job) });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe('TARGET_UNKNOWN');
    expect(calls).toEqual([]);
  });

  it('refuses a profile this host does not implement yet', async () => {
    const { app } = await serverWithCalls();
    const job = buildJob('maintenance', { state: 'on' });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(job) });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe('PROFILE_NOT_ALLOWED_ON_TARGET');
  });

  it('still allows reads with the bearer token alone', async () => {
    const { app } = await serverWithCalls();
    expect((await app.inject({ url: '/v1/control/git/revision', headers })).statusCode).toBe(200);
  });
});

describe('authorization and confirmation', () => {
  it('refuses an operator a write', async () => {
    const { app, calls } = await serverWithCalls();
    const job = buildJob('restart', { service: 'api' }, { actor: OPERATOR });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(job) });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe('ROLE_DENIED');
    expect(calls).toEqual([]);
  });

  it('refuses an unconfirmed production write', async () => {
    const { app, calls } = await serverWithCalls();
    const job = buildJob('restart', { service: 'api' });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(job, []) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('CONFIRMATION_REQUIRED');
    expect(calls).toEqual([]);
  });

  it('refuses a production write whose confirmation does not echo the environment', async () => {
    const { app } = await serverWithCalls();
    const job = buildJob('restart', { service: 'api' });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(job, [confirm(job, { environmentEcho: undefined })]) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('ENVIRONMENT_CONFIRMATION_REQUIRED');
  });

  it('refuses an expired job', async () => {
    const { app } = await serverWithCalls();
    const issuedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const job = buildJob('restart', { service: 'api' }, { issuedAt });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(job) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('JOB_EXPIRED');
  });
});

describe('replay protection', () => {
  it('rejects the same nonce twice', async () => {
    const { app, calls } = await serverWithCalls();
    const job = buildJob('restart', { service: 'api' });
    const request = signedWriteFor(job);
    expect((await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...request })).statusCode).toBe(200);
    const replay = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...request });
    expect(replay.statusCode).toBe(409);
    expect(replay.json().error.code).toBe('NONCE_REPLAYED');
    expect(calls).toHaveLength(1);
  });

  it('treats a re-issued job with the same idempotency key as already done', async () => {
    const { app, cfg, calls } = await serverWithCalls();
    const first = buildJob('restart', { service: 'api' });
    // Same actor, target, action and args — a fresh nonce, but the same unit of work.
    const second = buildJob('restart', { service: 'api' }, { jobId: 'OPS-20260905-C3D4', idempotencyKey: first.idempotencyKey });
    expect((await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(first) })).statusCode).toBe(200);
    const repeat = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(second) });
    expect(repeat.statusCode).toBe(200);
    expect(repeat.json().data.idempotent).toBe(true);
    expect(calls).toHaveLength(1);
    expect(await readFile(cfg.auditFile, 'utf8')).toContain('"replayed":true');
  });

  it('survives a bridge restart without re-executing a completed write', async () => {
    const { app, cfg, calls } = await serverWithCalls();
    const job = buildJob('restart', { service: 'api' });
    expect((await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor(job) })).statusCode).toBe(200);

    // A second process, same on-disk ledger.
    const restarted = await buildServer(cfg, { run: async (_binary, args) => { calls.push(args); return { code: 0, stdout: '', stderr: '' }; } });
    const replay = await restarted.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWriteFor({ ...job, jobId: 'OPS-20260905-E5F6', nonce: 'a-fresh-nonce-value' }) });
    expect(replay.json().data.idempotent).toBe(true);
    expect(calls).toHaveLength(1);
  });
});

describe('audit attribution', () => {
  it('records the real actor, job id and profile', async () => {
    const { app, cfg } = await serverWithCalls();
    await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWrite('restart', { service: 'api' }) });
    const audit = JSON.parse((await readFile(cfg.auditFile, 'utf8')).trim().split('\n').at(-1)!);
    expect(audit).toMatchObject({ actor: 'Daniel', actorId: '123456789012345678', actorRole: 'owner', jobId: 'OPS-20260905-A1B2', profile: 'restart', environment: 'production', action: 'docker.restart', ok: true });
    expect(audit.idempotencyKey).toBeTypeOf('string');
  });

  it('audits rejected jobs with their failure code', async () => {
    const { app, cfg } = await serverWithCalls();
    await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, payload: {} });
    expect(await readFile(cfg.auditFile, 'utf8')).toContain('SIGNED_JOB_REQUIRED');
  });

  it('never writes a signing secret into the audit log', async () => {
    const { app, cfg } = await serverWithCalls();
    await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, ...signedWrite('restart', { service: 'api' }) });
    const audit = await readFile(cfg.auditFile, 'utf8');
    expect(audit).not.toContain(SIGNING_KEY.secret);
    expect(audit).not.toContain(TOKEN);
  });
});

describe('release pinning', () => {
  const revisionRunner: Runner = async (_binary, args) => ({ code: 0, stdout: args.includes('HEAD') ? 'abc1234567890\n' : 'main\n', stderr: '' });

  it('records a deployment when the host revision matches the confirmed release', async () => {
    const cfg = config();
    const app = await buildServer(cfg, { run: revisionRunner });
    const res = await app.inject({ method: 'POST', url: '/v1/control/deploy/website', headers, ...signedWrite('deploy', { app: 'website', releaseId: 'abc1234' }) });
    expect(res.statusCode).toBe(200);
  });

  it('refuses to deploy a revision other than the one confirmed', async () => {
    const cfg = config();
    const app = await buildServer(cfg, { run: revisionRunner });
    const res = await app.inject({ method: 'POST', url: '/v1/control/deploy/website', headers, ...signedWrite('deploy', { app: 'website', releaseId: 'deadbee' }) });
    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe('RELEASE_MISMATCH');
  });
});

describe('legacy mode', () => {
  it('permits an unsigned write only when signed writes are explicitly disabled', async () => {
    const { app, calls } = await serverWithCalls({ requireSignedWrites: false, signingKeys: [] });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers, payload: {} });
    expect(res.statusCode).toBe(200);
    expect(calls).toHaveLength(1);
  });
});
