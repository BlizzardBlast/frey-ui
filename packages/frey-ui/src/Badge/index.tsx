import clsx from 'clsx';
import React from 'react';
import styles from './badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';
export type BadgeVariant = 'subtle' | 'solid';
export type BadgeSize = 'sm' | 'md';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const SizeClassMap: Record<BadgeSize, string> = {
  sm: styles['badge-sm'],
  md: styles['badge-md']
};

const ToneVariantClassMap: Record<BadgeVariant, Record<BadgeTone, string>> = {
  subtle: {
    neutral: styles['badge-subtle-neutral'],
    info: styles['badge-subtle-info'],
    success: styles['badge-subtle-success'],
    warning: styles['badge-subtle-warning'],
    error: styles['badge-subtle-error']
  },
  solid: {
    neutral: styles['badge-solid-neutral'],
    info: styles['badge-solid-info'],
    success: styles['badge-solid-success'],
    warning: styles['badge-solid-warning'],
    error: styles['badge-solid-error']
  }
};

type BadgeComponent = React.ForwardRefExoticComponent<
  Readonly<BadgeProps> & React.RefAttributes<HTMLSpanElement>
>;

const Badge: BadgeComponent = React.forwardRef<
  HTMLSpanElement,
  Readonly<BadgeProps>
>(function Badge(
  { tone = 'neutral', variant = 'subtle', size = 'md', className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={clsx(
        styles.badge,
        SizeClassMap[size],
        ToneVariantClassMap[variant][tone],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export default Badge;
