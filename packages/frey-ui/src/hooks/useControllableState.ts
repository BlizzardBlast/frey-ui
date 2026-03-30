import { useCallback, useState } from 'react';

/**
 * Manages a value that can be either controlled (value supplied by parent)
 * or uncontrolled (managed internally with an optional callback).
 */
export function useControllableValue<Value>(
  controlled: Value | undefined,
  defaultValue: Value,
  onChange?: (value: Value) => void
): [Value, (next: Value) => void] {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);

  const value = isControlled ? controlled : uncontrolled;

  const setValue = useCallback(
    (next: Value) => {
      if (!isControlled) {
        setUncontrolled(next);
      }

      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}

/**
 * Manages a boolean value that can be either controlled (value supplied by parent)
 * or uncontrolled (managed internally with an optional callback).
 */
export function useControllableState(
  controlled: boolean | undefined,
  defaultValue: boolean,
  onChange?: (value: boolean) => void
): [boolean, (next: boolean) => void] {
  return useControllableValue(controlled, defaultValue, onChange);
}
