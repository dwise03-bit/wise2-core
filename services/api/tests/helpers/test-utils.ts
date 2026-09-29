/**
 * Test Utilities and Helpers
 * Common functions for testing
 */

import jwt from 'jsonwebtoken';

/**
 * Generate test JWT token
 */
export function generateTestToken(overrides?: any): string {
  const payload = {
    sub: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'developer',
    permissions: ['deploy:read', 'service:restart'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
    ...overrides,
  };

  return jwt.sign(payload, 'test-secret', {
    algorithm: 'HS256',
  });
}

/**
 * Generate admin token
 */
export function generateAdminToken(): string {
  return generateTestToken({
    role: 'admin',
    permissions: ['*'],
  });
}

/**
 * Generate operator token
 */
export function generateOperatorToken(): string {
  return generateTestToken({
    role: 'operator',
    permissions: ['deployment:read', 'service:restart', 'service:stop'],
  });
}

/**
 * Generate viewer token
 */
export function generateViewerToken(): string {
  return generateTestToken({
    role: 'viewer',
    permissions: ['deployment:read'],
  });
}

/**
 * Create test user object
 */
export function createTestUser(overrides?: any) {
  return {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'developer',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    ...overrides,
  };
}

/**
 * Create test deployment object
 */
export function createTestDeployment(overrides?: any) {
  return {
    id: 'test-deployment-123',
    user_id: 'test-user-123',
    name: 'Test Deployment',
    description: 'Test deployment for testing',
    configuration: {
      environment: 'test',
      region: 'us-east-1',
    },
    status: 'deployed',
    version: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deployed_at: new Date(),
    deleted_at: null,
    ...overrides,
  };
}

/**
 * Wait for condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  maxWait = 5000,
  interval = 100,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${maxWait}ms`);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock error response
 */
export function mockErrorResponse(code: string, message: string, status = 400) {
  return {
    status,
    json: async () => ({
      success: false,
      error: {
        code,
        message,
      },
    }),
  };
}

/**
 * Mock successful response
 */
export function mockSuccessResponse(data: any, status = 200) {
  return {
    status,
    json: async () => ({
      success: true,
      data,
    }),
  };
}
