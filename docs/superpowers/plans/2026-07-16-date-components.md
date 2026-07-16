# Dependency-Free Date Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` and
> `test-driven-development` to implement this plan phase by phase.

**Goal:** Ship public `DateField`, `Calendar`, and `DatePicker` components
without adding a runtime dependency.

**Architecture:** Keep `YYYY-MM-DD` as the only public and form value. A
timezone-free internal calendar engine owns parsing, conversion, arithmetic,
and grid generation. `DateField` and `Calendar` share those internals, and
`DatePicker` composes them with the existing `Field`, `Popover`, `Portal`,
`Button`, icon, controllable-state, ref, and ARIA utilities.

**Tech Stack:** React 18/19, TypeScript, CSS modules, built-in `Intl`, Vitest,
Testing Library, jest-axe, Storybook, and Playwright. No new dependencies.

## Global Constraints

- Public values are strict padded ISO dates from `0001-01-01` to
  `9999-12-31`; year zero is invalid.
- Supported display calendars are Gregorian, Buddhist, Japanese, ROC,
  Persian, Islamic Civil, and Hebrew.
- Date arithmetic never uses native `Date`; `Intl` and UTC-safe native dates
  are presentation-only.
- V1 is single-date and single-month only: no range, time, multiple selection,
  presets, or free-form natural-language parsing.
- Every phase uses red-green-refactor and ends with a P0-P3 self-review, fixes,
  and focused verification. Each phase has at most three review/fix passes.
- Each releasable milestone finishes with the repository gates in the exact
  order documented in `AGENTS.md`.

## Public Contracts

```ts
export type DateValue = string;

export type DateCalendar =
  | 'gregory'
  | 'buddhist'
  | 'japanese'
  | 'roc'
  | 'persian'
  | 'islamic-civil'
  | 'hebrew';

export type DateSegment = 'era' | 'year' | 'month' | 'day';
export type DateSegmentLabels = Partial<Record<DateSegment, string>>;

export type FirstDayOfWeek =
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat';
```

### `DateField`

```ts
export type DateFieldProps = {
  label: string;
  value?: DateValue | null;
  defaultValue?: DateValue | null;
  onValueChange?: (value: DateValue | null) => void;

  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (value: DateValue) => boolean;

  locale?: string;
  calendar?: DateCalendar;
  segmentLabels?: DateSegmentLabels;

  showClearButton?: boolean;
  clearButtonLabel?: string;

  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;

  className?: string;
  style?: React.CSSProperties;
  controlClassName?: string;
  controlStyle?: React.CSSProperties;
};
```

The forwarded ref targets the date-field control's `HTMLDivElement`.

### `Calendar`

```ts
export type CalendarProps = {
  label: string;
  value?: DateValue | null;
  defaultValue?: DateValue | null;
  onValueChange?: (value: DateValue | null) => void;
  defaultFocusedValue?: DateValue;
  today?: DateValue;

  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (value: DateValue) => boolean;

  locale?: string;
  calendar?: DateCalendar;
  firstDayOfWeek?: FirstDayOfWeek;

  previousMonthLabel?: string;
  nextMonthLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;

  className?: string;
  style?: React.CSSProperties;
};
```

The forwarded ref targets the outer `HTMLDivElement`.

### `DatePicker`

`DatePicker` exposes the complete DateField value, constraint, locale, form,
label, clear, and styling surface, plus:

```ts
export type DatePickerProps = {
  // DateField value, constraint, locale, field, and styling props.

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  defaultFocusedValue?: DateValue;
  today?: DateValue;
  firstDayOfWeek?: FirstDayOfWeek;

  calendarLabel?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  getCalendarButtonLabel?: (formattedValue: string | null) => string;
};
```

### Shared behavior contract

- `value={undefined}` is uncontrolled; `value={null}` is controlled and empty.
- Accept only strict padded `YYYY-MM-DD` values between years 0001 and 9999.
  Year 0000, impossible dates, malformed strings, and out-of-range values throw
  prop-specific `RangeError`s.
- `minValue > maxValue` throws. A controlled value outside consumer
  constraints remains visible and invalid rather than being coerced.
- Public, callback, and submitted values always remain ISO Gregorian strings,
  regardless of display calendar.
- `calendar` defaults to `gregory`. `locale` changes order, digits, names,
  separators, and direction but never silently changes the display calendar.
- The locale defaults through an SSR-safe external-store hook. The server
  snapshot is deterministic `en-US`; the client re-resolves the browser locale
  after hydration. SSR consumers should pass `locale` to avoid reformatting.
- `onValueChange` emits only a complete, valid, selectable ISO date or `null`.
  Partial and unavailable drafts remain local.
- Optional editable values show clear by default. Required, disabled, and
  read-only fields do not.
- English action and segment labels are overridable localization defaults.
- A hidden input submits the single ISO `name`/value. Segments are nameless.
- Incomplete and constraint-invalid drafts clear the hidden form value and set
  native validity on the first segment, preventing stale committed submission.
  Persistent visible validation copy remains consumer-owned through `error`.

## Reuse and Visibility Decisions

| Unit | Visibility | Decision |
| --- | --- | --- |
| `DateField` | Public | Locale-aware segmented entry with ISO value and form participation. |
| `Calendar` | Public | Standalone single-month, single-date calendar. |
| `DatePicker` | Public | Composition of DateField, Calendar, and Popover. |
| Calendar engine | Internal | Parsing, epoch-day math, adapters, comparison, and constraints. |
| Locale formatter | Internal | Order, digits, literals, labels, direction, and accessible text. |
| Date draft reducer | Internal | Partial entry, typeahead, paste, reconciliation, and commit. |
| Calendar grid model | Internal | Fixed grid, focus, visible month, selection, and availability. |
| `Field` | Reuse | Label, messages, required state, IDs, and descriptions. |
| `Popover`/`Portal` | Reuse with seam | Position, dismissal, containment, theme propagation, and focus return. |
| `Button` | Selective reuse | Navigation, clear, and trigger; native buttons remain preferred for day cells. |
| Icons | Reuse and extend | Reuse Close and ChevronDown; add Calendar through `IconSvg`. |
| State/ARIA utilities | Reuse | `useControllableValue`, `computeAriaProps`, and `mergeRefs`. |

Trade-offs:

- Reusing Popover preserves the overlay contract and introduces no package,
  while DatePicker still follows the already-installed Floating UI path.
- Publishing DateField and Calendar creates compatibility obligations before
  DatePicker ships, but makes the foundations independently useful.
- The calendar engine remains internal to avoid promising a general-purpose
  public date-arithmetic API.
- All adapters are synchronous and bundled. This avoids loading states but
  requires explicit bundle review and compact checked-in data.

## Internal Calendar Engine Contract

Modules under `packages/frey-ui/src/date/` own:

- strict ISO parsing/serialization and proleptic Gregorian epoch-day math;
- immutable `IsoDate`, epoch-day, and internal calendar-part structures;
- adapters for ISO conversion, leap rules, month lengths/codes, era boundaries,
  and date arithmetic;
- Gregorian; Buddhist year offset; ROC before/after 1912; checked-in Japanese
  eras with proleptic pre-Taika years; Persian 2820-year arithmetic; Islamic
  Civil tabular 30-year arithmetic; and Hebrew Metonic/postponement rules;
- `Intl.NumberFormat` and `Intl.DateTimeFormat` presentation templates whose
  numeric values are replaced with adapter-owned results;
- checked-in week-start fallback data for browsers without week info;
- ASCII/localized digit parsing, localized segment order/literals, month and
  weekday names, era labels, direction, and accessible date text.

Native `Date` is forbidden for value arithmetic, comparison, and navigation.
It may only create UTC-safe formatting templates and obtain today's local ISO
parts. All arithmetic returns new immutable values.

## Milestone 1: Calendar Core and DateField

### Phase 1.1: Contract and calendar engine

1. Record this specification and convert `docs/component-priorities.md` to the
   Calendar engine/DateField, Calendar, DatePicker staged roadmap while keeping
   FileUpload/Dropzone and EmptyState after it.
2. Write failing tests for strict parsing, range endpoints, year-zero,
   impossible dates, leap centuries, full-range epoch-day round trips, adapter
   min/max and boundaries, Japanese eras, ROC 1911/1912, Persian Nowruz,
   Islamic 30-year cycles, Hebrew leap months/postponements, and deterministic
   samples spanning all 3.65 million ISO days.
3. Implement the engine and locale formatter without dependencies.
4. Prove identical output in UTC, Jakarta, Los Angeles, and Kiritimati.

Review P0-P3 for calendar correctness, off-by-one behavior, proleptic eras,
timezone leakage, invalid ranges, mutation, and adapter consistency. Fix P0/P1
and practical P2 findings, document accepted P2 trade-offs, rerun engine tests,
and cap the loop at three passes or two materially identical passes.

### Phase 1.2: Segmented DateField

1. Write failing tests for controlled/uncontrolled/controlled-null behavior,
   refs, Field linkage, messages and states, FormData, and clear behavior.
2. Build a shared segmented-input primitive and public wrapper.
3. Render one roving-tab-stop composite with native text inputs using
   `role="spinbutton"`, locale order/literals, full Field labeling, overridable
   segment labels, and accessibility-hidden separators.
4. Implement Tab entry/exit, direction-aware physical Left/Right movement,
   calendar-aware Up/Down adjustment with clamp/carry, Delete/Backspace clear,
   Escape restore, ASCII/localized digits, era cycling/typeahead, and strict ISO
   or own-localized-format paste.
5. Keep partial drafts local. Complete selectable drafts emit immediately;
   rejected controlled edits revert; external values supersede stale drafts
   without synchronization effects.
6. Submit one hidden ISO input and anchor native validity/focus on the first
   segment.

React constraints: use a reducer and functional transitions; derive parsing
and constraints during render; carry the draft source key to invalidate stale
state; use effects only for DOM validity/focus synchronization; define segment
components at module scope; memoize only formatter/adapter construction where
useful.

Review P0-P3 for draft loss, stale forms, controlled drift, focus order, RTL,
accessible names, render loops, and unnecessary effects. Use the standard
three-pass loop, then rerun DateField, axe, type, and timezone proof.

### Phase 1.3: Documentation and browser proof

1. Query Storybook component documentation and story instructions before
   authoring. If the MCP runner is unavailable, preserve that limitation and
   use repository conventions plus play/E2E fallback.
2. Add explicit arg metadata and stories for basic/controlled entry, partial
   typing/paste/clear, seven calendars, localized digits/RTL, constraints,
   unavailable dates, consumer error, required/disabled/read-only, and native
   FormData.
3. Add play functions for typing, localized paste, clear, callback emission,
   and invalid draft retention.
4. Add browser coverage for keyboard movement, focus visibility, form
   submission, and implicit browser locale resolution.
5. Mark DateField/engine complete, keep Calendar/DatePicker pending, and add a
   `frey-ui` minor plus Storybook/Playwright patch Changeset.

Review the cumulative milestone for API documentation accuracy, story and
accessibility coverage, and bundle impact. Apply the standard loop, then run
the complete repository gate.

## Milestone 2: Calendar

### Phase 2.1: Grid and navigation model

1. Write failing tests for six-row, seven-column grids in every calendar;
   locale/override week starts; adjacent cells; focused/selected/today/blocked
   metadata; all day/week/month/year movement; and Hebrew leap-year clamping.
2. Implement pure grid generation and the calendar-state reducer.
3. Resolve initial focus from selection, default focus, today, then nearest
   in-range date. Always render a fixed 6x7 adjacent-month grid.
4. Keep unavailable/out-of-range cells focusable with `aria-disabled`, while
   blocking activation.
5. Implement APG keyboard behavior: arrows by day/week, Home/End by localized
   week, Page Up/Down by calendar month, Shift+Page by year, Enter/Space select,
   one grid tab stop, and visual-direction horizontal movement in RTL.

Review completeness, boundaries, navigation, RTL, blocked focusability,
reducer transitions, and calendar-specific clamps; then rerun model tests.

### Phase 2.2: Public Calendar and visual system

1. Write failing public component tests before rendering implementation.
2. Render a live month/year heading, existing Button/Chevron navigation,
   localized weekday headers with full `abbr`, roving day buttons, selected
   semantics only on the selected cell, and disabled semantics on blocked cells.
3. Selection updates value only; overlay closing remains DatePicker-owned.
4. Add logical responsive styles with persistent focus, contrast-safe selected
   state, today ring, unavailable line-through without dim text, adjacent-month
   distinction, non-color indicators, 48px coarse targets, RTL, forced colors,
   and reduced motion.
5. Add selected background/text tokens to light, dark, high-contrast, and
   generated themes; update generator tests and axe coverage.

Review ARIA grid semantics, DOM order, focus persistence, color-independent
states, high contrast, pointer targets, and the 42-cell render cost.

### Phase 2.3: Documentation and browser proof

1. Add stories for selection/control, seven calendars, RTL/digits, constraints,
   protected states, themes, and ISO boundaries, with selection and full
   keyboard play functions.
2. Add browser proof for roving focus; Arrow/Home/End/Page/Shift+Page;
   activation blocking; RTL/localized headings; themes; and focus visibility.
3. Manually validate VoiceOver/Safari heading, cell, blocked-date, and month
   announcements when that environment is available; record limitations rather
   than substituting axe.
4. Mark Calendar complete, move DatePicker next, and add the second staged
   minor/patch Changeset.

Review the cumulative Calendar milestone, Storybook API coverage,
screen-reader findings, and bundle output, then run the six-command gate.

## Milestone 3: DatePicker

### Phase 3.1: Popover seam and shell

1. Add a tested, backward-compatible `initialFocusRef` option to
   `Popover.Content`; preserve existing default behavior and verify Popover,
   DropdownMenu, Tooltip, and focus return.
2. Write failing shell tests for controlled/uncontrolled open state, trigger
   ARIA, initial selected/current-day focus, close focus return, and protected
   opening behavior.
3. Compose shared DateField/Calendar internals under one Field with existing
   Popover/Portal and add CalendarIcon through `IconSvg`. Do not duplicate ISO,
   constraint, segment, or calendar logic.

Review compatibility, initial-focus races, refs, portal theming, focus return,
and duplicate state; rerun Popover and DatePicker shell tests.

### Phase 3.2: Complete behavior and stories

1. Connect typed and calendar selection to one ISO source of truth.
2. Calendar selection emits, closes, and restores trigger focus; Escape closes
   without mutation; Alt+Down opens from a segment; Alt+Up closes.
3. Resolve focus from selected, default, today, then nearest allowed date.
4. Default trigger names are `Choose date` and
   `Change date, {localized date}`, overridable through
   `getCalendarButtonLabel`.
5. Optional editable values show clear. Read-only can open for inspection but
   cannot type, clear, or select; disabled cannot open.
6. Add complete stories for selection/clear, controlled entry, constraints,
   errors/protected states, seven calendars, localized digits/week override,
   RTL, themes, and narrow viewports, plus play functions for all major paths.

Review cross-surface consistency, duplicate emissions, close/focus ordering,
read-only mutation paths, forms, propagation, story accuracy, and rerenders.

### Phase 3.3: Browser proof and release

1. Add click/keyboard open, dialog/grid, keyboard selection, ISO FormData and
   callback, Escape/outside focus return, clear, unavailable, read-only,
   Japanese/Persian/Hebrew/RTL smoke, and portal theme E2E.
2. Re-query and preview principal DateField, Calendar, DatePicker, icon, and
   theme stories. Retain preview URLs. Run MCP story tests if exposed;
   otherwise document play functions plus focused Playwright routes.
3. Mark all date components implemented, promote FileUpload/Dropzone, and keep
   maintenance notes for week data and future Japanese eras.
4. Add the final minor/patch Changeset.

Review the full milestone with no unresolved P0/P1 or undocumented P2. Stop on
repeated identical passes, rerun focused checks after each fix, and finish with
the complete gate.

## Required Final Gate Per Milestone

```bash
pnpm docs:check
pnpm typecheck
pnpm lint
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Focused development commands:

```bash
pnpm --filter frey-ui exec vitest run src/date src/DateField
pnpm --filter frey-ui exec vitest run src/date src/Calendar
pnpm --filter frey-ui exec vitest run src/DatePicker src/Popover src/Icons src/theme
pnpm --filter @frey-ui/storybook test
pnpm --filter @frey-ui/storybook typecheck
pnpm --filter @frey-ui/playwright typecheck
```

Run the date suites under `TZ=UTC`, `TZ=Asia/Jakarta`,
`TZ=America/Los_Angeles`, and `TZ=Pacific/Kiritimati`.

## Acceptance Criteria

- No dependency, catalog, or lockfile changes.
- Repository unit coverage stays at 100%.
- Every adapter round-trips valid values throughout the ISO range; values never
  vary by timezone, locale, or display calendar.
- DateField typing, paste, clear, control modes, partial drafts, and FormData
  obey the single ISO contract.
- Calendar keyboard behavior, roving focus, live headings, blocked dates, and
  RTL pass unit and real-browser proof.
- DatePicker typing/selection/clear, close/focus return, constraints, forms,
  and portal theming pass real-browser proof.
- DateField, Calendar, and DatePicker have complete Storybook documentation and
  explicit arg metadata.
- Light, dark, high-contrast, generated-theme, narrow, coarse-pointer, RTL, and
  reduced-motion states remain usable.
- Every phase finishes its own P0-P3 review before the next phase starts.

## Assumptions and Non-goals

- Delivery uses the approved three independently releasable milestones.
- V1 is single-date only: no ranges, time, multiple selection, presets,
  multi-month display, month/year dropdowns, or natural-language parsing.
- ISO remains the public/native form value for every display calendar.
- Gregorian is the default; other calendars require an explicit prop.
- The last known Japanese official era extends provisionally until a dataset
  update. Historical compatibility markers inherit CLDR's documented accuracy
  limitations.
- `locale` does not translate arbitrary action copy; consumers can override
  those English defaults.
- Consumer `error` owns persistent visible validation copy.
- Existing Popover/Floating UI reuse is allowed, but no new package or copied
  external component implementation is introduced.
