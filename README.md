# Frey UI Monorepo

This repository contains the Frey UI component library, Storybook docs app, and Playwright end-to-end test app.

## Workspaces

- `packages/frey-ui`: published React component library (`frey-ui`)
- `apps/storybook`: local docs and development environment for components
- `apps/playwright`: browser E2E tests against Storybook

## Requirements

- Node.js `22.22.2` (see `.nvmrc`)
- pnpm `10.33.0`

## Getting Started

```bash
pnpm install
```

## Common Commands

```bash
pnpm storybook        # run Storybook locally
pnpm docs:check       # verify Storybook API docs coverage
pnpm playwright:install  # install Playwright Chromium browser
pnpm test:e2e         # run Playwright overlay e2e tests
pnpm test:coverage    # run frey-ui unit tests with coverage
pnpm build            # build all workspaces
pnpm test             # run tests across workspaces
pnpm lint             # lint all workspaces
pnpm typecheck        # type-check all workspaces
```

## Package Documentation

For install, usage, API, accessibility details, and theming docs, see:

- [`packages/frey-ui/README.md`](./packages/frey-ui/README.md)

## Roadmap Progress

Roadmap and component status evolve quickly.

- For package-level roadmap notes, see [`packages/frey-ui/README.md`](./packages/frey-ui/README.md).
- For the current recommended next components, see [`docs/component-priorities.md`](./docs/component-priorities.md).
- For the latest implemented component APIs and usage, see Storybook.

## Storybook

- Local: `pnpm storybook`
- Hosted: [BlizzardBlast.github.io/frey-ui](https://BlizzardBlast.github.io/frey-ui)

## Release Workflow

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

## License

[MIT](./LICENSE)
