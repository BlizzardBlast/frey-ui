import {
  addCalendarMonths,
  addCalendarYears,
  epochDayToIsoDate,
  fromCalendarDate,
  getCalendarDate,
  isDateWithinConstraints,
  isoDateToEpochDay,
  parseDateValue,
  serializeDateValue,
  validateDateConstraints,
} from '../date/dateEngine';
import {
  formatCalendarMonthHeading,
  formatDateValue,
  formatLocalizedNumber,
  getLocaleFirstDayOfWeek,
  getWeekdayLabels,
  resolveDateLocale,
  type WeekdayLabel,
} from '../date/dateLocale';
import type {
  CalendarDate,
  DateCalendar,
  DateValue,
  FirstDayOfWeek,
  IsoDate,
} from '../date/types';

const MIN_VALUE = '0001-01-01';
const MAX_VALUE = '9999-12-31';
const MIN_EPOCH_DAY = isoDateToEpochDay(parseDateValue(MIN_VALUE));
const MAX_EPOCH_DAY = isoDateToEpochDay(parseDateValue(MAX_VALUE));
const FIXED_MONTH_CALENDARS: ReadonlySet<DateCalendar> = new Set([
  'gregory',
  'buddhist',
  'japanese',
  'roc',
]);
const WEEKDAY_INDEX: Readonly<Record<FirstDayOfWeek, number>> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function getWeekdayIndex(date: IsoDate): number {
  // 1970-01-01 was Thursday (index 4 in a Sunday-first week).
  return modulo(isoDateToEpochDay(date) + 4, 7);
}

function getCalendarMonthStart(
  date: IsoDate,
  calendar: DateCalendar
): IsoDate {
  const calendarDate = getCalendarDate(date, calendar);

  // Japanese eras can begin mid-month. The fixed-month calendars therefore
  // use their related ISO month instead of constructing an invalid era date.
  if (FIXED_MONTH_CALENDARS.has(calendar)) {
    return parseDateValue(
      serializeDateValue({
        year: calendarDate.relatedYear,
        month: calendarDate.relatedMonth,
        day: 1,
      })
    );
  }

  return fromCalendarDate({ ...calendarDate, day: 1 }, calendar);
}

function isSameCalendarUnit(
  left: IsoDate,
  right: IsoDate,
  calendar: DateCalendar,
  unit: 'month' | 'year'
): boolean {
  const leftCalendarDate = getCalendarDate(left, calendar);
  const rightCalendarDate = getCalendarDate(right, calendar);
  if (FIXED_MONTH_CALENDARS.has(calendar)) {
    return (
      leftCalendarDate.relatedYear === rightCalendarDate.relatedYear &&
      (unit === 'year' ||
        leftCalendarDate.relatedMonth === rightCalendarDate.relatedMonth)
    );
  }
  return (
    leftCalendarDate.era === rightCalendarDate.era &&
    leftCalendarDate.year === rightCalendarDate.year &&
    (unit === 'year' || leftCalendarDate.month === rightCalendarDate.month)
  );
}

function getNextCalendarMonthEpoch(
  monthStart: IsoDate,
  calendar: DateCalendar
): number {
  if (
    isSameCalendarUnit(
      monthStart,
      parseDateValue(MAX_VALUE),
      calendar,
      'month'
    )
  ) {
    return MAX_EPOCH_DAY + 1;
  }
  return isoDateToEpochDay(addCalendarMonths(monthStart, calendar, 1));
}

export type CalendarCellModel = Readonly<{
  gridKey: string;
  value: DateValue | null;
  calendarDate: CalendarDate | null;
  dayLabel: string;
  accessibleLabel: string;
  isAdjacentMonth: boolean;
  isFocused: boolean;
  isSelected: boolean;
  isToday: boolean;
  isUnavailable: boolean;
  isOutOfRange: boolean;
  isOutsideSupportedRange: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isFocusable: boolean;
}>;

export type CalendarGridModel = Readonly<{
  cells: readonly CalendarCellModel[];
  heading: string;
  firstDayOfWeek: FirstDayOfWeek;
  monthStartValue: DateValue;
  weekdayLabels: readonly WeekdayLabel[];
}>;

export type CreateCalendarGridModelOptions = Readonly<{
  focusedValue: DateValue;
  visibleMonthValue?: DateValue;
  selectedValue?: DateValue | null;
  todayValue?: DateValue;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (value: DateValue) => boolean;
  locale: string;
  calendar: DateCalendar;
  firstDayOfWeek?: FirstDayOfWeek;
  disabled?: boolean;
  readOnly?: boolean;
}>;

export function createCalendarGridModel({
  focusedValue,
  visibleMonthValue = focusedValue,
  selectedValue,
  todayValue,
  minValue,
  maxValue,
  isDateUnavailable,
  locale,
  calendar,
  firstDayOfWeek,
  disabled = false,
  readOnly = false,
}: CreateCalendarGridModelOptions): CalendarGridModel {
  parseDateValue(focusedValue, 'focusedValue');
  const visibleDate = parseDateValue(visibleMonthValue, 'visibleMonthValue');
  if (selectedValue !== undefined && selectedValue !== null) {
    parseDateValue(selectedValue, 'selectedValue');
  }
  if (todayValue !== undefined) parseDateValue(todayValue, 'todayValue');
  const { minDate, maxDate } = validateDateConstraints(minValue, maxValue);
  const resolvedLocale = resolveDateLocale(locale);
  const resolvedFirstDay =
    firstDayOfWeek ?? getLocaleFirstDayOfWeek(resolvedLocale);
  const monthStart = getCalendarMonthStart(visibleDate, calendar);
  const monthStartEpoch = isoDateToEpochDay(monthStart);
  const nextMonthEpoch = getNextCalendarMonthEpoch(monthStart, calendar);
  const gridStartEpoch =
    monthStartEpoch -
    modulo(
      getWeekdayIndex(monthStart) - WEEKDAY_INDEX[resolvedFirstDay],
      7
    );

  const cells = Array.from({ length: 42 }, (_, index): CalendarCellModel => {
    const epochDay = gridStartEpoch + index;
    const gridKey = `epoch-${epochDay}`;
    if (epochDay < MIN_EPOCH_DAY || epochDay > MAX_EPOCH_DAY) {
      return {
        gridKey,
        value: null,
        calendarDate: null,
        dayLabel: '',
        accessibleLabel: '',
        isAdjacentMonth: true,
        isFocused: false,
        isSelected: false,
        isToday: false,
        isUnavailable: false,
        isOutOfRange: true,
        isOutsideSupportedRange: true,
        isDisabled: true,
        isReadOnly: readOnly,
        isFocusable: false,
      };
    }

    const date = epochDayToIsoDate(epochDay);
    const value = serializeDateValue(date);
    const calendarDate = getCalendarDate(date, calendar);
    const isUnavailable = isDateUnavailable?.(value) ?? false;
    const isOutOfRange = !isDateWithinConstraints(date, minDate, maxDate);
    return {
      gridKey,
      value,
      calendarDate,
      dayLabel: formatLocalizedNumber(calendarDate.day, resolvedLocale),
      accessibleLabel: formatDateValue(value, resolvedLocale, calendar),
      isAdjacentMonth:
        epochDay < monthStartEpoch || epochDay >= nextMonthEpoch,
      isFocused: value === focusedValue,
      isSelected: value === selectedValue,
      isToday: value === todayValue,
      isUnavailable,
      isOutOfRange,
      isOutsideSupportedRange: false,
      isDisabled: disabled || isUnavailable || isOutOfRange,
      isReadOnly: readOnly,
      isFocusable: !disabled,
    };
  });

  return {
    cells,
    heading: formatCalendarMonthHeading(
      serializeDateValue(monthStart),
      resolvedLocale,
      calendar
    ),
    firstDayOfWeek: resolvedFirstDay,
    monthStartValue: serializeDateValue(monthStart),
    weekdayLabels: getWeekdayLabels(resolvedLocale, resolvedFirstDay),
  };
}

export function canSelectCalendarCell(
  cell: CalendarCellModel
): cell is CalendarCellModel & Readonly<{ value: DateValue }> {
  return cell.value !== null && !cell.isDisabled && !cell.isReadOnly;
}

export type ResolveInitialCalendarFocusOptions = Readonly<{
  value?: DateValue | null;
  defaultFocusedValue?: DateValue;
  today: DateValue;
  minValue?: DateValue;
  maxValue?: DateValue;
}>;

export function resolveInitialCalendarFocus({
  value,
  defaultFocusedValue,
  today,
  minValue,
  maxValue,
}: ResolveInitialCalendarFocusOptions): DateValue {
  const { minDate, maxDate } = validateDateConstraints(minValue, maxValue);
  const selectedDate =
    value === undefined || value === null
      ? undefined
      : parseDateValue(value, 'value');
  const defaultDate =
    defaultFocusedValue === undefined
      ? undefined
      : parseDateValue(defaultFocusedValue, 'defaultFocusedValue');
  const todayDate = parseDateValue(today, 'today');
  if (selectedDate) return serializeDateValue(selectedDate);
  if (defaultDate) {
    if (isDateWithinConstraints(defaultDate, minDate, maxDate)) {
      return serializeDateValue(defaultDate);
    }
  }
  if (minDate && isoDateToEpochDay(todayDate) < isoDateToEpochDay(minDate)) {
    return serializeDateValue(minDate);
  }
  if (maxDate && isoDateToEpochDay(todayDate) > isoDateToEpochDay(maxDate)) {
    return serializeDateValue(maxDate);
  }
  return today;
}

export type CalendarFocusMovement =
  | Readonly<{ unit: 'day' | 'week' | 'month' | 'year'; amount: number }>
  | Readonly<{ unit: 'week-start' | 'week-end' }>;

export type MoveCalendarFocusOptions = Readonly<{
  calendar: DateCalendar;
  firstDayOfWeek: FirstDayOfWeek;
}>;

function addClampedIsoDays(date: IsoDate, amount: number): IsoDate {
  const epochDay = Math.min(
    Math.max(isoDateToEpochDay(date) + amount, MIN_EPOCH_DAY),
    MAX_EPOCH_DAY
  );
  return epochDayToIsoDate(epochDay);
}

function addClampedCalendarUnit(
  date: IsoDate,
  calendar: DateCalendar,
  amount: number,
  unit: 'month' | 'year'
): IsoDate {
  if (amount !== -1 && amount !== 1) {
    throw new RangeError('calendar month and year movement must be one step.');
  }
  const boundary = parseDateValue(amount < 0 ? MIN_VALUE : MAX_VALUE);
  if (isSameCalendarUnit(date, boundary, calendar, unit)) {
    return boundary;
  }
  return unit === 'month'
    ? addCalendarMonths(date, calendar, amount)
    : addCalendarYears(date, calendar, amount);
}

export function moveCalendarFocus(
  value: DateValue,
  movement: CalendarFocusMovement,
  { calendar, firstDayOfWeek }: MoveCalendarFocusOptions
): DateValue {
  const date = parseDateValue(value, 'focusedValue');
  let nextDate: IsoDate;

  switch (movement.unit) {
    case 'day':
      nextDate = addClampedIsoDays(date, movement.amount);
      break;
    case 'week':
      nextDate = addClampedIsoDays(date, movement.amount * 7);
      break;
    case 'month':
    case 'year':
      nextDate = addClampedCalendarUnit(
        date,
        calendar,
        movement.amount,
        movement.unit
      );
      break;
    case 'week-start': {
      const elapsed = modulo(
        getWeekdayIndex(date) - WEEKDAY_INDEX[firstDayOfWeek],
        7
      );
      nextDate = addClampedIsoDays(date, -elapsed);
      break;
    }
    case 'week-end': {
      const elapsed = modulo(
        getWeekdayIndex(date) - WEEKDAY_INDEX[firstDayOfWeek],
        7
      );
      nextDate = addClampedIsoDays(date, 6 - elapsed);
      break;
    }
  }

  return serializeDateValue(nextDate);
}

export function getHorizontalDayDelta(
  key: 'ArrowLeft' | 'ArrowRight',
  direction: 'ltr' | 'rtl'
): -1 | 1 {
  const physicalDelta = key === 'ArrowLeft' ? -1 : 1;
  return (direction === 'rtl' ? -physicalDelta : physicalDelta) as -1 | 1;
}

export type CalendarState = Readonly<{
  focusedValue: DateValue;
  visibleMonthValue: DateValue;
}>;

export type CalendarStateAction =
  | Readonly<{
      type: 'move-focus';
      movement: CalendarFocusMovement;
      calendar: DateCalendar;
      firstDayOfWeek: FirstDayOfWeek;
    }>
  | Readonly<{
      type: 'set-focused-value';
      value: DateValue;
      calendar: DateCalendar;
    }>;

export function createCalendarState(
  focusedValue: DateValue,
  calendar: DateCalendar
): CalendarState {
  const parsed = parseDateValue(focusedValue, 'focusedValue');
  return {
    focusedValue,
    visibleMonthValue: serializeDateValue(
      getCalendarMonthStart(parsed, calendar)
    ),
  };
}

export function calendarStateReducer(
  state: CalendarState,
  action: CalendarStateAction
): CalendarState {
  if (action.type === 'set-focused-value') {
    return createCalendarState(action.value, action.calendar);
  }

  const focusedValue = moveCalendarFocus(
    state.focusedValue,
    action.movement,
    {
      calendar: action.calendar,
      firstDayOfWeek: action.firstDayOfWeek,
    }
  );
  return createCalendarState(focusedValue, action.calendar);
}
