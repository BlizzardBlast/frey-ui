import clsx from 'clsx';
import React, { useId } from 'react';
import styles from './switch.module.css';

export type SwitchSize = 'sm' | 'md' | 'lg';

export type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'className' | 'style'
> & {
  label: string;
  hideLabel?: boolean;
  size?: SwitchSize;
  className?: string;
  style?: React.CSSProperties;
};

const SizeClassMap: Record<SwitchSize, string> = {
  sm: styles.switch_sm,
  md: styles.switch_md,
  lg: styles.switch_lg
};

const Switch = React.forwardRef<HTMLInputElement, Readonly<SwitchProps>>(
  function Switch(
    {
      label,
      hideLabel = false,
      size = 'md',
      className,
      style,
      id,
      disabled = false,
      onChange,
      onKeyDown,
      ...inputProps
    },
    ref
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
      event
    ) => {
      onChange?.(event);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
      event
    ) => {
      if (event.key === 'Enter' && !disabled) {
        event.preventDefault();
        event.currentTarget.click();
      }

      onKeyDown?.(event);
    };

    return (
      <div className={clsx(styles.switch_container, className)} style={style}>
        <span
          className={clsx(styles.switch, SizeClassMap[size], {
            [styles.switch_disabled]: disabled
          })}
        >
          <input
            type='checkbox'
            role='switch'
            id={inputId}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-checked={inputProps.checked}
            ref={ref}
            {...inputProps}
          />
          <span className={styles.slider} aria-hidden='true'></span>
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
  }
);

Switch.displayName = 'Switch';

export default Switch;
