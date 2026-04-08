import clsx from 'clsx';
import React, { createContext, useContext, useId } from 'react';
import Dialog, {
  type DialogContentProps,
  type DialogTriggerProps
} from '../Dialog';
import { useControllableState } from '../hooks/useControllableState';
import styles from './commandpalette.module.css';

type RegisteredCommandItem = {
  id: string;
  value: string;
  searchText: string;
  keywords: ReadonlyArray<string>;
  disabled: boolean;
  groupId: string | null;
  onSelect?: (value: string) => void;
  element: HTMLButtonElement | null;
};

type RegisteredCommandItemConfig = Omit<RegisteredCommandItem, 'element'>;

type CommandPaletteContextValue = {
  idPrefix: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputId: string;
  listId: string;
  query: string;
  setQuery: (query: string) => void;
  activeItemId: string | null;
  hasVisibleItems: boolean;
  isItemVisible: (itemId: string) => boolean;
  isGroupVisible: (groupId: string) => boolean;
  setActiveItemId: (itemId: string | null) => void;
  focusNextItem: () => void;
  focusPreviousItem: () => void;
  selectItem: (itemId: string) => void;
  upsertItem: (item: RegisteredCommandItemConfig) => void;
  removeItem: (itemId: string) => void;
  setItemElement: (itemId: string, element: HTMLButtonElement | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null
);

function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error(
      'CommandPalette compound components must be rendered within a CommandPalette component'
    );
  }

  return context;
}

const CommandPaletteGroupContext = createContext<string | null>(null);

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function matchesCommandItem(
  item: RegisteredCommandItem,
  normalizedQuery: string
) {
  if (!normalizedQuery) {
    return true;
  }

  const keywordsText = item.keywords.join(' ');
  const candidate = normalizeQuery(
    `${item.value} ${item.searchText} ${keywordsText}`
  );

  return candidate.includes(normalizedQuery);
}

export type CommandPaletteProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
};

type CommandPaletteRootComponent = {
  (props: Readonly<CommandPaletteProps>): React.JSX.Element;
  displayName?: string;
};

const CommandPaletteRoot: CommandPaletteRootComponent =
  function CommandPalette({
    open,
    defaultOpen = false,
    onOpenChange,
    onSelect,
    children
  }: Readonly<CommandPaletteProps>): React.JSX.Element {
    const idPrefix = useId();
    const inputId = `${idPrefix}-input`;
    const listId = `${idPrefix}-list`;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const itemsRef = React.useRef<Map<string, RegisteredCommandItem>>(
      new Map()
    );
    const [, bumpItemsVersion] = React.useReducer(
      (version: number) => version + 1,
      0
    );
    const [query, setQuery] = React.useState('');
    const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
    const [currentOpen, setCurrentOpen] = useControllableState(
      open,
      defaultOpen,
      onOpenChange
    );

    const handleOpenChange = React.useCallback(
      (nextOpen: boolean) => {
        setCurrentOpen(nextOpen);
      },
      [setCurrentOpen]
    );

    const orderedItems = Array.from(itemsRef.current.values());

    const normalizedQuery = normalizeQuery(query);

    const visibleItems = React.useMemo(() => {
      return orderedItems.filter((item) =>
        matchesCommandItem(item, normalizedQuery)
      );
    }, [normalizedQuery, orderedItems]);

    const visibleItemIds = React.useMemo(() => {
      return new Set(visibleItems.map((item) => item.id));
    }, [visibleItems]);

    const visibleGroupIds = React.useMemo(() => {
      return new Set(
        visibleItems
          .map((item) => item.groupId)
          .filter((groupId): groupId is string => Boolean(groupId))
      );
    }, [visibleItems]);

    const visibleEnabledItemIds = React.useMemo(() => {
      return visibleItems
        .filter((item) => !item.disabled)
        .map((item) => item.id);
    }, [visibleItems]);

    const hasVisibleItems = visibleItems.length > 0;

    const upsertItem = React.useCallback(
      (itemConfig: RegisteredCommandItemConfig) => {
        const currentItem = itemsRef.current.get(itemConfig.id);

        itemsRef.current.set(itemConfig.id, {
          element: currentItem?.element ?? null,
          ...itemConfig
        });

        bumpItemsVersion();
      },
      []
    );

    const removeItem = React.useCallback((itemId: string) => {
      itemsRef.current.delete(itemId);
      bumpItemsVersion();
    }, []);

    const setItemElement = React.useCallback(
      (itemId: string, element: HTMLButtonElement | null) => {
        const currentItem = itemsRef.current.get(itemId);

        if (!currentItem || currentItem.element === element) {
          return;
        }

        itemsRef.current.set(itemId, {
          ...currentItem,
          element
        });

        bumpItemsVersion();
      },
      []
    );

    const focusNextItem = React.useCallback(() => {
      if (visibleEnabledItemIds.length === 0) {
        setActiveItemId(null);
        return;
      }

      setActiveItemId((currentItemId) => {
        const currentIndex = visibleEnabledItemIds.indexOf(
          String(currentItemId)
        );
        const safeIndex = Math.max(currentIndex, -1);

        const nextIndex = (safeIndex + 1) % visibleEnabledItemIds.length;
        return visibleEnabledItemIds[nextIndex];
      });
    }, [visibleEnabledItemIds]);

    const focusPreviousItem = React.useCallback(() => {
      if (visibleEnabledItemIds.length === 0) {
        setActiveItemId(null);
        return;
      }

      setActiveItemId((currentItemId) => {
        const currentIndex = visibleEnabledItemIds.indexOf(
          String(currentItemId)
        );
        const safeIndex = Math.max(currentIndex, 0);

        const previousIndex =
          (safeIndex - 1 + visibleEnabledItemIds.length) %
          visibleEnabledItemIds.length;

        return visibleEnabledItemIds[previousIndex];
      });
    }, [visibleEnabledItemIds]);

    const selectItem = React.useCallback(
      (itemId: string) => {
        const item = itemsRef.current.get(itemId);

        if (!item || item.disabled || !visibleItemIds.has(itemId)) {
          return;
        }

        item.onSelect?.(item.value);
        onSelect?.(item.value);
        handleOpenChange(false);
      },
      [handleOpenChange, onSelect, visibleItemIds]
    );

    const isItemVisible = React.useCallback(
      (itemId: string) => {
        return visibleItemIds.has(itemId);
      },
      [visibleItemIds]
    );

    const isGroupVisible = React.useCallback(
      (groupId: string) => {
        return visibleGroupIds.has(groupId);
      },
      [visibleGroupIds]
    );

    React.useEffect(() => {
      if (!currentOpen) {
        setQuery('');
        setActiveItemId(null);
        return;
      }

      setActiveItemId((currentItemId) => {
        if (currentItemId && visibleEnabledItemIds.includes(currentItemId)) {
          return currentItemId;
        }

        return visibleEnabledItemIds[0] ?? null;
      });
    }, [currentOpen, visibleEnabledItemIds]);

    React.useEffect(() => {
      if (!currentOpen) {
        return;
      }

      const frame = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }, [currentOpen]);

    const contextValue = React.useMemo(
      () => ({
        idPrefix,
        open: currentOpen,
        onOpenChange: handleOpenChange,
        inputId,
        listId,
        query,
        setQuery,
        activeItemId,
        hasVisibleItems,
        isItemVisible,
        isGroupVisible,
        setActiveItemId,
        focusNextItem,
        focusPreviousItem,
        selectItem,
        upsertItem,
        removeItem,
        setItemElement,
        inputRef
      }),
      [
        idPrefix,
        currentOpen,
        handleOpenChange,
        inputId,
        listId,
        query,
        activeItemId,
        hasVisibleItems,
        isItemVisible,
        isGroupVisible,
        focusNextItem,
        focusPreviousItem,
        selectItem,
        upsertItem,
        removeItem,
        setItemElement
      ]
    );

    return (
      <Dialog open={currentOpen} onOpenChange={handleOpenChange}>
        <CommandPaletteContext.Provider value={contextValue}>
          {children}
        </CommandPaletteContext.Provider>
      </Dialog>
    );
  };
CommandPaletteRoot.displayName = 'CommandPalette';

export type CommandPaletteTriggerProps = DialogTriggerProps;

type CommandPaletteTriggerComponent = React.ForwardRefExoticComponent<
  Readonly<CommandPaletteTriggerProps> & React.RefAttributes<HTMLElement>
>;

const CommandPaletteTrigger: CommandPaletteTriggerComponent = React.forwardRef<
  HTMLElement,
  Readonly<CommandPaletteTriggerProps>
>(function CommandPaletteTrigger({ children, ...triggerProps }, ref) {
  return (
    <Dialog.Trigger ref={ref} {...triggerProps}>
      {children}
    </Dialog.Trigger>
  );
});
CommandPaletteTrigger.displayName = 'CommandPalette.Trigger';

export type CommandPaletteContentProps = DialogContentProps;

type CommandPaletteContentComponent = React.ForwardRefExoticComponent<
  Readonly<CommandPaletteContentProps> & React.RefAttributes<HTMLDialogElement>
>;

const CommandPaletteContent: CommandPaletteContentComponent = React.forwardRef<
  HTMLDialogElement,
  Readonly<CommandPaletteContentProps>
>(function CommandPaletteContent(
  {
    className,
    containerClassName,
    closeLabel = 'Close command palette',
    closeOnEscape = true,
    closeOnOverlayClick = true,
    hideCloseButton = false,
    children,
    ...contentProps
  },
  ref
) {
  return (
    <Dialog.Content
      ref={ref}
      closeLabel={closeLabel}
      closeOnEscape={closeOnEscape}
      closeOnOverlayClick={closeOnOverlayClick}
      hideCloseButton={hideCloseButton}
      containerClassName={clsx(
        styles.command_palette_container,
        containerClassName
      )}
      className={clsx(styles.command_palette_content, className)}
      {...contentProps}
    >
      {children}
    </Dialog.Content>
  );
});
CommandPaletteContent.displayName = 'CommandPalette.Content';

export type CommandPaletteInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'id' | 'role' | 'className' | 'style'
> & {
  label?: string;
  hideLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type CommandPaletteInputComponent = React.ForwardRefExoticComponent<
  Readonly<CommandPaletteInputProps> & React.RefAttributes<HTMLInputElement>
>;

const CommandPaletteInput: CommandPaletteInputComponent = React.forwardRef<
  HTMLInputElement,
  Readonly<CommandPaletteInputProps>
>(function CommandPaletteInput(
  {
    label = 'Search commands',
    hideLabel = false,
    placeholder = 'Type a command or search…',
    className,
    style,
    onChange,
    onKeyDown,
    autoComplete,
    ...inputProps
  },
  ref
) {
  const {
    open,
    onOpenChange,
    inputId,
    listId,
    query,
    setQuery,
    activeItemId,
    isItemVisible,
    focusNextItem,
    focusPreviousItem,
    selectItem,
    inputRef
  } = useCommandPaletteContext();

  const handleRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    },
    [inputRef, ref]
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setQuery(event.target.value);
    onChange?.(event);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusNextItem();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusPreviousItem();
      return;
    }

    if (event.key === 'Enter' && activeItemId) {
      event.preventDefault();
      selectItem(activeItemId);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <div className={styles.command_palette_input_section}>
      <label
        htmlFor={inputId}
        className={clsx(
          styles.command_palette_label,
          hideLabel && styles.visually_hidden
        )}
      >
        {label}
      </label>
      <input
        ref={handleRef}
        id={inputId}
        type='text'
        role='combobox'
        value={query}
        autoComplete={autoComplete ?? 'off'}
        aria-autocomplete='list'
        aria-haspopup='listbox'
        aria-controls={listId}
        aria-expanded={open}
        aria-activedescendant={
          activeItemId && isItemVisible(activeItemId) ? activeItemId : undefined
        }
        className={clsx(styles.command_palette_input, className)}
        style={style}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...inputProps}
      />
    </div>
  );
});
CommandPaletteInput.displayName = 'CommandPalette.Input';

export type CommandPaletteListProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'id' | 'role'
>;

type CommandPaletteListComponent = React.ForwardRefExoticComponent<
  Readonly<CommandPaletteListProps> & React.RefAttributes<HTMLDivElement>
>;

const CommandPaletteList: CommandPaletteListComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<CommandPaletteListProps>
>(function CommandPaletteList({ className, ...props }, ref) {
  const { listId } = useCommandPaletteContext();

  return (
    <div
      ref={ref}
      {...props}
      id={listId}
      role='listbox'
      className={clsx(styles.command_palette_list, className)}
    />
  );
});
CommandPaletteList.displayName = 'CommandPalette.List';

export type CommandPaletteGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  heading: string;
};

type CommandPaletteGroupComponent = React.ForwardRefExoticComponent<
  Readonly<CommandPaletteGroupProps> & React.RefAttributes<HTMLDivElement>
>;

const CommandPaletteGroup: CommandPaletteGroupComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<CommandPaletteGroupProps>
>(function CommandPaletteGroup(
  { heading, className, children, ...props },
  ref
) {
  const { query, isGroupVisible } = useCommandPaletteContext();
  const groupId = useId();
  const headingId = `${groupId}-heading`;
  const isVisible = !query || isGroupVisible(groupId);

  return (
    <CommandPaletteGroupContext.Provider value={groupId}>
      <section
        ref={ref}
        aria-labelledby={headingId}
        hidden={!isVisible}
        className={clsx(styles.command_palette_group, className)}
        {...props}
      >
        <h3 id={headingId} className={styles.command_palette_group_heading}>
          {heading}
        </h3>
        <div className={styles.command_palette_group_items}>{children}</div>
      </section>
    </CommandPaletteGroupContext.Provider>
  );
});
CommandPaletteGroup.displayName = 'CommandPalette.Group';

export type CommandPaletteItemProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'onSelect' | 'className' | 'style'
> & {
  value: string;
  searchText?: string;
  keywords?: ReadonlyArray<string>;
  onSelect?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
};

type CommandPaletteItemComponent = React.ForwardRefExoticComponent<
  Readonly<CommandPaletteItemProps> & React.RefAttributes<HTMLButtonElement>
>;

const CommandPaletteItem: CommandPaletteItemComponent = React.forwardRef<
  HTMLButtonElement,
  Readonly<CommandPaletteItemProps>
>(function CommandPaletteItem(
  {
    id,
    value,
    searchText,
    keywords = [],
    disabled = false,
    onSelect,
    onClick,
    onMouseEnter,
    className,
    children,
    ...props
  },
  ref
) {
  const groupId = useContext(CommandPaletteGroupContext);
  const generatedId = useId();
  const {
    idPrefix,
    activeItemId,
    setActiveItemId,
    isItemVisible,
    selectItem,
    upsertItem,
    removeItem,
    setItemElement
  } = useCommandPaletteContext();
  const itemElementRef = React.useRef<HTMLButtonElement | null>(null);
  const keywordsSignature = keywords.join('||');
  const itemId = id ?? `${idPrefix}-item-${generatedId}`;

  React.useEffect(() => {
    upsertItem({
      id: itemId,
      value,
      searchText: searchText ?? value,
      keywords:
        keywordsSignature.length > 0 ? keywordsSignature.split('||') : [],
      disabled,
      groupId,
      onSelect
    });
    setItemElement(itemId, itemElementRef.current);

    return () => {
      removeItem(itemId);
    };
  }, [
    itemId,
    value,
    searchText,
    keywordsSignature,
    disabled,
    groupId,
    onSelect,
    upsertItem,
    removeItem,
    setItemElement
  ]);

  const isVisible = isItemVisible(itemId);
  const isActive = activeItemId === itemId;

  const handleRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      itemElementRef.current = node;
      setItemElement(itemId, node);

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    },
    [itemId, setItemElement, ref]
  );

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);

    if (event.defaultPrevented || disabled || !isVisible) {
      return;
    }

    selectItem(itemId);
  };

  const handleMouseEnter: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    onMouseEnter?.(event);

    if (event.defaultPrevented || disabled || !isVisible) {
      return;
    }

    setActiveItemId(itemId);
  };

  return (
    <button
      ref={handleRef}
      id={itemId}
      type='button'
      role='option'
      tabIndex={-1}
      hidden={!isVisible}
      disabled={disabled}
      aria-selected={isVisible && isActive}
      aria-disabled={disabled || undefined}
      className={clsx(styles.command_palette_item, className, {
        [styles.command_palette_item_active]: isVisible && isActive,
        [styles.command_palette_item_disabled]: disabled
      })}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseDown={(event) => {
        if (disabled || !isVisible) {
          return;
        }

        event.preventDefault();
      }}
      {...props}
    >
      {children}
    </button>
  );
});
CommandPaletteItem.displayName = 'CommandPalette.Item';

export type CommandPaletteEmptyProps =
  React.HTMLAttributes<HTMLParagraphElement>;

type CommandPaletteEmptyComponent = React.ForwardRefExoticComponent<
  Readonly<CommandPaletteEmptyProps> & React.RefAttributes<HTMLParagraphElement>
>;

const CommandPaletteEmpty: CommandPaletteEmptyComponent = React.forwardRef<
  HTMLParagraphElement,
  Readonly<CommandPaletteEmptyProps>
>(function CommandPaletteEmpty(
  { className, children = 'No commands found.', ...props },
  ref
) {
  const { hasVisibleItems } = useCommandPaletteContext();

  if (hasVisibleItems) {
    return null;
  }

  return (
    <p
      ref={ref}
      role='status'
      aria-live='polite'
      className={clsx(styles.command_palette_empty, className)}
      {...props}
    >
      {children}
    </p>
  );
});
CommandPaletteEmpty.displayName = 'CommandPalette.Empty';

export type CommandPaletteShortcutProps = React.HTMLAttributes<HTMLElement>;

type CommandPaletteShortcutComponent = React.ForwardRefExoticComponent<
  Readonly<CommandPaletteShortcutProps> & React.RefAttributes<HTMLElement>
>;

const CommandPaletteShortcut: CommandPaletteShortcutComponent =
  React.forwardRef<HTMLElement, Readonly<CommandPaletteShortcutProps>>(
    function CommandPaletteShortcut({ className, ...props }, ref) {
      return (
        <kbd
          ref={ref}
          className={clsx(styles.command_palette_shortcut, className)}
          {...props}
        />
      );
    }
  );
CommandPaletteShortcut.displayName = 'CommandPalette.Shortcut';

type CommandPaletteComponent = typeof CommandPaletteRoot & {
  Trigger: typeof CommandPaletteTrigger;
  Content: typeof CommandPaletteContent;
  Input: typeof CommandPaletteInput;
  List: typeof CommandPaletteList;
  Group: typeof CommandPaletteGroup;
  Item: typeof CommandPaletteItem;
  Empty: typeof CommandPaletteEmpty;
  Shortcut: typeof CommandPaletteShortcut;
};

export const CommandPalette: CommandPaletteComponent = Object.assign(
  CommandPaletteRoot,
  {
    Trigger: CommandPaletteTrigger,
    Content: CommandPaletteContent,
    Input: CommandPaletteInput,
    List: CommandPaletteList,
    Group: CommandPaletteGroup,
    Item: CommandPaletteItem,
    Empty: CommandPaletteEmpty,
    Shortcut: CommandPaletteShortcut
  }
);

export default CommandPalette;
