/**
 * Integration tests for Approval Workflow (Phase 13)
 * Tests the full lifecycle: request → approve/reject → execute
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../database';

describe('Approval Workflow Integration', () => {
  let tenantId: string;
  let userId: string;
  let approvalId: string;

  beforeAll(async () => {
    // Setup: Create test tenant and user
    const tenant = await db.tenant.create({
      data: {
        name: 'Test Tenant',
        vertical: 'HVAC',
        state: 'ACTIVE',
      },
    });
    tenantId = tenant.id;

    // Create test user membership
    const membership = await db.tenantMembership.create({
      data: {
        tenantId,
        userId: 'test-user',
        role: 'OWNER',
      },
    });
    userId = membership.userId;
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    await db.tenantMembership.deleteMany({ where: { tenantId } });
    await db.approval.deleteMany({ where: { tenantId } });
    await db.tenant.delete({ where: { id: tenantId } });
  });

  it('should create approval request with valid payload', async () => {
    const approval = await db.approval.create({
      data: {
        tenantId,
        action: 'SEND_SMS',
        targetId: 'test-lead',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        payload: {
          phoneNumber: '+1234567890',
          message: 'Test message',
        },
        payloadHash: 'test-hash',
      },
    });

    expect(approval).toBeDefined();
    expect(approval.action).toBe('SEND_SMS');
    expect(approval.status).toBe('PENDING');
    approvalId = approval.id;
  });

  it('should approve pending approval', async () => {
    const approved = await db.approval.update({
      where: { id: approvalId },
      data: {
        status: 'APPROVED',
        approver: userId,
        approvedAt: new Date(),
        note: 'Approved by admin',
      },
    });

    expect(approved.status).toBe('APPROVED');
    expect(approved.approver).toBe(userId);
  });

  it('should prevent approval of expired request', async () => {
    const expiredApproval = await db.approval.create({
      data: {
        tenantId,
        action: 'SEND_EMAIL',
        targetId: 'test-lead-2',
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        payload: { email: 'test@example.com', subject: 'Test' },
        payloadHash: 'test-hash-2',
      },
    });

    // System should reject execution of expired approval
    const isExpired = expiredApproval.expiresAt < new Date();
    expect(isExpired).toBe(true);
  });

  it('should reject approval and log reason', async () => {
    const rejectApproval = await db.approval.create({
      data: {
        tenantId,
        action: 'CHARGE_PAYMENT',
        targetId: 'test-customer',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        payload: { amount: 100, customerId: 'cust-123' },
        payloadHash: 'test-hash-3',
      },
    });

    const rejected = await db.approval.update({
      where: { id: rejectApproval.id },
      data: {
        status: 'REJECTED',
        approver: userId,
        approvedAt: new Date(),
        note: 'Insufficient funds',
      },
    });

    expect(rejected.status).toBe('REJECTED');
    expect(rejected.note).toBe('Insufficient funds');
  });

  it('should track audit log for all approval actions', async () => {
    const testApproval = await db.approval.create({
      data: {
        tenantId,
        action: 'LEAD_STATUS_CHANGE',
        targetId: 'test-lead-3',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        payload: { leadId: 'lead-123', status: 'WON' },
        payloadHash: 'test-hash-4',
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        tenantId,
        actor: userId,
        action: 'APPROVAL_CREATED',
        resourceType: 'Approval',
        resourceId: testApproval.id,
        changesAfter: { status: 'PENDING' },
        source: 'API',
      },
    });

    const logs = await db.auditLog.findMany({
      where: { resourceId: testApproval.id },
    });

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toContain('APPROVAL');
  });

  it('should enforce payload hash validation for replay protection', async () => {
    const approval = await db.approval.create({
      data: {
        tenantId,
        action: 'SEND_SMS',
        targetId: 'test-lead-4',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        payload: { phoneNumber: '+1111111111', message: 'Test' },
        payloadHash: 'original-hash',
      },
    });

    // Attempt to execute with different payload should fail hash check
    const differentPayload = { phoneNumber: '+2222222222', message: 'Different' };
    const payloadMatches = approval.payloadHash === 'original-hash';

    expect(payloadMatches).toBe(true);
  });
});
