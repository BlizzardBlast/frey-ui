import { act, fireEvent, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDismissibleLayer } from './dismissibleLayer';

function createLayerElements(): {
  referenceRef: React.RefObject<HTMLElement | null>;
  floatingRef: React.RefObject<HTMLElement | null>;
  outside: HTMLElement;
} {
  const reference = document.createElement('button');
  const floating = document.createElement('div');
  const outside = document.createElement('button');
  document.body.append(reference, floating, outside);

  return {
    referenceRef: { current: reference },
    floatingRef: { current: floating },
    outside,
  };
}

describe('useDismissibleLayer', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('dismisses the active layer for Escape', () => {
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onDismiss).toHaveBeenCalledWith('escape', expect.any(KeyboardEvent));
  });

  it('dismisses the active layer for outside pointer-down', () => {
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );

    fireEvent.pointerDown(elements.outside);

    expect(onDismiss).toHaveBeenCalledWith(
      'outside-pointer',
      expect.any(Event)
    );
  });

  it('ignores events inside either the reference or floating content', () => {
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );

    fireEvent.pointerDown(elements.referenceRef.current as HTMLElement);
    fireEvent.pointerDown(elements.floatingRef.current as HTMLElement);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('allows only the last-opened layer to handle a document event', () => {
    const parent = createLayerElements();
    const child = createLayerElements();
    const dismissParent = vi.fn();
    const dismissChild = vi.fn();
    renderHook(() => {
      useDismissibleLayer({
        open: true,
        ...parent,
        onDismiss: dismissParent,
      });
      useDismissibleLayer({
        open: true,
        ...child,
        onDismiss: dismissChild,
      });
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(dismissChild).toHaveBeenCalledTimes(1);
    expect(dismissParent).not.toHaveBeenCalled();
  });

  it('keeps a nested child on top regardless of effect registration order', () => {
    const parent = createLayerElements();
    const child = createLayerElements();
    parent.floatingRef.current?.append(
      child.referenceRef.current as HTMLElement
    );
    const dismissParent = vi.fn();
    const dismissChild = vi.fn();
    renderHook(() => {
      useDismissibleLayer({
        open: true,
        ...child,
        onDismiss: dismissChild,
      });
      useDismissibleLayer({
        open: true,
        ...parent,
        onDismiss: dismissParent,
      });
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(dismissChild).toHaveBeenCalledTimes(1);
    expect(dismissParent).not.toHaveBeenCalled();
  });

  it('shares one native listener set per document', () => {
    const parent = createLayerElements();
    const child = createLayerElements();
    const addEventListener = vi.spyOn(document, 'addEventListener');
    renderHook(() => {
      useDismissibleLayer({
        open: true,
        ...parent,
        onDismiss: vi.fn(),
      });
      useDismissibleLayer({
        open: true,
        ...child,
        onDismiss: vi.fn(),
      });
    });

    const eventTypes = addEventListener.mock.calls.map(([type]) => type);
    expect(eventTypes.filter((type) => type === 'keydown')).toHaveLength(1);
    expect(eventTypes.filter((type) => type === 'pointerdown')).toHaveLength(1);
  });

  it('does not leak disabled dismissal through the top layer to a parent', () => {
    const parent = createLayerElements();
    const child = createLayerElements();
    const dismissParent = vi.fn();
    const dismissChild = vi.fn();
    renderHook(() => {
      useDismissibleLayer({
        open: true,
        ...parent,
        onDismiss: dismissParent,
      });
      useDismissibleLayer({
        open: true,
        ...child,
        closeOnEscape: false,
        closeOnOutsidePointerDown: false,
        onDismiss: dismissChild,
      });
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.pointerDown(child.outside);

    expect(dismissChild).not.toHaveBeenCalled();
    expect(dismissParent).not.toHaveBeenCalled();
  });

  it('ignores Escape while an IME composition is active', () => {
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );

    fireEvent.compositionStart(document);
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.compositionEnd(document);
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { isComposing: true, key: 'Escape' });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('keeps WebKit composition active through the following Escape event', () => {
    vi.useFakeTimers();
    vi.stubGlobal('CSS', { supports: vi.fn(() => true) });
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );

    fireEvent.compositionStart(document);
    fireEvent.compositionEnd(document);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(5));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('keeps non-WebKit composition active until the next task', () => {
    vi.useFakeTimers();
    vi.stubGlobal('CSS', { supports: vi.fn(() => false) });
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );

    fireEvent.compositionStart(document);
    fireEvent.compositionEnd(document);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(0));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending composition reset after the final layer closes', () => {
    vi.useFakeTimers();
    vi.stubGlobal('CSS', { supports: vi.fn(() => true) });
    const elements = createLayerElements();
    const { unmount } = renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss: vi.fn(),
      })
    );

    fireEvent.compositionStart(document);
    fireEvent.compositionEnd(document);
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('ignores presses on the document scrollbar', () => {
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    Object.defineProperties(document.documentElement, {
      clientWidth: { configurable: true, value: 800 },
      clientHeight: { configurable: true, value: 600 },
    });
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );

    fireEvent.pointerDown(document.documentElement, {
      clientX: 810,
      clientY: 100,
    });
    fireEvent.pointerDown(document.body, {
      clientX: 100,
      clientY: 610,
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('supports outside dismissal in an owner document without a window', () => {
    const ownerDocument = document.implementation.createHTMLDocument('');
    const reference = ownerDocument.createElement('button');
    const floating = ownerDocument.createElement('div');
    const outside = ownerDocument.createElement('button');
    ownerDocument.body.append(reference, floating, outside);
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        referenceRef: { current: reference },
        floatingRef: { current: floating },
        onDismiss,
      })
    );

    outside.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true })
    );

    expect(onDismiss).toHaveBeenCalledWith(
      'outside-pointer',
      expect.any(Event)
    );
  });

  it('falls back to target containment when composedPath is unavailable', () => {
    const elements = createLayerElements();
    const child = document.createElement('button');
    elements.floatingRef.current?.append(child);
    const onDismiss = vi.fn();
    let pointerHandler: EventListener | undefined;
    const originalAddEventListener = document.addEventListener.bind(document);
    vi.spyOn(document, 'addEventListener').mockImplementation(
      (type, listener, options) => {
        originalAddEventListener(type, listener, options);
        if (type === 'pointerdown') pointerHandler = listener as EventListener;
      }
    );
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );
    const event = new Event('pointerdown');
    Object.defineProperties(event, {
      composedPath: { value: undefined },
      target: { value: child },
    });

    pointerHandler?.(event);

    expect(onDismiss).not.toHaveBeenCalled();

    const targetlessEvent = new Event('pointerdown');
    Object.defineProperty(targetlessEvent, 'composedPath', {
      value: undefined,
    });
    pointerHandler?.(targetlessEvent);
    expect(onDismiss).toHaveBeenCalledWith('outside-pointer', targetlessEvent);
  });

  it('supports missing reference and floating nodes through the document fallback', () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        referenceRef: { current: null },
        floatingRef: { current: null },
        onDismiss,
      })
    );

    fireEvent.pointerDown(outside);

    expect(onDismiss).toHaveBeenCalledWith(
      'outside-pointer',
      expect.any(Event)
    );
  });

  it('uses the floating document when the reference is not assigned', () => {
    const floating = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(floating, outside);
    const onDismiss = vi.fn();
    renderHook(() =>
      useDismissibleLayer({
        open: true,
        referenceRef: { current: null },
        floatingRef: { current: floating },
        onDismiss,
      })
    );

    fireEvent.pointerDown(outside);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not register a closed layer and reads the latest callback', () => {
    const elements = createLayerElements();
    const firstDismiss = vi.fn();
    const secondDismiss = vi.fn();
    const { rerender } = renderHook(
      ({ onDismiss, open }) =>
        useDismissibleLayer({
          open,
          ...elements,
          onDismiss,
        }),
      { initialProps: { onDismiss: firstDismiss, open: false } }
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    rerender({ onDismiss: secondDismiss, open: true });
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(firstDismiss).not.toHaveBeenCalled();
    expect(secondDismiss).toHaveBeenCalledTimes(1);
  });

  it('leaves stale listener closures harmless after the last layer closes', () => {
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    const handlers = new Map<string, EventListener>();
    const originalAddEventListener = document.addEventListener.bind(document);
    vi.spyOn(document, 'addEventListener').mockImplementation(
      (type, listener, options) => {
        originalAddEventListener(type, listener, options);
        handlers.set(type, listener as EventListener);
      }
    );
    const { unmount } = renderHook(() =>
      useDismissibleLayer({
        open: true,
        ...elements,
        onDismiss,
      })
    );

    unmount();
    handlers.get('keydown')?.(new KeyboardEvent('keydown', { key: 'Escape' }));
    handlers.get('pointerdown')?.(new PointerEvent('pointerdown'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('removes its document registration during Strict Mode cleanup', () => {
    const elements = createLayerElements();
    const onDismiss = vi.fn();
    const { unmount } = renderHook(
      () =>
        useDismissibleLayer({
          open: true,
          ...elements,
          onDismiss,
        }),
      { wrapper: React.StrictMode }
    );

    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
