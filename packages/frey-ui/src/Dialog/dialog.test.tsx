import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Dialog from './index';

describe('Dialog', () => {
  it('renders title and content when open', () => {
    render(
      <Dialog open>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Delete item</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Are you sure?</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Delete item' })
    ).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Dialog open={false}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Closed dialog</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Hidden</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Close action</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when clicking overlay backdrop', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Backdrop close</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    // The overlay should be the element right before the content, or just a generic div without role dialog
    // We can click the region just outside the dialog itself
    await user.click(document.body);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close from overlay when closeOnOutsideClick is false', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <Dialog.Content closeOnOverlayClick={false}>
          <Dialog.Header>
            <Dialog.Title>No overlay close</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    await user.click(document.body);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on Escape key when enabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Escape close</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Dialog open>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>A11y dialog</Dialog.Title>
            <Dialog.Description>Optional description</Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>Body content</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
