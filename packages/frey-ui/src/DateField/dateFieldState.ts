import type { CSSProperties } from 'react';
import {
  fromCalendarDate,
  getCalendarDate,
  parseDateValue,
  serializeDateValue,
} from '../date/dateEngine';
import {
  formatLocalizedNumber,
  normalizeLocalizedDigits,
} from '../date/dateLocale';
import type {
  CalendarEraOption,
  DateSegmentLayoutPart,
} from '../date/dateLocale';
import type {
  CalendarDate,
  DateCalendar,
  DateSegment,
  DateValue,
} from '../date/types';

type SegmentValues = Record<DateSegment, string>;

const SEGMENT_MIN_WIDTH: Readonly<Record<DateSegment, number>> = {
  era: 8,
  year: 4,
  month: 2,
  day: 2,
};

export type DateDraft = Readonly<{
  sourceKey: string;
  sourceValue: DateValue | null;
  eraId: string;
  values: SegmentValues;
  activeSegment: DateSegment;
  eraTypeahead: string;
}>;

export type DateDraftAction =
  | Readonly<{ type: 'replace'; draft: DateDraft }>
  | Readonly<{ type: 'set-active'; segment: DateSegment }>
  | Readonly<{ type: 'set-segment'; segment: DateSegment; value: string }>;

export const TEMPLATE_VALUE = '2024-11-22';

export function draftReducer(
  state: DateDraft,
  action: DateDraftAction
): DateDraft {
  switch (action.type) {
    case 'replace':
      return action.draft;
    case 'set-active':
      return { ...state, activeSegment: action.segment };
    case 'set-segment':
      return {
        ...state,
        values: { ...state.values, [action.segment]: action.value },
      };
  }
}

export function getSourceKey(
  value: DateValue | null,
  calendar: DateCalendar,
  locale: string
): string {
  return `${value ?? ''}|${calendar}|${locale}`;
}

function createEmptyValues(): SegmentValues {
  return { era: '', year: '', month: '', day: '' };
}

export function createDraft(
  value: DateValue | null,
  calendar: DateCalendar,
  locale: string,
  layout: DateSegmentLayoutPart[],
  eraOptions: CalendarEraOption[]
): DateDraft {
  const firstSegment =
    layout.find((part) => part.kind === 'segment')?.type ?? 'month';
  const templateCalendarDate = getCalendarDate(
    parseDateValue(TEMPLATE_VALUE),
    calendar
  );
  const templateEraLabel =
    eraOptions.find((option) => option.id === templateCalendarDate.era)?.label ??
    '';

  if (value === null) {
    const values = createEmptyValues();
    values.era = templateEraLabel;
    return {
      sourceKey: getSourceKey(value, calendar, locale),
      sourceValue: value,
      eraId: templateCalendarDate.era,
      values,
      activeSegment: firstSegment,
      eraTypeahead: '',
    };
  }

  const calendarDate = getCalendarDate(parseDateValue(value), calendar);
  const values = createEmptyValues();
  values.era =
    eraOptions.find((option) => option.id === calendarDate.era)?.label ?? '';
  values.year = formatLocalizedNumber(calendarDate.year, locale);
  values.month = formatLocalizedNumber(calendarDate.month, locale);
  values.day = formatLocalizedNumber(calendarDate.day, locale);

  return {
    sourceKey: getSourceKey(value, calendar, locale),
    sourceValue: value,
    eraId: calendarDate.era,
    values,
    activeSegment: firstSegment,
    eraTypeahead: '',
  };
}

export function areValuesEqual(
  left: SegmentValues,
  right: SegmentValues
): boolean {
  return (Object.keys(left) as DateSegment[]).every(
    (segment) => left[segment] === right[segment]
  );
}

function isDraftEmpty(draft: DateDraft): boolean {
  return [draft.values.year, draft.values.month, draft.values.day].every(
    (value) => value.length === 0
  );
}

function createCalendarDateFromDraft(
  draft: DateDraft,
  locale: string
): CalendarDate | null {
  const normalized = {
    era: draft.eraId,
    year: normalizeLocalizedDigits(draft.values.year, locale),
    month: normalizeLocalizedDigits(draft.values.month, locale),
    day: normalizeLocalizedDigits(draft.values.day, locale),
  };
  if (!normalized.year || !normalized.month || !normalized.day) return null;

  const year = Number(normalized.year.replace('−', '-'));
  const month = Number(normalized.month);
  const day = Number(normalized.day);
  if (![year, month, day].every(Number.isInteger)) return null;

  return {
    era: normalized.era,
    year,
    month,
    monthCode: `M${String(month).padStart(2, '0')}`,
    day,
    monthsInYear: 12,
    daysInMonth: 31,
    relatedYear: 1,
    relatedMonth: 1,
    relatedDay: 1,
  };
}

export function getDraftValue(
  draft: DateDraft,
  locale: string,
  calendar: DateCalendar
): DateValue | null | undefined {
  if (isDraftEmpty(draft)) return null;
  if (
    ['japanese', 'roc', 'persian', 'islamic-civil'].includes(calendar) &&
    draft.values.era.length === 0
  ) {
    return undefined;
  }
  const calendarDate = createCalendarDateFromDraft(draft, locale);
  if (!calendarDate) return undefined;

  try {
    return serializeDateValue(fromCalendarDate(calendarDate, calendar));
  } catch {
    return undefined;
  }
}

export function getSegmentWidth(
  segment: DateSegment,
  value: string
): CSSProperties {
  return { width: `${Math.max(value.length, SEGMENT_MIN_WIDTH[segment])}ch` };
}
