import clsx from 'clsx';
import React from 'react';
import Field from '../Field';
import styles from './select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'className' | 'style'
> & {
  label: string;
  hideLabel?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  size?: SelectSize;
  className?: string;
  style?: React.CSSProperties;
};

const SizeClassMap: Record<SelectSize, string> = {
  sm: styles.select_sm,
  md: styles.select_md,
  lg: styles.select_lg
};

const Select = React.forwardRef<HTMLSelectElement, Readonly<SelectProps>>(
  function Select(
    {
      label,
      hideLabel = false,
      error,
      helperText,
      placeholder,
      size = 'md',
      className,
      style,
      id,
      disabled = false,
      required = false,
      multiple = false,
      children,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...selectProps
    },
    ref
  ) {
    return (
      <Field
        label={label}
        hideLabel={hideLabel}
        error={error}
        helperText={helperText}
        disabled={disabled}
        required={required}
        id={id}
        className={className}
        style={style}
      >
        {({ inputId, describedBy, hasError }) => {
          const mergedDescribedBy =
            [describedBy, ariaDescribedBy].filter(Boolean).join(' ') ||
            undefined;
          const isInvalid =
            hasError || ariaInvalid === true || ariaInvalid === 'true';

          return (
            <div className={styles.select_wrapper}>
              <select
                id={inputId}
                ref={ref}
                disabled={disabled}
                required={required}
                multiple={multiple}
                aria-invalid={isInvalid || undefined}
                aria-describedby={mergedDescribedBy}
                className={clsx(
                  styles.select,
                  SizeClassMap[size],
                  hasError && styles.select_error,
                  multiple && styles.select_multiple
                )}
                {...selectProps}
              >
                {placeholder && !multiple && (
                  <option value='' disabled hidden>
                    {placeholder}
                  </option>
                )}
                {children}
              </select>
              {!multiple && (
                <span className={styles.select_icon} aria-hidden='true'>
                  ▾
                </span>
              )}
            </div>
          );
        }}
      </Field>
    );
  }
);

Select.displayName = 'Select';

export default Select;
