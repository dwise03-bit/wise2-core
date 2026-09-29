import type { ActionProfile, Role } from './types.js';

const ROLE_RANK: Record<Role, number> = { viewer: 0, operator: 1, owner: 2 };

/** Service and app names mirror the control bridge's own guard: lowercase, dot/dash/underscore. */
const NAME = /^[a-z0-9][a-z0-9_.-]{0,63}$/;
/** Release identifiers: short git sha, semver-ish tag, or a deployment record id. */
const RELEASE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/;

const DIAGNOSTIC_PROFILES = ['health', 'docker', 'disk', 'network', 'database', 'worker', 'traefik', 'ollama'] as const;

function read(id: string, description: string, args: ActionProfile['args'] = [], minRole: Role = 'operator'): ActionProfile {
  return {
    id,
    kind: 'read',
    description,
    minRole,
    requiresConfirmation: false,
    requiresDoubleConfirmation: false,
    requiresEnvironmentConfirmation: false,
    args,
  };
}

function write(id: string, description: string, args: ActionProfile['args'] = [], overrides: Partial<ActionProfile> = {}): ActionProfile {
  return {
    id,
    kind: 'write',
    description,
    minRole: 'owner',
    requiresConfirmation: true,
    requiresDoubleConfirmation: false,
    requiresEnvironmentConfirmation: true,
    args,
    ...overrides,
  };
}

/**
 * The complete set of actions this system can ever perform. A profile that is not in
 * this registry cannot be requested, signed, relayed, or executed — there is no
 * free-form command path anywhere in the protocol.
 */
export const ACTION_PROFILES: readonly ActionProfile[] = [
  read('status', 'Host health, uptime, disk, memory, CPU, service state, last deployment'),
  read('services', 'State of the approved WISE² services on the host'),
  read('logs', 'Recent sanitized logs for one allowlisted service', [
    { name: 'service', required: true, pattern: NAME },
    { name: 'lines', required: false, pattern: /^[0-9]{1,3}$/ },
  ]),
  read('diagnose', 'Run one predefined diagnostic profile', [
    { name: 'profile', required: true, values: DIAGNOSTIC_PROFILES },
  ]),
  read('deploy-status', 'Status of a previously queued deployment', [
    { name: 'deploymentId', required: true, pattern: RELEASE },
  ]),

  write('restart', 'Restart one allowlisted service', [
    { name: 'service', required: true, pattern: NAME },
  ]),
  write('deploy', 'Deploy an approved release to an allowlisted app', [
    { name: 'app', required: true, pattern: NAME },
    { name: 'releaseId', required: true, pattern: RELEASE },
  ]),
  write('rollback', 'Roll back an app to a verified prior release', [
    { name: 'app', required: true, pattern: NAME },
    { name: 'releaseId', required: true, pattern: RELEASE },
  ]),
  write('maintenance', 'Enable or disable controlled maintenance mode', [
    { name: 'state', required: true, values: ['on', 'off'] },
  ]),
  write('emergency-stop', 'Stop one explicitly designated non-critical service', [
    { name: 'service', required: true, pattern: NAME },
  ], { requiresDoubleConfirmation: true }),
] as const;

const BY_ID = new Map(ACTION_PROFILES.map(profile => [profile.id, profile]));

export function findProfile(id: string): ActionProfile | undefined {
  return BY_ID.get(id);
}

export function profileIds(): string[] {
  return [...BY_ID.keys()];
}

export function isWriteProfile(id: string): boolean {
  return BY_ID.get(id)?.kind === 'write';
}

export function roleSatisfies(actual: Role, required: Role): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

export const DIAGNOSTIC_IDS = DIAGNOSTIC_PROFILES;
