import clsx from 'clsx';
import React, { createContext, useContext, useId, useState } from 'react';
import styles from './tabs.module.css';

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  idPrefix: string;
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

const TabsRoot = React.forwardRef<HTMLDivElement, Readonly<TabsProps>>(
  function Tabs(
    { value, defaultValue, onValueChange, className, ...props },
    ref
  ) {
    const idPrefix = useId();
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(
      defaultValue ?? ''
    );

    const currentValue = isControlled ? value : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange]
    );

    const contextValue = React.useMemo(
      () => ({
        value: currentValue,
        onValueChange: handleValueChange,
        idPrefix
      }),
      [currentValue, handleValueChange, idPrefix]
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={clsx(styles.tabs, className)} {...props} />
      </TabsContext.Provider>
    );
  }
);
TabsRoot.displayName = 'Tabs';

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

const TabsList = React.forwardRef<HTMLDivElement, Readonly<TabsListProps>>(
  function TabsList({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role='tablist'
        className={clsx(styles.tabs_list, className)}
        {...props}
      />
    );
  }
);
TabsList.displayName = 'Tabs.List';

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  Readonly<TabsTriggerProps>
>(function TabsTrigger({ value: triggerValue, className, ...props }, ref) {
  const { value: selectedValue, onValueChange, idPrefix } = useTabsContext();
  const isSelected = selectedValue === triggerValue;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Basic Arrow Right / Arrow Left navigation handling
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const triggerElements = Array.from(
        e.currentTarget.parentElement?.querySelectorAll('[role="tab"]') ?? []
      ) as HTMLButtonElement[];

      const currentIndex = triggerElements.indexOf(e.currentTarget);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % triggerElements.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex =
          (currentIndex - 1 + triggerElements.length) % triggerElements.length;
      }

      const nextTrigger = triggerElements[nextIndex];
      if (nextTrigger) {
        nextTrigger.focus();
        nextTrigger.click(); // Standard behavior for tabs to switch on arrow focus
      }
    }
  };

  return (
    <button
      ref={ref}
      type='button'
      role='tab'
      id={`${idPrefix}-tab-${triggerValue}`}
      aria-controls={`${idPrefix}-panel-${triggerValue}`}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
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

const TabsContent = React.forwardRef<
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

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent
});

export default Tabs;
