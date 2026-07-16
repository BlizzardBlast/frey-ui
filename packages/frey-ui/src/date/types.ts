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

export type IsoDate = Readonly<{
  year: number;
  month: number;
  day: number;
}>;

export type CalendarDate = Readonly<{
  era: string;
  year: number;
  month: number;
  monthCode: string;
  day: number;
  monthsInYear: number;
  daysInMonth: number;
  relatedYear: number;
  relatedMonth: number;
  relatedDay: number;
}>;
