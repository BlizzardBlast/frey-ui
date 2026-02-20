import clsx from 'clsx';
import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import styles from './popover.module.css';

export type PopoverPlacement = 'top' | 'right' | 'bottom' | 'left';

type Position = {
  top: number;
  left: number;
};

type PopoverContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement: PopoverPlacement;
  offset: number;
  idPrefix: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be wrapped in <Popover>');
  }
  return context;
}

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

export type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  offset?: number;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  children: React.ReactNode;
};

const PopoverRoot = function Popover({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  offset = 8,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  children
}: Readonly<PopoverProps>) {
  const idPrefix = useId();
  const triggerRef = useRef<HTMLElement | null>(null);

  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const currentOpen = isControlled ? open : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const contextValue = React.useMemo(
    () => ({
      open: currentOpen,
      onOpenChange: handleOpenChange,
      placement,
      offset,
      idPrefix,
      triggerRef,
      closeOnEscape,
      closeOnOutsideClick
    }),
    [
      currentOpen,
      handleOpenChange,
      placement,
      offset,
      idPrefix,
      closeOnEscape,
      closeOnOutsideClick
    ]
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      {children}
    </PopoverContext.Provider>
  );
};
PopoverRoot.displayName = 'Popover';

export type PopoverTriggerProps = {
  children: React.ReactElement;
  asChild?: boolean;
};

const PopoverTrigger = React.forwardRef<
  HTMLElement,
  Readonly<PopoverTriggerProps>
>(function PopoverTrigger({ children }, ref) {
  const { open, onOpenChange, idPrefix, triggerRef } = usePopoverContext();

  const triggerProps = children.props as {
    onClick?: React.MouseEventHandler;
    ref?: React.Ref<HTMLElement>;
  };

  return React.cloneElement(children, {
    ref: mergeRefs(triggerProps.ref, ref, triggerRef),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);
      if (!event.defaultPrevented) {
        onOpenChange(!open);
      }
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': `${idPrefix}-content`
  } as Record<string, unknown>);
});
PopoverTrigger.displayName = 'Popover.Trigger';

export type PopoverContentProps = React.HTMLAttributes<HTMLDivElement>;

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  Readonly<PopoverContentProps>
>(function PopoverContent({ className, style, children, ...props }, ref) {
  const {
    open,
    onOpenChange,
    placement,
    offset,
    idPrefix,
    triggerRef,
    closeOnEscape,
    closeOnOutsideClick
  } = usePopoverContext();

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  const updatePosition = React.useCallback(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewportPadding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.bottom + offset;
    let left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;

    if (placement === 'top') {
      top = triggerRect.top - contentRect.height - offset;
    } else if (placement === 'left') {
      top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
      left = triggerRect.left - contentRect.width - offset;
    } else if (placement === 'right') {
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
  }, [open, offset, placement, triggerRef]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePosition();

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (triggerRef.current?.contains(targetNode)) return;
      if (contentRef.current?.contains(targetNode)) return;

      onOpenChange(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeOnOutsideClick, open, onOpenChange, triggerRef]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, open, onOpenChange, triggerRef]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id={`${idPrefix}-content`}
      ref={mergeRefs(contentRef, ref)}
      aria-live='polite'
      className={clsx(styles.popover_content, className)}
      style={{
        top: position.top,
        left: position.left,
        ...style
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
});
PopoverContent.displayName = 'Popover.Content';

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent
});

export default Popover;
