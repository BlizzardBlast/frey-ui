import clsx from 'clsx';
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useControllableState } from '../hooks/useControllableState';
import { useDismiss } from '../hooks/useDismiss';
import { useFloatingPosition } from '../hooks/useFloatingPosition';
import { mergeRefs } from '../utils/mergeRefs';
import styles from './dropdownmenu.module.css';

export type DropdownMenuPlacement = 'top' | 'right' | 'bottom' | 'left';

type DropdownMenuContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement: DropdownMenuPlacement;
  offset: number;
  idPrefix: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
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

const DropdownMenuRoot = function DropdownMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  offset = 8,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  children
}: Readonly<DropdownMenuProps>) {
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
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
};
DropdownMenuRoot.displayName = 'DropdownMenu';

export type DropdownMenuTriggerProps = {
  children: React.ReactElement;
  asChild?: boolean;
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLElement,
  Readonly<DropdownMenuTriggerProps>
>(function DropdownMenuTrigger({ children }, ref) {
  const { open, onOpenChange, idPrefix, triggerRef } = useDropdownMenuContext();

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
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': `${idPrefix}-menu`
  } as Record<string, unknown>);
});
DropdownMenuTrigger.displayName = 'DropdownMenu.Trigger';

export type DropdownMenuContentProps = React.HTMLAttributes<HTMLMenuElement>;

const DropdownMenuContent = React.forwardRef<
  HTMLMenuElement,
  Readonly<DropdownMenuContentProps>
>(function DropdownMenuContent({ className, style, children, ...props }, ref) {
  const {
    open,
    onOpenChange,
    placement,
    offset,
    idPrefix,
    triggerRef,
    closeOnEscape,
    closeOnOutsideClick
  } = useDropdownMenuContext();

  const menuRef = useRef<HTMLMenuElement | null>(null);

  const position = useFloatingPosition(triggerRef, menuRef, {
    open,
    placement,
    offset,
    align: 'start'
  });

  useDismiss({
    open,
    onClose: () => onOpenChange(false),
    triggerRef,
    contentRef: menuRef,
    closeOnEscape,
    closeOnOutsideClick,
    returnFocusOnClose: true
  });

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

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <menu
      id={`${idPrefix}-menu`}
      ref={mergeRefs(menuRef, ref)}
      className={clsx(styles.dropdown_menu, className)}
      onKeyDown={handleKeyDown}
      style={{
        top: position.top,
        left: position.left,
        ...style
      }}
      {...props}
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

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  Readonly<DropdownMenuItemProps>
>(function DropdownMenuItem(
  { disabled, destructive, onSelect, className, children, ...props },
  ref
) {
  const { onOpenChange, triggerRef } = useDropdownMenuContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onSelect?.();
    props.onClick?.(e);
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

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem
});

export default DropdownMenu;
