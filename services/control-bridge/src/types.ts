import type { Environment } from '../../../packages/ops-protocol/src/index.js';
import type { SigningKey } from '../../../packages/ops-protocol/src/signature.js';

export type ControlConfig = {
  host: string;
  port: number;
  nodeEnv: string;
  token: string;
  actor: string;
  repoDir: string;
  composeFile: string;
  composeProjectName: string;
  auditFile: string;
  deploymentFile: string;
  dockerBinary: string;
  gitBinary: string;
  nvidiaSmiBinary: string;
  allowedApps: string[];
  allowedServices: string[];
  ollamaUrl: string;
  hermesUrl: string;
  wise2Url: string;
  apiHealthUrl: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  /** Registry alias this bridge answers to. Signed jobs must name it. */
  targetAlias: string;
  /** Environment this host is. A job for another environment is rejected. */
  targetEnvironment: Environment;
  /** Action profiles this host will accept. Intersected with the protocol registry. */
  allowedProfiles: string[];
  /** Keyring for signed job envelopes, parsed from `keyId:secret` pairs. */
  signingKeys: SigningKey[];
  /** When true (the default) a write without a valid signed job is refused. */
  requireSignedWrites: boolean;
  idempotencyFile: string;
};

export type Envelope<T> = {
  ok: boolean;
  requestId: string;
  action: string;
  target?: string;
  timestamp: string;
  data?: T;
  error?: { code: string; message: string; detail?: string };
};

export type AuditEntry = {
  requestId: string;
  /** Human-readable actor. For signed jobs this is the real Discord display name. */
  actor: string;
  /** Discord user id of the actor, present whenever the action came from a signed job. */
  actorId?: string;
  actorRole?: string;
  jobId?: string;
  profile?: string;
  environment?: string;
  idempotencyKey?: string;
  /** True when the request matched a prior idempotency key and did not execute. */
  replayed?: boolean;
  action: string;
  target?: string;
  source?: string;
  startedAt: string;
  endedAt: string;
  ok: boolean;
  exitCode?: number;
  errorCode?: string;
};

export type ComponentState<T = unknown> = {
  status: 'healthy' | 'degraded' | 'down' | 'unavailable';
  data?: T;
  error?: string;
};

export type DeploymentRecord = {
  id: string;
  app: string;
  previousRevision: string;
  targetRevision: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'rolled_back';
  createdAt: string;
  completedAt?: string;
  health?: unknown;
};
