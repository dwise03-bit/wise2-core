/**
 * WISE² Ops Protocol — shared types for the Discord → MacBook relay → host control path.
 *
 * Nothing in this package executes anything. It defines the signed job envelope, the
 * action-profile allowlist, and the target registry shape, so that every hop (Discord
 * bot, control relay, control bridge) validates against one identical contract.
 */

export type Role = 'viewer' | 'operator' | 'owner';

export type Environment = 'development' | 'staging' | 'production';

export type ProfileKind = 'read' | 'write';

/** A single argument accepted by an action profile. Values are always strings on the wire. */
export type ArgSpec = {
  name: string;
  required: boolean;
  /** Closed set of accepted values. Mutually exclusive with `pattern`. */
  values?: readonly string[];
  /** Anchored pattern the value must match in full. Mutually exclusive with `values`. */
  pattern?: RegExp;
  maxLength?: number;
};

export type ActionProfile = {
  id: string;
  kind: ProfileKind;
  description: string;
  /** Lowest role permitted to request this profile. */
  minRole: Role;
  /** Requires an explicit confirmation token bound to the job id. */
  requiresConfirmation: boolean;
  /** Requires two distinct confirmation tokens (emergency-stop). */
  requiresDoubleConfirmation: boolean;
  /** In production, the confirmation must echo the literal string `production`. */
  requiresEnvironmentConfirmation: boolean;
  args: readonly ArgSpec[];
};

export type Actor = {
  /** Discord user id. Opaque, numeric string. */
  id: string;
  /** Display name for the audit trail and result card. Never used for authorization. */
  displayName: string;
  role: Role;
};

/**
 * The signed unit of work. Created by the Discord bot, verified by the relay, and
 * replayed into the host's control bridge. `args` never carries shell text — every
 * value is validated against the profile's ArgSpec before the job is considered valid.
 */
export type Job = {
  jobId: string;
  actor: Actor;
  /** Registry alias, never a hostname or IP. */
  target: string;
  environment: Environment;
  actionProfile: string;
  args: Record<string, string>;
  /** Single-use random value; the relay rejects a nonce it has already seen. */
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  /** Stable key for the (actor, target, profile, args) tuple; duplicate keys are no-ops. */
  idempotencyKey: string;
};

/** Issued when Daniel presses the confirm button (or runs `/ops confirm <job-id>`). */
export type Confirmation = {
  jobId: string;
  confirmedBy: Actor;
  confirmedAt: string;
  /** Must equal the literal environment name for production writes. */
  environmentEcho?: string;
  /** Distinguishes the first and second confirmation of a double-confirm profile. */
  sequence: 1 | 2;
};

export type Signed<T> = {
  payload: T;
  /** Hex HMAC-SHA256 over the canonical serialization of `payload`. */
  signature: string;
  /** Identifies which shared secret signed this envelope. */
  keyId: string;
};

export type TransportKind = 'control-bridge' | 'ssh';

/**
 * One managed host. Secrets are references, never values: `sshKeyRef` is a path or
 * keychain handle resolved locally by the relay, and never leaves the MacBook.
 */
export type TargetRecord = {
  alias: string;
  /** Tailscale address or hostname. Never rendered into Discord. */
  address: string;
  transport: TransportKind;
  /**
   * Explicit origin of the host's control bridge, e.g. a `tailscale serve` HTTPS endpoint.
   * When set it wins over address/port composition — the bridge can then keep binding
   * 127.0.0.1 while the tailnet proxy provides identity and TLS.
   */
  baseUrl?: string;
  /** Port of the host's control bridge. Only meaningful for the control-bridge transport. */
  controlPort?: number;
  sshUser?: string;
  sshKeyRef?: string;
  /**
   * Local port where this host's control bridge is reachable through an SSH port-forward.
   * Used by the `ssh` transport, which reaches the bridge over a tunnel established
   * out-of-band rather than executing anything over SSH.
   */
  forwardPort?: number;
  /**
   * Name of the environment variable holding this host's control-bridge bearer token.
   * A reference, never the value: tokens are resolved locally and never serialized.
   */
  bridgeTokenRef?: string;
  environment: Environment;
  /** Profile ids this host will accept, intersected with the global profile registry. */
  allowedProfiles: readonly string[];
  /** Profile id used for health polling. Must be a read profile. */
  healthCheckProfile: string;
  lastSeenAt?: string;
};

/** The Discord-safe projection of a target: no address, no user, no key reference. */
export type PublicTarget = {
  alias: string;
  environment: Environment;
  transport: TransportKind;
  allowedProfiles: readonly string[];
  lastSeenAt?: string;
};

export type ValidationErrorCode =
  | 'SIGNATURE_INVALID'
  | 'KEY_UNKNOWN'
  | 'MALFORMED_JOB'
  | 'JOB_EXPIRED'
  | 'JOB_NOT_YET_VALID'
  | 'JOB_TTL_TOO_LONG'
  | 'NONCE_REPLAYED'
  | 'IDEMPOTENCY_REPLAY'
  | 'TARGET_UNKNOWN'
  | 'ENVIRONMENT_MISMATCH'
  | 'PROFILE_UNKNOWN'
  | 'PROFILE_NOT_ALLOWED_ON_TARGET'
  | 'ROLE_DENIED'
  | 'ARG_UNKNOWN'
  | 'ARG_MISSING'
  | 'ARG_INVALID'
  | 'CONFIRMATION_REQUIRED'
  | 'CONFIRMATION_MISMATCH'
  | 'CONFIRMATION_EXPIRED'
  | 'CONFIRMATION_ACTOR_MISMATCH'
  | 'ENVIRONMENT_CONFIRMATION_REQUIRED';

export class OpsProtocolError extends Error {
  constructor(readonly code: ValidationErrorCode, message: string, readonly detail?: string) {
    super(message);
    this.name = 'OpsProtocolError';
  }
}

export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; code: ValidationErrorCode; message: string; detail?: string };
export type Result<T> = Ok<T> | Err;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err(code: ValidationErrorCode, message: string, detail?: string): Err {
  return { ok: false, code, message, detail };
}
