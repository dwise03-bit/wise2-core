import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { WorkflowEngine } from '../services/workflow-engine';

describe('Workflows Integration Tests', () => {
  let app: INestApplication;
  let workflowEngine: WorkflowEngine;

  const mockUser = {
    id: 'user-123',
    tenantId: 'tenant-456',
  };

  const mockWorkflow = {
    name: 'Lead Qualification',
    description: 'Notify when lead status changes to qualified',
    enabled: true,
    triggers: [
      {
        type: 'LEAD_STATUS_CHANGE',
        conditions: { oldStatus: 'CONTACTED', newStatus: 'QUALIFIED' },
      },
    ],
    actions: [
      {
        type: 'SEND_SMS',
        payload: {
          phoneNumber: '555-0123',
          message: 'Lead has been qualified',
        },
      },
      {
        type: 'SEND_EMAIL',
        payload: {
          email: 'manager@example.com',
          subject: 'Lead Qualified',
          body: 'A new lead has been qualified',
        },
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [WorkflowEngine],
    }).compile();

    app = moduleFixture.createNestApplication();
    workflowEngine = moduleFixture.get<WorkflowEngine>(WorkflowEngine);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Workflow Lifecycle', () => {
    let workflowId: string;

    it('should create a workflow', async () => {
      const response = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockWorkflow)
        .expect(201);

      workflowId = response.body.data.id;
      expect(response.body.data.name).toBe(mockWorkflow.name);
      expect(response.body.data.enabled).toBe(true);
    });

    it('should retrieve workflow', async () => {
      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(200);

      expect(response.body.data.id).toBe(workflowId);
      expect(response.body.data.actions).toHaveLength(2);
    });

    it('should list workflows', async () => {
      const response = await request(app.getHttpServer())
        .get('/workflows')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(200);

      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.some((w: any) => w.id === workflowId)).toBe(true);
    });

    it('should update workflow', async () => {
      const response = await request(app.getHttpServer())
        .put(`/workflows/${workflowId}`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send({ name: 'Updated Workflow Name' })
        .expect(200);

      expect(response.body.data.name).toBe('Updated Workflow Name');
    });

    it('should delete workflow', async () => {
      // Create a new workflow to delete
      const createResponse = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockWorkflow)
        .expect(201);

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/workflows/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('Workflow Triggering', () => {
    let workflowId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockWorkflow)
        .expect(201);

      workflowId = response.body.data.id;
    });

    it('should initialize workflow engine', async () => {
      const response = await request(app.getHttpServer())
        .post('/workflows/engine/initialize')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should trigger workflow event', async () => {
      const response = await request(app.getHttpServer())
        .post('/workflows/engine/trigger-event')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send({
          triggerType: 'LEAD_STATUS_CHANGE',
          entityId: 'lead-123',
          data: {
            oldStatus: 'CONTACTED',
            newStatus: 'QUALIFIED',
          },
        })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should track execution history', async () => {
      // First trigger an event
      await request(app.getHttpServer())
        .post('/workflows/engine/trigger-event')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send({
          triggerType: 'LEAD_STATUS_CHANGE',
          entityId: 'lead-456',
          data: { oldStatus: 'CONTACTED', newStatus: 'QUALIFIED' },
        })
        .expect(200);

      // Then check execution history
      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}/executions`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(200);

      expect(response.body.data.items.length).toBeGreaterThan(0);
      expect(response.body.data.items[0]).toHaveProperty('status');
      expect(response.body.data.items[0]).toHaveProperty('actions');
    });
  });

  describe('Workflow Testing', () => {
    let workflowId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockWorkflow)
        .expect(201);

      workflowId = response.body.data.id;
    });

    it('should test workflow with sample data', async () => {
      const response = await request(app.getHttpServer())
        .post(`/workflows/${workflowId}/test`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send({
          oldStatus: 'CONTACTED',
          newStatus: 'QUALIFIED',
        })
        .expect(200);

      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.actions).toBeDefined();
    });
  });

  describe('Workflow Retry Logic', () => {
    it('should retry failed actions', async () => {
      const workflowWithRetry = {
        ...mockWorkflow,
        actions: [
          {
            type: 'SEND_SMS',
            payload: { phoneNumber: '555-0123', message: 'Test' },
            retryPolicy: {
              maxRetries: 3,
              backoffMultiplier: 2,
              initialDelayMs: 100,
            },
          },
        ],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(workflowWithRetry)
        .expect(201);

      const workflowId = createResponse.body.data.id;

      // Trigger event that will execute with retries
      const triggerResponse = await request(app.getHttpServer())
        .post('/workflows/engine/trigger-event')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send({
          triggerType: 'LEAD_STATUS_CHANGE',
          entityId: 'lead-retry-test',
          data: { oldStatus: 'NEW', newStatus: 'CONTACTED' },
        })
        .expect(200);

      // Verify execution was tracked
      expect(triggerResponse.body.data).toBeDefined();
    });
  });

  describe('Workflow Toggle', () => {
    it('should disable workflow', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockWorkflow)
        .expect(201);

      const workflowId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .patch(`/workflows/${workflowId}`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send({ enabled: false })
        .expect(200);

      expect(response.body.data.enabled).toBe(false);
    });
  });

  describe('Tenant Isolation', () => {
    it('should not access workflows from other tenants', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockWorkflow)
        .expect(201);

      const workflowId = createResponse.body.data.id;

      // Try to access with different tenant
      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', 'different-tenant')
        .expect(403); // Forbidden

      expect(response.body.success).toBe(false);
    });
  });
});
