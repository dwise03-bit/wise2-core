export type ExecutionKind = 'http' | 'job' | 'webhook' | 'agent' | 'event';
export type RiskLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export interface UsageMetadata {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
  latencyMs?: number;
}

export interface ExecutionEnvelope {
  kind: ExecutionKind;
  tenantId: string;
  actorId?: string;
  userId?: string;
  correlationId: string;
  traceId: string;
  jobId?: string;
  provider?: string;
  model?: string;
  usage?: UsageMetadata;
  createdAt: string;
}

export interface AuditEnvelope extends ExecutionEnvelope {
  eventId: string;
  eventType: string;
  action: string;
  entityType: string;
  entityId: string;
  outcome: 'accepted' | 'rejected' | 'completed' | 'failed' | 'skipped';
  riskLevel: RiskLevel;
  approvalId?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface OutboxMessage<T = unknown> {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  envelope: ExecutionEnvelope;
  payload: T;
  occurredAt: string;
}

export interface IdempotencyRecord {
  key: string;
  tenantId: string;
  requestHash: string;
  status: 'in_progress' | 'succeeded' | 'failed';
  response?: unknown;
  firstSeenAt: string;
  completedAt?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  deadLetterAfterExhaustion: true;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  backoffMs: 1000,
  deadLetterAfterExhaustion: true,
};

export function assertTenant(envelope: ExecutionEnvelope, tenantId: string): void {
  if (envelope.tenantId !== tenantId) throw new Error('TENANT_CONTEXT_MISMATCH');
}

export function requireApproval(riskLevel: RiskLevel, approvalId?: string): void {
  if ((riskLevel === 'L3' || riskLevel === 'L4') && !approvalId) {
    throw new Error('APPROVAL_REQUIRED');
  }
}

export function createEnvelope(input: Omit<ExecutionEnvelope, 'createdAt'> & { createdAt?: string }): ExecutionEnvelope {
  return { ...input, createdAt: input.createdAt ?? new Date().toISOString() };
}
