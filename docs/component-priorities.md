# Component Priorities

Last reviewed: 2026-07-15

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

`Accordion` has been remade and should no longer be treated as the next
component opportunity.

What is now covered:

- The existing public compound API and selection behavior are unchanged.
- The 200 ms height animation remains, with clipping limited to the active
  opening or closing transition.
- Settled expanded panels allow nested focus rings and non-portaled overlays
  to extend beyond their content boundary.

### `SegmentedControl`

`SegmentedControl` has been implemented and should no longer be treated as the
next component opportunity.

What is now covered:

- Compound `SegmentedControl` and `SegmentedControl.Item` API.
- Native radio semantics with controlled and uncontrolled selection, form
  participation, arrow-key navigation, and disabled items.
- Small, medium, and large sizes with visible selected, invalid, and focus
  states.
- Storybook scenarios, unit coverage, and browser-level keyboard coverage.

## Recommended Next New Component

### `DatePicker`

`DatePicker` is now the strongest next **new** component to build.

- Strong practical value.
- Significantly more surface area: calendar math, localization, keyboard
  support, and overlay behavior.
- Better as a deliberate follow-up after `SegmentedControl` unless date input
  is currently blocking product work.

## Other Good Ideas

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

1. `DatePicker`
2. `FileUpload` or `Dropzone`
3. `EmptyState`

## Recommendation

If only one thing should happen next, build `DatePicker`.

If you want the next net-new component and can absorb its calendar,
localization, and overlay complexity, build `DatePicker`.
