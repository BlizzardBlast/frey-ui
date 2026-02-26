import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import Popover from './index';

function createMockRect({
  x = 0,
  y = 0,
  width = 0,
  height = 0
}: Readonly<{
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}>): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({})
  } as DOMRect;
}

describe('Popover', () => {
  it('toggles content from default native trigger button', async () => {
    const user = userEvent.setup();

    render(
      <Popover>
        <Popover.Trigger>Open details</Popover.Trigger>
        <Popover.Content>
          <p>Popover body</p>
        </Popover.Content>
      </Popover>
    );

    await user.click(screen.getByRole('button', { name: 'Open details' }));

    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('does not open when asChild trigger click is defaultPrevented', async () => {
    const user = userEvent.setup();

    render(
      <Popover>
        <Popover.Trigger asChild>
          <Button
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            Prevent popover
          </Button>
        </Popover.Trigger>
        <Popover.Content>Content</Popover.Content>
      </Popover>
    );

    await user.click(screen.getByRole('button', { name: 'Prevent popover' }));

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('closes when clicking outside by default', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type='button'>Outside</button>
        <Popover>
          <Popover.Trigger asChild>
            <Button>Open popover</Button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      </div>
    );

    await user.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(screen.getByText('Content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('does not close when clicking on content', async () => {
    const user = userEvent.setup();

    render(
      <Popover>
        <Popover.Trigger asChild>
          <Button>Open popover</Button>
        </Popover.Trigger>
        <Popover.Content>Content</Popover.Content>
      </Popover>
    );

    await user.click(screen.getByRole('button', { name: 'Open popover' }));
    await user.click(screen.getByText('Content'));

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not close on outside click when disabled', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type='button'>Outside</button>
        <Popover closeOnOutsideClick={false}>
          <Popover.Trigger asChild>
            <Button>Persistent popover</Button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover>
      </div>
    );

    await user.click(
      screen.getByRole('button', { name: 'Persistent popover' })
    );
    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Popover open onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <Button>Open popover</Button>
        </Popover.Trigger>
        <Popover.Content>Content</Popover.Content>
      </Popover>
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('flips from bottom to top when there is not enough viewport space', async () => {
    const user = userEvent.setup();
    const triggerRect = createMockRect({
      x: 120,
      y: 190,
      width: 80,
      height: 24
    });
    const contentRect = createMockRect({
      width: 180,
      height: 100
    });
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function getBoundingClientRectMock(
        this: HTMLElement
      ) {
        if (this.tagName === 'BUTTON' && this.textContent?.includes('Flip')) {
          return triggerRect;
        }

        const id = this.getAttribute('id');
        if (id?.endsWith('-content')) {
          return contentRect;
        }

        return createMockRect({});
      });
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 240
    });

    try {
      render(
        <Popover placement='bottom' offset={8}>
          <Popover.Trigger>Flip</Popover.Trigger>
          <Popover.Content>Flipped content</Popover.Content>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: 'Flip' }));

      const content = screen.getByText('Flipped content');

      await waitFor(() => {
        const top = Number.parseFloat(content.style.top);
        expect(top).toBeCloseTo(182, 0);
      });
    } finally {
      rectSpy.mockRestore();
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: originalInnerHeight
      });
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Popover defaultOpen>
        <Popover.Trigger asChild>
          <Button>Open popover</Button>
        </Popover.Trigger>
        <Popover.Content>
          <p>A11y content</p>
        </Popover.Content>
      </Popover>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
