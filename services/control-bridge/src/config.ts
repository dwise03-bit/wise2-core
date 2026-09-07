import { profileIds } from '../../../packages/ops-protocol/src/index.js';
import type { Environment } from '../../../packages/ops-protocol/src/index.js';
import type { SigningKey } from '../../../packages/ops-protocol/src/signature.js';
import type { ControlConfig } from './types.js';

const DEFAULT_SERVICES = [
  'postgres', 'redis', 'mongodb', 'api', 'ollama', 'open-webui', 'website',
  'dashboard', 'admin', 'studio', 'command-center', 'worker', 'prometheus', 'grafana',
];
const DEFAULT_APPS = ['website', 'dashboard', 'admin', 'studio', 'command-center', 'api', 'worker'];
/**
 * Profiles this bridge implements today. `maintenance` and `emergency-stop` are
 * deliberately absent until their adapters land (F5-OPS-03); a job naming them is
 * rejected as not-allowed-on-target rather than silently accepted.
 */
const DEFAULT_PROFILES = ['status', 'services', 'logs', 'diagnose', 'deploy-status', 'restart', 'deploy', 'rollback', 'maintenance', 'emergency-stop'];
/**
 * Services that may never be stopped by an operator action, whatever the configuration
 * says. Stopping any of these takes the platform down rather than shedding load.
 */
const PROTECTED_SERVICES = ['postgres', 'redis', 'mongodb', 'api', 'control-bridge'];
const ENVIRONMENTS: readonly Environment[] = ['development', 'staging', 'production'];

function booleanValue(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') return fallback;
  return !['0', 'false', 'no', 'off'].includes(value.trim().toLowerCase());
}

/**
 * Parses `keyId:secret,keyId2:secret2`. Two keys may share an id only across a rotation,
 * so duplicates are rejected rather than silently shadowing one another.
 */
export function parseSigningKeys(value: string | undefined): SigningKey[] {
  const keys: SigningKey[] = [];
  for (const pair of csv(value, [])) {
    const separator = pair.indexOf(':');
    if (separator <= 0) throw new Error('WISE2_OPS_SIGNING_KEYS entries must be formatted as keyId:secret');
    const keyId = pair.slice(0, separator).trim();
    const secret = pair.slice(separator + 1).trim();
    if (!keyId || secret.length < 32) throw new Error('WISE2_OPS_SIGNING_KEYS secrets must be at least 32 characters');
    if (keys.some(existing => existing.keyId === keyId)) throw new Error(`Duplicate signing key id: ${keyId}`);
    keys.push({ keyId, secret });
  }
  return keys;
}

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
  const targetAlias = env.WISE2_TARGET_ALIAS ?? 'wise2-core';
  const targetEnvironment = (env.WISE2_TARGET_ENVIRONMENT ?? (env.NODE_ENV === 'production' ? 'production' : 'development')) as Environment;
  if (!ENVIRONMENTS.includes(targetEnvironment)) throw new Error('WISE2_TARGET_ENVIRONMENT must be development, staging or production');

  const allowedProfiles = csv(env.WISE2_ALLOWED_PROFILES, DEFAULT_PROFILES);
  const unknownProfile = allowedProfiles.find(profile => !profileIds().includes(profile));
  if (unknownProfile) throw new Error(`WISE2_ALLOWED_PROFILES contains an unknown profile: ${unknownProfile}`);

  // Nothing is stoppable unless it is named explicitly, and a protected service can never
  // be named — a typo in the environment must not become an outage.
  const allowedStoppable = csv(env.WISE2_ALLOWED_STOPPABLE, []);
  const protectedStoppable = allowedStoppable.find(service => PROTECTED_SERVICES.includes(service));
  if (protectedStoppable) {
    throw new Error(`WISE2_ALLOWED_STOPPABLE may not include the protected service: ${protectedStoppable}`);
  }

  const signingKeys = parseSigningKeys(env.WISE2_OPS_SIGNING_KEYS);
  const requireSignedWrites = booleanValue(env.WISE2_REQUIRE_SIGNED_WRITES, true);
  // Fail closed: a bridge that demands signed writes but holds no key can never satisfy
  // one, so refuse to start rather than reject every operator action at 03:00.
  if (requireSignedWrites && signingKeys.length === 0) {
    throw new Error('WISE2_OPS_SIGNING_KEYS is required when signed writes are enforced');
  }

  return {
    host: env.WISE2_CONTROL_HOST ?? '127.0.0.1',
    port: numberValue(env.WISE2_CONTROL_PORT, 3099),
    nodeEnv: env.NODE_ENV ?? 'development',
    token,
    actor: env.WISE2_CONTROL_ACTOR ?? 'chatgpt',
    repoDir: env.WISE2_REPO_DIR ?? '/home/dwise/wise2-core',
    composeFile: env.WISE2_COMPOSE_FILE ?? '/home/dwise/wise2-core/docker-compose.production.yml',
    composeProjectName: env.WISE2_COMPOSE_PROJECT_NAME ?? env.COMPOSE_PROJECT_NAME ?? 'wise2-core',
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
    targetAlias,
    targetEnvironment,
    allowedProfiles,
    signingKeys,
    requireSignedWrites,
    idempotencyFile: env.WISE2_IDEMPOTENCY_FILE ?? '/data/control-bridge/idempotency.jsonl',
    maintenanceFile: env.WISE2_MAINTENANCE_FILE ?? '/data/control-bridge/maintenance.json',
    allowedStoppable,
    databaseService: env.WISE2_DATABASE_SERVICE ?? 'postgres',
    workerService: env.WISE2_WORKER_SERVICE ?? 'worker',
    proxyService: env.WISE2_PROXY_SERVICE ?? 'traefik',
  };
}
