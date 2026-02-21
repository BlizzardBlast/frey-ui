import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';
import { useControllableState } from '../hooks/useControllableState';
import { useFloatingPosition } from '../hooks/useFloatingPosition';
import { mergeRefs } from '../utils/mergeRefs';
import styles from './tooltip.module.css';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export type TooltipProps = {
  children: React.ReactElement;
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
}: Readonly<TooltipProps>) {
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

  const childProps = children.props as {
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
    onFocus?: React.FocusEventHandler;
    onBlur?: React.FocusEventHandler;
    onKeyDown?: React.KeyboardEventHandler;
    ref?: React.Ref<HTMLElement>;
  };

  const triggerElement = React.cloneElement(children, {
    ref: mergeRefs<HTMLElement>(childProps.ref, triggerRef),
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(event);
      showWithDelay();
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(event);
      hideImmediately();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      showWithDelay();
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      hideImmediately();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      childProps.onKeyDown?.(event);

      if (!event.defaultPrevented && event.key === 'Escape') {
        hideImmediately();
      }
    },
    'aria-describedby': isOpen ? tooltipId : undefined
  } as Record<string, unknown>);

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
