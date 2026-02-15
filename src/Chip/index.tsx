import clsx from 'clsx';
import styles from './chip.module.css';
import React from 'react';

export type Variant = 'default' | 'outlined';

export type ChipElement = 'button' | 'div' | 'span' | 'a';

type ChipBaseProps = {
  label: string;
  variant?: Variant;
  style?: React.CSSProperties;
  className?: string;
};

type ChipElementNode<E extends ChipElement> = E extends 'button'
  ? HTMLButtonElement
  : E extends 'a'
    ? HTMLAnchorElement
    : E extends 'div'
      ? HTMLDivElement
      : HTMLSpanElement;

export type ChipProps<E extends ChipElement = 'span'> = ChipBaseProps & {
  as?: E;
  onClick?: React.MouseEventHandler<ChipElementNode<E>>;
} & Omit<
    React.ComponentPropsWithoutRef<E>,
    'as' | 'children' | 'className' | 'style' | 'onClick'
  >;

const VariantDefaultMap: Record<Variant, string> = {
  default: styles.chip_default,
  outlined: styles.chip_outlined
};

const VariantClickableMap: Record<Variant, string> = {
  default: styles.chip_default_clickable,
  outlined: styles.chip_outlined_clickable
};

type ChipComponent = <E extends ChipElement = 'span'>(
  props: Readonly<ChipProps<E>> & { ref?: React.Ref<ChipElementNode<E>> }
) => React.ReactElement | null;

function ChipInner<E extends ChipElement = 'span'>(
  {
    label,
    onClick,
    as,
    style,
    className,
    variant = 'default',
    ...elementProps
  }: Readonly<ChipProps<E>>,
  ref: React.ForwardedRef<ChipElementNode<E>>
) {
  const element = as ?? (onClick ? 'button' : 'span');
  const href =
    element === 'a'
      ? (elementProps as React.AnchorHTMLAttributes<HTMLAnchorElement>).href
      : undefined;
  const hasHref = typeof href === 'string' && href.trim().length > 0;
  const isInteractive = Boolean(onClick) || (element === 'a' && hasHref);

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
}

const ForwardedChip = React.forwardRef(ChipInner);

ForwardedChip.displayName = 'Chip';

const Chip = ForwardedChip as ChipComponent;

export default Chip;
