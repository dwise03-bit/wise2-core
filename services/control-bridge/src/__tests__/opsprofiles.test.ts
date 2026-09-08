import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildServer } from '../server.js';
import { loadConfig } from '../config.js';
import type { ControlConfig } from '../types.js';
import type { CommandResult } from '../lib/exec.js';
import { SIGNING_KEY, buildJob, confirm, signedWrite, signedWriteFor } from './signing.js';

const TOKEN = 'test-token-with-length';
const headers = { authorization: `Bearer ${TOKEN}` };
let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'control-bridge-ops-'));
});

function config(overrides: Partial<ControlConfig> = {}): ControlConfig {
  return {
    host: '127.0.0.1', port: 3099, nodeEnv: 'test', token: TOKEN, actor: 'vitest',
    repoDir: '/repo', composeFile: '/repo/docker-compose.production.yml', composeProjectName: 'wise2-core',
    auditFile: join(dir, 'audit.jsonl'), deploymentFile: join(dir, 'deployments.jsonl'),
    idempotencyFile: join(dir, 'idempotency.jsonl'), maintenanceFile: join(dir, 'maintenance.json'),
    dockerBinary: '/usr/bin/docker', gitBinary: '/usr/bin/git', nvidiaSmiBinary: '/usr/bin/nvidia-smi',
    allowedApps: ['website', 'api'], allowedServices: ['api', 'website', 'postgres', 'worker', 'studio'],
    allowedStoppable: ['studio'],
    databaseService: 'postgres', workerService: 'worker', proxyService: 'traefik',
    ollamaUrl: 'http://ollama.test/api/tags', hermesUrl: 'http://hermes.test/health',
    wise2Url: 'https://wise2.net', apiHealthUrl: 'http://api.test/health',
    rateLimitMax: 200, rateLimitWindowMs: 60_000,
    targetAlias: 'wise2-core', targetEnvironment: 'production',
    allowedProfiles: ['status', 'services', 'logs', 'diagnose', 'deploy-status', 'restart', 'deploy', 'rollback', 'maintenance', 'emergency-stop'],
    signingKeys: [SIGNING_KEY], requireSignedWrites: true,
    ...overrides,
  };
}

const ok = (stdout = ''): CommandResult => ({ code: 0, stdout, stderr: '' });

async function serverWith(overrides: Partial<ControlConfig> = {}) {
  const calls: string[][] = [];
  const cfg = config(overrides);
  const app = await buildServer(cfg, {
    run: async (_binary, args) => {
      calls.push(args);
      if (args.includes('ps') && args.includes('json')) return ok('{"Service":"postgres","State":"running"}');
      if (args[0] === 'network') return ok('wise2_default bridge local');
      if (args[0] === 'system') return ok('Images 4 2.1GB 1.0GB');
      return ok('output');
    },
    fetch: (async () => new Response(JSON.stringify({ models: [] }), { status: 200 })) as unknown as typeof globalThis.fetch,
  });
  return { app, cfg, calls };
}

describe('diagnostics', () => {
  it.each(['health', 'docker', 'disk', 'network', 'database', 'worker', 'traefik', 'ollama'])(
    'runs the %s profile and names it in the response', async (profile) => {
      const { app } = await serverWith();
      const res = await app.inject({ url: `/v1/control/diagnose/${profile}`, headers });
      expect(res.statusCode).toBe(200);
      expect(res.json().data.profile).toBe(profile);
    });

  it.each(['shell', 'exec', '../status', 'docker;id'])('refuses the unknown profile %j', async (profile) => {
    const { app, calls } = await serverWith();
    const res = await app.inject({ url: `/v1/control/diagnose/${encodeURIComponent(profile)}`, headers });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe('DIAGNOSTIC_UNKNOWN');
    expect(calls).toEqual([]);
  });

  it('reports a service that is not allowlisted as unavailable instead of inspecting it', async () => {
    const { app } = await serverWith({ proxyService: 'not-allowlisted' });
    const res = await app.inject({ url: '/v1/control/diagnose/traefik', headers });
    expect(res.json().data.service.status).toBe('unavailable');
  });

  it('requires the bearer token', async () => {
    const { app } = await serverWith();
    expect((await app.inject({ url: '/v1/control/diagnose/health' })).statusCode).toBe(401);
  });

  it('redacts secrets from diagnostic output', async () => {
    const cfg = config();
    const app = await buildServer(cfg, { run: async () => ok(`WISE2_CONTROL_TOKEN=${cfg.token}`) });
    const res = await app.inject({ url: '/v1/control/diagnose/docker', headers });
    expect(res.body).not.toContain(cfg.token);
    expect(res.body).toContain('[REDACTED]');
  });
});

describe('maintenance mode', () => {
  it('reports disabled before anything has been set', async () => {
    const { app } = await serverWith();
    const res = await app.inject({ url: '/v1/control/maintenance', headers });
    expect(res.json().data.enabled).toBe(false);
  });

  it('refuses an unsigned toggle', async () => {
    const { app, cfg } = await serverWith();
    const res = await app.inject({ method: 'POST', url: '/v1/control/maintenance/on', headers, payload: {} });
    expect(res.statusCode).toBe(401);
    expect((await app.inject({ url: '/v1/control/maintenance', headers })).json().data.enabled).toBe(false);
    expect(await readFile(cfg.auditFile, 'utf8')).toContain('SIGNED_JOB_REQUIRED');
  });

  it('rejects a state that is neither on nor off', async () => {
    const { app } = await serverWith();
    const res = await app.inject({ method: 'POST', url: '/v1/control/maintenance/paused', headers, ...signedWrite('maintenance', { state: 'paused' }) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('ARG_INVALID');
  });

  it('refuses a signed job for the opposite state', async () => {
    const { app } = await serverWith();
    const res = await app.inject({ method: 'POST', url: '/v1/control/maintenance/off', headers, ...signedWrite('maintenance', { state: 'on' }) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('JOB_ACTION_MISMATCH');
  });

  it('enables and disables with a signed, confirmed job and records who did it', async () => {
    const { app, cfg } = await serverWith();
    const on = await app.inject({ method: 'POST', url: '/v1/control/maintenance/on', headers, ...signedWrite('maintenance', { state: 'on' }) });
    expect(on.statusCode).toBe(200);
    expect(on.json().data).toMatchObject({ enabled: true, changedBy: 'Daniel' });

    const status = await app.inject({ url: '/v1/control/status', headers });
    expect(status.json().data.maintenance.data.enabled).toBe(true);

    const off = await app.inject({ method: 'POST', url: '/v1/control/maintenance/off', headers, ...signedWriteFor(buildJob('maintenance', { state: 'off' }, { jobId: 'OPS-20260906-C3D4' })) });
    expect(off.json().data.enabled).toBe(false);
    expect(await readFile(cfg.auditFile, 'utf8')).toContain('"action":"maintenance"');
  });
});

describe('emergency stop', () => {
  it('stops a designated service with a signed, doubly confirmed job', async () => {
    const { app, calls } = await serverWith();
    const job = buildJob('emergency-stop', { service: 'studio' });
    const res = await app.inject({ method: 'POST', url: '/v1/control/emergency/studio/stop', headers, ...signedWriteFor(job, [confirm(job), confirm(job, { sequence: 2 })]) });
    expect(res.statusCode).toBe(200);
    expect(calls[0]).toEqual(['compose', '-p', 'wise2-core', '-f', '/repo/docker-compose.production.yml', 'stop', 'studio']);
  });

  it('refuses a service that is restartable but not stoppable', async () => {
    const { app, calls } = await serverWith();
    const res = await app.inject({ method: 'POST', url: '/v1/control/emergency/api/stop', headers, ...signedWrite('emergency-stop', { service: 'api' }) });
    expect(res.statusCode).toBe(403);
    expect(calls).toEqual([]);
  });

  it('refuses every service when nothing is designated stoppable', async () => {
    const { app, calls } = await serverWith({ allowedStoppable: [] });
    const res = await app.inject({ method: 'POST', url: '/v1/control/emergency/studio/stop', headers, ...signedWrite('emergency-stop', { service: 'studio' }) });
    expect(res.statusCode).toBe(403);
    expect(calls).toEqual([]);
  });

  it('refuses an unsigned stop', async () => {
    const { app, calls } = await serverWith();
    const res = await app.inject({ method: 'POST', url: '/v1/control/emergency/studio/stop', headers, payload: {} });
    expect(res.statusCode).toBe(401);
    expect(calls).toEqual([]);
  });

  it('refuses a stop confirmed only once', async () => {
    const { app, calls } = await serverWith();
    const job = buildJob('emergency-stop', { service: 'studio' });
    // emergency-stop requires two confirmations; signedWriteFor supplies one by default.
    const res = await app.inject({ method: 'POST', url: '/v1/control/emergency/studio/stop', headers, ...signedWriteFor(job) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('CONFIRMATION_REQUIRED');
    expect(calls).toEqual([]);
  });
});

describe('stoppable allowlist configuration', () => {
  const base = { WISE2_CONTROL_TOKEN: 'test-token', WISE2_OPS_SIGNING_KEYS: `relay:${'s'.repeat(40)}` };

  it.each(['postgres', 'redis', 'mongodb', 'api', 'control-bridge'])('refuses to start with %s marked stoppable', (service) => {
    expect(() => loadConfig({ ...base, WISE2_ALLOWED_STOPPABLE: `studio,${service}` }))
      .toThrow('protected service');
  });

  it('defaults to nothing being stoppable', () => {
    expect(loadConfig(base).allowedStoppable).toEqual([]);
  });
});
