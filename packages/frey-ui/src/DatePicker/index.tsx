import React from 'react';
import Button from '../Button';
import Calendar from '../Calendar';
import {
  DateFieldControl,
  type DateFieldProps,
} from '../DateField';
import Field from '../Field';
import { CalendarIcon } from '../Icons/CalendarIcon';
import Popover from '../Popover';
import {
  parseDateValue,
  serializeDateValue,
  validateDateCalendar,
  validateDateConstraints,
} from '../date/dateEngine';
import { formatDateValue } from '../date/dateLocale';
import type {
  DateSegment,
  DateValue,
  FirstDayOfWeek,
} from '../date/types';
import { useDateLocale } from '../date/useDateLocale';
import { useControllableValue } from '../hooks/useControllableState';
import styles from './datepicker.module.css';

export type DatePickerProps = DateFieldProps & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultFocusedValue?: DateValue;
  today?: DateValue;
  firstDayOfWeek?: FirstDayOfWeek;
  calendarLabel?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  getCalendarButtonLabel?: (formattedValue: string | null) => string;
};

type DatePickerComponent = React.ForwardRefExoticComponent<
  Readonly<DatePickerProps> & React.RefAttributes<HTMLDivElement>
>;

const DatePicker: DatePickerComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DatePickerProps>
>(function DatePicker(
  {
    label,
    value,
    defaultValue = null,
    onValueChange,
    minValue,
    maxValue,
    isDateUnavailable,
    locale,
    calendar: calendarProp = 'gregory',
    segmentLabels,
    showClearButton,
    clearButtonLabel,
    hideLabel = false,
    helperText,
    error,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    id,
    className,
    style,
    controlClassName,
    controlStyle,
    open,
    defaultOpen = false,
    onOpenChange,
    defaultFocusedValue,
    today,
    firstDayOfWeek,
    calendarLabel,
    previousMonthLabel,
    nextMonthLabel,
    getCalendarButtonLabel,
  },
  ref
) {
  const calendar = validateDateCalendar(calendarProp);
  const resolvedLocale = useDateLocale(locale);
  const parsedDefaultValue =
    defaultValue === null
      ? null
      : serializeDateValue(parseDateValue(defaultValue, 'defaultValue'));
  const parsedControlledValue =
    value === undefined
      ? undefined
      : value === null
        ? null
        : serializeDateValue(parseDateValue(value, 'value'));
  validateDateConstraints(minValue, maxValue);
  if (defaultFocusedValue !== undefined) {
    parseDateValue(defaultFocusedValue, 'defaultFocusedValue');
  }
  if (today !== undefined) parseDateValue(today, 'today');

  const [selectedValue, setSelectedValue] =
    useControllableValue<DateValue | null>(
      parsedControlledValue,
      parsedDefaultValue,
      onValueChange
    );
  const [currentOpen, setCurrentOpen] = useControllableValue(
    open,
    defaultOpen,
    onOpenChange
  );
  const effectiveOpen = !disabled && currentOpen;
  const calendarTriggerRef = React.useRef<HTMLElement | null>(null);
  const wasOpenRef = React.useRef(effectiveOpen);
  React.useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = effectiveOpen;

    if (wasOpen && !effectiveOpen) {
      // Outside dismissal starts on pointer-down; wait through that pointer
      // sequence before restoring focus to the trigger.
      let focusFrame = 0;
      const settleFrame = requestAnimationFrame(() => {
        focusFrame = requestAnimationFrame(() => {
          calendarTriggerRef.current?.focus();
        });
      });
      return () => {
        cancelAnimationFrame(settleFrame);
        cancelAnimationFrame(focusFrame);
      };
    }
  }, [effectiveOpen]);
  const formattedValue = React.useMemo(
    () =>
      selectedValue
        ? formatDateValue(selectedValue, resolvedLocale, calendar)
        : null,
    [calendar, resolvedLocale, selectedValue]
  );
  const triggerLabel = getCalendarButtonLabel
    ? getCalendarButtonLabel(formattedValue)
    : formattedValue
      ? `Change date, ${formattedValue}`
      : 'Choose date';
  const resolvedCalendarLabel = calendarLabel ?? `${label} calendar`;
  const initialFocusRef = React.useRef<HTMLElement | null>(null);
  const setCalendarRootRef = React.useCallback((node: HTMLDivElement | null) => {
    initialFocusRef.current =
      node?.querySelector<HTMLButtonElement>(
        'button[data-date-value][tabindex="0"]'
      ) ?? null;
  }, []);

  function handleOpenChange(nextOpen: boolean): void {
    setCurrentOpen(nextOpen);
  }

  function handleSegmentKeyDown(
    _segment: DateSegment,
    event: React.KeyboardEvent<HTMLInputElement>
  ): void {
    if (!event.altKey) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      handleOpenChange(true);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      handleOpenChange(false);
    }
  }

  function handleCalendarValueChange(nextValue: DateValue | null): void {
    setSelectedValue(nextValue);
    handleOpenChange(false);
  }

  return (
    <Field
      label={label}
      labelElement='span'
      hideLabel={hideLabel}
      helperText={helperText}
      error={error}
      disabled={disabled}
      required={required}
      id={id}
      className={className}
      style={style}
    >
      {({ inputId, labelId, describedBy, hasError }) => (
        <Popover open={effectiveOpen} onOpenChange={handleOpenChange}>
          <DateFieldControl
            ref={ref}
            value={selectedValue}
            onValueChange={setSelectedValue}
            minValue={minValue}
            maxValue={maxValue}
            isDateUnavailable={isDateUnavailable}
            locale={resolvedLocale}
            calendar={calendar}
            segmentLabels={segmentLabels}
            showClearButton={showClearButton}
            clearButtonLabel={clearButtonLabel}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            name={name}
            controlClassName={controlClassName}
            controlStyle={controlStyle}
            inputId={inputId}
            labelId={labelId}
            describedBy={describedBy}
            hasConsumerError={hasError}
            onSegmentKeyDown={handleSegmentKeyDown}
            endAdornment={
              <Popover.Trigger ref={calendarTriggerRef} asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className={styles.calendar_trigger}
                  aria-label={triggerLabel}
                  disabled={disabled}
                >
                  <CalendarIcon size='sm' />
                </Button>
              </Popover.Trigger>
            }
          />
          <Popover.Content
            role='dialog'
            aria-modal='true'
            aria-label={resolvedCalendarLabel}
            initialFocusRef={initialFocusRef}
            className={styles.popover_content}
          >
            <Calendar
              ref={setCalendarRootRef}
              label={resolvedCalendarLabel}
              value={selectedValue}
              onValueChange={handleCalendarValueChange}
              defaultFocusedValue={defaultFocusedValue}
              today={today}
              minValue={minValue}
              maxValue={maxValue}
              isDateUnavailable={isDateUnavailable}
              locale={resolvedLocale}
              calendar={calendar}
              firstDayOfWeek={firstDayOfWeek}
              previousMonthLabel={previousMonthLabel}
              nextMonthLabel={nextMonthLabel}
              disabled={disabled}
              readOnly={readOnly}
              className={styles.calendar}
            />
          </Popover.Content>
        </Popover>
      )}
    </Field>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
