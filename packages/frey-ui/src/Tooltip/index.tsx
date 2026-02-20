import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';
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

type Position = {
  top: number;
  left: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as { current: T | null }).current = node;
      }
    });
  };
}

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
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [position, setPosition] = React.useState<Position>({ top: 0, left: 0 });

  const isControlled = typeof open === 'boolean';
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

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

  const updatePosition = React.useCallback(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportPadding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.top - tooltipRect.height - offset;
    let left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;

    if (placement === 'bottom') {
      top = triggerRect.bottom + offset;
    }

    if (placement === 'left') {
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left - tooltipRect.width - offset;
    }

    if (placement === 'right') {
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + offset;
    }

    top = clamp(
      top,
      viewportPadding,
      Math.max(
        viewportPadding,
        viewportHeight - tooltipRect.height - viewportPadding
      )
    );
    left = clamp(
      left,
      viewportPadding,
      Math.max(
        viewportPadding,
        viewportWidth - tooltipRect.width - viewportPadding
      )
    );

    setPosition({ top, left });
  }, [isOpen, offset, placement]);

  React.useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleReposition = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, updatePosition]);

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
