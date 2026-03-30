import clsx from 'clsx';
import React, { useId, useLayoutEffect, useRef } from 'react';
import { CheckIcon, MinusIcon } from '../Icons';
import { mergeRefs } from '../utils/mergeRefs';
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

type CheckboxComponent = React.ForwardRefExoticComponent<
  Readonly<CheckboxProps> & React.RefAttributes<HTMLInputElement>
>;

const SizeClassMap: Record<CheckboxSize, string> = {
  sm: styles['checkbox-sm'],
  md: styles['checkbox-md'],
  lg: styles['checkbox-lg']
};

const Checkbox: CheckboxComponent = React.forwardRef<
  HTMLInputElement,
  Readonly<CheckboxProps>
>(function Checkbox(
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
  const mergedRef = mergeRefs(internalRef, forwardedRef);

  useLayoutEffect(() => {
    if (internalRef.current) {
      internalRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

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
          ref={mergedRef}
          aria-checked={indeterminate ? 'mixed' : undefined}
          {...inputProps}
        />
        <span className={styles['checkbox-box']} aria-hidden='true'>
          <CheckIcon
            className={styles['check-icon']}
            strokeWidth='bold'
            size='md'
          />
          <MinusIcon
            className={styles['indeterminate-icon']}
            strokeWidth='bold'
            size='md'
          />
        </span>
      </span>
      <label
        htmlFor={inputId}
        className={clsx(styles.label, {
          [styles.visually_hidden]: hideLabel
        })}
      >
        {label}
      </label>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
