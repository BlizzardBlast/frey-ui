import clsx from 'clsx';
import { type CSSProperties, type ReactNode, useId } from 'react';
import styles from './field.module.css';

export type FieldRenderProps = {
  inputId: string;
  labelId: string;
  describedBy?: string;
  hasError: boolean;
};

export type FieldProps = {
  children: (props: Readonly<FieldRenderProps>) => ReactNode;
  label: string;
  hideLabel?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  labelElement?: 'label' | 'span';
};

function Field({
  children,
  label,
  hideLabel = false,
  error,
  helperText,
  required = false,
  disabled = false,
  id,
  className,
  style,
  labelElement = 'label'
}: Readonly<FieldProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const hasError = typeof error === 'string' && error.length > 0;
  const hasHelper = typeof helperText === 'string' && helperText.length > 0;

  const describedBy =
    [hasError ? errorId : undefined, hasHelper ? helperId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const sharedLabelClassName = clsx(styles.field_label, {
    [styles.field_label_disabled]: disabled,
    [styles.visually_hidden]: hideLabel
  });

  return (
    <div className={clsx(styles.field_container, className)} style={style}>
      {labelElement === 'label' ? (
        <label htmlFor={inputId} className={sharedLabelClassName} id={labelId}>
          <span>{label}</span>
          {required && (
            <span className={styles.required_indicator} aria-hidden='true'>
              *
            </span>
          )}
        </label>
      ) : (
        <span className={sharedLabelClassName} id={labelId}>
          <span>{label}</span>
          {required && (
            <span className={styles.required_indicator} aria-hidden='true'>
              *
            </span>
          )}
        </span>
      )}

      {children({
        inputId,
        labelId,
        describedBy,
        hasError
      })}

      {hasError && (
        <p id={errorId} className={styles.error_text} role='alert'>
          {error}
        </p>
      )}

      {hasHelper && (
        <p id={helperId} className={styles.helper_text}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Field;
