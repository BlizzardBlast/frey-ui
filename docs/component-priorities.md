# Component Priorities

Last reviewed: 2026-07-16

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

## Date Components

The staged date-components roadmap is complete and should no longer be treated
as the next component opportunity.

What is now covered:

1. Internal timezone-free calendar engine and public `DateField`, including
   Storybook and real-browser keyboard/form coverage.
2. Public `Calendar` with a fixed localized grid, complete keyboard navigation,
   constraints, theme tokens, Storybook coverage, and real-browser proof.
3. Public `DatePicker` composed from the shared `DateField`, `Calendar`, and
   existing `Popover`, with unified ISO state, focus return, form submission,
   localized trigger copy, stories, and overlay browser coverage.

The date roadmap adds no new runtime dependency. Public/form values remain
strict `YYYY-MM-DD` strings. The display layer covers Gregorian, Buddhist,
Japanese, ROC, Persian, Islamic Civil, and Hebrew calendars across ISO years
0001-9999.

Release-owner maintenance checks remain:

- Validate Calendar month announcements, day names, and disabled-date feedback
  with VoiceOver and Safari before publishing. Automated axe and Chromium
  coverage cannot substitute for that platform-specific screen-reader pass.
- Refresh checked-in week-start data when regional conventions change.
- Add new official Japanese era boundaries before an announced era begins;
  the latest known era otherwise extends provisionally.

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

1. `FileUpload` or `Dropzone`
2. `EmptyState`

## Recommendation

If only one component sequence should happen next, build `FileUpload` or
`Dropzone`. Start with shared file-validation and drag-state utilities, then
compose them with the existing `Field`, `Alert`, `Progress`, and `Toast`
surfaces.
