import { findProfile } from './profiles.js';
import { err, ok, type Environment, type PublicTarget, type Result, type TargetRecord, type TransportKind } from './types.js';

const ALIAS = /^[a-z][a-z0-9-]{1,31}$/;
const ENVIRONMENTS: readonly Environment[] = ['development', 'staging', 'production'];
const TRANSPORTS: readonly TransportKind[] = ['control-bridge', 'ssh'];

/**
 * A base URL becomes the prefix of every dispatched request, so it must be an origin and
 * nothing else: no embedded credentials, no path, no query.
 */
export function validateBaseUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return 'baseUrl must be a string';
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return 'baseUrl is not a valid URL';
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return 'baseUrl must be http or https';
  if (parsed.username || parsed.password) return 'baseUrl must not embed credentials';
  if (parsed.search || parsed.hash) return 'baseUrl must not carry a query or fragment';
  if (parsed.pathname !== '/' && parsed.pathname !== '') return 'baseUrl must be an origin with no path';
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? (value as string[]) : undefined;
}

/**
 * Parses `~/.wise2/targets.json`. Every field is checked here rather than at use time,
 * so a malformed registry fails at load on the MacBook instead of halfway through a job.
 */
export function parseTargets(input: unknown): Result<TargetRecord[]> {
  if (!Array.isArray(input)) return err('MALFORMED_JOB', 'Target registry must be an array');
  const targets: TargetRecord[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    if (!isRecord(raw)) return err('MALFORMED_JOB', 'Target entry must be an object');
    const alias = raw.alias;
    if (typeof alias !== 'string' || !ALIAS.test(alias)) return err('MALFORMED_JOB', 'Target alias is invalid', String(alias));
    if (seen.has(alias)) return err('MALFORMED_JOB', 'Duplicate target alias', alias);
    if (typeof raw.address !== 'string' || raw.address.length === 0) return err('MALFORMED_JOB', 'Target address is required', alias);
    if (typeof raw.transport !== 'string' || !TRANSPORTS.includes(raw.transport as TransportKind)) {
      return err('MALFORMED_JOB', 'Target transport is invalid', alias);
    }
    if (typeof raw.environment !== 'string' || !ENVIRONMENTS.includes(raw.environment as Environment)) {
      return err('MALFORMED_JOB', 'Target environment is invalid', alias);
    }
    const allowedProfiles = stringArray(raw.allowedProfiles);
    if (!allowedProfiles || allowedProfiles.length === 0) return err('MALFORMED_JOB', 'Target must allow at least one profile', alias);
    const unknown = allowedProfiles.find(profile => !findProfile(profile));
    if (unknown) return err('PROFILE_UNKNOWN', 'Target allows an unknown profile', `${alias}:${unknown}`);
    const healthCheckProfile = raw.healthCheckProfile ?? 'status';
    if (typeof healthCheckProfile !== 'string' || findProfile(healthCheckProfile)?.kind !== 'read') {
      return err('MALFORMED_JOB', 'Health check profile must be a read profile', alias);
    }
    if (raw.baseUrl !== undefined) {
      const baseUrlError = validateBaseUrl(raw.baseUrl);
      if (baseUrlError) return err('MALFORMED_JOB', baseUrlError, alias);
    }
    if (raw.transport === 'ssh' && typeof raw.sshUser !== 'string') return err('MALFORMED_JOB', 'SSH target requires sshUser', alias);
    if (raw.transport === 'ssh' && typeof raw.forwardPort !== 'number') return err('MALFORMED_JOB', 'SSH target requires forwardPort for the control-bridge tunnel', alias);
    if (raw.bridgeTokenRef !== undefined && (typeof raw.bridgeTokenRef !== 'string' || !/^[A-Z][A-Z0-9_]*$/.test(raw.bridgeTokenRef))) {
      return err('MALFORMED_JOB', 'bridgeTokenRef must be an environment variable name', alias);
    }
    seen.add(alias);
    targets.push({
      alias,
      address: raw.address,
      transport: raw.transport as TransportKind,
      baseUrl: typeof raw.baseUrl === 'string' ? raw.baseUrl.replace(/\/+$/, '') : undefined,
      controlPort: typeof raw.controlPort === 'number' ? raw.controlPort : undefined,
      sshUser: typeof raw.sshUser === 'string' ? raw.sshUser : undefined,
      sshKeyRef: typeof raw.sshKeyRef === 'string' ? raw.sshKeyRef : undefined,
      forwardPort: typeof raw.forwardPort === 'number' ? raw.forwardPort : undefined,
      bridgeTokenRef: typeof raw.bridgeTokenRef === 'string' ? raw.bridgeTokenRef : undefined,
      environment: raw.environment as Environment,
      allowedProfiles,
      healthCheckProfile,
      lastSeenAt: typeof raw.lastSeenAt === 'string' ? raw.lastSeenAt : undefined,
    });
  }
  return ok(targets);
}

export function findTarget(targets: readonly TargetRecord[], alias: string): TargetRecord | undefined {
  return targets.find(target => target.alias === alias);
}

/**
 * Strips everything that must never reach Discord: address, SSH user, key reference,
 * and port. This is the only projection callers should render into a message.
 */
export function publicTarget(target: TargetRecord): PublicTarget {
  return {
    alias: target.alias,
    environment: target.environment,
    transport: target.transport,
    allowedProfiles: target.allowedProfiles,
    lastSeenAt: target.lastSeenAt,
  };
}

export function publicTargets(targets: readonly TargetRecord[]): PublicTarget[] {
  return targets.map(publicTarget);
}
