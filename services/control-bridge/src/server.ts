import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { loadConfig } from './config.js';
import { buildAuthHook } from './auth.js';
import { appendAudit, readAudit } from './lib/audit.js';
import { clampLines, validateName } from './guards.js';
import { boundedText, redactText } from './lib/redact.js';
import type { ControlConfig, Envelope, HermesImageRequest } from './types.js';
import { createDeployment, diskMetrics, dockerLogs, dockerPs, dockerServices, dockerStats, getDeployment, gitRevision, gitStatus, gpuMetrics, hostMetrics, ollamaModels, restartService, rollbackApp, urlHealth, wise2Web, type AdapterContext, type Runner } from './adapters.js';

type BuildOptions = { run?: Runner; fetch?: typeof globalThis.fetch };

const hermesImageSchema = z.object({
  instruction: z.string().trim().min(1).max(4000),
  references: z.array(z.object({
    id: z.string().trim().min(1).max(200),
    url: z.string().url().max(2048),
    role: z.enum(['LOCKED', 'EDITABLE', 'NEW']).optional(),
    kind: z.enum(['person', 'logo', 'hardware', 'screenshot', 'approved-art', 'other']).optional(),
    label: z.string().max(200).optional(),
  }).strip()).max(20).optional(),
  deliverToDiscord: z.boolean().optional(),
  discordChannel: z.enum(['builds', 'alerts', 'decisions', 'images']).optional(),
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16']).optional(),
}).strip();

function ok<T>(requestId: string, action: string, data: T, target?: string): Envelope<T> {
  return { ok: true, requestId, action, target, timestamp: new Date().toISOString(), data };
}

function err(requestId: string, action: string, code: string, message: string, detail?: string, target?: string): Envelope<never> {
  return { ok: false, requestId, action, target, timestamp: new Date().toISOString(), error: { code, message, detail } };
}

function codeOf(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : 'CONTROL_ERROR';
}

export async function buildServer(config: ControlConfig = loadConfig(), options: BuildOptions = {}) {
  const app = Fastify({ logger: false, genReqId: req => String(req.headers['x-request-id'] ?? randomUUID()) });
  const ctx: AdapterContext = { config, run: options.run, fetch: options.fetch };
  const doFetch = options.fetch ?? globalThis.fetch;
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
    const result = await restartService(ctx, service);
    await appendAudit(config.auditFile, { requestId: request.id, actor: config.actor, action: 'docker.restart', target: service, source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: result.code === 0, exitCode: result.code }, [config.token]);
    if (result.code !== 0) return reply.code(500).send(err(request.id, 'docker.restart', 'RESTART_FAILED', 'Service restart failed', result.stderr, service));
    return ok(request.id, 'docker.restart', result, service);
  });
  app.get('/v1/control/git/status', async request => ok(request.id, 'git.status', await gitStatus(ctx)));
  app.get('/v1/control/git/revision', async request => ok(request.id, 'git.revision', await gitRevision(ctx)));
  app.get('/v1/control/ollama/status', async request => ok(request.id, 'ollama.status', await urlHealth(ctx, config.ollamaUrl)));
  app.get('/v1/control/ollama/models', async request => ok(request.id, 'ollama.models', await ollamaModels(ctx)));
  app.get('/v1/control/hermes/status', async request => ok(request.id, 'hermes.status', await urlHealth(ctx, config.hermesUrl)));
  app.post('/v1/control/hermes/image', async (request, reply) => {
    const startedAt = new Date().toISOString();
    const action = 'hermes.image.submit';
    const secrets = [config.token, config.hermesBearerToken].filter(Boolean);
    if (!config.hermesBearerToken) {
      await appendAudit(config.auditFile, { requestId: request.id, actor: config.actor, action, target: 'hermes', source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: false, errorCode: 'HERMES_NOT_CONFIGURED' }, secrets);
      return reply.code(503).send(err(request.id, action, 'HERMES_NOT_CONFIGURED', 'Hermes image submission is not configured', undefined, 'hermes'));
    }
    const parsed = hermesImageSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send(err(request.id, action, 'INVALID_HERMES_REQUEST', 'Hermes image request is invalid', undefined, 'hermes'));
    }
    try {
      const response = await doFetch(config.hermesImageUrl, {
        method: 'POST',
        headers: { authorization: `Bearer ${config.hermesBearerToken}`, 'content-type': 'application/json', 'x-request-id': request.id },
        body: JSON.stringify(parsed.data satisfies HermesImageRequest),
        signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) {
        const detail = redactText(boundedText(await response.text(), 1000), secrets);
        await appendAudit(config.auditFile, { requestId: request.id, actor: config.actor, action, target: 'hermes', source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: false, errorCode: 'HERMES_UPSTREAM_FAILED' }, secrets);
        return reply.code(502).send(err(request.id, action, 'HERMES_UPSTREAM_FAILED', 'Hermes rejected the image request', detail, 'hermes'));
      }
      const data = await response.json() as Record<string, unknown>;
      await appendAudit(config.auditFile, { requestId: request.id, actor: config.actor, action, target: 'hermes', source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: true }, secrets);
      return ok(request.id, action, data, 'hermes');
    } catch (error) {
      const detail = redactText(boundedText((error as Error).message, 1000), secrets);
      await appendAudit(config.auditFile, { requestId: request.id, actor: config.actor, action, target: 'hermes', source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: false, errorCode: 'HERMES_UPSTREAM_UNAVAILABLE' }, secrets);
      return reply.code(502).send(err(request.id, action, 'HERMES_UPSTREAM_UNAVAILABLE', 'Hermes image submission failed', detail, 'hermes'));
    }
  });
  app.get('/v1/control/web/wise2', async request => ok(request.id, 'web.wise2', await wise2Web(ctx)));
  app.post('/v1/control/deploy/:app', async request => {
    const target = validateName((request.params as { app: string }).app, config.allowedApps);
    const record = await createDeployment(ctx, target);
    await appendAudit(config.auditFile, { requestId: request.id, actor: config.actor, action: 'deploy', target, source: request.ip, startedAt: record.createdAt, endedAt: new Date().toISOString(), ok: true }, [config.token]);
    return ok(request.id, 'deploy', record, target);
  });
  app.get('/v1/control/deploy/:deploymentId', async (request, reply) => {
    const record = await getDeployment(ctx, (request.params as { deploymentId: string }).deploymentId);
    if (!record) return reply.code(404).send(err(request.id, 'deploy.status', 'DEPLOYMENT_NOT_FOUND', 'Deployment was not found'));
    return ok(request.id, 'deploy.status', record, record.app);
  });
  app.post('/v1/control/rollback/:app', async (request, reply) => {
    const startedAt = new Date().toISOString();
    try {
      const target = validateName((request.params as { app: string }).app, config.allowedApps);
      const record = await rollbackApp(ctx, target);
      await appendAudit(config.auditFile, { requestId: request.id, actor: config.actor, action: 'rollback', target, source: request.ip, startedAt, endedAt: new Date().toISOString(), ok: true }, [config.token]);
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
