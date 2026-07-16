import clsx from 'clsx';
import React from 'react';
import Button from '../Button';
import { parseDateValue, serializeDateValue, validateDateCalendar, validateDateConstraints } from '../date/dateEngine';
import { getLocaleDirection } from '../date/dateLocale';
import type {
  DateCalendar,
  DateValue,
  FirstDayOfWeek,
} from '../date/types';
import { useDateLocale } from '../date/useDateLocale';
import { ChevronDownIcon } from '../Icons/ChevronDownIcon';
import { useControllableValue } from '../hooks/useControllableState';
import {
  calendarStateReducer,
  canSelectCalendarCell,
  createCalendarGridModel,
  createCalendarState,
  getHorizontalDayDelta,
  moveCalendarFocus,
  resolveInitialCalendarFocus,
  type CalendarCellModel,
  type CalendarFocusMovement,
  type CalendarState,
  type CalendarStateAction,
} from './calendarModel';
import styles from './calendar.module.css';

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

type SourcedCalendarState = Readonly<{
  sourceKey: string;
  calendarState: CalendarState;
  focusRequestId: number;
}>;

type SourcedCalendarAction = Readonly<{
  sourceKey: string;
  baseState: CalendarState;
  action: CalendarStateAction;
  focusDay: boolean;
}>;

function sourcedCalendarReducer(
  state: SourcedCalendarState,
  action: SourcedCalendarAction
): SourcedCalendarState {
  return {
    sourceKey: action.sourceKey,
    calendarState: calendarStateReducer(action.baseState, action.action),
    focusRequestId: action.focusDay
      ? state.focusRequestId + 1
      : state.focusRequestId,
  };
}

function getLocalTodayValue(): DateValue {
  const today = new Date();
  return serializeDateValue({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  });
}

type CalendarDayCellProps = Readonly<{
  cell: CalendarCellModel;
  onActivate: (cell: CalendarCellModel) => void;
  onKeyDown: (
    event: React.KeyboardEvent<HTMLButtonElement>,
    cell: CalendarCellModel & Readonly<{ value: DateValue }>
  ) => void;
  setButtonRef: (value: DateValue, node: HTMLButtonElement | null) => void;
}>;

function CalendarDayCell({
  cell,
  onActivate,
  onKeyDown,
  setButtonRef,
}: CalendarDayCellProps): React.JSX.Element {
  if (cell.value === null) {
    return (
      <td
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: APG gridcell semantics belong on the semantic table cell
        role='gridcell'
        tabIndex={-1}
        aria-disabled='true'
        className={styles.calendar_cell}
        data-outside-supported-range=''
      />
    );
  }
  const supportedCell = cell as CalendarCellModel &
    Readonly<{ value: DateValue }>;

  return (
    <td
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: APG gridcell semantics belong on the semantic table cell
      role='gridcell'
      tabIndex={-1}
      aria-selected={cell.isSelected || undefined}
      aria-disabled={cell.isDisabled || undefined}
      className={styles.calendar_cell}
    >
      <button
        ref={(node) => setButtonRef(supportedCell.value, node)}
        type='button'
        tabIndex={cell.isFocused && cell.isFocusable ? 0 : -1}
        aria-label={cell.accessibleLabel}
        aria-disabled={cell.isDisabled || undefined}
        className={clsx(styles.calendar_day, {
          [styles.calendar_day_adjacent]: cell.isAdjacentMonth,
          [styles.calendar_day_selected]: cell.isSelected,
          [styles.calendar_day_today]: cell.isToday,
          [styles.calendar_day_unavailable]: cell.isUnavailable,
          [styles.calendar_day_out_of_range]: cell.isOutOfRange,
        })}
        data-date-value={cell.value}
        data-adjacent-month={cell.isAdjacentMonth ? '' : undefined}
        data-selected={cell.isSelected ? '' : undefined}
        data-today={cell.isToday ? '' : undefined}
        data-unavailable={cell.isUnavailable ? '' : undefined}
        data-out-of-range={cell.isOutOfRange ? '' : undefined}
        onClick={() => onActivate(cell)}
        onKeyDown={(event) => onKeyDown(event, supportedCell)}
      >
        {cell.dayLabel}
      </button>
    </td>
  );
}

type CalendarComponent = React.ForwardRefExoticComponent<
  Readonly<CalendarProps> & React.RefAttributes<HTMLDivElement>
>;

const Calendar: CalendarComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<CalendarProps>
>(function Calendar(
  {
    label,
    value,
    defaultValue,
    onValueChange,
    defaultFocusedValue,
    today,
    minValue,
    maxValue,
    isDateUnavailable,
    locale,
    calendar = 'gregory',
    firstDayOfWeek,
    previousMonthLabel = 'Previous month',
    nextMonthLabel = 'Next month',
    disabled = false,
    readOnly = false,
    className,
    style,
  },
  ref
) {
  const resolvedLocale = useDateLocale(locale);
  const resolvedCalendar = validateDateCalendar(calendar);
  if (value !== undefined && value !== null) parseDateValue(value, 'value');
  if (defaultValue !== undefined && defaultValue !== null) {
    parseDateValue(defaultValue, 'defaultValue');
  }
  if (defaultFocusedValue !== undefined) {
    parseDateValue(defaultFocusedValue, 'defaultFocusedValue');
  }
  if (today !== undefined) parseDateValue(today, 'today');
  validateDateConstraints(minValue, maxValue);

  const resolvedToday = today ?? getLocalTodayValue();
  const [selectedValue, setSelectedValue] = useControllableValue<
    DateValue | null
  >(value, defaultValue ?? null, onValueChange);
  const initialFocusedValue = resolveInitialCalendarFocus({
    value: selectedValue,
    defaultFocusedValue,
    today: resolvedToday,
    minValue,
    maxValue,
  });
  const sourceKey = [
    resolvedCalendar,
    resolvedLocale,
    firstDayOfWeek ?? 'locale-week-start',
    selectedValue ?? 'empty',
    defaultFocusedValue ?? '',
    resolvedToday,
    minValue ?? '',
    maxValue ?? '',
  ].join('|');
  const initialState: SourcedCalendarState = {
    sourceKey,
    calendarState: createCalendarState(initialFocusedValue, resolvedCalendar),
    focusRequestId: 0,
  };
  const [storedState, dispatch] = React.useReducer(
    sourcedCalendarReducer,
    initialState
  );
  const calendarState =
    storedState.sourceKey === sourceKey
      ? storedState.calendarState
      : initialState.calendarState;
  const direction = getLocaleDirection(resolvedLocale);
  const model = React.useMemo(
    () =>
      createCalendarGridModel({
        focusedValue: calendarState.focusedValue,
        visibleMonthValue: calendarState.visibleMonthValue,
        selectedValue,
        todayValue: resolvedToday,
        minValue,
        maxValue,
        isDateUnavailable,
        locale: resolvedLocale,
        calendar: resolvedCalendar,
        firstDayOfWeek,
        disabled,
        readOnly,
      }),
    [
      calendarState.focusedValue,
      calendarState.visibleMonthValue,
      selectedValue,
      resolvedToday,
      minValue,
      maxValue,
      isDateUnavailable,
      resolvedLocale,
      resolvedCalendar,
      firstDayOfWeek,
      disabled,
      readOnly,
    ]
  );
  const headingId = React.useId();
  const buttonRefs = React.useRef(new Map<DateValue, HTMLButtonElement>());
  const handledFocusRequestRef = React.useRef(0);

  React.useLayoutEffect(() => {
    if (handledFocusRequestRef.current === storedState.focusRequestId) return;
    handledFocusRequestRef.current = storedState.focusRequestId;
    buttonRefs.current.get(calendarState.focusedValue)?.focus();
  }, [calendarState.focusedValue, storedState.focusRequestId]);

  const setButtonRef = React.useCallback(
    (dateValue: DateValue, node: HTMLButtonElement | null) => {
      if (node) buttonRefs.current.set(dateValue, node);
      else buttonRefs.current.delete(dateValue);
    },
    []
  );

  const transition = React.useCallback(
    (
      action: CalendarStateAction,
      focusDay: boolean,
      baseState: CalendarState = calendarState
    ) => {
      dispatch({ sourceKey, baseState, action, focusDay });
    },
    [sourceKey, calendarState]
  );

  const moveFocus = React.useCallback(
    (
      movement: CalendarFocusMovement,
      focusDay: boolean,
      fromValue: DateValue = calendarState.focusedValue
    ) => {
      const baseState =
        fromValue === calendarState.focusedValue
          ? calendarState
          : createCalendarState(fromValue, resolvedCalendar);
      transition(
        {
          type: 'move-focus',
          movement,
          calendar: resolvedCalendar,
          firstDayOfWeek: model.firstDayOfWeek,
        },
        focusDay,
        baseState
      );
    },
    [
      transition,
      calendarState,
      resolvedCalendar,
      model.firstDayOfWeek,
    ]
  );

  const activateCell = React.useCallback(
    (cell: CalendarCellModel) => {
      if (!canSelectCalendarCell(cell) || cell.value === selectedValue) return;
      setSelectedValue(cell.value);
      transition(
        {
          type: 'set-focused-value',
          value: cell.value,
          calendar: resolvedCalendar,
        },
        false
      );
    },
    [selectedValue, setSelectedValue, transition, resolvedCalendar]
  );

  const handleDayKeyDown = React.useCallback(
    (
      event: React.KeyboardEvent<HTMLButtonElement>,
      cell: CalendarCellModel & Readonly<{ value: DateValue }>
    ) => {
      if (disabled) return;
      let movement: CalendarFocusMovement | undefined;
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          movement = {
            unit: 'day',
            amount: getHorizontalDayDelta(event.key, direction),
          };
          break;
        case 'ArrowUp':
          movement = { unit: 'week', amount: -1 };
          break;
        case 'ArrowDown':
          movement = { unit: 'week', amount: 1 };
          break;
        case 'Home':
          movement = { unit: 'week-start' };
          break;
        case 'End':
          movement = { unit: 'week-end' };
          break;
        case 'PageUp':
          movement = {
            unit: event.shiftKey ? 'year' : 'month',
            amount: -1,
          };
          break;
        case 'PageDown':
          movement = {
            unit: event.shiftKey ? 'year' : 'month',
            amount: 1,
          };
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          activateCell(cell);
          return;
        default:
          return;
      }

      event.preventDefault();
      moveFocus(movement, true, cell.value);
    },
    [activateCell, direction, disabled, moveFocus]
  );

  const previousFocusedValue = moveCalendarFocus(
    calendarState.focusedValue,
    { unit: 'month', amount: -1 },
    { calendar: resolvedCalendar, firstDayOfWeek: model.firstDayOfWeek }
  );
  const nextFocusedValue = moveCalendarFocus(
    calendarState.focusedValue,
    { unit: 'month', amount: 1 },
    { calendar: resolvedCalendar, firstDayOfWeek: model.firstDayOfWeek }
  );
  const rows = Array.from({ length: 6 }, (_, rowIndex) =>
    model.cells.slice(rowIndex * 7, rowIndex * 7 + 7)
  );

  return (
    <div
      ref={ref}
      dir={direction}
      className={clsx(styles.calendar, className)}
      style={style}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
    >
      <div className={styles.calendar_header}>
        <Button
          variant='ghost'
          size='sm'
          className={styles.calendar_navigation_button}
          aria-label={previousMonthLabel}
          disabled={
            disabled || previousFocusedValue === calendarState.focusedValue
          }
          onClick={() => moveFocus({ unit: 'month', amount: -1 }, false)}
        >
          <ChevronDownIcon className={styles.calendar_previous_icon} />
        </Button>
        <h2
          id={headingId}
          className={styles.calendar_heading}
          aria-live='polite'
          aria-atomic='true'
        >
          {model.heading}
        </h2>
        <Button
          variant='ghost'
          size='sm'
          className={styles.calendar_navigation_button}
          aria-label={nextMonthLabel}
          disabled={disabled || nextFocusedValue === calendarState.focusedValue}
          onClick={() => moveFocus({ unit: 'month', amount: 1 }, false)}
        >
          <ChevronDownIcon className={styles.calendar_next_icon} />
        </Button>
      </div>
      <table
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: APG enhances the semantic date table as a grid
        role='grid'
        aria-label={label}
        aria-describedby={headingId}
        className={styles.calendar_grid}
      >
        <thead>
          <tr>
            {model.weekdayLabels.map((weekday) => (
              <th key={weekday.long} scope='col' className={styles.calendar_weekday}>
                <abbr title={weekday.long}>{weekday.short}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`week-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <CalendarDayCell
                  key={cell.value ?? `outside-${rowIndex}-${cellIndex}`}
                  cell={cell}
                  onActivate={activateCell}
                  onKeyDown={handleDayKeyDown}
                  setButtonRef={setButtonRef}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

Calendar.displayName = 'Calendar';

export default Calendar;
