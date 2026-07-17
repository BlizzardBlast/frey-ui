type PointerTargetContext = {
  ownerWindow: Window;
  target: HTMLElement;
};

type ScaledClientBounds = {
  bottom: number;
  left: number;
  rectLeft: number;
  rectTop: number;
  right: number;
};

type ScrollbarPresence = {
  horizontal: boolean;
  vertical: boolean;
};

const scrollableOverflow = /^(auto|overlay|scroll)$/;

function getEventPath(event: Event): EventTarget[] {
  if (typeof event.composedPath === 'function') return event.composedPath();
  return event.target ? [event.target] : [];
}

export function eventIsInside(
  event: Event,
  element: HTMLElement | null
): boolean {
  if (!element) return false;
  const path = getEventPath(event);
  if (path.includes(element)) return true;
  return event.target instanceof Node && element.contains(event.target);
}

function isDocumentScrollbarTarget(
  event: PointerEvent,
  ownerDocument: Document
): boolean {
  return (
    event.target === ownerDocument.documentElement ||
    event.target === ownerDocument.body
  );
}

function isDocumentScrollbarPress(
  event: PointerEvent,
  ownerDocument: Document
): boolean {
  const documentElement = ownerDocument.documentElement;
  return (
    event.clientX > documentElement.clientWidth ||
    event.clientY > documentElement.clientHeight
  );
}

function getPointerTargetContext(
  event: PointerEvent,
  ownerDocument: Document
): PointerTargetContext | null {
  const ownerWindow = ownerDocument.defaultView;
  if (!ownerWindow) return null;
  const target = getEventPath(event).find(
    (entry): entry is HTMLElement => entry instanceof ownerWindow.HTMLElement
  );
  return target ? { ownerWindow, target } : null;
}

function hasScrollbar(
  overflow: string,
  scrollSize: number,
  clientSize: number
): boolean {
  return (
    scrollableOverflow.test(overflow) &&
    (overflow === 'scroll' || scrollSize > clientSize)
  );
}

function getElementScale(rectSize: number, layoutSize: number): number {
  return layoutSize > 0 ? rectSize / layoutSize : 1;
}

function getScrollbarPresence(
  target: HTMLElement,
  style: CSSStyleDeclaration
): ScrollbarPresence {
  return {
    horizontal: hasScrollbar(
      style.overflowX,
      target.scrollWidth,
      target.clientWidth
    ),
    vertical: hasScrollbar(
      style.overflowY,
      target.scrollHeight,
      target.clientHeight
    ),
  };
}

function getScaledClientBounds(target: HTMLElement): ScaledClientBounds {
  const rect = target.getBoundingClientRect();
  const scaleX = getElementScale(rect.width, target.offsetWidth);
  const scaleY = getElementScale(rect.height, target.offsetHeight);
  const left = target.clientLeft * scaleX;
  const top = target.clientTop * scaleY;

  return {
    bottom: top + target.clientHeight * scaleY,
    left,
    rectLeft: rect.left,
    rectTop: rect.top,
    right: left + target.clientWidth * scaleX,
  };
}

function isVerticalScrollbarPress(
  pointerX: number,
  style: CSSStyleDeclaration,
  bounds: ScaledClientBounds,
  present: boolean
): boolean {
  if (!present) return false;
  return style.direction === 'rtl'
    ? pointerX < bounds.left
    : pointerX > bounds.right;
}

function isHorizontalScrollbarPress(
  pointerY: number,
  bounds: ScaledClientBounds,
  present: boolean
): boolean {
  return present && pointerY > bounds.bottom;
}

function isElementScrollbarPress(
  event: PointerEvent,
  { ownerWindow, target }: PointerTargetContext
): boolean {
  const style = ownerWindow.getComputedStyle(target);
  const scrollbars = getScrollbarPresence(target, style);
  if (!scrollbars.horizontal && !scrollbars.vertical) return false;
  const bounds = getScaledClientBounds(target);
  const pointerX = event.clientX - bounds.rectLeft;
  const pointerY = event.clientY - bounds.rectTop;

  return (
    isVerticalScrollbarPress(pointerX, style, bounds, scrollbars.vertical) ||
    isHorizontalScrollbarPress(pointerY, bounds, scrollbars.horizontal)
  );
}

export function isScrollbarPress(
  event: PointerEvent,
  ownerDocument: Document
): boolean {
  if (isDocumentScrollbarTarget(event, ownerDocument)) {
    return isDocumentScrollbarPress(event, ownerDocument);
  }
  const context = getPointerTargetContext(event, ownerDocument);
  return context ? isElementScrollbarPress(event, context) : false;
}
