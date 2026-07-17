import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { createMockRect } from '../utils/testUtils';
import { autoUpdateFloating, getOverflowElements } from './autoUpdate';

type ResizeCallback = ResizeObserverCallback;
type IntersectionCallback = IntersectionObserverCallback;

let resizeCallback: ResizeCallback | undefined;
let intersectionCallback: IntersectionCallback | undefined;
let intersectionCallbacks: IntersectionCallback[];
let intersectionOptions: IntersectionObserverInit[];
let resizeObserved: Element[];
let intersectionObserved: Element[];
let resizeDisconnect: Mock<() => void>;
let intersectionDisconnect: Mock<() => void>;
let frameCallbacks: Map<number, FrameRequestCallback>;
let nextFrameId: number;

function flushFrames(): void {
  const callbacks = [...frameCallbacks.values()];
  frameCallbacks.clear();
  callbacks.forEach((callback) => {
    callback(0);
  });
}

describe('autoUpdateFloating', () => {
  beforeEach(() => {
    resizeCallback = undefined;
    intersectionCallback = undefined;
    intersectionCallbacks = [];
    intersectionOptions = [];
    resizeObserved = [];
    intersectionObserved = [];
    resizeDisconnect = vi.fn();
    intersectionDisconnect = vi.fn();
    frameCallbacks = new Map();
    nextFrameId = 1;

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        const id = nextFrameId;
        nextFrameId += 1;
        frameCallbacks.set(id, callback);
        return id;
      })
    );
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => {
        frameCallbacks.delete(id);
      })
    );
    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        constructor(callback: ResizeCallback) {
          resizeCallback = callback;
        }

        observe(element: Element): void {
          resizeObserved.push(element);
        }

        unobserve(): void {}

        disconnect(): void {
          resizeDisconnect();
        }
      }
    );
    vi.stubGlobal(
      'IntersectionObserver',
      class MockIntersectionObserver {
        root = null;
        rootMargin = '0px';
        thresholds = [0];

        constructor(
          callback: IntersectionCallback,
          options?: IntersectionObserverInit
        ) {
          intersectionCallback = callback;
          intersectionCallbacks.push(callback);
          intersectionOptions.push(options ?? {});
        }

        observe(element: Element): void {
          intersectionObserved.push(element);
        }

        unobserve(): void {}

        takeRecords(): IntersectionObserverEntry[] {
          return [];
        }

        disconnect(): void {
          intersectionDisconnect();
        }
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('updates immediately and observes both elements for size changes', () => {
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    const update = vi.fn();

    const cleanup = autoUpdateFloating(reference, floating, update);

    expect(update).toHaveBeenCalledTimes(1);
    expect(resizeObserved).toEqual([reference, floating]);
    expect(intersectionObserved).toEqual([reference]);

    cleanup();
  });

  it('coalesces ancestor scroll and resize events into one animation frame', () => {
    const host = document.createElement('div');
    host.style.overflow = 'auto';
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    host.append(reference);
    document.body.append(host, floating);
    const update = vi.fn();

    const cleanup = autoUpdateFloating(reference, floating, update);

    host.dispatchEvent(new Event('scroll'));
    host.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));

    expect(update).toHaveBeenCalledTimes(1);
    expect(frameCallbacks.size).toBe(1);

    flushFrames();
    expect(update).toHaveBeenCalledTimes(2);

    cleanup();
  });

  it('updates for resize and layout-shift observer notifications', () => {
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    const update = vi.fn();

    const cleanup = autoUpdateFloating(reference, floating, update);

    resizeCallback?.([], {} as ResizeObserver);
    intersectionCallback?.([], {} as IntersectionObserver);
    expect(frameCallbacks.size).toBe(1);

    flushFrames();
    expect(update).toHaveBeenCalledTimes(2);

    cleanup();
  });

  it('subscribes to visual viewport movement when available', () => {
    const visualViewport = new EventTarget() as VisualViewport;
    Object.assign(visualViewport, {
      height: 240,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      width: 320,
      onresize: null,
      onscroll: null,
    });
    vi.stubGlobal('visualViewport', visualViewport);
    const update = vi.fn();

    const cleanup = autoUpdateFloating(
      document.createElement('button'),
      document.createElement('div'),
      update
    );

    visualViewport.dispatchEvent(new Event('scroll'));
    visualViewport.dispatchEvent(new Event('resize'));
    flushFrames();

    expect(update).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('shares native ancestor listeners while keeping subscriber cleanup isolated', () => {
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    const firstUpdate = vi.fn();
    const secondUpdate = vi.fn();
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const cleanupFirst = autoUpdateFloating(reference, floating, firstUpdate);
    const cleanupSecond = autoUpdateFloating(reference, floating, secondUpdate);

    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'scroll')
    ).toHaveLength(1);
    window.dispatchEvent(new Event('scroll'));
    const staleFrame = [...frameCallbacks.values()][0];
    cleanupFirst();
    staleFrame(0);
    flushFrames();

    expect(firstUpdate).toHaveBeenCalledTimes(1);
    expect(secondUpdate).toHaveBeenCalledTimes(2);
    expect(
      removeEventListener.mock.calls.filter(([type]) => type === 'scroll')
    ).toHaveLength(0);

    cleanupSecond();
    expect(
      removeEventListener.mock.calls.filter(([type]) => type === 'scroll')
    ).toHaveLength(1);
  });

  it('discovers assigned-slot and shadow-root overflow ancestors', () => {
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const scroller = document.createElement('div');
    const slot = document.createElement('slot');
    const reference = document.createElement('button');
    scroller.style.overflow = 'auto';
    slot.name = 'reference';
    reference.slot = 'reference';
    scroller.append(slot);
    shadowRoot.append(scroller);
    host.append(reference);
    document.body.append(host);

    expect(reference.assignedSlot).toBe(slot);
    expect(getOverflowElements(reference)).toContain(scroller);
  });

  it('handles documents without an attached window', () => {
    const detachedDocument = document.implementation.createHTMLDocument('');
    const host = detachedDocument.createElement('div');
    const reference = detachedDocument.createElement('button');
    const floating = detachedDocument.createElement('div');
    host.append(reference);
    detachedDocument.body.append(host, floating);
    const update = vi.fn();

    expect(detachedDocument.defaultView).toBeNull();
    expect(getOverflowElements(reference)).toEqual([]);
    const cleanup = autoUpdateFloating(reference, floating, update);

    expect(update).toHaveBeenCalledTimes(1);
    expect(() => cleanup()).not.toThrow();
  });

  it('re-arms layout-shift observation after ratio and rectangle changes', () => {
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    let rect = createMockRect({ x: 20, y: 30, width: 40, height: 20 });
    vi.spyOn(reference, 'getBoundingClientRect').mockImplementation(() => rect);
    const update = vi.fn();
    const cleanup = autoUpdateFloating(reference, floating, update);
    const firstObserver = intersectionCallbacks[0];

    firstObserver(
      [{ intersectionRatio: 1 } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    firstObserver(
      [{ intersectionRatio: 0.5 } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(intersectionCallbacks).toHaveLength(2);

    const secondObserver = intersectionCallbacks[1];
    rect = createMockRect({ x: 25, y: 30, width: 40, height: 20 });
    secondObserver(
      [{ intersectionRatio: 1 } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(intersectionCallbacks).toHaveLength(3);
    flushFrames();
    expect(update).toHaveBeenCalledTimes(2);

    cleanup();
  });

  it('retries zero-ratio observation with a minimal threshold', () => {
    vi.useFakeTimers();
    const update = vi.fn();
    const cleanup = autoUpdateFloating(
      document.createElement('button'),
      document.createElement('div'),
      update
    );

    intersectionCallbacks[0](
      [{ intersectionRatio: 0 } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    vi.runAllTimers();

    expect(intersectionCallbacks).toHaveLength(2);
    expect(intersectionOptions[1]?.threshold).toBe(0.0000001);
    expect(update).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('re-arms immediately for a first non-zero partial ratio', () => {
    const update = vi.fn();
    const cleanup = autoUpdateFloating(
      document.createElement('button'),
      document.createElement('div'),
      update
    );

    intersectionCallbacks[0](
      [{ intersectionRatio: 0.5 } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    expect(intersectionCallbacks).toHaveLength(2);
    expect(intersectionOptions[1]?.threshold).toBe(0.5);
    flushFrames();
    expect(update).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('clears pending layout-shift retries and ignores stale callbacks', () => {
    vi.useFakeTimers();
    const update = vi.fn();
    const cleanup = autoUpdateFloating(
      document.createElement('button'),
      document.createElement('div'),
      update
    );
    const staleCallback = intersectionCallbacks[0];

    staleCallback(
      [{ intersectionRatio: 0 } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    cleanup();
    staleCallback(
      [{ intersectionRatio: 0.5 } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    vi.runAllTimers();
    flushFrames();

    expect(update).toHaveBeenCalledTimes(1);
    expect(intersectionCallbacks).toHaveLength(1);
  });

  it('cleans up idempotently and ignores events after cleanup', () => {
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    const update = vi.fn();
    const cleanup = autoUpdateFloating(reference, floating, update);

    cleanup();
    cleanup();
    window.dispatchEvent(new Event('resize'));
    resizeCallback?.([], {} as ResizeObserver);
    flushFrames();

    expect(update).toHaveBeenCalledTimes(1);
    expect(resizeDisconnect).toHaveBeenCalledTimes(1);
    expect(intersectionDisconnect).toHaveBeenCalledTimes(1);
  });

  it('works when optional observer APIs are unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    vi.stubGlobal('IntersectionObserver', undefined);
    const update = vi.fn();

    const cleanup = autoUpdateFloating(
      document.createElement('button'),
      document.createElement('div'),
      update
    );

    expect(update).toHaveBeenCalledTimes(1);
    expect(() => cleanup()).not.toThrow();
  });
});
