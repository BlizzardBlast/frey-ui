# Frey UI

A strict, accessible design system library for internal applications.

## Browser Support

Frey UI targets **ES2016+** and supports all modern evergreen browsers:

- Chrome / Edge 80+
- Firefox 78+
- Safari 14+

## Accessibility

Frey UI is built with **WCAG 2.1 AA** compliance as a goal:

- All interactive components use semantic HTML (`button`, `input`, `label`).
- Non-native interactive elements receive `role`, `tabIndex`, and keyboard handlers automatically.
- Every form control requires a `label` prop; labels can be visually hidden with `hideLabel`.
- Focus is always visible (`:focus-visible` styles on every interactive component).
- Disabled states are functional, not just visual.

Automated accessibility checks run via [`jest-axe`](https://github.com/nickcolley/jest-axe) in unit tests and the [`@storybook/addon-a11y`](https://storybook.js.org/addons/@storybook/addon-a11y) panel in Storybook.

## Installation

```bash
pnpm add frey-ui
# OR
npm install frey-ui
```

## Setup

Import the stylesheet **once** in your app's root file (e.g. `App.tsx` or `layout.tsx`).
This file includes all component styles **and** the default theme variables — it is required.

```tsx
import 'frey-ui/style.css';
```

## Usage

```tsx
import { Chip, Switch, ThemeProvider } from 'frey-ui';

function App() {
  return (
    <ThemeProvider theme='light'>
      <Chip label='Status' variant='outlined' />
      <Switch label='Enable Dark Mode' />
    </ThemeProvider>
  );
}
```

## Components

### `Chip`

A polymorphic label / action component.

| Prop        | Type                                 | Default                                             | Description                                                              |
| ----------- | ------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------ |
| `label`     | `string`                             | —                                                   | **Required.** Text content of the chip.                                  |
| `variant`   | `'default' \| 'outlined'`            | `'default'`                                         | Visual style variant.                                                    |
| `as`        | `'button' \| 'div' \| 'span' \| 'a'` | `'span'` (or `'button'` when `onClick` is provided) | HTML element to render.                                                  |
| `onClick`   | `MouseEventHandler`                  | —                                                   | Click handler. When provided, the chip renders as a `button` by default. |
| `className` | `string`                             | —                                                   | Additional CSS class.                                                    |
| `style`     | `CSSProperties`                      | —                                                   | Inline styles / CSS variable overrides.                                  |
| `ref`       | `Ref`                                | —                                                   | Forwarded ref to the underlying element.                                 |

Non-native interactive chips (`as="div"` with `onClick`) automatically receive `role="button"`, `tabIndex={0}`, and keyboard support (Enter / Space).

### `Switch`

An accessible toggle switch built on a native `<input type="checkbox" role="switch">`.

| Prop             | Type                                   | Default | Description                                                     |
| ---------------- | -------------------------------------- | ------- | --------------------------------------------------------------- |
| `label`          | `string`                               | —       | **Required.** Accessible label text.                            |
| `hideLabel`      | `boolean`                              | `false` | Visually hide the label (remains accessible to screen readers). |
| `size`           | `'sm' \| 'md' \| 'lg'`                 | `'md'`  | Size variant.                                                   |
| `checked`        | `boolean`                              | —       | Controlled checked state.                                       |
| `defaultChecked` | `boolean`                              | —       | Initial checked state (uncontrolled).                           |
| `disabled`       | `boolean`                              | `false` | Disables the switch.                                            |
| `onChange`       | `ChangeEventHandler<HTMLInputElement>` | —       | Change handler.                                                 |
| `className`      | `string`                               | —       | Additional CSS class.                                           |
| `style`          | `CSSProperties`                        | —       | Inline styles / CSS variable overrides.                         |
| `ref`            | `Ref<HTMLInputElement>`                | —       | Forwarded ref to the native input.                              |

All standard `<input>` attributes (except `type`, `size`) are also supported and spread onto the underlying element.

### `ThemeProvider`

Wraps children with theme CSS variables.

| Prop        | Type                | Default   | Description                  |
| ----------- | ------------------- | --------- | ---------------------------- |
| `children`  | `ReactNode`         | —         | **Required.** Child content. |
| `theme`     | `'light' \| 'dark'` | `'light'` | Active theme.                |
| `id`        | `string`            | —         | Container id.                |
| `className` | `string`            | —         | Additional CSS class.        |
| `style`     | `CSSProperties`     | —         | Inline styles.               |

## Theming

Override component visuals with CSS custom properties on any ancestor:

```css
.my-switch {
  --switch-track-active: #22c55e;
  --switch-track-inactive: #94a3b8;
  --switch-focus-ring: #22c55e;
}
```

## Storybook

Browse interactive component docs at the [hosted Storybook](https://BlizzardBlast.github.io/frey-ui) or run locally:

```bash
cd apps/storybook
pnpm install
pnpm storybook
```

## License

[MIT](./LICENSE)
