# @frey-ui/playwright

Playwright end-to-end tests for Frey UI components and overlays against Storybook.

## Commands

- From repo root:
  - `pnpm playwright:install`: install Chromium browser binaries.
  - `pnpm test:e2e`: run the Playwright suite.
- From `apps/playwright`:
  - `pnpm test:e2e:headed`: run tests in headed mode.
  - `pnpm test:e2e:ui`: open Playwright UI mode.

## Local Usage

From repository root:

1. `pnpm playwright:install`
2. `pnpm test:e2e`

Optional local debug commands:

1. `pnpm --filter @frey-ui/playwright run test:e2e:headed`
2. `pnpm --filter @frey-ui/playwright run test:e2e:ui`

The Playwright config starts Storybook on port `6006` automatically. You can override the base URL or port with:

- `PLAYWRIGHT_BASE_URL`
- `PLAYWRIGHT_STORYBOOK_PORT`
