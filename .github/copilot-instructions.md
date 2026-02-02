# GitHub Copilot Instructions for frey-ui

Build a small, accessible React component library.

## Tech

- TypeScript (strict), React 18/19, CSS Modules, Rollup.
- Package manager: pnpm.
- Component dev/docs: Storybook in `apps/storybook/`.

## Non-negotiables

- Keep components small, reusable, and accessible by default.
- Prefer simple APIs and predictable defaults.
- Match repo style: single quotes, semicolons, 2-space indent.
- Don't add heavy dependencies (no UI frameworks, no CSS-in-JS).

## Component structure

- New components live in `src/ComponentName/`.
- Files:
  - `src/ComponentName/index.tsx`
  - `src/ComponentName/componentname.module.css` (lowercase)
- Re-export from `src/index.ts` (default export + prop/type exports).

## React + TypeScript patterns

- Use `type` for props (not `interface`).
- Component signature: `function ComponentName(props: Readonly<Props>) { ... }`.
- Destructure props and provide defaults for optional values.
- Always support `className?: string` and `style?: React.CSSProperties`.
- Use `clsx` for class composition.
- If an element needs an id: use `React.useId()` and allow `id?: string` override.

### Extending HTML element attributes

- For form controls (inputs, buttons, etc.), extend the appropriate HTML attributes type:
  ```ts
  export type SwitchProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'className' | 'style'
  > & {
    label: string;
    size?: SwitchSize;
    className?: string;
    style?: React.CSSProperties;
  };
  ```
- Omit attributes that conflict with component props (e.g., `type`, `size`) or that are handled separately (`className`, `style`).
- Spread remaining HTML attributes onto the underlying element: `{...inputProps}`.
- Use native event handler signatures (`onChange?: React.ChangeEventHandler<HTMLInputElement>`) instead of custom callbacks.

### Controlled vs uncontrolled (when applicable)

- Prefer supporting both:
  - Controlled: `value/checked` + `onChange`.
  - Uncontrolled: `defaultValue/defaultChecked`.
- Keep behavior aligned with native inputs.

### Optional interactivity

- If a handler is optional (e.g. `onClick?`), make the component non-interactive when absent.
- Disabled must be functional (use `disabled`), not just visual.

## CSS Modules conventions

- Use CSS Modules only (`*.module.css`), filenames lowercase.
- Class names are `snake_case` and scoped to the component.
- Prefer theming via CSS custom properties on the container; allow overrides via `style`.
- Always include:
  - `:focus-visible` styles for keyboard users.
  - True disabled styling + cursor.
  - Smooth, simple transitions.

## Accessibility

- Use semantic HTML first (`button`, `input`, `label`, etc.); add ARIA only when necessary.
- Form-like controls require a `label` prop.
- Support `hideLabel?: boolean` and a `.visually_hidden` class for visually hidden labels.
- Ensure keyboard operability and visible focus.

## Storybook (apps/storybook)

- Stories live in `apps/storybook/src/stories/ComponentName/`.
- Use `@storybook/react-vite` types (`Meta`, `StoryObj`).
- Story exports are `snake_case`.
- Prefer stories that show: default, variants/sizes, disabled, controlled usage, theming via CSS variables.

## Testing

- If you add tests, use the existing setup in `apps/storybook/` (Vitest + Testing Library).
- Focus on: renders label/text, keyboard/focus behavior, disabled behavior.

## Packaging

- Keep public exports stable (Rollup publishes CJS + ESM + types).
- Never import Storybook-only code into `src/`.
