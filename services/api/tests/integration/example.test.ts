/**
 * Example Integration Tests
 * Shows database and API integration patterns
 */

import { v4 as uuidv4 } from 'uuid';
import {
  initTestDb,
  closeTestDb,
  clearDatabase,
  createTestUserInDb,
  createTestDeploymentInDb,
  getUserFromDb,
  queryTestDb,
} from '../helpers/db-helpers';

describe('Integration Tests - Example', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('User Database Operations', () => {
    it('should create a test user in database', async () => {
      const user = await createTestUserInDb({
        name: 'John Doe',
        role: 'operator',
      });

      expect(user).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.role).toBe('operator');
      expect(user.is_active).toBe(true);
    });

    it('should retrieve user from database', async () => {
      const created = await createTestUserInDb({
        name: 'Jane Smith',
      });

      const retrieved = await getUserFromDb(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Jane Smith');
    });

    it('should query users by role', async () => {
      await createTestUserInDb({ role: 'admin' });
      await createTestUserInDb({ role: 'admin' });
      await createTestUserInDb({ role: 'developer' });

      const admins = await queryTestDb('SELECT * FROM users WHERE role = $1', [
        'admin',
      ]);

      expect(admins.length).toBe(2);
      expect(admins.every((u: any) => u.role === 'admin')).toBe(true);
    });
  });

  describe('Deployment Database Operations', () => {
    it('should create deployment for user', async () => {
      const user = await createTestUserInDb();
      const deployment = await createTestDeploymentInDb(user.id, {
        name: 'Production',
        status: 'deployed',
      });

      expect(deployment).toBeDefined();
      expect(deployment.user_id).toBe(user.id);
      expect(deployment.name).toBe('Production');
      expect(deployment.status).toBe('deployed');
    });

    it('should retrieve deployment by user', async () => {
      const user = await createTestUserInDb();
      const created = await createTestDeploymentInDb(user.id, {
        name: 'Staging',
      });

      const deployments = await queryTestDb(
        'SELECT * FROM deployments WHERE user_id = $1',
        [user.id],
      );

      expect(deployments.length).toBe(1);
      expect(deployments[0].id).toBe(created.id);
    });
  });

  describe('Complex Queries', () => {
    it('should join users and deployments', async () => {
      const user1 = await createTestUserInDb({ name: 'User One' });
      const user2 = await createTestUserInDb({ name: 'User Two' });

      await createTestDeploymentInDb(user1.id);
      await createTestDeploymentInDb(user1.id);
      await createTestDeploymentInDb(user2.id);

      const results = await queryTestDb(
        `SELECT u.name, COUNT(d.id)::int as deployment_count
         FROM users u
         LEFT JOIN deployments d ON u.id = d.user_id
         GROUP BY u.id, u.name
         ORDER BY u.name`,
      );

      expect(results.length).toBe(2);
      expect(results[0].name).toBe('User One');
      expect(Number(results[0].deployment_count)).toBe(2);
      expect(results[1].name).toBe('User Two');
      expect(Number(results[1].deployment_count)).toBe(1);
    });

    it('should count active deployments', async () => {
      const user = await createTestUserInDb();

      await createTestDeploymentInDb(user.id, { status: 'deployed' });
      await createTestDeploymentInDb(user.id, { status: 'deployed' });
      await createTestDeploymentInDb(user.id, { status: 'failed' });

      const results = await queryTestDb(
        `SELECT status, COUNT(*)::int as count
         FROM deployments
         WHERE user_id = $1
         GROUP BY status`,
        [user.id],
      );

      const deployed = results.find((r: any) => r.status === 'deployed');
      const failed = results.find((r: any) => r.status === 'failed');

      expect(Number(deployed.count)).toBe(2);
      expect(Number(failed.count)).toBe(1);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      const user = await createTestUserInDb();
      const deployment = await createTestDeploymentInDb(user.id);

      // Verify deployment references valid user
      const result = await queryTestDb(
        `SELECT u.name as user_name, d.name as deployment_name
         FROM deployments d
         JOIN users u ON d.user_id = u.id
         WHERE d.id = $1`,
        [deployment.id],
      );

      expect(result.length).toBe(1);
      expect(result[0].user_name).toBe(user.name);
    });

    it('should enforce NOT NULL constraint on email', async () => {
      let error: any;
      try {
        await queryTestDb(
          'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), null, 'hash', 'No Email', 'developer'],
        );
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('not-null constraint'); // NOT NULL constraint error
    });
  });
});
