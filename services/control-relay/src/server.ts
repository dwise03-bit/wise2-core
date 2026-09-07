import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import {
  createNonceStore, publicTargets, verifyJob,
  type Confirmation, type Job, type NonceStore, type Signed,
} from '../../../packages/ops-protocol/src/index.js';
import { appendAudit, readAudit } from './audit.js';
import { loadConfig } from './config.js';
import { createProgressTracker, type ProgressTracker } from './progress.js';
import { loadRegistry, RegistryError, type TargetRegistry } from './targets.js';
import { dispatch } from './transport.js';
import type { Envelope, RelayConfig } from './types.js';

export type BuildOptions = {
  registry?: TargetRegistry;
  fetchImpl?: typeof globalThis.fetch;
  nonces?: NonceStore;
  progress?: ProgressTracker;
};

function ok<T>(requestId: string, action: string, data: T, target?: string, jobId?: string): Envelope<T> {
  return { ok: true, requestId, jobId, action, target, timestamp: new Date().toISOString(), data };
}

function fail(requestId: string, action: string, code: string, message: string, detail?: string, target?: string, jobId?: string): Envelope<never> {
  return { ok: false, requestId, jobId, action, target, timestamp: new Date().toISOString(), error: { code, message, detail } };
}

function tokenEqual(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Rejections that are the caller's fault vs. the fleet's. */
function statusForCode(code: string): number {
  if (['SIGNATURE_INVALID', 'KEY_UNKNOWN'].includes(code)) return 401;
  if (['ROLE_DENIED', 'TARGET_UNKNOWN', 'PROFILE_NOT_ALLOWED_ON_TARGET', 'ENVIRONMENT_MISMATCH'].includes(code)) return 403;
  if (['NONCE_REPLAYED'].includes(code)) return 409;
  if (['TARGET_UNREACHABLE'].includes(code)) return 502;
  if (['PROFILE_NOT_IMPLEMENTED'].includes(code)) return 501;
  return 400;
}

export async function buildServer(config: RelayConfig = loadConfig(), options: BuildOptions = {}) {
  const app = Fastify({ logger: false, genReqId: req => String(req.headers['x-request-id'] ?? randomUUID()) });
  const nonces = options.nonces ?? createNonceStore();
  const progress = options.progress ?? createProgressTracker(config.jobRetentionMs);
  const registry = options.registry ?? await loadRegistry(config.targetsFile);
  const secrets = [config.token, ...config.signingKeys.map(key => key.secret), ...registry.tokens.values()];

  await app.register(rateLimit, { max: config.rateLimitMax, timeWindow: config.rateLimitWindowMs });

  app.addHook('preHandler', async (request, reply) => {
    if (request.method === 'GET' && request.url === '/v1/relay/health') return;
    const header = request.headers.authorization;
    const bearer = typeof header === 'string' ? /^Bearer\s+(.+)$/i.exec(header.trim())?.[1] : undefined;
    if (!bearer || !tokenEqual(bearer, config.token)) {
      await reply.code(401).send(fail(request.id, 'auth', 'UNAUTHORIZED', 'Missing or invalid relay token'));
    }
  });

  app.get('/v1/relay/health', async request => ok(request.id, 'health', { status: 'ok', targets: registry.targets.length }));
  /** Aliases only — the registry's addresses and key references never leave this process. */
  app.get('/v1/relay/targets', async request => ok(request.id, 'targets', { targets: publicTargets(registry.targets) }));
  app.get('/v1/relay/jobs', async request => ok(request.id, 'jobs', { jobs: progress.list() }));
  app.get('/v1/relay/jobs/:jobId', async (request, reply) => {
    const found = progress.get((request.params as { jobId: string }).jobId);
    if (!found) return reply.code(404).send(fail(request.id, 'job.status', 'JOB_UNKNOWN', 'No such job'));
    return ok(request.id, 'job.status', found, found.target, found.jobId);
  });
  app.get('/v1/relay/audit', async request => {
    const limit = Number((request.query as { limit?: string }).limit ?? 100);
    return ok(request.id, 'audit', { entries: await readAudit(config.auditFile, Number.isFinite(limit) ? limit : 100) });
  });

  app.post('/v1/relay/jobs', async (request, reply) => {
    const startedAt = new Date().toISOString();
    const body = request.body as { job?: Signed<Job>; confirmations?: Signed<Confirmation>[] } | undefined;

    const audit = async (entry: Partial<Parameters<typeof appendAudit>[1]>, okResult: boolean) => {
      await appendAudit(config.auditFile, {
        requestId: String(request.id), startedAt, endedAt: new Date().toISOString(), ok: okResult, ...entry,
      } as Parameters<typeof appendAudit>[1], secrets);
    };

    if (!body || typeof body !== 'object' || !body.job) {
      await audit({ errorCode: 'SIGNED_JOB_REQUIRED' }, false);
      return reply.code(400).send(fail(request.id, 'job', 'SIGNED_JOB_REQUIRED', 'A signed job envelope is required'));
    }

    const verified = verifyJob({
      envelope: body.job,
      keys: config.signingKeys,
      targets: registry.targets,
      confirmations: Array.isArray(body.confirmations) ? body.confirmations : [],
      nonces,
    });
    if (!verified.ok) {
      await audit({ errorCode: verified.code }, false);
      return reply.code(statusForCode(verified.code)).send(fail(request.id, 'job', verified.code, verified.message, verified.detail));
    }

    const { job, target } = verified.value;
    const identity = {
      jobId: job.jobId, actor: job.actor.displayName, actorId: job.actor.id, actorRole: job.actor.role,
      target: target.alias, environment: job.environment, actionProfile: job.actionProfile, transport: target.transport,
    };
    progress.start({
      jobId: job.jobId, actor: job.actor.displayName, target: target.alias,
      environment: job.environment, actionProfile: job.actionProfile, startedAt,
    });
    progress.advance(job.jobId, 'dispatched');

    const result = await dispatch({
      target,
      job,
      envelope: body.job,
      confirmations: Array.isArray(body.confirmations) ? body.confirmations : [],
      bridgeToken: registry.tokens.get(target.alias),
      timeoutMs: config.requestTimeoutMs,
      fetchImpl: options.fetchImpl,
    });

    if (!result.ok) {
      progress.advance(job.jobId, result.code === 'TARGET_UNREACHABLE' ? 'failed' : 'blocked', { error: { code: result.code, message: result.message } });
      await audit({ ...identity, errorCode: result.code, status: result.status }, false);
      return reply.code(statusForCode(result.code)).send(fail(request.id, job.actionProfile, result.code, result.message, result.detail, target.alias, job.jobId));
    }

    progress.advance(job.jobId, 'complete', { evidence: result.data });
    await audit({ ...identity, status: result.status }, true);
    return ok(request.id, job.actionProfile, result.data, target.alias, job.jobId);
  });

  app.setNotFoundHandler(async (request, reply) => reply.code(404).send(fail(request.id, 'not_found', 'NOT_FOUND', 'Endpoint not found')));
  app.setErrorHandler(async (error, request, reply) => {
    const fastifyError = error as Error & { statusCode?: number };
    if (fastifyError.statusCode === 429) {
      await reply.code(429).send(fail(request.id, 'rate_limit', 'RATE_LIMITED', 'Too many requests'));
      return;
    }
    await reply.code(500).send(fail(request.id, 'error', 'RELAY_ERROR', 'Request failed'));
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  try {
    const app = await buildServer(config);
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    // A relay that cannot load its registry must not run: it would answer every job with
    // a failure while looking healthy.
    if (error instanceof RegistryError) console.error(`[control-relay] ${error.code}: ${error.message}`);
    else console.error('[control-relay] failed to start');
    process.exit(1);
  }
}
