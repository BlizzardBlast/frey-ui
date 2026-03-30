import clsx from 'clsx';
import React from 'react';
import Field from '../Field';
import { useControllableValue } from '../hooks/useControllableState';
import { ChevronDownIcon } from '../Icons';
import { computeAriaProps } from '../utils/aria';
import styles from './combobox.module.css';

export type ComboboxSize = 'sm' | 'md' | 'lg';

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ComboboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | 'type'
  | 'size'
  | 'className'
  | 'style'
  | 'value'
  | 'defaultValue'
  | 'onChange'
> & {
  label: string;
  options: ReadonlyArray<ComboboxOption>;
  hideLabel?: boolean;
  error?: string;
  helperText?: string;
  size?: ComboboxSize;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  noResultsText?: string;
  className?: string;
  style?: React.CSSProperties;
};

type ComboboxComponent = React.ForwardRefExoticComponent<
  Readonly<ComboboxProps> & React.RefAttributes<HTMLInputElement>
>;

const SizeClassMap: Record<ComboboxSize, string> = {
  sm: styles.combobox_input_sm,
  md: styles.combobox_input_md,
  lg: styles.combobox_input_lg
};

function findNextEnabledOptionIndex(
  options: ReadonlyArray<ComboboxOption>,
  startIndex: number,
  direction: 1 | -1
) {
  if (options.length === 0) {
    return -1;
  }

  let currentIndex = startIndex;

  for (const _option of options) {
    currentIndex = (currentIndex + direction + options.length) % options.length;
    if (!options[currentIndex]?.disabled) {
      return currentIndex;
    }
  }

  return -1;
}

function dispatchInputChangeEvent(input: HTMLInputElement, nextValue: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    globalThis.HTMLInputElement.prototype,
    'value'
  )?.set;

  nativeInputValueSetter?.call(input, nextValue);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

const Combobox: ComboboxComponent = React.forwardRef<
  HTMLInputElement,
  Readonly<ComboboxProps>
>(function Combobox(
  {
    label,
    options,
    hideLabel = false,
    error,
    helperText,
    size = 'md',
    value,
    defaultValue,
    onChange,
    noResultsText = 'No results found',
    className,
    style,
    id,
    disabled = false,
    required = false,
    autoComplete,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...inputProps
  },
  ref
) {
  const [currentValue, setCurrentValue] = useControllableValue<string>(
    value,
    defaultValue ?? ''
  );
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const query = currentValue.trim().toLowerCase();
  const filteredOptions = React.useMemo(() => {
    if (!query) {
      return options;
    }

    return options.filter((option) => {
      const candidate = `${option.label} ${option.value}`.toLowerCase();
      return candidate.includes(query);
    });
  }, [options, query]);

  const closeOptions = React.useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const selectOption = React.useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) {
        return;
      }

      setCurrentValue(option.label);
      closeOptions();

      if (onChange && inputRef.current) {
        dispatchInputChangeEvent(inputRef.current, option.label);
      }
    },
    [closeOptions, onChange, setCurrentValue]
  );

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        closeOptions();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [closeOptions, open]);

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      error={error}
      helperText={helperText}
      disabled={disabled}
      required={required}
      id={id}
      className={className}
      style={style}
    >
      {({ inputId, describedBy, hasError }) => {
        const listboxId = `${inputId}-listbox`;
        const activeOptionId =
          activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined;

        const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
          event
        ) => {
          setCurrentValue(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
          onChange?.(event);
        };

        const handleInputFocus: React.FocusEventHandler<HTMLInputElement> = (
          event
        ) => {
          onFocus?.(event);
          if (!event.defaultPrevented && !disabled) {
            setOpen(true);
          }
        };

        const handleInputBlur: React.FocusEventHandler<HTMLInputElement> = (
          event
        ) => {
          onBlur?.(event);
          const nextFocused = event.relatedTarget;

          if (
            !nextFocused ||
            (nextFocused instanceof Node &&
              rootRef.current &&
              !rootRef.current.contains(nextFocused))
          ) {
            closeOptions();
          }
        };

        const handleInputClick: React.MouseEventHandler<HTMLInputElement> = (
          event
        ) => {
          onClick?.(event);
          if (!event.defaultPrevented && !disabled) {
            setOpen(true);
          }
        };

        const handleInputKeyDown: React.KeyboardEventHandler<
          HTMLInputElement
        > = (event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled) {
            return;
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open) {
              setOpen(true);
            }
            setActiveIndex((previousIndex) =>
              findNextEnabledOptionIndex(filteredOptions, previousIndex, 1)
            );
            return;
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) {
              setOpen(true);
            }
            setActiveIndex((previousIndex) =>
              findNextEnabledOptionIndex(filteredOptions, previousIndex, -1)
            );
            return;
          }

          if (event.key === 'Enter' && open && activeIndex >= 0) {
            event.preventDefault();
            const selectedOption = filteredOptions[activeIndex];
            if (selectedOption) {
              selectOption(selectedOption);
            }
            return;
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            closeOptions();
          }
        };

        return (
          <div ref={rootRef} className={styles.combobox_root}>
            <div className={styles.combobox_input_wrapper}>
              <input
                ref={(node) => {
                  inputRef.current = node;

                  if (typeof ref === 'function') {
                    ref(node);
                    return;
                  }

                  if (ref) {
                    ref.current = node;
                  }
                }}
                id={inputId}
                type='text'
                role='combobox'
                value={currentValue}
                disabled={disabled}
                required={required}
                autoComplete={autoComplete ?? 'off'}
                aria-autocomplete='list'
                aria-haspopup='listbox'
                aria-expanded={open}
                aria-controls={open ? listboxId : undefined}
                aria-activedescendant={activeOptionId}
                className={clsx(
                  styles.combobox_input,
                  SizeClassMap[size],
                  hasError && styles.combobox_input_error
                )}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onClick={handleInputClick}
                onKeyDown={handleInputKeyDown}
                {...computeAriaProps(
                  hasError,
                  describedBy,
                  ariaDescribedBy,
                  ariaInvalid
                )}
                {...inputProps}
              />
              <ChevronDownIcon className={styles.combobox_icon} size={16} />
            </div>

            {open && !disabled && (
              <div id={listboxId} className={styles.combobox_listbox}>
                {filteredOptions.length === 0 && (
                  <p className={styles.combobox_empty_state}>{noResultsText}</p>
                )}

                {filteredOptions.map((option, index) => {
                  const isActive = activeIndex === index;

                  return (
                    <button
                      key={option.value}
                      id={`${inputId}-option-${index}`}
                      type='button'
                      disabled={option.disabled}
                      aria-pressed={isActive}
                      className={clsx(styles.combobox_option, {
                        [styles.combobox_option_active]: isActive,
                        [styles.combobox_option_disabled]: option.disabled
                      })}
                      onMouseEnter={() => {
                        if (!option.disabled) {
                          setActiveIndex(index);
                        }
                      }}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={() => {
                        selectOption(option);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      }}
    </Field>
  );
});

Combobox.displayName = 'Combobox';

export default Combobox;
