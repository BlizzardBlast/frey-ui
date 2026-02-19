import clsx from 'clsx';
import React, { useId, useLayoutEffect, useRef } from 'react';
import styles from './checkbox.module.css';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'className' | 'style'
> & {
  label: string;
  hideLabel?: boolean;
  size?: CheckboxSize;
  indeterminate?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const SizeClassMap: Record<CheckboxSize, string> = {
  sm: styles['checkbox-sm'],
  md: styles['checkbox-md'],
  lg: styles['checkbox-lg']
};

const Checkbox = React.forwardRef<HTMLInputElement, Readonly<CheckboxProps>>(
  function Checkbox(
    {
      label,
      hideLabel = false,
      size = 'md',
      indeterminate = false,
      className,
      style,
      id,
      disabled = false,
      ...inputProps
    },
    forwardedRef
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const internalRef = useRef<HTMLInputElement | null>(null);

    useLayoutEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const setRef = (node: HTMLInputElement | null) => {
      internalRef.current = node;
      if (node) {
        node.indeterminate = indeterminate;
      }
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    return (
      <div
        className={clsx(styles['checkbox-container'], className)}
        style={style}
      >
        <span
          className={clsx(styles.checkbox, SizeClassMap[size], {
            [styles['checkbox-disabled']]: disabled
          })}
          aria-disabled={disabled || undefined}
        >
          <input
            type='checkbox'
            id={inputId}
            disabled={disabled}
            ref={setRef}
            aria-checked={indeterminate ? 'mixed' : undefined}
            {...inputProps}
          />
          <span className={styles['checkbox-box']} aria-hidden='true'>
            <svg
              className={styles['check-icon']}
              viewBox='0 0 12 12'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
            >
              <path
                d='M2.5 6L5 8.5L9.5 3.5'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <svg
              className={styles['indeterminate-icon']}
              viewBox='0 0 12 12'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
            >
              <path
                d='M2.5 6H9.5'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
          </span>
        </span>
        <label
          htmlFor={inputId}
          className={clsx(styles.label, {
            [styles['visually-hidden']]: hideLabel
          })}
        >
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
