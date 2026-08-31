import type { ActionAttempt, AuditEvent } from '../types.ts';

export function createAuditEvent(input: {
  actor?: string;
  action: string;
  objectType: string;
  objectId: string;
  timestamp: string;
  metadata?: Record<string, string>;
}): AuditEvent {
  const metadata = { ...(input.metadata ?? {}) };
  delete metadata.transcript;
  delete metadata.body;
  delete metadata.message;
  return {
    id: `audit-${input.timestamp}-${input.action}-${input.objectId}`,
    actor: input.actor ?? 'dispatcher',
    action: input.action,
    objectType: input.objectType,
    objectId: input.objectId,
    timestamp: input.timestamp,
    metadata,
  };
}

export function auditFromAction(attempt: ActionAttempt, actor = 'dispatcher'): AuditEvent {
  return createAuditEvent({
    actor,
    action: `action.${attempt.type}.${attempt.status}`,
    objectType: 'conversation',
    objectId: attempt.conversationId,
    timestamp: attempt.confirmedAt ?? attempt.requestedAt,
    metadata: {
      actionId: attempt.id,
      actionType: attempt.type,
      status: attempt.status,
      destination: attempt.destination,
    },
  });
}
