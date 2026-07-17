import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockRect } from '../utils/testUtils';
import { useFloatingPosition } from './useFloatingPosition';

describe('useFloatingPosition', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns stable setters and fixed zero coordinates before mounting', () => {
    const { result, rerender } = renderHook(() =>
      useFloatingPosition({
        open: false,
        side: 'bottom',
        alignment: 'center',
        offset: 8,
      })
    );
    const setReference = result.current.setReference;
    const setFloating = result.current.setFloating;

    expect(result.current.floatingStyles).toEqual({
      position: 'fixed',
      left: 0,
      top: 0,
    });

    rerender();
    expect(result.current.setReference).toBe(setReference);
    expect(result.current.setFloating).toBe(setFloating);
  });

  it('measures mounted elements and exposes the resolved placement', async () => {
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    vi.spyOn(reference, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ x: 120, y: 190, width: 80, height: 24 })
    );
    vi.spyOn(floating, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ width: 180, height: 100 })
    );
    const originalInnerHeight = globalThis.innerHeight;
    Object.defineProperty(globalThis, 'innerHeight', {
      configurable: true,
      value: 240,
    });

    try {
      const { result } = renderHook(() =>
        useFloatingPosition({
          open: true,
          side: 'bottom',
          alignment: 'center',
          offset: 8,
        })
      );

      act(() => {
        result.current.setReference(reference);
        result.current.setFloating(floating);
      });

      await waitFor(() => {
        expect(result.current.floatingStyles).toMatchObject({
          left: 70,
          top: 82,
        });
      });
      expect(result.current.resolvedPlacement).toEqual({
        side: 'top',
        alignment: 'center',
      });
      expect(result.current.referenceRef.current).toBe(reference);
      expect(result.current.floatingRef.current).toBe(floating);

      await act(async () => {
        window.dispatchEvent(new Event('resize'));
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
      });
      expect(result.current.floatingStyles).toMatchObject({
        left: 70,
        top: 82,
      });
    } finally {
      Object.defineProperty(globalThis, 'innerHeight', {
        configurable: true,
        value: originalInnerHeight,
      });
    }
  });

  it('uses layout dimensions before transformed bounding dimensions', async () => {
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    vi.spyOn(reference, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ x: 100, y: 100, width: 40, height: 20 })
    );
    vi.spyOn(floating, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ width: 200, height: 100 })
    );
    Object.defineProperties(floating, {
      offsetWidth: { configurable: true, value: 100 },
      offsetHeight: { configurable: true, value: 40 },
    });
    const { result } = renderHook(() =>
      useFloatingPosition({
        open: true,
        side: 'bottom',
        alignment: 'center',
        offset: 8,
      })
    );

    act(() => {
      result.current.setReference(reference);
      result.current.setFloating(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingStyles).toMatchObject({
        left: 70,
        top: 128,
      });
    });
  });

  it('intersects visual viewport and overflow clipping in RTL', async () => {
    const scroller = document.createElement('div');
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    scroller.style.overflow = 'hidden';
    reference.style.direction = 'rtl';
    scroller.append(reference);
    document.body.append(scroller, floating);
    vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ x: 60, y: 50, width: 150, height: 120 })
    );
    vi.spyOn(reference, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ x: 70, y: 70, width: 60, height: 20 })
    );
    vi.spyOn(floating, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ width: 80, height: 50 })
    );
    Object.defineProperty(floating, 'offsetWidth', {
      configurable: true,
      value: 80,
    });
    const visualViewport = new EventTarget() as VisualViewport;
    Object.assign(visualViewport, {
      height: 150,
      offsetLeft: 50,
      offsetTop: 40,
      width: 200,
    });
    vi.stubGlobal('visualViewport', visualViewport);
    const { result } = renderHook(() =>
      useFloatingPosition({
        open: true,
        side: 'bottom',
        alignment: 'start',
        offset: 8,
      })
    );

    act(() => {
      result.current.setReference(reference);
    });
    act(() => {
      result.current.setReference(reference);
      result.current.setFloating(floating);
      result.current.setFloating(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingStyles).toMatchObject({
        left: 70,
        top: 98,
      });
    });
    expect(result.current.resolvedPlacement).toEqual({
      side: 'bottom',
      alignment: 'end',
    });
  });

  it('clips to a scaled overflow ancestor inner client rectangle', async () => {
    const scroller = document.createElement('div');
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    scroller.style.overflow = 'hidden';
    scroller.append(reference);
    document.body.append(scroller, floating);
    vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ x: 50, y: 50, width: 400, height: 400 })
    );
    Object.defineProperties(scroller, {
      clientHeight: { configurable: true, value: 180 },
      clientLeft: { configurable: true, value: 10 },
      clientTop: { configurable: true, value: 5 },
      clientWidth: { configurable: true, value: 160 },
      offsetHeight: { configurable: true, value: 200 },
      offsetWidth: { configurable: true, value: 200 },
    });
    vi.spyOn(reference, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ x: 350, y: 100, width: 20, height: 20 })
    );
    vi.spyOn(floating, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ width: 80, height: 40 })
    );
    Object.defineProperties(floating, {
      offsetHeight: { configurable: true, value: 40 },
      offsetWidth: { configurable: true, value: 80 },
    });
    const { result } = renderHook(() =>
      useFloatingPosition({
        open: true,
        side: 'bottom',
        alignment: 'center',
        offset: 8,
      })
    );

    act(() => {
      result.current.setReference(reference);
      result.current.setFloating(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingStyles).toMatchObject({
        left: 302,
        top: 128,
      });
    });
  });

  it('uses the bounding rectangle for non-HTML overflow ancestors', async () => {
    const scroller = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    scroller.style.overflow = 'hidden';
    scroller.append(reference);
    document.body.append(scroller, floating);
    vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ x: 100, y: 50, width: 100, height: 200 })
    );
    vi.spyOn(reference, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ x: 180, y: 100, width: 20, height: 20 })
    );
    vi.spyOn(floating, 'getBoundingClientRect').mockReturnValue(
      createMockRect({ width: 80, height: 40 })
    );
    Object.defineProperties(floating, {
      offsetHeight: { configurable: true, value: 40 },
      offsetWidth: { configurable: true, value: 80 },
    });
    const { result } = renderHook(() =>
      useFloatingPosition({
        open: true,
        side: 'bottom',
        alignment: 'center',
        offset: 8,
      })
    );

    act(() => {
      result.current.setReference(reference);
      result.current.setFloating(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingStyles).toMatchObject({
        left: 112,
        top: 128,
      });
    });
  });

  it('stays at initial coordinates for elements without an owner window', async () => {
    const detachedDocument = document.implementation.createHTMLDocument('');
    const reference = detachedDocument.createElement('button');
    const floating = detachedDocument.createElement('div');
    const { result } = renderHook(() =>
      useFloatingPosition({
        open: true,
        side: 'left',
        alignment: 'end',
        offset: 8,
      })
    );

    act(() => {
      result.current.setReference(reference);
      result.current.setFloating(floating);
    });

    await waitFor(() => {
      expect(result.current.floatingStyles).toEqual({
        position: 'fixed',
        left: 0,
        top: 0,
      });
    });
  });
});
