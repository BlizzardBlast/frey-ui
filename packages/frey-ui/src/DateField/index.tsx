import clsx from 'clsx';
import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import Field from '../Field';
import { CloseIcon } from '../Icons/CloseIcon';
import {
  getCalendarDate,
  isDateWithinConstraints,
  parseDateValue,
  validateDateCalendar,
  validateDateConstraints,
} from '../date/dateEngine';
import {
  getCalendarEraOptions,
  getDateSegmentLayout,
  getLocaleDirection,
} from '../date/dateLocale';
import type {
  DateCalendar,
  DateSegment,
  DateSegmentLabels,
  DateValue,
  IsoDate,
} from '../date/types';
import { useDateLocale } from '../date/useDateLocale';
import { useControllableValue } from '../hooks/useControllableState';
import { DateFieldSegments } from './DateFieldSegments';
import {
  createDateDraftEdit,
  normalizeDateFieldValue,
  parseDateFieldPaste,
  resolveDateDraftValue,
  resolveDateFieldKeyCommand,
  stepDateDraft,
  type DateFieldKeyCommand,
} from './dateFieldInteractions';
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

function isCommittedDateSelectable(
  value: DateValue | null,
  minDate: IsoDate | undefined,
  maxDate: IsoDate | undefined,
  isDateUnavailable: ((value: DateValue) => boolean) | undefined
): boolean {
  if (value === null) return true;
  return (
    isDateWithinConstraints(parseDateValue(value), minDate, maxDate) &&
    !isDateUnavailable?.(value)
  );
}

function hasDateFieldInternalError(
  committedValue: DateValue | null,
  required: boolean,
  draftChanged: boolean,
  draftValue: DateValue | null | undefined,
  draftSelectable: boolean,
  committedSelectable: boolean
): boolean {
  return (
    (!committedValue && required && !draftChanged) ||
    !committedSelectable ||
    (draftChanged && draftValue !== null && !draftSelectable)
  );
}

function shouldShowClearButton(
  requested: boolean,
  required: boolean,
  disabled: boolean,
  readOnly: boolean,
  committedValue: DateValue | null
): boolean {
  return (
    requested && !required && !disabled && !readOnly && committedValue !== null
  );
}

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
  const parsedDefaultValue = normalizeDateFieldValue(
    defaultValue,
    'defaultValue'
  );
  const parsedControlledValue = normalizeDateFieldValue(value, 'value');
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
  const resolvedDraftValue = resolveDateDraftValue({
    draft,
    locale: resolvedLocale,
    calendar,
    minDate,
    maxDate,
    isDateUnavailable,
  });
  const draftIsoDate =
    typeof draftValue === 'string' ? parseDateValue(draftValue) : undefined;
  const draftSelectable = typeof resolvedDraftValue === 'string';
  const committedDate = committedValue
    ? parseDateValue(committedValue)
    : undefined;
  const committedSelectable = isCommittedDateSelectable(
    committedValue,
    minDate,
    maxDate,
    isDateUnavailable
  );
  const referenceCalendarDate = getCalendarDate(
    draftIsoDate ?? committedDate ?? parseDateValue(TEMPLATE_VALUE),
    calendar
  );
  const hasInternalError = hasDateFieldInternalError(
    committedValue,
    required,
    draftChanged,
    draftValue,
    draftSelectable,
    committedSelectable
  );
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
    const edit = createDateDraftEdit({
      draft,
      segment,
      nextValue,
      locale: resolvedLocale,
      eraOptions,
    });
    if (edit.shouldApply) applyDraft(edit.draft);
    else dispatch({ type: 'replace', draft: edit.draft });
  }

  function applyDraft(nextDraft: DateDraft): void {
    const nextValue = resolveDateDraftValue({
      draft: nextDraft,
      locale: resolvedLocale,
      calendar,
      minDate,
      maxDate,
      isDateUnavailable,
    });
    if (nextValue === undefined) {
      dispatch({ type: 'replace', draft: nextDraft });
      return;
    }
    setCommittedValue(nextValue);
    replaceWithCommitted(nextValue);
  }

  function executeKeyCommand(
    command: DateFieldKeyCommand,
    currentSegment: DateSegment
  ): void {
    switch (command.type) {
      case 'move':
        if (command.target === currentSegment) return;
        dispatch({ type: 'set-active', segment: command.target });
        segmentInputRefs.current[command.target]?.focus();
        return;
      case 'restore':
        dispatch({ type: 'replace', draft: baselineDraft });
        return;
      case 'clear':
        handleSegmentChange(currentSegment, '');
        return;
      case 'step': {
        const nextDraft = stepDateDraft({
          draft,
          segment: command.segment,
          amount: command.amount,
          calendar,
          locale: resolvedLocale,
          layout,
          eraOptions,
        });
        if (nextDraft) applyDraft(nextDraft);
      }
    }
  }

  function handleSegmentKeyDown(
    segment: DateSegment,
    event: React.KeyboardEvent<HTMLInputElement>
  ): void {
    onSegmentKeyDown?.(segment, event);
    if (event.defaultPrevented) return;
    const command = resolveDateFieldKeyCommand({
      key: event.key,
      segment,
      direction,
      visibleSegments,
      editable: !disabled && !readOnly,
    });
    if (!command) return;
    event.preventDefault();
    executeKeyCommand(command, segment);
  }

  function handleSegmentPaste(
    _segment: DateSegment,
    event: React.ClipboardEvent<HTMLInputElement>
  ): void {
    if (disabled || readOnly) return;
    const text = event.clipboardData.getData('text');
    const nextDraft = parseDateFieldPaste({
      text,
      draft,
      calendar,
      locale: resolvedLocale,
      layout,
      eraOptions,
    });
    if (!nextDraft) return;

    event.preventDefault();
    applyDraft(nextDraft);
  }

  function handleClear(): void {
    setCommittedValue(null);
    replaceWithCommitted(null, firstVisibleSegment);
    firstInputRef.current?.focus();
  }

  function handleInputRef(
    segment: DateSegment,
    node: HTMLInputElement | null
  ): void {
    if (node) segmentInputRefs.current[segment] = node;
    if (segment === firstVisibleSegment) firstInputRef.current = node;
  }

  const formValue =
    draftChanged && !draftSelectable ? '' : (committedValue ?? '');
  const showClear = shouldShowClearButton(
    showClearButton,
    required,
    disabled,
    readOnly,
    committedValue
  );

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
        <DateFieldSegments
          layout={layout}
          draft={draft}
          segmentLabels={segmentLabels}
          locale={resolvedLocale}
          calendarDate={referenceCalendarDate}
          eraOptions={eraOptions}
          firstVisibleSegment={firstVisibleSegment}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          invalid={invalid}
          onInputRef={handleInputRef}
          onFocus={(segment) => dispatch({ type: 'set-active', segment })}
          onChange={handleSegmentChange}
          onKeyDown={handleSegmentKeyDown}
          onPaste={handleSegmentPaste}
        />

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
