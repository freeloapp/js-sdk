import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/', 'dist/', '**/*.spec.js', 'vitest.config.ts'],
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 80,
        functions: 55,
        branches: 80,
        statements: 80,
      },
    },
  },
});
