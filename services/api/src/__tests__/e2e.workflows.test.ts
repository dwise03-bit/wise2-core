import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Full Workflow E2E Tests', () => {
  let app: INestApplication;

  const tenant1 = { id: 'tenant-e2e-1', token: 'token-e2e-1', userId: 'user-e2e-1' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Lead → Estimate → Approval → Payment E2E', () => {
    let leadId: string;
    let estimateId: string;
    let approvalId: string;

    it('should create a lead', async () => {
      const response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          status: 'NEW',
          estimatedValue: 5000,
        })
        .expect(201);

      leadId = response.body.data.id;
      expect(leadId).toBeDefined();
      expect(response.body.data.status).toBe('NEW');
      expect(response.body.data.estimatedValue).toBe(5000);
    });

    it('should create an estimate for the lead', async () => {
      const response = await request(app.getHttpServer())
        .post('/estimates')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          leadId,
          amount: 5000,
          description: 'HVAC Installation',
          lineItems: [
            { description: 'Labor', amount: 3000 },
            { description: 'Materials', amount: 2000 },
          ],
          taxRate: 0.08,
        })
        .expect(201);

      estimateId = response.body.data.id;
      expect(estimateId).toBeDefined();
      expect(response.body.data.status).toBe('DRAFT');
      expect(response.body.data.lineItems).toHaveLength(2);
    });

    it('should send estimate (creates approval)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/estimates/${estimateId}/send`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          method: 'email',
          recipientEmail: 'john.doe@example.com',
        })
        .expect(200);

      approvalId = response.body.data.approvalId;
      expect(approvalId).toBeDefined();
      expect(response.body.data.status).toBe('SENT');
    });

    it('should approve the estimate', async () => {
      const response = await request(app.getHttpServer())
        .post(`/approvals/${approvalId}/approve`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({ reason: 'Approved for processing' })
        .expect(200);

      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.approvedBy).toBeDefined();
    });

    it('should execute approval (send email)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/approvals/${approvalId}/execute`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(200);

      expect(response.body.data.status).toBe('EXECUTED');
      expect(response.body.data.executionResult).toBeDefined();
    });

    it('should accept estimate', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/estimates/${estimateId}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({ status: 'ACCEPTED' })
        .expect(200);

      expect(response.body.data.status).toBe('ACCEPTED');
    });

    it('should create dispatch job', async () => {
      const response = await request(app.getHttpServer())
        .post('/dispatch/jobs')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          leadId,
          estimateId,
          description: 'Install new HVAC system',
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          technicians: 1,
        })
        .expect(201);

      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.status).toBe('SCHEDULED');
    });

    it('should process payment', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/charge')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          customerId: 'cust_e2e_1',
          amount: 5400, // 5000 + 8% tax
          currency: 'USD',
          description: 'HVAC Installation - Invoice #1',
        })
        .expect(200);

      expect(response.body.data.status).toBe('succeeded');
      expect(response.body.data.transactionId).toBeDefined();
      expect(response.body.data.amount).toBe(5400);
    });
  });

  describe('Workflow Trigger on Lead Status Change', () => {
    let workflowId: string;
    let leadId: string;

    it('should create workflow: SMS on Lead Qualified', async () => {
      const response = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          name: 'SMS on Qualification',
          description: 'Send SMS when lead is qualified',
          enabled: true,
          triggers: [
            {
              type: 'LEAD_STATUS_CHANGE',
              conditions: { oldStatus: 'NEW', newStatus: 'QUALIFIED' },
            },
          ],
          actions: [
            {
              type: 'SEND_SMS',
              payload: {
                phoneNumber: '+1234567890',
                message: 'Congratulations! Your quote is ready.',
              },
            },
          ],
        })
        .expect(201);

      workflowId = response.body.data.id;
      expect(workflowId).toBeDefined();
    });

    it('should create a lead for workflow test', async () => {
      const response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+9876543210',
          status: 'NEW',
        })
        .expect(201);

      leadId = response.body.data.id;
    });

    it('should change lead status to QUALIFIED (triggers workflow)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/crm/leads/${leadId}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({ status: 'QUALIFIED' })
        .expect(200);

      expect(response.body.data.status).toBe('QUALIFIED');
    });

    it('should verify workflow was triggered', async () => {
      // Wait a moment for async workflow processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}/executions`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(200);

      expect(response.body.data.items.length).toBeGreaterThan(0);
      const execution = response.body.data.items[0];
      expect(execution.status).toMatch(/COMPLETED|PENDING|RUNNING/);
      expect(execution.actions).toBeDefined();
    });
  });

  describe('Multi-Action Workflow E2E', () => {
    let workflowId: string;
    let leadId: string;

    it('should create multi-action workflow', async () => {
      const response = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          name: 'Multi-Channel Notification',
          enabled: true,
          triggers: [{ type: 'LEAD_CREATED' }],
          actions: [
            {
              type: 'SEND_SMS',
              payload: {
                phoneNumber: '+1234567890',
                message: 'New lead received!',
              },
            },
            {
              type: 'SEND_EMAIL',
              payload: {
                email: 'team@example.com',
                subject: 'New Lead Alert',
                body: 'A new lead has been received in the system.',
              },
            },
            {
              type: 'CREATE_TASK',
              payload: {
                title: 'Follow up on new lead',
                description: 'Contact the lead within 2 hours',
                assignee: 'user-e2e-1',
              },
            },
          ],
        })
        .expect(201);

      workflowId = response.body.data.id;
      expect(workflowId).toBeDefined();
    });

    it('should create lead (triggers multi-action workflow)', async () => {
      const response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@example.com',
          phone: '+5551234567',
          status: 'NEW',
        })
        .expect(201);

      leadId = response.body.data.id;
    });

    it('should verify all actions were executed', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}/executions`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(200);

      expect(response.body.data.items.length).toBeGreaterThan(0);
      const execution = response.body.data.items[0];
      expect(execution.actions.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Workflow with Retry Logic E2E', () => {
    let workflowId: string;

    it('should create workflow with retry policy', async () => {
      const response = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          name: 'SMS with Retries',
          enabled: true,
          triggers: [{ type: 'LEAD_CREATED' }],
          actions: [
            {
              type: 'SEND_SMS',
              payload: {
                phoneNumber: '+1234567890',
                message: 'Test SMS with retry',
              },
              retryPolicy: {
                maxRetries: 3,
                backoffMultiplier: 2,
                initialDelayMs: 100,
              },
            },
          ],
        })
        .expect(201);

      workflowId = response.body.data.id;
    });

    it('should execute workflow with retry handling', async () => {
      const leadResponse = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'RetryTest',
          lastName: 'User',
          email: 'retry@example.com',
          status: 'NEW',
        })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}/executions`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(200);

      expect(response.body.data.items.length).toBeGreaterThan(0);
    });
  });

  describe('Workflow Toggle and Disable E2E', () => {
    let workflowId: string;

    it('should create and then disable workflow', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/workflows')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          name: 'Disable Test Workflow',
          enabled: true,
          triggers: [{ type: 'LEAD_CREATED' }],
          actions: [
            {
              type: 'SEND_SMS',
              payload: {
                phoneNumber: '+1234567890',
                message: 'This will be disabled',
              },
            },
          ],
        })
        .expect(201);

      workflowId = createResponse.body.data.id;

      const disableResponse = await request(app.getHttpServer())
        .patch(`/workflows/${workflowId}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({ enabled: false })
        .expect(200);

      expect(disableResponse.body.data.enabled).toBe(false);
    });

    it('should verify disabled workflow is not triggered', async () => {
      const leadResponse = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'NoTrigger',
          lastName: 'User',
          email: 'notrigger@example.com',
          status: 'NEW',
        })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await request(app.getHttpServer())
        .get(`/workflows/${workflowId}/executions`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(200);

      // Disabled workflow should not have new executions
      const recentExecutions = response.body.data.items.filter(
        (e: any) => new Date(e.createdAt).getTime() > Date.now() - 2000
      );
      expect(recentExecutions.length).toBe(0);
    });
  });
});
