const nextJest = require('next/jest');

// next/jest reads this app's own next.config.js and tsconfig.json (including
// the "@/*" path alias) so tests can import real source files without any
// hand-rolled moduleNameMapper. The root jest.config.js only covers
// packages/api and packages/ui-components — apps/website had no working test
// config at all (its "test": "jest" script had nothing to run against).
const createJestConfig = nextJest({ dir: __dirname });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};

module.exports = createJestConfig(customJestConfig);
