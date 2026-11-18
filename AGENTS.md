# AGENTS Workflow Guide (CI + Daily Core)

## Purpose

This file is the contributor/agent workflow reference for the Frey UI monorepo.
All commands below are grounded in current repository scripts and CI workflows.

## Environment Setup

Use Node 24.16.0 with `nvm` before running any project commands:

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 24.16.0
```

Source of truth for Node version:

- `.nvmrc` is `24.16.0`
- root `package.json` `engines.node` is `24.16.0`

Install dependencies with CI parity:

```bash
pnpm install --frozen-lockfile
```

Optional verification:

```bash
node -v
pnpm -v
```

Make sure internet is available because turbo needs to upload cache through the internet.

## Required Validation Before Merge

Run in this exact order. All six commands must pass:

```bash
pnpm docs:check
pnpm typecheck
pnpm lint
pnpm test:coverage
pnpm test:e2e
pnpm build
```

## Supporting Workflows

- `pnpm docs:check`: runs `scripts/check-storybook-api-coverage.mjs` to verify exported components are covered by Storybook stories and flag cast-wrapper usage (`as unknown as React.ComponentType`).
- `pnpm ci:changed`: runs affected-package `lint`, `typecheck`, `test`, and `build`.
- `pnpm storybook`: runs Storybook locally for `@frey-ui/storybook`.
- `pnpm build:storybook`: builds static Storybook output for `@frey-ui/storybook`.
- `pnpm playwright:install`: installs Chromium for Playwright tests in `apps/playwright`.
- `pnpm test:e2e`: runs Playwright overlay E2E tests against Storybook.
- Release flow:
  1. `pnpm changeset`
  2. `pnpm version-packages`
  3. `pnpm release`

## Agent Self-Review Loop (Required)

For any agent-authored change set (code, tests, stories, docs, or config):

1. Run a self code review on the current diff using severity levels P0-P3.
2. Fix all P0/P1 findings before moving forward.
3. Fix P2 findings unless there is a documented trade-off decision.
4. Repeat review/fix cycles with a hard cap of **3 passes**.

Loop prevention rules:

- If two consecutive passes produce materially identical findings and the diff
  did not change meaningfully, stop iterating and report the decision/blocker.
- Do not re-apply no-op edits.
- Always include a short pros/cons note when choosing between two valid
  implementation options.

Exit criteria:

- No unresolved P0/P1 findings.
- No new regressions introduced by the latest edits.
- Required validation commands pass in the documented order.

## Agent Instructions for UI Components

Before changing components, styles, stories, or example UI, read
[`docs/agent-design-system.md`](docs/agent-design-system.md) and inspect only
the relevant source-of-truth files linked there.

- **CRITICAL:** Never invent component names, props, variants, tokens or imports.
- Source and exported TypeScript types define supported APIs; `theme.css`
  defines tokens; Storybook documents and demonstrates current component usage.
- If `storybook-mcp` is available, use `list-all-documentation`, then
  `get-documentation` for affected components. Before updating stories, use
  `get-storybook-story-instructions` and validate using `run-story-tests`.
- If MCP is unavailable, read component source and local Storybook stories
  directly; don't claim a tool was used or block a necessary source review.
- If a token/component/variant is missing, describe the gap. Do not silently
  substitute a semantically different variant or invent a local imitation.
  Keep source, Storybook and agent guidance synchronized when adding an API.
- Run `pnpm docs:check` and relevant local tests/checks; disclose any skipped
  checks. Avoid unnecessary CI runs for documentation changes.

## Git Hook/Commit Expectations

- pre-commit runs `pnpm check:staged`
- commit-msg runs `pnpm exec commitlint --edit $1`
