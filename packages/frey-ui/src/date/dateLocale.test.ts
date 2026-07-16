import { describe, expect, it, vi } from 'vitest';
import {
  formatCalendarMonthHeading,
  formatDateValue,
  formatLocalizedNumber,
  getCalendarEraOptions,
  getFallbackFirstDayOfWeekForRegion,
  getDateSegmentLayout,
  getLocaleDirection,
  getLocaleFirstDayOfWeek,
  getWeekdayLabels,
  normalizeLocalizedDigits,
  resolveDateLocale,
} from './dateLocale';

describe('date locale presentation', () => {
  it('uses locale-specific segment ordering and literals', () => {
    expect(
      getDateSegmentLayout('2024-03-20', 'en-US', 'gregory').map((part) =>
        part.kind === 'segment' ? part.type : part.value
      )
    ).toEqual(['month', '/', 'day', '/', 'year']);

    expect(
      getDateSegmentLayout('2024-03-20', 'id-ID', 'gregory').map((part) =>
        part.kind === 'segment' ? part.type : part.value
      )
    ).toEqual(['day', '/', 'month', '/', 'year']);
  });

  it('includes era segments for Japanese dates', () => {
    const layout = getDateSegmentLayout('2019-05-01', 'ja-JP', 'japanese');

    expect(layout.filter((part) => part.kind === 'segment')).toMatchObject([
      { type: 'era', value: '令和' },
      { type: 'year', value: '1' },
      { type: 'month', value: '5' },
      { type: 'day', value: '1' },
    ]);
  });

  it('provides localized adapter era options for segmented entry', () => {
    expect(getCalendarEraOptions('en-US', 'roc')).toMatchObject([
      { id: 'before-roc' },
      { id: 'roc' },
    ]);
    expect(getCalendarEraOptions('ja-JP', 'japanese').slice(-2)).toMatchObject([
      { id: 'heisei', label: '平成' },
      { id: 'reiwa', label: '令和' },
    ]);

    const persianOptions = getCalendarEraOptions('fa-IR', 'persian');
    expect(new Set(persianOptions.map((option) => option.label))).toHaveLength(
      2
    );
    expect(persianOptions).toMatchObject([
      { id: 'before-ap', label: expect.stringContaining('−') },
      { id: 'ap', label: expect.not.stringContaining('−') },
    ]);
    expect(getCalendarEraOptions('en-US', 'islamic-civil')).toHaveLength(2);
    expect(getCalendarEraOptions('en-US', 'gregory')).toEqual([]);
  });

  it('uses adapter-owned numeric values instead of Intl calendar arithmetic', () => {
    const layout = getDateSegmentLayout('0001-01-01', 'en-US', 'japanese');
    const values = Object.fromEntries(
      layout
        .filter((part) => part.kind === 'segment')
        .map((part) => [part.type, part.value])
    );

    expect(values).toMatchObject({ year: '-643', month: '1', day: '1' });
  });

  it('formats and normalizes localized digits', () => {
    expect(formatLocalizedNumber(1403, 'fa-IR')).toBe('۱۴۰۳');
    expect(normalizeLocalizedDigits('۱۴۰۳/۰۱/۰۲', 'fa-IR')).toBe('1403/01/02');
  });

  it('formats the public ISO value in the requested calendar', () => {
    expect(formatDateValue('2024-03-20', 'en-US', 'gregory')).toBe(
      'March 20, 2024'
    );
    expect(formatDateValue('2024-03-20', 'th-TH', 'buddhist')).toContain(
      '2567'
    );
    expect(formatDateValue('2024-03-20', 'fa-IR', 'persian')).toContain('۱۴۰۳');
  });

  it('formats localized weekday labels and calendar headings', () => {
    const weekdays = getWeekdayLabels('en-US', 'sun');
    expect(weekdays).toHaveLength(7);
    expect(weekdays[0]).toEqual({ short: 'Sun', long: 'Sunday' });
    expect(weekdays[6]).toEqual({ short: 'Sat', long: 'Saturday' });

    expect(formatCalendarMonthHeading('2024-03-20', 'en-US', 'gregory')).toBe(
      'March 2024'
    );
    expect(
      formatCalendarMonthHeading('2024-03-20', 'fa-IR', 'persian')
    ).toContain('۱۴۰۳');
  });

  it.each([
    ['en-US', 'sun'],
    ['id-ID', 'sun'],
    ['fa-IR', 'sat'],
  ] as const)('resolves the first weekday for %s', (locale, expected) => {
    expect(getLocaleFirstDayOfWeek(locale)).toBe(expected);
  });

  it.each([
    ['MV', 'fri'],
    ['EG', 'sat'],
    ['ID', 'sun'],
    ['AE', 'mon'],
    ['DE', 'mon'],
  ] as const)('falls back to checked-in week data for %s', (region, expected) => {
    expect(getFallbackFirstDayOfWeekForRegion(region)).toBe(expected);
  });

  it('normalizes valid locales and rejects invalid locales', () => {
    expect(resolveDateLocale('EN-us')).toBe('en-US');
    expect(() => resolveDateLocale('not_a_locale')).toThrow(
      new RangeError('locale must be a valid BCP 47 language tag.')
    );
  });

  it('resolves omitted locales from browser and deterministic fallback states', () => {
    vi.stubGlobal('navigator', { language: 'id-ID' });
    expect(resolveDateLocale()).toBe('id-ID');

    vi.stubGlobal('navigator', { language: '' });
    expect(resolveDateLocale()).toBe('en-US');

    vi.stubGlobal('navigator', undefined);
    expect(resolveDateLocale()).toBe('en-US');
    vi.unstubAllGlobals();
  });

  it('uses checked-in direction and week fallbacks when Intl methods are absent', () => {
    const localePrototype = Intl.Locale.prototype as Intl.Locale & {
      getTextInfo?: () => { direction: 'ltr' | 'rtl' };
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const textInfoDescriptor = Object.getOwnPropertyDescriptor(
      localePrototype,
      'getTextInfo'
    );
    const weekInfoMethodDescriptor = Object.getOwnPropertyDescriptor(
      localePrototype,
      'getWeekInfo'
    );
    const weekInfoDescriptor = Object.getOwnPropertyDescriptor(
      localePrototype,
      'weekInfo'
    );

    Object.defineProperties(localePrototype, {
      getTextInfo: { configurable: true, value: undefined },
      getWeekInfo: { configurable: true, value: undefined },
      weekInfo: { configurable: true, value: undefined },
    });

    try {
      expect(getLocaleDirection('fa-IR')).toBe('rtl');
      expect(getLocaleDirection('en-US')).toBe('ltr');
      expect(getLocaleFirstDayOfWeek('id-ID')).toBe('sun');
      expect(getLocaleFirstDayOfWeek('en')).toBe('sun');
    } finally {
      for (const [name, descriptor] of [
        ['getTextInfo', textInfoDescriptor],
        ['getWeekInfo', weekInfoMethodDescriptor],
        ['weekInfo', weekInfoDescriptor],
      ] as const) {
        if (descriptor) {
          Object.defineProperty(localePrototype, name, descriptor);
        } else {
          Reflect.deleteProperty(localePrototype, name);
        }
      }
    }
  });

  it('falls back to era ids and ignores unknown Intl date parts', () => {
    const dateTimeFormat = vi.spyOn(Intl, 'DateTimeFormat');
    dateTimeFormat.mockImplementation(function DateTimeFormatMock() {
      return {
        formatToParts: () => [{ type: 'weekday', value: 'ignored' }],
      } as unknown as Intl.DateTimeFormat;
    });

    try {
      expect(getCalendarEraOptions('en-US', 'roc')).toEqual([
        { id: 'before-roc', label: 'before-roc' },
        { id: 'roc', label: 'roc' },
      ]);
      expect(getDateSegmentLayout('2024-03-20', 'en-US', 'gregory')).toEqual(
        []
      );
    } finally {
      dateTimeFormat.mockRestore();
    }
  });
});
