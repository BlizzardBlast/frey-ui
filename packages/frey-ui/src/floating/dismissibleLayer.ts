import React from 'react';
import { isWebKit } from './platform';

export type DismissReason = 'escape' | 'outside-pointer';

export type UseDismissibleLayerOptions = {
  open: boolean;
  referenceRef: React.RefObject<HTMLElement | null>;
  floatingRef: React.RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  closeOnOutsidePointerDown?: boolean;
  onDismiss: (reason: DismissReason, event: Event) => void;
};

type LayerOptions = Omit<UseDismissibleLayerOptions, 'open'>;

type Layer = {
  optionsRef: React.MutableRefObject<LayerOptions>;
};

type LayerManager = {
  layers: Layer[];
  composing: boolean;
  compositionResetTimer?: ReturnType<typeof setTimeout>;
  cleanupListeners?: () => void;
};

const managers = new WeakMap<Document, LayerManager>();

function getEventPath(event: Event): EventTarget[] {
  if (typeof event.composedPath === 'function') return event.composedPath();
  return event.target ? [event.target] : [];
}

function eventIsInside(event: Event, element: HTMLElement | null): boolean {
  if (!element) return false;
  const path = getEventPath(event);
  if (path.includes(element)) return true;
  return event.target instanceof Node && element.contains(event.target);
}

function isScrollbarPress(
  event: PointerEvent,
  ownerDocument: Document
): boolean {
  const documentElement = ownerDocument.documentElement;
  if (event.target === documentElement || event.target === ownerDocument.body) {
    return (
      event.clientX > documentElement.clientWidth ||
      event.clientY > documentElement.clientHeight
    );
  }

  const ownerWindow = ownerDocument.defaultView;
  if (!ownerWindow) return false;
  const target = getEventPath(event).find(
    (entry): entry is HTMLElement => entry instanceof ownerWindow.HTMLElement
  );
  if (!target) return false;

  const style = ownerWindow.getComputedStyle(target);
  const hasVerticalScrollbar =
    /^(auto|overlay|scroll)$/.test(style.overflowY) &&
    (style.overflowY === 'scroll' || target.scrollHeight > target.clientHeight);
  const hasHorizontalScrollbar =
    /^(auto|overlay|scroll)$/.test(style.overflowX) &&
    (style.overflowX === 'scroll' || target.scrollWidth > target.clientWidth);
  if (!hasVerticalScrollbar && !hasHorizontalScrollbar) {
    return false;
  }

  const rect = target.getBoundingClientRect();
  const scaleX = target.offsetWidth > 0 ? rect.width / target.offsetWidth : 1;
  const scaleY =
    target.offsetHeight > 0 ? rect.height / target.offsetHeight : 1;
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const clientLeft = target.clientLeft * scaleX;
  const clientTop = target.clientTop * scaleY;
  const clientRight = clientLeft + target.clientWidth * scaleX;
  const clientBottom = clientTop + target.clientHeight * scaleY;
  const verticalScrollbarPress =
    hasVerticalScrollbar &&
    (style.direction === 'rtl'
      ? pointerX < clientLeft
      : pointerX > clientRight);
  const horizontalScrollbarPress =
    hasHorizontalScrollbar && pointerY > clientBottom;

  return verticalScrollbarPress || horizontalScrollbarPress;
}

function getTopLayer(manager: LayerManager): Layer | undefined {
  return manager.layers[manager.layers.length - 1];
}

function attachManagerListeners(
  ownerDocument: Document,
  manager: LayerManager
): () => void {
  const clearCompositionReset = () => {
    if (manager.compositionResetTimer === undefined) return;
    clearTimeout(manager.compositionResetTimer);
    manager.compositionResetTimer = undefined;
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.isComposing || manager.composing) {
      return;
    }

    const layer = getTopLayer(manager);
    if (!layer) return;
    const { closeOnEscape = true, onDismiss } = layer.optionsRef.current;
    if (!closeOnEscape) return;
    onDismiss('escape', event);
  };
  const handlePointerDown = (event: PointerEvent) => {
    const layer = getTopLayer(manager);
    if (!layer) return;

    const {
      closeOnOutsidePointerDown = true,
      floatingRef,
      referenceRef,
      onDismiss,
    } = layer.optionsRef.current;
    if (!closeOnOutsidePointerDown) return;
    if (isScrollbarPress(event, ownerDocument)) return;
    if (eventIsInside(event, referenceRef.current)) return;
    if (eventIsInside(event, floatingRef.current)) return;
    onDismiss('outside-pointer', event);
  };
  const handleCompositionStart = () => {
    clearCompositionReset();
    manager.composing = true;
  };
  const handleCompositionEnd = () => {
    clearCompositionReset();
    manager.compositionResetTimer = setTimeout(
      () => {
        manager.compositionResetTimer = undefined;
        manager.composing = false;
      },
      isWebKit(ownerDocument.defaultView) ? 5 : 0
    );
  };

  ownerDocument.addEventListener('keydown', handleKeyDown);
  ownerDocument.addEventListener('pointerdown', handlePointerDown);
  ownerDocument.addEventListener('compositionstart', handleCompositionStart);
  ownerDocument.addEventListener('compositionend', handleCompositionEnd);

  return () => {
    clearCompositionReset();
    manager.composing = false;
    ownerDocument.removeEventListener('keydown', handleKeyDown);
    ownerDocument.removeEventListener('pointerdown', handlePointerDown);
    ownerDocument.removeEventListener(
      'compositionstart',
      handleCompositionStart
    );
    ownerDocument.removeEventListener('compositionend', handleCompositionEnd);
  };
}

function registerLayer(ownerDocument: Document, layer: Layer): () => void {
  let manager = managers.get(ownerDocument);
  if (!manager) {
    manager = { layers: [], composing: false };
    managers.set(ownerDocument, manager);
  }
  const activeManager = manager;

  const nestedChildIndex = activeManager.layers.findIndex((existingLayer) => {
    const parentFloating = layer.optionsRef.current.floatingRef.current;
    const childReference =
      existingLayer.optionsRef.current.referenceRef.current;
    return Boolean(
      parentFloating &&
        childReference &&
        parentFloating.contains(childReference)
    );
  });
  if (nestedChildIndex >= 0) {
    activeManager.layers.splice(nestedChildIndex, 0, layer);
  } else {
    activeManager.layers.push(layer);
  }
  if (!activeManager.cleanupListeners) {
    activeManager.cleanupListeners = attachManagerListeners(
      ownerDocument,
      activeManager
    );
  }

  return () => {
    const layerIndex = activeManager.layers.lastIndexOf(layer);
    activeManager.layers.splice(layerIndex, 1);

    if (activeManager.layers.length === 0) {
      activeManager.cleanupListeners?.();
      activeManager.cleanupListeners = undefined;
      managers.delete(ownerDocument);
    }
  };
}

export function useDismissibleLayer({
  open,
  ...options
}: UseDismissibleLayerOptions): void {
  const optionsRef = React.useRef(options);
  optionsRef.current = options;
  const ownerDocument =
    options.referenceRef.current?.ownerDocument ??
    options.floatingRef.current?.ownerDocument ??
    (typeof document === 'undefined' ? undefined : document);

  React.useEffect(() => {
    if (!open || !ownerDocument) return;
    return registerLayer(ownerDocument, { optionsRef });
  }, [open, ownerDocument]);
}
