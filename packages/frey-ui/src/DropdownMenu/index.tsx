import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';
import styles from './dropdownmenu.module.css';

export type DropdownMenuPlacement = 'top' | 'right' | 'bottom' | 'left';

export type DropdownMenuItem = {
  value: string;
  label: string;
  disabled?: boolean;
  destructive?: boolean;
};

export type DropdownMenuProps = {
  trigger: React.ReactElement;
  items: ReadonlyArray<DropdownMenuItem>;
  onSelect?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DropdownMenuPlacement;
  offset?: number;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  menuClassName?: string;
  menuStyle?: React.CSSProperties;
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

function findNextEnabledIndex(
  items: ReadonlyArray<DropdownMenuItem>,
  startIndex: number,
  direction: 1 | -1
) {
  if (items.length === 0) {
    return -1;
  }

  let index = startIndex;

  for (const _item of items) {
    index = (index + direction + items.length) % items.length;

    if (!items[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

function DropdownMenu({
  trigger,
  items,
  onSelect,
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
  menuClassName,
  menuStyle
}: Readonly<DropdownMenuProps>) {
  const generatedId = React.useId();
  const menuId = id ?? `${generatedId}-dropdown-menu`;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const menuRef = React.useRef<HTMLMenuElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
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
    if (!isOpen || !triggerRef.current || !menuRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportPadding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = triggerRect.bottom + offset;
    let left = triggerRect.left;

    if (placement === 'top') {
      top = triggerRect.top - menuRect.height - offset;
    }

    if (placement === 'left') {
      top = triggerRect.top;
      left = triggerRect.left - menuRect.width - offset;
    }

    if (placement === 'right') {
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
  }, [isOpen, offset, placement]);

  React.useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const firstEnabledIndex = items.findIndex((item) => !item.disabled);

    if (firstEnabledIndex >= 0) {
      itemRefs.current[firstEnabledIndex]?.focus();
    }
  }, [isOpen, items]);

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

      if (menuRef.current?.contains(targetNode)) {
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
        triggerRef.current?.focus();
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

  const handleSelect = (item: DropdownMenuItem) => {
    if (item.disabled) {
      return;
    }

    onSelect?.(item.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleMenuItemKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (
    event
  ) => {
    const currentIndex = itemRefs.current.indexOf(event.currentTarget);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = findNextEnabledIndex(items, currentIndex, 1);

      if (nextIndex >= 0) {
        itemRefs.current[nextIndex]?.focus();
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = findNextEnabledIndex(items, currentIndex, -1);

      if (prevIndex >= 0) {
        itemRefs.current[prevIndex]?.focus();
      }
    }

    if (event.key === 'Home') {
      event.preventDefault();
      const firstIndex = items.findIndex((item) => !item.disabled);

      if (firstIndex >= 0) {
        itemRefs.current[firstIndex]?.focus();
      }
    }

    if (event.key === 'End') {
      event.preventDefault();
      const lastIndex = [...items]
        .reverse()
        .findIndex((item) => !item.disabled);

      if (lastIndex >= 0) {
        const resolvedIndex = items.length - 1 - lastIndex;
        itemRefs.current[resolvedIndex]?.focus();
      }
    }
  };

  const triggerElement = React.cloneElement(trigger, {
    ref: mergeRefs<HTMLElement>(triggerProps.ref, triggerRef),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);

      if (!event.defaultPrevented) {
        setOpen(!isOpen);
      }
    },
    'aria-haspopup': 'menu',
    'aria-controls': menuId,
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
          <menu
            id={menuId}
            ref={menuRef}
            className={clsx(styles.dropdown_menu, className, menuClassName)}
            style={{
              top: position.top,
              left: position.left,
              ...style,
              ...menuStyle
            }}
          >
            {items.map((item, index) => (
              <li
                key={item.value}
                className={styles.dropdown_menu_item_container}
              >
                <button
                  type='button'
                  disabled={item.disabled}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className={clsx(styles.dropdown_menu_item, {
                    [styles.dropdown_menu_item_destructive]: item.destructive
                  })}
                  onKeyDown={handleMenuItemKeyDown}
                  onClick={() => handleSelect(item)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </menu>,
          document.body
        )}
    </>
  );
}

export default DropdownMenu;
