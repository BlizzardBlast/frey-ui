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
import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  createFloatingMiddleware,
  toFloatingPlacement
} from '../hooks/floatingConfig';
import { useControllableState } from '../hooks/useControllableState';
import { mergeRefs } from '../utils/mergeRefs';
import { Slot } from '../utils/slot';
import styles from './dropdownmenu.module.css';

export type DropdownMenuPlacement = 'top' | 'right' | 'bottom' | 'left';

type DropdownMenuContextValue = {
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

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      'DropdownMenu components must be wrapped in <DropdownMenu>'
    );
  }
  return context;
}

export type DropdownMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DropdownMenuPlacement;
  offset?: number;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  children: React.ReactNode;
};

type DropdownMenuRootComponent = {
  (props: Readonly<DropdownMenuProps>): React.JSX.Element;
  displayName?: string;
};

const DropdownMenuRoot: DropdownMenuRootComponent = function DropdownMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  offset = 8,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  children
}: Readonly<DropdownMenuProps>): React.JSX.Element {
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
    placement: toFloatingPlacement(placement, 'start'),
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
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
};
DropdownMenuRoot.displayName = 'DropdownMenu';

export type DropdownMenuTriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

type DropdownMenuTriggerComponent = React.ForwardRefExoticComponent<
  Readonly<DropdownMenuTriggerProps> & React.RefAttributes<HTMLElement>
>;

const DropdownMenuTrigger: DropdownMenuTriggerComponent = React.forwardRef<
  HTMLElement,
  Readonly<DropdownMenuTriggerProps>
>(function DropdownMenuTrigger(
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
  } = useDropdownMenuContext();
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
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': `${idPrefix}-menu`
  }) as React.HTMLAttributes<HTMLElement>;

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        'DropdownMenu.Trigger with asChild expects a single valid React element child.'
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
DropdownMenuTrigger.displayName = 'DropdownMenu.Trigger';

export type DropdownMenuContentProps = React.HTMLAttributes<HTMLMenuElement>;

type DropdownMenuContentComponent = React.ForwardRefExoticComponent<
  Readonly<DropdownMenuContentProps> & React.RefAttributes<HTMLMenuElement>
>;

const DropdownMenuContent: DropdownMenuContentComponent = React.forwardRef<
  HTMLMenuElement,
  Readonly<DropdownMenuContentProps>
>(function DropdownMenuContent({ className, style, children, ...props }, ref) {
  const { open, idPrefix, setFloating, floatingStyles, getFloatingProps } =
    useDropdownMenuContext();
  const menuRef = useRef<HTMLMenuElement | null>(null);
  useEffect(() => {
    if (!open || !menuRef.current) return;

    // Auto-focus first enabled item
    const firstItem: HTMLElement | null = menuRef.current.querySelector(
      '[role="menuitem"]:not([disabled])'
    );

    if (firstItem) {
      firstItem.focus();
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLMenuElement>) => {
    if (!menuRef.current) return;

    const items: HTMLElement[] = Array.from(
      menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')
    );

    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      items[nextIndex]?.focus();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      items[prevIndex]?.focus();
    }

    if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    }

    if (event.key === 'End') {
      event.preventDefault();
      items.at(-1)?.focus();
    }
  };
  const floatingProps = getFloatingProps({
    ...props,
    onKeyDown: handleKeyDown
  }) as React.HTMLAttributes<HTMLMenuElement>;

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <menu
      id={`${idPrefix}-menu`}
      ref={mergeRefs(
        menuRef,
        ref,
        setFloating as React.RefCallback<HTMLMenuElement>
      )}
      className={clsx(styles.dropdown_menu, className)}
      style={{
        ...floatingStyles,
        ...style
      }}
      {...floatingProps}
    >
      {children}
    </menu>,
    document.body
  );
});
DropdownMenuContent.displayName = 'DropdownMenu.Content';

export type DropdownMenuItemProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    destructive?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
  };

type DropdownMenuItemComponent = React.ForwardRefExoticComponent<
  Readonly<DropdownMenuItemProps> & React.RefAttributes<HTMLButtonElement>
>;

const DropdownMenuItem: DropdownMenuItemComponent = React.forwardRef<
  HTMLButtonElement,
  Readonly<DropdownMenuItemProps>
>(function DropdownMenuItem(
  { disabled, destructive, onSelect, className, children, ...props },
  ref
) {
  const { onOpenChange, triggerRef } = useDropdownMenuContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onSelect?.();
    props.onClick?.(event);
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  return (
    <li className={styles.dropdown_menu_item_container} role='presentation'>
      <button
        ref={ref}
        type='button'
        role='menuitem'
        disabled={disabled}
        onClick={handleClick}
        className={clsx(styles.dropdown_menu_item, className, {
          [styles.dropdown_menu_item_destructive]: destructive
        })}
        {...props}
      >
        {children}
      </button>
    </li>
  );
});
DropdownMenuItem.displayName = 'DropdownMenu.Item';

type DropdownMenuComponent = typeof DropdownMenuRoot & {
  Trigger: typeof DropdownMenuTrigger;
  Content: typeof DropdownMenuContent;
  Item: typeof DropdownMenuItem;
};

export const DropdownMenu: DropdownMenuComponent = Object.assign(
  DropdownMenuRoot,
  {
    Trigger: DropdownMenuTrigger,
    Content: DropdownMenuContent,
    Item: DropdownMenuItem
  }
);

export default DropdownMenu;
