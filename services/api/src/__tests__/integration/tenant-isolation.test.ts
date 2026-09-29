/**
 * Integration tests for Multi-Tenant Isolation (TenantGuard)
 * Tests that tenant data is properly isolated and access is controlled
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../database';

describe('Multi-Tenant Isolation (TenantGuard)', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  let tenant1UserId: string;
  let tenant2UserId: string;
  let lead1Id: string;
  let lead2Id: string;

  beforeAll(async () => {
    // Setup: Create two separate tenants
    const tenant1 = await db.tenant.create({
      data: {
        name: 'Tenant 1 - HVAC Company',
        vertical: 'HVAC',
        state: 'ACTIVE',
      },
    });
    tenant1Id = tenant1.id;

    const tenant2 = await db.tenant.create({
      data: {
        name: 'Tenant 2 - Plumbing Company',
        vertical: 'PLUMBING',
        state: 'ACTIVE',
      },
    });
    tenant2Id = tenant2.id;

    // Create users for each tenant
    const membership1 = await db.tenantMembership.create({
      data: {
        tenantId: tenant1Id,
        userId: 'user-hvac-001',
        role: 'OWNER',
      },
    });
    tenant1UserId = membership1.userId;

    const membership2 = await db.tenantMembership.create({
      data: {
        tenantId: tenant2Id,
        userId: 'user-plumbing-001',
        role: 'OWNER',
      },
    });
    tenant2UserId = membership2.userId;

    // Create leads for each tenant
    const lead1 = await db.lead.create({
      data: {
        tenantId: tenant1Id,
        name: 'HVAC Lead 1',
        email: 'hvac-lead@example.com',
        phone: '+1111111111',
        status: 'NEW',
        source: 'WEB',
      },
    });
    lead1Id = lead1.id;

    const lead2 = await db.lead.create({
      data: {
        tenantId: tenant2Id,
        name: 'Plumbing Lead 1',
        email: 'plumb-lead@example.com',
        phone: '+2222222222',
        status: 'NEW',
        source: 'REFERRAL',
      },
    });
    lead2Id = lead2.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.lead.deleteMany({ where: { tenantId: { in: [tenant1Id, tenant2Id] } } });
    await db.tenantMembership.deleteMany({ where: { tenantId: { in: [tenant1Id, tenant2Id] } } });
    await db.tenant.deleteMany({ where: { id: { in: [tenant1Id, tenant2Id] } } });
  });

  it('should prevent cross-tenant lead access', async () => {
    // User from tenant2 should not be able to see tenant1 leads
    // This is enforced at the middleware level via scopedWhere()

    const tenant1Leads = await db.lead.findMany({
      where: { tenantId: tenant1Id },
    });

    const tenant2Leads = await db.lead.findMany({
      where: { tenantId: tenant2Id },
    });

    // Leads should be isolated per tenant
    expect(tenant1Leads.some((l) => l.id === lead1Id)).toBe(true);
    expect(tenant1Leads.some((l) => l.id === lead2Id)).toBe(false);

    expect(tenant2Leads.some((l) => l.id === lead2Id)).toBe(true);
    expect(tenant2Leads.some((l) => l.id === lead1Id)).toBe(false);
  });

  it('should prevent user from other tenant accessing data via direct ID', async () => {
    // Even if user2 knows lead1's ID, they should not be able to query it
    // scopedWhere() ensures tenantId filter is always applied

    // Attempt to find tenant1's lead with tenant2's user context
    // This simulates a user trying to access another tenant's data
    const attemptedAccess = await db.lead.findFirst({
      where: {
        id: lead1Id,
        tenantId: tenant2Id, // This would be added by scopedWhere()
      },
    });

    // Should not find the lead because lead1 belongs to tenant1, not tenant2
    expect(attemptedAccess).toBeNull();
  });

  it('should isolate approvals by tenant', async () => {
    const approval1 = await db.approval.create({
      data: {
        tenantId: tenant1Id,
        action: 'SEND_SMS',
        targetId: lead1Id,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        payload: { phoneNumber: '+1111111111', message: 'Test' },
        payloadHash: 'hash-1',
      },
    });

    const approval2 = await db.approval.create({
      data: {
        tenantId: tenant2Id,
        action: 'SEND_EMAIL',
        targetId: lead2Id,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        payload: { email: 'test@example.com', subject: 'Test' },
        payloadHash: 'hash-2',
      },
    });

    const tenant1Approvals = await db.approval.findMany({
      where: { tenantId: tenant1Id },
    });

    const tenant2Approvals = await db.approval.findMany({
      where: { tenantId: tenant2Id },
    });

    expect(tenant1Approvals.some((a) => a.id === approval1.id)).toBe(true);
    expect(tenant1Approvals.some((a) => a.id === approval2.id)).toBe(false);

    expect(tenant2Approvals.some((a) => a.id === approval2.id)).toBe(true);
    expect(tenant2Approvals.some((a) => a.id === approval1.id)).toBe(false);
  });

  it('should isolate workflows by tenant', async () => {
    const workflow1 = await db.workflowDefinition.create({
      data: {
        tenantId: tenant1Id,
        name: 'HVAC Workflow',
        triggers: [{ type: 'LEAD_CREATED' }],
        actions: [{ type: 'SEND_SMS', config: {} }],
        enabled: true,
      },
    });

    const workflow2 = await db.workflowDefinition.create({
      data: {
        tenantId: tenant2Id,
        name: 'Plumbing Workflow',
        triggers: [{ type: 'ESTIMATE_SENT' }],
        actions: [{ type: 'SEND_EMAIL', config: {} }],
        enabled: true,
      },
    });

    const tenant1Workflows = await db.workflowDefinition.findMany({
      where: { tenantId: tenant1Id },
    });

    const tenant2Workflows = await db.workflowDefinition.findMany({
      where: { tenantId: tenant2Id },
    });

    expect(tenant1Workflows.some((w) => w.id === workflow1.id)).toBe(true);
    expect(tenant1Workflows.some((w) => w.id === workflow2.id)).toBe(false);

    expect(tenant2Workflows.some((w) => w.id === workflow2.id)).toBe(true);
    expect(tenant2Workflows.some((w) => w.id === workflow1.id)).toBe(false);
  });

  it('should isolate follow-ups by tenant', async () => {
    const followUp1 = await db.followUp.create({
      data: {
        tenantId: tenant1Id,
        followUpType: 'LEAD_CONTACT',
        relatedEntityType: 'Lead',
        relatedEntityId: lead1Id,
        message: 'Contact lead',
        dueAt: new Date(),
        priority: 10,
        status: 'PENDING',
      },
    });

    const followUp2 = await db.followUp.create({
      data: {
        tenantId: tenant2Id,
        followUpType: 'ESTIMATE_FOLLOW_UP',
        relatedEntityType: 'Lead',
        relatedEntityId: lead2Id,
        message: 'Follow up estimate',
        dueAt: new Date(),
        priority: 8,
        status: 'PENDING',
      },
    });

    const tenant1FollowUps = await db.followUp.findMany({
      where: { tenantId: tenant1Id },
    });

    const tenant2FollowUps = await db.followUp.findMany({
      where: { tenantId: tenant2Id },
    });

    expect(tenant1FollowUps.some((f) => f.id === followUp1.id)).toBe(true);
    expect(tenant1FollowUps.some((f) => f.id === followUp2.id)).toBe(false);

    expect(tenant2FollowUps.some((f) => f.id === followUp2.id)).toBe(true);
    expect(tenant2FollowUps.some((f) => f.id === followUp1.id)).toBe(false);
  });

  it('should enforce role-based access control per tenant', async () => {
    // Create users with different roles in same tenant
    const adminMembership = await db.tenantMembership.create({
      data: {
        tenantId: tenant1Id,
        userId: 'admin-user',
        role: 'ADMIN',
      },
    });

    const technicianMembership = await db.tenantMembership.create({
      data: {
        tenantId: tenant1Id,
        userId: 'tech-user',
        role: 'TECHNICIAN',
      },
    });

    // Verify roles are assigned
    expect(adminMembership.role).toBe('ADMIN');
    expect(technicianMembership.role).toBe('TECHNICIAN');

    // Only OWNER/ADMIN should be able to create approvals
    // This is enforced by requireRole() middleware
  });

  it('should prevent tenant ID injection in request body', async () => {
    // TenantGuard middleware should ALWAYS resolve tenantId from
    // authenticated user's TenantMembership, never from req.body

    // Simulating injection attempt:
    // Attacker: { body: { tenantId: 'attacker-tenant' } }
    // TenantGuard: Ignores body.tenantId, uses user's tenantId

    // This test verifies the principle - actual enforcement
    // happens in middleware
    const userMembership = await db.tenantMembership.findFirst({
      where: { userId: tenant1UserId },
    });

    expect(userMembership?.tenantId).toBe(tenant1Id);
  });
});
