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

function Switch({
  label,
  hideLabel = false,
  size = 'md',
  className,
  style,
  id,
  disabled = false,
  onChange,
  ...inputProps
}: Readonly<SwitchProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
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
          disabled={disabled}
          aria-checked={inputProps.checked}
          {...inputProps}
        />
        <span className={styles.slider} aria-hidden='true'></span>
      </span>
      <label
        htmlFor={inputId}
        className={clsx(styles.label, { [styles.visually_hidden]: hideLabel })}
      >
        {label}
      </label>
    </div>
  );
}

export default Switch;
