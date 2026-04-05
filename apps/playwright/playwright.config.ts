import { defineConfig, devices } from '@playwright/test';

type EnvMap = Record<string, string | undefined>;

const env = (
  globalThis as {
    process?: { env?: EnvMap };
  }
).process?.env;

const PORT = Number.parseInt(env?.PLAYWRIGHT_STORYBOOK_PORT ?? '6006', 10);
const localBaseURL = `http://127.0.0.1:${PORT}`;
const hasCustomBaseURL = Boolean(env?.PLAYWRIGHT_BASE_URL);
const baseURL = env?.PLAYWRIGHT_BASE_URL ?? localBaseURL;
const storybookStaticDir = '../storybook/storybook-static';
const serveCommand = `pnpm exec serve -c $PWD/serve.json -l tcp://127.0.0.1:${PORT} ${storybookStaticDir}`;

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
  webServer: hasCustomBaseURL
    ? undefined
    : {
        command: serveCommand,
        url: localBaseURL,
        reuseExistingServer: !env?.CI,
        timeout: 120_000
      }
});
