// @vitest-environment node

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { useDismissibleLayer } from './dismissibleLayer';
import { useFloatingPosition } from './useFloatingPosition';

function ServerOverlayFixture(): React.JSX.Element {
  const referenceRef = React.useRef<HTMLElement | null>(null);
  const floatingRef = React.useRef<HTMLElement | null>(null);
  useDismissibleLayer({
    open: true,
    referenceRef,
    floatingRef,
    onDismiss: vi.fn(),
  });
  const position = useFloatingPosition({
    open: true,
    side: 'bottom',
    alignment: 'center',
    offset: 8,
  });

  return <div style={position.floatingStyles}>Server overlay</div>;
}

describe('private floating server rendering', () => {
  it('renders without browser globals or layout effects', () => {
    expect(renderToString(<ServerOverlayFixture />)).toContain(
      'Server overlay'
    );
  });
});
