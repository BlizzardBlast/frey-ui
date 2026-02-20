import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Dialog from './index';

describe('Dialog', () => {
  it('renders title and content when open', () => {
    render(
      <Dialog open title='Delete item'>
        Are you sure?
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
      <Dialog open={false} title='Closed dialog'>
        Hidden
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open title='Close action' onOpenChange={onOpenChange}>
        Body
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when clicking overlay backdrop', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open title='Backdrop close' onOpenChange={onOpenChange}>
        Body
      </Dialog>
    );

    await user.click(screen.getByRole('dialog'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close from overlay when closeOnOverlayClick is false', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog
        open
        title='No overlay close'
        onOpenChange={onOpenChange}
        closeOnOverlayClick={false}
      >
        Body
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    await user.click(dialog);

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on Escape key when enabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open title='Escape close' onOpenChange={onOpenChange}>
        Body
      </Dialog>
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Dialog open title='A11y dialog' description='Optional description'>
        Body content
      </Dialog>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
