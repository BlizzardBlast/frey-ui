import clsx from 'clsx';
import styles from './chip.module.css';
import React from 'react';

export type Variant = 'default' | 'outlined';

export type ChipElement = 'button' | 'div' | 'span' | 'a';

export type ChipProps = {
  label: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  as?: ChipElement;
  style?: React.CSSProperties;
  className?: string;
  variant?: Variant;
} & Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'className' | 'style'> &
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'onClick' | 'className' | 'style'
  >;

const VariantDefaultMap: Record<Variant, string> = {
  default: styles.chip_default,
  outlined: styles.chip_outlined
};

const VariantClickableMap: Record<Variant, string> = {
  default: styles.chip_default_clickable,
  outlined: styles.chip_outlined_clickable
};

const Chip = React.forwardRef<HTMLElement, Readonly<ChipProps>>(function Chip(
  {
    label,
    onClick,
    as,
    style,
    className,
    variant = 'default',
    ...elementProps
  },
  ref
) {
  const hasHref =
    typeof elementProps.href === 'string' &&
    elementProps.href.trim().length > 0;
  const isInteractive = Boolean(onClick) || (as === 'a' && hasHref);
  const element = as ?? (isInteractive ? 'button' : 'span');

  const classes = clsx(
    VariantDefaultMap[variant],
    {
      [VariantClickableMap[variant]]: isInteractive
    },
    className
  );

  if (element === 'button') {
    return (
      <button
        {...(elementProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        style={style}
        type='button'
      >
        <span className={styles.chip_text}>{label}</span>
      </button>
    );
  }

  if (element === 'a') {
    return (
      <a
        {...(elementProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        style={style}
      >
        <span className={styles.chip_text}>{label}</span>
      </a>
    );
  }

  if (element === 'div') {
    return (
      <div
        {...(elementProps as React.HTMLAttributes<HTMLDivElement>)}
        ref={ref as React.Ref<HTMLDivElement>}
        className={classes}
        onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
        style={style}
      >
        <span className={styles.chip_text}>{label}</span>
      </div>
    );
  }

  return (
    <span
      {...(elementProps as React.HTMLAttributes<HTMLSpanElement>)}
      ref={ref as React.Ref<HTMLSpanElement>}
      className={classes}
      onClick={onClick as React.MouseEventHandler<HTMLSpanElement>}
      style={style}
    >
      <span className={styles.chip_text}>{label}</span>
    </span>
  );
});

Chip.displayName = 'Chip';

export default Chip;
