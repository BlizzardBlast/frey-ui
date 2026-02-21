import type React from 'react';
import { useEffect } from 'react';

type UseDismissOptions = {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  /** If true, return focus to the trigger element after closing. @default false */
  returnFocusOnClose?: boolean;
};

/**
 * Attaches Escape-key and outside-click listeners that call `onClose`
 * when the floating element should be dismissed.
 */
export function useDismiss(options: UseDismissOptions): void {
  const {
    open,
    onClose,
    triggerRef,
    contentRef,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    returnFocusOnClose = false
  } = options;

  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (triggerRef.current?.contains(targetNode)) return;
      if (contentRef.current?.contains(targetNode)) return;

      onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeOnOutsideClick, open, onClose, triggerRef, contentRef]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();

        if (returnFocusOnClose) {
          triggerRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, open, onClose, triggerRef, returnFocusOnClose]);
}
