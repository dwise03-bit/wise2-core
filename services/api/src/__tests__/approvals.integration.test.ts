import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { ApprovalExecutorFactory } from '../services/approval-executors';

describe('Approvals Integration Tests', () => {
  let app: INestApplication;
  let executorFactory: ApprovalExecutorFactory;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    tenantId: 'tenant-456',
    role: 'ADMIN',
  };

  const mockApprovalRequest = {
    entityType: 'ESTIMATE',
    entityId: 'estimate-789',
    action: 'SEND_SMS',
    parameters: {
      phoneNumber: '555-0123',
      message: 'Your estimate is ready',
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ApprovalExecutorFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    executorFactory = moduleFixture.get<ApprovalExecutorFactory>(ApprovalExecutorFactory);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Approval Lifecycle', () => {
    let approvalId: string;

    it('should create a pending approval', async () => {
      const response = await request(app.getHttpServer())
        .post('/approvals')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockApprovalRequest)
        .expect(201);

      approvalId = response.body.data.id;
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.entityId).toBe(mockApprovalRequest.entityId);
    });

    it('should retrieve pending approval', async () => {
      const response = await request(app.getHttpServer())
        .get('/approvals/pending')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(200);

      expect(response.body.data.items).toContainEqual(
        expect.objectContaining({
          id: approvalId,
          status: 'PENDING',
        })
      );
    });

    it('should approve the request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/approvals/${approvalId}/approve`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send({ reason: 'Looks good' })
        .expect(200);

      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.approvedBy).toBe(mockUser.id);
    });

    it('should execute approved action', async () => {
      const response = await request(app.getHttpServer())
        .post(`/approvals/${approvalId}/execute`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(200);

      expect(response.body.data.status).toBe('EXECUTED');
      expect(response.body.data.executionResult).toBeDefined();
    });
  });

  describe('Approval Rejection', () => {
    let rejectionApprovalId: string;

    it('should create approval for rejection test', async () => {
      const response = await request(app.getHttpServer())
        .post('/approvals')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockApprovalRequest)
        .expect(201);

      rejectionApprovalId = response.body.data.id;
    });

    it('should reject the request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/approvals/${rejectionApprovalId}/reject`)
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send({ reason: 'Need more information' })
        .expect(200);

      expect(response.body.data.status).toBe('REJECTED');
      expect(response.body.data.rejectionReason).toBe('Need more information');
    });
  });

  describe('SMS Execution', () => {
    it('should execute SMS action with demo provider', async () => {
      const result = await executorFactory.executeSendSMS({
        phoneNumber: '555-0123',
        message: 'Test message',
        from: 'WISE2',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.cost).toBe(0.0075); // Demo cost
      expect(result.maskedPhoneNumber).toBe('***-0123');
    });

    it('should handle SMS validation errors', async () => {
      const result = await executorFactory.executeSendSMS({
        phoneNumber: '', // Invalid
        message: 'Test',
        from: 'WISE2',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Phone number');
    });
  });

  describe('Email Execution', () => {
    it('should execute email action with demo provider', async () => {
      const result = await executorFactory.executeSendEmail({
        email: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test body',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.maskedEmail).toBe('r****@example.com');
    });
  });

  describe('Payment Execution', () => {
    it('should execute payment action with demo provider', async () => {
      const result = await executorFactory.executeChargePayment({
        customerId: 'cust-123',
        amount: 10000, // $100.00
        currency: 'USD',
        description: 'Estimate payment',
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.fee).toBe(3.3); // 2.9% + $0.30
      expect(result.net).toBe(9996.7);
      expect(result.maskedCustomerId).toBe('cust-***');
    });
  });

  describe('Tenant Isolation', () => {
    it('should not allow access to other tenant approvals', async () => {
      const response = await request(app.getHttpServer())
        .get('/approvals')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', 'different-tenant-789')
        .expect(200);

      expect(response.body.data.items).toHaveLength(0);
    });

    it('should reject requests without tenant header', async () => {
      await request(app.getHttpServer())
        .get('/approvals')
        .set('Authorization', `Bearer test-token`)
        .expect(400); // Missing tenant ID
    });
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/approvals')
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(401);
    });

    it('should reject invalid tokens', async () => {
      await request(app.getHttpServer())
        .get('/approvals')
        .set('Authorization', 'Bearer invalid-token')
        .set('X-Tenant-Id', mockUser.tenantId)
        .expect(401);
    });
  });

  describe('Audit Logging', () => {
    it('should log approval creation', async () => {
      await request(app.getHttpServer())
        .post('/approvals')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .send(mockApprovalRequest)
        .expect(201);

      // Verify audit log entry exists
      const auditResponse = await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer test-token`)
        .set('X-Tenant-Id', mockUser.tenantId)
        .query({ action: 'APPROVAL_CREATED' })
        .expect(200);

      expect(auditResponse.body.data.items.length).toBeGreaterThan(0);
    });
  });
});
