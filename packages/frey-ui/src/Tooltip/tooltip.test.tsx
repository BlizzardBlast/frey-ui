import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import { createMockRect } from '../utils/testUtils';
import Tooltip from './index';

describe('Tooltip', () => {
  it('throws when asChild receives a non-element child', () => {
    expect(() => {
      render(
        <Tooltip asChild content='Invalid child'>
          Invalid child
        </Tooltip>
      );
    }).toThrow(
      'Tooltip with asChild expects a single valid React element child.'
    );
  });

  it('shows tooltip on hover with default native trigger button', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content='Helpful information' delay={0}>
        Help
      </Tooltip>
    );

    await user.hover(screen.getByRole('button', { name: 'Help' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Helpful information'
    );
  });

  it('shows on native hover for a disabled custom trigger', () => {
    render(
      <Tooltip asChild content='Disabled hint' delay={0}>
        <button type='button' disabled>
          Disabled trigger
        </button>
      </Tooltip>
    );

    fireEvent.mouseEnter(
      screen.getByRole('button', { name: 'Disabled trigger' })
    );

    expect(screen.getByRole('tooltip')).toHaveTextContent('Disabled hint');
  });

  it('shows tooltip on focus and hides on blur', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip asChild content='Keyboard hint' delay={0}>
        <Button>Focus me</Button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Focus me' });

    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.tab();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip asChild content='Escape closes me' delay={0}>
        <Button>Escape target</Button>
      </Tooltip>
    );

    await user.hover(screen.getByRole('button', { name: 'Escape target' }));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps controlled state source-of-truth and ARIA wiring in sync', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Tooltip
        content='Controlled tooltip'
        open={false}
        onOpenChange={onOpenChange}
        delay={0}
        id='controlled-tooltip'
      >
        Controlled trigger
      </Tooltip>
    );
    const trigger = screen.getByRole('button', {
      name: 'Controlled trigger',
    });

    await user.hover(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute('aria-describedby');

    rerender(
      <Tooltip
        content='Controlled tooltip'
        open
        onOpenChange={onOpenChange}
        delay={0}
        id='controlled-tooltip'
        className='consumer-tooltip'
        style={{ left: 13, top: 29 }}
      >
        Controlled trigger
      </Tooltip>
    );

    expect(trigger).toHaveAttribute('aria-describedby', 'controlled-tooltip');
    expect(screen.getByRole('tooltip')).toHaveAttribute(
      'id',
      'controlled-tooltip'
    );
    expect(screen.getByRole('tooltip')).toHaveClass('consumer-tooltip');
    expect(screen.getByRole('tooltip')).toHaveStyle({
      left: '13px',
      top: '29px',
    });
  });

  it('repositions when a scroll container scrolls', async () => {
    const user = userEvent.setup();
    let triggerRect = createMockRect({
      x: 120,
      y: 160,
      width: 80,
      height: 24,
    });
    const tooltipRect = createMockRect({
      width: 100,
      height: 40,
    });
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function getBoundingClientRectMock(
        this: HTMLElement
      ) {
        if (
          this.tagName === 'BUTTON' &&
          this.textContent?.includes('Scroll target')
        ) {
          return triggerRect;
        }

        if (this.getAttribute('role') === 'tooltip') {
          return tooltipRect;
        }

        return createMockRect({});
      });
    const originalInnerHeight = globalThis.innerHeight;
    Object.defineProperty(globalThis, 'innerHeight', {
      configurable: true,
      value: 400,
    });

    try {
      render(
        <div
          data-testid='scroll-host'
          style={{ height: 120, overflow: 'auto', width: 300 }}
        >
          <div style={{ height: 600 }}>
            <Tooltip
              asChild
              content='Scrollable tooltip'
              delay={0}
              placement='top'
            >
              <Button>Scroll target</Button>
            </Tooltip>
          </div>
        </div>
      );

      await user.hover(screen.getByRole('button', { name: 'Scroll target' }));

      const tooltip = screen.getByRole('tooltip');

      await waitFor(() => {
        const top = Number.parseFloat(tooltip.style.top);
        expect(top).toBeCloseTo(112, 0);
      });

      triggerRect = createMockRect({
        x: 120,
        y: 120,
        width: 80,
        height: 24,
      });

      screen
        .getByTestId('scroll-host')
        .dispatchEvent(new Event('scroll', { bubbles: false }));

      await waitFor(() => {
        const top = Number.parseFloat(tooltip.style.top);
        expect(top).toBeCloseTo(72, 0);
      });
    } finally {
      rectSpy.mockRestore();
      Object.defineProperty(globalThis, 'innerHeight', {
        configurable: true,
        value: originalInnerHeight,
      });
    }
  });

  it('has no accessibility violations', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip asChild content='A11y tooltip' delay={0}>
        <Button>A11y target</Button>
      </Tooltip>
    );

    await user.hover(screen.getByRole('button', { name: 'A11y target' }));

    const tooltip = await screen.findByRole('tooltip');

    await waitFor(() => {
      expect(tooltip).toBeInTheDocument();
    });

    const results = await axe(tooltip);
    expect(results).toHaveNoViolations();
  });

  it('returns only the trigger in server mode when document is unavailable', () => {
    vi.stubGlobal('document', undefined);

    const markup = renderToString(
      <Tooltip content='Server tooltip'>Server trigger</Tooltip>
    );

    expect(markup).toContain('Server trigger');
    expect(markup).not.toContain('role="tooltip"');

    vi.unstubAllGlobals();
  });
});
