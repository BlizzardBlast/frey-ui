import clsx from 'clsx';
import React from 'react';
import Field from '../Field';
import { useControllableValue } from '../hooks/useControllableState';
import { computeAriaProps } from '../utils/aria';
import styles from './segmentedcontrol.module.css';

export type SegmentedControlSize = 'sm' | 'md' | 'lg';

export type SegmentedControlProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'defaultValue' | 'onChange' | 'style'
> & {
  children: React.ReactNode;
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  size?: SegmentedControlSize;
  className?: string;
  style?: React.CSSProperties;
  groupClassName?: string;
  groupStyle?: React.CSSProperties;
};

export type SegmentedControlItemProps = {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

type SegmentedControlContextValue = {
  value: string | null;
  onValueChange: (value: string) => void;
  name: string;
  disabled: boolean;
  required: boolean;
};

const SegmentedControlContext = React.createContext<
  SegmentedControlContextValue | undefined
>(undefined);

function useSegmentedControlContext(): SegmentedControlContextValue {
  const context = React.useContext(SegmentedControlContext);

  if (!context) {
    throw new Error(
      'SegmentedControl.Item must be rendered within a SegmentedControl component'
    );
  }

  return context;
}

const SizeClassMap: Record<SegmentedControlSize, string> = {
  sm: styles.segmented_control_sm,
  md: styles.segmented_control_md,
  lg: styles.segmented_control_lg,
};

type SegmentedControlRootComponent = React.ForwardRefExoticComponent<
  Readonly<SegmentedControlProps> & React.RefAttributes<HTMLDivElement>
>;

const SegmentedControlRoot: SegmentedControlRootComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<SegmentedControlProps>
>(function SegmentedControl(
  {
    children,
    label,
    value,
    defaultValue,
    onValueChange,
    hideLabel = false,
    helperText,
    error,
    disabled = false,
    required = false,
    name,
    size = 'md',
    id,
    className,
    style,
    groupClassName,
    groupStyle,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...groupProps
  },
  ref
) {
  const generatedName = React.useId();
  const groupName = name ?? generatedName;
  const [selectedValue, setSelectedValue] = useControllableValue<string | null>(
    value,
    defaultValue ?? null
  );

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      setSelectedValue(nextValue);
      onValueChange?.(nextValue);
    },
    [setSelectedValue, onValueChange]
  );

  const contextValue = React.useMemo<SegmentedControlContextValue>(
    () => ({
      value: selectedValue,
      onValueChange: handleValueChange,
      name: groupName,
      disabled,
      required,
    }),
    [selectedValue, handleValueChange, groupName, disabled, required]
  );

  return (
    <SegmentedControlContext.Provider value={contextValue}>
      <Field
        label={label}
        hideLabel={hideLabel}
        helperText={helperText}
        error={error}
        disabled={disabled}
        required={required}
        id={id}
        className={className}
        style={style}
        labelElement='span'
      >
        {({ inputId, labelId, describedBy, hasError }) => (
          <div
            {...groupProps}
            ref={ref}
            id={inputId}
            role='radiogroup'
            aria-labelledby={labelId}
            {...computeAriaProps(
              hasError,
              describedBy,
              ariaDescribedBy,
              ariaInvalid
            )}
            aria-disabled={disabled || undefined}
            className={clsx(
              styles.segmented_control,
              SizeClassMap[size],
              groupClassName
            )}
            style={groupStyle}
          >
            {children}
          </div>
        )}
      </Field>
    </SegmentedControlContext.Provider>
  );
});

SegmentedControlRoot.displayName = 'SegmentedControl';

type SegmentedControlItemComponent = React.ForwardRefExoticComponent<
  Readonly<SegmentedControlItemProps> & React.RefAttributes<HTMLInputElement>
>;

const SegmentedControlItem: SegmentedControlItemComponent = React.forwardRef<
  HTMLInputElement,
  Readonly<SegmentedControlItemProps>
>(function SegmentedControlItem(
  { children, value, disabled = false, id, className, style },
  ref
) {
  const context = useSegmentedControlContext();
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isDisabled = context.disabled || disabled;
  const isChecked = context.value === value;

  return (
    <label htmlFor={inputId} className={styles.segmented_control_item}>
      <input
        ref={ref}
        type='radio'
        id={inputId}
        name={context.name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        required={context.required}
        onChange={() => context.onValueChange(value)}
        className={styles.segmented_control_input}
      />
      <span
        className={clsx(styles.segmented_control_segment, className)}
        style={style}
      >
        {children}
      </span>
    </label>
  );
});

SegmentedControlItem.displayName = 'SegmentedControl.Item';

type SegmentedControlComponent = typeof SegmentedControlRoot & {
  Item: typeof SegmentedControlItem;
};

export const SegmentedControl: SegmentedControlComponent = Object.assign(
  SegmentedControlRoot,
  {
    Item: SegmentedControlItem,
  }
);

export default SegmentedControl;
