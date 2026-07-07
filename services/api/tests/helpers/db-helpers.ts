/**
 * Database Test Helpers
 * Test fixtures and database utilities
 */

import { Pool } from 'pg';

let testPool: Pool;

/**
 * Initialize test database connection
 */
export async function initTestDb(): Promise<Pool> {
  if (testPool) {
    return testPool;
  }

  const connectionString =
    process.env.TEST_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/wise2_test';

  testPool = new Pool({
    connectionString,
    max: 2,
  });

  // Test connection
  try {
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }

  return testPool;
}

/**
 * Close test database connection
 */
export async function closeTestDb(): Promise<void> {
  if (testPool) {
    await testPool.end();
    testPool = null as any;
  }
}

/**
 * Clear all tables (reset database state)
 */
export async function clearDatabase(): Promise<void> {
  const pool = await initTestDb();

  const tables = [
    'automation_tasks',
    'automation_jobs',
    'audit_logs',
    'services',
    'deployment_services',
    'deployments',
    'sessions',
    'users',
  ];

  for (const table of tables) {
    await pool.query(`TRUNCATE TABLE ${table} CASCADE;`);
  }
}

/**
 * Create test user in database
 */
export async function createTestUserInDb(userData?: any) {
  const pool = await initTestDb();

  const id = 'test-user-' + Math.random().toString(36).substr(2, 9);
  const email = `test-${Math.random().toString(36).substr(2, 9)}@example.com`;

  const result = await pool.query(
    `INSERT INTO users (id, email, password_hash, name, role, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      email,
      'hashed_password',
      userData?.name || 'Test User',
      userData?.role || 'developer',
      true,
    ],
  );

  return result.rows[0];
}

/**
 * Create test deployment in database
 */
export async function createTestDeploymentInDb(
  userId: string,
  deploymentData?: any,
) {
  const pool = await initTestDb();

  const id = 'test-deployment-' + Math.random().toString(36).substr(2, 9);

  const result = await pool.query(
    `INSERT INTO deployments (id, user_id, name, description, configuration, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      userId,
      deploymentData?.name || 'Test Deployment',
      deploymentData?.description || 'Test deployment',
      deploymentData?.configuration || { environment: 'test' },
      deploymentData?.status || 'deployed',
    ],
  );

  return result.rows[0];
}

/**
 * Create test service in database
 */
export async function createTestServiceInDb(
  deploymentId: string,
  serviceData?: any,
) {
  const pool = await initTestDb();

  const id = 'test-service-' + Math.random().toString(36).substr(2, 9);

  const result = await pool.query(
    `INSERT INTO services (id, deployment_id, name, type, status, is_healthy)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      deploymentId,
      serviceData?.name || 'Test Service',
      serviceData?.type || 'api',
      serviceData?.status || 'running',
      serviceData?.is_healthy !== undefined ? serviceData.is_healthy : true,
    ],
  );

  return result.rows[0];
}

/**
 * Get user from database
 */
export async function getUserFromDb(userId: string) {
  const pool = await initTestDb();
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

/**
 * Get deployment from database
 */
export async function getDeploymentFromDb(deploymentId: string) {
  const pool = await initTestDb();
  const result = await pool.query(
    'SELECT * FROM deployments WHERE id = $1',
    [deploymentId],
  );
  return result.rows[0];
}

/**
 * Query database
 */
export async function queryTestDb(sql: string, params?: any[]) {
  const pool = await initTestDb();
  const result = await pool.query(sql, params);
  return result.rows;
}

/**
 * Execute database update/insert/delete
 */
export async function executeTestDb(sql: string, params?: any[]) {
  const pool = await initTestDb();
  const result = await pool.query(sql, params);
  return result.rowCount;
}
