import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
        // 👇 This pattern must align with the `stories` property of your `.storybook/main.ts` config
        '**/*.stories.*',
        // 👇 This pattern must align with the output directory of `storybook build`
        '**/storybook-static/**'
      ]
    }
  }
});
