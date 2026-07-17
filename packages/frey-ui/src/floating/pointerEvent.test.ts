import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockRect } from '../utils/testUtils';
import { eventIsInside, isScrollbarPress } from './pointerEvent';

type ElementMetrics = {
  clientHeight: number;
  clientLeft: number;
  clientTop?: number;
  clientWidth: number;
  offsetHeight: number;
  offsetWidth: number;
  scrollHeight: number;
  scrollWidth: number;
};

function createPointerEvent(
  target: EventTarget,
  {
    clientX = 0,
    clientY = 0,
  }: Readonly<{ clientX?: number; clientY?: number }>,
  path: EventTarget[] = [target]
): PointerEvent {
  const event = new PointerEvent('pointerdown', { clientX, clientY });
  Object.defineProperties(event, {
    composedPath: { configurable: true, value: () => path },
    target: { value: target },
  });
  return event;
}

function configureScroller(
  element: HTMLElement,
  {
    direction = 'ltr',
    metrics,
    overflowX = 'hidden',
    overflowY = 'hidden',
    rectWidth = metrics.offsetWidth,
    rectHeight = metrics.offsetHeight,
  }: Readonly<{
    direction?: 'ltr' | 'rtl';
    metrics: ElementMetrics;
    overflowX?: string;
    overflowY?: string;
    rectWidth?: number;
    rectHeight?: number;
  }>
): void {
  element.style.direction = direction;
  element.style.overflowX = overflowX;
  element.style.overflowY = overflowY;
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: metrics.clientHeight },
    clientLeft: { configurable: true, value: metrics.clientLeft },
    clientTop: { configurable: true, value: metrics.clientTop ?? 0 },
    clientWidth: { configurable: true, value: metrics.clientWidth },
    offsetHeight: { configurable: true, value: metrics.offsetHeight },
    offsetWidth: { configurable: true, value: metrics.offsetWidth },
    scrollHeight: { configurable: true, value: metrics.scrollHeight },
    scrollWidth: { configurable: true, value: metrics.scrollWidth },
  });
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
    createMockRect({ width: rectWidth, height: rectHeight })
  );
}

describe('pointer event classification', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('detects composed-path and containment events inside an element', () => {
    const container = document.createElement('div');
    const child = document.createElement('button');
    container.append(child);

    expect(
      eventIsInside(
        createPointerEvent(child, {}, [child, container]),
        container
      )
    ).toBe(true);

    const fallbackEvent = createPointerEvent(child, {});
    Object.defineProperty(fallbackEvent, 'composedPath', { value: undefined });
    expect(eventIsInside(fallbackEvent, container)).toBe(true);
    expect(eventIsInside(fallbackEvent, null)).toBe(false);
  });

  it('distinguishes document scrollbar gutters from ordinary document presses', () => {
    Object.defineProperties(document.documentElement, {
      clientHeight: { configurable: true, value: 600 },
      clientWidth: { configurable: true, value: 800 },
    });

    expect(
      isScrollbarPress(
        createPointerEvent(document.documentElement, {
          clientX: 801,
          clientY: 100,
        }),
        document
      )
    ).toBe(true);
    expect(
      isScrollbarPress(
        createPointerEvent(document.body, { clientX: 100, clientY: 601 }),
        document
      )
    ).toBe(true);
    expect(
      isScrollbarPress(
        createPointerEvent(document.documentElement, {
          clientX: 800,
          clientY: 600,
        }),
        document
      )
    ).toBe(false);
    expect(
      isScrollbarPress(
        createPointerEvent(document.body, { clientX: 100, clientY: 100 }),
        document
      )
    ).toBe(false);
  });

  it.each([
    {
      name: 'LTR vertical',
      clientX: 110,
      clientY: 50,
      direction: 'ltr' as const,
      metrics: {
        clientHeight: 100,
        clientLeft: 0,
        clientWidth: 100,
        offsetHeight: 100,
        offsetWidth: 120,
        scrollHeight: 200,
        scrollWidth: 100,
      },
      overflowY: 'scroll',
    },
    {
      name: 'automatic vertical',
      clientX: 110,
      clientY: 50,
      direction: 'ltr' as const,
      metrics: {
        clientHeight: 100,
        clientLeft: 0,
        clientWidth: 100,
        offsetHeight: 100,
        offsetWidth: 120,
        scrollHeight: 200,
        scrollWidth: 100,
      },
      overflowY: 'auto',
    },
    {
      name: 'overlay vertical',
      clientX: 110,
      clientY: 50,
      direction: 'ltr' as const,
      metrics: {
        clientHeight: 100,
        clientLeft: 0,
        clientWidth: 100,
        offsetHeight: 100,
        offsetWidth: 120,
        scrollHeight: 200,
        scrollWidth: 100,
      },
      overflowY: 'overlay',
    },
    {
      name: 'RTL vertical',
      clientX: 10,
      clientY: 50,
      direction: 'rtl' as const,
      metrics: {
        clientHeight: 100,
        clientLeft: 20,
        clientWidth: 100,
        offsetHeight: 100,
        offsetWidth: 120,
        scrollHeight: 200,
        scrollWidth: 100,
      },
      overflowY: 'scroll',
    },
  ])('detects $name scrollbar gutters', (scenario) => {
    const scroller = document.createElement('div');
    configureScroller(scroller, scenario);

    expect(
      isScrollbarPress(
        createPointerEvent(scroller, {
          clientX: scenario.clientX,
          clientY: scenario.clientY,
        }),
        document
      )
    ).toBe(true);
  });

  it.each([
    { name: 'forced', overflowX: 'scroll', scrollWidth: 100 },
    { name: 'automatic', overflowX: 'auto', scrollWidth: 200 },
    { name: 'overlay', overflowX: 'overlay', scrollWidth: 200 },
  ])('detects $name horizontal scrollbar gutters', (scenario) => {
    const scroller = document.createElement('div');
    configureScroller(scroller, {
      metrics: {
        clientHeight: 100,
        clientLeft: 0,
        clientWidth: 100,
        offsetHeight: 120,
        offsetWidth: 100,
        scrollHeight: 100,
        scrollWidth: scenario.scrollWidth,
      },
      overflowX: scenario.overflowX,
    });

    expect(
      isScrollbarPress(
        createPointerEvent(scroller, { clientX: 50, clientY: 110 }),
        document
      )
    ).toBe(true);
  });

  it('uses scaled client bounds for transformed scroll containers', () => {
    const scroller = document.createElement('div');
    configureScroller(scroller, {
      metrics: {
        clientHeight: 50,
        clientLeft: 5,
        clientTop: 5,
        clientWidth: 80,
        offsetHeight: 100,
        offsetWidth: 100,
        scrollHeight: 100,
        scrollWidth: 160,
      },
      overflowX: 'auto',
      rectHeight: 200,
      rectWidth: 200,
    });

    expect(
      isScrollbarPress(
        createPointerEvent(scroller, { clientX: 100, clientY: 120 }),
        document
      )
    ).toBe(true);
    expect(
      isScrollbarPress(
        createPointerEvent(scroller, { clientX: 100, clientY: 100 }),
        document
      )
    ).toBe(false);
  });

  it('falls back to unscaled client bounds when layout dimensions are zero', () => {
    const scroller = document.createElement('div');
    configureScroller(scroller, {
      metrics: {
        clientHeight: 100,
        clientLeft: 0,
        clientWidth: 100,
        offsetHeight: 0,
        offsetWidth: 0,
        scrollHeight: 200,
        scrollWidth: 200,
      },
      overflowX: 'scroll',
      overflowY: 'scroll',
      rectHeight: 120,
      rectWidth: 120,
    });

    expect(
      isScrollbarPress(
        createPointerEvent(scroller, { clientX: 110, clientY: 110 }),
        document
      )
    ).toBe(true);
  });

  it('does not classify content or non-scrollable automatic overflow as a scrollbar', () => {
    const scroller = document.createElement('div');
    configureScroller(scroller, {
      metrics: {
        clientHeight: 100,
        clientLeft: 0,
        clientWidth: 100,
        offsetHeight: 120,
        offsetWidth: 120,
        scrollHeight: 100,
        scrollWidth: 100,
      },
      overflowX: 'auto',
      overflowY: 'auto',
    });

    expect(
      isScrollbarPress(
        createPointerEvent(scroller, { clientX: 110, clientY: 110 }),
        document
      )
    ).toBe(false);
    expect(
      isScrollbarPress(
        createPointerEvent(scroller, { clientX: 50, clientY: 50 }),
        document
      )
    ).toBe(false);
    expect(scroller.getBoundingClientRect).not.toHaveBeenCalled();
  });

  it('does not classify hidden overflow as a scrollbar', () => {
    const scroller = document.createElement('div');
    configureScroller(scroller, {
      metrics: {
        clientHeight: 100,
        clientLeft: 0,
        clientWidth: 100,
        offsetHeight: 120,
        offsetWidth: 120,
        scrollHeight: 200,
        scrollWidth: 200,
      },
      overflowX: 'hidden',
      overflowY: 'hidden',
    });

    expect(
      isScrollbarPress(
        createPointerEvent(scroller, { clientX: 110, clientY: 110 }),
        document
      )
    ).toBe(false);
  });

  it('finds an HTMLElement through a composed path', () => {
    const scroller = document.createElement('div');
    configureScroller(scroller, {
      metrics: {
        clientHeight: 100,
        clientLeft: 0,
        clientWidth: 100,
        offsetHeight: 100,
        offsetWidth: 120,
        scrollHeight: 200,
        scrollWidth: 100,
      },
      overflowY: 'scroll',
    });
    const nonElementTarget = new EventTarget();

    expect(
      isScrollbarPress(
        createPointerEvent(nonElementTarget, { clientX: 110, clientY: 50 }, [
          nonElementTarget,
          scroller,
        ]),
        document
      )
    ).toBe(true);
  });

  it('returns false when the owner document has no window', () => {
    const ownerDocument = document.implementation.createHTMLDocument('');
    const target = ownerDocument.createElement('div');

    expect(
      isScrollbarPress(
        createPointerEvent(target, { clientX: 10, clientY: 10 }),
        ownerDocument
      )
    ).toBe(false);
  });
});
