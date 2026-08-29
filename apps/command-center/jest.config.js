/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      require.resolve('../../packages/api/node_modules/ts-jest'),
      { tsconfig: { esModuleInterop: true, strict: false, module: 'commonjs' } },
    ],
  },
};
