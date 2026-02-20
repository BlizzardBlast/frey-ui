import clsx from 'clsx';
import React, { createContext, useContext, useId, useState } from 'react';
import { ChevronDownIcon } from '../Icons';
import styles from './accordion.module.css';

export type AccordionType = 'single' | 'multiple';

type AccordionContextValue = {
  type: AccordionType;
  value: string | string[];
  onValueChange: (value: string) => void;
  idPrefix: string;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be wrapped in <Accordion>');
  }
  return context;
}

type AccordionItemContextValue = {
  value: string;
  isOpen: boolean;
};

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('Accordion.Item parts must be wrapped in <Accordion.Item>');
  }
  return context;
}

export type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
};

const AccordionRoot = React.forwardRef<
  HTMLDivElement,
  Readonly<AccordionProps>
>(function Accordion(
  { type = 'single', value, defaultValue, onValueChange, className, ...props },
  ref
) {
  const defaultVal = defaultValue ?? (type === 'multiple' ? [] : '');

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | string[]>(
    defaultVal
  );

  const currentValue = isControlled ? value : uncontrolledValue;
  const idPrefix = useId();

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      let resolvedValue: string | string[] = nextValue;

      if (type === 'single') {
        const valueAsStr = typeof currentValue === 'string' ? currentValue : '';
        resolvedValue = valueAsStr === nextValue ? '' : nextValue;

        if (!isControlled) {
          setUncontrolledValue(resolvedValue);
        }
      } else {
        const valueAsArray = Array.isArray(currentValue) ? currentValue : [];
        const isSelected = valueAsArray.includes(nextValue);

        const nextArrayValue = isSelected
          ? valueAsArray.filter((v) => v !== nextValue)
          : [...valueAsArray, nextValue];

        if (!isControlled) {
          setUncontrolledValue(nextArrayValue);
        }

        resolvedValue = nextArrayValue;
      }

      onValueChange?.(resolvedValue);
    },
    [type, currentValue, isControlled, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({
      type,
      value: currentValue,
      onValueChange: handleValueChange,
      idPrefix
    }),
    [type, currentValue, handleValueChange, idPrefix]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div ref={ref} className={clsx(styles.accordion, className)} {...props} />
    </AccordionContext.Provider>
  );
});
AccordionRoot.displayName = 'Accordion';

export type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  Readonly<AccordionItemProps>
>(function AccordionItem({ value, className, ...props }, ref) {
  const { value: accordionValue } = useAccordionContext();

  // Check if this particular item is open based on context's active value
  const isOpen = Array.isArray(accordionValue)
    ? accordionValue.includes(value)
    : accordionValue === value;

  const contextValue = React.useMemo(
    () => ({ value, isOpen }),
    [value, isOpen]
  );

  return (
    <AccordionItemContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx(styles.accordion_item, className)}
        {...props}
      />
    </AccordionItemContext.Provider>
  );
});
AccordionItem.displayName = 'Accordion.Item';

export type AccordionTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  Readonly<AccordionTriggerProps>
>(function AccordionTrigger({ className, children, ...props }, ref) {
  const { onValueChange, idPrefix } = useAccordionContext();
  const { value, isOpen } = useAccordionItemContext();

  return (
    <div className={styles.accordion_header}>
      <button
        ref={ref}
        type='button'
        id={`${idPrefix}-trigger-${value}`}
        aria-controls={`${idPrefix}-content-${value}`}
        aria-expanded={isOpen}
        onClick={() => onValueChange(value)}
        className={clsx(styles.accordion_trigger, className)}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className={clsx(styles.accordion_chevron, {
            [styles.accordion_chevron_open]: isOpen
          })}
          size={16}
        />
      </button>
    </div>
  );
});
AccordionTrigger.displayName = 'Accordion.Trigger';

export type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  Readonly<AccordionContentProps>
>(function AccordionContent({ className, children, ...props }, ref) {
  const { idPrefix } = useAccordionContext();
  const { value, isOpen } = useAccordionItemContext();

  return (
    <section
      ref={ref}
      id={`${idPrefix}-content-${value}`}
      aria-labelledby={`${idPrefix}-trigger-${value}`}
      className={clsx(styles.accordion_content_wrapper, {
        [styles.accordion_content_wrapper_open]: isOpen
      })}
      {...props}
    >
      <div className={clsx(styles.accordion_content, className)}>
        {children}
      </div>
    </section>
  );
});
AccordionContent.displayName = 'Accordion.Content';

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent
});

export default Accordion;
