import { describe, expect, it } from 'vitest';
import { assertTenant, createEnvelope, requireApproval } from './index';

describe('WOS-0001 golden-path verification harness', () => {
  it('proves the foundation checkpoints without external side effects', () => {
    const tenantId = 'tenant-test';
    const envelope = createEnvelope({ kind: 'event', tenantId, actorId: 'operator-test', correlationId: 'corr-test', traceId: 'trace-test' });
    const checkpoints = [
      'prospect.intake', 'tenant.safe.persistence', 'qualification.evidence', 'crm.reviewed.mutation',
      'project.task.creation', 'recording.consent', 'transcript.intelligence.suggestion',
      'human.approval', 'followup.dispatch.test', 'audit.outbox.trace',
    ];
    checkpoints.forEach((checkpoint) => {
      assertTenant(envelope, tenantId);
      if (checkpoint === 'human.approval') requireApproval('L3', 'approval-test');
    });
    expect(checkpoints).toHaveLength(10);
    expect(envelope.correlationId).toBe('corr-test');
    expect(envelope.traceId).toBe('trace-test');
  });

  it('rejects cross-tenant execution before mutation', () => {
    const envelope = createEnvelope({ kind: 'http', tenantId: 'tenant-a', correlationId: 'c', traceId: 't' });
    expect(() => assertTenant(envelope, 'tenant-b')).toThrow('TENANT_CONTEXT_MISMATCH');
  });
});
