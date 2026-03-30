import clsx from 'clsx';
import React, { useId } from 'react';
import { useControllableState } from '../hooks/useControllableState';
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

type SwitchComponent = React.ForwardRefExoticComponent<
  Readonly<SwitchProps> & React.RefAttributes<HTMLInputElement>
>;

const SizeClassMap: Record<SwitchSize, string> = {
  sm: styles['switch-sm'],
  md: styles['switch-md'],
  lg: styles['switch-lg']
};

const Switch: SwitchComponent = React.forwardRef<
  HTMLInputElement,
  Readonly<SwitchProps>
>(function Switch(
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
    checked,
    defaultChecked,
    ...inputProps
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [currentChecked, setCurrentChecked] = useControllableState(
    checked,
    Boolean(defaultChecked)
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setCurrentChecked(event.target.checked);

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
    <div className={clsx(styles['switch-container'], className)} style={style}>
      <span
        className={clsx(styles.switch, SizeClassMap[size], {
          [styles['switch-disabled']]: disabled
        })}
        aria-disabled={disabled || undefined}
      >
        <input
          type='checkbox'
          role='switch'
          id={inputId}
          checked={currentChecked}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-checked={currentChecked}
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
});

Switch.displayName = 'Switch';

export default Switch;
