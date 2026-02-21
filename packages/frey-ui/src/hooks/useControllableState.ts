import { useCallback, useState } from 'react';

/**
 * Manages a boolean value that can be either controlled (value supplied by parent)
 * or uncontrolled (managed internally with an optional callback).
 */
export function useControllableState(
  controlled: boolean | undefined,
  defaultValue: boolean,
  onChange?: (value: boolean) => void
): [boolean, (next: boolean) => void] {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);

  const value = isControlled ? controlled : uncontrolled;

  const setValue = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolled(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}
