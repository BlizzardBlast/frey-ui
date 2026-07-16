import { describe, expect, it, vi } from 'vitest';
import {
  addCalendarMonths,
  getCalendarDate,
  parseDateValue,
  serializeDateValue,
} from '../date/dateEngine';
import type { DateCalendar } from '../date/types';
import {
  calendarStateReducer,
  canSelectCalendarCell,
  createCalendarGridModel,
  createCalendarState,
  getHorizontalDayDelta,
  moveCalendarFocus,
  resolveInitialCalendarFocus,
  type CalendarCellModel,
  type CalendarGridModel,
} from './calendarModel';

const CALENDARS: readonly DateCalendar[] = [
  'gregory',
  'buddhist',
  'japanese',
  'roc',
  'persian',
  'islamic-civil',
  'hebrew',
];

function getRequiredCell(
  model: CalendarGridModel,
  value: string
): CalendarCellModel {
  const cell = model.cells.find((candidate) => candidate.value === value);
  expect(cell).toBeDefined();
  if (!cell) throw new Error(`Expected ${value} in the calendar grid.`);
  return cell;
}

describe('Calendar model', () => {
  it.each(CALENDARS)('creates a fixed six-week %s grid', (calendar) => {
    const model = createCalendarGridModel({
      focusedValue: '2024-03-20',
      locale: 'en-US',
      calendar,
    });
    const focusedCalendarDate = getCalendarDate(
      parseDateValue('2024-03-20'),
      calendar
    );
    const currentMonthCells = model.cells.filter(
      (cell) => !cell.isAdjacentMonth && !cell.isOutsideSupportedRange
    );

    expect(model.cells).toHaveLength(42);
    expect(model.cells).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: '2024-03-20', isFocused: true }),
      ])
    );
    expect(currentMonthCells[0]?.calendarDate).toMatchObject({ day: 1 });
    expect(currentMonthCells).toHaveLength(focusedCalendarDate.daysInMonth);
    expect(model.cells.some((cell) => cell.isAdjacentMonth)).toBe(true);
  });

  it('uses the locale week start unless the consumer overrides it', () => {
    const sundayFirst = createCalendarGridModel({
      focusedValue: '2024-03-20',
      locale: 'en-US',
      calendar: 'gregory',
    });
    const mondayFirst = createCalendarGridModel({
      focusedValue: '2024-03-20',
      locale: 'en-US',
      calendar: 'gregory',
      firstDayOfWeek: 'mon',
    });
    const britishLocale = createCalendarGridModel({
      focusedValue: '2024-03-20',
      locale: 'en-GB',
      calendar: 'gregory',
    });

    expect(sundayFirst.firstDayOfWeek).toBe('sun');
    expect(sundayFirst.cells[0]?.value).toBe('2024-02-25');
    expect(mondayFirst.firstDayOfWeek).toBe('mon');
    expect(mondayFirst.cells[0]?.value).toBe('2024-02-26');
    expect(britishLocale.firstDayOfWeek).toBe('mon');
  });

  it('marks focus, selection, today, availability, bounds, and read-only state', () => {
    const isDateUnavailable = vi.fn((value: string) => value === '2024-03-21');
    const model = createCalendarGridModel({
      focusedValue: '2024-03-20',
      selectedValue: '2024-03-19',
      todayValue: '2024-03-20',
      minValue: '2024-03-10',
      maxValue: '2024-03-25',
      isDateUnavailable,
      locale: 'en-US',
      calendar: 'gregory',
      readOnly: true,
    });
    const getCell = (value: string) =>
      model.cells.find((cell) => cell.value === value);

    expect(getCell('2024-03-19')).toMatchObject({ isSelected: true });
    expect(getCell('2024-03-20')).toMatchObject({
      isFocused: true,
      isToday: true,
    });
    expect(getCell('2024-03-21')).toMatchObject({
      isUnavailable: true,
      isDisabled: true,
      isReadOnly: true,
    });
    expect(getCell('2024-03-09')).toMatchObject({
      isOutOfRange: true,
      isDisabled: true,
    });
    expect(getCell('2024-03-22')).toMatchObject({ isDisabled: false });
    expect(
      canSelectCalendarCell(getRequiredCell(model, '2024-03-22'))
    ).toBe(false);
    expect(
      canSelectCalendarCell(getRequiredCell(model, '2024-03-21'))
    ).toBe(false);
    expect(isDateUnavailable).toHaveBeenCalled();
  });

  it('keeps consumer-blocked cells focusable but blocks activation', () => {
    const model = createCalendarGridModel({
      focusedValue: '2024-03-01',
      minValue: '2024-03-10',
      maxValue: '2024-03-20',
      isDateUnavailable: (value) => value === '2024-03-15',
      locale: 'en-US',
      calendar: 'gregory',
    });

    for (const value of ['2024-03-09', '2024-03-15', '2024-03-21']) {
      const cell = getRequiredCell(model, value);
      expect(cell.isDisabled).toBe(true);
      expect(cell.isFocusable).toBe(true);
      expect(canSelectCalendarCell(cell)).toBe(false);
    }
    expect(
      canSelectCalendarCell(getRequiredCell(model, '2024-03-20'))
    ).toBe(true);
  });

  it('keeps disabled calendars out of the roving focus sequence', () => {
    const model = createCalendarGridModel({
      focusedValue: '2024-03-20',
      selectedValue: null,
      todayValue: '2024-03-20',
      locale: 'en-US',
      calendar: 'gregory',
      disabled: true,
    });

    expect(getRequiredCell(model, '2024-03-20')).toMatchObject({
      isDisabled: true,
      isFocusable: false,
      isSelected: false,
      isToday: true,
    });
  });

  it('uses the full related month across a mid-month Japanese era boundary', () => {
    const model = createCalendarGridModel({
      focusedValue: '1912-07-31',
      visibleMonthValue: '1912-07-31',
      locale: 'ja-JP',
      calendar: 'japanese',
    });

    expect(model.monthStartValue).toBe('1912-07-01');
    expect(getRequiredCell(model, '1912-07-01').isAdjacentMonth).toBe(false);
    expect(getRequiredCell(model, '1912-07-31').isAdjacentMonth).toBe(false);
  });

  it('uses placeholders outside the hard ISO range without changing grid size', () => {
    const minimum = createCalendarGridModel({
      focusedValue: '0001-01-01',
      locale: 'en-US',
      calendar: 'gregory',
    });
    const maximum = createCalendarGridModel({
      focusedValue: '9999-12-31',
      locale: 'en-US',
      calendar: 'gregory',
    });

    expect(minimum.cells).toHaveLength(42);
    expect(maximum.cells).toHaveLength(42);
    expect(minimum.cells.some((cell) => cell.isOutsideSupportedRange)).toBe(
      true
    );
    expect(maximum.cells.some((cell) => cell.isOutsideSupportedRange)).toBe(
      true
    );
    expect(
      minimum.cells
        .filter((cell) => cell.isOutsideSupportedRange)
        .every((cell) => cell.value === null && !cell.isFocusable)
    ).toBe(true);
    for (const model of [minimum, maximum]) {
      expect(new Set(model.cells.map((cell) => cell.gridKey))).toHaveLength(42);
    }
  });

  it('assigns every normal grid position a unique epoch-derived key', () => {
    const model = createCalendarGridModel({
      focusedValue: '2024-03-20',
      locale: 'en-US',
      calendar: 'gregory',
    });
    const keys = model.cells.map((cell) => cell.gridKey);

    expect(new Set(keys)).toHaveLength(42);
    expect(keys.every((key) => /^epoch--?\d+$/.test(key))).toBe(true);
  });

  it('builds variable-calendar months immediately before the upper ISO edge', () => {
    const maximum = parseDateValue('9999-12-31');
    const previousMonth = serializeDateValue(
      addCalendarMonths(maximum, 'hebrew', -1)
    );
    const model = createCalendarGridModel({
      focusedValue: previousMonth,
      locale: 'he-IL',
      calendar: 'hebrew',
    });
    const maximumModel = createCalendarGridModel({
      focusedValue: '9999-12-31',
      locale: 'he-IL',
      calendar: 'hebrew',
    });

    expect(model.cells).toHaveLength(42);
    expect(maximumModel.cells).toHaveLength(42);
    expect(
      moveCalendarFocus(
        '9999-12-31',
        { unit: 'year', amount: 1 },
        { calendar: 'hebrew', firstDayOfWeek: 'sun' }
      )
    ).toBe('9999-12-31');
  });

  it('resolves initial focus in selection, default, today, and nearest-bound order', () => {
    expect(
      resolveInitialCalendarFocus({
        value: '2024-04-01',
        defaultFocusedValue: '2024-03-20',
        today: '2024-03-15',
        minValue: '2024-03-01',
        maxValue: '2024-03-31',
      })
    ).toBe('2024-04-01');
    expect(
      resolveInitialCalendarFocus({
        value: null,
        defaultFocusedValue: '2024-03-20',
        today: '2024-03-15',
      })
    ).toBe('2024-03-20');
    expect(
      resolveInitialCalendarFocus({
        value: null,
        defaultFocusedValue: '2024-02-01',
        today: '2024-03-15',
        minValue: '2024-03-01',
      })
    ).toBe('2024-03-15');
    expect(
      resolveInitialCalendarFocus({
        value: null,
        today: '2024-01-01',
        minValue: '2024-03-01',
        maxValue: '2024-03-31',
      })
    ).toBe('2024-03-01');
    expect(
      resolveInitialCalendarFocus({
        value: null,
        today: '2024-04-01',
        maxValue: '2024-03-31',
      })
    ).toBe('2024-03-31');
    expect(
      resolveInitialCalendarFocus({ value: undefined, today: '2024-03-15' })
    ).toBe('2024-03-15');
  });

  it('validates every initial-focus value before applying precedence', () => {
    expect(() =>
      resolveInitialCalendarFocus({
        value: '2024-03-20',
        defaultFocusedValue: 'not-a-date',
        today: '2024-03-15',
      })
    ).toThrow(
      new RangeError(
        'defaultFocusedValue must be a valid YYYY-MM-DD date; received not-a-date.'
      )
    );
    expect(() =>
      resolveInitialCalendarFocus({
        value: '2024-03-20',
        today: 'not-a-date',
      })
    ).toThrow(
      new RangeError(
        'today must be a valid YYYY-MM-DD date; received not-a-date.'
      )
    );
  });

  it('moves by day, week, localized week boundary, month, and year', () => {
    const options = {
      calendar: 'gregory' as const,
      firstDayOfWeek: 'mon' as const,
    };

    expect(
      moveCalendarFocus('2024-03-20', { unit: 'day', amount: 1 }, options)
    ).toBe('2024-03-21');
    expect(
      moveCalendarFocus('2024-03-20', { unit: 'week', amount: -1 }, options)
    ).toBe('2024-03-13');
    expect(
      moveCalendarFocus('2024-03-20', { unit: 'week-start' }, options)
    ).toBe('2024-03-18');
    expect(
      moveCalendarFocus('2024-03-20', { unit: 'week-end' }, options)
    ).toBe('2024-03-24');
    expect(
      moveCalendarFocus('2024-01-31', { unit: 'month', amount: 1 }, options)
    ).toBe('2024-02-29');
    expect(
      moveCalendarFocus('2024-02-29', { unit: 'year', amount: 1 }, options)
    ).toBe('2025-02-28');
  });

  it('clamps navigation at the supported ISO boundaries', () => {
    const options = {
      calendar: 'gregory' as const,
      firstDayOfWeek: 'sun' as const,
    };

    expect(
      moveCalendarFocus('0001-01-01', { unit: 'day', amount: -1 }, options)
    ).toBe('0001-01-01');
    expect(
      moveCalendarFocus('9999-12-31', { unit: 'month', amount: 1 }, options)
    ).toBe('9999-12-31');
    expect(
      moveCalendarFocus('9999-12-31', { unit: 'year', amount: 1 }, options)
    ).toBe('9999-12-31');
    expect(
      moveCalendarFocus('0001-01-15', { unit: 'month', amount: -1 }, options)
    ).toBe('0001-01-01');
    expect(() =>
      moveCalendarFocus('2024-01-31', { unit: 'month', amount: 2 }, options)
    ).toThrow(
      new RangeError('calendar month and year movement must be one step.')
    );
  });

  it.each(CALENDARS)(
    'clamps %s month and year movement at both hard edges',
    (calendar) => {
      const options = { calendar, firstDayOfWeek: 'sun' as const };
      expect(
        moveCalendarFocus(
          '0001-01-01',
          { unit: 'month', amount: -1 },
          options
        )
      ).toBe('0001-01-01');
      expect(
        moveCalendarFocus(
          '0001-01-01',
          { unit: 'year', amount: -1 },
          options
        )
      ).toBe('0001-01-01');
      expect(
        moveCalendarFocus(
          '9999-12-31',
          { unit: 'month', amount: 1 },
          options
        )
      ).toBe('9999-12-31');
      expect(
        moveCalendarFocus(
          '9999-12-31',
          { unit: 'year', amount: 1 },
          options
        )
      ).toBe('9999-12-31');
    }
  );

  it('clamps Hebrew leap-month year movement using calendar arithmetic', () => {
    expect(
      moveCalendarFocus(
        '2024-02-10',
        { unit: 'year', amount: 1 },
        { calendar: 'hebrew', firstDayOfWeek: 'sun' }
      )
    ).toBe('2025-03-01');
  });

  it('navigates variable calendars across units away from hard boundaries', () => {
    expect(
      moveCalendarFocus(
        '2024-03-20',
        { unit: 'month', amount: -1 },
        { calendar: 'persian', firstDayOfWeek: 'sat' }
      )
    ).toBe('2024-02-20');
  });

  it('maps horizontal arrows to the visual direction', () => {
    expect(getHorizontalDayDelta('ArrowLeft', 'ltr')).toBe(-1);
    expect(getHorizontalDayDelta('ArrowRight', 'ltr')).toBe(1);
    expect(getHorizontalDayDelta('ArrowLeft', 'rtl')).toBe(1);
    expect(getHorizontalDayDelta('ArrowRight', 'rtl')).toBe(-1);
  });

  it('updates focused and visible month state through reducer transitions', () => {
    const initial = createCalendarState('2024-03-31', 'gregory');
    const next = calendarStateReducer(initial, {
      type: 'move-focus',
      movement: { unit: 'day', amount: 1 },
      calendar: 'gregory',
      firstDayOfWeek: 'sun',
    });
    const synchronized = calendarStateReducer(next, {
      type: 'set-focused-value',
      value: '2025-02-10',
      calendar: 'gregory',
    });

    expect(initial).toEqual({
      focusedValue: '2024-03-31',
      visibleMonthValue: '2024-03-01',
    });
    expect(next).toEqual({
      focusedValue: '2024-04-01',
      visibleMonthValue: '2024-04-01',
    });
    expect(synchronized).toEqual({
      focusedValue: '2025-02-10',
      visibleMonthValue: '2025-02-01',
    });
  });
});
