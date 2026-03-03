# @frey-ui/playwright

Playwright end-to-end tests for Frey UI overlays against Storybook.

## Commands

- `pnpm playwright:install`: install Chromium browser binaries.
- `pnpm test:e2e`: run the Playwright suite from repo root.

## Local Usage

From repository root:

1. `pnpm playwright:install`
2. `pnpm test:e2e`

The Playwright config starts Storybook on port `6006` automatically. You can override the base URL or port with:

- `PLAYWRIGHT_BASE_URL`
- `PLAYWRIGHT_STORYBOOK_PORT`
