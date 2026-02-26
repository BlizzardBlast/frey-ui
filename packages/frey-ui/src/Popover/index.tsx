import {
  autoUpdate,
  type OpenChangeReason,
  type UseInteractionsReturn,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useInteractions
} from '@floating-ui/react';
import clsx from 'clsx';
import React, { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  createFloatingMiddleware,
  toFloatingPlacement
} from '../hooks/floatingConfig';
import { useControllableState } from '../hooks/useControllableState';
import { mergeRefs } from '../utils/mergeRefs';
import { Slot } from '../utils/slot';
import styles from './popover.module.css';

export type PopoverPlacement = 'top' | 'right' | 'bottom' | 'left';

type PopoverContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idPrefix: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  setReference: (node: HTMLElement | null) => void;
  setFloating: (node: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
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

type PopoverRootComponent = {
  (props: Readonly<PopoverProps>): React.JSX.Element;
  displayName?: string;
};

const PopoverRoot: PopoverRootComponent = function Popover({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  offset = 8,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  children
}: Readonly<PopoverProps>): React.JSX.Element {
  const idPrefix = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [floatingElement, setFloatingElement] = useState<HTMLElement | null>(
    null
  );
  const [currentOpen, handleOpenChange] = useControllableState(
    open,
    defaultOpen,
    onOpenChange
  );
  const handleFloatingOpenChange = React.useCallback(
    (nextOpen: boolean, _event?: Event, reason?: OpenChangeReason) => {
      handleOpenChange(nextOpen);

      if (!nextOpen && reason === 'escape-key') {
        triggerRef.current?.focus();
      }
    },
    [handleOpenChange]
  );
  const floatingRootContext = useFloatingRootContext({
    open: currentOpen,
    onOpenChange: handleFloatingOpenChange,
    elements: {
      reference: referenceElement,
      floating: floatingElement
    }
  });
  const {
    refs,
    floatingStyles,
    context: floatingContext
  } = useFloating({
    rootContext: floatingRootContext,
    placement: toFloatingPlacement(placement, 'center'),
    middleware: createFloatingMiddleware(offset),
    strategy: 'fixed',
    transform: false,
    whileElementsMounted: autoUpdate
  });
  const dismiss = useDismiss(floatingContext, {
    enabled: currentOpen,
    escapeKey: closeOnEscape,
    outsidePress: closeOnOutsideClick
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);
  const setReference = React.useCallback(
    (node: HTMLElement | null) => {
      refs.setReference(node);
      setReferenceElement(node);
    },
    [refs]
  );
  const setFloating = React.useCallback(
    (node: HTMLElement | null) => {
      refs.setFloating(node);
      setFloatingElement(node);
    },
    [refs]
  );
  const contextValue = React.useMemo(
    () => ({
      open: currentOpen,
      onOpenChange: handleOpenChange,
      idPrefix,
      triggerRef,
      setReference,
      setFloating,
      floatingStyles,
      getReferenceProps,
      getFloatingProps
    }),
    [
      currentOpen,
      handleOpenChange,
      idPrefix,
      setReference,
      setFloating,
      floatingStyles,
      getReferenceProps,
      getFloatingProps
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
  children: React.ReactNode;
  asChild?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

type PopoverTriggerComponent = React.ForwardRefExoticComponent<
  Readonly<PopoverTriggerProps> & React.RefAttributes<HTMLElement>
>;

const PopoverTrigger: PopoverTriggerComponent = React.forwardRef<
  HTMLElement,
  Readonly<PopoverTriggerProps>
>(function PopoverTrigger(
  { children, asChild = false, onClick, type, ...triggerProps },
  ref
) {
  const {
    open,
    onOpenChange,
    idPrefix,
    triggerRef,
    setReference,
    getReferenceProps
  } = usePopoverContext();
  const mergedRef = mergeRefs(
    ref,
    triggerRef,
    setReference as React.RefCallback<HTMLElement>
  );
  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    if (!event.defaultPrevented) {
      onOpenChange(!open);
    }
  };
  const referenceProps = getReferenceProps({
    ...triggerProps,
    onClick: handleClick,
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': `${idPrefix}-content`
  }) as React.HTMLAttributes<HTMLElement>;

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        'Popover.Trigger with asChild expects a single valid React element child.'
      );
    }

    return (
      <Slot ref={mergedRef} {...referenceProps}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={mergedRef as React.Ref<HTMLButtonElement>}
      type={type ?? 'button'}
      {...(referenceProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = 'Popover.Trigger';

export type PopoverContentProps = React.HTMLAttributes<HTMLDivElement>;

type PopoverContentComponent = React.ForwardRefExoticComponent<
  Readonly<PopoverContentProps> & React.RefAttributes<HTMLDivElement>
>;

const PopoverContent: PopoverContentComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<PopoverContentProps>
>(function PopoverContent({ className, style, children, ...props }, ref) {
  const { open, idPrefix, setFloating, floatingStyles, getFloatingProps } =
    usePopoverContext();
  const floatingProps = getFloatingProps(
    props
  ) as React.HTMLAttributes<HTMLDivElement>;

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id={`${idPrefix}-content`}
      ref={mergeRefs(ref, setFloating as React.RefCallback<HTMLDivElement>)}
      aria-live='polite'
      className={clsx(styles.popover_content, className)}
      style={{
        ...floatingStyles,
        ...style
      }}
      {...floatingProps}
    >
      {children}
    </div>,
    document.body
  );
});
PopoverContent.displayName = 'Popover.Content';

type PopoverComponent = typeof PopoverRoot & {
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
};

export const Popover: PopoverComponent = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent
});

export default Popover;
