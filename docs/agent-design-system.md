# AI coding-agent design-system context

This is a **navigation guide**, not a second design system. Use it to find
the real code and Storybook contracts before changing UI.

## Source map

| Need | Authoritative source |
| --- | --- |
| Public components and exported types | `packages/frey-ui/src/index.ts` |
| Actual props, defaults and behavior | `packages/frey-ui/src/<Component>/index.tsx` |
| Component docs and interaction examples | `apps/storybook/src/stories/<Component>/*.stories.tsx` |
| Form, overlay, and feedback compositions | `apps/storybook/src/stories/Patterns/UsagePatterns.stories.tsx` |
| Light/dark/high-contrast CSS tokens | `packages/frey-ui/src/theme.css` |
| Typed semantic color, radius and spacing props | `packages/frey-ui/src/Box/index.tsx` |
| Theme provider and mode behavior | `packages/frey-ui/src/ThemeProvider/index.tsx` |
| Storybook API documentation coverage checker | `scripts/check-storybook-api-coverage.mjs` |

Read the relevant subset of files. Storybook MCP can navigate the same
information if connected, but is not a requirement to inspect local code.

## Theme and tokens

Import `frey-ui/theme.css` once in the consuming application and wrap UI in
`ThemeProvider`. Its `theme` values are `light`, `dark` and `system`;
`highContrast` is also supported.

Prefer semantic variables such as `--frey-color-surface`,
`--frey-color-text-primary`, `--frey-color-text-muted`,
`--frey-color-primary`, `--frey-color-border`, and
`--frey-color-focus-ring` over raw palette values in product UI.
Palette values belong in theme definitions and deliberate brand overrides.

`Box` accepts `bg`, `color`, `borderColor`, `radius` and spacing tokens.
Use its actual `ColorToken`, `RadiusToken` and `SpaceToken` unions rather
than passing CSS variable names or invented token strings as typed props.
Do not forbid justified layout-specific CSS or isolated test fixtures.

## Component API discovery without a duplicate catalog

The code and Storybook already document props and variants. A second hand-written
API table would become stale as components evolve, so **look up contracts when
needed** instead of copying lists of supported values into this guide:

- For action buttons and links, read `packages/frey-ui/src/Button/index.tsx`
  and the matching `Button.stories.tsx`. Verify the public import and any
  polymorphic behavior before using it.
- For labeled inputs and validation, inspect `TextInput/index.tsx` and
  `Field/index.tsx`. `TextInput` already composes `Field`; use the
  `Field` render API only for custom controls requiring explicit associations.
- For selection and grouped content, read the matching source and stories for
  `Switch`, `Card`, and related components instead of inferring a variant
  or nesting contract from another library.
- For complex flows, inspect `Patterns/Usage Patterns` stories in addition
  to individual components to verify state handling and composition.

When adding or changing an API, update source, exported types, relevant stories
and tests in the same PR. This file needs changing **only if the authoritative
source locations or lookup workflow change**, not every time a prop changes.

## Composition, accessibility, verification

- Use the existing `Patterns/Usage Patterns` stories for forms, async
  feedback and overlays. Reuse accessible primitives rather than building
  clickable `div` controls.
- Use a clear primary action and the `destructive` variant for destructive
  commands. Do not use a success/error informational tone as an action variant.
- Review labels, focus, keyboard access, pending/error/empty states and
  responsive behavior independently. Component reuse alone does not prove
  the composed screen is accessible.
- When a required token, prop, or component is genuinely absent, report
  the gap and change the library explicitly instead of guessing.

Run `pnpm docs:check` and the appropriate typecheck, lint, unit/Storybook
and browser checks locally. The existing docs checker verifies Storybook
coverage; it does **not** validate every token, visual rule or accessibility
outcome. Keep commits batched and avoid new CI workflows for documentation.

Reference: https://blog.logrocket.com/teach-ai-assistants-design-system
