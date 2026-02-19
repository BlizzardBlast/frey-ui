import clsx from 'clsx';
import React from 'react';
import Field from '../Field';
import styles from './textarea.module.css';

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'style'
> & {
  label: string;
  hideLabel?: boolean;
  error?: string;
  helperText?: string;
  resize?: TextareaResize;
  className?: string;
  style?: React.CSSProperties;
};

const ResizeClassMap: Record<TextareaResize, string> = {
  none: styles.resize_none,
  vertical: styles.resize_vertical,
  horizontal: styles.resize_horizontal,
  both: styles.resize_both
};

const Textarea = React.forwardRef<HTMLTextAreaElement, Readonly<TextareaProps>>(
  function Textarea(
    {
      label,
      hideLabel = false,
      error,
      helperText,
      resize = 'vertical',
      className,
      style,
      id,
      disabled = false,
      required = false,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...textareaProps
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
            <textarea
              id={inputId}
              ref={ref}
              disabled={disabled}
              required={required}
              aria-invalid={isInvalid || undefined}
              aria-describedby={mergedDescribedBy}
              className={clsx(
                styles.textarea,
                ResizeClassMap[resize],
                hasError && styles.textarea_error
              )}
              {...textareaProps}
            />
          );
        }}
      </Field>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
