# Component Priorities

Last reviewed: 2026-04-05

This note captures the strongest next component opportunities in the current
Frey UI library based on the exported component surface, Storybook coverage,
recent changelog history, and the package README roadmap notes.

## Recommended Next New Component

### `CommandPalette`

`CommandPalette` is the strongest next component to build.

Why it is the best fit now:

- Frey UI is positioned as a design system for internal applications, and a
  command palette is a high-leverage internal-app pattern for navigation,
  search, quick actions, and entity switching.
- The current library already has most of the primitives needed to implement it
  cleanly: `Dialog`, `Drawer`, `Combobox`, `Field`, `Badge`, `Spinner`,
  `Button`, `Card`, `Stack`, `Box`, and `ThemeProvider`.
- Recent work has already added the hardest building blocks. `Drawer` and
  `Combobox` landed recently, which makes this a good moment to turn those
  primitives into a more product-shaped component.
- It creates a strong Storybook and Playwright showcase for keyboard support,
  filtering, focus management, overlays, and accessible interaction patterns in
  one place.

Suggested v1 scope:

- `CommandPalette`
- `CommandPalette.Trigger`
- `CommandPalette.Content`
- `CommandPalette.Input`
- `CommandPalette.List`
- `CommandPalette.Group`
- `CommandPalette.Item`
- `CommandPalette.Empty`
- `CommandPalette.Shortcut`

Suggested v1 behaviors:

- Open from a trigger and support a controlled `open` state.
- Filter items by typed input.
- Support grouped items and empty states.
- Support disabled items.
- Support keyboard navigation with arrow keys and Enter.
- Restore focus to the trigger when closed.
- Close on Escape and outside press.

Suggested v1 non-goals:

- Async data fetching.
- Nested pages.
- Virtualized lists.
- Recent-items persistence.

Suggested Storybook stories:

- Basic command palette.
- Grouped actions.
- Empty results state.
- Disabled items.
- Controlled open state.
- Search-driven workspace switcher.

Suggested tests:

- Unit tests for filtering, keyboard navigation, disabled items, and focus
  return.
- Playwright coverage for open/close behavior, arrow-key traversal, Enter
  selection, and Escape dismissal.

Implementation note:

- Prefer composing on top of the existing overlay and input primitives instead
  of creating a brand-new overlay stack. That keeps behavior aligned with the
  rest of the library and reuses coverage you already have.

## Best Remake Candidate

### `Accordion`

If the goal is to remake an existing component instead of adding a new one,
`Accordion` is the clearest candidate.

Why it stands out:

- The package README already documents a known limitation: the current
  grid-based animation uses `overflow: hidden`, which can clip tooltips and
  extended focus rings inside accordion content.
- That limitation affects composition quality, which matters in a design system.
- Fixing it would improve confidence in nested interactive content instead of
  only adding a new API surface area.

Remake direction:

- Replace the current clipping-heavy content animation with an approach that is
  safer for focus outlines and nested overlays.
- Keep the current public API if possible so the change is mostly an internal
  implementation upgrade.
- Add tests for focus behavior and nested interactive content inside expanded
  panels.

## Other Good Ideas

### `SegmentedControl`

Best small-to-medium sized addition.

- High reuse in settings pages, filters, and dashboards.
- Can likely reuse patterns from `Tabs` and `RadioGroup`.
- Lower implementation risk than `DatePicker` or file upload.

### `DatePicker`

Best high-demand but higher-complexity form component.

- Strong practical value.
- Significantly more surface area: calendar math, localization, keyboard
  support, and overlay behavior.
- Better as a deliberate follow-up after `CommandPalette` unless date input is
  currently blocking product work.

### `FileUpload` or `Dropzone`

Best workflow-oriented form component.

- Useful for internal tools and admin flows.
- Pairs well with `Field`, `Alert`, `Progress`, and `Toast`.
- Requires more careful UX and browser edge-case handling than it first
  appears.

### `EmptyState`

Best lightweight product-polish addition.

- Very low risk and easy to adopt.
- Improves consistency in dashboards and CRUD views.
- Better as a supporting component after a higher-leverage interactive
  component.

## Priority Order

1. `CommandPalette`
2. `Accordion` remake
3. `SegmentedControl`
4. `DatePicker`
5. `FileUpload` or `Dropzone`
6. `EmptyState`

## Recommendation

If only one thing should happen next, build `CommandPalette`.

If you want the smallest useful component next, build `SegmentedControl`.

If you want to improve an existing component instead of expanding the library,
remake `Accordion`.
