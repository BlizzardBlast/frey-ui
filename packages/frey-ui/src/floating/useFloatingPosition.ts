import React from 'react';
import { autoUpdateFloating, getOverflowElements } from './autoUpdate';
import {
  computeFloatingPosition,
  type FloatingAlignment,
  type FloatingPosition,
  type FloatingSide,
} from './geometry';

export type UseFloatingPositionOptions = {
  open: boolean;
  side: FloatingSide;
  alignment: FloatingAlignment;
  offset: number;
};

export type UseFloatingPositionResult = {
  referenceRef: React.RefObject<HTMLElement | null>;
  floatingRef: React.RefObject<HTMLElement | null>;
  setReference: (node: HTMLElement | null) => void;
  setFloating: (node: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
  resolvedPlacement: Pick<FloatingPosition, 'side' | 'alignment'>;
};

const COLLISION_PADDING = 8;
const useClientLayoutEffect =
  typeof document === 'undefined' ? React.useEffect : React.useLayoutEffect;

function getViewportRect(ownerWindow: Window): DOMRect {
  const visualViewport = ownerWindow.visualViewport;
  const left = visualViewport?.offsetLeft ?? 0;
  const top = visualViewport?.offsetTop ?? 0;
  const width = visualViewport?.width ?? ownerWindow.innerWidth;
  const height = visualViewport?.height ?? ownerWindow.innerHeight;

  return new DOMRect(left, top, width, height);
}

function intersectRects(first: DOMRect, second: DOMRect): DOMRect {
  const left = Math.max(first.left, second.left);
  const top = Math.max(first.top, second.top);
  const right = Math.min(first.right, second.right);
  const bottom = Math.min(first.bottom, second.bottom);

  return new DOMRect(
    left,
    top,
    Math.max(0, right - left),
    Math.max(0, bottom - top)
  );
}

function getInnerClientRect(element: Element): DOMRect {
  const rect = element.getBoundingClientRect();
  if (!(element instanceof HTMLElement)) return rect;
  const hasMeasuredWidth =
    element.offsetWidth > 0 || element.clientWidth > 0 || rect.width === 0;
  const hasMeasuredHeight =
    element.offsetHeight > 0 || element.clientHeight > 0 || rect.height === 0;
  if (!hasMeasuredWidth || !hasMeasuredHeight) return rect;

  const scaleX = element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;
  const scaleY =
    element.offsetHeight > 0 ? rect.height / element.offsetHeight : 1;

  return new DOMRect(
    rect.left + element.clientLeft * scaleX,
    rect.top + element.clientTop * scaleY,
    Math.max(0, element.clientWidth * scaleX),
    Math.max(0, element.clientHeight * scaleY)
  );
}

function getClippingRect(
  reference: HTMLElement,
  floating: HTMLElement,
  ownerWindow: Window
): DOMRect {
  const clippingElements = new Set([
    ...getOverflowElements(reference),
    ...getOverflowElements(floating),
  ]);
  let clippingRect = getViewportRect(ownerWindow);

  clippingElements.forEach((element) => {
    clippingRect = intersectRects(clippingRect, getInnerClientRect(element));
  });
  return clippingRect;
}

function measureFloating(element: HTMLElement): {
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    width: element.offsetWidth || rect.width,
    height: element.offsetHeight || rect.height,
  };
}

function positionsMatch(
  first: FloatingPosition,
  second: FloatingPosition
): boolean {
  const keys = ['x', 'y', 'side', 'alignment'] as const;
  for (const key of keys) {
    if (first[key] !== second[key]) return false;
  }
  return true;
}

export function useFloatingPosition({
  open,
  side,
  alignment,
  offset,
}: UseFloatingPositionOptions): UseFloatingPositionResult {
  const referenceRef = React.useRef<HTMLElement | null>(null);
  const floatingRef = React.useRef<HTMLElement | null>(null);
  const [reference, setReferenceNode] = React.useState<HTMLElement | null>(
    null
  );
  const [floating, setFloatingNode] = React.useState<HTMLElement | null>(null);
  const [position, setPosition] = React.useState<FloatingPosition>(() => ({
    x: 0,
    y: 0,
    side,
    alignment,
  }));

  const setReference = React.useCallback((node: HTMLElement | null) => {
    referenceRef.current = node;
    setReferenceNode((current) => (current === node ? current : node));
  }, []);
  const setFloating = React.useCallback((node: HTMLElement | null) => {
    floatingRef.current = node;
    setFloatingNode((current) => (current === node ? current : node));
  }, []);

  useClientLayoutEffect(() => {
    if (!open || !reference || !floating) return;

    const update = () => {
      const ownerWindow = reference.ownerDocument.defaultView;
      if (!ownerWindow) return;

      const nextPosition = computeFloatingPosition({
        referenceRect: reference.getBoundingClientRect(),
        floatingSize: measureFloating(floating),
        side,
        alignment,
        offset,
        clippingRect: getClippingRect(reference, floating, ownerWindow),
        collisionPadding: COLLISION_PADDING,
        direction:
          ownerWindow.getComputedStyle(reference).direction === 'rtl'
            ? 'rtl'
            : 'ltr',
        devicePixelRatio: ownerWindow.devicePixelRatio,
      });
      setPosition((current) =>
        positionsMatch(current, nextPosition) ? current : nextPosition
      );
    };

    return autoUpdateFloating(reference, floating, update);
  }, [alignment, floating, offset, open, reference, side]);

  const floatingStyles = React.useMemo<React.CSSProperties>(
    () => ({ position: 'fixed', left: position.x, top: position.y }),
    [position.x, position.y]
  );
  const resolvedPlacement = React.useMemo(
    () => ({ side: position.side, alignment: position.alignment }),
    [position.alignment, position.side]
  );

  return {
    referenceRef,
    floatingRef,
    setReference,
    setFloating,
    floatingStyles,
    resolvedPlacement,
  };
}
