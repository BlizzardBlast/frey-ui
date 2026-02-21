import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import Popover from './index';

describe('Popover', () => {
  it('toggles content from trigger click', async () => {
    const user = userEvent.setup();

    render(
      <Popover>
        <Popover.Trigger>
          <Button>Open details</Button>
        </Popover.Trigger>
        <Popover.Content>
          <p>Popover body</p>
        </Popover.Content>
      </Popover>
    );

    await user.click(screen.getByRole('button', { name: 'Open details' }));

    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('closes when clicking outside by default', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type='button'>Outside</button>
        <Popover>
          <Popover.Trigger>
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

  it('does not close on outside click when disabled', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type='button'>Outside</button>
        <Popover closeOnOutsideClick={false}>
          <Popover.Trigger>
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
        <Popover.Trigger>
          <Button>Open popover</Button>
        </Popover.Trigger>
        <Popover.Content>Content</Popover.Content>
      </Popover>
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Popover defaultOpen>
        <Popover.Trigger>
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
