# Frey UI

A strict, accessible design system library for internal applications.

## Browser Support

Frey UI targets **ES2016+** and supports modern evergreen browsers:

- Chrome / Edge 80+
- Firefox 78+
- Safari 14+

## Accessibility

Frey UI is built with **WCAG 2.1 AA** compliance as a goal:

- Interactive components use semantic HTML (`button`, `input`, `label`)
- Non-native interactive elements receive keyboard/focus affordances automatically
- Form controls support accessible labels, helper text, and error messaging
- Focus-visible styles are provided across interactive components

Automated checks run through [`jest-axe`](https://github.com/nickcolley/jest-axe) in unit tests and [`@storybook/addon-a11y`](https://storybook.js.org/addons/@storybook/addon-a11y) in Storybook.

### Test Environment Notes

Unit tests run in JSDOM, which does not provide a full layout engine. Positioning assertions for portal overlays may require mocked geometry APIs (`getBoundingClientRect`, viewport size), and focus-trap behavior is validated at a best-effort level in unit tests.

Browser E2E coverage is available via Playwright in `apps/playwright` for real-world overlay focus and positioning checks, and can be expanded as overlay scenarios grow.

### Overlay Focus Management

- `Dialog` uses the native `<dialog>` element and modal behavior.
- `Popover` and `DropdownMenu` use `FloatingFocusManager` in modal mode.
- When a `Popover` or `DropdownMenu` is open, keyboard focus is trapped inside the overlay and focus returns to the trigger when it closes.

## Installation

```bash
pnpm add frey-ui
# OR
npm install frey-ui
```

## Setup

Import the stylesheet once in your app root (for example `App.tsx` or `layout.tsx`):

```tsx
import 'frey-ui/theme.css';
```

## Public Subpath Imports

Frey UI supports component-level JavaScript subpath imports only.

```tsx
import Button from 'frey-ui/Button';
import Tooltip from 'frey-ui/Tooltip';
```

Non-component subpaths such as `frey-ui/hooks/*` and `frey-ui/utils/*` are internal and not part of the public API contract.

## Basic Usage

```tsx
import { Button, ThemeProvider } from 'frey-ui';

function App() {
  return (
    <ThemeProvider theme='light'>
      <Button>Save changes</Button>
    </ThemeProvider>
  );
}
```

## Drawer Quick Example

```tsx
import { Button, Drawer } from 'frey-ui';

function SettingsDrawer() {
  return (
    <Drawer placement='right'>
      <Drawer.Trigger asChild>
        <Button>Open settings</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Workspace settings</Drawer.Title>
          <Drawer.Description>
            Update project-level preferences.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>Drawer content goes here.</Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
```

## Component API Docs

Storybook is the source of truth for component API docs and usage examples.

- Hosted docs: [BlizzardBlast.github.io/frey-ui](https://BlizzardBlast.github.io/frey-ui)
- Local docs:

```bash
pnpm install
pnpm storybook
```

## Brand Token Generator

Frey UI includes a contributor CLI utility to generate CSS variable overrides from a small set of brand colors.

```bash
pnpm theme:tokens -- --primary "#0f62fe"
```

You can optionally override additional semantic colors:

```bash
pnpm theme:tokens -- --primary "#0f62fe" --success "#198038" --warning "#f1c21b" --error "#da1e28" --info "#0043ce" > brand-theme.css
```

Then load the generated CSS after `frey-ui/theme.css` in your application so your brand tokens override defaults.

## Roadmap Notes

- Additional upcoming components are tracked through repository roadmap/issues and Storybook coverage.
- Accordion content animation: current grid-based animation uses `overflow: hidden` on the inner content wrapper, which can clip inner tooltips and extended focus rings. Prefer external tooltip portals and avoid relying on overflow-visible descendants inside accordion content.

## License

[MIT](./LICENSE)
