import { describe, expect, it } from 'vitest';
import {
  addCalendarMonths,
  addCalendarYears,
  addIsoDays,
  addIsoMonths,
  addIsoYears,
  compareIsoDates,
  fromCalendarDate,
  getCalendarDate,
  getDaysInIsoMonth,
  isDateWithinConstraints,
  epochDayToIsoDate,
  isoDateToEpochDay,
  parseDateValue,
  serializeDateValue,
  validateDateConstraints,
  validateDateCalendar,
} from './dateEngine';
import { JAPANESE_ERAS } from './japaneseEraData';
import type { DateCalendar, IsoDate } from './types';

describe('ISO date values', () => {
  it.each([
    ['0001-01-01', { year: 1, month: 1, day: 1 }],
    ['2000-02-29', { year: 2000, month: 2, day: 29 }],
    ['9999-12-31', { year: 9999, month: 12, day: 31 }],
  ])('parses and serializes %s exactly', (value, expected) => {
    const parsed = parseDateValue(value, 'value');

    expect(parsed).toEqual(expected);
    expect(serializeDateValue(parsed)).toBe(value);
  });

  it.each([
    '0000-01-01',
    '10000-01-01',
    '2024-2-03',
    '2024-02-3',
    '2023-02-29',
    '1900-02-29',
    '2024-04-31',
    'not-a-date',
  ])('rejects invalid value %s', (value) => {
    expect(() => parseDateValue(value, 'value')).toThrow(
      new RangeError(
        `value must be a valid YYYY-MM-DD date; received ${value}.`
      )
    );
  });

  it('uses a timezone-free Unix epoch-day scale', () => {
    expect(isoDateToEpochDay({ year: 1, month: 1, day: 1 })).toBe(-719_162);
    expect(isoDateToEpochDay({ year: 1970, month: 1, day: 1 })).toBe(0);
    expect(isoDateToEpochDay({ year: 9999, month: 12, day: 31 })).toBe(
      2_932_896
    );
  });

  it('round-trips every ISO day in the supported range', () => {
    let mismatch: Readonly<{ actual: number; expected: number }> | undefined;
    for (let epochDay = -719_162; epochDay <= 2_932_896; epochDay += 1) {
      const actual = isoDateToEpochDay(epochDayToIsoDate(epochDay));
      if (actual !== epochDay) {
        mismatch = { actual, expected: epochDay };
        break;
      }
    }

    expect(mismatch).toBeUndefined();
  });

  it('round-trips representative epoch days across the full range', () => {
    for (let epochDay = -719_162; epochDay <= 2_932_896; epochDay += 137) {
      const date = addIsoDays({ year: 1970, month: 1, day: 1 }, epochDay);
      expect(isoDateToEpochDay(date)).toBe(epochDay);
    }
  });

  it('handles leap centuries and clamps month arithmetic', () => {
    expect(getDaysInIsoMonth(1900, 2)).toBe(28);
    expect(getDaysInIsoMonth(2000, 2)).toBe(29);
    expect(addIsoDays({ year: 1999, month: 12, day: 31 }, 1)).toEqual({
      year: 2000,
      month: 1,
      day: 1,
    });
    expect(addIsoMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it('rejects invalid structures and arithmetic outside the ISO range', () => {
    expect(() => serializeDateValue({ year: 2024, month: 13, day: 1 })).toThrow(
      new RangeError('date must be between 0001-01-01 and 9999-12-31.')
    );
    expect(() => isoDateToEpochDay({ year: 2024, month: 2, day: 30 })).toThrow(
      new RangeError('date must be between 0001-01-01 and 9999-12-31.')
    );
    expect(() => epochDayToIsoDate(0.5)).toThrow(
      new RangeError('epochDay is outside the supported ISO date range.')
    );
    expect(() => epochDayToIsoDate(-719_163)).toThrow(
      new RangeError('epochDay is outside the supported ISO date range.')
    );
    expect(() => epochDayToIsoDate(2_932_897)).toThrow(
      new RangeError('epochDay is outside the supported ISO date range.')
    );
    expect(() => addIsoDays({ year: 9999, month: 12, day: 31 }, 1)).toThrow(
      new RangeError('epochDay is outside the supported ISO date range.')
    );
    expect(() => addIsoMonths({ year: 1, month: 1, day: 1 }, -1)).toThrow(
      new RangeError('date arithmetic exceeded the supported ISO range.')
    );
    expect(() => addIsoYears({ year: 9999, month: 1, day: 1 }, 1)).toThrow(
      new RangeError('date arithmetic exceeded the supported ISO range.')
    );
  });

  it('clamps ISO year arithmetic and covers every comparison result', () => {
    expect(addIsoYears({ year: 2024, month: 2, day: 29 }, 1)).toEqual({
      year: 2025,
      month: 2,
      day: 28,
    });
    expect(
      compareIsoDates(
        { year: 2024, month: 1, day: 2 },
        { year: 2024, month: 1, day: 1 }
      )
    ).toBe(1);
    expect(
      compareIsoDates(
        { year: 2024, month: 1, day: 1 },
        { year: 2024, month: 1, day: 1 }
      )
    ).toBe(0);
  });

  it.each([
    ['gregory', '2024-01-31', 1, '2024-02-29'],
    ['japanese', '2019-04-30', 1, '2019-05-30'],
    ['persian', '2023-09-22', 1, '2023-10-22'],
    ['hebrew', '2024-03-11', 1, '2024-04-09'],
  ] as const)('adds a %s calendar month from %s', (calendar, value, amount, expected) => {
    expect(
      serializeDateValue(
        addCalendarMonths(parseDateValue(value), calendar, amount)
      )
    ).toBe(expected);
  });

  it('clamps Hebrew leap-month year navigation into a common year', () => {
    expect(
      serializeDateValue(
        addCalendarYears(parseDateValue('2024-02-10'), 'hebrew', 1)
      )
    ).toBe('2025-03-01');
  });

  it('compares and validates consumer constraints', () => {
    expect(
      compareIsoDates(
        { year: 2024, month: 1, day: 1 },
        { year: 2024, month: 1, day: 2 }
      )
    ).toBe(-1);
    expect(() => validateDateConstraints('2024-02-01', '2024-01-01')).toThrow(
      new RangeError('minValue must be on or before maxValue.')
    );

    const date = parseDateValue('2024-03-20');
    expect(validateDateConstraints()).toEqual({});
    expect(isDateWithinConstraints(date)).toBe(true);
    expect(isDateWithinConstraints(date, parseDateValue('2024-03-21'))).toBe(
      false
    );
    expect(
      isDateWithinConstraints(date, undefined, parseDateValue('2024-03-19'))
    ).toBe(false);
  });

  it('validates runtime calendar values for JavaScript consumers', () => {
    expect(validateDateCalendar('hebrew')).toBe('hebrew');
    expect(() => validateDateCalendar('martian')).toThrow(
      new RangeError(
        'calendar must be a supported date calendar; received martian.'
      )
    );
  });
});

describe('calendar adapters', () => {
  it.each<[DateCalendar, string, Partial<ReturnType<typeof getCalendarDate>>]>([
    ['gregory', '2024-03-20', { year: 2024, month: 3, day: 20 }],
    ['buddhist', '2024-03-20', { era: 'be', year: 2567, month: 3, day: 20 }],
    ['roc', '2024-03-20', { era: 'roc', year: 113, month: 3, day: 20 }],
    ['persian', '2024-03-20', { era: 'ap', year: 1403, month: 1, day: 1 }],
    [
      'islamic-civil',
      '2024-03-20',
      { era: 'ah', year: 1445, month: 9, day: 10 },
    ],
    ['hebrew', '2024-10-03', { era: 'am', year: 5785, month: 1, day: 1 }],
  ])('converts %s date %s', (calendar, value, expected) => {
    expect(getCalendarDate(parseDateValue(value), calendar)).toMatchObject(
      expected
    );
  });

  it('handles modern Japanese era boundaries', () => {
    expect(
      getCalendarDate(parseDateValue('2019-04-30'), 'japanese')
    ).toMatchObject({ era: 'heisei', year: 31, month: 4, day: 30 });
    expect(
      getCalendarDate(parseDateValue('2019-05-01'), 'japanese')
    ).toMatchObject({ era: 'reiwa', year: 1, month: 5, day: 1 });
  });

  it('covers Persian leap and Nowruz boundaries', () => {
    expect(
      getCalendarDate(parseDateValue('2021-03-20'), 'persian')
    ).toMatchObject({ year: 1399, month: 12, day: 30, daysInMonth: 30 });
    expect(
      getCalendarDate(parseDateValue('2021-03-21'), 'persian')
    ).toMatchObject({ year: 1400, month: 1, day: 1 });
    expect(
      getCalendarDate(parseDateValue('0622-03-21'), 'persian')
    ).toMatchObject({
      era: 'before-ap',
      year: 1,
      month: 12,
      day: 30,
      daysInMonth: 30,
    });
    expect(
      getCalendarDate(parseDateValue('0622-03-22'), 'persian')
    ).toMatchObject({ era: 'ap', year: 1, month: 1, day: 1 });
  });

  it('covers the Islamic Civil epoch and a full 30-year cycle', () => {
    expect(
      getCalendarDate(parseDateValue('0622-07-19'), 'islamic-civil')
    ).toMatchObject({ era: 'ah', year: 1, month: 1, day: 1 });
    expect(
      getCalendarDate(parseDateValue('0651-08-27'), 'islamic-civil')
    ).toMatchObject({ era: 'ah', year: 31, month: 1, day: 1 });
  });

  it('covers Hebrew leap months and postponed new-year boundaries', () => {
    expect(
      getCalendarDate(parseDateValue('2024-02-10'), 'hebrew')
    ).toMatchObject({ year: 5784, month: 6, monthCode: 'M05L', day: 1 });
    expect(
      getCalendarDate(parseDateValue('2024-03-11'), 'hebrew')
    ).toMatchObject({ year: 5784, month: 7, day: 1 });
    expect(
      getCalendarDate(parseDateValue('2024-10-02'), 'hebrew')
    ).toMatchObject({ year: 5784, month: 13, day: 29 });
    expect(
      getCalendarDate(parseDateValue('2024-10-03'), 'hebrew')
    ).toMatchObject({ year: 5785, month: 1, day: 1 });
  });

  it('rejects impossible calendar parts instead of rolling them forward', () => {
    const persian = getCalendarDate(parseDateValue('2024-03-20'), 'persian');

    expect(() =>
      fromCalendarDate({ ...persian, month: 13, day: 1 }, 'persian')
    ).toThrow(new RangeError('date is not valid in the persian calendar.'));
  });

  it('uses checked-in Japanese era boundaries and proleptic Taika years', () => {
    expect(JAPANESE_ERAS[0]).toEqual({ id: 'taika', start: '0645-06-22' });
    expect(
      getCalendarDate(parseDateValue('0001-01-01'), 'japanese')
    ).toMatchObject({ era: 'taika', year: -643, month: 1, day: 1 });
    expect(
      getCalendarDate(parseDateValue('0650-02-17'), 'japanese')
    ).toMatchObject({ era: 'taika', year: 6, month: 2, day: 17 });
    expect(
      getCalendarDate(parseDateValue('0650-02-18'), 'japanese')
    ).toMatchObject({ era: 'hakuchi', year: 1, month: 2, day: 18 });
    expect(
      getCalendarDate(parseDateValue('1868-10-23'), 'japanese')
    ).toMatchObject({ era: 'meiji', year: 1, month: 10, day: 23 });
  });

  it('reconstructs Japanese values from era fields rather than cached ISO fields', () => {
    const reiwa = getCalendarDate(parseDateValue('2024-02-29'), 'japanese');

    expect(
      fromCalendarDate(
        {
          ...reiwa,
          relatedYear: 1,
          relatedMonth: 1,
          relatedDay: 1,
        },
        'japanese'
      )
    ).toEqual({ year: 2024, month: 2, day: 29 });

    expect(() =>
      fromCalendarDate({ ...reiwa, era: 'missing-era' }, 'japanese')
    ).toThrow(
      new RangeError('date.era is not a supported Japanese era: missing-era.')
    );
  });

  it('navigates variable calendars in both directions and across eras', () => {
    const persianEpoch = parseDateValue('0622-03-22');
    const beforePersian = addCalendarYears(persianEpoch, 'persian', -1);
    expect(getCalendarDate(beforePersian, 'persian')).toMatchObject({
      era: 'before-ap',
      year: 1,
    });
    expect(addCalendarYears(beforePersian, 'persian', 1)).toEqual(persianEpoch);

    const islamicEpoch = parseDateValue('0622-07-19');
    const beforeIslamic = addCalendarMonths(islamicEpoch, 'islamic-civil', -1);
    expect(getCalendarDate(beforeIslamic, 'islamic-civil')).toMatchObject({
      era: 'before-ah',
      year: 1,
      month: 12,
    });
    expect(addCalendarMonths(beforeIslamic, 'islamic-civil', 1)).toEqual(
      islamicEpoch
    );

    const hebrewNewYear = parseDateValue('2024-10-03');
    const previousHebrewMonth = addCalendarMonths(hebrewNewYear, 'hebrew', -1);
    expect(getCalendarDate(previousHebrewMonth, 'hebrew')).toMatchObject({
      year: 5784,
      month: 13,
      day: 1,
    });
    expect(addCalendarMonths(previousHebrewMonth, 'hebrew', 1)).toEqual(
      hebrewNewYear
    );

    const persianSecondMonth = parseDateValue('2024-04-20');
    expect(
      getCalendarDate(
        addCalendarMonths(persianSecondMonth, 'persian', -1),
        'persian'
      )
    ).toMatchObject({ month: 1, day: 1 });
  });

  it('validates calendar arithmetic amounts and preserves zero shifts', () => {
    const date = parseDateValue('2024-03-20');
    expect(addCalendarMonths(date, 'persian', 0)).toEqual(date);
    expect(addCalendarYears(date, 'hebrew', 0)).toEqual(date);
    expect(
      getCalendarDate(addCalendarYears(date, 'persian', 1), 'persian')
    ).toMatchObject({ year: 1404, month: 1, day: 1 });
    expect(addCalendarYears(date, 'gregory', 1)).toEqual(
      parseDateValue('2025-03-20')
    );
    expect(() => addCalendarMonths(date, 'persian', 0.5)).toThrow(
      new RangeError('amount must be an integer number of calendar months.')
    );
    expect(() => addCalendarYears(date, 'persian', 0.5)).toThrow(
      new RangeError('amount must be an integer number of calendar years.')
    );
  });

  it('covers the terminal day of a Persian 2820-year arithmetic cycle', () => {
    const date = epochDayToIsoDate(710_840);
    const calendarDate = getCalendarDate(date, 'persian');

    expect(fromCalendarDate(calendarDate, 'persian')).toEqual(date);
  });

  it.each<DateCalendar>([
    'gregory',
    'buddhist',
    'japanese',
    'roc',
    'persian',
    'islamic-civil',
    'hebrew',
  ])('round-trips sampled %s values', (calendar) => {
    const samples: IsoDate[] = [
      { year: 1, month: 1, day: 1 },
      { year: 622, month: 7, day: 19 },
      { year: 1582, month: 10, day: 15 },
      { year: 1912, month: 1, day: 1 },
      { year: 2000, month: 2, day: 29 },
      { year: 2024, month: 10, day: 3 },
      { year: 9999, month: 12, day: 31 },
    ];

    for (const sample of samples) {
      const calendarDate = getCalendarDate(sample, calendar);
      expect(fromCalendarDate(calendarDate, calendar)).toEqual(sample);
    }

    for (let epochDay = -719_162; epochDay <= 2_932_896; epochDay += 4093) {
      const sample = epochDayToIsoDate(epochDay);
      const calendarDate = getCalendarDate(sample, calendar);
      expect(fromCalendarDate(calendarDate, calendar)).toEqual(sample);
    }
  });
});
