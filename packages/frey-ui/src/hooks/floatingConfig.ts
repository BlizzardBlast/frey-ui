import {
  type Placement as FloatingPlacement,
  flip,
  type Middleware,
  offset,
  shift
} from '@floating-ui/react';

export type FloatingSide = 'top' | 'right' | 'bottom' | 'left';

export const FLOATING_VIEWPORT_PADDING = 8;

export function toFloatingPlacement(
  placement: FloatingSide,
  align: 'center' | 'start' = 'center'
): FloatingPlacement {
  if (align === 'start') {
    return `${placement}-start` as FloatingPlacement;
  }

  return placement;
}

export function createFloatingMiddleware(offsetValue: number): Middleware[] {
  return [
    offset(offsetValue),
    flip({ padding: FLOATING_VIEWPORT_PADDING }),
    shift({ padding: FLOATING_VIEWPORT_PADDING })
  ];
}
