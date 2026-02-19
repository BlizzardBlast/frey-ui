import clsx from 'clsx';
import React, { useId } from 'react';
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

const TextInput = React.forwardRef<HTMLInputElement, Readonly<TextInputProps>>(
  function TextInput(
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
      ...inputProps
    },
    ref
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = typeof error === 'string' && error.length > 0;
    const hasHelper = typeof helperText === 'string' && helperText.length > 0;

    const describedBy =
      [hasError ? errorId : undefined, hasHelper ? helperId : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <div
        className={clsx(styles['text-input-container'], className)}
        style={style}
      >
        <label
          htmlFor={inputId}
          className={clsx(styles.label, {
            [styles['label-disabled']]: disabled,
            [styles['visually-hidden']]: hideLabel
          })}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={clsx(styles.input, {
            [styles['input-error']]: hasError
          })}
          {...inputProps}
        />
        {hasError && (
          <p id={errorId} className={styles['error-text']} role='alert'>
            {error}
          </p>
        )}
        {hasHelper && (
          <p id={helperId} className={styles['helper-text']}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
