// biome-ignore-all lint/a11y/noPositiveTabindex: regression coverage must model consumer-authored positive tab order
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Portal from '../utils/Portal';
import { FocusScope } from './FocusScope';

function FocusScopeFixture({
  open = true,
  initialFocusRef,
  children,
  modal = true,
  restoreFocus = true,
}: Readonly<{
  open?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  children?: React.ReactNode;
  modal?: boolean;
  restoreFocus?: boolean;
}>): React.JSX.Element {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button ref={triggerRef} type='button'>
        Trigger
      </button>
      <button data-testid='outside' type='button' aria-hidden='false'>
        Outside
      </button>
      <div aria-live='polite'>Live updates</div>
      {open ? (
        <Portal>
          <FocusScope
            contentRef={contentRef}
            triggerRef={triggerRef}
            initialFocusRef={initialFocusRef}
            modal={modal}
            restoreFocus={restoreFocus}
          >
            <div ref={contentRef} tabIndex={-1}>
              {children}
            </div>
          </FocusScope>
        </Portal>
      ) : null}
    </>
  );
}

function NestedFocusScopes({
  childOpen,
  parentOpen,
}: Readonly<{ childOpen: boolean; parentOpen: boolean }>): React.JSX.Element {
  const parentTriggerRef = useRef<HTMLButtonElement>(null);
  const parentContentRef = useRef<HTMLDivElement>(null);
  const childTriggerRef = useRef<HTMLButtonElement>(null);
  const childContentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div data-testid='nested-boundary' aria-hidden='false'>
        <button ref={parentTriggerRef} type='button'>
          Parent trigger
        </button>
        <button type='button'>Nested outside</button>
      </div>
      {parentOpen ? (
        <Portal>
          <FocusScope
            contentRef={parentContentRef}
            triggerRef={parentTriggerRef}
          >
            <div ref={parentContentRef} tabIndex={-1}>
              <button ref={childTriggerRef} type='button'>
                Child trigger
              </button>
              {childOpen ? (
                <Portal>
                  <FocusScope
                    contentRef={childContentRef}
                    triggerRef={childTriggerRef}
                  >
                    <div ref={childContentRef} tabIndex={-1}>
                      Child content
                    </div>
                  </FocusScope>
                </Portal>
              ) : null}
            </div>
          </FocusScope>
        </Portal>
      ) : null}
    </>
  );
}

function InitiallyFocusedButton(): React.JSX.Element {
  const ref = useRef<HTMLButtonElement>(null);
  React.useLayoutEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <button ref={ref} type='button'>
      Already focused
    </button>
  );
}

function InlineInitiallyFocusedScope(): React.JSX.Element {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button ref={triggerRef} type='button'>
        Inline trigger
      </button>
      <FocusScope contentRef={contentRef} triggerRef={triggerRef}>
        <div ref={contentRef} tabIndex={-1}>
          <InitiallyFocusedButton />
        </div>
      </FocusScope>
    </>
  );
}

describe('FocusScope', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('keeps focus guards out of the accessibility tree outside Safari', () => {
    render(<FocusScopeFixture />);

    const guards = document.querySelectorAll<HTMLElement>(
      '[data-frey-focus-guard]'
    );
    expect(guards).toHaveLength(2);
    guards.forEach((guard) => {
      expect(guard.tagName).toBe('SPAN');
      expect(guard).toHaveAttribute('aria-hidden', 'true');
      expect(guard).not.toHaveAttribute('role');
    });
  });

  it('uses the Safari VoiceOver focus-guard role without hiding the guard', () => {
    vi.stubGlobal('CSS', { supports: vi.fn(() => true) });
    vi.spyOn(window.navigator, 'vendor', 'get').mockReturnValue(
      'Apple Computer, Inc.'
    );

    render(<FocusScopeFixture />);

    const guards = document.querySelectorAll<HTMLElement>(
      '[data-frey-focus-guard]'
    );
    expect(guards).toHaveLength(2);
    guards.forEach((guard) => {
      expect(guard.tagName).toBe('SPAN');
      expect(guard).toHaveAttribute('role', 'button');
      expect(guard).not.toHaveAttribute('aria-hidden');
    });
  });

  it('focuses the first tabbable element and loops Tab in both directions', async () => {
    const user = userEvent.setup();
    render(
      <FocusScopeFixture>
        <button type='button'>First</button>
        <button type='button'>Last</button>
      </FocusScopeFixture>
    );

    const first = await screen.findByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });
    await waitFor(() => expect(first).toHaveFocus());

    await user.tab();
    expect(last).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
    await user.tab({ shift: true });
    expect(first).toHaveFocus();
  });

  it('uses a requested initial target and falls back to content with no tabbables', async () => {
    const preferredRef: React.RefObject<HTMLElement | null> = {
      current: null,
    };
    const { unmount } = render(
      <FocusScopeFixture initialFocusRef={preferredRef}>
        <button
          ref={(node) => {
            preferredRef.current = node;
          }}
          type='button'
        >
          Preferred
        </button>
      </FocusScopeFixture>
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Preferred' })).toHaveFocus()
    );

    unmount();
    render(<FocusScopeFixture>No actions</FocusScopeFixture>);
    const content = screen.getByText('No actions');
    await waitFor(() => expect(content).toHaveFocus());
    expect(fireEvent.keyDown(content, { key: 'Tab' })).toBe(false);
    expect(content).toHaveFocus();
    const guards = document.querySelectorAll<HTMLElement>(
      '[data-frey-focus-guard]'
    );
    fireEvent.focus(guards[0]);
    expect(content).toHaveFocus();
    fireEvent.focus(guards[1]);
    expect(content).toHaveFocus();
  });

  it('keeps an already-focused descendant during initial focus setup', async () => {
    render(<InlineInitiallyFocusedScope />);

    await Promise.resolve();
    expect(
      screen.getByRole('button', { name: 'Already focused' })
    ).toHaveFocus();
  });

  it('ignores the queued initial focus after immediate cleanup', async () => {
    const { unmount } = render(
      <FocusScopeFixture>
        <button type='button'>Immediately removed</button>
      </FocusScopeFixture>
    );

    unmount();
    await Promise.resolve();

    expect(screen.queryByText('Immediately removed')).toBeNull();
  });

  it('keeps only the checked radio in a named group in the Tab sequence', async () => {
    render(
      <FocusScopeFixture>
        <input type='radio' name='choice' aria-label='First choice' />
        <input
          type='radio'
          name='choice'
          aria-label='Selected choice'
          defaultChecked
        />
      </FocusScopeFixture>
    );

    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: 'Selected choice' })
      ).toHaveFocus()
    );
  });

  it('normalizes radio input types when calculating named groups', async () => {
    render(
      <FocusScopeFixture>
        <input
          type={'RADIO' as 'radio'}
          name='normalized-choice'
          aria-label='Unselected normalized choice'
        />
        <input
          type={'RADIO' as 'radio'}
          name='normalized-choice'
          aria-label='Selected normalized choice'
          defaultChecked
        />
      </FocusScopeFixture>
    );

    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: 'Selected normalized choice' })
      ).toHaveFocus()
    );
  });

  it('orders positive tab indexes before the natural tab sequence', async () => {
    const user = userEvent.setup();
    render(
      <FocusScopeFixture>
        <button type='button' tabIndex={2}>
          Second positive
        </button>
        <button type='button'>Natural order</button>
        <button type='button' tabIndex={1}>
          First positive
        </button>
      </FocusScopeFixture>
    );

    const firstPositive = screen.getByRole('button', {
      name: 'First positive',
    });
    await waitFor(() => expect(firstPositive).toHaveFocus());
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Second positive' })
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Natural order' })).toHaveFocus();
  });

  it('skips hidden and disabled controls and uses the first unchecked named radio', async () => {
    render(
      <FocusScopeFixture>
        <button type='button' hidden>
          Hidden
        </button>
        <div hidden>
          <button type='button'>Hidden by ancestor</button>
        </div>
        <div style={{ display: 'none' }}>
          <button type='button'>Display hidden by ancestor</button>
        </div>
        <button type='button' style={{ display: 'none' }}>
          Display none
        </button>
        <button type='button' style={{ visibility: 'hidden' }}>
          Visibility hidden
        </button>
        <button type='button' disabled>
          Disabled
        </button>
        <fieldset disabled>
          <button type='button'>Disabled by fieldset</button>
        </fieldset>
        <div inert>
          <button type='button'>Inert</button>
        </div>
        <input type='radio' name='unchecked' aria-label='First unchecked' />
        <input type='radio' name='unchecked' aria-label='Second unchecked' />
        <input type='radio' aria-label='Unnamed radio' />
      </FocusScopeFixture>
    );

    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: 'First unchecked' })
      ).toHaveFocus()
    );
  });

  it('includes semantic summary controls in the focus order', async () => {
    render(
      <FocusScopeFixture>
        <details>
          <summary>Disclosure summary</summary>
          Disclosure content
        </details>
      </FocusScopeFixture>
    );

    await waitFor(() =>
      expect(screen.getByText('Disclosure summary')).toHaveFocus()
    );
  });

  it('excludes controls hidden inside closed details from focus wrapping', async () => {
    render(
      <FocusScopeFixture>
        <button type='button'>Visible action</button>
        <details>
          <summary>Disclosure summary</summary>
          <button type='button'>Closed disclosure action</button>
        </details>
      </FocusScopeFixture>
    );

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Visible action' })
      ).toHaveFocus()
    );
    const beforeGuard = document.querySelector<HTMLElement>(
      '[data-frey-focus-guard="before"]'
    );
    expect(beforeGuard).not.toBeNull();
    fireEvent.focus(beforeGuard as HTMLElement);

    expect(screen.getByText('Disclosure summary')).toHaveFocus();
  });

  it('falls back to focus without options when preventScroll is unsupported', async () => {
    const originalFocus = HTMLElement.prototype.focus;
    vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (
      this: HTMLElement,
      options?: FocusOptions
    ) {
      if (options) throw new Error('preventScroll is unsupported');
      originalFocus.call(this);
    });

    render(
      <FocusScopeFixture>
        <button type='button'>Fallback focus target</button>
      </FocusScopeFixture>
    );

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Fallback focus target' })
      ).toHaveFocus()
    );
  });

  it('hides outside content while preserving live regions and restores attributes', async () => {
    const script = document.createElement('script');
    const style = document.createElement('style');
    const status = document.createElement('div');
    const alert = document.createElement('div');
    const output = document.createElement('output');
    status.setAttribute('role', 'status');
    alert.setAttribute('role', 'alert');
    document.body.append(script, style, status, alert, output);
    const { rerender } = render(<FocusScopeFixture />);
    const outside = screen.getByTestId('outside');
    const liveRegion = screen.getByText('Live updates');

    await waitFor(() => expect(outside).toHaveAttribute('aria-hidden', 'true'));
    expect(liveRegion).not.toHaveAttribute('aria-hidden', 'true');
    expect(script).not.toHaveAttribute('aria-hidden');
    expect(style).not.toHaveAttribute('aria-hidden');
    expect(status).not.toHaveAttribute('aria-hidden');
    expect(alert).not.toHaveAttribute('aria-hidden');
    expect(output).not.toHaveAttribute('aria-hidden');

    rerender(<FocusScopeFixture open={false} />);
    await waitFor(() =>
      expect(outside).toHaveAttribute('aria-hidden', 'false')
    );
  });

  it('supports a non-modal scope with disabled focus restoration', async () => {
    const { rerender } = render(
      <FocusScopeFixture modal={false} restoreFocus={false}>
        <button type='button'>Non-modal action</button>
      </FocusScopeFixture>
    );

    const action = screen.getByRole('button', { name: 'Non-modal action' });
    await waitFor(() => expect(action).toHaveFocus());
    expect(screen.getByTestId('outside')).toHaveAttribute(
      'aria-hidden',
      'false'
    );
    expect(document.querySelector('[data-frey-focus-guard]')).toBeNull();

    rerender(
      <FocusScopeFixture open={false} modal={false} restoreFocus={false} />
    );
    expect(screen.getByRole('button', { name: 'Trigger' })).not.toHaveFocus();
  });

  it('tolerates focus guards before the content ref is assigned', () => {
    const missingContentRef: React.RefObject<HTMLElement | null> = {
      current: null,
    };
    const triggerRef: React.RefObject<HTMLElement | null> = { current: null };
    render(
      <FocusScope contentRef={missingContentRef} triggerRef={triggerRef}>
        <span>Pending content</span>
      </FocusScope>
    );

    const guards = document.querySelectorAll<HTMLElement>(
      '[data-frey-focus-guard]'
    );
    expect(guards).toHaveLength(2);
    expect(() => {
      fireEvent.focus(guards[0]);
      fireEvent.focus(guards[1]);
    }).not.toThrow();
  });

  it('handles detached content while preserving and restoring outside state', async () => {
    const detachedContent = document.createElement('div');
    const contentRef: React.RefObject<HTMLElement | null> = {
      current: detachedContent,
    };
    const triggerRef: React.RefObject<HTMLElement | null> = { current: null };
    const { container, unmount } = render(
      <FocusScope contentRef={contentRef} triggerRef={triggerRef}>
        <span>Detached contract</span>
      </FocusScope>
    );
    const root = container;

    await waitFor(() => expect(root).toHaveAttribute('aria-hidden', 'true'));
    unmount();
    expect(root).not.toHaveAttribute('aria-hidden');
  });

  it('restores focus to the trigger after unmounting', async () => {
    const { rerender } = render(
      <FocusScopeFixture>
        <button type='button'>Action</button>
      </FocusScopeFixture>
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Action' })).toHaveFocus()
    );

    rerender(<FocusScopeFixture open={false} />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus()
    );
  });

  it('restores focus when the document body owns focus during cleanup', async () => {
    const { rerender } = render(
      <FocusScopeFixture>
        <button type='button'>Body cleanup action</button>
      </FocusScopeFixture>
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Body cleanup action' })
      ).toHaveFocus()
    );
    document.body.tabIndex = -1;
    document.body.focus();

    rerender(<FocusScopeFixture open={false} />);

    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus();
    document.body.removeAttribute('tabindex');
  });

  it('restores focus when activeElement is unavailable during cleanup', async () => {
    const { rerender } = render(
      <FocusScopeFixture>
        <button type='button'>Null active element action</button>
      </FocusScopeFixture>
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Null active element action' })
      ).toHaveFocus()
    );
    const trigger = screen
      .getByText('Trigger')
      .closest('button') as HTMLElement;
    const focusTrigger = vi.spyOn(trigger, 'focus');
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null);

    rerender(<FocusScopeFixture open={false} />);

    expect(focusTrigger).toHaveBeenCalled();
  });

  it('reference-counts ARIA hiding across nested scope cleanup', async () => {
    const { rerender } = render(<NestedFocusScopes childOpen parentOpen />);
    const outsideBoundary = screen.getByTestId('nested-boundary');
    const outsideContainer = outsideBoundary.parentElement as HTMLElement;
    await waitFor(() =>
      expect(outsideContainer).toHaveAttribute('aria-hidden', 'true')
    );
    expect(
      screen.getByText('Child content').closest('[data-frey-portal="true"]')
    ).not.toHaveAttribute('aria-hidden', 'true');

    rerender(<NestedFocusScopes childOpen={false} parentOpen />);
    expect(outsideContainer).toHaveAttribute('aria-hidden', 'true');

    rerender(<NestedFocusScopes childOpen={false} parentOpen={false} />);
    expect(outsideContainer).not.toHaveAttribute('aria-hidden');
  });

  it('does not steal focus from an outside pointer target during closure', async () => {
    const { rerender } = render(
      <FocusScopeFixture>
        <button type='button'>Action</button>
      </FocusScopeFixture>
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Action' })).toHaveFocus()
    );
    const outside = screen.getByTestId('outside');
    outside.focus();

    rerender(<FocusScopeFixture open={false} />);

    expect(outside).toHaveFocus();
  });

  it('restores outside ARIA state after React Strict Mode cleanup', async () => {
    const { unmount } = render(
      <React.StrictMode>
        <FocusScopeFixture />
      </React.StrictMode>
    );
    const outside = screen.getByTestId('outside');
    await waitFor(() => expect(outside).toHaveAttribute('aria-hidden', 'true'));

    unmount();

    expect(outside).toHaveAttribute('aria-hidden', 'false');
  });
});
