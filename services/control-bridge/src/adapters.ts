import { randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { cpus, freemem, loadavg, totalmem, uptime } from 'node:os';
import type { CommandResult } from './lib/exec.js';
import { runCommand } from './lib/exec.js';
import { boundedText, redactText } from './lib/redact.js';
import type { ComponentState, ControlConfig, DeploymentRecord } from './types.js';
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
    const configured = await runner(ctx)(ctx.config.dockerBinary, ['compose', '-f', ctx.config.composeFile, 'config', '--services'], { timeoutMs: 10_000, maxOutputBytes: 32_000, cwd: ctx.config.repoDir });
    if (configured.code !== 0) return ctx.config.allowedServices;
    return configured.stdout.trim().split('\n').filter(name => ctx.config.allowedServices.includes(name));
  } catch {
    return ctx.config.allowedServices;
  }
}

export async function dockerPs(ctx: AdapterContext): Promise<string> {
  const result = await runner(ctx)(ctx.config.dockerBinary, ['compose', '-f', ctx.config.composeFile, 'ps', '--format', 'json'], { timeoutMs: 10_000, maxOutputBytes: 64_000, cwd: ctx.config.repoDir });
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
  const result = await runner(ctx)(ctx.config.dockerBinary, ['compose', '-f', ctx.config.composeFile, 'logs', '--no-color', '--tail', String(lines), service], { timeoutMs: 10_000, maxOutputBytes: 96_000, cwd: ctx.config.repoDir });
  if (result.code !== 0) throw Object.assign(new Error(redactText(result.stderr, secretList(ctx.config))), { code: 'DOCKER_LOGS_FAILED' });
  return redactText(result.stdout + result.stderr, secretList(ctx.config));
}

export async function restartService(ctx: AdapterContext, service: string): Promise<CommandResult> {
  validateName(service, ctx.config.allowedServices);
  const result = await runner(ctx)(ctx.config.dockerBinary, ['compose', '-f', ctx.config.composeFile, 'restart', service], { timeoutMs: 30_000, maxOutputBytes: 32_000, cwd: ctx.config.repoDir });
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
