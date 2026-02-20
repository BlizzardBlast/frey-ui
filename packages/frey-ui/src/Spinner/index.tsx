import clsx from 'clsx';
import React from 'react';
import styles from './spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = {
  size?: SpinnerSize | number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
};

const SpinnerSizeMap: Record<SpinnerSize, number> = {
  sm: 14,
  md: 18,
  lg: 24
};

function resolveSize(size: SpinnerSize | number | undefined) {
  if (typeof size === 'number') {
    return size;
  }

  return SpinnerSizeMap[size ?? 'md'];
}

const Spinner = React.forwardRef<HTMLOutputElement, Readonly<SpinnerProps>>(
  function Spinner({ size = 'md', label = 'Loading', className, style }, ref) {
    const resolvedSize = resolveSize(size);

    return (
      <output
        ref={ref}
        className={clsx(styles.spinner_root, className)}
        style={
          {
            '--spinner-size': `${resolvedSize}px`,
            ...style
          } as React.CSSProperties
        }
        aria-live='polite'
        aria-label={label}
      >
        <span className={styles.spinner_circle} aria-hidden='true' />
        <span className={styles.visually_hidden}>{label}</span>
      </output>
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;
