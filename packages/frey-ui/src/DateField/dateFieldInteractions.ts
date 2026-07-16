import {
  addCalendarMonths,
  addCalendarYears,
  addIsoDays,
  isDateWithinConstraints,
  parseDateValue,
  serializeDateValue,
} from '../date/dateEngine';
import { normalizeLocalizedDigits } from '../date/dateLocale';
import type {
  CalendarEraOption,
  DateSegmentLayoutPart,
} from '../date/dateLocale';
import type {
  DateCalendar,
  DateSegment,
  DateValue,
  IsoDate,
} from '../date/types';
import {
  createDraft,
  draftReducer,
  getDraftValue,
  type DateDraft,
} from './dateFieldState';

export type DateFieldKeyCommand =
  | Readonly<{ type: 'move'; target: DateSegment }>
  | Readonly<{ type: 'restore' }>
  | Readonly<{ type: 'clear' }>
  | Readonly<{
      type: 'step';
      segment: DateSegment;
      amount: -1 | 1;
    }>;

type ResolveDateFieldKeyCommandOptions = Readonly<{
  key: string;
  segment: DateSegment;
  direction: 'ltr' | 'rtl';
  visibleSegments: readonly DateSegment[];
  editable: boolean;
}>;

const STEP_AMOUNTS: Readonly<Record<string, -1 | 1 | undefined>> = {
  ArrowUp: 1,
  ArrowDown: -1,
};

export function normalizeDateFieldValue<
  Value extends DateValue | null | undefined,
>(value: Value, propName: string): Value {
  if (value === undefined || value === null) return value;
  return serializeDateValue(parseDateValue(value, propName)) as Value;
}

function resolveMoveTarget({
  key,
  segment,
  direction,
  visibleSegments,
}: ResolveDateFieldKeyCommandOptions): DateSegment | undefined {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return undefined;
  const physicalDirection = key === 'ArrowRight' ? 1 : -1;
  const logicalDirection =
    direction === 'rtl' ? -physicalDirection : physicalDirection;
  const currentIndex = visibleSegments.indexOf(segment);
  return visibleSegments[currentIndex + logicalDirection] ?? segment;
}

export function resolveDateFieldKeyCommand(
  options: ResolveDateFieldKeyCommandOptions
): DateFieldKeyCommand | null {
  const moveTarget = resolveMoveTarget(options);
  if (moveTarget) return { type: 'move', target: moveTarget };
  if (options.key === 'Escape') return { type: 'restore' };
  if (!options.editable) return null;
  if (options.key === 'Backspace' || options.key === 'Delete') {
    return { type: 'clear' };
  }
  const amount = STEP_AMOUNTS[options.key];
  return amount === undefined
    ? null
    : { type: 'step', segment: options.segment, amount };
}

export type DateDraftEdit = Readonly<{
  draft: DateDraft;
  shouldApply: boolean;
}>;

type CreateDateDraftEditOptions = Readonly<{
  draft: DateDraft;
  segment: DateSegment;
  nextValue: string;
  locale: string;
  eraOptions: readonly CalendarEraOption[];
}>;

function normalizeNumericInput(
  value: string,
  segment: Exclude<DateSegment, 'era'>,
  locale: string
): string {
  const acceptedCharacter = segment === 'year' ? /^[\d-]$/ : /^\d$/;
  return Array.from(value)
    .filter((character) => {
      const normalizedCharacter = normalizeLocalizedDigits(
        character,
        locale
      ).replace('−', '-');
      return acceptedCharacter.test(normalizedCharacter);
    })
    .join('');
}

function createEraDraftEdit({
  draft,
  nextValue,
  locale,
  eraOptions,
}: CreateDateDraftEditOptions): DateDraftEdit {
  if (nextValue.length === 0) {
    return {
      draft: {
        ...draft,
        values: { ...draft.values, era: '' },
        eraTypeahead: '',
      },
      shouldApply: true,
    };
  }

  const appendedValue = nextValue.startsWith(draft.values.era)
    ? nextValue.slice(draft.values.era.length)
    : nextValue;
  const typeahead = `${draft.eraTypeahead}${appendedValue}`;
  const normalizedQuery = typeahead.trim().toLocaleLowerCase(locale);
  const matches = eraOptions.filter((option) =>
    option.label.toLocaleLowerCase(locale).startsWith(normalizedQuery)
  );
  const matchedEra = matches[0];

  return {
    draft: {
      ...draft,
      eraId: matchedEra?.id ?? draft.eraId,
      values: { ...draft.values, era: matchedEra?.label ?? nextValue },
      eraTypeahead: typeahead,
    },
    shouldApply: matches.length === 1,
  };
}

export function createDateDraftEdit(
  options: CreateDateDraftEditOptions
): DateDraftEdit {
  if (options.segment === 'era') return createEraDraftEdit(options);
  return {
    draft: draftReducer(options.draft, {
      type: 'set-segment',
      segment: options.segment,
      value: normalizeNumericInput(
        options.nextValue,
        options.segment,
        options.locale
      ),
    }),
    shouldApply: true,
  };
}

type StepDateDraftOptions = Readonly<{
  draft: DateDraft;
  segment: DateSegment;
  amount: -1 | 1;
  calendar: DateCalendar;
  locale: string;
  layout: DateSegmentLayoutPart[];
  eraOptions: readonly CalendarEraOption[];
}>;

function stepEraDraft({
  draft,
  amount,
  eraOptions,
}: StepDateDraftOptions): DateDraft | null {
  if (eraOptions.length === 0) return null;
  const currentIndex = eraOptions.findIndex(
    (option) => option.id === draft.eraId
  );
  const nextIndex =
    (currentIndex + amount + eraOptions.length) % eraOptions.length;
  const nextEra = eraOptions[nextIndex] as CalendarEraOption;
  return {
    ...draft,
    eraId: nextEra.id,
    values: { ...draft.values, era: nextEra.label },
    eraTypeahead: '',
  };
}

function stepCalendarDate(
  value: DateValue,
  segment: Exclude<DateSegment, 'era'>,
  amount: -1 | 1,
  calendar: DateCalendar
): DateValue {
  const date = parseDateValue(value);
  switch (segment) {
    case 'day':
      return serializeDateValue(addIsoDays(date, amount));
    case 'month':
      return serializeDateValue(addCalendarMonths(date, calendar, amount));
    case 'year':
      return serializeDateValue(addCalendarYears(date, calendar, amount));
  }
}

export function stepDateDraft(options: StepDateDraftOptions): DateDraft | null {
  if (options.segment === 'era') return stepEraDraft(options);
  const currentValue = getDraftValue(
    options.draft,
    options.locale,
    options.calendar
  );
  if (typeof currentValue !== 'string') return null;

  try {
    return createDraft(
      stepCalendarDate(
        currentValue,
        options.segment,
        options.amount,
        options.calendar
      ),
      options.calendar,
      options.locale,
      options.layout,
      [...options.eraOptions]
    );
  } catch {
    return null;
  }
}

type ResolveDateDraftValueOptions = Readonly<{
  draft: DateDraft;
  locale: string;
  calendar: DateCalendar;
  minDate?: IsoDate;
  maxDate?: IsoDate;
  isDateUnavailable?: (value: DateValue) => boolean;
}>;

export function resolveDateDraftValue({
  draft,
  locale,
  calendar,
  minDate,
  maxDate,
  isDateUnavailable,
}: ResolveDateDraftValueOptions): DateValue | null | undefined {
  const value = getDraftValue(draft, locale, calendar);
  if (typeof value !== 'string') return value;
  const selectable =
    isDateWithinConstraints(parseDateValue(value), minDate, maxDate) &&
    !isDateUnavailable?.(value);
  return selectable ? value : undefined;
}

type ParseDateFieldPasteOptions = Readonly<{
  text: string;
  draft: DateDraft;
  calendar: DateCalendar;
  locale: string;
  layout: DateSegmentLayoutPart[];
  eraOptions: readonly CalendarEraOption[];
}>;

const REGEXP_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

function escapeRegExp(value: string): string {
  return value.replace(REGEXP_SPECIAL_CHARACTERS, String.raw`\$&`);
}

function createLocalizedPastePattern(
  layout: readonly DateSegmentLayoutPart[]
): Readonly<{ expression: RegExp; capturedSegments: DateSegment[] }> {
  let pattern = '^';
  const capturedSegments: DateSegment[] = [];
  for (const part of layout) {
    if (part.kind === 'literal') {
      pattern += escapeRegExp(part.value);
      continue;
    }
    pattern += part.type === 'era' ? '(.+?)' : '([\\d−-]+)';
    capturedSegments.push(part.type);
  }
  return { expression: new RegExp(`${pattern}$`), capturedSegments };
}

function applyPasteCapture(
  draft: DateDraft,
  segment: DateSegment,
  capturedValue: string,
  locale: string,
  eraOptions: readonly CalendarEraOption[]
): DateDraft | null {
  if (segment !== 'era') {
    return draftReducer(draft, {
      type: 'set-segment',
      segment,
      value: capturedValue,
    });
  }
  const matchedEra = eraOptions.find(
    (option) =>
      option.label.localeCompare(capturedValue, locale, {
        sensitivity: 'base',
      }) === 0
  );
  return matchedEra
    ? {
        ...draft,
        eraId: matchedEra.id,
        values: { ...draft.values, era: matchedEra.label },
        eraTypeahead: '',
      }
    : null;
}

function parseLocalizedPaste({
  text,
  draft,
  locale,
  layout,
  eraOptions,
}: ParseDateFieldPasteOptions): DateDraft | null {
  const normalizedText = normalizeLocalizedDigits(text.trim(), locale);
  const { expression, capturedSegments } = createLocalizedPastePattern(layout);
  const match = expression.exec(normalizedText);
  if (!match) return null;

  let nextDraft = draft;
  for (const [index, segment] of capturedSegments.entries()) {
    const capturedValue = match[index + 1] as string;
    const capturedDraft = applyPasteCapture(
      nextDraft,
      segment,
      capturedValue,
      locale,
      eraOptions
    );
    if (!capturedDraft) return null;
    nextDraft = capturedDraft;
  }
  return nextDraft;
}

export function parseDateFieldPaste(
  options: ParseDateFieldPasteOptions
): DateDraft | null {
  try {
    const isoValue = serializeDateValue(
      parseDateValue(options.text, 'pasted value')
    );
    return createDraft(
      isoValue,
      options.calendar,
      options.locale,
      options.layout,
      [...options.eraOptions]
    );
  } catch {
    return parseLocalizedPaste(options);
  }
}
