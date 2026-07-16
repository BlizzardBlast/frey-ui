import clsx from 'clsx';
import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import Field from '../Field';
import { CloseIcon } from '../Icons/CloseIcon';
import {
  addCalendarMonths,
  addCalendarYears,
  addIsoDays,
  getCalendarDate,
  isDateWithinConstraints,
  parseDateValue,
  serializeDateValue,
  validateDateCalendar,
  validateDateConstraints,
} from '../date/dateEngine';
import {
  getCalendarEraOptions,
  getDateSegmentLayout,
  getLocaleDirection,
  normalizeLocalizedDigits,
} from '../date/dateLocale';
import type {
  DateCalendar,
  DateSegment,
  DateSegmentLabels,
  DateValue,
} from '../date/types';
import { useDateLocale } from '../date/useDateLocale';
import { useControllableValue } from '../hooks/useControllableState';
import { DateSegmentInput } from './DateSegmentInput';
import {
  areValuesEqual,
  createDraft,
  draftReducer,
  getDraftValue,
  getSourceKey,
  TEMPLATE_VALUE,
  type DateDraft,
} from './dateFieldState';
import styles from './datefield.module.css';

export type DateFieldProps = {
  label: string;
  value?: DateValue | null;
  defaultValue?: DateValue | null;
  onValueChange?: (value: DateValue | null) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (value: DateValue) => boolean;
  locale?: string;
  calendar?: DateCalendar;
  segmentLabels?: DateSegmentLabels;
  showClearButton?: boolean;
  clearButtonLabel?: string;
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  controlClassName?: string;
  controlStyle?: React.CSSProperties;
};

const DEFAULT_SEGMENT_LABELS: Record<DateSegment, string> = {
  era: 'Era',
  year: 'Year',
  month: 'Month',
  day: 'Day',
};

export type DateFieldControlProps = Omit<
  DateFieldProps,
  'label' | 'hideLabel' | 'helperText' | 'error' | 'id' | 'className' | 'style'
> & {
  inputId: string;
  labelId: string;
  describedBy?: string;
  hasConsumerError: boolean;
  endAdornment?: React.ReactNode;
  onSegmentKeyDown?: (
    segment: DateSegment,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => void;
};

type DateFieldControlComponent = React.ForwardRefExoticComponent<
  Readonly<DateFieldControlProps> & React.RefAttributes<HTMLDivElement>
>;

export const DateFieldControl: DateFieldControlComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DateFieldControlProps>
>(function DateFieldControl(
  {
    value,
    defaultValue = null,
    onValueChange,
    minValue,
    maxValue,
    isDateUnavailable,
    locale,
    calendar: calendarProp = 'gregory',
    segmentLabels,
    showClearButton = true,
    clearButtonLabel = 'Clear date',
    disabled = false,
    readOnly = false,
    required = false,
    name,
    controlClassName,
    controlStyle,
    inputId,
    labelId,
    describedBy,
    hasConsumerError,
    endAdornment,
    onSegmentKeyDown,
  },
  ref
) {
  const calendar = validateDateCalendar(calendarProp);
  const resolvedLocale = useDateLocale(locale);
  const layout = useMemo(
    () => getDateSegmentLayout(TEMPLATE_VALUE, resolvedLocale, calendar),
    [calendar, resolvedLocale]
  );
  const eraOptions = useMemo(
    () => getCalendarEraOptions(resolvedLocale, calendar),
    [calendar, resolvedLocale]
  );
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
  const { minDate, maxDate } = validateDateConstraints(minValue, maxValue);
  const [committedValue, setCommittedValue] =
    useControllableValue<DateValue | null>(
      parsedControlledValue,
      parsedDefaultValue,
      onValueChange
    );
  const sourceKey = getSourceKey(committedValue, calendar, resolvedLocale);
  const [storedDraft, dispatch] = useReducer(
    draftReducer,
    committedValue,
    (initialValue) =>
      createDraft(initialValue, calendar, resolvedLocale, layout, eraOptions)
  );
  const baselineDraft = useMemo(
    () =>
      createDraft(committedValue, calendar, resolvedLocale, layout, eraOptions),
    [calendar, committedValue, eraOptions, layout, resolvedLocale]
  );
  const draft =
    storedDraft.sourceKey === sourceKey ? storedDraft : baselineDraft;
  const draftChanged = !areValuesEqual(draft.values, baselineDraft.values);
  const draftValue = getDraftValue(draft, resolvedLocale, calendar);
  const draftIsoDate =
    typeof draftValue === 'string' ? parseDateValue(draftValue) : undefined;
  const draftSelectable =
    draftIsoDate !== undefined &&
    isDateWithinConstraints(draftIsoDate, minDate, maxDate) &&
    !isDateUnavailable?.(draftValue as DateValue);
  const committedDate = committedValue
    ? parseDateValue(committedValue)
    : undefined;
  const committedSelectable =
    committedDate === undefined ||
    (isDateWithinConstraints(committedDate, minDate, maxDate) &&
      !isDateUnavailable?.(committedValue as DateValue));
  const referenceCalendarDate = getCalendarDate(
    draftIsoDate ?? committedDate ?? parseDateValue(TEMPLATE_VALUE),
    calendar
  );
  const hasInternalError =
    (!committedValue && required && !draftChanged) ||
    !committedSelectable ||
    (draftChanged && draftValue !== null && !draftSelectable);
  const invalid = hasConsumerError || hasInternalError;
  const firstInputRef = useRef<HTMLInputElement>(null);
  const segmentInputRefs = useRef<
    Partial<Record<DateSegment, HTMLInputElement>>
  >({});
  const direction = getLocaleDirection(resolvedLocale);

  useEffect(() => {
    firstInputRef.current?.setCustomValidity(
      hasInternalError ? 'Enter a complete, valid, available date.' : ''
    );
  }, [hasInternalError]);

  const visibleSegments = layout
    .filter((part) => part.kind === 'segment')
    .map((part) => part.type);
  const firstVisibleSegment = visibleSegments[0] as DateSegment;

  function replaceWithCommitted(
    nextValue: DateValue | null,
    activeSegment = draft.activeSegment
  ): void {
    const replacement = createDraft(
      nextValue,
      calendar,
      resolvedLocale,
      layout,
      eraOptions
    );
    dispatch({
      type: 'replace',
      draft: { ...replacement, activeSegment },
    });
  }

  function handleSegmentChange(segment: DateSegment, nextValue: string): void {
    if (disabled || readOnly) return;
    if (segment === 'era') {
      if (nextValue.length === 0) {
        applyDraft({
          ...draft,
          values: { ...draft.values, era: '' },
          eraTypeahead: '',
        });
        return;
      }
      const appendedValue = nextValue.startsWith(draft.values.era)
        ? nextValue.slice(draft.values.era.length)
        : nextValue;
      const typeahead = `${draft.eraTypeahead}${appendedValue}`;
      const normalizedQuery = typeahead
        .trim()
        .toLocaleLowerCase(resolvedLocale);
      const matchedEras = eraOptions.filter((option) =>
        option.label
          .toLocaleLowerCase(resolvedLocale)
          .startsWith(normalizedQuery)
      );
      const matchedEra = matchedEras[0];
      const nextDraft: DateDraft = {
        ...draft,
        eraId: matchedEra?.id ?? draft.eraId,
        values: {
          ...draft.values,
          era: matchedEra?.label ?? nextValue,
        },
        eraTypeahead: typeahead,
      };
      if (matchedEras.length === 1) {
        applyDraft(nextDraft);
      } else {
        dispatch({ type: 'replace', draft: nextDraft });
      }
      return;
    }
    const normalizedValue = Array.from(nextValue)
      .filter((character) => {
        const normalizedCharacter = normalizeLocalizedDigits(
          character,
          resolvedLocale
        ).replace('−', '-');
        return segment === 'year'
          ? /^[0-9-]$/.test(normalizedCharacter)
          : /^[0-9]$/.test(normalizedCharacter);
      })
      .join('');
    const nextDraft = draftReducer(draft, {
      type: 'set-segment',
      segment,
      value: normalizedValue,
    });
    applyDraft(nextDraft);
  }

  function applyDraft(nextDraft: DateDraft): void {
    const nextDateValue = getDraftValue(nextDraft, resolvedLocale, calendar);

    if (nextDateValue === null) {
      setCommittedValue(null);
      replaceWithCommitted(null);
      return;
    }

    if (typeof nextDateValue === 'string') {
      const nextDate = parseDateValue(nextDateValue);
      const selectable =
        isDateWithinConstraints(nextDate, minDate, maxDate) &&
        !isDateUnavailable?.(nextDateValue);
      if (selectable) {
        setCommittedValue(nextDateValue);
        replaceWithCommitted(nextDateValue);
        return;
      }
    }

    dispatch({ type: 'replace', draft: nextDraft });
  }

  function handleSegmentKeyDown(
    segment: DateSegment,
    event: React.KeyboardEvent<HTMLInputElement>
  ): void {
    onSegmentKeyDown?.(segment, event);
    if (event.defaultPrevented) return;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const currentIndex = visibleSegments.indexOf(segment);
      const physicalDirection = event.key === 'ArrowRight' ? 1 : -1;
      const logicalDirection =
        direction === 'rtl' ? -physicalDirection : physicalDirection;
      const nextSegment = visibleSegments[currentIndex + logicalDirection];
      if (nextSegment) {
        dispatch({ type: 'set-active', segment: nextSegment });
        segmentInputRefs.current[nextSegment]?.focus();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      dispatch({ type: 'replace', draft: baselineDraft });
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (!disabled && !readOnly) {
        event.preventDefault();
        handleSegmentChange(segment, '');
      }
      return;
    }

    if (
      (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
      !disabled &&
      !readOnly
    ) {
      event.preventDefault();
      const amount = event.key === 'ArrowUp' ? 1 : -1;
      if (segment === 'era') {
        const currentIndex = eraOptions.findIndex(
          (option) => option.id === draft.eraId
        );
        const nextIndex =
          (currentIndex + amount + eraOptions.length) % eraOptions.length;
        const nextEra = eraOptions[nextIndex];
        applyDraft({
          ...draft,
          eraId: nextEra.id,
          values: { ...draft.values, era: nextEra.label },
          eraTypeahead: '',
        });
        return;
      }
      const currentValue = getDraftValue(draft, resolvedLocale, calendar);
      if (typeof currentValue !== 'string') return;

      try {
        const currentDate = parseDateValue(currentValue);
        const nextDate =
          segment === 'day'
            ? addIsoDays(currentDate, amount)
            : segment === 'month'
              ? addCalendarMonths(currentDate, calendar, amount)
              : addCalendarYears(currentDate, calendar, amount);
        applyDraft(
          createDraft(
            serializeDateValue(nextDate),
            calendar,
            resolvedLocale,
            layout,
            eraOptions
          )
        );
      } catch {
        // The supported ISO boundary is a hard stop for segment stepping.
      }
    }
  }

  function getLocalizedPasteDraft(text: string): DateDraft | null {
    const normalizedText = normalizeLocalizedDigits(
      text.trim(),
      resolvedLocale
    );
    let pattern = '^';
    const capturedSegments: DateSegment[] = [];
    for (const part of layout) {
      if (part.kind === 'literal') {
        pattern += part.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      } else {
        pattern += part.type === 'era' ? '(.+?)' : '([0-9−-]+)';
        capturedSegments.push(part.type);
      }
    }
    pattern += '$';
    const match = new RegExp(pattern).exec(normalizedText);
    if (!match) return null;

    let nextDraft = draft;
    for (const [index, segment] of capturedSegments.entries()) {
      const capturedValue = match[index + 1] as string;
      if (segment === 'era') {
        const matchedEra = eraOptions.find(
          (option) =>
            option.label.localeCompare(capturedValue, resolvedLocale, {
              sensitivity: 'base',
            }) === 0
        );
        if (!matchedEra) return null;
        nextDraft = {
          ...nextDraft,
          eraId: matchedEra.id,
          values: { ...nextDraft.values, era: matchedEra.label },
          eraTypeahead: '',
        };
        continue;
      }
      nextDraft = draftReducer(nextDraft, {
        type: 'set-segment',
        segment,
        value: capturedValue,
      });
    }
    return nextDraft;
  }

  function handleSegmentPaste(
    _segment: DateSegment,
    event: React.ClipboardEvent<HTMLInputElement>
  ): void {
    if (disabled || readOnly) return;
    const text = event.clipboardData.getData('text');
    let nextDraft: DateDraft | null = null;
    try {
      const isoValue = serializeDateValue(parseDateValue(text, 'pasted value'));
      nextDraft = createDraft(
        isoValue,
        calendar,
        resolvedLocale,
        layout,
        eraOptions
      );
    } catch {
      nextDraft = getLocalizedPasteDraft(text);
    }
    if (!nextDraft) return;

    event.preventDefault();
    applyDraft(nextDraft);
  }

  function handleClear(): void {
    setCommittedValue(null);
    replaceWithCommitted(null, firstVisibleSegment);
    firstInputRef.current?.focus();
  }

  const formValue =
    draftChanged && !draftSelectable ? '' : (committedValue ?? '');
  const showClear =
    showClearButton &&
    !required &&
    !disabled &&
    !readOnly &&
    committedValue !== null;

  return (
    <div
      ref={ref}
      id={inputId}
      dir={direction}
      className={clsx(
        styles.control,
        {
          [styles.control_invalid]: invalid,
          [styles.control_disabled]: disabled,
          [styles.control_readonly]: readOnly,
        },
        controlClassName
      )}
      style={controlStyle}
    >
      <fieldset
        className={styles.group}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      >
        <span className={styles.segments}>
          {layout.map((part, index) =>
            part.kind === 'literal' ? (
              <span
                // The localized literal and position form a stable layout key.
                key={`literal-${index}-${part.value}`}
                className={styles.separator}
                aria-hidden='true'
              >
                {part.value}
              </span>
            ) : (
              <DateSegmentInput
                key={part.type}
                segment={part.type}
                value={draft.values[part.type]}
                label={
                  segmentLabels?.[part.type] ??
                  DEFAULT_SEGMENT_LABELS[part.type]
                }
                tabIndex={draft.activeSegment === part.type ? 0 : -1}
                disabled={disabled}
                readOnly={readOnly}
                required={required && part.type === firstVisibleSegment}
                invalid={invalid}
                valueMin={
                  part.type === 'month' ||
                  part.type === 'day' ||
                  part.type === 'era'
                    ? 1
                    : undefined
                }
                valueMax={
                  part.type === 'month'
                    ? referenceCalendarDate.monthsInYear
                    : part.type === 'day'
                      ? referenceCalendarDate.daysInMonth
                      : part.type === 'era'
                        ? eraOptions.length
                        : undefined
                }
                valueNow={
                  part.type === 'era'
                    ? Math.max(
                        1,
                        eraOptions.findIndex(
                          (option) => option.id === draft.eraId
                        ) + 1
                      )
                    : Number.isInteger(
                          Number(
                            normalizeLocalizedDigits(
                              draft.values[part.type],
                              resolvedLocale
                            ).replace('−', '-')
                          )
                        ) && draft.values[part.type].length > 0
                      ? Number(
                          normalizeLocalizedDigits(
                            draft.values[part.type],
                            resolvedLocale
                          ).replace('−', '-')
                        )
                      : undefined
                }
                valueText={draft.values[part.type] || undefined}
                inputRef={(node) => {
                  if (node) segmentInputRefs.current[part.type] = node;
                  if (part.type === firstVisibleSegment) {
                    firstInputRef.current = node;
                  }
                }}
                onFocus={(segment) => dispatch({ type: 'set-active', segment })}
                onChange={handleSegmentChange}
                onKeyDown={handleSegmentKeyDown}
                onPaste={handleSegmentPaste}
              />
            )
          )}
        </span>

        {showClear && (
          <button
            type='button'
            className={styles.clear_button}
            aria-label={clearButtonLabel}
            onClick={handleClear}
          >
            <CloseIcon size='sm' aria-hidden='true' />
          </button>
        )}

        {endAdornment}

        {name && (
          <input
            type='hidden'
            name={name}
            value={formValue}
            disabled={disabled}
          />
        )}
      </fieldset>
    </div>
  );
});

DateFieldControl.displayName = 'DateFieldControl';

type DateFieldComponent = React.ForwardRefExoticComponent<
  Readonly<DateFieldProps> & React.RefAttributes<HTMLDivElement>
>;

const DateField: DateFieldComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DateFieldProps>
>(function DateField(
  {
    label,
    hideLabel = false,
    helperText,
    error,
    disabled = false,
    required = false,
    id,
    className,
    style,
    ...controlProps
  },
  ref
) {
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
        <DateFieldControl
          {...controlProps}
          ref={ref}
          inputId={inputId}
          labelId={labelId}
          describedBy={describedBy}
          hasConsumerError={hasError}
          disabled={disabled}
          required={required}
        />
      )}
    </Field>
  );
});

DateField.displayName = 'DateField';

export default DateField;
