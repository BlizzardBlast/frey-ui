import clsx from 'clsx';
import React, { createContext, useContext, useId } from 'react';
import { useControllableValue } from '../hooks/useControllableState';
import { ChevronDownIcon } from '../Icons';
import { mergeRefs } from '../utils/mergeRefs';
import styles from './accordion.module.css';

export type AccordionType = 'single' | 'multiple';

type AccordionContextValue = {
  type: AccordionType;
  value: string | string[];
  onValueChange: (value: string) => void;
  idPrefix: string;
};

const ACCORDION_FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]';

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

type AccordionRootComponent = React.ForwardRefExoticComponent<
  Readonly<AccordionProps> & React.RefAttributes<HTMLDivElement>
>;

const AccordionRoot: AccordionRootComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<AccordionProps>
>(function Accordion(
  { type = 'single', value, defaultValue, onValueChange, className, ...props },
  ref
) {
  const defaultVal =
    defaultValue ?? (type === 'multiple' ? ([] as string[]) : '');
  const [currentValue, setCurrentValue] = useControllableValue<
    string | string[]
  >(value, defaultVal, onValueChange);
  const idPrefix = useId();

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      let resolvedValue: string | string[];

      if (type === 'single') {
        const valueAsStr = typeof currentValue === 'string' ? currentValue : '';
        resolvedValue = valueAsStr === nextValue ? '' : nextValue;
      } else {
        const valueAsArray = Array.isArray(currentValue) ? currentValue : [];
        const isSelected = valueAsArray.includes(nextValue);

        const nextArrayValue = isSelected
          ? valueAsArray.filter((v) => v !== nextValue)
          : [...valueAsArray, nextValue];

        resolvedValue = nextArrayValue;
      }

      setCurrentValue(resolvedValue);
    },
    [type, currentValue, setCurrentValue]
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

type AccordionItemComponent = React.ForwardRefExoticComponent<
  Readonly<AccordionItemProps> & React.RefAttributes<HTMLDivElement>
>;

const AccordionItem: AccordionItemComponent = React.forwardRef<
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

type AccordionTriggerComponent = React.ForwardRefExoticComponent<
  Readonly<AccordionTriggerProps> & React.RefAttributes<HTMLButtonElement>
>;

const AccordionTrigger: AccordionTriggerComponent = React.forwardRef<
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

type AccordionContentComponent = React.ForwardRefExoticComponent<
  Readonly<AccordionContentProps> & React.RefAttributes<HTMLDivElement>
>;

const AccordionContent: AccordionContentComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<AccordionContentProps>
>(function AccordionContent({ className, children, ...props }, ref) {
  const { idPrefix } = useAccordionContext();
  const { value, isOpen } = useAccordionItemContext();
  const contentRef = React.useRef<HTMLElement | null>(null);
  const mergedContentRef = React.useMemo(
    () => mergeRefs<HTMLElement>(ref as React.Ref<HTMLElement>, contentRef),
    [ref]
  );

  React.useEffect(() => {
    const node = contentRef.current;

    if (!node) {
      return;
    }

    const focusableElements = node.querySelectorAll<HTMLElement>(
      ACCORDION_FOCUSABLE_SELECTOR
    );

    focusableElements.forEach((element) => {
      if (isOpen) {
        const originalTabIndex = element.dataset.freyAccordionTabindex;

        if (originalTabIndex === undefined) {
          return;
        }

        if (originalTabIndex === '') {
          element.removeAttribute('tabindex');
        } else {
          element.setAttribute('tabindex', originalTabIndex);
        }

        delete element.dataset.freyAccordionTabindex;
        return;
      }

      if (element.dataset.freyAccordionTabindex !== undefined) {
        return;
      }

      const currentTabIndex = element.getAttribute('tabindex');
      element.dataset.freyAccordionTabindex = currentTabIndex ?? '';
      element.setAttribute('tabindex', '-1');
    });
  }, [isOpen]);

  // Switch inner content from overflow:hidden to overflow:visible once the
  // open animation completes, so focus rings and overlays (tooltips, etc.)
  // inside expanded panels are never clipped. Reset immediately before paint
  // when closing so the collapse animation still clips correctly.
  //
  // prevIsOpenRef tracks the previous isOpen value so we can distinguish
  // between "panel starts open on mount" (no CSS transition fires) and
  // "panel transitions from closed to open" (CSS transition fires).
  const prevIsOpenRef = React.useRef(isOpen);

  React.useLayoutEffect(() => {
    const outer = contentRef.current;
    if (!outer) return;

    const inner = outer.firstElementChild as HTMLElement | null;
    if (!inner) return;

    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (!isOpen) {
      inner.style.overflow = '';
      return;
    }

    // If the panel was already open when the effect first ran (no CSS
    // transition fired — e.g. opened via defaultValue), expose the content
    // immediately so nested focus rings and overlays are not clipped.
    if (wasOpen) {
      inner.style.overflow = 'visible';
      return;
    }

    // Otherwise wait for the grid transition to finish before removing the clip.
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'grid-template-rows') {
        inner.style.overflow = 'visible';
      }
    };

    outer.addEventListener('transitionend', handleTransitionEnd);
    return () => outer.removeEventListener('transitionend', handleTransitionEnd);
  }, [isOpen]);

  return (
    <section
      ref={mergedContentRef}
      id={`${idPrefix}-content-${value}`}
      aria-labelledby={`${idPrefix}-trigger-${value}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={clsx(styles.accordion_content_wrapper, {
        [styles.accordion_content_wrapper_open]: isOpen,
        [styles.accordion_content_wrapper_closed]: !isOpen
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

type AccordionComponent = typeof AccordionRoot & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
};

export const Accordion: AccordionComponent = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent
});

export default Accordion;
