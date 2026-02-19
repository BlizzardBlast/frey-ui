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

Frey UI currently exports:

- `Alert`
- `Button`
- `Checkbox`
- `Chip`
- `Field`
- `RadioGroup`
- `Select`
- `Skeleton`
- `Switch`
- `Textarea`
- `TextInput`
- `ThemeProvider`

### `Field`

Shared form field wrapper for labels, helper text, and error messaging.

- `label` (`string`, required): field label text.
- `hideLabel` (`boolean`, default `false`): visually hide label while keeping it accessible.
- `error` (`string`): error text rendered with `role='alert'`.
- `helperText` (`string`): helper text shown below control content.
- `required` (`boolean`, default `false`): shows required indicator.
- `disabled` (`boolean`, default `false`): applies disabled label styling.
- `children` (`(props: FieldRenderProps) => ReactNode`, required): render function with generated ids + validation state.
- `className` (`string`): additional CSS class.
- `style` (`CSSProperties`): inline style / CSS variable overrides.

### `RadioGroup`

Accessible grouped radios with controlled and uncontrolled support.

- `label` (`string`, required): group label text.
- `options` (`ReadonlyArray<RadioOption>`, required): radio options.
- `value` (`string`): controlled selected value.
- `defaultValue` (`string`): initial value for uncontrolled usage.
- `onChange` (`ChangeEventHandler<HTMLInputElement>`): native change handler.
- `orientation` (`'vertical' | 'horizontal'`, default `'vertical'`): options layout direction.
- `error` (`string`): error text for validation state.
- `helperText` (`string`): helper text below group.
- `disabled` (`boolean`, default `false`): disables all options.

### `Select`

Accessible native `<select>` with helper/error messages and size variants.

- `label` (`string`, required): accessible label text.
- `placeholder` (`string`): placeholder option for single-select usage.
- `size` (`'sm' | 'md' | 'lg'`, default `'md'`): visual size variant.
- `error` (`string`): error text and invalid state.
- `helperText` (`string`): helper text below control.
- `children` (`ReactNode`): `<option>` / `<optgroup>` content.
- `disabled` (`boolean`, default `false`): disables the control.

### `Textarea`

Accessible multiline text input with helper/error messaging.

- `label` (`string`, required): accessible label text.
- `resize` (`'none' | 'vertical' | 'horizontal' | 'both'`, default `'vertical'`): resize behavior.
- `error` (`string`): error text and invalid state.
- `helperText` (`string`): helper text below control.
- `disabled` (`boolean`, default `false`): disables the textarea.
- `className` (`string`): additional CSS class.
- `style` (`CSSProperties`): inline style / CSS variable overrides.

### `Alert`

Inline status and feedback messaging.

| Prop        | Type                                           | Default  | Description                                      |
| ----------- | ---------------------------------------------- | -------- | ------------------------------------------------ |
| `variant`   | `'error' \| 'success' \| 'warning' \| 'info'`  | `'info'` | Visual style and live-region semantics.          |
| `title`     | `string`                                       | —        | Optional short heading rendered above the body.  |
| `children`  | `ReactNode`                                    | —        | **Required.** Main alert message content.        |
| `className` | `string`                                       | —        | Additional CSS class.                            |
| `style`     | `CSSProperties`                                | —        | Inline styles / CSS variable overrides.          |

### `Button`

Polymorphic action control with loading and disabled states.

| Prop        | Type                                                   | Default     | Description                                                                             |
| ----------- | ------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------- |
| `as`        | `'button' \| 'a'`                                      | `'button'`  | HTML element to render.                                                                 |
| `variant`   | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` | `'primary'` | Visual style variant.                                                                   |
| `size`      | `'sm' \| 'md' \| 'lg'`                                 | `'md'`      | Size variant.                                                                           |
| `loading`   | `boolean`                                              | `false`     | Shows spinner and marks element as busy.                                                |
| `disabled`  | `boolean`                                              | `false`     | Disables native buttons; for anchors sets `aria-disabled`.                              |
| `className` | `string`                                               | —           | Additional CSS class.                                                                   |
| `style`     | `CSSProperties`                                        | —           | Inline styles / CSS variable overrides.                                                 |
| `ref`       | `Ref<HTMLButtonElement \| HTMLAnchorElement>`          | —           | Forwarded ref to the underlying element.                                                |

Component-specific native attributes are supported based on `as` (`button` or `a`).

### `Checkbox`

Accessible checkbox with optional indeterminate state.

| Prop            | Type                                   | Default | Description                                                     |
| --------------- | -------------------------------------- | ------- | --------------------------------------------------------------- |
| `label`         | `string`                               | —       | **Required.** Accessible label text.                            |
| `hideLabel`     | `boolean`                              | `false` | Visually hide the label (remains accessible to screen readers). |
| `size`          | `'sm' \| 'md' \| 'lg'`                 | `'md'`  | Size variant.                                                   |
| `indeterminate` | `boolean`                              | `false` | Shows mixed state and sets `aria-checked="mixed"`.              |
| `disabled`      | `boolean`                              | `false` | Disables the checkbox.                                          |
| `className`     | `string`                               | —       | Additional CSS class.                                           |
| `style`         | `CSSProperties`                        | —       | Inline styles / CSS variable overrides.                         |
| `ref`           | `Ref<HTMLInputElement>`                | —       | Forwarded ref to the native input.                              |

All standard `<input>` attributes (except `type`, `size`) are also supported and spread onto the underlying element.

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

### `Skeleton`

Loading placeholder for pending UI states.

| Prop        | Type                            | Default       | Description                                             |
| ----------- | ------------------------------- | ------------- | ------------------------------------------------------- |
| `width`     | `string \| number`              | —             | Placeholder width (for circles, can infer from height). |
| `height`    | `string \| number`              | —             | Placeholder height (for circles, can infer from width). |
| `shape`     | `'rectangle' \| 'circle'`       | `'rectangle'` | Skeleton shape.                                         |
| `className` | `string`                        | —             | Additional CSS class.                                   |
| `style`     | `CSSProperties`                 | —             | Inline styles / CSS variable overrides.                 |

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

### `TextInput`

Accessible text field with helper and error messaging.

| Prop         | Type                                                                    | Default  | Description                                                     |
| ------------ | ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `label`      | `string`                                                                | —        | **Required.** Accessible label text.                            |
| `hideLabel`  | `boolean`                                                               | `false`  | Visually hide the label (remains accessible to screen readers). |
| `type`       | `'text' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'url'`         | `'text'` | Input type.                                                     |
| `error`      | `string`                                                                | —        | Error message text; sets `aria-invalid` and `role="alert"`.     |
| `helperText` | `string`                                                                | —        | Helper text shown below the input.                              |
| `disabled`   | `boolean`                                                               | `false`  | Disables the input.                                             |
| `className`  | `string`                                                                | —        | Additional CSS class.                                           |
| `style`      | `CSSProperties`                                                         | —        | Inline styles / CSS variable overrides.                         |
| `ref`        | `Ref<HTMLInputElement>`                                                 | —        | Forwarded ref to the native input.                              |

All standard `<input>` attributes (except `type`) are also supported and spread onto the underlying element.

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
pnpm install
pnpm storybook
```

## License

[MIT](./LICENSE)
