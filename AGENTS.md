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

- `.nvmrc` is `22.22.0`
- root `package.json` `engines.node` is `22.22.0`

Install dependencies with CI parity:

```bash
pnpm install --frozen-lockfile
```

Optional verification:

```bash
node -v
pnpm -v
```

## Required Validation Before Merge

Run in this exact order. All four commands must pass:

```bash
pnpm typecheck
pnpm lint
pnpm test:coverage
pnpm build
```

## Supporting Workflows

- `pnpm docs:check`: runs `scripts/check-storybook-api-coverage.mjs` to verify exported components are covered by Storybook stories and flag cast-wrapper usage (`as unknown as React.ComponentType`).
- `pnpm ci:changed`: runs affected-package `lint`, `typecheck`, `test`, and `build`.
- `pnpm storybook`: runs Storybook locally for `@frey-ui/storybook`.
- `pnpm build:storybook`: builds static Storybook output for `@frey-ui/storybook`.
- Release flow:
  1. `pnpm changeset`
  2. `pnpm version-packages`
  3. `pnpm release`

## Git Hook/Commit Expectations

- pre-commit runs `pnpm check:staged`
- commit-msg runs `pnpm exec commitlint --edit $1`

