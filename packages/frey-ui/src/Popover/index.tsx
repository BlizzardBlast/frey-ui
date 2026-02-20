import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';
import styles from './popover.module.css';

export type PopoverPlacement = 'top' | 'right' | 'bottom' | 'left';

export type PopoverProps = {
  trigger: React.ReactElement;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  offset?: number;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
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

function Popover({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  offset = 8,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  id,
  className,
  style,
  contentClassName,
  contentStyle
}: Readonly<PopoverProps>) {
  const generatedId = React.useId();
  const contentId = id ?? `${generatedId}-popover`;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
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

  const updatePosition = React.useCallback(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewportPadding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.bottom + offset;
    let left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;

    if (placement === 'top') {
      top = triggerRect.top - contentRect.height - offset;
    }

    if (placement === 'left') {
      top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
      left = triggerRect.left - contentRect.width - offset;
    }

    if (placement === 'right') {
      top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
      left = triggerRect.right + offset;
    }

    top = clamp(
      top,
      viewportPadding,
      Math.max(
        viewportPadding,
        viewportHeight - contentRect.height - viewportPadding
      )
    );
    left = clamp(
      left,
      viewportPadding,
      Math.max(
        viewportPadding,
        viewportWidth - contentRect.width - viewportPadding
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
    if (!isOpen || !closeOnOutsideClick) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;

      if (triggerRef.current?.contains(targetNode)) {
        return;
      }

      if (contentRef.current?.contains(targetNode)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [closeOnOutsideClick, isOpen, setOpen]);

  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeOnEscape, isOpen, setOpen]);

  const triggerProps = trigger.props as {
    onClick?: React.MouseEventHandler;
    ref?: React.Ref<HTMLElement>;
  };

  const triggerElement = React.cloneElement(trigger, {
    ref: mergeRefs<HTMLElement>(triggerProps.ref, triggerRef),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);

      if (!event.defaultPrevented) {
        setOpen(!isOpen);
      }
    },
    'aria-haspopup': 'dialog',
    'aria-controls': contentId,
    'aria-expanded': isOpen
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
            id={contentId}
            ref={contentRef}
            aria-live='polite'
            className={clsx(
              styles.popover_content,
              contentClassName,
              className
            )}
            style={{
              top: position.top,
              left: position.left,
              ...style,
              ...contentStyle
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}

export default Popover;
