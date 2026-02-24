import {
  coverageConfigDefaults,
  defineConfig,
  mergeConfig
} from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        enabled: false,
        exclude: [
          ...coverageConfigDefaults.exclude,
          '**/.storybook/**',
          // This pattern must align with the `stories` property of `.storybook/main.ts`.
          '**/*.stories.*',
          // This pattern must align with the output directory of `storybook build`.
          '**/storybook-static/**'
        ]
      }
    }
  })
);
