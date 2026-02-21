import type React from 'react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { clamp } from '../utils/clamp';

export type Placement = 'top' | 'right' | 'bottom' | 'left';

type Position = {
  top: number;
  left: number;
};

type UseFloatingPositionOptions = {
  open: boolean;
  placement: Placement;
  offset: number;
  /**
   * Horizontal alignment relative to the trigger.
   * - `'center'` — centres the floating element on the trigger (Popover, Tooltip).
   * - `'start'`  — aligns the floating element's left edge with the trigger's left edge (DropdownMenu).
   *
   * @default 'center'
   */
  align?: 'center' | 'start';
};

/**
 * Computes viewport-clamped `{ top, left }` for a floating element
 * anchored to a trigger, and keeps it updated on scroll / resize.
 */
export function useFloatingPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  floatingRef: React.RefObject<HTMLElement | null>,
  options: UseFloatingPositionOptions
): Position {
  const { open, placement, offset, align = 'center' } = options;
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!open || !triggerRef.current || !floatingRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const floatingRect = floatingRef.current.getBoundingClientRect();
    const viewportPadding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top: number;
    let left: number;

    top = triggerRect.bottom + offset;
    left =
      align === 'center'
        ? triggerRect.left + (triggerRect.width - floatingRect.width) / 2
        : triggerRect.left;

    if (placement === 'top') {
      top = triggerRect.top - floatingRect.height - offset;
    } else if (placement === 'left') {
      top =
        align === 'center'
          ? triggerRect.top + (triggerRect.height - floatingRect.height) / 2
          : triggerRect.top;
      left = triggerRect.left - floatingRect.width - offset;
    } else if (placement === 'right') {
      top =
        align === 'center'
          ? triggerRect.top + (triggerRect.height - floatingRect.height) / 2
          : triggerRect.top;
      left = triggerRect.right + offset;
    }

    top = clamp(
      top,
      viewportPadding,
      Math.max(
        viewportPadding,
        viewportHeight - floatingRect.height - viewportPadding
      )
    );
    left = clamp(
      left,
      viewportPadding,
      Math.max(
        viewportPadding,
        viewportWidth - floatingRect.width - viewportPadding
      )
    );

    setPosition({ top, left });
  }, [open, offset, placement, align, triggerRef, floatingRef]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePosition();

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updatePosition]);

  return position;
}
