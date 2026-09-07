import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'node:crypto';
import { loadConfig } from './config.js';
import { buildAuthHook } from './auth.js';
import { appendAudit, readAudit } from './lib/audit.js';
import { loadIdempotencyLedger, type IdempotencyEntry, type IdempotencyLedger } from './lib/idempotency.js';
import { authorizeWrite, createJobNonceStore, releaseMatches, type AuthorizationFailure, type AuthorizedWrite } from './jobs.js';
import { clampLines, validateName } from './guards.js';
import type { NonceStore } from '../../../packages/ops-protocol/src/index.js';
import type { ControlConfig, Envelope } from './types.js';
import { createDeployment, diskMetrics, dockerLogs, dockerPs, dockerServices, dockerStats, getDeployment, gitRevision, gitStatus, gpuMetrics, hostMetrics, ollamaModels, restartService, rollbackApp, urlHealth, wise2Web, type AdapterContext, type Runner } from './adapters.js';

type BuildOptions = {
  run?: Runner;
  fetch?: typeof globalThis.fetch;
  nonces?: NonceStore;
  ledger?: IdempotencyLedger;
};

function ok<T>(requestId: string, action: string, data: T, target?: string): Envelope<T> {
  return { ok: true, requestId, action, target, timestamp: new Date().toISOString(), data };
}

function err(requestId: string, action: string, code: string, message: string, detail?: string, target?: string): Envelope<never> {
  return { ok: false, requestId, action, target, timestamp: new Date().toISOString(), error: { code, message, detail } };
}

function codeOf(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : 'CONTROL_ERROR';
}

/** Maps a rejected job to an HTTP status: 403 for "not allowed", 409 for replay, else 400. */
function statusForFailure(failure: AuthorizationFailure): number {
  if (failure.code === 'ROLE_DENIED' || failure.code === 'PROFILE_NOT_ALLOWED_ON_TARGET' || failure.code === 'TARGET_UNKNOWN') return 403;
  if (failure.code === 'NONCE_REPLAYED' || failure.code === 'IDEMPOTENCY_REPLAY') return 409;
  if (failure.code === 'SIGNATURE_INVALID' || failure.code === 'KEY_UNKNOWN' || failure.code === 'SIGNED_JOB_REQUIRED') return 401;
  return 400;
}

/** Audit identity for an action: the real actor when signed, the configured fallback otherwise. */
function auditIdentity(config: ControlConfig, write: AuthorizedWrite | null) {
  if (!write) return { actor: config.actor };
  return {
    actor: write.job.actor.displayName,
    actorId: write.job.actor.id,
    actorRole: write.job.actor.role,
    jobId: write.job.jobId,
    profile: write.job.actionProfile,
    environment: write.job.environment,
    idempotencyKey: write.idempotencyKey,
  };
}

export async function buildServer(config: ControlConfig = loadConfig(), options: BuildOptions = {}) {
  const app = Fastify({ logger: false, genReqId: req => String(req.headers['x-request-id'] ?? randomUUID()) });
  const ctx: AdapterContext = { config, run: options.run, fetch: options.fetch };
  const nonces = options.nonces ?? createJobNonceStore();
  const ledger: IdempotencyLedger = options.ledger ?? await loadIdempotencyLedger(config.idempotencyFile);

  type GateResult =
    | { rejected: AuthorizationFailure }
    | { replayed: IdempotencyEntry; write: AuthorizedWrite }
    | { write: AuthorizedWrite | null };

  /**
   * Shared gate for every write. Returns either the authorized job, a rejection to send
   * back, or the prior result when this exact request has already been executed.
   */
  const gate = async (request: { id: string; body: unknown; ip: string }, action: string, expectedProfile: string, expectedArgs: Record<string, string>, target: string): Promise<GateResult> => {
    const authorized = authorizeWrite({ config, body: request.body, expectedProfile, expectedArgs, nonces });
    if (!authorized.ok) {
      await appendAudit(config.auditFile, {
        requestId: request.id, actor: config.actor, action, target, source: request.ip,
        startedAt: new Date().toISOString(), endedAt: new Date().toISOString(),
        ok: false, errorCode: authorized.failure.code,
      }, [config.token]);
      return { rejected: authorized.failure };
    }
    const write = authorized.write;
    const prior = write ? ledger.lookup(write.idempotencyKey) : undefined;
    if (write && prior) {
      await appendAudit(config.auditFile, {
        ...auditIdentity(config, write),
        requestId: request.id, action, target, source: request.ip,
        startedAt: new Date().toISOString(), endedAt: new Date().toISOString(),
        ok: true, replayed: true,
      }, [config.token]);
      return { replayed: prior, write };
    }
    return { write };
  };
  await app.register(rateLimit, { max: config.rateLimitMax, timeWindow: config.rateLimitWindowMs });
  app.addHook('preHandler', buildAuthHook(config));

  app.get('/v1/control/health', async request => ok(request.id, 'health', { status: 'ok' }));
  app.get('/v1/control/audit', async request => ok(request.id, 'audit', { entries: await readAudit(config.auditFile, clampLines((request.query as { limit?: string }).limit, 100, 500)) }));
  app.get('/v1/control/host/metrics', async request => ok(request.id, 'host.metrics', { host: await hostMetrics(), disk: await diskMetrics(ctx) }));
  app.get('/v1/control/host/gpu', async request => ok(request.id, 'host.gpu', await gpuMetrics(ctx)));
  app.get('/v1/control/docker/services', async request => ok(request.id, 'docker.services', { services: await dockerServices(ctx) }));
  app.get('/v1/control/docker/stats', async request => ok(request.id, 'docker.stats', { stats: await dockerStats(ctx) }));
  app.get('/v1/control/docker/:service/logs', async request => {
    const service = validateName((request.params as { service: string }).service, config.allowedServices);
    return ok(request.id, 'docker.logs', { logs: await dockerLogs(ctx, service, clampLines((request.query as { lines?: string }).lines)) }, service);
  });
  app.post('/v1/control/docker/:service/restart', async (request, reply) => {
    const startedAt = new Date().toISOString();
    const service = validateName((request.params as { service: string }).service, config.allowedServices);
    const gated = await gate(request, 'docker.restart', 'restart', { service }, service);
    if ('rejected' in gated) return reply.code(statusForFailure(gated.rejected)).send(err(request.id, 'docker.restart', gated.rejected.code, gated.rejected.message, gated.rejected.detail, service));
    if ('replayed' in gated) return ok(request.id, 'docker.restart', { idempotent: true, previous: gated.replayed }, service);

    const result = await restartService(ctx, service);
    await appendAudit(config.auditFile, { ...auditIdentity(config, gated.write), requestId: request.id, action: 'docker.restart', target: service, source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: result.code === 0, exitCode: result.code }, [config.token]);
    if (result.code !== 0) return reply.code(500).send(err(request.id, 'docker.restart', 'RESTART_FAILED', 'Service restart failed', result.stderr, service));
    if (gated.write) await ledger.record({ key: gated.write.idempotencyKey, jobId: gated.write.job.jobId, action: 'docker.restart', target: service, recordedAt: new Date().toISOString(), requestId: String(request.id) });
    return ok(request.id, 'docker.restart', result, service);
  });
  app.get('/v1/control/git/status', async request => ok(request.id, 'git.status', await gitStatus(ctx)));
  app.get('/v1/control/git/revision', async request => ok(request.id, 'git.revision', await gitRevision(ctx)));
  app.get('/v1/control/ollama/status', async request => ok(request.id, 'ollama.status', await urlHealth(ctx, config.ollamaUrl)));
  app.get('/v1/control/ollama/models', async request => ok(request.id, 'ollama.models', await ollamaModels(ctx)));
  app.get('/v1/control/hermes/status', async request => ok(request.id, 'hermes.status', await urlHealth(ctx, config.hermesUrl)));
  app.get('/v1/control/web/wise2', async request => ok(request.id, 'web.wise2', await wise2Web(ctx)));
  app.post('/v1/control/deploy/:app', async (request, reply) => {
    const target = validateName((request.params as { app: string }).app, config.allowedApps);
    const gated = await gate(request, 'deploy', 'deploy', { app: target }, target);
    if ('rejected' in gated) return reply.code(statusForFailure(gated.rejected)).send(err(request.id, 'deploy', gated.rejected.code, gated.rejected.message, gated.rejected.detail, target));
    if ('replayed' in gated) return ok(request.id, 'deploy', { idempotent: true, previous: gated.replayed }, target);

    const record = await createDeployment(ctx, target);
    // The operator confirmed a specific release; refuse to record a deployment of another.
    if (!releaseMatches(gated.write?.job.args.releaseId, record.targetRevision)) {
      await appendAudit(config.auditFile, { ...auditIdentity(config, gated.write), requestId: request.id, action: 'deploy', target, source: request.ip, startedAt: record.createdAt, endedAt: new Date().toISOString(), ok: false, errorCode: 'RELEASE_MISMATCH' }, [config.token]);
      return reply.code(409).send(err(request.id, 'deploy', 'RELEASE_MISMATCH', 'Host revision does not match the confirmed release', record.targetRevision, target));
    }
    await appendAudit(config.auditFile, { ...auditIdentity(config, gated.write), requestId: request.id, action: 'deploy', target, source: request.ip, startedAt: record.createdAt, endedAt: new Date().toISOString(), ok: true }, [config.token]);
    if (gated.write) await ledger.record({ key: gated.write.idempotencyKey, jobId: gated.write.job.jobId, action: 'deploy', target, recordedAt: new Date().toISOString(), requestId: String(request.id) });
    return ok(request.id, 'deploy', record, target);
  });
  app.get('/v1/control/deploy/:deploymentId', async (request, reply) => {
    const record = await getDeployment(ctx, (request.params as { deploymentId: string }).deploymentId);
    if (!record) return reply.code(404).send(err(request.id, 'deploy.status', 'DEPLOYMENT_NOT_FOUND', 'Deployment was not found'));
    return ok(request.id, 'deploy.status', record, record.app);
  });
  app.post('/v1/control/rollback/:app', async (request, reply) => {
    const startedAt = new Date().toISOString();
    const target = validateName((request.params as { app: string }).app, config.allowedApps);
    const gated = await gate(request, 'rollback', 'rollback', { app: target }, target);
    if ('rejected' in gated) return reply.code(statusForFailure(gated.rejected)).send(err(request.id, 'rollback', gated.rejected.code, gated.rejected.message, gated.rejected.detail, target));
    if ('replayed' in gated) return ok(request.id, 'rollback', { idempotent: true, previous: gated.replayed }, target);
    try {
      const record = await rollbackApp(ctx, target);
      if (!releaseMatches(gated.write?.job.args.releaseId, record.targetRevision)) {
        await appendAudit(config.auditFile, { ...auditIdentity(config, gated.write), requestId: request.id, action: 'rollback', target, source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: false, errorCode: 'RELEASE_MISMATCH' }, [config.token]);
        return reply.code(409).send(err(request.id, 'rollback', 'RELEASE_MISMATCH', 'Prior release does not match the confirmed release', record.targetRevision, target));
      }
      await appendAudit(config.auditFile, { ...auditIdentity(config, gated.write), requestId: request.id, action: 'rollback', target, source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: true }, [config.token]);
      if (gated.write) await ledger.record({ key: gated.write.idempotencyKey, jobId: gated.write.job.jobId, action: 'rollback', target, recordedAt: new Date().toISOString(), requestId: String(request.id) });
      return ok(request.id, 'rollback', record, target);
    } catch (error) {
      return reply.code(404).send(err(request.id, 'rollback', codeOf(error), (error as Error).message));
    }
  });
  app.get('/v1/control/status', async request => {
    const settle = async <T>(fn: () => Promise<T>) => fn().then(data => ({ status: 'healthy' as const, data })).catch(error => ({ status: 'degraded' as const, error: (error as Error).message }));
    return ok(request.id, 'status', {
      host: await settle(async () => ({ metrics: await hostMetrics(), disk: await diskMetrics(ctx) })),
      docker: await settle(async () => ({ services: await dockerServices(ctx), ps: await dockerPs(ctx) })),
      git: await settle(() => gitRevision(ctx)),
      web: await settle(() => wise2Web(ctx)),
      ollama: await urlHealth(ctx, config.ollamaUrl),
      hermes: await urlHealth(ctx, config.hermesUrl),
    });
  });
  app.setNotFoundHandler(async (request, reply) => reply.code(404).send(err(request.id, 'not_found', 'NOT_FOUND', 'Endpoint not found')));
  app.setErrorHandler(async (error, request, reply) => {
    const fastifyError = error as Error & { statusCode?: number };
    if (fastifyError.statusCode === 429) {
      await reply.code(429).send(err(request.id, 'rate_limit', 'RATE_LIMITED', 'Too many requests'));
      return;
    }
    const status = codeOf(error) === 'TARGET_NOT_ALLOWED' ? 403 : 500;
    await reply.code(status).send(err(request.id, 'error', codeOf(error), status === 403 ? 'Target is not allowlisted' : 'Request failed'));
  });
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = await buildServer(config);
  await app.listen({ host: config.host, port: config.port });
}
