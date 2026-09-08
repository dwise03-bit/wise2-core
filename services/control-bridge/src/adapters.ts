import { randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { cpus, freemem, loadavg, totalmem, uptime } from 'node:os';
import type { CommandResult } from './lib/exec.js';
import { runCommand } from './lib/exec.js';
import { boundedText, redactText } from './lib/redact.js';
import type { ComponentState, ControlConfig, DeploymentRecord, MaintenanceState } from './types.js';
import { validateName } from './guards.js';

export type Runner = (binary: string, args: string[], options?: { timeoutMs?: number; maxOutputBytes?: number; cwd?: string }) => Promise<CommandResult>;

export type AdapterContext = {
  config: ControlConfig;
  run?: Runner;
  fetch?: typeof globalThis.fetch;
};

function runner(ctx: AdapterContext): Runner {
  return ctx.run ?? runCommand;
}

function fetcher(ctx: AdapterContext): typeof globalThis.fetch {
  return ctx.fetch ?? globalThis.fetch;
}

function composeArgs(ctx: AdapterContext, args: string[]): string[] {
  return ['compose', '-p', ctx.config.composeProjectName, '-f', ctx.config.composeFile, ...args];
}

function secretList(config: ControlConfig): string[] {
  return [config.token, process.env.WISE2_CONTROL_TOKEN ?? ''].filter(Boolean);
}

export async function hostMetrics(): Promise<Record<string, unknown>> {
  return {
    uptimeSeconds: uptime(),
    loadAverage: loadavg(),
    cpuCount: cpus().length,
    memory: { totalBytes: totalmem(), freeBytes: freemem(), usedBytes: totalmem() - freemem() },
  };
}

export async function diskMetrics(ctx: AdapterContext): Promise<Record<string, unknown>> {
  const result = await runner(ctx)('/bin/df', ['-Pk', '/'], { timeoutMs: 5_000, maxOutputBytes: 8_000 });
  const [, line] = result.stdout.trim().split('\n');
  const parts = line?.trim().split(/\s+/) ?? [];
  return { filesystem: parts[0], totalKb: Number(parts[1]), usedKb: Number(parts[2]), availableKb: Number(parts[3]), capacity: parts[4], mount: parts[5] };
}

export async function gpuMetrics(ctx: AdapterContext): Promise<ComponentState> {
  try {
    const result = await runner(ctx)(ctx.config.nvidiaSmiBinary, [
      '--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu',
      '--format=csv,noheader,nounits',
    ], { timeoutMs: 5_000, maxOutputBytes: 16_000 });
    if (result.code !== 0) return { status: 'unavailable', error: boundedText(result.stderr, 1_000) };
    const gpus = result.stdout.trim().split('\n').filter(Boolean).map(line => {
      const [model, utilization, memoryUsed, memoryTotal, temperature] = line.split(',').map(v => v.trim());
      return { model, utilizationPercent: Number(utilization), memoryUsedMiB: Number(memoryUsed), memoryTotalMiB: Number(memoryTotal), temperatureC: Number(temperature) };
    });
    return { status: gpus.length ? 'healthy' : 'unavailable', data: { gpus } };
  } catch (error) {
    return { status: 'unavailable', error: (error as Error).message };
  }
}

export async function dockerServices(ctx: AdapterContext): Promise<string[]> {
  try {
    const configured = await runner(ctx)(ctx.config.dockerBinary, composeArgs(ctx, ['config', '--services']), { timeoutMs: 10_000, maxOutputBytes: 32_000, cwd: ctx.config.repoDir });
    if (configured.code !== 0) return ctx.config.allowedServices;
    return configured.stdout.trim().split('\n').filter(name => ctx.config.allowedServices.includes(name));
  } catch {
    return ctx.config.allowedServices;
  }
}

export async function dockerPs(ctx: AdapterContext): Promise<string> {
  const result = await runner(ctx)(ctx.config.dockerBinary, composeArgs(ctx, ['ps', '--format', 'json']), { timeoutMs: 10_000, maxOutputBytes: 64_000, cwd: ctx.config.repoDir });
  if (result.code !== 0) throw Object.assign(new Error(redactText(result.stderr, secretList(ctx.config))), { code: 'DOCKER_PS_FAILED' });
  return redactText(result.stdout, secretList(ctx.config));
}

export async function dockerStats(ctx: AdapterContext): Promise<string> {
  const result = await runner(ctx)(ctx.config.dockerBinary, ['stats', '--no-stream', '--format', 'json'], { timeoutMs: 10_000, maxOutputBytes: 64_000 });
  if (result.code !== 0) throw Object.assign(new Error(redactText(result.stderr, secretList(ctx.config))), { code: 'DOCKER_STATS_FAILED' });
  return redactText(result.stdout, secretList(ctx.config));
}

export async function dockerLogs(ctx: AdapterContext, service: string, lines: number): Promise<string> {
  validateName(service, ctx.config.allowedServices);
  const result = await runner(ctx)(ctx.config.dockerBinary, composeArgs(ctx, ['logs', '--no-color', '--tail', String(lines), service]), { timeoutMs: 10_000, maxOutputBytes: 96_000, cwd: ctx.config.repoDir });
  if (result.code !== 0) throw Object.assign(new Error(redactText(result.stderr, secretList(ctx.config))), { code: 'DOCKER_LOGS_FAILED' });
  return redactText(result.stdout + result.stderr, secretList(ctx.config));
}

export async function restartService(ctx: AdapterContext, service: string): Promise<CommandResult> {
  validateName(service, ctx.config.allowedServices);
  const result = await runner(ctx)(ctx.config.dockerBinary, composeArgs(ctx, ['restart', service]), { timeoutMs: 30_000, maxOutputBytes: 32_000, cwd: ctx.config.repoDir });
  return { ...result, stdout: redactText(result.stdout, secretList(ctx.config)), stderr: redactText(result.stderr, secretList(ctx.config)) };
}

export async function gitRevision(ctx: AdapterContext): Promise<Record<string, string>> {
  const branch = await runner(ctx)(ctx.config.gitBinary, ['-c', `safe.directory=${ctx.config.repoDir}`, 'rev-parse', '--abbrev-ref', 'HEAD'], { cwd: ctx.config.repoDir });
  const commit = await runner(ctx)(ctx.config.gitBinary, ['-c', `safe.directory=${ctx.config.repoDir}`, 'rev-parse', 'HEAD'], { cwd: ctx.config.repoDir });
  if (branch.code !== 0 || commit.code !== 0) throw Object.assign(new Error(branch.stderr || commit.stderr), { code: 'GIT_REVISION_FAILED' });
  return { branch: branch.stdout.trim(), commit: commit.stdout.trim() };
}

export async function gitStatus(ctx: AdapterContext): Promise<Record<string, unknown>> {
  const result = await runner(ctx)(ctx.config.gitBinary, ['-c', `safe.directory=${ctx.config.repoDir}`, 'status', '--porcelain=v1'], { cwd: ctx.config.repoDir, maxOutputBytes: 64_000 });
  if (result.code !== 0) throw Object.assign(new Error(result.stderr), { code: 'GIT_STATUS_FAILED' });
  return { clean: result.stdout.trim().length === 0, porcelain: result.stdout.trim().split('\n').filter(Boolean) };
}

export async function urlHealth(ctx: AdapterContext, url: string): Promise<ComponentState> {
  try {
    const started = Date.now();
    const response = await fetcher(ctx)(url, { signal: AbortSignal.timeout(8_000) });
    return { status: response.ok ? 'healthy' : 'degraded', data: { url, statusCode: response.status, latencyMs: Date.now() - started } };
  } catch (error) {
    return { status: 'down', error: (error as Error).message };
  }
}

export async function ollamaModels(ctx: AdapterContext): Promise<ComponentState> {
  const state = await urlHealth(ctx, ctx.config.ollamaUrl);
  if (state.status !== 'healthy' || !state.data) return state;
  const response = await fetcher(ctx)(ctx.config.ollamaUrl, { signal: AbortSignal.timeout(8_000) });
  const json = await response.json() as { models?: unknown[] };
  return { status: 'healthy', data: { models: json.models ?? [] } };
}

export async function wise2Web(ctx: AdapterContext): Promise<Record<string, ComponentState>> {
  return { public: await urlHealth(ctx, ctx.config.wise2Url), api: await urlHealth(ctx, ctx.config.apiHealthUrl) };
}

async function appendDeployment(file: string, record: DeploymentRecord): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await appendFile(file, `${JSON.stringify(record)}\n`, 'utf8');
}

export async function readDeployments(file: string): Promise<DeploymentRecord[]> {
  try {
    const text = await readFile(file, 'utf8');
    return text.trim().split('\n').filter(Boolean).map(line => JSON.parse(line) as DeploymentRecord);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function createDeployment(ctx: AdapterContext, app: string): Promise<DeploymentRecord> {
  validateName(app, ctx.config.allowedApps);
  const previous = await gitRevision(ctx);
  const record: DeploymentRecord = {
    id: randomUUID(),
    app,
    previousRevision: previous.commit,
    targetRevision: previous.commit,
    status: 'pending',
    createdAt: new Date().toISOString(),
    health: { note: 'Recorded for approved GitHub Actions deployment workflow' },
  };
  await appendDeployment(ctx.config.deploymentFile, record);
  return record;
}

export async function getDeployment(ctx: AdapterContext, id: string): Promise<DeploymentRecord | null> {
  return (await readDeployments(ctx.config.deploymentFile)).find(record => record.id === id) ?? null;
}

export async function rollbackApp(ctx: AdapterContext, app: string): Promise<DeploymentRecord> {
  validateName(app, ctx.config.allowedApps);
  const deployments = (await readDeployments(ctx.config.deploymentFile)).filter(record => record.app === app);
  const last = deployments.at(-1);
  if (!last) throw Object.assign(new Error('No deployment metadata exists for rollback'), { code: 'ROLLBACK_NOT_AVAILABLE' });
  const record: DeploymentRecord = { ...last, id: randomUUID(), status: 'rolled_back', targetRevision: last.previousRevision, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() };
  await appendDeployment(ctx.config.deploymentFile, record);
  return record;
}

/* ── F5-OPS-03: diagnostics, maintenance mode, emergency stop ─────────────────────── */

/** Container state for one compose service. Read-only; nothing is executed inside it. */
async function serviceState(ctx: AdapterContext, service: string): Promise<ComponentState> {
  if (!ctx.config.allowedServices.includes(service)) {
    return { status: 'unavailable', error: `${service} is not an allowlisted service on this host` };
  }
  try {
    const result = await runner(ctx)(ctx.config.dockerBinary, composeArgs(ctx, ['ps', '--format', 'json', service]), { timeoutMs: 10_000, maxOutputBytes: 32_000, cwd: ctx.config.repoDir });
    if (result.code !== 0) return { status: 'unavailable', error: boundedText(redactText(result.stderr, secretList(ctx.config)), 1_000) };
    const rows = result.stdout.trim().split('\n').filter(Boolean).map(line => {
      try {
        return JSON.parse(line) as Record<string, unknown>;
      } catch {
        return { raw: boundedText(line, 500) };
      }
    });
    if (rows.length === 0) return { status: 'down', data: { service, containers: [] } };
    const running = rows.some(row => String(row.State ?? '').toLowerCase() === 'running');
    return { status: running ? 'healthy' : 'down', data: { service, containers: rows } };
  } catch (error) {
    return { status: 'unavailable', error: (error as Error).message };
  }
}

async function dockerNetworks(ctx: AdapterContext): Promise<ComponentState> {
  const result = await runner(ctx)(ctx.config.dockerBinary, ['network', 'ls', '--format', '{{.Name}} {{.Driver}} {{.Scope}}'], { timeoutMs: 10_000, maxOutputBytes: 16_000 });
  if (result.code !== 0) return { status: 'unavailable', error: boundedText(redactText(result.stderr, secretList(ctx.config)), 1_000) };
  return { status: 'healthy', data: { networks: result.stdout.trim().split('\n').filter(Boolean) } };
}

async function dockerDiskUsage(ctx: AdapterContext): Promise<ComponentState> {
  const result = await runner(ctx)(ctx.config.dockerBinary, ['system', 'df', '--format', '{{.Type}} {{.TotalCount}} {{.Size}} {{.Reclaimable}}'], { timeoutMs: 15_000, maxOutputBytes: 16_000 });
  if (result.code !== 0) return { status: 'unavailable', error: boundedText(redactText(result.stderr, secretList(ctx.config)), 1_000) };
  return { status: 'healthy', data: { usage: result.stdout.trim().split('\n').filter(Boolean) } };
}

/**
 * The diagnostic profiles. Each one is a fixed sequence of allowlisted reads — the profile
 * name selects a branch, it never becomes part of a command.
 */
export async function diagnose(ctx: AdapterContext, profile: string): Promise<Record<string, unknown>> {
  const settle = async (fn: () => Promise<ComponentState>): Promise<ComponentState> =>
    fn().catch(error => ({ status: 'unavailable' as const, error: (error as Error).message }));

  switch (profile) {
    case 'health':
      return {
        profile,
        host: { status: 'healthy', data: { metrics: await hostMetrics(), disk: await diskMetrics(ctx) } },
        api: await settle(() => urlHealth(ctx, ctx.config.apiHealthUrl)),
        maintenance: await readMaintenance(ctx),
      };
    case 'docker':
      return { profile, services: await dockerServices(ctx), ps: await dockerPs(ctx), stats: await dockerStats(ctx) };
    case 'disk':
      return { profile, filesystem: await diskMetrics(ctx), docker: await settle(() => dockerDiskUsage(ctx)) };
    case 'network':
      return {
        profile,
        networks: await settle(() => dockerNetworks(ctx)),
        api: await settle(() => urlHealth(ctx, ctx.config.apiHealthUrl)),
        public: await settle(() => urlHealth(ctx, ctx.config.wise2Url)),
      };
    case 'database':
      return { profile, service: await serviceState(ctx, ctx.config.databaseService) };
    case 'worker':
      return { profile, service: await serviceState(ctx, ctx.config.workerService) };
    case 'traefik':
      return { profile, service: await serviceState(ctx, ctx.config.proxyService) };
    case 'ollama':
      return { profile, status: await settle(() => urlHealth(ctx, ctx.config.ollamaUrl)), models: await settle(() => ollamaModels(ctx)) };
    default:
      throw Object.assign(new Error('Unknown diagnostic profile'), { code: 'DIAGNOSTIC_UNKNOWN' });
  }
}

export async function readMaintenance(ctx: AdapterContext): Promise<MaintenanceState> {
  try {
    const parsed = JSON.parse(await readFile(ctx.config.maintenanceFile, 'utf8')) as MaintenanceState;
    return { enabled: Boolean(parsed.enabled), changedAt: parsed.changedAt, changedBy: parsed.changedBy, jobId: parsed.jobId };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { enabled: false, changedAt: new Date(0).toISOString() };
    throw error;
  }
}

/**
 * Records the maintenance flag. This bridge only owns the flag; whatever serves traffic
 * (nginx, the app) must read it to actually shed requests — see the operations doc.
 */
export async function setMaintenance(ctx: AdapterContext, enabled: boolean, actor?: string, jobId?: string): Promise<MaintenanceState> {
  const state: MaintenanceState = { enabled, changedAt: new Date().toISOString(), changedBy: actor, jobId };
  await mkdir(dirname(ctx.config.maintenanceFile), { recursive: true });
  await writeFile(ctx.config.maintenanceFile, JSON.stringify(state), 'utf8');
  return state;
}

/**
 * Stops one explicitly designated non-critical service. The allowlist is separate from
 * the restartable services and never contains a protected name (enforced in config).
 */
export async function emergencyStop(ctx: AdapterContext, service: string): Promise<CommandResult> {
  validateName(service, ctx.config.allowedStoppable);
  const result = await runner(ctx)(ctx.config.dockerBinary, composeArgs(ctx, ['stop', service]), { timeoutMs: 30_000, maxOutputBytes: 32_000, cwd: ctx.config.repoDir });
  return { ...result, stdout: redactText(result.stdout, secretList(ctx.config)), stderr: redactText(result.stderr, secretList(ctx.config)) };
}
