import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Button from '../Button';
import Dialog from './index';

describe('Dialog', () => {
  it('throws when trigger is used outside of Dialog', () => {
    expect(() => {
      render(<Dialog.Trigger>Invalid usage</Dialog.Trigger>);
    }).toThrow('Dialog components must be wrapped in <Dialog>');
  });

  it('throws when asChild trigger receives a non-element child', () => {
    expect(() => {
      render(
        <Dialog>
          <Dialog.Trigger asChild>Invalid child</Dialog.Trigger>
        </Dialog>
      );
    }).toThrow(
      'Dialog.Trigger with asChild expects a single valid React element child.'
    );
  });

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

  it('opens from the default native trigger button', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Native trigger dialog</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body content</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open dialog' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not open when native trigger click is defaultPrevented', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <Dialog.Trigger
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Prevent native open
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Prevented native dialog</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body content</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    await user.click(
      screen.getByRole('button', { name: 'Prevent native open' })
    );

    expect(
      screen.queryByRole('heading', { name: 'Prevented native dialog' })
    ).not.toBeInTheDocument();
  });

  it('handles open transitions when activeElement is not an HTMLElement', () => {
    const hadOwnActiveElement = Object.hasOwn(document, 'activeElement');
    const ownDescriptor = hadOwnActiveElement
      ? Object.getOwnPropertyDescriptor(document, 'activeElement')
      : undefined;

    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => null
    });

    try {
      render(
        <Dialog open>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>No active element dialog</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body content</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    } finally {
      if (hadOwnActiveElement && ownDescriptor) {
        Object.defineProperty(document, 'activeElement', ownDescriptor);
      } else {
        delete (document as { activeElement?: Element | null }).activeElement;
      }
    }
  });

  it('does not open when asChild trigger click is defaultPrevented', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <Dialog.Trigger asChild>
          <Button
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            Prevent open
          </Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Prevented dialog</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body content</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: 'Prevent open' }));

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

  it('uses showModal when available', () => {
    const originalShowModal = HTMLDialogElement.prototype.showModal;
    const showModalSpy = vi.fn(function mockedShowModal(
      this: HTMLDialogElement
    ) {
      this.setAttribute('open', '');
    });

    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: showModalSpy
    });

    try {
      render(
        <Dialog open>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Show modal branch</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      expect(showModalSpy).toHaveBeenCalled();
    } finally {
      if (originalShowModal) {
        Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
          configurable: true,
          value: originalShowModal
        });
      } else {
        delete (HTMLDialogElement.prototype as { showModal?: unknown })
          .showModal;
      }
    }
  });

  it('handles cancel and close events from the native dialog element', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <Dialog.Content closeOnEscape={false}>
          <Dialog.Header>
            <Dialog.Title>Cancel and close events</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    const cancelEvent = new Event('cancel', {
      bubbles: true,
      cancelable: true
    });

    fireEvent(dialog, cancelEvent);
    expect(cancelEvent.defaultPrevented).toBe(true);

    fireEvent(dialog, new Event('close', { bubbles: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not prevent cancel default behavior when closeOnEscape is enabled', () => {
    render(
      <Dialog open>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Cancelable by escape</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    const cancelEvent = new Event('cancel', {
      bubbles: true,
      cancelable: true
    });

    fireEvent(dialog, cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(false);
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

    await user.click(screen.getByRole('dialog'));

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

  it('uses dialog.close when available while transitioning to closed state', () => {
    const closeSpy = vi.fn();

    const { rerender } = render(
      <Dialog open>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Close function path</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');

    Object.defineProperty(dialog, 'open', {
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(dialog, 'close', {
      configurable: true,
      value: closeSpy
    });

    rerender(
      <Dialog open={false}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Close function path</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    expect(closeSpy).toHaveBeenCalled();
  });

  it('falls back to removing open attribute when close is unavailable', () => {
    const { rerender } = render(
      <Dialog open>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Close fallback path</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');

    dialog.setAttribute('open', '');
    Object.defineProperty(dialog, 'open', {
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(dialog, 'close', {
      configurable: true,
      value: undefined
    });

    rerender(
      <Dialog open={false}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Close fallback path</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('cleans up close timeout when reopened before transition ends', () => {
    vi.useFakeTimers();

    try {
      const { rerender } = render(
        <Dialog open>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Timer cleanup</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      rerender(
        <Dialog open={false}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Timer cleanup</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      rerender(
        <Dialog open>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Timer cleanup</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores native close events while controlled open state is false', () => {
    const onOpenChange = vi.fn();

    vi.useFakeTimers();

    try {
      const { rerender } = render(
        <Dialog open onOpenChange={onOpenChange}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Controlled close ignore</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      rerender(
        <Dialog open={false} onOpenChange={onOpenChange}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Controlled close ignore</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      const dialog = document.querySelector('dialog');

      expect(dialog).not.toBeNull();
      fireEvent(
        dialog as HTMLDialogElement,
        new Event('close', { bubbles: true })
      );
      expect(onOpenChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(document.querySelector('dialog')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('skips open and close calls when the native dialog state already matches', () => {
    let nativeOpenState = true;
    const openDescriptor = Object.getOwnPropertyDescriptor(
      HTMLDialogElement.prototype,
      'open'
    );
    const showModalDescriptor = Object.getOwnPropertyDescriptor(
      HTMLDialogElement.prototype,
      'showModal'
    );
    const closeDescriptor = Object.getOwnPropertyDescriptor(
      HTMLDialogElement.prototype,
      'close'
    );
    const showModalSpy = vi.fn();
    const closeSpy = vi.fn();

    vi.useFakeTimers();
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      configurable: true,
      get: () => nativeOpenState
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: showModalSpy
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: closeSpy
    });

    try {
      const { rerender } = render(
        <Dialog open>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Native state match</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      expect(showModalSpy).not.toHaveBeenCalled();

      nativeOpenState = false;

      rerender(
        <Dialog open={false}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Native state match</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      expect(closeSpy).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    } finally {
      if (openDescriptor) {
        Object.defineProperty(
          HTMLDialogElement.prototype,
          'open',
          openDescriptor
        );
      }

      if (showModalDescriptor) {
        Object.defineProperty(
          HTMLDialogElement.prototype,
          'showModal',
          showModalDescriptor
        );
      } else {
        delete (HTMLDialogElement.prototype as { showModal?: unknown })
          .showModal;
      }

      if (closeDescriptor) {
        Object.defineProperty(
          HTMLDialogElement.prototype,
          'close',
          closeDescriptor
        );
      }

      vi.useRealTimers();
    }
  });

  it('renders the footer compound component', () => {
    render(
      <Dialog open>
        <Dialog.Content>
          <Dialog.Footer data-testid='dialog-footer'>
            Footer actions
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    );

    expect(screen.getByTestId('dialog-footer')).toHaveTextContent(
      'Footer actions'
    );
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

  it('ignores non-Escape keys in the fallback document keydown handler', () => {
    const onOpenChange = vi.fn();
    const showModalDescriptor = Object.getOwnPropertyDescriptor(
      HTMLDialogElement.prototype,
      'showModal'
    );

    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: undefined
    });

    try {
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Fallback keydown</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Body</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(onOpenChange).not.toHaveBeenCalled();
    } finally {
      if (showModalDescriptor) {
        Object.defineProperty(
          HTMLDialogElement.prototype,
          'showModal',
          showModalDescriptor
        );
      } else {
        delete (HTMLDialogElement.prototype as { showModal?: unknown })
          .showModal;
      }
    }
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
