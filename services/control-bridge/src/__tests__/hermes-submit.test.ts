import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildServer } from '../server.js';
import type { ControlConfig } from '../types.js';

function config(overrides: Partial<ControlConfig> = {}): ControlConfig {
  return {
    host: '127.0.0.1',
    port: 3099,
    nodeEnv: 'test',
    token: 'control-token-with-length',
    actor: 'vitest',
    repoDir: '/repo',
    composeFile: '/repo/docker-compose.production.yml',
    composeProjectName: 'wise2-core',
    auditFile: join(tmpdir(), `audit-${crypto.randomUUID()}.jsonl`),
    deploymentFile: join(tmpdir(), `deploy-${crypto.randomUUID()}.jsonl`),
    dockerBinary: '/usr/bin/docker',
    gitBinary: '/usr/bin/git',
    nvidiaSmiBinary: '/usr/bin/nvidia-smi',
    allowedApps: ['website', 'api'],
    allowedServices: ['api', 'website', 'ollama'],
    ollamaUrl: 'http://ollama.test/api/tags',
    hermesUrl: 'http://hermes.test/health',
    hermesImageUrl: 'http://api.test/v1/hermes/image',
    hermesBearerToken: 'hermes-service-jwt',
    wise2Url: 'https://wise2.net',
    apiHealthUrl: 'http://api.test/health',
    rateLimitMax: 100,
    rateLimitWindowMs: 60_000,
    ...overrides,
  };
}

const auth = { authorization: 'Bearer control-token-with-length' };

describe('Hermes image submission through Control Bridge', () => {
  it('forwards only the bounded Hermes image contract with a dedicated upstream token', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetch = async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return new Response(JSON.stringify({ imageUrl: 'https://cdn.test/job.png', jobId: 'job_123' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };
    const app = await buildServer(config(), { fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({
      method: 'POST',
      url: '/v1/control/hermes/image',
      headers: auth,
      payload: {
        instruction: 'Create a 9:16 SenCere Creative motion-ad keyframe.',
        aspectRatio: '9:16',
        deliverToDiscord: true,
        discordChannel: 'images',
        references: [{ id: 'storyboard', url: 'https://assets.test/storyboard.jpg', role: 'LOCKED', kind: 'approved-art', label: 'Approved storyboard' }],
        unexpected: 'must not be forwarded',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().action).toBe('hermes.image.submit');
    expect(res.json().data.jobId).toBe('job_123');
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('http://api.test/v1/hermes/image');
    expect(calls[0].init?.method).toBe('POST');
    const headers = new Headers(calls[0].init?.headers);
    expect(headers.get('authorization')).toBe('Bearer hermes-service-jwt');
    expect(headers.get('authorization')).not.toContain('control-token-with-length');
    const body = JSON.parse(String(calls[0].init?.body));
    expect(body).toEqual({
      instruction: 'Create a 9:16 SenCere Creative motion-ad keyframe.',
      aspectRatio: '9:16',
      deliverToDiscord: true,
      discordChannel: 'images',
      references: [{ id: 'storyboard', url: 'https://assets.test/storyboard.jpg', role: 'LOCKED', kind: 'approved-art', label: 'Approved storyboard' }],
    });
  });

  it('rejects invalid requests before contacting Hermes', async () => {
    let called = false;
    const fetch = async () => { called = true; return new Response('{}'); };
    const app = await buildServer(config(), { fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({
      method: 'POST',
      url: '/v1/control/hermes/image',
      headers: auth,
      payload: { instruction: '', aspectRatio: '3:2' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('INVALID_HERMES_REQUEST');
    expect(called).toBe(false);
  });

  it('fails closed when the dedicated Hermes bearer token is not configured', async () => {
    let called = false;
    const fetch = async () => { called = true; return new Response('{}'); };
    const app = await buildServer(config({ hermesBearerToken: '' }), { fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({
      method: 'POST',
      url: '/v1/control/hermes/image',
      headers: auth,
      payload: { instruction: 'Generate approved art.' },
    });
    expect(res.statusCode).toBe(503);
    expect(res.json().error.code).toBe('HERMES_NOT_CONFIGURED');
    expect(called).toBe(false);
  });

  it('audits successful submissions without recording either bearer token', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'control-hermes-'));
    const cfg = config({ auditFile: join(dir, 'audit.jsonl') });
    const fetch = async () => new Response(JSON.stringify({ jobId: 'job_456' }), { status: 200, headers: { 'content-type': 'application/json' } });
    const app = await buildServer(cfg, { fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({
      method: 'POST',
      url: '/v1/control/hermes/image',
      headers: { authorization: `Bearer ${cfg.token}` },
      payload: { instruction: 'Generate approved art.' },
    });
    expect(res.statusCode).toBe(200);
    const audit = await readFile(cfg.auditFile, 'utf8');
    expect(audit).toContain('hermes.image.submit');
    expect(audit).not.toContain(cfg.token);
    expect(audit).not.toContain(cfg.hermesBearerToken);
  });

  it('returns a bounded upstream error and does not leak upstream bearer material', async () => {
    const cfg = config();
    const fetch = async () => new Response(`upstream failed ${cfg.hermesBearerToken}`, { status: 502 });
    const app = await buildServer(cfg, { fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({
      method: 'POST',
      url: '/v1/control/hermes/image',
      headers: auth,
      payload: { instruction: 'Generate approved art.' },
    });
    expect(res.statusCode).toBe(502);
    expect(res.json().error.code).toBe('HERMES_UPSTREAM_FAILED');
    expect(res.body).not.toContain(cfg.hermesBearerToken);
  });
});
