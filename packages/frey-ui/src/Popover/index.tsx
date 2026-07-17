import clsx from 'clsx';
import React, { useId } from 'react';
import {
  type DismissReason,
  useDismissibleLayer,
} from '../floating/dismissibleLayer';
import { FocusScope } from '../floating/FocusScope';
import { useFloatingPosition } from '../floating/useFloatingPosition';
import { useControllableValue } from '../hooks/useControllableState';
import { mergeRefs } from '../utils/mergeRefs';
import Portal from '../utils/Portal';
import { Slot } from '../utils/slot';
import styles from './popover.module.css';

export type PopoverPlacement = 'top' | 'right' | 'bottom' | 'left';

type PopoverContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idPrefix: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  floatingRef: React.RefObject<HTMLElement | null>;
  setReference: (node: HTMLElement | null) => void;
  setFloating: (node: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
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
  children,
}: Readonly<PopoverProps>): React.JSX.Element {
  const idPrefix = useId();
  const [currentOpen, handleOpenChange] = useControllableValue<boolean>(
    open,
    defaultOpen,
    onOpenChange
  );
  const {
    referenceRef: triggerRef,
    floatingRef,
    setReference,
    setFloating,
    floatingStyles,
  } = useFloatingPosition({
    open: currentOpen,
    side: placement,
    alignment: 'center',
    offset,
  });
  const handleDismiss = React.useCallback(
    (reason: DismissReason) => {
      handleOpenChange(false);
      if (reason === 'escape') triggerRef.current?.focus();
    },
    [handleOpenChange, triggerRef]
  );
  useDismissibleLayer({
    open: currentOpen,
    referenceRef: triggerRef,
    floatingRef,
    closeOnEscape,
    closeOnOutsidePointerDown: closeOnOutsideClick,
    onDismiss: handleDismiss,
  });
  const contextValue = React.useMemo(
    () => ({
      open: currentOpen,
      onOpenChange: handleOpenChange,
      idPrefix,
      triggerRef,
      floatingRef,
      setReference,
      setFloating,
      floatingStyles,
    }),
    [
      currentOpen,
      handleOpenChange,
      idPrefix,
      triggerRef,
      floatingRef,
      setReference,
      setFloating,
      floatingStyles,
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
  const { open, onOpenChange, idPrefix, triggerRef, setReference } =
    usePopoverContext();
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
  const referenceProps: React.HTMLAttributes<HTMLElement> = {
    ...triggerProps,
    onClick: handleClick,
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': `${idPrefix}-content`,
  };

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

export type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

type PopoverContentComponent = React.ForwardRefExoticComponent<
  Readonly<PopoverContentProps> & React.RefAttributes<HTMLDivElement>
>;

const PopoverContent: PopoverContentComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<PopoverContentProps>
>(function PopoverContent(
  { className, style, children, initialFocusRef, ...props },
  ref
) {
  const {
    open,
    idPrefix,
    triggerRef,
    floatingRef,
    setFloating,
    floatingStyles,
  } = usePopoverContext();

  if (!open) return null;

  return (
    <Portal>
      <FocusScope
        contentRef={floatingRef}
        triggerRef={triggerRef}
        initialFocusRef={initialFocusRef}
      >
        <div
          id={`${idPrefix}-content`}
          ref={mergeRefs(ref, setFloating as React.RefCallback<HTMLDivElement>)}
          className={clsx(styles.popover_content, className)}
          style={{
            ...floatingStyles,
            ...style,
          }}
          tabIndex={-1}
          {...props}
        >
          {children}
        </div>
      </FocusScope>
    </Portal>
  );
});
PopoverContent.displayName = 'Popover.Content';

type PopoverComponent = typeof PopoverRoot & {
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
};

export const Popover: PopoverComponent = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
});

export default Popover;
