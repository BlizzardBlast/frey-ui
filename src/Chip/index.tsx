import clsx from 'clsx';
import styles from './chip.module.css';
import React from 'react';

export type Variant = 'default' | 'outlined';

export type ChipElement = 'button' | 'div' | 'span' | 'a';

type ChipElementNode<E extends ChipElement> = E extends 'button'
  ? HTMLButtonElement
  : E extends 'a'
    ? HTMLAnchorElement
    : E extends 'div'
      ? HTMLDivElement
      : HTMLSpanElement;

type ChipBaseProps = {
  label: string;
  variant?: Variant;
  style?: React.CSSProperties;
  className?: string;
};

export type ChipProps<E extends ChipElement = 'span'> = ChipBaseProps & {
  as?: E;
  onClick?: React.MouseEventHandler<ChipElementNode<E>>;
} & Omit<
    React.ComponentPropsWithRef<E>,
    'as' | 'children' | 'className' | 'style' | 'onClick' | 'ref'
  >;

const VariantDefaultMap: Record<Variant, string> = {
  default: styles['chip-default'],
  outlined: styles['chip-outlined']
};

const VariantClickableMap: Record<Variant, string> = {
  default: styles['chip-default-clickable'],
  outlined: styles['chip-outlined-clickable']
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
    resolvedElement === 'button' ||
    (resolvedElement === 'a' && hasHref) ||
    Boolean(onClick);

  const isNonNativeInteractive =
    isInteractive && resolvedElement !== 'button' && resolvedElement !== 'a';

  const handleKeyDown = isNonNativeInteractive
    ? (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          (event.currentTarget as HTMLElement).click();
        }
      }
    : undefined;

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
      role={isNonNativeInteractive ? 'button' : undefined}
      tabIndex={isNonNativeInteractive ? 0 : undefined}
      onKeyDown={isNonNativeInteractive ? handleKeyDown : undefined}
    >
      <span className={styles['chip-text']}>{label}</span>
    </Component>
  );
}

const ForwardedChip = React.forwardRef(ChipInner);

ForwardedChip.displayName = 'Chip';

const Chip = ForwardedChip as ChipComponent;

export default Chip;
