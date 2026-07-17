import React from 'react';

export type UseTooltipInteractionsOptions = {
  open: boolean;
  delay: number;
  reference: HTMLElement | null;
  onOpenChange: (open: boolean) => void;
};

type ModalityManager = {
  keyboard: boolean;
  subscriptions: number;
  cleanup: () => void;
};

const modalityManagers = new WeakMap<Document, ModalityManager>();
const nonTypeableInputTypes = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

function subscribeToModality(ownerDocument: Document): {
  manager: ModalityManager;
  cleanup: () => void;
} {
  let manager = modalityManagers.get(ownerDocument);
  if (!manager) {
    let nextManager: ModalityManager;
    const handlePointerDown = () => {
      nextManager.keyboard = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey && !event.ctrlKey && !event.metaKey) {
        nextManager.keyboard = true;
      }
    };
    const cleanup = () => {
      ownerDocument.removeEventListener('pointerdown', handlePointerDown, true);
      ownerDocument.removeEventListener('keydown', handleKeyDown, true);
    };
    nextManager = { keyboard: true, subscriptions: 0, cleanup };
    ownerDocument.addEventListener('pointerdown', handlePointerDown, true);
    ownerDocument.addEventListener('keydown', handleKeyDown, true);
    manager = nextManager;
    modalityManagers.set(ownerDocument, manager);
  }

  const activeManager = manager;
  activeManager.subscriptions += 1;

  return {
    manager: activeManager,
    cleanup: () => {
      activeManager.subscriptions -= 1;
      if (activeManager.subscriptions === 0) {
        activeManager.cleanup();
        modalityManagers.delete(ownerDocument);
      }
    },
  };
}

function isFocusVisible(
  element: HTMLElement,
  modalityManager: ModalityManager | null
): boolean {
  try {
    return element.matches(':focus-visible');
  } catch {
    const type =
      element.tagName === 'INPUT'
        ? (element as HTMLInputElement).type
        : undefined;
    const contentEditable = element.getAttribute('contenteditable');
    const typeable =
      (type !== undefined && !nonTypeableInputTypes.has(type)) ||
      element.tagName === 'TEXTAREA' ||
      element.isContentEditable ||
      (contentEditable !== null && contentEditable !== 'false');
    return typeable || modalityManager?.keyboard !== false;
  }
}

export function useTooltipInteractions({
  open,
  delay,
  reference,
  onOpenChange,
}: UseTooltipInteractionsOptions): React.HTMLAttributes<HTMLElement> {
  const latestRef = React.useRef({ delay, onOpenChange, open });
  latestRef.current = { delay, onOpenChange, open };
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalityManagerRef = React.useRef<ModalityManager | null>(null);

  const clearOpenTimer = React.useCallback(() => {
    if (openTimerRef.current === null) return;
    clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
  }, []);
  const openTooltip = React.useCallback(() => {
    clearOpenTimer();
    const current = latestRef.current;
    if (current.open) return;

    if (current.delay <= 0) {
      current.onOpenChange(true);
      return;
    }
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      const latest = latestRef.current;
      if (!latest.open) latest.onOpenChange(true);
    }, current.delay);
  }, [clearOpenTimer]);
  const closeTooltip = React.useCallback(() => {
    clearOpenTimer();
    latestRef.current.onOpenChange(false);
  }, [clearOpenTimer]);

  React.useEffect(() => {
    if (!reference) return;
    const modalitySubscription = subscribeToModality(reference.ownerDocument);
    modalityManagerRef.current = modalitySubscription.manager;
    reference.addEventListener('mouseenter', openTooltip);
    reference.addEventListener('mouseleave', closeTooltip);

    return () => {
      clearOpenTimer();
      reference.removeEventListener('mouseenter', openTooltip);
      reference.removeEventListener('mouseleave', closeTooltip);
      modalitySubscription.cleanup();
      modalityManagerRef.current = null;
    };
  }, [clearOpenTimer, closeTooltip, openTooltip, reference]);

  React.useEffect(() => {
    if (open) clearOpenTimer();
  }, [clearOpenTimer, open]);

  React.useEffect(
    () => () => {
      clearOpenTimer();
    },
    [clearOpenTimer]
  );

  const handleFocus = React.useCallback<React.FocusEventHandler<HTMLElement>>(
    (event) => {
      if (isFocusVisible(event.currentTarget, modalityManagerRef.current)) {
        clearOpenTimer();
        latestRef.current.onOpenChange(true);
      }
    },
    [clearOpenTimer]
  );
  const handleBlur = React.useCallback<
    React.FocusEventHandler<HTMLElement>
  >(() => {
    closeTooltip();
  }, [closeTooltip]);

  return React.useMemo(
    () => ({ onBlur: handleBlur, onFocus: handleFocus }),
    [handleBlur, handleFocus]
  );
}
