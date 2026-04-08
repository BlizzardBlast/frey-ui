# Component Priorities

Last reviewed: 2026-04-08

This note captures the strongest next component opportunities in the current
Frey UI library based on the exported component surface, Storybook coverage,
recent changelog history, and the package README roadmap notes.

## Recently Implemented

### `CommandPalette`

`CommandPalette` has been implemented and should no longer be treated as the
next component to build.

What is now covered:

- Compound API surface: `CommandPalette`, `Trigger`, `Content`, `Input`,
  `List`, `Group`, `Item`, `Empty`, `Shortcut`.
- Expected v1 behavior: open/close handling, filtering, grouped items, empty
  states, disabled items, keyboard navigation, and focus return.
- Storybook scenarios and unit-test coverage for the core interaction paths.

### `Accordion` remake

The `Accordion` component has been remade and should no longer be treated as
the top remake candidate.

What changed:

- Replaced the clipping-heavy grid animation with a hybrid approach: the CSS
  grid `0fr → 1fr` animation is retained for smooth height reveal, but a
  `useLayoutEffect` + `transitionend` listener now switches the inner content
  from `overflow: hidden` to `overflow: visible` once the panel is fully open.
- When a panel starts closing, `overflow` is reset to `hidden` synchronously
  before the first paint so the collapse animation clips correctly.
- Focus rings and nested overlays (e.g. tooltips) inside expanded panels are
  no longer clipped.
- The public API is unchanged.
- New tests cover: tab navigation into open panels, tab skip over closed
  panels, overflow state after `transitionend`, overflow reset on close, and
  defensive edge cases (null inner element, unrelated transition events).

## Recommended Next New Component

### `SegmentedControl`

`SegmentedControl` is now the strongest next **new** component to build.

Why it is the best fit now:

- High reuse in settings pages, filters, and dashboards.
- Can likely reuse patterns from `Tabs` and `RadioGroup`.
- Lower implementation risk than `DatePicker` or file upload.

Suggested v1 scope:

- `SegmentedControl`
- `SegmentedControl.Item`

Suggested v1 behaviors:

- Controlled and uncontrolled value patterns.
- Keyboard navigation with arrow keys.
- Disabled item support.
- Clear selected/unselected and focus-visible states.

Suggested v1 non-goals:

- Multi-row overflow behavior.
- Icon-only variants.
- Async-loading options.

Suggested Storybook stories:

- Basic usage.
- Disabled items.
- Controlled selection.
- Settings/filter examples.

Suggested tests:

- Unit tests for selection behavior, keyboard navigation, and disabled items.
- A11y assertions for role/state semantics and focus visibility.

Implementation note:

- Prefer composing on top of existing `Tabs`/`RadioGroup` interaction patterns
  instead of introducing a one-off selection model.

## Best Remake Candidate

The `Accordion` remake is now complete (see Recently Implemented above). The
next strongest remake candidate is:

### `Select`

If the goal is to remake an existing component instead of adding a new one,
`Select` may benefit from alignment with the new `Combobox` patterns introduced
since it was first shipped.

## Other Good Ideas

### `SegmentedControl` status

Now promoted to the recommended next new component.

### `DatePicker`

Best high-demand but higher-complexity form component.

- Strong practical value.
- Significantly more surface area: calendar math, localization, keyboard
  support, and overlay behavior.
- Better as a deliberate follow-up after `SegmentedControl` unless date input
  is currently blocking product work.

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

1. `SegmentedControl`
2. `DatePicker`
3. `FileUpload` or `Dropzone`
4. `EmptyState`

## Recommendation

If only one thing should happen next, build `SegmentedControl`.

If you need a higher-demand form surface and can absorb complexity, build
`DatePicker`.
