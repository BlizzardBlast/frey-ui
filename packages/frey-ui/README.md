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

## Installation

```bash
pnpm add frey-ui
# OR
npm install frey-ui
```

## Setup

Import the stylesheet once in your app root (for example `App.tsx` or `layout.tsx`):

```tsx
import 'frey-ui/style.css';
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

## Component API Docs

Storybook is the source of truth for component API docs and usage examples.

- Hosted docs: [BlizzardBlast.github.io/frey-ui](https://BlizzardBlast.github.io/frey-ui)
- Local docs:

```bash
pnpm install
pnpm storybook
```

## License

[MIT](./LICENSE)
