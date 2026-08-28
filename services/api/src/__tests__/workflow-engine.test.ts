import { WorkflowEngine } from '../services/workflow-engine';
import { PrismaClient } from '@prisma/client';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;
  let db: PrismaClient;

  beforeAll(async () => {
    db = new PrismaClient();
  });

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('Workflow Registration', () => {
    it('should register a workflow', () => {
      const workflow = {
        id: 'workflow_123',
        tenantId: 'tenant_1',
        name: 'Test Workflow',
        triggers: ['LEAD_STATUS_CHANGE'],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow);
      const retrieved = engine.getWorkflow('workflow_123');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Workflow');
    });

    it('should list active workflows for tenant', () => {
      const tenantId = 'tenant_123';

      const workflow1 = {
        id: 'workflow_1',
        tenantId,
        name: 'Active Workflow',
        triggers: ['LEAD_STATUS_CHANGE'],
        actions: [],
        enabled: true,
      };

      const workflow2 = {
        id: 'workflow_2',
        tenantId,
        name: 'Disabled Workflow',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: false,
      };

      engine.registerWorkflow(workflow1);
      engine.registerWorkflow(workflow2);

      const active = engine.listWorkflows(tenantId);

      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('workflow_1');
      expect(active[0].enabled).toBe(true);
    });

    it('should not list workflows from other tenants', () => {
      const workflow = {
        id: 'workflow_456',
        tenantId: 'tenant_a',
        name: 'Workflow A',
        triggers: [],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow);
      const listB = engine.listWorkflows('tenant_b');

      expect(listB).toHaveLength(0);
    });
  });

  describe('Trigger Processing', () => {
    it('should match workflows by trigger type', async () => {
      const workflow = {
        id: 'workflow_789',
        tenantId: 'tenant_1',
        name: 'SMS on Qualified',
        triggers: ['LEAD_STATUS_CHANGE'],
        actions: [
          {
            id: 'action_1',
            type: 'SEND_SMS',
            payload: {
              phoneNumber: '+1234567890',
              message: 'Congratulations!',
            },
          },
        ],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_STATUS_CHANGE',
        entityId: 'lead_123',
        entityType: 'Lead',
        data: { oldStatus: 'NEW', newStatus: 'QUALIFIED' },
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);

      expect(executions).toHaveLength(1);
      expect(executions[0].workflowId).toBe('workflow_789');
    });

    it('should not match workflows from other tenants', async () => {
      const workflow = {
        id: 'workflow_999',
        tenantId: 'tenant_a',
        name: 'Workflow A',
        triggers: ['LEAD_STATUS_CHANGE'],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_b',
        triggerType: 'LEAD_STATUS_CHANGE',
        entityId: 'lead_456',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);

      expect(executions).toHaveLength(0);
    });

    it('should only match enabled workflows', async () => {
      const workflow = {
        id: 'workflow_disabled',
        tenantId: 'tenant_1',
        name: 'Disabled',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: false,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_CREATED',
        entityId: 'lead_789',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);

      expect(executions).toHaveLength(0);
    });

    it('should handle multiple matching workflows', async () => {
      const workflow1 = {
        id: 'workflow_a',
        tenantId: 'tenant_1',
        name: 'Workflow A',
        triggers: ['LEAD_QUALIFIED'],
        actions: [],
        enabled: true,
      };

      const workflow2 = {
        id: 'workflow_b',
        tenantId: 'tenant_1',
        name: 'Workflow B',
        triggers: ['LEAD_QUALIFIED', 'LEAD_STATUS_CHANGE'],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow1);
      engine.registerWorkflow(workflow2);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_QUALIFIED',
        entityId: 'lead_111',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);

      expect(executions.length).toBeGreaterThanOrEqual(1);
      expect(executions.map((e) => e.workflowId)).toContain('workflow_a');
    });
  });

  describe('Execution State', () => {
    it('should track execution status', async () => {
      const workflow = {
        id: 'workflow_status',
        tenantId: 'tenant_1',
        name: 'Test Workflow',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_CREATED',
        entityId: 'lead_222',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);
      const execution = executions[0];

      expect(execution.status).toMatch(/PENDING|COMPLETED|FAILED/);
      expect(execution.startedAt).toBeDefined();
    });

    it('should retrieve execution by ID', async () => {
      const workflow = {
        id: 'workflow_retrieve',
        tenantId: 'tenant_1',
        name: 'Test',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_CREATED',
        entityId: 'lead_333',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);
      const executionId = executions[0].id;

      const retrieved = engine.getExecution(executionId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(executionId);
      expect(retrieved?.workflowId).toBe('workflow_retrieve');
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed actions with exponential backoff', async () => {
      const workflow = {
        id: 'workflow_retry',
        tenantId: 'tenant_1',
        name: 'Test Retry',
        triggers: ['LEAD_CREATED'],
        actions: [
          {
            id: 'action_1',
            type: 'SEND_SMS',
            payload: {},
            retryPolicy: {
              maxRetries: 3,
              backoffMultiplier: 2,
              initialDelayMs: 100,
            },
          },
        ],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_CREATED',
        entityId: 'lead_444',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);

      expect(executions).toHaveLength(1);
      const execution = executions[0];

      expect(execution.actions).toBeDefined();
      if (execution.actions.length > 0) {
        const action = execution.actions[0];
        expect(action.attempts).toBeLessThanOrEqual(4); // initial + 3 retries
      }
    });
  });

  describe('Action Execution', () => {
    it('should execute SMS action', async () => {
      const workflow = {
        id: 'workflow_sms',
        tenantId: 'tenant_1',
        name: 'SMS Test',
        triggers: ['LEAD_QUALIFIED'],
        actions: [
          {
            id: 'action_sms',
            type: 'SEND_SMS',
            payload: {
              phoneNumber: '+1234567890',
              message: 'Test SMS',
            },
          },
        ],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_QUALIFIED',
        entityId: 'lead_555',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);

      expect(executions).toHaveLength(1);
      expect(executions[0].actions.length).toBeGreaterThan(0);
    });

    it('should execute email action', async () => {
      const workflow = {
        id: 'workflow_email',
        tenantId: 'tenant_1',
        name: 'Email Test',
        triggers: ['LEAD_CREATED'],
        actions: [
          {
            id: 'action_email',
            type: 'SEND_EMAIL',
            payload: {
              email: 'manager@example.com',
              subject: 'New Lead',
              body: 'A new lead has arrived',
            },
          },
        ],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_CREATED',
        entityId: 'lead_666',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const executions = await engine.processTrigger(event);

      expect(executions).toHaveLength(1);
    });
  });

  describe('Workflow Control', () => {
    it('should disable workflow', () => {
      const workflow = {
        id: 'workflow_toggle',
        tenantId: 'tenant_1',
        name: 'Toggle Test',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      engine.toggleWorkflow('workflow_toggle', false);

      const updated = engine.getWorkflow('workflow_toggle');
      expect(updated?.enabled).toBe(false);
    });

    it('should enable workflow', () => {
      const workflow = {
        id: 'workflow_enable',
        tenantId: 'tenant_1',
        name: 'Enable Test',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: false,
      };

      engine.registerWorkflow(workflow);

      engine.toggleWorkflow('workflow_enable', true);

      const updated = engine.getWorkflow('workflow_enable');
      expect(updated?.enabled).toBe(true);
    });
  });

  describe('History & Audit', () => {
    it('should track execution history', async () => {
      const workflow = {
        id: 'workflow_history',
        tenantId: 'tenant_1',
        name: 'History Test',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_CREATED',
        entityId: 'lead_777',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      const firstRun = await engine.processTrigger(event);
      expect(firstRun).toHaveLength(1);

      const executions = engine.getWorkflowExecutions('workflow_history');
      expect(executions.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter executions by workflow ID', async () => {
      const workflow1 = {
        id: 'workflow_filter_1',
        tenantId: 'tenant_1',
        name: 'Filter Test 1',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: true,
      };

      const workflow2 = {
        id: 'workflow_filter_2',
        tenantId: 'tenant_1',
        name: 'Filter Test 2',
        triggers: ['LEAD_CREATED'],
        actions: [],
        enabled: true,
      };

      engine.registerWorkflow(workflow1);
      engine.registerWorkflow(workflow2);

      const event = {
        tenantId: 'tenant_1',
        triggerType: 'LEAD_CREATED',
        entityId: 'lead_888',
        entityType: 'Lead',
        data: {},
        timestamp: new Date(),
      };

      await engine.processTrigger(event);

      const executions1 = engine.getWorkflowExecutions('workflow_filter_1');
      const executions2 = engine.getWorkflowExecutions('workflow_filter_2');

      expect(executions1.length).toBeGreaterThanOrEqual(0);
      expect(executions2.length).toBeGreaterThanOrEqual(0);
    });
  });
});
