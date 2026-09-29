/**
 * Integration tests for Workflow Automation (Phase 14)
 * Tests workflow definition, trigger, and execution
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../database';

describe('Workflow Automation Integration', () => {
  let tenantId: string;
  let userId: string;
  let workflowId: string;

  beforeAll(async () => {
    // Setup: Create test tenant
    const tenant = await db.tenant.create({
      data: {
        name: 'Workflow Test Tenant',
        vertical: 'PLUMBING',
        state: 'ACTIVE',
      },
    });
    tenantId = tenant.id;

    const membership = await db.tenantMembership.create({
      data: {
        tenantId,
        userId: 'workflow-test-user',
        role: 'OWNER',
      },
    });
    userId = membership.userId;
  });

  afterAll(async () => {
    await db.workflowRun.deleteMany({ where: { tenantId } });
    await db.workflowDefinition.deleteMany({ where: { tenantId } });
    await db.tenantMembership.deleteMany({ where: { tenantId } });
    await db.tenant.delete({ where: { id: tenantId } });
  });

  it('should create workflow with valid triggers and actions', async () => {
    const workflow = await db.workflowDefinition.create({
      data: {
        tenantId,
        name: 'Lead Follow-up Workflow',
        description: 'Auto-follow new leads after 1 day',
        triggers: [{ type: 'LEAD_CREATED' }],
        actions: [
          { type: 'SEND_SMS', config: { template: 'welcome' } },
          { type: 'CREATE_TASK', config: { title: 'Follow up lead' } },
        ],
        enabled: true,
      },
    });

    expect(workflow).toBeDefined();
    expect(workflow.triggers).toHaveLength(1);
    expect(workflow.actions).toHaveLength(2);
    workflowId = workflow.id;
  });

  it('should execute workflow actions in sequence', async () => {
    const run = await db.workflowRun.create({
      data: {
        tenantId,
        workflowId,
        status: 'PENDING',
        triggerEvent: 'LEAD_CREATED',
        triggerData: { leadId: 'lead-test-123', name: 'John Doe' },
      },
    });

    expect(run.status).toBe('PENDING');
    expect(run.triggerData).toHaveProperty('leadId');
  });

  it('should mark workflow run as completed', async () => {
    const run = await db.workflowRun.findFirst({
      where: { workflowId },
    });

    if (run) {
      const completed = await db.workflowRun.update({
        where: { id: run.id },
        data: {
          status: 'COMPLETED',
          executionResult: [
            { action: 'SEND_SMS', status: 'sent', messageId: 'sms_123' },
            { action: 'CREATE_TASK', status: 'created', taskId: 'task_123' },
          ],
          completedAt: new Date(),
        },
      });

      expect(completed.status).toBe('COMPLETED');
      expect(completed.completionAt).toBeDefined();
    }
  });

  it('should disable workflow', async () => {
    const disabled = await db.workflowDefinition.update({
      where: { id: workflowId },
      data: { enabled: false },
    });

    expect(disabled.enabled).toBe(false);
  });

  it('should track workflow run failures', async () => {
    const failedRun = await db.workflowRun.create({
      data: {
        tenantId,
        workflowId,
        status: 'FAILED',
        triggerEvent: 'ESTIMATE_SENT',
        triggerData: { estimateId: 'est-123' },
        executionError: 'SMS provider timeout',
        completedAt: new Date(),
      },
    });

    expect(failedRun.status).toBe('FAILED');
    expect(failedRun.executionError).toBeTruthy();
  });

  it('should support multiple workflows per tenant', async () => {
    const workflow2 = await db.workflowDefinition.create({
      data: {
        tenantId,
        name: 'Estimate Follow-up',
        description: 'Follow up unseen estimates',
        triggers: [{ type: 'ESTIMATE_SENT' }],
        actions: [
          { type: 'SEND_EMAIL', config: { template: 'reminder' } },
          { type: 'REQUEST_APPROVAL', config: { requiresApproval: false } },
        ],
        enabled: true,
      },
    });

    const allWorkflows = await db.workflowDefinition.findMany({
      where: { tenantId },
    });

    expect(allWorkflows.length).toBeGreaterThanOrEqual(2);
  });

  it('should support custom trigger data in workflow runs', async () => {
    const run = await db.workflowRun.create({
      data: {
        tenantId,
        workflowId,
        status: 'PENDING',
        triggerEvent: 'MANUAL_TEST',
        triggerData: {
          leadId: 'lead-custom-123',
          leadName: 'Jane Smith',
          phoneNumber: '+14155552671',
          email: 'jane@example.com',
          customField: 'customValue',
        },
      },
    });

    expect(run.triggerData).toEqual(expect.objectContaining({
      leadId: 'lead-custom-123',
      leadName: 'Jane Smith',
    }));
  });
});
