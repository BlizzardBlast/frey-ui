import clsx from 'clsx';
import React from 'react';
import Field from '../Field';
import styles from './textinput.module.css';

export type TextInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className' | 'style'
> & {
  label: string;
  hideLabel?: boolean;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  className?: string;
  style?: React.CSSProperties;
};

type TextInputComponent = React.ForwardRefExoticComponent<
  Readonly<TextInputProps> & React.RefAttributes<HTMLInputElement>
>;

const TextInput: TextInputComponent = React.forwardRef<
  HTMLInputElement,
  Readonly<TextInputProps>
>(function TextInput(
  {
    label,
    hideLabel = false,
    error,
    helperText,
    type = 'text',
    className,
    style,
    id,
    disabled = false,
    required = false,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...inputProps
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
          [describedBy, ariaDescribedBy].filter(Boolean).join(' ') || undefined;
        const isInvalid =
          hasError || ariaInvalid === true || ariaInvalid === 'true';

        return (
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={isInvalid || undefined}
            aria-describedby={mergedDescribedBy}
            className={clsx(styles.input, {
              [styles['input-error']]: hasError
            })}
            {...inputProps}
          />
        );
      }}
    </Field>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
