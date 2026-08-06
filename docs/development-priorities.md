# Development Priorities

Last reviewed: 2026-08-06

This document records the highest-value work for Frey UI across the whole
library, not only new components. It covers component development, maintenance,
accessibility, browser support, packaging, documentation, testing, and release
quality.

The order is a recommendation rather than a release commitment. Reassess it
after a major component lands, a production consumer reports a blocking need,
or the library changes its support policy.

## Current Recommendation

Do the next work in this order:

1. Consolidate the duplicate unit-test and coverage workflow.
2. Build `EmptyState` as the next small component.
3. Build a staged `DataTable` as the next major product-oriented component.
4. Add package-consumer contract tests for published root and subpath imports.
5. Expand critical browser tests from Chromium to Firefox and WebKit.
6. Improve adoption documentation and maintain a generated component-status
   inventory.

The immediate answer to "what should be made next?" is `EmptyState`. It is a
small, reusable completion of the existing component set. The next substantial
feature after that should be a deliberately scoped `DataTable`.

## Recently Completed

The previous component-focused roadmap is now substantially complete.

- `CommandPalette` is implemented with compound composition, filtering,
  keyboard navigation, grouped actions, disabled items, empty results, and
  focus return.
- `Accordion` has been remade so settled expanded content does not remain
  unnecessarily clipped.
- `SegmentedControl` is implemented with native radio semantics, controlled and
  uncontrolled selection, keyboard navigation, form participation, sizes, and
  validation states.
- The date roadmap is complete through `DateField`, `Calendar`, and
  `DatePicker`, using strict `YYYY-MM-DD` public values and shared date logic.
- `FileUpload` is implemented with dropzone and trigger composition, structured
  validation, file lists, removal, previews, controlled and uncontrolled state,
  drag states, and accessibility coverage.

These items should be maintained, but they are no longer candidates for the
next new feature.

## Priority 0: Remove Avoidable Maintenance Cost

### Consolidate CI coverage workflows

The repository currently runs library coverage in `.github/workflows/ci.yml`
and also has a separate push-only `.github/workflows/unit-test.yml`. This
creates duplicated installation and test work on pushes to `main`.

Recommended change:

- Keep coverage and JUnit upload in `ci.yml`.
- Delete `unit-test.yml` after confirming that branch protection does not still
  require its old check name.
- Keep one authoritative Codecov configuration for coverage and test results.
- Preserve the uploaded `lcov.info` and JUnit XML artifacts for debugging.

Definition of done:

- A pull request runs lint, type checking, tests, coverage, build, and required
  documentation checks once.
- A push to `main` does not repeat the same unit coverage job through another
  workflow.
- Required-check settings reference only workflows that still exist.

## Priority 1: Complete the Core Product Surface

### Next small component: `EmptyState`

`EmptyState` is the best next component because it fills a common gap across
internal applications without adding complex state management. It composes
naturally with `Table`, `Card`, `CommandPalette`, `FileUpload`, `Button`, and
layout primitives.

Suggested v1 API:

- `EmptyState`
- `EmptyState.Icon`
- `EmptyState.Title`
- `EmptyState.Description`
- `EmptyState.Actions`

Suggested behavior and design constraints:

- Support centered and compact layouts.
- Allow consumers to choose the title element without tying visual size to a
  fixed heading level.
- Do not apply `alert` or `status` semantics by default; most empty states are
  static content rather than live announcements.
- Support one or more actions without requiring them.
- Reuse existing spacing, typography, color, icon, and button tokens.
- Keep illustrations consumer-provided rather than adding an illustration
  runtime or asset system in v1.

Suggested stories:

- First-use state with a primary action.
- No search results with a clear-filters action.
- Empty table or collection.
- Compact empty state inside a card.
- Read-only empty state without actions.
- Long localized title and description.

Suggested tests:

- Semantic title rendering.
- Optional description and actions.
- Consumer-provided icon or illustration content.
- Custom class and style forwarding.
- Accessible action names and axe coverage.

### Next major component: staged `DataTable`

Frey UI already has the primitives needed for a higher-level internal-app table:
`Table`, `Checkbox`, `Pagination`, `Skeleton`, `EmptyState`, `DropdownMenu`,
`Button`, and form controls. A `DataTable` would turn those primitives into a
reusable workflow without forcing every consumer to rebuild sorting, selection,
and empty/loading states.

Do not start with a kitchen-sink grid. Deliver it in stages.

#### Stage 1: state-agnostic table composition

- Typed column definitions.
- Cell and header renderers.
- Stable row identifiers.
- Controlled sorting state and sortable headers.
- Loading and empty states.
- Row selection with controlled state.
- Pagination composition using the existing `Pagination` component.

#### Stage 2: common internal-tool interactions

- Column visibility.
- Row actions.
- Sticky header behavior.
- Density options.
- Selection summary and bulk-action area.
- Examples for server-driven sorting and pagination.

#### Explicit non-goals for the first release

- Built-in data fetching or caching.
- Virtualization.
- Spreadsheet-style editing.
- Column resizing or pinning.
- Grouping, pivoting, or tree data.
- A mandatory dependency on a third-party table engine.

Use real consumer requirements to decide whether those features belong in Frey
UI later or should remain application concerns.

## Priority 2: Harden the Published Package Contract

### Add package-consumer smoke tests

The release workflow builds and tests the monorepo, but it should also verify the
artifact exactly as an external consumer receives it.

Add a CI fixture that:

1. Runs `pnpm pack` for `packages/frey-ui`.
2. Installs the generated tarball into a minimal consumer project.
3. Type-checks and builds root imports such as `import { Button } from
   'frey-ui'`.
4. Type-checks and builds supported component subpath imports such as
   `import Button from 'frey-ui/Button'`.
5. Imports `frey-ui/theme.css`.
6. Verifies both ESM and CommonJS entry points where practical.
7. Confirms source maps point to usable source paths.

### Make public subpaths intentional

The package documentation says component subpaths are public while hooks,
utilities, and other internals are not part of the contract. The package uses a
wildcard subpath export, so add an automated contract check that proves only
intended imports resolve.

Preferred direction:

- Maintain or generate an explicit manifest of public component subpaths.
- Verify every documented subpath resolves to JavaScript and declarations.
- Verify selected internal paths fail to resolve.
- Fail CI when a public root export and its documented subpath drift apart.

This work should happen before the component count grows much further.

## Priority 3: Enforce Browser and Accessibility Claims

### Add Firefox and WebKit smoke projects

The package declares support for Chrome, Firefox, and Safari-era evergreen
browsers, while the current Playwright configuration runs only Chromium.

Add Firefox and WebKit projects for a focused smoke suite covering the highest
risk interactions:

- Dialog, Drawer, Popover, DropdownMenu, and CommandPalette focus behavior.
- DateField editing and DatePicker opening, selection, and focus return.
- FileUpload native input synchronization, drag/drop where supported, removal,
  and form behavior.
- Keyboard navigation for Accordion, Tabs, SegmentedControl, Combobox, and
  Calendar.

Keep the full Chromium suite if runtime is a concern, and run a smaller tagged
cross-browser suite for pull requests or scheduled verification.

### Preserve manual accessibility checks

Automated axe and Playwright checks do not replace assistive-technology testing.
Maintain a short release checklist for components with complex focus or
announcement behavior, especially:

- VoiceOver with Safari for Calendar and DatePicker announcements.
- VoiceOver with Safari for Dialog and non-native overlay focus return.
- Keyboard-only FileUpload behavior and error discovery.
- High-contrast and forced-colors behavior for selected, invalid, disabled, and
  focus-visible states.

Record the tested browser, operating system, assistive technology, component,
and result so the check is repeatable rather than anecdotal.

## Priority 4: Improve Adoption and Maintenance Visibility

### Generate a component-status inventory

Create one generated or validated source of truth containing, for every public
component:

- Public root export.
- Public subpath import.
- Storybook story presence.
- API documentation coverage.
- Unit-test presence.
- Browser-test presence where required.
- Accessibility review status.
- Stability status such as experimental, stable, or deprecated.

Use the inventory to drive documentation checks rather than maintaining another
manual list that becomes stale.

### Add task-oriented recipes

Storybook remains the API source of truth, but consumers also need short recipes
that combine components into realistic workflows.

Start with:

- Validated settings form.
- Search and filters toolbar.
- Table loading, empty, error, and populated states.
- Confirm-destructive-action flow.
- File attachment field with validation and preview.
- Date range or date-filter workflow using the existing date components.

Recipes should explain state ownership and accessibility decisions, not only
show styled screenshots.

## Later Component Candidates

Build these only after the priorities above or when a real consumer is blocked.

### `MultiSelect` or `TagInput`

A useful follow-up to `Combobox` for filtering and entity assignment. Define the
keyboard model, token removal behavior, overflow behavior, and form value
contract before implementation.

### `TreeView`

Useful for permissions, navigation, and nested data in internal applications.
It has meaningful keyboard and selection complexity, so it should receive real
browser coverage from the first release.

### `AppShell` and navigation primitives

Potentially valuable for consistent internal-app layouts, but keep routing,
authorization, and application state outside the library. Start with layout and
accessible navigation composition rather than a framework-specific shell.

## Maintenance Rules

Update this document when:

- A listed priority is completed or deliberately cancelled.
- A production consumer reports a blocking gap.
- Browser, React, Node.js, TypeScript, or accessibility support policies change.
- A new runtime dependency is proposed.
- The public package contract changes.

When adding a new priority, include the user problem, the smallest useful scope,
explicit non-goals, testing expectations, and a definition of done. Remove
completed implementation plans from the active priority list and summarize them
under recently completed work instead.
