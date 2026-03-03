import clsx from 'clsx';
import React from 'react';
import { Slot } from '../utils/slot';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'className' | 'style' | 'disabled'
> &
  ButtonBaseProps & {
    children: React.ReactNode;
  };

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

type ButtonComponent = React.ForwardRefExoticComponent<
  Readonly<ButtonProps> & React.RefAttributes<HTMLButtonElement>
>;

const Button: ButtonComponent = React.forwardRef<
  HTMLButtonElement,
  Readonly<ButtonProps>
>(function Button(
  {
    asChild = false,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    style,
    children,
    type,
    onClick,
    ...restProps
  },
  ref
) {
  const isDisabled = disabled || loading;
  const combinedClassName = clsx(
    styles.button,
    VariantClassMap[variant],
    SizeClassMap[size],
    { [styles['button-loading']]: loading },
    className
  );
  const commonProps = {
    className: combinedClassName,
    style,
    'aria-busy': loading || undefined
  };
  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    (onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(event);
  };

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        'Button with asChild expects a single valid React element child.'
      );
    }

    const childElement = children as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    const slotChild = loading
      ? React.cloneElement(childElement, {
          children: (
            <>
              <span className={styles.spinner} aria-hidden='true' />
              {childElement.props.children}
            </>
          )
        })
      : childElement;

    return (
      <Slot
        {...(restProps as React.HTMLAttributes<HTMLElement>)}
        ref={ref as React.Ref<HTMLElement>}
        {...commonProps}
        aria-disabled={isDisabled || undefined}
        data-disabled={isDisabled ? true : undefined}
        onClick={handleClick}
      >
        {slotChild}
      </Slot>
    );
  }

  return (
    <button
      {...restProps}
      ref={ref}
      {...commonProps}
      disabled={isDisabled}
      type={type ?? 'button'}
      onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
    >
      {loading && <span className={styles.spinner} aria-hidden='true' />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
