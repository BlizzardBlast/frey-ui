import {
  autoUpdate,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions
} from '@floating-ui/react';
import clsx from 'clsx';
import React from 'react';
import {
  createFloatingMiddleware,
  toFloatingPlacement
} from '../hooks/floatingConfig';
import { useControllableState } from '../hooks/useControllableState';
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
  style
}: Readonly<TooltipProps>): React.JSX.Element {
  const generatedId = React.useId();
  const tooltipId = id ?? `${generatedId}-tooltip`;
  const [isOpen, setOpen] = useControllableState(
    open,
    defaultOpen,
    onOpenChange
  );
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setOpen,
    placement: toFloatingPlacement(placement, 'center'),
    middleware: createFloatingMiddleware(offset),
    strategy: 'fixed',
    transform: false,
    whileElementsMounted: autoUpdate
  });
  const hover = useHover(context, {
    delay: {
      open: delay,
      close: 0
    },
    move: false
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: false
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss
  ]);
  const referenceProps = getReferenceProps({
    'aria-describedby': isOpen ? tooltipId : undefined
  }) as React.HTMLAttributes<HTMLElement>;

  let triggerElement: React.ReactElement;

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        'Tooltip with asChild expects a single valid React element child.'
      );
    }

    triggerElement = (
      <Slot
        ref={refs.setReference as React.RefCallback<HTMLElement>}
        {...referenceProps}
      >
        {children}
      </Slot>
    );
  } else {
    triggerElement = (
      <button
        ref={refs.setReference as React.Ref<HTMLButtonElement>}
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

  const floatingProps = getFloatingProps({
    id: tooltipId,
    role: 'tooltip'
  }) as React.HTMLAttributes<HTMLDivElement>;

  return (
    <>
      {triggerElement}

      {isOpen && (
        <Portal>
          <div
            ref={refs.setFloating as React.Ref<HTMLDivElement>}
            className={clsx(styles.tooltip, className)}
            style={{
              ...floatingStyles,
              ...style
            }}
            {...floatingProps}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}

export default Tooltip;
