import {
  autoUpdate,
  FloatingFocusManager,
  type OpenChangeReason,
  type UseInteractionsReturn,
  useDismiss,
  useFloating,
  useFloatingRootContext,
  useInteractions
} from '@floating-ui/react';
import clsx from 'clsx';
import React, { useEffect, useId, useRef, useState } from 'react';
import {
  createFloatingMiddleware,
  toFloatingPlacement
} from '../hooks/floatingConfig';
import { useControllableState } from '../hooks/useControllableState';
import { useRovingCollection } from '../hooks/useRovingCollection';
import { mergeRefs } from '../utils/mergeRefs';
import Portal from '../utils/Portal';
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
  floatingContext: ReturnType<typeof useFloating>['context'];
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  menuItems: ReturnType<typeof useRovingCollection>;
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
  const menuItems = useRovingCollection();
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
      floatingContext,
      getReferenceProps,
      getFloatingProps,
      menuItems
    }),
    [
      currentOpen,
      handleOpenChange,
      idPrefix,
      setReference,
      setFloating,
      floatingStyles,
      floatingContext,
      getReferenceProps,
      getFloatingProps,
      menuItems
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

export type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement>;

type DropdownMenuContentComponent = React.ForwardRefExoticComponent<
  Readonly<DropdownMenuContentProps> & React.RefAttributes<HTMLDivElement>
>;

const DropdownMenuContent: DropdownMenuContentComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<DropdownMenuContentProps>
>(function DropdownMenuContent({ className, style, children, ...props }, ref) {
  const {
    open,
    idPrefix,
    setFloating,
    floatingStyles,
    floatingContext,
    getFloatingProps,
    menuItems
  } = useDropdownMenuContext();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    menuItems.focusFirst();
  }, [open, menuItems]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const targetElement =
      event.target instanceof HTMLElement ? event.target : null;
    const currentItemId = menuItems.findItemIdByElement(targetElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (currentItemId) {
        menuItems.focusNext(currentItemId);
      } else {
        menuItems.focusFirst();
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (currentItemId) {
        menuItems.focusPrevious(currentItemId);
      } else {
        menuItems.focusLast();
      }
    }

    if (event.key === 'Home') {
      event.preventDefault();
      menuItems.focusFirst();
    }

    if (event.key === 'End') {
      event.preventDefault();
      menuItems.focusLast();
    }
  };
  const floatingProps = getFloatingProps({
    ...props,
    onKeyDown: handleKeyDown
  }) as React.HTMLAttributes<HTMLDivElement>;

  if (!open) return null;

  return (
    <Portal>
      <FloatingFocusManager
        context={floatingContext}
        modal
        returnFocus
        outsideElementsInert={false}
        initialFocus={0}
      >
        <div
          id={`${idPrefix}-menu`}
          role='menu'
          aria-orientation='vertical'
          ref={mergeRefs(
            menuRef,
            ref,
            setFloating as React.RefCallback<HTMLDivElement>
          )}
          className={clsx(styles.dropdown_menu, className)}
          style={{
            ...floatingStyles,
            ...style
          }}
          {...floatingProps}
        >
          {children}
        </div>
      </FloatingFocusManager>
    </Portal>
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
  const { onOpenChange, triggerRef, menuItems } = useDropdownMenuContext();
  const itemRef = useRef<HTMLButtonElement | null>(null);
  const itemId = useId();
  const mergedRef = mergeRefs(ref, itemRef);

  useEffect(() => {
    menuItems.registerItem(itemId, itemRef.current, {
      disabled: Boolean(disabled)
    });

    return () => {
      menuItems.unregisterItem(itemId);
    };
  }, [menuItems, itemId, disabled]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onSelect?.();
    props.onClick?.(event);
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={styles.dropdown_menu_item_container}>
      <button
        ref={mergedRef}
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
    </div>
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
