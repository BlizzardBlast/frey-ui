import clsx from 'clsx';
import React from 'react';
import type {
  PolymorphicComponentProps,
  PolymorphicRef
} from '../types/polymorphic';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonElement = 'button' | 'a';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export type ButtonProps<E extends ButtonElement = 'button'> =
  PolymorphicComponentProps<E, ButtonBaseProps>;

type ButtonComponent = (<E extends ButtonElement = 'button'>(
  props: Readonly<ButtonProps<E>> & { ref?: PolymorphicRef<E> }
) => React.ReactElement | null) & { displayName?: string };

const VariantClassMap: Record<ButtonVariant, string> = {
  primary: styles['button-primary'],
  secondary: styles['button-secondary'],
  ghost: styles['button-ghost'],
  destructive: styles['button-destructive']
};

const SizeClassMap: Record<ButtonSize, string> = {
  sm: styles['button-sm'],
  md: styles['button-md'],
  lg: styles['button-lg']
};

const Button = React.forwardRef(function Button<
  E extends ButtonElement = 'button'
>(
  {
    as,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    style,
    children,
    onClick,
    ...restProps
  }: Readonly<ButtonProps<E>>,
  ref: PolymorphicRef<E>
) {
  const Component = (as ?? 'button') as React.ElementType;
  const isButton = (as ?? 'button') === 'button';

  return (
    <Component
      ref={ref}
      className={clsx(
        styles.button,
        VariantClassMap[variant],
        SizeClassMap[size],
        { [styles['button-loading']]: loading },
        className
      )}
      style={style}
      disabled={isButton ? disabled || loading : undefined}
      aria-disabled={!isButton && (disabled || loading) ? true : undefined}
      type={isButton ? 'button' : undefined}
      aria-busy={loading || undefined}
      onClick={(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (!isButton && (disabled || loading)) {
          e.preventDefault();
          return;
        }
        (onClick as React.MouseEventHandler<HTMLElement>)?.(e);
      }}
      {...restProps}
    >
      {loading && <span className={styles.spinner} aria-hidden='true' />}
      {children}
    </Component>
  );
}) as ButtonComponent;

Button.displayName = 'Button';

export default Button;
