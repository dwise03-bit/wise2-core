import type { SigningKey } from '../../../packages/ops-protocol/src/signature.js';

export type RelayConfig = {
  host: string;
  port: number;
  nodeEnv: string;
  /** Bearer token the Discord control backend must present, on top of the signed job. */
  token: string;
  /** Path to the target registry. Must not be group- or world-readable. */
  targetsFile: string;
  auditFile: string;
  signingKeys: SigningKey[];
  /** Per-request timeout when talking to a host's control bridge. */
  requestTimeoutMs: number;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  /** How long a finished job stays queryable for the result card. */
  jobRetentionMs: number;
};

export type Envelope<T> = {
  ok: boolean;
  requestId: string;
  jobId?: string;
  action: string;
  target?: string;
  timestamp: string;
  data?: T;
  error?: { code: string; message: string; detail?: string };
};

export type JobPhase = 'accepted' | 'dispatched' | 'complete' | 'failed' | 'blocked';

export type JobProgress = {
  jobId: string;
  phase: JobPhase;
  actor: string;
  target: string;
  environment: string;
  actionProfile: string;
  startedAt: string;
  updatedAt: string;
  finishedAt?: string;
  /** Sanitized evidence for the Discord result card. Never raw host output. */
  evidence?: unknown;
  error?: { code: string; message: string };
};

export type RelayAuditEntry = {
  requestId: string;
  jobId?: string;
  actor?: string;
  actorId?: string;
  actorRole?: string;
  target?: string;
  environment?: string;
  actionProfile?: string;
  transport?: string;
  startedAt: string;
  endedAt: string;
  ok: boolean;
  status?: number;
  errorCode?: string;
};
