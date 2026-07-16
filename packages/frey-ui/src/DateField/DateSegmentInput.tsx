import type React from 'react';
import type { DateSegment } from '../date/types';
import { getSegmentWidth } from './dateFieldState';
import styles from './datefield.module.css';

export type DateSegmentInputProps = Readonly<{
  segment: DateSegment;
  value: string;
  label: string;
  tabIndex: number;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  valueMin?: number;
  valueMax?: number;
  valueNow?: number;
  valueText?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onChange: (segment: DateSegment, value: string) => void;
  onFocus: (segment: DateSegment) => void;
  onKeyDown: (
    segment: DateSegment,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => void;
  onPaste: (
    segment: DateSegment,
    event: React.ClipboardEvent<HTMLInputElement>
  ) => void;
}>;

export function DateSegmentInput({
  segment,
  value,
  label,
  tabIndex,
  disabled,
  readOnly,
  required,
  invalid,
  valueMin,
  valueMax,
  valueNow,
  valueText,
  inputRef,
  onChange,
  onFocus,
  onKeyDown,
  onPaste,
}: DateSegmentInputProps): React.JSX.Element {
  return (
    <input
      ref={inputRef}
      role='spinbutton'
      type='text'
      inputMode={segment === 'era' ? 'text' : 'numeric'}
      autoComplete='off'
      className={styles.segment}
      style={getSegmentWidth(segment, value)}
      value={value}
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      aria-valuenow={valueNow}
      aria-valuetext={valueText}
      tabIndex={tabIndex}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      onFocus={(event) => {
        if (segment === 'era') event.currentTarget.select();
        onFocus(segment);
      }}
      onChange={(event) => onChange(segment, event.currentTarget.value)}
      onKeyDown={(event) => onKeyDown(segment, event)}
      onPaste={(event) => onPaste(segment, event)}
    />
  );
}
