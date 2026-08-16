module.exports = {
  projects: [
    {
      displayName: 'api',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/api'],
      testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.module.ts',
        '!src/main.ts',
      ],
      coveragePathIgnorePatterns: ['/node_modules/'],
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    {
      displayName: 'ui',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/packages/ui-components'],
      testMatch: ['**/__tests__/**/*.tsx', '**/?(*.)+(spec|test).tsx'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  ],
}
