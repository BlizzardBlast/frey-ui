import { getCalendarDate, parseDateValue } from './dateEngine';
import { JAPANESE_ERAS } from './japaneseEraData';
import type {
  DateCalendar,
  DateSegment,
  FirstDayOfWeek,
  IsoDate,
} from './types';

export type DateSegmentLayoutPart =
  | Readonly<{
      kind: 'segment';
      type: DateSegment;
      value: string;
    }>
  | Readonly<{
      kind: 'literal';
      value: string;
    }>;

export type WeekdayLabel = Readonly<{
  short: string;
  long: string;
}>;

export type CalendarEraOption = Readonly<{
  id: string;
  label: string;
}>;

const WEEKDAY_ORDER: FirstDayOfWeek[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

const FRIDAY_FIRST_REGIONS = new Set(['MV']);
const SATURDAY_FIRST_REGIONS = new Set(
  'AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' ')
);
const SUNDAY_FIRST_REGIONS = new Set(
  'AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN IS JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'.split(
    ' '
  )
);

function toIntlCalendar(calendar: DateCalendar): string {
  return calendar;
}

export function resolveDateLocale(locale?: string): string {
  const requested =
    locale ??
    (typeof navigator === 'undefined' || navigator.language.length === 0
      ? 'en-US'
      : navigator.language);

  if (requested.length === 0) {
    throw new RangeError('locale must be a valid BCP 47 language tag.');
  }

  try {
    return Intl.getCanonicalLocales(requested)[0] as string;
  } catch {
    throw new RangeError('locale must be a valid BCP 47 language tag.');
  }
}

function getCalendarLocale(locale: string, calendar: DateCalendar): string {
  const options: Intl.LocaleOptions = {
    calendar: toIntlCalendar(calendar),
  };
  return new Intl.Locale(resolveDateLocale(locale), options).toString();
}

export function createUtcPresentationDate(date: IsoDate): Date {
  const result = new Date(0);
  result.setUTCHours(12, 0, 0, 0);
  result.setUTCFullYear(date.year, date.month - 1, date.day);
  return result;
}

export function formatLocalizedNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(resolveDateLocale(locale), {
    useGrouping: false,
  }).format(value);
}

export function normalizeLocalizedDigits(
  value: string,
  locale: string
): string {
  const formatter = new Intl.NumberFormat(resolveDateLocale(locale), {
    useGrouping: false,
  });
  const digitMap = new Map<string, string>();
  for (let digit = 0; digit <= 9; digit += 1) {
    digitMap.set(formatter.format(digit), String(digit));
  }

  return Array.from(
    value,
    (character) => digitMap.get(character) ?? character
  ).join('');
}

function shouldShowEra(calendar: DateCalendar): boolean {
  return ['japanese', 'roc', 'persian', 'islamic-civil'].includes(calendar);
}

function formatEraLabel(
  value: string,
  locale: string,
  calendar: DateCalendar
): string {
  const formatter = new Intl.DateTimeFormat(
    getCalendarLocale(locale, calendar),
    {
      timeZone: 'UTC',
      era: 'long',
    }
  );
  return (
    formatter
      .formatToParts(createUtcPresentationDate(parseDateValue(value)))
      .find((part) => part.type === 'era')?.value ?? ''
  );
}

export function getCalendarEraOptions(
  locale: string,
  calendar: DateCalendar
): CalendarEraOption[] {
  const sources: ReadonlyArray<Readonly<{ id: string; value: string }>> =
    calendar === 'japanese'
      ? JAPANESE_ERAS.map((era) => ({ id: era.id, value: era.start }))
      : calendar === 'roc'
        ? [
            { id: 'before-roc', value: '1911-01-01' },
            { id: 'roc', value: '1912-01-01' },
          ]
        : calendar === 'persian'
          ? [
              { id: 'before-ap', value: '0001-01-01' },
              { id: 'ap', value: '2024-03-20' },
            ]
          : calendar === 'islamic-civil'
            ? [
                { id: 'before-ah', value: '0001-01-01' },
                { id: 'ah', value: '2024-03-20' },
              ]
            : [];

  const options = sources.map(({ id, value }) => ({
    id,
    label: formatEraLabel(value, locale, calendar) || id,
  }));
  const canonicalLocale = resolveDateLocale(locale);
  const labelCounts = new Map<string, number>();
  for (const option of options) {
    const key = option.label.toLocaleLowerCase(canonicalLocale);
    labelCounts.set(key, (labelCounts.get(key) ?? 0) + 1);
  }

  return options.map((option) => {
    const key = option.label.toLocaleLowerCase(canonicalLocale);
    const isDuplicate = (labelCounts.get(key) as number) > 1;
    return isDuplicate && option.id.startsWith('before-')
      ? { ...option, label: `− ${option.label}` }
      : option;
  });
}

export function getDateSegmentLayout(
  value: string,
  locale: string,
  calendar: DateCalendar
): DateSegmentLayoutPart[] {
  const date = parseDateValue(value);
  const calendarDate = getCalendarDate(date, calendar);
  const formatter = new Intl.DateTimeFormat(
    getCalendarLocale(locale, calendar),
    {
      timeZone: 'UTC',
      ...(shouldShowEra(calendar) ? { era: 'long' as const } : {}),
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }
  );

  return formatter
    .formatToParts(createUtcPresentationDate(date))
    .flatMap<DateSegmentLayoutPart>((part) => {
      if (
        part.type === 'era' ||
        part.type === 'year' ||
        part.type === 'month' ||
        part.type === 'day'
      ) {
        const segmentValue =
          part.type === 'era'
            ? part.value
            : formatLocalizedNumber(calendarDate[part.type], locale);
        return [{ kind: 'segment', type: part.type, value: segmentValue }];
      }
      if (part.type === 'literal') {
        return [{ kind: 'literal', value: part.value }];
      }
      return [];
    });
}

export function formatDateValue(
  value: string,
  locale: string,
  calendar: DateCalendar
): string {
  const date = parseDateValue(value);
  const calendarDate = getCalendarDate(date, calendar);
  return new Intl.DateTimeFormat(getCalendarLocale(locale, calendar), {
    timeZone: 'UTC',
    ...(shouldShowEra(calendar) ? { era: 'short' as const } : {}),
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
    .formatToParts(createUtcPresentationDate(date))
    .map((part) => {
      if (part.type === 'year' || part.type === 'day') {
        return formatLocalizedNumber(calendarDate[part.type], locale);
      }
      return part.value;
    })
    .join('');
}

type LocaleWithWeekInfo = Intl.Locale & {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
};

export function getFallbackFirstDayOfWeekForRegion(
  region: string
): FirstDayOfWeek {
  if (FRIDAY_FIRST_REGIONS.has(region)) return 'fri';
  if (SATURDAY_FIRST_REGIONS.has(region)) return 'sat';
  if (SUNDAY_FIRST_REGIONS.has(region)) return 'sun';
  return 'mon';
}

export function getLocaleFirstDayOfWeek(locale: string): FirstDayOfWeek {
  const resolved = new Intl.Locale(
    resolveDateLocale(locale)
  ) as LocaleWithWeekInfo;
  const nativeWeekInfo = resolved.getWeekInfo?.() ?? resolved.weekInfo;
  const region = (resolved.region ?? resolved.maximize().region) as string;
  if (!nativeWeekInfo) return getFallbackFirstDayOfWeekForRegion(region);
  return WEEKDAY_ORDER[moduloWeekday(nativeWeekInfo.firstDay - 1)];
}

function moduloWeekday(value: number): number {
  return ((value % 7) + 7) % 7;
}

export function getLocaleDirection(locale: string): 'ltr' | 'rtl' {
  const resolved = new Intl.Locale(resolveDateLocale(locale));
  const textInfo = (
    resolved as Intl.Locale & {
      getTextInfo?: () => { direction: 'ltr' | 'rtl' };
    }
  ).getTextInfo?.();
  if (textInfo?.direction) return textInfo.direction;

  const language = resolved.language;
  return ['ar', 'fa', 'he', 'ps', 'ur'].includes(language) ? 'rtl' : 'ltr';
}

export function getWeekdayLabels(
  locale: string,
  firstDayOfWeek: FirstDayOfWeek
): WeekdayLabel[] {
  const startIndex = WEEKDAY_ORDER.indexOf(firstDayOfWeek);
  const baseMonday = { year: 2024, month: 1, day: 1 } as const;
  const shortFormatter = new Intl.DateTimeFormat(resolveDateLocale(locale), {
    timeZone: 'UTC',
    weekday: 'short',
  });
  const longFormatter = new Intl.DateTimeFormat(resolveDateLocale(locale), {
    timeZone: 'UTC',
    weekday: 'long',
  });

  return Array.from({ length: 7 }, (_, offset) => {
    const weekdayOffset = moduloWeekday(startIndex + offset);
    const date = createUtcPresentationDate({
      ...baseMonday,
      day: baseMonday.day + weekdayOffset,
    });
    return {
      short: shortFormatter.format(date),
      long: longFormatter.format(date),
    };
  });
}

export function formatCalendarMonthHeading(
  value: string,
  locale: string,
  calendar: DateCalendar
): string {
  const date = parseDateValue(value);
  const calendarDate = getCalendarDate(date, calendar);
  return new Intl.DateTimeFormat(getCalendarLocale(locale, calendar), {
    timeZone: 'UTC',
    ...(shouldShowEra(calendar) ? { era: 'short' as const } : {}),
    year: 'numeric',
    month: 'long',
  })
    .formatToParts(createUtcPresentationDate(date))
    .map((part) =>
      part.type === 'year'
        ? formatLocalizedNumber(calendarDate.year, locale)
        : part.value
    )
    .join('');
}
