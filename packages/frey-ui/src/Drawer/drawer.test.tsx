import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import Drawer from './index';

describe('Drawer', () => {
  it('throws when trigger is used outside of Drawer', () => {
    expect(() => {
      render(<Drawer.Trigger>Invalid usage</Drawer.Trigger>);
    }).toThrow('Drawer components must be wrapped in <Drawer>');
  });

  it('throws when asChild trigger receives a non-element child', () => {
    expect(() => {
      render(
        <Drawer>
          <Drawer.Trigger asChild>Invalid child</Drawer.Trigger>
        </Drawer>
      );
    }).toThrow(
      'Drawer.Trigger with asChild expects a single valid React element child.'
    );
  });

  it('renders title and body when open', () => {
    render(
      <Drawer open>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Workspace settings</Drawer.Title>
            <Drawer.Description>
              Manage your project configuration.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body>Body content</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Workspace settings' })
    ).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(
      screen.getByText('Body content').closest('[data-placement]')
    ).toHaveAttribute('data-placement', 'right');
  });

  it('does not render when closed', () => {
    render(
      <Drawer open={false}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Closed drawer</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Hidden</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens from the default native trigger button', async () => {
    const user = userEvent.setup();

    render(
      <Drawer>
        <Drawer.Trigger>Open drawer</Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Native trigger drawer</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body content</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open drawer' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not open when native trigger click is defaultPrevented', async () => {
    const user = userEvent.setup();

    render(
      <Drawer>
        <Drawer.Trigger
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Prevent native open
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Prevented drawer</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body content</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    await user.click(
      screen.getByRole('button', { name: 'Prevent native open' })
    );

    expect(
      screen.queryByRole('heading', { name: 'Prevented drawer' })
    ).not.toBeInTheDocument();
  });

  it('does not open when asChild trigger click is defaultPrevented', async () => {
    const user = userEvent.setup();

    render(
      <Drawer>
        <Drawer.Trigger asChild>
          <Button
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            Prevent open
          </Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Prevented drawer</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body content</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    await user.click(screen.getByRole('button', { name: 'Prevent open' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer open onOpenChange={onOpenChange}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Close action</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    await user.click(screen.getByRole('button', { name: 'Close drawer' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes on Escape key when enabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer open onOpenChange={onOpenChange}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Escape close</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on Escape key when disabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer open onOpenChange={onOpenChange}>
        <Drawer.Content closeOnEscape={false}>
          <Drawer.Header>
            <Drawer.Title>Escape disabled</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('calls onOpenChange when clicking overlay backdrop', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer open onOpenChange={onOpenChange}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Backdrop close</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    await user.click(screen.getByRole('dialog'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close from overlay when closeOnOverlayClick is false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer open onOpenChange={onOpenChange}>
        <Drawer.Content closeOnOverlayClick={false}>
          <Drawer.Header>
            <Drawer.Title>No overlay close</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    await user.click(document.body);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('hides the close button when hideCloseButton is true', () => {
    render(
      <Drawer open>
        <Drawer.Content hideCloseButton>
          <Drawer.Header>
            <Drawer.Title>No close button</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    expect(
      screen.queryByRole('button', { name: 'Close drawer' })
    ).not.toBeInTheDocument();
  });

  it.each([
    'left',
    'right',
    'top',
    'bottom'
  ] as const)('renders the %s placement', (placement) => {
    render(
      <Drawer open placement={placement}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{placement} drawer</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>Placement body</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    expect(
      screen.getByText('Placement body').closest('[data-placement]')
    ).toHaveAttribute('data-placement', placement);
  });

  it('renders the footer compound component', () => {
    render(
      <Drawer open>
        <Drawer.Content>
          <Drawer.Footer data-testid='drawer-footer'>
            Footer actions
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    );

    expect(screen.getByTestId('drawer-footer')).toHaveTextContent(
      'Footer actions'
    );
  });

  it('returns focus to trigger after closing with Escape', async () => {
    const user = userEvent.setup();

    render(
      <Drawer>
        <Drawer.Trigger>Open drawer</Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Focus restoration</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <button type='button'>Focusable action</button>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    const trigger = screen.getByRole('button', { name: 'Open drawer' });

    await user.click(trigger);
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Drawer open>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>A11y drawer</Drawer.Title>
            <Drawer.Description>Optional description</Drawer.Description>
          </Drawer.Header>
          <Drawer.Body>Body content</Drawer.Body>
        </Drawer.Content>
      </Drawer>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
