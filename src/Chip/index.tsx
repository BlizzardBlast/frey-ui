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
  const resolvedElement = as ?? (onClick ? 'button' : 'span');
  const Component = resolvedElement as React.ElementType;
  const href =
    resolvedElement === 'a'
      ? (elementProps as React.AnchorHTMLAttributes<HTMLAnchorElement>).href
      : undefined;
  const hasHref = typeof href === 'string' && href.trim().length > 0;
  const isInteractive =
    Boolean(onClick) || (resolvedElement === 'a' && hasHref);

  const classes = clsx(
    VariantDefaultMap[variant],
    {
      [VariantClickableMap[variant]]: isInteractive
    },
    className
  );

  return (
    <Component
      {...elementProps}
      ref={ref}
      className={classes}
      onClick={onClick}
      style={style}
      type={resolvedElement === 'button' ? 'button' : undefined}
    >
      <span className={styles.chip_text}>{label}</span>
    </Component>
  );
}

const ForwardedChip = React.forwardRef(ChipInner);

ForwardedChip.displayName = 'Chip';

const Chip = ForwardedChip as ChipComponent;

export default Chip;
