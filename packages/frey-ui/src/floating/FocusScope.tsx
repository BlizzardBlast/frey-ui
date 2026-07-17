import React from 'react';

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
const focusableSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'object',
  'embed',
  '[contenteditable]:not([contenteditable="false"])',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[tabindex]',
].join(',');
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

function isElementDisabled(element: HTMLElement): boolean {
  return element.matches(':disabled') || element.closest('[inert]') !== null;
}

function isElementVisible(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current) {
    if (current.hidden) return false;
    const style = current.ownerDocument.defaultView?.getComputedStyle(current);
    if (style?.display === 'none' || style?.visibility === 'hidden')
      return false;
    current = current.parentElement;
  }
  return true;
}

function getTabbableElements(content: HTMLElement): HTMLElement[] {
  const candidates = [
    ...content.querySelectorAll<HTMLElement>(focusableSelector),
  ]
    .filter((element) => element.tabIndex >= 0)
    .filter((element) => !isElementDisabled(element))
    .filter(isElementVisible);
  const radioGroups: HTMLInputElement[][] = [];

  candidates.forEach((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio') {
      return;
    }
    if (!element.name) return;
    const group = radioGroups.find(
      ([radio]) => radio.name === element.name && radio.form === element.form
    );
    if (group) {
      group.push(element);
    } else {
      radioGroups.push([element]);
    }
  });

  const allowedRadios = new Set<HTMLInputElement>();
  radioGroups.forEach((group) => {
    allowedRadios.add(group.find((radio) => radio.checked) ?? group[0]);
  });

  return candidates.filter(
    (element) =>
      !(element instanceof HTMLInputElement) ||
      element.type !== 'radio' ||
      !element.name ||
      allowedRadios.has(element)
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
    focusElement(tabbableElements[tabbableElements.length - 1] ?? content);
  }, [contentRef]);

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const cleanupOutsideContent = modal
      ? registerModalContent(content)
      : undefined;
    let active = true;

    queueMicrotask(() => {
      if (!active || !content.isConnected) return;
      if (!content.contains(content.ownerDocument.activeElement)) {
        focusElement(getInitialFocusTarget(content, initialFocusRef));
      }
    });

    return () => {
      active = false;
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
      {modal ? (
        <button
          data-frey-focus-guard='before'
          onFocus={focusLast}
          style={focusGuardStyle}
          type='button'
        />
      ) : null}
      {children}
      {modal ? (
        <button
          data-frey-focus-guard='after'
          onFocus={focusFirst}
          style={focusGuardStyle}
          type='button'
        />
      ) : null}
    </>
  );
}
