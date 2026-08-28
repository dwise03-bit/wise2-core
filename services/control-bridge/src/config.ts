import type { ControlConfig } from './types.js';

const DEFAULT_SERVICES = [
  'postgres', 'redis', 'mongodb', 'api', 'ollama', 'open-webui', 'website',
  'dashboard', 'admin', 'studio', 'command-center', 'worker', 'prometheus', 'grafana',
];
const DEFAULT_APPS = ['website', 'dashboard', 'admin', 'studio', 'command-center', 'api', 'worker'];

function csv(value: string | undefined, fallback: string[]): string[] {
  return (value ? value.split(',') : fallback).map(v => v.trim()).filter(Boolean);
}

function numberValue(value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ControlConfig {
  const token = env.WISE2_CONTROL_TOKEN?.trim();
  if (!token) throw new Error('WISE2_CONTROL_TOKEN is required');
  if (env.NODE_ENV === 'production' && token.length < 16) {
    throw new Error('WISE2_CONTROL_TOKEN must be at least 16 characters in production');
  }
  return {
    host: env.WISE2_CONTROL_HOST ?? '127.0.0.1',
    port: numberValue(env.WISE2_CONTROL_PORT, 3099),
    nodeEnv: env.NODE_ENV ?? 'development',
    token,
    actor: env.WISE2_CONTROL_ACTOR ?? 'chatgpt',
    repoDir: env.WISE2_REPO_DIR ?? '/home/dwise/wise2-core',
    composeFile: env.WISE2_COMPOSE_FILE ?? '/home/dwise/wise2-core/docker-compose.production.yml',
    auditFile: env.WISE2_AUDIT_FILE ?? '/data/control-bridge/audit.jsonl',
    deploymentFile: env.WISE2_DEPLOYMENT_FILE ?? '/data/control-bridge/deployments.jsonl',
    dockerBinary: env.WISE2_DOCKER_BINARY ?? '/usr/bin/docker',
    gitBinary: env.WISE2_GIT_BINARY ?? '/usr/bin/git',
    nvidiaSmiBinary: env.WISE2_NVIDIA_SMI_BINARY ?? '/usr/bin/nvidia-smi',
    allowedServices: csv(env.WISE2_ALLOWED_SERVICES, DEFAULT_SERVICES),
    allowedApps: csv(env.WISE2_ALLOWED_APPS, DEFAULT_APPS),
    ollamaUrl: env.WISE2_OLLAMA_URL ?? 'http://127.0.0.1:11434/api/tags',
    hermesUrl: env.WISE2_HERMES_URL ?? 'http://127.0.0.1:3012/api/health',
    wise2Url: env.WISE2_PUBLIC_URL ?? 'https://wise2.net',
    apiHealthUrl: env.WISE2_API_HEALTH_URL ?? 'http://127.0.0.1:3010/api/health',
    rateLimitMax: numberValue(env.WISE2_CONTROL_RATE_LIMIT_MAX, 60),
    rateLimitWindowMs: numberValue(env.WISE2_CONTROL_RATE_LIMIT_WINDOW_MS, 60_000),
  };
}
