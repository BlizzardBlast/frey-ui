import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useDismiss } from '../useDismiss';

function DismissHarness({
  closeOnEscape = true,
  closeOnOutsideClick = true,
  returnFocusOnClose = false
}: Readonly<{
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  returnFocusOnClose?: boolean;
}>) {
  const [open, setOpen] = React.useState(true);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  useDismiss({
    open,
    onClose: () => setOpen(false),
    triggerRef,
    contentRef,
    closeOnEscape,
    closeOnOutsideClick,
    returnFocusOnClose
  });

  return (
    <>
      <button ref={triggerRef} type='button'>
        Trigger
      </button>
      {open && (
        <div ref={contentRef} data-testid='content'>
          Content
        </div>
      )}
      <button type='button'>Outside</button>
    </>
  );
}

describe('useDismiss', () => {
  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    render(<DismissHarness />);

    expect(screen.getByTestId('content')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('does not close on Escape when disabled', async () => {
    const user = userEvent.setup();
    render(<DismissHarness closeOnEscape={false} />);

    await user.keyboard('{Escape}');

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(<DismissHarness />);

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('does not close on outside click when disabled', async () => {
    const user = userEvent.setup();
    render(<DismissHarness closeOnOutsideClick={false} />);

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('does not close when clicking on trigger', async () => {
    const user = userEvent.setup();
    render(<DismissHarness />);

    await user.click(screen.getByRole('button', { name: 'Trigger' }));

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('does not close when clicking on content', async () => {
    const user = userEvent.setup();
    render(<DismissHarness />);

    await user.click(screen.getByTestId('content'));

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
