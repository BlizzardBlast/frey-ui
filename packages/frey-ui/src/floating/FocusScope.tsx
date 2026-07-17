import React from 'react';
import { isSafari } from './platform';
import { getTabbableElements } from './tabbable';

export type FocusScopeProps = {
  children: React.ReactNode;
  contentRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  modal?: boolean;
  restoreFocus?: boolean;
};

type ModalAccessibilityManager = {
  contents: Set<HTMLElement>;
  cleanup?: () => void;
};

const modalAccessibilityManagers = new WeakMap<
  Document,
  ModalAccessibilityManager
>();
const focusGuardStyle: React.CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'fixed',
  whiteSpace: 'nowrap',
  width: 1,
  top: 0,
  left: 0,
};

type FocusGuardProps = {
  position: 'after' | 'before';
  onFocus: React.FocusEventHandler<HTMLSpanElement>;
};

function FocusGuard({
  position,
  onFocus,
}: Readonly<FocusGuardProps>): React.JSX.Element {
  const safari =
    typeof window !== 'undefined' && isSafari(window) ? true : undefined;

  // Safari VoiceOver only forwards virtual-cursor focus to a guard exposed as
  // a button. Keep the non-native span sentinel to avoid native activation
  // behavior: https://github.com/floating-ui/floating-ui/blob/master/packages/react/src/components/FocusGuard.tsx
  return (
    <span
      aria-hidden={safari ? undefined : true}
      data-frey-focus-guard={position}
      onFocus={onFocus}
      role={safari ? 'button' : undefined}
      style={focusGuardStyle}
      tabIndex={0}
    />
  );
}

function focusElement(element: HTMLElement | null): void {
  if (!element) return;
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function trapTabKey(content: HTMLElement, event: KeyboardEvent): void {
  if (
    event.defaultPrevented ||
    event.key !== 'Tab' ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    !event.target ||
    !content.contains(event.target as Node)
  ) {
    return;
  }

  const tabbableElements = getTabbableElements(content);
  const activeElement = content.ownerDocument.activeElement;
  const currentIndex = tabbableElements.indexOf(activeElement as HTMLElement);
  let target: HTMLElement;

  if (tabbableElements.length === 0) {
    target = content;
  } else if (event.shiftKey) {
    const [lastTabbableElement] = tabbableElements.slice(-1);
    target =
      currentIndex > 0
        ? tabbableElements[currentIndex - 1]
        : lastTabbableElement;
  } else {
    target =
      currentIndex >= 0 && currentIndex < tabbableElements.length - 1
        ? tabbableElements[currentIndex + 1]
        : tabbableElements[0];
  }

  event.preventDefault();
  focusElement(target);
}

function hideElement(element: Element): () => void {
  const value = element.getAttribute('aria-hidden');
  element.setAttribute('aria-hidden', 'true');

  return () => {
    if (value === null) {
      element.removeAttribute('aria-hidden');
    } else {
      element.setAttribute('aria-hidden', value);
    }
  };
}

function hideOutsideContents(
  ownerDocument: Document,
  contents: HTMLElement[]
): () => void {
  const liveRegions = [
    ...ownerDocument.querySelectorAll<HTMLElement>(
      '[aria-live], [role="alert"], [role="log"], [role="marquee"], [role="status"], [role="timer"], output'
    ),
  ];
  const focusGuards = contents.flatMap((content) =>
    content.parentElement
      ? [
          ...content.parentElement.querySelectorAll<HTMLElement>(
            '[data-frey-focus-guard]'
          ),
        ]
      : []
  );
  const keepElements = [...contents, ...focusGuards, ...liveRegions];
  const cleanupCallbacks: Array<() => void> = [];

  const visit = (element: Element) => {
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
    if (keepElements.includes(element as HTMLElement)) return;

    if (keepElements.some((keptElement) => element.contains(keptElement))) {
      [...element.children].forEach(visit);
      return;
    }

    cleanupCallbacks.push(hideElement(element));
  };

  [...ownerDocument.body.children].forEach(visit);
  return () => {
    cleanupCallbacks.forEach((cleanup) => {
      cleanup();
    });
  };
}

function refreshModalAccessibility(
  ownerDocument: Document,
  manager: ModalAccessibilityManager
): void {
  manager.cleanup?.();
  manager.cleanup = undefined;
  if (manager.contents.size > 0) {
    manager.cleanup = hideOutsideContents(ownerDocument, [...manager.contents]);
  }
}

function registerModalContent(content: HTMLElement): () => void {
  const ownerDocument = content.ownerDocument;
  let manager = modalAccessibilityManagers.get(ownerDocument);
  if (!manager) {
    manager = { contents: new Set() };
    modalAccessibilityManagers.set(ownerDocument, manager);
  }
  manager.contents.add(content);
  refreshModalAccessibility(ownerDocument, manager);

  return () => {
    manager.contents.delete(content);
    refreshModalAccessibility(ownerDocument, manager);
    if (manager.contents.size === 0) {
      modalAccessibilityManagers.delete(ownerDocument);
    }
  };
}

function getInitialFocusTarget(
  content: HTMLElement,
  initialFocusRef?: React.RefObject<HTMLElement | null>
): HTMLElement {
  return initialFocusRef?.current ?? getTabbableElements(content)[0] ?? content;
}

export function FocusScope({
  children,
  contentRef,
  triggerRef,
  initialFocusRef,
  modal = true,
  restoreFocus = true,
}: Readonly<FocusScopeProps>): React.JSX.Element {
  const focusFirst = React.useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    focusElement(getTabbableElements(content)[0] ?? content);
  }, [contentRef]);
  const focusLast = React.useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    const tabbableElements = getTabbableElements(content);
    const [lastTabbableElement] = tabbableElements.slice(-1);
    focusElement(lastTabbableElement ?? content);
  }, [contentRef]);

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const cleanupOutsideContent = modal
      ? registerModalContent(content)
      : undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      trapTabKey(content, event);
    };
    if (modal) {
      content.ownerDocument.addEventListener('keydown', handleKeyDown);
    }
    let active = true;

    queueMicrotask(() => {
      if (!active || !content.isConnected) return;
      if (!content.contains(content.ownerDocument.activeElement)) {
        focusElement(getInitialFocusTarget(content, initialFocusRef));
      }
    });

    return () => {
      active = false;
      content.ownerDocument.removeEventListener('keydown', handleKeyDown);
      cleanupOutsideContent?.();
      if (!restoreFocus) return;

      const activeElement = content.ownerDocument.activeElement;
      if (
        activeElement === content.ownerDocument.body ||
        activeElement === null ||
        content.contains(activeElement)
      ) {
        focusElement(triggerRef.current);
      }
    };
  }, [contentRef, initialFocusRef, modal, restoreFocus, triggerRef]);

  return (
    <>
      {modal ? <FocusGuard position='before' onFocus={focusLast} /> : null}
      {children}
      {modal ? <FocusGuard position='after' onFocus={focusFirst} /> : null}
    </>
  );
}
