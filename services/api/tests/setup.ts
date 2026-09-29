/**
 * Jest Setup File
 * Runs before all tests
 */

import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test timeout (30 seconds)
jest.setTimeout(30000);

// Mock console methods in test output
global.console = {
  ...console,
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
};

// Suppress logs during tests
process.env.LOG_LEVEL = 'error';

// Disable HTTP request logging
process.env.API_LOG_LEVEL = 'error';

// Set test database
if (!process.env.TEST_DATABASE_URL) {
  process.env.TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/wise2_test';
}

if (!process.env.TEST_REDIS_URL) {
  process.env.TEST_REDIS_URL = 'redis://localhost:6379/1';
}

// Global teardown
afterAll(async () => {
  // Close any open connections
  jest.clearAllTimers();
});
