import clsx from 'clsx';
import React from 'react';
import { useDismissibleLayer } from '../floating/dismissibleLayer';
import { useFloatingPosition } from '../floating/useFloatingPosition';
import { useTooltipInteractions } from '../floating/useTooltipInteractions';
import { useControllableValue } from '../hooks/useControllableState';
import Portal from '../utils/Portal';
import { Slot } from '../utils/slot';
import styles from './tooltip.module.css';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export type TooltipProps = {
  children: React.ReactNode;
  asChild?: boolean;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  offset?: number;
  delay?: number;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

function Tooltip({
  children,
  asChild = false,
  content,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'top',
  offset = 8,
  delay = 120,
  id,
  className,
  style,
}: Readonly<TooltipProps>): React.JSX.Element {
  const generatedId = React.useId();
  const tooltipId = id ?? `${generatedId}-tooltip`;
  const [isOpen, setOpen] = useControllableValue<boolean>(
    open,
    defaultOpen,
    onOpenChange
  );

  const {
    referenceRef,
    floatingRef,
    setReference,
    setFloating,
    floatingStyles,
  } = useFloatingPosition({
    open: isOpen,
    side: placement,
    alignment: 'center',
    offset,
  });

  const interactionProps = useTooltipInteractions({
    open: isOpen,
    delay,
    reference: referenceRef.current,
    onOpenChange: setOpen,
  });

  const handleDismiss = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useDismissibleLayer({
    open: isOpen,
    referenceRef,
    floatingRef,
    closeOnEscape: true,
    closeOnOutsidePointerDown: false,
    onDismiss: handleDismiss,
  });

  const referenceProps: React.HTMLAttributes<HTMLElement> = {
    ...interactionProps,
    'aria-describedby': isOpen ? tooltipId : undefined,
  };

  let triggerElement: React.ReactElement;

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        'Tooltip with asChild expects a single valid React element child.'
      );
    }

    triggerElement = (
      <Slot
        ref={setReference as React.RefCallback<HTMLElement>}
        {...referenceProps}
      >
        {children}
      </Slot>
    );
  } else {
    triggerElement = (
      <button
        ref={setReference as React.Ref<HTMLButtonElement>}
        type='button'
        {...(referenceProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  if (typeof document === 'undefined') {
    return triggerElement;
  }

  return (
    <>
      {triggerElement}

      {isOpen && (
        <Portal>
          <div
            ref={setFloating as React.Ref<HTMLDivElement>}
            className={clsx(styles.tooltip, className)}
            style={{
              ...floatingStyles,
              ...style,
            }}
            id={tooltipId}
            role='tooltip'
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}

export default Tooltip;
