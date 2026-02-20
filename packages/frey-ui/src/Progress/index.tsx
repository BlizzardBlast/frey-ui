import clsx from 'clsx';
import React from 'react';
import styles from './progress.module.css';

export type ProgressSize = 'sm' | 'md' | 'lg';

export type ProgressProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'style'
> & {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  label?: string;
  showValue?: boolean;
  size?: ProgressSize;
  className?: string;
  style?: React.CSSProperties;
  barClassName?: string;
};

const SizeClassMap: Record<ProgressSize, string> = {
  sm: styles.progress_sm,
  md: styles.progress_md,
  lg: styles.progress_lg
};

function clampValue(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
}

const Progress = React.forwardRef<HTMLDivElement, Readonly<ProgressProps>>(
  function Progress(
    {
      value = 0,
      max = 100,
      indeterminate = false,
      label,
      showValue = false,
      size = 'md',
      className,
      style,
      barClassName,
      ...rootProps
    },
    ref
  ) {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
    const safeValue = Number.isFinite(value) ? clampValue(value, safeMax) : 0;
    const percent = (safeValue / safeMax) * 100;
    const valueText = `${Math.round(percent)}%`;

    return (
      <div
        ref={ref}
        className={clsx(styles.progress_root, className)}
        style={style}
        {...rootProps}
      >
        {(label || showValue) && (
          <div className={styles.progress_header}>
            {label && <span className={styles.progress_label}>{label}</span>}
            {showValue && !indeterminate && (
              <span className={styles.progress_value}>{valueText}</span>
            )}
          </div>
        )}

        <div
          className={clsx(styles.progress_track_wrapper, SizeClassMap[size])}
        >
          <progress
            className={clsx(
              styles.progress_track,
              indeterminate && styles.progress_track_indeterminate,
              barClassName
            )}
            aria-label={label ?? 'Progress'}
            value={indeterminate ? undefined : safeValue}
            max={safeMax}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export default Progress;
