import { defineConfig, devices } from '@playwright/test';

type EnvMap = Record<string, string | undefined>;

const env = (
  globalThis as {
    process?: { env?: EnvMap };
  }
).process?.env;

const PORT = Number.parseInt(env?.PLAYWRIGHT_STORYBOOK_PORT ?? '6006', 10);
const baseURL = env?.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: Boolean(env?.CI),
  retries: env?.CI ? 2 : 0,
  workers: env?.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: env?.CI
      ? `pnpm exec serve -c $PWD/serve.json ../storybook/storybook-static -l ${PORT}`
      : `pnpm --filter @frey-ui/storybook exec storybook dev -p ${PORT} --ci`,
    url: baseURL,
    reuseExistingServer: !env?.CI,
    timeout: 120_000
  }
});
