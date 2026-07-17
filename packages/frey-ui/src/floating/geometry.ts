export type FloatingSide = 'top' | 'right' | 'bottom' | 'left';
export type FloatingAlignment = 'center' | 'start' | 'end';
export type FloatingDirection = 'ltr' | 'rtl';

type Rect = Pick<
  DOMRect,
  'top' | 'right' | 'bottom' | 'left' | 'width' | 'height'
>;

export type FloatingPositionInput = {
  referenceRect: Rect;
  floatingSize: Readonly<{ width: number; height: number }>;
  side: FloatingSide;
  alignment: FloatingAlignment;
  offset: number;
  clippingRect: Rect;
  collisionPadding: number;
  direction: FloatingDirection;
  devicePixelRatio: number;
};

export type FloatingPosition = {
  x: number;
  y: number;
  side: FloatingSide;
  alignment: FloatingAlignment;
};

type Candidate = Pick<FloatingPosition, 'side' | 'alignment'>;

type Overflow = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type CandidateEvaluation = {
  position: FloatingPosition;
  relevantOverflow: [number, number, number];
};

const oppositeSide: Record<FloatingSide, FloatingSide> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

function getOppositeAlignment(
  alignment: Exclude<FloatingAlignment, 'center'>
): FloatingAlignment {
  return alignment === 'start' ? 'end' : 'start';
}

function getCandidates(
  side: FloatingSide,
  alignment: FloatingAlignment
): Candidate[] {
  const opposite = oppositeSide[side];

  if (alignment === 'center') {
    return [
      { side, alignment },
      { side: opposite, alignment },
    ];
  }

  const oppositeAlignment = getOppositeAlignment(alignment);
  return [
    { side, alignment },
    { side, alignment: oppositeAlignment },
    { side: opposite, alignment },
    { side: opposite, alignment: oppositeAlignment },
  ];
}

function getVerticalSideX(
  referenceRect: Rect,
  floatingWidth: number,
  alignment: FloatingAlignment,
  direction: FloatingDirection
): number {
  if (alignment === 'center') {
    return referenceRect.left + (referenceRect.width - floatingWidth) / 2;
  }

  const logicalStartIsLeft = direction === 'ltr';
  const alignLeft =
    alignment === 'start' ? logicalStartIsLeft : !logicalStartIsLeft;

  return alignLeft ? referenceRect.left : referenceRect.right - floatingWidth;
}

function getHorizontalSideY(
  referenceRect: Rect,
  floatingHeight: number,
  alignment: FloatingAlignment
): number {
  if (alignment === 'center') {
    return referenceRect.top + (referenceRect.height - floatingHeight) / 2;
  }

  return alignment === 'start'
    ? referenceRect.top
    : referenceRect.bottom - floatingHeight;
}

function getCandidateCoordinates(
  candidate: Candidate,
  input: FloatingPositionInput
): Pick<FloatingPosition, 'x' | 'y'> {
  const { referenceRect, floatingSize, offset, direction } = input;

  if (candidate.side === 'top' || candidate.side === 'bottom') {
    return {
      x: getVerticalSideX(
        referenceRect,
        floatingSize.width,
        candidate.alignment,
        direction
      ),
      y:
        candidate.side === 'top'
          ? referenceRect.top - floatingSize.height - offset
          : referenceRect.bottom + offset,
    };
  }

  return {
    x:
      candidate.side === 'left'
        ? referenceRect.left - floatingSize.width - offset
        : referenceRect.right + offset,
    y: getHorizontalSideY(
      referenceRect,
      floatingSize.height,
      candidate.alignment
    ),
  };
}

function getOverflow(
  coordinates: Pick<FloatingPosition, 'x' | 'y'>,
  input: FloatingPositionInput
): Overflow {
  const { floatingSize, clippingRect, collisionPadding } = input;
  const minimumX = clippingRect.left + collisionPadding;
  const maximumX = clippingRect.right - collisionPadding;
  const minimumY = clippingRect.top + collisionPadding;
  const maximumY = clippingRect.bottom - collisionPadding;

  return {
    top: minimumY - coordinates.y,
    right: coordinates.x + floatingSize.width - maximumX,
    bottom: coordinates.y + floatingSize.height - maximumY,
    left: minimumX - coordinates.x,
  };
}

function getOppositeOverflowSide(side: keyof Overflow): keyof Overflow {
  return oppositeSide[side as FloatingSide];
}

function getRelevantOverflow(
  candidate: Candidate,
  overflow: Overflow,
  input: FloatingPositionInput
): [number, number, number] {
  const verticalSide = candidate.side === 'top' || candidate.side === 'bottom';
  let alignmentSide: keyof Overflow;

  if (verticalSide) {
    const alignmentUsesRightSide =
      input.direction === 'rtl'
        ? candidate.alignment === 'end'
        : candidate.alignment === 'start';
    alignmentSide = alignmentUsesRightSide ? 'right' : 'left';
    if (input.referenceRect.width > input.floatingSize.width) {
      alignmentSide = getOppositeOverflowSide(alignmentSide);
    }
  } else {
    alignmentSide = candidate.alignment === 'start' ? 'bottom' : 'top';
    if (input.referenceRect.height > input.floatingSize.height) {
      alignmentSide = getOppositeOverflowSide(alignmentSide);
    }
  }

  return [
    overflow[candidate.side],
    overflow[alignmentSide],
    overflow[getOppositeOverflowSide(alignmentSide)],
  ];
}

function fits(relevantOverflow: [number, number, number]): boolean {
  return relevantOverflow.every((value) => value <= 0);
}

function getOverflowScore(relevantOverflow: [number, number, number]): number {
  return relevantOverflow.reduce(
    (total, value) => total + Math.max(0, value),
    0
  );
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(value, maximum));
}

function shiftCrossAxis(
  position: FloatingPosition,
  input: FloatingPositionInput
): FloatingPosition {
  const { floatingSize, clippingRect, collisionPadding } = input;

  if (position.side === 'top' || position.side === 'bottom') {
    return {
      ...position,
      x: clamp(
        position.x,
        clippingRect.left + collisionPadding,
        clippingRect.right - collisionPadding - floatingSize.width
      ),
    };
  }

  return {
    ...position,
    y: clamp(
      position.y,
      clippingRect.top + collisionPadding,
      clippingRect.bottom - collisionPadding - floatingSize.height
    ),
  };
}

function roundByDpr(value: number, devicePixelRatio: number): number {
  const dpr = devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.round(value * dpr) / dpr;
}

export function computeFloatingPosition(
  input: FloatingPositionInput
): FloatingPosition {
  const candidates = getCandidates(input.side, input.alignment);
  const evaluations: CandidateEvaluation[] = [];

  for (const candidate of candidates) {
    const coordinates = getCandidateCoordinates(candidate, input);
    const position = { ...coordinates, ...candidate };
    const overflow = getOverflow(coordinates, input);
    const relevantOverflow = getRelevantOverflow(candidate, overflow, input);
    evaluations.push({ position, relevantOverflow });

    if (fits(relevantOverflow)) {
      const shifted = shiftCrossAxis(position, input);
      return {
        ...shifted,
        x: roundByDpr(shifted.x, input.devicePixelRatio),
        y: roundByDpr(shifted.y, input.devicePixelRatio),
      };
    }
  }

  const mainAxisFit = evaluations
    .filter(({ relevantOverflow }) => relevantOverflow[0] <= 0)
    .sort(
      (first, second) => first.relevantOverflow[1] - second.relevantOverflow[1]
    )[0];
  const bestFit = [...evaluations].sort(
    (first, second) =>
      getOverflowScore(first.relevantOverflow) -
      getOverflowScore(second.relevantOverflow)
  )[0];
  const shifted = shiftCrossAxis((mainAxisFit ?? bestFit).position, input);
  return {
    ...shifted,
    x: roundByDpr(shifted.x, input.devicePixelRatio),
    y: roundByDpr(shifted.y, input.devicePixelRatio),
  };
}
