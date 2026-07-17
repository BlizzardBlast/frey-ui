import clsx from 'clsx';
import React, { useEffect, useId, useRef } from 'react';
import {
  type DismissReason,
  useDismissibleLayer,
} from '../floating/dismissibleLayer';
import { FocusScope } from '../floating/FocusScope';
import { useFloatingPosition } from '../floating/useFloatingPosition';
import { useControllableValue } from '../hooks/useControllableState';
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
  floatingRef: React.RefObject<HTMLElement | null>;
  setReference: (node: HTMLElement | null) => void;
  setFloating: (node: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
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
  children,
}: Readonly<DropdownMenuProps>): React.JSX.Element {
  const idPrefix = useId();
  const menuItems = useRovingCollection();
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
    alignment: 'start',
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
      menuItems,
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
      menuItems,
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
  const { open, onOpenChange, idPrefix, triggerRef, setReference } =
    useDropdownMenuContext();
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
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': `${idPrefix}-menu`,
  };

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
    triggerRef,
    floatingRef,
    setFloating,
    floatingStyles,
    menuItems,
  } = useDropdownMenuContext();

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
  if (!open) return null;

  return (
    <Portal>
      <FocusScope contentRef={floatingRef} triggerRef={triggerRef}>
        <div
          id={`${idPrefix}-menu`}
          role='menu'
          aria-orientation='vertical'
          ref={mergeRefs(ref, setFloating as React.RefCallback<HTMLDivElement>)}
          className={clsx(styles.dropdown_menu, className)}
          style={{
            ...floatingStyles,
            ...style,
          }}
          tabIndex={-1}
          {...props}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
      </FocusScope>
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
      disabled: Boolean(disabled),
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
          [styles.dropdown_menu_item_destructive]: destructive,
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
    Item: DropdownMenuItem,
  }
);

export default DropdownMenu;
