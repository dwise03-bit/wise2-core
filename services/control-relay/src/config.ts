import { homedir } from 'node:os';
import { join } from 'node:path';
import { profileIds } from '../../../packages/ops-protocol/src/index.js';
import type { SigningKey } from '../../../packages/ops-protocol/src/signature.js';
import type { RelayConfig } from './types.js';

function numberValue(value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Parses `keyId:secret,keyId2:secret2`. Shared shape with the control bridge's keyring. */
export function parseSigningKeys(value: string | undefined): SigningKey[] {
  const keys: SigningKey[] = [];
  for (const pair of (value ?? '').split(',').map(entry => entry.trim()).filter(Boolean)) {
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

export function loadConfig(env: NodeJS.ProcessEnv = process.env): RelayConfig {
  const token = env.WISE2_RELAY_TOKEN?.trim();
  if (!token) throw new Error('WISE2_RELAY_TOKEN is required');
  if (token.length < 32) throw new Error('WISE2_RELAY_TOKEN must be at least 32 characters');

  const signingKeys = parseSigningKeys(env.WISE2_OPS_SIGNING_KEYS);
  // A relay with no key can never verify a job, so it would refuse every request. Refuse
  // to start instead of pretending to be available.
  if (signingKeys.length === 0) throw new Error('WISE2_OPS_SIGNING_KEYS is required');
  if (profileIds().length === 0) throw new Error('Action profile registry is empty');

  return {
    host: env.WISE2_RELAY_HOST ?? '127.0.0.1',
    port: numberValue(env.WISE2_RELAY_PORT, 4600),
    nodeEnv: env.NODE_ENV ?? 'development',
    token,
    targetsFile: env.WISE2_RELAY_TARGETS_FILE ?? join(homedir(), '.wise2', 'targets.json'),
    auditFile: env.WISE2_RELAY_AUDIT_FILE ?? join(homedir(), '.wise2', 'relay-audit.jsonl'),
    signingKeys,
    requestTimeoutMs: numberValue(env.WISE2_RELAY_REQUEST_TIMEOUT_MS, 30_000),
    rateLimitMax: numberValue(env.WISE2_RELAY_RATE_LIMIT_MAX, 60),
    rateLimitWindowMs: numberValue(env.WISE2_RELAY_RATE_LIMIT_WINDOW_MS, 60_000),
    jobRetentionMs: numberValue(env.WISE2_RELAY_JOB_RETENTION_MS, 60 * 60 * 1000),
    // Polling stays off unless it is asked for: a relay that alerts without a destination
    // is just wasted requests against production.
    healthEnabled: (env.WISE2_RELAY_HEALTH_ENABLED ?? '').trim().toLowerCase() === 'true',
    healthIntervalMs: numberValue(env.WISE2_RELAY_HEALTH_INTERVAL_MS, 60_000),
    healthFailureThreshold: numberValue(env.WISE2_RELAY_HEALTH_FAILURE_THRESHOLD, 2),
    activityWebhookUrl: env.WISE2_DISCORD_ACTIVITY_WEBHOOK?.trim() || undefined,
  };
}
