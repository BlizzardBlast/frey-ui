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
import styles from './dropdownmenu.module.css';

export type DropdownMenuPlacement = 'top' | 'right' | 'bottom' | 'left';

type Position = {
  top: number;
  left: number;
};

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

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null
);

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      'DropdownMenu components must be wrapped in <DropdownMenu>'
    );
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
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  const updatePosition = React.useCallback(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportPadding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.bottom + offset;
    let left = triggerRect.left;

    if (placement === 'top') {
      top = triggerRect.top - menuRect.height - offset;
    } else if (placement === 'left') {
      top = triggerRect.top;
      left = triggerRect.left - menuRect.width - offset;
    } else if (placement === 'right') {
      top = triggerRect.top;
      left = triggerRect.right + offset;
    }

    top = clamp(
      top,
      viewportPadding,
      Math.max(
        viewportPadding,
        viewportHeight - menuRect.height - viewportPadding
      )
    );
    left = clamp(
      left,
      viewportPadding,
      Math.max(
        viewportPadding,
        viewportWidth - menuRect.width - viewportPadding
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
      if (menuRef.current?.contains(targetNode)) return;

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
