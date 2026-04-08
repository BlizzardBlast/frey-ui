# AGENTS Workflow Guide (CI + Daily Core)

## Purpose

This file is the contributor/agent workflow reference for the Frey UI monorepo.
All commands below are grounded in current repository scripts and CI workflows.

## Environment Setup

Use Node 22 with `nvm` before running any project commands:

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 22
```

Source of truth for Node version:

- `.nvmrc` is `22.22.2`
- root `package.json` `engines.node` is `22.22.2`

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

## Agent Instructions for UI Components (Storybook MCP)

When working on UI components, stories, or component docs, always use the `storybook-mcp` tools as the source of truth.

- **CRITICAL:** Never hallucinate component properties.
- Query `list-all-documentation` first to list available documented components.
- Query `get-documentation` for the specific component to confirm all supported properties, types, and examples.
- Only use properties that are explicitly documented.
- Query `get-storybook-story-instructions` before creating or updating stories so you follow current project conventions.
- Validate changes by running `run-story-tests`.

## Git Hook/Commit Expectations

- pre-commit runs `pnpm check:staged`
- commit-msg runs `pnpm exec commitlint --edit $1`
