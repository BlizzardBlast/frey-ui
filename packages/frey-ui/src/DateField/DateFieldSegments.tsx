import type React from 'react';
import { normalizeLocalizedDigits } from '../date/dateLocale';
import type {
  CalendarEraOption,
  DateSegmentLayoutPart,
} from '../date/dateLocale';
import type {
  CalendarDate,
  DateSegment,
  DateSegmentLabels,
} from '../date/types';
import { DateSegmentInput } from './DateSegmentInput';
import type { DateDraft } from './dateFieldState';
import styles from './datefield.module.css';

const DEFAULT_SEGMENT_LABELS: Record<DateSegment, string> = {
  era: 'Era',
  year: 'Year',
  month: 'Month',
  day: 'Day',
};

type DateSegmentAriaMetadata = Readonly<{
  valueMin?: number;
  valueMax?: number;
  valueNow?: number;
  valueText?: string;
}>;

type GetDateSegmentAriaMetadataOptions = Readonly<{
  segment: DateSegment;
  value: string;
  numericValue?: number;
  calendarDate: CalendarDate;
  eraOptions: readonly CalendarEraOption[];
  eraId: string;
}>;

function getDateSegmentAriaMetadata({
  segment,
  value,
  numericValue,
  calendarDate,
  eraOptions,
  eraId,
}: GetDateSegmentAriaMetadataOptions): DateSegmentAriaMetadata {
  const valueText = value || undefined;
  switch (segment) {
    case 'era':
      return {
        valueMin: 1,
        valueMax: eraOptions.length,
        valueNow: Math.max(
          1,
          eraOptions.findIndex((option) => option.id === eraId) + 1
        ),
        valueText,
      };
    case 'month':
      return {
        valueMin: 1,
        valueMax: calendarDate.monthsInYear,
        valueNow: numericValue,
        valueText,
      };
    case 'day':
      return {
        valueMin: 1,
        valueMax: calendarDate.daysInMonth,
        valueNow: numericValue,
        valueText,
      };
    case 'year':
      return { valueNow: numericValue, valueText };
  }
}

function getNumericSegmentValue(
  value: string,
  locale: string
): number | undefined {
  if (value.length === 0) return undefined;
  const numericValue = Number(
    normalizeLocalizedDigits(value, locale).replace('−', '-')
  );
  return Number.isInteger(numericValue) ? numericValue : undefined;
}

type DateFieldPartProps = Readonly<{
  part: DateSegmentLayoutPart;
  draft: DateDraft;
  segmentLabels?: DateSegmentLabels;
  locale: string;
  calendarDate: CalendarDate;
  eraOptions: readonly CalendarEraOption[];
  firstVisibleSegment: DateSegment;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  onInputRef: (segment: DateSegment, node: HTMLInputElement | null) => void;
  onFocus: (segment: DateSegment) => void;
  onChange: (segment: DateSegment, value: string) => void;
  onKeyDown: (
    segment: DateSegment,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => void;
  onPaste: (
    segment: DateSegment,
    event: React.ClipboardEvent<HTMLInputElement>
  ) => void;
}>;

function DateFieldPart({
  part,
  draft,
  segmentLabels,
  locale,
  calendarDate,
  eraOptions,
  firstVisibleSegment,
  disabled,
  readOnly,
  required,
  invalid,
  onInputRef,
  onFocus,
  onChange,
  onKeyDown,
  onPaste,
}: DateFieldPartProps): React.JSX.Element {
  if (part.kind === 'literal') {
    return (
      <span className={styles.separator} aria-hidden='true'>
        {part.value}
      </span>
    );
  }

  const value = draft.values[part.type];
  const ariaMetadata = getDateSegmentAriaMetadata({
    segment: part.type,
    value,
    numericValue: getNumericSegmentValue(value, locale),
    calendarDate,
    eraOptions,
    eraId: draft.eraId,
  });

  return (
    <DateSegmentInput
      segment={part.type}
      value={value}
      label={segmentLabels?.[part.type] ?? DEFAULT_SEGMENT_LABELS[part.type]}
      tabIndex={draft.activeSegment === part.type ? 0 : -1}
      disabled={disabled}
      readOnly={readOnly}
      required={required && part.type === firstVisibleSegment}
      invalid={invalid}
      {...ariaMetadata}
      inputRef={(node) => onInputRef(part.type, node)}
      onFocus={onFocus}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    />
  );
}

type DateFieldSegmentsProps = Omit<DateFieldPartProps, 'part'> &
  Readonly<{ layout: readonly DateSegmentLayoutPart[] }>;

export function DateFieldSegments({
  layout,
  ...partProps
}: DateFieldSegmentsProps): React.JSX.Element {
  return (
    <span className={styles.segments}>
      {layout.map((part, index) => (
        <DateFieldPart
          key={
            part.kind === 'literal'
              ? `literal-${index}-${part.value}`
              : part.type
          }
          part={part}
          {...partProps}
        />
      ))}
    </span>
  );
}
