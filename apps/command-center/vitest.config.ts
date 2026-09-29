import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // globals: the suite uses bare describe/it/expect.
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules/**', '.next/**'],
  },
});
