import { describe, expect, it } from 'vitest';
import { createMockRect } from '../utils/testUtils';
import {
  computeFloatingPosition,
  type FloatingPositionInput,
} from './geometry';

const clippingRect = createMockRect({ width: 320, height: 240 });

function compute(
  overrides: Partial<FloatingPositionInput> = {}
): ReturnType<typeof computeFloatingPosition> {
  return computeFloatingPosition({
    referenceRect: createMockRect({
      x: 120,
      y: 100,
      width: 80,
      height: 40,
    }),
    floatingSize: { width: 100, height: 60 },
    side: 'bottom',
    alignment: 'center',
    offset: 8,
    clippingRect,
    collisionPadding: 8,
    direction: 'ltr',
    devicePixelRatio: 1,
    ...overrides,
  });
}

describe('computeFloatingPosition', () => {
  it.each([
    ['top', 110, 32],
    ['right', 208, 90],
    ['bottom', 110, 148],
    ['left', 12, 90],
  ] as const)('positions centered content on the %s side', (side, x, y) => {
    expect(compute({ side })).toMatchObject({
      x,
      y,
      side,
      alignment: 'center',
    });
  });

  it('flips to the opposite side before shifting when the preferred side overflows', () => {
    expect(
      compute({
        referenceRect: createMockRect({
          x: 120,
          y: 190,
          width: 80,
          height: 24,
        }),
        floatingSize: { width: 180, height: 100 },
      })
    ).toMatchObject({ x: 70, y: 82, side: 'top' });
  });

  it('uses the lowest-overflow candidate when no placement fully fits', () => {
    expect(
      compute({
        referenceRect: createMockRect({
          x: 120,
          y: 120,
          width: 80,
          height: 20,
        }),
        floatingSize: { width: 100, height: 180 },
      })
    ).toMatchObject({ side: 'top', y: -68 });
  });

  it('shifts only on the cross axis and respects collision padding', () => {
    expect(
      compute({
        referenceRect: createMockRect({
          x: 0,
          y: 100,
          width: 20,
          height: 20,
        }),
        floatingSize: { width: 100, height: 40 },
      })
    ).toMatchObject({ x: 8, y: 128, side: 'bottom' });
  });

  it('resolves logical start alignment in LTR and RTL', () => {
    expect(compute({ alignment: 'start' })).toMatchObject({
      x: 120,
      alignment: 'start',
    });
    expect(compute({ alignment: 'start', direction: 'rtl' })).toMatchObject({
      x: 100,
      alignment: 'start',
    });
  });

  it('resolves logical end alignment and aligned horizontal sides', () => {
    expect(compute({ alignment: 'end' })).toMatchObject({
      x: 100,
      alignment: 'end',
    });
    expect(compute({ alignment: 'end', direction: 'rtl' })).toMatchObject({
      x: 120,
      alignment: 'end',
    });
    expect(
      compute({
        side: 'right',
        alignment: 'start',
        floatingSize: { width: 100, height: 20 },
      })
    ).toMatchObject({ y: 100, side: 'right', alignment: 'start' });
    expect(
      compute({
        side: 'right',
        alignment: 'end',
        floatingSize: { width: 100, height: 20 },
      })
    ).toMatchObject({ y: 120, side: 'right', alignment: 'end' });
  });

  it('accounts for references larger than aligned overlays on both axes', () => {
    expect(
      compute({
        alignment: 'start',
        floatingSize: { width: 40, height: 60 },
      })
    ).toMatchObject({ x: 120, side: 'bottom' });
    expect(
      compute({
        side: 'right',
        alignment: 'start',
        floatingSize: { width: 60, height: 20 },
      })
    ).toMatchObject({ y: 100, side: 'right' });
  });

  it('tries the opposite alignment before the opposite side', () => {
    expect(
      compute({
        alignment: 'start',
        referenceRect: createMockRect({
          x: 280,
          y: 100,
          width: 32,
          height: 24,
        }),
        floatingSize: { width: 120, height: 60 },
      })
    ).toMatchObject({
      x: 192,
      side: 'bottom',
      alignment: 'end',
    });
  });

  it('keeps oversized overlays anchored to the padded clipping start', () => {
    expect(compute({ floatingSize: { width: 400, height: 60 } })).toMatchObject(
      { x: 8 }
    );
  });

  it('rounds coordinates to physical device pixels', () => {
    expect(
      compute({
        referenceRect: createMockRect({
          x: 120.25,
          y: 100.25,
          width: 80,
          height: 40,
        }),
        floatingSize: { width: 99.5, height: 60 },
        devicePixelRatio: 2,
      })
    ).toMatchObject({ x: 110.5, y: 148.5 });
  });

  it('falls back to CSS-pixel rounding for a non-positive DPR', () => {
    expect(
      compute({
        referenceRect: createMockRect({
          x: 120.25,
          y: 100.25,
          width: 80,
          height: 40,
        }),
        floatingSize: { width: 99.5, height: 60 },
        devicePixelRatio: 0,
      })
    ).toMatchObject({ x: 111, y: 148 });
  });
});
