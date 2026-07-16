import type { CalendarDate, DateCalendar, DateValue, IsoDate } from './types';
import { JAPANESE_ERAS } from './japaneseEraData';

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MIN_EPOCH_DAY = -719_162;
const MAX_EPOCH_DAY = 2_932_896;
const FIXED_FROM_UNIX_EPOCH = 719_163;
const HEBREW_EPOCH = -1_373_427;
const DATE_CALENDARS: readonly DateCalendar[] = [
  'gregory',
  'buddhist',
  'japanese',
  'roc',
  'persian',
  'islamic-civil',
  'hebrew',
];

export function validateDateCalendar(
  calendar: unknown,
  propName = 'calendar'
): DateCalendar {
  if (!DATE_CALENDARS.includes(calendar as DateCalendar)) {
    throw new RangeError(
      `${propName} must be a supported date calendar; received ${String(calendar)}.`
    );
  }
  return calendar as DateCalendar;
}

function floorDiv(dividend: number, divisor: number): number {
  return Math.floor(dividend / divisor);
}

function modulo(dividend: number, divisor: number): number {
  return ((dividend % divisor) + divisor) % divisor;
}

export function isIsoLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function getDaysInIsoMonth(year: number, month: number): number {
  if (month === 2) return isIsoLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isValidIsoDate(date: IsoDate): boolean {
  return (
    Number.isInteger(date.year) &&
    date.year >= 1 &&
    date.year <= 9999 &&
    Number.isInteger(date.month) &&
    date.month >= 1 &&
    date.month <= 12 &&
    Number.isInteger(date.day) &&
    date.day >= 1 &&
    date.day <= getDaysInIsoMonth(date.year, date.month)
  );
}

export function parseDateValue(value: DateValue, propName = 'value'): IsoDate {
  const match = ISO_PATTERN.exec(value);
  const parsed = match
    ? {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      }
    : null;

  if (!parsed || !isValidIsoDate(parsed)) {
    throw new RangeError(
      `${propName} must be a valid YYYY-MM-DD date; received ${value}.`
    );
  }

  return parsed;
}

export function serializeDateValue(date: IsoDate): DateValue {
  if (!isValidIsoDate(date)) {
    throw new RangeError('date must be between 0001-01-01 and 9999-12-31.');
  }

  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(
    2,
    '0'
  )}-${String(date.day).padStart(2, '0')}`;
}

export function isoDateToEpochDay(date: IsoDate): number {
  if (!isValidIsoDate(date)) {
    throw new RangeError('date must be between 0001-01-01 and 9999-12-31.');
  }

  let year = date.year;
  year -= date.month <= 2 ? 1 : 0;
  const era = floorDiv(year, 400);
  const yearOfEra = year - era * 400;
  const adjustedMonth = date.month + (date.month > 2 ? -3 : 9);
  const dayOfYear = floorDiv(153 * adjustedMonth + 2, 5) + date.day - 1;
  const dayOfEra =
    yearOfEra * 365 +
    floorDiv(yearOfEra, 4) -
    floorDiv(yearOfEra, 100) +
    dayOfYear;

  return era * 146_097 + dayOfEra - 719_468;
}

export function epochDayToIsoDate(epochDay: number): IsoDate {
  if (
    !Number.isInteger(epochDay) ||
    epochDay < MIN_EPOCH_DAY ||
    epochDay > MAX_EPOCH_DAY
  ) {
    throw new RangeError('epochDay is outside the supported ISO date range.');
  }

  const shifted = epochDay + 719_468;
  const era = floorDiv(shifted, 146_097);
  const dayOfEra = shifted - era * 146_097;
  const yearOfEra = floorDiv(
    dayOfEra -
      floorDiv(dayOfEra, 1460) +
      floorDiv(dayOfEra, 36_524) -
      floorDiv(dayOfEra, 146_096),
    365
  );
  let year = yearOfEra + era * 400;
  const dayOfYear =
    dayOfEra -
    (365 * yearOfEra + floorDiv(yearOfEra, 4) - floorDiv(yearOfEra, 100));
  const monthPrime = floorDiv(5 * dayOfYear + 2, 153);
  const day = dayOfYear - floorDiv(153 * monthPrime + 2, 5) + 1;
  const month = monthPrime + (monthPrime < 10 ? 3 : -9);
  year += month <= 2 ? 1 : 0;

  return { year, month, day };
}

export function addIsoDays(date: IsoDate, amount: number): IsoDate {
  return epochDayToIsoDate(isoDateToEpochDay(date) + amount);
}

export function addIsoMonths(date: IsoDate, amount: number): IsoDate {
  const monthIndex = date.year * 12 + date.month - 1 + amount;
  const year = floorDiv(monthIndex, 12);
  const month = modulo(monthIndex, 12) + 1;
  const result = {
    year,
    month,
    day: Math.min(date.day, getDaysInIsoMonth(year, month)),
  };

  if (!isValidIsoDate(result)) {
    throw new RangeError('date arithmetic exceeded the supported ISO range.');
  }

  return result;
}

export function addIsoYears(date: IsoDate, amount: number): IsoDate {
  const year = date.year + amount;
  const result = {
    year,
    month: date.month,
    day: Math.min(date.day, getDaysInIsoMonth(year, date.month)),
  };

  if (!isValidIsoDate(result)) {
    throw new RangeError('date arithmetic exceeded the supported ISO range.');
  }

  return result;
}

export function compareIsoDates(left: IsoDate, right: IsoDate): -1 | 0 | 1 {
  const difference = isoDateToEpochDay(left) - isoDateToEpochDay(right);
  return difference < 0 ? -1 : difference > 0 ? 1 : 0;
}

export function validateDateConstraints(
  minValue?: DateValue,
  maxValue?: DateValue
): Readonly<{ minDate?: IsoDate; maxDate?: IsoDate }> {
  const minDate =
    minValue === undefined ? undefined : parseDateValue(minValue, 'minValue');
  const maxDate =
    maxValue === undefined ? undefined : parseDateValue(maxValue, 'maxValue');

  if (minDate && maxDate && compareIsoDates(minDate, maxDate) > 0) {
    throw new RangeError('minValue must be on or before maxValue.');
  }

  return { minDate, maxDate };
}

export function isDateWithinConstraints(
  date: IsoDate,
  minDate?: IsoDate,
  maxDate?: IsoDate
): boolean {
  return !(
    (minDate && compareIsoDates(date, minDate) < 0) ||
    (maxDate && compareIsoDates(date, maxDate) > 0)
  );
}

function fixedFromIso(date: IsoDate): number {
  return isoDateToEpochDay(date) + FIXED_FROM_UNIX_EPOCH;
}

function isoFromFixed(fixed: number): IsoDate {
  return epochDayToIsoDate(fixed - FIXED_FROM_UNIX_EPOCH);
}

function getPersianFixed(year: number, month: number, day: number): number {
  const epochBase = year - (year >= 0 ? 474 : 473);
  const epochYear = 474 + modulo(epochBase, 2820);
  const monthDays = month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6;

  return (
    day +
    monthDays +
    floorDiv(epochYear * 682 - 110, 2816) +
    (epochYear - 1) * 365 +
    floorDiv(epochBase, 2820) * 1_029_983 +
    226_895
  );
}

function getPersianDate(fixed: number): CalendarDate {
  const daysSince475 = fixed - getPersianFixed(475, 1, 1);
  const cycle = floorDiv(daysSince475, 1_029_983);
  const cycleDay = modulo(daysSince475, 1_029_983);
  const yearInCycle =
    cycleDay === 1_029_982
      ? 2820
      : floorDiv(
          2134 * floorDiv(cycleDay, 366) + 2816 * modulo(cycleDay, 366) + 2815,
          1_028_522
        ) +
        floorDiv(cycleDay, 366) +
        1;
  let year = yearInCycle + 2820 * cycle + 474;
  if (year <= 0) year -= 1;
  const dayOfYear = fixed - getPersianFixed(year, 1, 1) + 1;
  const month =
    dayOfYear <= 186
      ? Math.ceil(dayOfYear / 31)
      : Math.ceil((dayOfYear - 6) / 30);
  const day = fixed - getPersianFixed(year, month, 1) + 1;
  const nextYear = year === -1 ? 1 : year + 1;
  const nextYearLength =
    getPersianFixed(nextYear, 1, 1) - getPersianFixed(year, 1, 1);
  const daysInMonth =
    month <= 6 ? 31 : month <= 11 ? 30 : nextYearLength === 366 ? 30 : 29;

  const relatedDate = isoFromFixed(fixed);

  return {
    era: year > 0 ? 'ap' : 'before-ap',
    year: Math.abs(year),
    month,
    monthCode: `M${String(month).padStart(2, '0')}`,
    day,
    monthsInYear: 12,
    daysInMonth,
    relatedYear: relatedDate.year,
    relatedMonth: relatedDate.month,
    relatedDay: relatedDate.day,
  };
}

function getIslamicFixed(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    floorDiv(3 + 11 * year, 30) +
    227_014
  );
}

function isIslamicLeapYear(year: number): boolean {
  return modulo(14 + 11 * year, 30) < 11;
}

function getIslamicDate(fixed: number): CalendarDate {
  const year = floorDiv(30 * (fixed - 227_015) + 10_646, 10_631);
  const month = Math.min(
    12,
    Math.max(
      1,
      Math.ceil((fixed - (29 + getIslamicFixed(year, 1, 1))) / 29.5) + 1
    )
  );
  const day = fixed - getIslamicFixed(year, month, 1) + 1;
  const daysInMonth =
    month % 2 === 1 || (month === 12 && isIslamicLeapYear(year)) ? 30 : 29;

  const relatedDate = isoFromFixed(fixed);

  return {
    era: year > 0 ? 'ah' : 'before-ah',
    year: Math.abs(year),
    month,
    monthCode: `M${String(month).padStart(2, '0')}`,
    day,
    monthsInYear: 12,
    daysInMonth,
    relatedYear: relatedDate.year,
    relatedMonth: relatedDate.month,
    relatedDay: relatedDate.day,
  };
}

function isHebrewLeapYear(year: number): boolean {
  return modulo(7 * year + 1, 19) < 7;
}

function getHebrewElapsedDays(year: number): number {
  const months = floorDiv(235 * year - 234, 19);
  const parts = 12_084 + 13_753 * months;
  let day = months * 29 + floorDiv(parts, 25_920);
  if (modulo(3 * (day + 1), 7) < 3) day += 1;
  return day;
}

function getHebrewNewYear(year: number): number {
  const previous = getHebrewElapsedDays(year - 1);
  const current = getHebrewElapsedDays(year);
  const next = getHebrewElapsedDays(year + 1);
  const correction =
    next - current === 356 ? 2 : current - previous === 382 ? 1 : 0;
  return HEBREW_EPOCH + current + correction;
}

function getHebrewYearDays(year: number): number {
  return getHebrewNewYear(year + 1) - getHebrewNewYear(year);
}

function getHebrewTraditionalMonthDays(year: number, month: number): number {
  if ([2, 4, 6, 10, 13].includes(month)) return 29;
  if (month === 12 && !isHebrewLeapYear(year)) return 29;
  const yearDays = getHebrewYearDays(year);
  if (month === 8 && modulo(yearDays, 10) !== 5) return 29;
  if (month === 9 && modulo(yearDays, 10) === 3) return 29;
  return 30;
}

function getHebrewFixed(year: number, month: number, day: number): number {
  let fixed = getHebrewNewYear(year) + day - 1;
  const lastMonth = isHebrewLeapYear(year) ? 13 : 12;

  if (month < 7) {
    for (let current = 7; current <= lastMonth; current += 1) {
      fixed += getHebrewTraditionalMonthDays(year, current);
    }
    for (let current = 1; current < month; current += 1) {
      fixed += getHebrewTraditionalMonthDays(year, current);
    }
  } else {
    for (let current = 7; current < month; current += 1) {
      fixed += getHebrewTraditionalMonthDays(year, current);
    }
  }

  return fixed;
}

function hebrewTraditionalToDisplayMonth(
  year: number,
  traditionalMonth: number
): number {
  const leap = isHebrewLeapYear(year);
  if (traditionalMonth >= 7 && traditionalMonth <= 11) {
    return traditionalMonth - 6;
  }
  if (traditionalMonth === 12) return 6;
  if (traditionalMonth === 13) return 7;
  return traditionalMonth + (leap ? 7 : 6);
}

function hebrewDisplayToTraditionalMonth(
  year: number,
  displayMonth: number
): number {
  const leap = isHebrewLeapYear(year);
  if (displayMonth <= 5) return displayMonth + 6;
  if (displayMonth === 6) return 12;
  if (leap && displayMonth === 7) return 13;
  return displayMonth - (leap ? 7 : 6);
}

function getHebrewDate(fixed: number): CalendarDate {
  let year = floorDiv((fixed - HEBREW_EPOCH) * 98_496, 35_975_351) + 1;
  while (fixed >= getHebrewNewYear(year + 1)) year += 1;
  while (fixed < getHebrewNewYear(year)) year -= 1;

  const firstMonth = fixed < getHebrewFixed(year, 1, 1) ? 7 : 1;
  let traditionalMonth = firstMonth;
  while (
    fixed >
    getHebrewFixed(
      year,
      traditionalMonth,
      getHebrewTraditionalMonthDays(year, traditionalMonth)
    )
  ) {
    traditionalMonth += 1;
  }
  const day = fixed - getHebrewFixed(year, traditionalMonth, 1) + 1;
  const month = hebrewTraditionalToDisplayMonth(year, traditionalMonth);
  const isLeapAdar = traditionalMonth === 12 && isHebrewLeapYear(year);

  const relatedDate = isoFromFixed(fixed);

  return {
    era: 'am',
    year,
    month,
    monthCode: isLeapAdar ? 'M05L' : `M${String(month).padStart(2, '0')}`,
    day,
    monthsInYear: isHebrewLeapYear(year) ? 13 : 12,
    daysInMonth: getHebrewTraditionalMonthDays(year, traditionalMonth),
    relatedYear: relatedDate.year,
    relatedMonth: relatedDate.month,
    relatedDay: relatedDate.day,
  };
}

const JAPANESE_ERA_DATES = JAPANESE_ERAS.map((era) => ({
  ...era,
  startDate: parseDateValue(era.start),
  startEpochDay: isoDateToEpochDay(parseDateValue(era.start)),
}));

function getJapaneseEra(date: IsoDate) {
  const epochDay = isoDateToEpochDay(date);
  let low = 0;
  let high = JAPANESE_ERA_DATES.length - 1;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (JAPANESE_ERA_DATES[middle].startEpochDay <= epochDay) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return JAPANESE_ERA_DATES[low];
}

function getJapaneseDate(date: IsoDate): CalendarDate {
  const era = getJapaneseEra(date);

  return {
    era: era.id,
    year: date.year - era.startDate.year + 1,
    month: date.month,
    monthCode: `M${String(date.month).padStart(2, '0')}`,
    day: date.day,
    monthsInYear: 12,
    daysInMonth: getDaysInIsoMonth(date.year, date.month),
    relatedYear: date.year,
    relatedMonth: date.month,
    relatedDay: date.day,
  };
}

export function getCalendarDate(
  date: IsoDate,
  calendar: DateCalendar
): CalendarDate {
  const fixed = fixedFromIso(date);

  switch (calendar) {
    case 'gregory':
      return {
        era: 'ad',
        year: date.year,
        month: date.month,
        monthCode: `M${String(date.month).padStart(2, '0')}`,
        day: date.day,
        monthsInYear: 12,
        daysInMonth: getDaysInIsoMonth(date.year, date.month),
        relatedYear: date.year,
        relatedMonth: date.month,
        relatedDay: date.day,
      };
    case 'buddhist':
      return {
        era: 'be',
        year: date.year + 543,
        month: date.month,
        monthCode: `M${String(date.month).padStart(2, '0')}`,
        day: date.day,
        monthsInYear: 12,
        daysInMonth: getDaysInIsoMonth(date.year, date.month),
        relatedYear: date.year,
        relatedMonth: date.month,
        relatedDay: date.day,
      };
    case 'roc': {
      const isRoc = date.year >= 1912;
      return {
        era: isRoc ? 'roc' : 'before-roc',
        year: isRoc ? date.year - 1911 : 1912 - date.year,
        month: date.month,
        monthCode: `M${String(date.month).padStart(2, '0')}`,
        day: date.day,
        monthsInYear: 12,
        daysInMonth: getDaysInIsoMonth(date.year, date.month),
        relatedYear: date.year,
        relatedMonth: date.month,
        relatedDay: date.day,
      };
    }
    case 'japanese':
      return getJapaneseDate(date);
    case 'persian':
      return getPersianDate(fixed);
    case 'islamic-civil':
      return getIslamicDate(fixed);
    case 'hebrew':
      return getHebrewDate(fixed);
  }
}

function validateCalendarRoundTrip(
  source: CalendarDate,
  calendar: DateCalendar,
  candidate: IsoDate
): IsoDate {
  const converted = getCalendarDate(candidate, calendar);
  if (
    converted.era !== source.era ||
    converted.year !== source.year ||
    converted.month !== source.month ||
    converted.day !== source.day
  ) {
    throw new RangeError(`date is not valid in the ${calendar} calendar.`);
  }
  return candidate;
}

export function fromCalendarDate(
  date: CalendarDate,
  calendar: DateCalendar
): IsoDate {
  switch (calendar) {
    case 'gregory':
      return validateCalendarRoundTrip(
        date,
        calendar,
        parseDateValue(
          serializeDateValue({
            year: date.year,
            month: date.month,
            day: date.day,
          })
        )
      );
    case 'buddhist':
      return validateCalendarRoundTrip(
        date,
        calendar,
        parseDateValue(
          serializeDateValue({
            year: date.year - 543,
            month: date.month,
            day: date.day,
          })
        )
      );
    case 'roc':
      return validateCalendarRoundTrip(
        date,
        calendar,
        parseDateValue(
          serializeDateValue({
            year: date.era === 'roc' ? date.year + 1911 : 1912 - date.year,
            month: date.month,
            day: date.day,
          })
        )
      );
    case 'japanese': {
      const era = JAPANESE_ERA_DATES.find(
        (candidate) => candidate.id === date.era
      );
      if (!era) {
        throw new RangeError(
          `date.era is not a supported Japanese era: ${date.era}.`
        );
      }
      const candidate = parseDateValue(
        serializeDateValue({
          year: era.startDate.year + date.year - 1,
          month: date.month,
          day: date.day,
        })
      );
      return validateCalendarRoundTrip(date, calendar, candidate);
    }
    case 'persian': {
      const year = date.era === 'before-ap' ? -date.year : date.year;
      return validateCalendarRoundTrip(
        date,
        calendar,
        isoFromFixed(getPersianFixed(year, date.month, date.day))
      );
    }
    case 'islamic-civil': {
      const year = date.era === 'before-ah' ? -date.year : date.year;
      return validateCalendarRoundTrip(
        date,
        calendar,
        isoFromFixed(getIslamicFixed(year, date.month, date.day))
      );
    }
    case 'hebrew':
      return validateCalendarRoundTrip(
        date,
        calendar,
        isoFromFixed(
          getHebrewFixed(
            date.year,
            hebrewDisplayToTraditionalMonth(date.year, date.month),
            date.day
          )
        )
      );
  }
}

function shiftSignedCalendarYear(year: number, amount: number): number {
  let result = year;
  const direction = Math.sign(amount);
  for (let step = 0; step < Math.abs(amount); step += 1) {
    result += direction;
    if (result === 0) result += direction;
  }
  return result;
}

function getSignedCalendarYear(date: CalendarDate): number {
  return date.era.startsWith('before-') ? -date.year : date.year;
}

function setSignedCalendarYear(
  date: CalendarDate,
  calendar: 'persian' | 'islamic-civil',
  year: number
): CalendarDate {
  const beforeEra = calendar === 'persian' ? 'before-ap' : 'before-ah';
  const afterEra = calendar === 'persian' ? 'ap' : 'ah';
  return {
    ...date,
    era: year < 0 ? beforeEra : afterEra,
    year: Math.abs(year),
  };
}

function clampCalendarDay(
  source: CalendarDate,
  target: CalendarDate,
  calendar: DateCalendar
): IsoDate {
  const firstDay = fromCalendarDate({ ...target, day: 1 }, calendar);
  const targetMonth = getCalendarDate(firstDay, calendar);
  return fromCalendarDate(
    { ...targetMonth, day: Math.min(source.day, targetMonth.daysInMonth) },
    calendar
  );
}

function stepVariableCalendarMonth(
  date: CalendarDate,
  calendar: 'persian' | 'islamic-civil' | 'hebrew',
  direction: -1 | 1
): CalendarDate {
  if (direction > 0 && date.month < date.monthsInYear) {
    return { ...date, month: date.month + 1 };
  }
  if (direction < 0 && date.month > 1) {
    return { ...date, month: date.month - 1 };
  }

  if (calendar === 'hebrew') {
    const nextYear = date.year + direction;
    const firstDay = fromCalendarDate(
      { ...date, year: nextYear, month: 1, day: 1 },
      calendar
    );
    const nextYearDate = getCalendarDate(firstDay, calendar);
    return {
      ...nextYearDate,
      month: direction > 0 ? 1 : nextYearDate.monthsInYear,
    };
  }

  const nextYear = shiftSignedCalendarYear(
    getSignedCalendarYear(date),
    direction
  );
  return {
    ...setSignedCalendarYear(date, calendar, nextYear),
    month: direction > 0 ? 1 : 12,
  };
}

export function addCalendarMonths(
  date: IsoDate,
  calendar: DateCalendar,
  amount: number
): IsoDate {
  if (!Number.isInteger(amount)) {
    throw new RangeError(
      'amount must be an integer number of calendar months.'
    );
  }
  if (
    calendar === 'gregory' ||
    calendar === 'buddhist' ||
    calendar === 'roc' ||
    calendar === 'japanese'
  ) {
    return addIsoMonths(date, amount);
  }

  const source = getCalendarDate(date, calendar);
  let target = source;
  const direction = Math.sign(amount) as -1 | 0 | 1;
  for (let step = 0; step < Math.abs(amount); step += 1) {
    target = stepVariableCalendarMonth(target, calendar, direction as -1 | 1);
    const targetFirstDay = fromCalendarDate({ ...target, day: 1 }, calendar);
    target = getCalendarDate(targetFirstDay, calendar);
  }
  return direction === 0 ? date : clampCalendarDay(source, target, calendar);
}

export function addCalendarYears(
  date: IsoDate,
  calendar: DateCalendar,
  amount: number
): IsoDate {
  if (!Number.isInteger(amount)) {
    throw new RangeError('amount must be an integer number of calendar years.');
  }
  if (
    calendar === 'gregory' ||
    calendar === 'buddhist' ||
    calendar === 'roc' ||
    calendar === 'japanese'
  ) {
    return addIsoYears(date, amount);
  }

  const source = getCalendarDate(date, calendar);
  let target: CalendarDate;
  if (calendar === 'hebrew') {
    const firstDay = fromCalendarDate(
      { ...source, year: source.year + amount, month: 1, day: 1 },
      calendar
    );
    const targetYear = getCalendarDate(firstDay, calendar);
    target = {
      ...targetYear,
      month: Math.min(source.month, targetYear.monthsInYear),
    };
  } else {
    const targetYear = shiftSignedCalendarYear(
      getSignedCalendarYear(source),
      amount
    );
    target = setSignedCalendarYear(source, calendar, targetYear);
  }
  return amount === 0 ? date : clampCalendarDay(source, target, calendar);
}
