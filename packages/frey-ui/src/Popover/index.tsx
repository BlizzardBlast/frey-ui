import clsx from 'clsx';
import React, { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useControllableState } from '../hooks/useControllableState';
import { useDismiss } from '../hooks/useDismiss';
import { useFloatingPosition } from '../hooks/useFloatingPosition';
import { mergeRefs } from '../utils/mergeRefs';
import styles from './popover.module.css';

export type PopoverPlacement = 'top' | 'right' | 'bottom' | 'left';

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

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be wrapped in <Popover>');
  }
  return context;
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
  const [currentOpen, handleOpenChange] = useControllableState(
    open,
    defaultOpen,
    onOpenChange
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

  const position = useFloatingPosition(triggerRef, contentRef, {
    open,
    placement,
    offset,
    align: 'center'
  });

  useDismiss({
    open,
    onClose: () => onOpenChange(false),
    triggerRef,
    contentRef,
    closeOnEscape,
    closeOnOutsideClick,
    returnFocusOnClose: true
  });

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
