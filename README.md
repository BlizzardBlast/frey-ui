# Frey UI Monorepo

This repository contains the Frey UI design system package and its Storybook app.

## Workspaces

- `packages/frey-ui`: published React component library (`frey-ui`)
- `apps/storybook`: local docs and development environment for components

## Requirements

- Node.js `22.15.1` (see `.nvmrc`)
- pnpm `10.30.0`

## Getting Started

```bash
pnpm install
```

## Common Commands

```bash
pnpm storybook        # run Storybook locally
pnpm build            # build all workspaces
pnpm test             # run tests across workspaces
pnpm lint             # lint all workspaces
pnpm typecheck        # type-check all workspaces
```

## Package Documentation

For install, usage, API, accessibility details, and theming docs, see:

- [`packages/frey-ui/README.md`](./packages/frey-ui/README.md)

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
