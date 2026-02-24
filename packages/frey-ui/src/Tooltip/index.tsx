import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';
import { useControllableState } from '../hooks/useControllableState';
import { useFloatingPosition } from '../hooks/useFloatingPosition';
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
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const delayTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [isOpen, setOpen] = useControllableState(
    open,
    defaultOpen,
    onOpenChange
  );

  const position = useFloatingPosition(triggerRef, tooltipRef, {
    open: isOpen,
    placement,
    offset,
    align: 'center'
  });

  const hideImmediately = React.useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }

    setOpen(false);
  }, [setOpen]);

  const showWithDelay = React.useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }

    delayTimerRef.current = setTimeout(() => {
      setOpen(true);
    }, delay);
  }, [delay, setOpen]);

  React.useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        hideImmediately();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [hideImmediately, isOpen]);

  const triggerProps = {
    onMouseEnter: () => {
      showWithDelay();
    },
    onMouseLeave: () => {
      hideImmediately();
    },
    onFocus: () => {
      showWithDelay();
    },
    onBlur: () => {
      hideImmediately();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (!event.defaultPrevented && event.key === 'Escape') {
        hideImmediately();
      }
    },
    'aria-describedby': isOpen ? tooltipId : undefined
  } satisfies React.HTMLAttributes<HTMLElement>;

  let triggerElement: React.ReactElement;

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        'Tooltip with asChild expects a single valid React element child.'
      );
    }

    triggerElement = (
      <Slot ref={triggerRef} {...triggerProps}>
        {children}
      </Slot>
    );
  } else {
    triggerElement = (
      <button
        ref={triggerRef as React.Ref<HTMLButtonElement>}
        type='button'
        onMouseEnter={
          triggerProps.onMouseEnter as React.MouseEventHandler<HTMLButtonElement>
        }
        onMouseLeave={
          triggerProps.onMouseLeave as React.MouseEventHandler<HTMLButtonElement>
        }
        onFocus={
          triggerProps.onFocus as React.FocusEventHandler<HTMLButtonElement>
        }
        onBlur={
          triggerProps.onBlur as React.FocusEventHandler<HTMLButtonElement>
        }
        onKeyDown={
          triggerProps.onKeyDown as React.KeyboardEventHandler<HTMLButtonElement>
        }
        aria-describedby={triggerProps['aria-describedby']}
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

      {isOpen &&
        createPortal(
          <div
            id={tooltipId}
            ref={tooltipRef}
            role='tooltip'
            className={clsx(styles.tooltip, className)}
            style={{ top: position.top, left: position.left, ...style }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}

export default Tooltip;
