import clsx from 'clsx';
import React, { createContext, useContext, useId } from 'react';
import { useControllableValue } from '../hooks/useControllableState';
import { useRovingCollection } from '../hooks/useRovingCollection';
import { mergeRefs } from '../utils/mergeRefs';
import styles from './tabs.module.css';

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  idPrefix: string;
  triggerCollection: ReturnType<typeof useRovingCollection>;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      'Tabs compound components must be rendered within a Tabs component'
    );
  }
  return context;
}

export type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type TabsRootComponent = React.ForwardRefExoticComponent<
  Readonly<TabsProps> & React.RefAttributes<HTMLDivElement>
>;

const TabsRoot: TabsRootComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<TabsProps>
>(function Tabs(
  { value, defaultValue, onValueChange, className, ...props },
  ref
) {
  const idPrefix = useId();
  const triggerCollection = useRovingCollection();
  const [currentValue, setCurrentValue] = useControllableValue<string>(
    value,
    defaultValue ?? '',
    onValueChange
  );

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      setCurrentValue(nextValue);
    },
    [setCurrentValue]
  );

  const contextValue = React.useMemo(
    () => ({
      value: currentValue,
      onValueChange: handleValueChange,
      idPrefix,
      triggerCollection
    }),
    [currentValue, handleValueChange, idPrefix, triggerCollection]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div ref={ref} className={clsx(styles.tabs, className)} {...props} />
    </TabsContext.Provider>
  );
});
TabsRoot.displayName = 'Tabs';

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

type TabsListComponent = React.ForwardRefExoticComponent<
  Readonly<TabsListProps> & React.RefAttributes<HTMLDivElement>
>;

const TabsList: TabsListComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<TabsListProps>
>(function TabsList({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      role='tablist'
      className={clsx(styles.tabs_list, className)}
      {...props}
    />
  );
});
TabsList.displayName = 'Tabs.List';

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

type TabsTriggerComponent = React.ForwardRefExoticComponent<
  Readonly<TabsTriggerProps> & React.RefAttributes<HTMLButtonElement>
>;

const TabsTrigger: TabsTriggerComponent = React.forwardRef<
  HTMLButtonElement,
  Readonly<TabsTriggerProps>
>(function TabsTrigger(
  { value: triggerValue, className, disabled = false, ...props },
  ref
) {
  const {
    value: selectedValue,
    onValueChange,
    idPrefix,
    triggerCollection
  } = useTabsContext();
  const isSelected = selectedValue === triggerValue;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const mergedRef = mergeRefs(ref, triggerRef);

  React.useEffect(() => {
    triggerCollection.registerItem(triggerValue, triggerRef.current, {
      disabled,
      value: triggerValue
    });

    return () => {
      triggerCollection.unregisterItem(triggerValue);
    };
  }, [triggerCollection, triggerValue, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentId = triggerCollection.findItemIdByElement(e.currentTarget);
    if (!currentId) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextId = triggerCollection.focusNext(currentId);
      if (nextId) {
        onValueChange(nextId);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const previousId = triggerCollection.focusPrevious(currentId);
      if (previousId) {
        onValueChange(previousId);
      }
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      const firstId = triggerCollection.focusFirst();
      if (firstId) {
        onValueChange(firstId);
      }
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      const lastId = triggerCollection.focusLast();
      if (lastId) {
        onValueChange(lastId);
      }
    }
  };

  return (
    <button
      ref={mergedRef}
      type='button'
      role='tab'
      id={`${idPrefix}-tab-${triggerValue}`}
      aria-controls={`${idPrefix}-panel-${triggerValue}`}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => onValueChange(triggerValue)}
      onKeyDown={handleKeyDown}
      className={clsx(styles.tabs_trigger, className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'Tabs.Trigger';

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

type TabsContentComponent = React.ForwardRefExoticComponent<
  Readonly<TabsContentProps> & React.RefAttributes<HTMLDivElement>
>;

const TabsContent: TabsContentComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<TabsContentProps>
>(function TabsContent(
  { value: contentValue, className, children, ...props },
  ref
) {
  const { value: selectedValue, idPrefix } = useTabsContext();
  const isSelected = selectedValue === contentValue;

  if (!isSelected) {
    return null;
  }

  return (
    <div
      ref={ref}
      role='tabpanel'
      id={`${idPrefix}-panel-${contentValue}`}
      aria-labelledby={`${idPrefix}-tab-${contentValue}`}
      className={clsx(styles.tabs_content, className)}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = 'Tabs.Content';

type TabsComponent = typeof TabsRoot & {
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Content: typeof TabsContent;
};

export const Tabs: TabsComponent = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent
});

export default Tabs;
