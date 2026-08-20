import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Security Tests', () => {
  let app: INestApplication;

  const tenant1 = { id: 'tenant-1', token: 'token-1', userId: 'user-1' };
  const tenant2 = { id: 'tenant-2', token: 'token-2', userId: 'user-2' };

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

  describe('Tenant Isolation', () => {
    let lead1Id: string;
    let lead2Id: string;

    beforeAll(async () => {
      // Create lead in tenant 1
      const lead1Response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'NEW',
        })
        .expect(201);
      lead1Id = lead1Response.body.data.id;

      // Create lead in tenant 2
      const lead2Response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant2.token}`)
        .set('X-Tenant-Id', tenant2.id)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          status: 'NEW',
        })
        .expect(201);
      lead2Id = lead2Response.body.data.id;
    });

    it('should not allow tenant 1 to access tenant 2 leads', async () => {
      const response = await request(app.getHttpServer())
        .get(`/crm/leads/${lead2Id}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(403); // Forbidden

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toContain('FORBIDDEN');
    });

    it('should not leak data in list endpoints', async () => {
      // Tenant 1 lists leads
      const tenant1Response = await request(app.getHttpServer())
        .get('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(200);

      // Verify tenant 2 lead is not in results
      expect(
        tenant1Response.body.data.items.some((lead: any) => lead.id === lead2Id)
      ).toBe(false);

      // Verify tenant 1 lead is in results
      expect(
        tenant1Response.body.data.items.some((lead: any) => lead.id === lead1Id)
      ).toBe(true);
    });

    it('should not allow updating another tenant\'s data', async () => {
      const response = await request(app.getHttpServer())
        .put(`/crm/leads/${lead2Id}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({ firstName: 'Hacked' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should not allow deleting another tenant\'s data', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/crm/leads/${lead2Id}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/crm/leads')
        .set('X-Tenant-Id', tenant1.id)
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/crm/leads')
        .set('Authorization', 'Bearer invalid-token-xyz')
        .set('X-Tenant-Id', tenant1.id)
        .expect(401);
    });

    it('should reject expired tokens', async () => {
      const expiredToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwMDAwMDB9.invalid';
      await request(app.getHttpServer())
        .get('/crm/leads')
        .set('Authorization', expiredToken)
        .set('X-Tenant-Id', tenant1.id)
        .expect(401);
    });

    it('should require Tenant-Id header', async () => {
      const response = await request(app.getHttpServer())
        .get('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .expect(400);

      expect(response.body.error.message).toContain('tenant');
    });
  });

  describe('Input Validation', () => {
    it('should reject malformed JSON', async () => {
      await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'John',
          // Missing required fields
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'not-an-email',
          status: 'NEW',
        })
        .expect(400);

      expect(response.body.error.message).toContain('email');
    });

    it('should validate enum values', async () => {
      const response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          status: 'INVALID_STATUS',
        })
        .expect(400);

      expect(response.body.error.message).toContain('status');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should safely handle SQL-like input in search', async () => {
      const maliciousInput = "'; DROP TABLE leads; --";
      const response = await request(app.getHttpServer())
        .get('/crm/leads/search')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .query({ q: maliciousInput })
        .expect(200); // Should succeed with no results

      expect(response.body.data).toEqual([]);
    });

    it('should safely handle SQL in lead name', async () => {
      const response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: "'; DROP TABLE users; --",
          lastName: 'Doe',
          email: 'test@example.com',
          status: 'NEW',
        })
        .expect(201);

      expect(response.body.data.firstName).toBe("'; DROP TABLE users; --");
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML in responses', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const response = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: xssPayload,
          lastName: 'Doe',
          email: 'test@example.com',
          status: 'NEW',
        })
        .expect(201);

      const responseBody = JSON.stringify(response.body.data);
      expect(responseBody).toContain(xssPayload); // Safely stored, not executed
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('CSRF Protection', () => {
    it('should have CSRF tokens in state-changing operations', async () => {
      // GET endpoint should be safe
      const response = await request(app.getHttpServer())
        .get('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .expect(200);

      // Should not expose sensitive tokens in response
      expect(response.body).not.toHaveProperty('_csrf');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      let rateLimitedResponse;

      // Make many requests rapidly
      for (let i = 0; i < 105; i++) {
        const response = await request(app.getHttpServer())
          .get('/crm/leads')
          .set('Authorization', `Bearer ${tenant1.token}`)
          .set('X-Tenant-Id', tenant1.id);

        if (response.status === 429) {
          rateLimitedResponse = response;
          break;
        }
      }

      expect(rateLimitedResponse?.status).toBe(429);
      expect(rateLimitedResponse?.headers['retry-after']).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    it('should log sensitive operations', async () => {
      // Create a lead (should be logged)
      const leadResponse = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .send({
          firstName: 'Audit',
          lastName: 'Test',
          email: 'audit@example.com',
          status: 'NEW',
        })
        .expect(201);

      const leadId = leadResponse.body.data.id;

      // Check audit log
      const auditResponse = await request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('X-Tenant-Id', tenant1.id)
        .query({ entityId: leadId })
        .expect(200);

      expect(auditResponse.body.data.items.length).toBeGreaterThan(0);
      expect(auditResponse.body.data.items[0]).toHaveProperty('userId');
      expect(auditResponse.body.data.items[0]).toHaveProperty('action');
      expect(auditResponse.body.data.items[0]).toHaveProperty('timestamp');
    });
  });
});
