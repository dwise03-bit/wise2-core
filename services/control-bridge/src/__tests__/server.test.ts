import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildServer } from '../server.js';
import type { CommandResult } from '../lib/exec.js';
import type { ControlConfig } from '../types.js';
import type { Runner } from '../adapters.js';

function config(overrides: Partial<ControlConfig> = {}): ControlConfig {
  return {
    host: '127.0.0.1', port: 3099, nodeEnv: 'test', token: 'test-token-with-length', actor: 'vitest',
    repoDir: '/repo', composeFile: '/repo/docker-compose.production.yml', composeProjectName: 'wise2-core',
    auditFile: join(tmpdir(), `audit-${crypto.randomUUID()}.jsonl`), deploymentFile: join(tmpdir(), `deploy-${crypto.randomUUID()}.jsonl`),
    dockerBinary: '/usr/bin/docker', gitBinary: '/usr/bin/git', nvidiaSmiBinary: '/usr/bin/nvidia-smi',
    allowedApps: ['website', 'api'], allowedServices: ['api', 'website', 'ollama'],
    ollamaUrl: 'http://ollama.test/api/tags', hermesUrl: 'http://hermes.test/health',
    hermesImageUrl: 'http://api.test/v1/hermes/image', hermesBearerToken: 'hermes-test-jwt',
    wise2Url: 'https://wise2.net', apiHealthUrl: 'http://api.test/health', rateLimitMax: 100, rateLimitWindowMs: 60_000,
    ...overrides,
  };
}

const ok = (stdout = ''): CommandResult => ({ code: 0, stdout, stderr: '' });

describe('control bridge server', () => {
  it('allows unauthenticated health but rejects operational endpoints', async () => {
    const app = await buildServer(config(), { run: async () => ok() });
    expect((await app.inject('/v1/control/health')).statusCode).toBe(200);
    expect((await app.inject('/v1/control/status')).statusCode).toBe(401);
  });
  it('accepts valid auth and rejects bad auth without echoing tokens', async () => {
    const cfg = config(); const app = await buildServer(cfg, { run: async () => ok() });
    expect((await app.inject({ url: '/v1/control/git/revision', headers: { authorization: `Bearer ${cfg.token}` } })).statusCode).toBe(200);
    const bad = await app.inject({ url: '/v1/control/git/revision', headers: { authorization: 'Bearer wrong-token' } });
    expect(bad.statusCode).toBe(401); expect(bad.body).not.toContain('wrong-token');
  });
  it('rejects malicious service names before command execution', async () => {
    const calls: string[][] = []; const app = await buildServer(config(), { run: async (_binary, args) => { calls.push(args); return ok(); } });
    for (const service of ['api;id', 'api && whoami', '../api', '$(id)', 'api|cat /etc/passwd']) {
      const res = await app.inject({ method: 'POST', url: `/v1/control/docker/${encodeURIComponent(service)}/restart`, headers: { authorization: 'Bearer test-token-with-length' } });
      expect(res.statusCode).toBe(403);
    }
    expect(calls).toEqual([]);
  });
  it('restarts allowlisted services with fixed docker compose arguments and audits', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'control-bridge-')); const cfg = config({ auditFile: join(dir, 'audit.jsonl') }); const calls: string[][] = [];
    const app = await buildServer(cfg, { run: async (_binary, args) => { calls.push(args); return ok('restarted'); } });
    const res = await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers: { authorization: `Bearer ${cfg.token}` } });
    expect(res.statusCode).toBe(200); expect(calls[0]).toEqual(['compose', '-p', cfg.composeProjectName, '-f', cfg.composeFile, 'restart', 'api']);
    const audit = await readFile(cfg.auditFile, 'utf8'); expect(audit).toContain('docker.restart'); expect(audit).not.toContain(cfg.token);
  });
  it('surfaces restart failures', async () => {
    const app = await buildServer(config(), { run: async () => ({ code: 1, stdout: '', stderr: 'failed' }) });
    expect((await app.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers: { authorization: 'Bearer test-token-with-length' } })).statusCode).toBe(500);
  });
  it('caps logs at 500 lines', async () => {
    let args: string[] = []; const app = await buildServer(config(), { run: async (_binary, commandArgs) => { args = commandArgs; return ok('logs'); } });
    await app.inject({ url: '/v1/control/docker/api/logs?lines=900', headers: { authorization: 'Bearer test-token-with-length' } }); expect(args).toContain('500');
  });
  it('parses Docker compose services through the configured allowlist', async () => {
    const app = await buildServer(config(), { run: async () => ok('api\npostgres\nnot-allowed\nwebsite\n') });
    const res = await app.inject({ url: '/v1/control/docker/services', headers: { authorization: 'Bearer test-token-with-length' } });
    expect(res.statusCode).toBe(200); expect(res.json().data.services).toEqual(['api', 'website']);
  });
  it('redacts secrets from bounded service logs', async () => {
    const cfg = config(); const app = await buildServer(cfg, { run: async () => ok(`WISE2_CONTROL_TOKEN=${cfg.token}`) });
    const res = await app.inject({ url: '/v1/control/docker/api/logs?lines=200', headers: { authorization: `Bearer ${cfg.token}` } });
    expect(res.statusCode).toBe(200); expect(res.body).not.toContain(cfg.token); expect(res.body).toContain('[REDACTED]');
  });
  it('returns degraded aggregate status for optional component failures', async () => {
    const run: Runner = async (_binary, args) => args.includes('config') ? ok('api\nwebsite\n') : Promise.reject(new Error('missing command'));
    const fetch = async () => { throw new Error('offline'); }; const app = await buildServer(config(), { run, fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({ url: '/v1/control/status', headers: { authorization: 'Bearer test-token-with-length' } });
    expect(res.statusCode).toBe(200); expect(res.json().data.ollama.status).toBe('down'); expect(res.json().data.hermes.status).toBe('down');
  });
  it('reports Ollama unavailable without failing the endpoint', async () => {
    const fetch = async () => { throw new Error('ollama offline'); }; const app = await buildServer(config(), { run: async () => ok(), fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({ url: '/v1/control/ollama/status', headers: { authorization: 'Bearer test-token-with-length' } }); expect(res.statusCode).toBe(200); expect(res.json().data.status).toBe('down');
  });
  it('reports Hermes unavailable without failing the endpoint', async () => {
    const fetch = async () => { throw new Error('hermes offline'); }; const app = await buildServer(config(), { run: async () => ok(), fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({ url: '/v1/control/hermes/status', headers: { authorization: 'Bearer test-token-with-length' } }); expect(res.statusCode).toBe(200); expect(res.json().data.status).toBe('down');
  });
  it('reports wise2.net degraded state without throwing', async () => {
    const fetch = async () => new Response('', { status: 503 }); const app = await buildServer(config(), { run: async () => ok(), fetch: fetch as typeof globalThis.fetch });
    const res = await app.inject({ url: '/v1/control/web/wise2', headers: { authorization: 'Bearer test-token-with-length' } }); expect(res.statusCode).toBe(200); expect(res.json().data.public.status).toBe('degraded');
  });
  it('rejects deployment targets outside the app allowlist', async () => {
    const app = await buildServer(config(), { run: async () => ok('main') });
    expect((await app.inject({ method: 'POST', url: '/v1/control/deploy/postgres', headers: { authorization: 'Bearer test-token-with-length' } })).statusCode).toBe(403);
  });
  it('records deployment metadata and rollback metadata', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'control-bridge-')); const cfg = config({ deploymentFile: join(dir, 'deployments.jsonl'), auditFile: join(dir, 'audit.jsonl') });
    const run: Runner = async (_binary, args) => ok(args.includes('HEAD') ? 'abc123\n' : 'main\n'); const app = await buildServer(cfg, { run });
    expect((await app.inject({ method: 'POST', url: '/v1/control/deploy/website', headers: { authorization: `Bearer ${cfg.token}` } })).statusCode).toBe(200);
    const rollback = await app.inject({ method: 'POST', url: '/v1/control/rollback/website', headers: { authorization: `Bearer ${cfg.token}` } }); expect(rollback.statusCode).toBe(200); expect(rollback.json().data.status).toBe('rolled_back');
  });
  it('rate limits requests', async () => {
    const app = await buildServer(config({ rateLimitMax: 1 }), { run: async () => ok() }); const headers = { authorization: 'Bearer test-token-with-length' };
    expect((await app.inject({ url: '/v1/control/git/status', headers })).statusCode).toBe(200); expect((await app.inject({ url: '/v1/control/git/status', headers })).statusCode).toBe(429);
  });
  it('unknown endpoints do not execute commands', async () => {
    let called = false; const app = await buildServer(config(), { run: async () => { called = true; return ok(); } });
    const res = await app.inject({ method: 'POST', url: '/v1/control/exec', headers: { authorization: 'Bearer test-token-with-length' } }); expect(res.statusCode).toBe(404); expect(called).toBe(false);
  });
  it('never includes the bearer token in command responses', async () => {
    const cfg = config(); const app = await buildServer(cfg, { run: async () => ok(cfg.token) });
    const res = await app.inject({ url: '/v1/control/docker/api/logs', headers: { authorization: `Bearer ${cfg.token}` } }); expect(res.body).not.toContain(cfg.token);
  });
});
