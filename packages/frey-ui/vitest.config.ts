import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'frey-ui',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 100
      },
      exclude: [
        'src/index.ts',
        'src/types/**',
        'src/**/*.module.css',
        '**/*.mdx',
        '**/*.story.*',
        '**/*.stories.*',
        ...(configDefaults.coverage.exclude || [])
      ]
    }
  }
});
