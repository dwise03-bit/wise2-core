import { describe, expect, it } from 'vitest';
import { assertTenant, createEnvelope, requireApproval } from './index';

describe('WOS foundation contracts', () => {
  it('requires tenant context and preserves trace fields', () => {
    const envelope = createEnvelope({ kind: 'job', tenantId: 't1', correlationId: 'c1', traceId: 'tr1', jobId: 'j1' });
    expect(envelope.createdAt).toBeTruthy();
    expect(() => assertTenant(envelope, 't2')).toThrow('TENANT_CONTEXT_MISMATCH');
    expect(() => assertTenant(envelope, 't1')).not.toThrow();
  });

  it('requires approval for consequential actions only', () => {
    expect(() => requireApproval('L2')).not.toThrow();
    expect(() => requireApproval('L3')).toThrow('APPROVAL_REQUIRED');
    expect(() => requireApproval('L4', 'approval-1')).not.toThrow();
  });
});
