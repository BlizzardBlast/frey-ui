import clsx from 'clsx';
import React from 'react';
import Field from '../Field';
import styles from './radiogroup.module.css';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type RadioGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'className' | 'style' | 'children'
> & {
  label: string;
  options: ReadonlyArray<RadioOption>;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: RadioGroupOrientation;
  name?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

const OrientationClassMap: Record<RadioGroupOrientation, string> = {
  vertical: styles.radio_group_vertical,
  horizontal: styles.radio_group_horizontal
};

function RadioGroup({
  label,
  options,
  value,
  defaultValue,
  onChange,
  hideLabel = false,
  helperText,
  error,
  disabled = false,
  required = false,
  orientation = 'vertical',
  name,
  id,
  className,
  style,
  ...groupProps
}: Readonly<RadioGroupProps>) {
  const generatedName = React.useId();
  const groupName = name ?? generatedName;
  const isControlled = typeof value === 'string';
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');

  const selectedValue = isControlled ? value : internalValue;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }

    onChange?.(event);
  };

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      helperText={helperText}
      error={error}
      disabled={disabled}
      required={required}
      id={id}
      className={className}
      style={style}
      labelElement='span'
    >
      {({ inputId, labelId, describedBy, hasError }) => (
        <div
          id={inputId}
          role='radiogroup'
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          className={clsx(
            styles.radio_group,
            OrientationClassMap[orientation],
            disabled && styles.radio_group_disabled
          )}
          {...groupProps}
        >
          {options.map((option, index) => {
            const optionId = `${inputId}-option-${index}`;
            const optionDescriptionId = `${optionId}-description`;
            const hasDescription =
              typeof option.description === 'string' &&
              option.description.length > 0;
            const isOptionDisabled = disabled || option.disabled;

            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className={clsx(styles.radio_option, {
                  [styles.radio_option_disabled]: isOptionDisabled
                })}
              >
                <input
                  type='radio'
                  id={optionId}
                  name={groupName}
                  value={option.value}
                  checked={selectedValue === option.value}
                  required={required}
                  disabled={isOptionDisabled}
                  onChange={handleChange}
                  aria-describedby={
                    hasDescription ? optionDescriptionId : undefined
                  }
                  className={styles.radio_input}
                />
                <span className={styles.radio_text_content}>
                  <span className={styles.radio_label}>{option.label}</span>
                  {hasDescription && (
                    <span
                      id={optionDescriptionId}
                      className={styles.radio_description}
                    >
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </Field>
  );
}

export default RadioGroup;
