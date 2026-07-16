# DateField and Calendar Quality Refactor Plan

## Goal

Resolve the current CodeFactor and Sonar maintainability findings under
`packages/frey-ui/src/DateField/` and `packages/frey-ui/src/Calendar/` without
changing public APIs or observable behavior.

The refactor preserves DOM and ARIA contracts, keyboard interaction, form
values, locale behavior, calendar arithmetic, styling, and DatePicker
integration. It adds no dependencies and does not suppress quality rules.

## Internal architecture

Keep React state ownership in the existing components. Extract pure keyboard,
draft, paste, and stepping decisions into focused interaction modules, and keep
effects limited to DOM validity and focus synchronization. Do not replace the
components with large controller hooks.

### DateField interactions

`dateFieldInteractions.ts` owns:

- Physical LTR and RTL segment movement.
- Escape restoration, editable-only clearing, and calendar-aware stepping.
- ASCII and localized numeric input normalization.
- Era typeahead draft creation.
- Strict ISO and localized paste parsing.
- Resolution of a draft into `DateValue | null | undefined`, where
  `undefined` retains the draft locally without committing.

### Calendar interactions

`calendarInteractions.ts` maps supported keys to calendar focus movements or
activation. Calendar remains responsible for state transitions, selection,
focus requests, and rendering.

## Phase 1: lock interaction contracts

1. Add failing unit tests for DateField movement, restoration, clearing,
   stepping, ISO boundaries, era typeahead, localized digits, paste, and draft
   resolution.
2. Add failing unit tests for Calendar arrows, Home/End, Page Up/Down,
   Shift+Page navigation, activation, and unhandled keys.
3. Implement the pure interaction modules with small lookup tables and focused
   functions below the cognitive-complexity threshold of 15.
4. Keep the helpers disconnected from the production components until these
   contracts pass.

After the phase, run focused unit tests, package typecheck, and package lint.
Perform up to three P0-P3 self-review passes; fix all P0/P1 and practical P2
findings.

## Phase 2: refactor DateField

1. Replace nested prop-value normalization with a typed helper.
2. Route keyboard handling through the pure command resolver and a small
   executor while preserving the consumer callback and `defaultPrevented`
   contract.
3. Route input, era typeahead, stepping, draft commitment, and paste through
   the Phase 1 helpers.
4. Extract a module-scope `DateFieldSegments` renderer and switch-based segment
   ARIA metadata helper without changing DOM order, keys, refs, or callbacks.
5. Replace flagged regex and nested-ternary patterns with named helpers and
   complete lookup tables.

After the phase, run focused DateField and DatePicker tests, package typecheck,
and package lint. Perform the bounded P0-P3 self-review loop with special focus
on controlled reconciliation, partial drafts, unavailable dates, FormData,
localized input, refs, native validity, and DatePicker integration.

## Phase 3: refactor Calendar

1. Replace the fixed-month calendar array with a `ReadonlySet`.
2. Give every grid cell an immutable epoch-derived `gridKey`, including cells
   outside the supported ISO range.
3. Use grid keys for rows and cells; remove index-derived React keys.
4. Route keyboard handling through the pure command resolver while preserving
   the reducer, memoized grid model, focus refs, layout effect, native buttons,
   semantic table/grid, and focusable unavailable dates.

After the phase, run focused Calendar and DatePicker tests, Storybook tests and
typecheck, Playwright typecheck, and focused browser tests. Perform the bounded
P0-P3 self-review loop with special focus on ISO-boundary keys, focus
persistence, roving tab order, RTL movement, clamping, and activation guards.

## Phase 4: cumulative review and PR verification

1. Query changed Storybook stories and preview DateField, Calendar, and
   DatePicker.
2. Run the existing Storybook tests and focused browser scenarios when the live
   Storybook server does not expose `run-story-tests`.
3. Review the complete diff against `main`, map each original annotation to a
   concrete fix, and confirm that no function exceeds cognitive complexity 15.
4. Run the repository gate in this exact order:

   ```bash
   pnpm docs:check
   pnpm typecheck
   pnpm lint
   pnpm test:coverage
   pnpm test:e2e
   pnpm build
   ```

5. Commit as `refactor: simplify date component interactions`, push
   `codex/date-components`, and verify PR #86.

The final review permits no unresolved P0/P1 or undocumented P2 findings. It
must not silence or reconfigure CodeFactor or Sonar.

## Acceptance criteria

- All three CodeFactor complexity notices are removed.
- All selected Sonar findings under DateField and Calendar are removed.
- Public APIs and observable DateField, Calendar, and DatePicker behavior are
  unchanged.
- Keyboard, focus, ARIA, localized input, paste, partial drafts, FormData, and
  calendar navigation remain covered and green.
- Coverage remains at 100%.
- No dependency, lockfile, Changeset, theme-token, or component-priority change
  is introduced.
- Each phase completes its bounded iterative self-review before the next phase.
