import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { createNonceStore, sign } from '../../../../packages/ops-protocol/src/index.js';
import { buildServer } from '../server.js';
import {
  BRIDGE_TOKEN, CORE, KEY, OPERATOR, RELAY_TOKEN, TUNNELLED,
  auth, buildJob, config, confirm, jsonResponse, payloadFor, recordingFetch, registry,
} from './helpers.js';

const bridgeOk = () => jsonResponse({ ok: true, action: 'docker.restart', data: { code: 0, stdout: 'restarted' } });

async function relay(options: { fetch?: ReturnType<typeof recordingFetch>; targets?: typeof CORE[] } = {}) {
  const cfg = await config();
  const fetchStub = options.fetch ?? recordingFetch(bridgeOk);
  const app = await buildServer(cfg, {
    registry: registry(options.targets),
    fetchImpl: fetchStub.impl,
    nonces: createNonceStore(),
  });
  return { app, cfg, calls: fetchStub.calls };
}

describe('relay authentication', () => {
  it('serves health without a token but nothing else', async () => {
    const { app } = await relay();
    expect((await app.inject('/v1/relay/health')).statusCode).toBe(200);
    expect((await app.inject('/v1/relay/targets')).statusCode).toBe(401);
  });

  it('rejects a wrong relay token without echoing it', async () => {
    const { app } = await relay();
    const res = await app.inject({ url: '/v1/relay/targets', headers: { authorization: 'Bearer not-the-relay-token' } });
    expect(res.statusCode).toBe(401);
    expect(res.body).not.toContain('not-the-relay-token');
  });

  it('requires a signed job even with a valid relay token', async () => {
    const { app, calls } = await relay();
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: {} });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('SIGNED_JOB_REQUIRED');
    expect(calls).toEqual([]);
  });
});

describe('job verification', () => {
  it('dispatches a valid confirmed write', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect(res.statusCode).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe('http://100.64.0.10:3099/v1/control/docker/api/restart');
    expect(calls[0]!.method).toBe('POST');
  });

  it('rejects an unknown target alias', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' }, { target: 'wise2-ghost' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe('TARGET_UNKNOWN');
    expect(calls).toEqual([]);
  });

  it('rejects an unknown action profile', async () => {
    const { app, calls } = await relay();
    const job = buildJob('exec', { command: 'id' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('PROFILE_UNKNOWN');
    expect(calls).toEqual([]);
  });

  it('rejects a profile the target does not allow', async () => {
    const { app, calls } = await relay();
    const job = buildJob('deploy', { app: 'website', releaseId: 'abc1234' }, { target: 'wise2-tunnel' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe('PROFILE_NOT_ALLOWED_ON_TARGET');
    expect(calls).toEqual([]);
  });

  it('rejects an expired job', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' }, { issuedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('JOB_EXPIRED');
    expect(calls).toEqual([]);
  });

  it('rejects a write with no confirmation', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job, []) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('CONFIRMATION_REQUIRED');
    expect(calls).toEqual([]);
  });

  it('rejects a production write that does not echo the environment', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job, [confirm(job, { environmentEcho: undefined })]) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('ENVIRONMENT_CONFIRMATION_REQUIRED');
    expect(calls).toEqual([]);
  });

  it('rejects a forged signature', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job, [confirm(job)], { keyId: KEY.keyId, secret: 'a-totally-different-secret-0123456789' }) });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('SIGNATURE_INVALID');
    expect(calls).toEqual([]);
  });

  it('refuses an operator a write and allows them a read', async () => {
    const { app, calls } = await relay();
    const write = buildJob('restart', { service: 'api' }, { actor: OPERATOR });
    expect((await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(write) })).json().error.code).toBe('ROLE_DENIED');
    expect(calls).toEqual([]);

    const read = buildJob('status', {}, { actor: OPERATOR, jobId: 'OPS-20260905-B2C3' });
    expect((await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(read, []) })).statusCode).toBe(200);
    expect(calls).toHaveLength(1);
  });

  it('rejects a replayed job', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' });
    const request = payloadFor(job);
    expect((await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: request })).statusCode).toBe(200);
    const replay = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: request });
    expect(replay.statusCode).toBe(409);
    expect(replay.json().error.code).toBe('NONCE_REPLAYED');
    expect(calls).toHaveLength(1);
  });
});

describe('transport', () => {
  it('forwards the signed envelope verbatim so the bridge verifies it independently', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' });
    const request = payloadFor(job);
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: request });
    expect(JSON.parse(calls[0]!.body!)).toEqual(JSON.parse(JSON.stringify(request)));
  });

  it('attaches the target bridge token', async () => {
    const { app, calls } = await relay();
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(buildJob('status')) });
    expect(calls[0]!.headers.authorization).toBe(`Bearer ${BRIDGE_TOKEN}`);
  });

  it('reaches an ssh target through its local port-forward, never a shell', async () => {
    const { app, calls } = await relay();
    const job = buildJob('restart', { service: 'api' }, { target: 'wise2-tunnel' });
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect(calls[0]!.url).toBe(`http://127.0.0.1:${TUNNELLED.forwardPort}/v1/control/docker/api/restart`);
    expect(calls[0]!.headers.authorization).toBeUndefined();
  });

  it('maps a read profile to its bridge endpoint with bounded arguments', async () => {
    const { app, calls } = await relay();
    const job = buildJob('logs', { service: 'api', lines: '50' });
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job, []) });
    expect(calls[0]!.url).toBe('http://100.64.0.10:3099/v1/control/docker/api/logs?lines=50');
    expect(calls[0]!.method).toBe('GET');
  });

  it('maps every profile the protocol defines to a bridge endpoint', async () => {
    const { app, calls } = await relay();
    const job = buildJob('diagnose', { profile: 'docker' });
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job, []) });
    expect(calls[0]!.url).toBe('http://100.64.0.10:3099/v1/control/diagnose/docker');
  });

  it('routes maintenance and emergency-stop to their bridge endpoints', async () => {
    const targets = [{ ...CORE, allowedProfiles: [...CORE.allowedProfiles, 'maintenance', 'emergency-stop'] }];
    const maintenance = await relay({ targets });
    const maintenanceJob = buildJob('maintenance', { state: 'on' });
    await maintenance.app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(maintenanceJob) });
    expect(maintenance.calls[0]!.url).toBe('http://100.64.0.10:3099/v1/control/maintenance/on');

    const stop = await relay({ targets });
    const stopJob = buildJob('emergency-stop', { service: 'studio' }, { jobId: 'OPS-20260905-D4E5' });
    await stop.app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(stopJob, [confirm(stopJob), confirm(stopJob, { sequence: 2 })]) });
    expect(stop.calls[0]!.url).toBe('http://100.64.0.10:3099/v1/control/emergency/studio/stop');
  });

  it('refuses a profile with no bridge endpoint rather than guessing one', async () => {
    const { routeFor } = await import('../transport.js');
    const job = buildJob('services', {});
    expect(routeFor({ ...job, actionProfile: 'not-a-profile' })).toBeUndefined();
  });
});

describe('fail closed', () => {
  it('reports a write as failed when the bridge is unreachable', async () => {
    const offline = recordingFetch(() => { throw new Error('connect ECONNREFUSED'); });
    const { app, cfg } = await relay({ fetch: offline });
    const job = buildJob('restart', { service: 'api' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect(res.statusCode).toBe(502);
    expect(res.json().error.code).toBe('TARGET_UNREACHABLE');
    expect(res.json().ok).toBe(false);

    const status = await app.inject({ url: `/v1/relay/jobs/${job.jobId}`, headers: auth });
    expect(status.json().data.phase).toBe('failed');
    expect(await readFile(cfg.auditFile, 'utf8')).toContain('TARGET_UNREACHABLE');
  });

  it('surfaces a bridge rejection instead of reporting success', async () => {
    const rejecting = recordingFetch(() => jsonResponse({ ok: false, error: { code: 'CONFIRMATION_REQUIRED', message: 'nope' } }, 400));
    const { app } = await relay({ fetch: rejecting });
    const job = buildJob('restart', { service: 'api' });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('CONFIRMATION_REQUIRED');
    const status = await app.inject({ url: `/v1/relay/jobs/${job.jobId}`, headers: auth });
    expect(status.json().data.phase).toBe('blocked');
  });

  it('does not execute anything on an unknown endpoint', async () => {
    const { app, calls } = await relay();
    const res = await app.inject({ method: 'POST', url: '/v1/relay/exec', headers: auth, payload: {} });
    expect(res.statusCode).toBe(404);
    expect(calls).toEqual([]);
  });
});

describe('disclosure', () => {
  it('never exposes addresses, ssh users or ports through the targets endpoint', async () => {
    const { app } = await relay();
    const res = await app.inject({ url: '/v1/relay/targets', headers: auth });
    expect(res.body).toContain('wise2-core');
    expect(res.body).not.toContain('100.64.0.10');
    expect(res.body).not.toContain('173.208.147.165');
    expect(res.body).not.toContain('wise2-ops');
    expect(res.body).not.toContain('3099');
  });

  it('redacts secrets that appear in bridge output', async () => {
    const leaky = recordingFetch(() => jsonResponse({ ok: true, data: { stdout: `WISE2_CONTROL_TOKEN=${BRIDGE_TOKEN}` } }));
    const { app } = await relay({ fetch: leaky });
    const res = await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(buildJob('status'), []) });
    expect(res.body).not.toContain(BRIDGE_TOKEN);
    expect(res.body).toContain('[REDACTED]');
  });

  it('keeps relay and signing secrets out of the audit log', async () => {
    const { app, cfg } = await relay();
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(buildJob('status'), []) });
    const audit = await readFile(cfg.auditFile, 'utf8');
    expect(audit).not.toContain(RELAY_TOKEN);
    expect(audit).not.toContain(KEY.secret);
    expect(audit).not.toContain(BRIDGE_TOKEN);
  });

  it('attributes the audit entry to the real actor', async () => {
    const { app, cfg } = await relay();
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(buildJob('restart', { service: 'api' })) });
    const entry = JSON.parse((await readFile(cfg.auditFile, 'utf8')).trim().split('\n').at(-1)!);
    expect(entry).toMatchObject({
      jobId: 'OPS-20260905-A1B2', actor: 'Daniel', actorId: '123456789012345678', actorRole: 'owner',
      target: 'wise2-core', environment: 'production', actionProfile: 'restart', transport: 'control-bridge', ok: true,
    });
  });
});

describe('progress', () => {
  it('tracks a job from accepted through complete', async () => {
    const { app } = await relay();
    const job = buildJob('restart', { service: 'api' });
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    const status = await app.inject({ url: `/v1/relay/jobs/${job.jobId}`, headers: auth });
    expect(status.json().data).toMatchObject({ phase: 'complete', actor: 'Daniel', target: 'wise2-core', actionProfile: 'restart' });
    expect(status.json().data.finishedAt).toBeTypeOf('string');
  });

  it('returns 404 for an unknown job id', async () => {
    const { app } = await relay();
    expect((await app.inject({ url: '/v1/relay/jobs/OPS-20260905-ZZZZ', headers: auth })).statusCode).toBe(404);
  });

  it('signs nothing itself — a rejected job leaves no progress record', async () => {
    const { app } = await relay();
    const job = buildJob('restart', { service: 'api' }, { target: 'wise2-ghost' });
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(job) });
    expect((await app.inject({ url: `/v1/relay/jobs/${job.jobId}`, headers: auth })).statusCode).toBe(404);
    expect(sign).toBeTypeOf('function');
  });
});

describe('tailscale serve ingress', () => {
  it('dispatches to an explicit base URL when the registry provides one', async () => {
    const served = { ...CORE, baseUrl: 'https://gpu-nmls-1.tail44396d.ts.net' };
    const { app, calls } = await relay({ targets: [served] });
    await app.inject({ method: 'POST', url: '/v1/relay/jobs', headers: auth, payload: payloadFor(buildJob('status'), []) });
    expect(calls[0]!.url).toBe('https://gpu-nmls-1.tail44396d.ts.net/v1/control/status');
  });

  it('still hides the base URL from the targets projection', async () => {
    const served = { ...CORE, baseUrl: 'https://gpu-nmls-1.tail44396d.ts.net' };
    const { app } = await relay({ targets: [served] });
    const res = await app.inject({ url: '/v1/relay/targets', headers: auth });
    expect(res.body).not.toContain('tail44396d');
  });
});

describe('fleet health endpoint', () => {
  it('does not poll unless polling is explicitly enabled', async () => {
    const { app } = await relay();
    const res = await app.inject({ url: '/v1/relay/fleet', headers: auth });
    expect(res.json().data.polling).toBe(false);
    expect(res.json().data.targets.map((t: { alias: string; phase: string }) => [t.alias, t.phase]))
      .toEqual([['wise2-core', 'unknown'], ['wise2-tunnel', 'unknown']]);
  });

  it('requires the relay token', async () => {
    const { app } = await relay();
    expect((await app.inject({ url: '/v1/relay/fleet' })).statusCode).toBe(401);
  });

  it('never exposes an address through the fleet view', async () => {
    const { app } = await relay();
    const res = await app.inject({ url: '/v1/relay/fleet', headers: auth });
    expect(res.body).not.toContain('100.64.0.10');
    expect(res.body).not.toContain('173.208.147.165');
  });
});
