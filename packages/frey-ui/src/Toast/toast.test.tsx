import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type ToastOptions, ToastProvider, useToast } from './index';

function ToastHarness({
  onAction,
  autoDuration
}: Readonly<{ onAction?: () => void; autoDuration?: number }>) {
  const { toast, dismissAll } = useToast();

  return (
    <div>
      <button
        type='button'
        onClick={() => {
          toast({
            title: 'Saved',
            description: 'Project updated successfully.',
            variant: 'success',
            duration: autoDuration,
            action: onAction
              ? {
                  label: 'Undo',
                  onClick: onAction
                }
              : undefined
          });
        }}
      >
        Show toast
      </button>

      <button type='button' onClick={dismissAll}>
        Dismiss all
      </button>
    </div>
  );
}

function ToastIdHarness({
  options
}: Readonly<{ options: Readonly<ToastOptions> }>) {
  const { toast } = useToast();
  const [generatedId, setGeneratedId] = React.useState('');

  return (
    <div>
      <button
        type='button'
        onClick={() => {
          const nextId = toast(options);
          setGeneratedId(nextId);
        }}
      >
        Show custom toast
      </button>

      <output data-testid='generated-toast-id'>{generatedId}</output>
    </div>
  );
}

function VariantToastHarness() {
  const { toast } = useToast();

  return (
    <div>
      <button
        type='button'
        onClick={() => {
          toast({
            description: 'Default info toast',
            duration: 0
          });
        }}
      >
        Show default toast
      </button>

      <button
        type='button'
        onClick={() => {
          toast({
            description: 'Error toast',
            variant: 'error',
            duration: 0
          });
        }}
      >
        Show error toast
      </button>
    </div>
  );
}

function OverflowToastHarness() {
  const { toast } = useToast();

  return (
    <button
      type='button'
      onClick={() => {
        toast({ description: 'First toast', duration: 5000 });
        toast({ description: 'Second toast', duration: 5000 });
      }}
    >
      Show two toasts
    </button>
  );
}

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('throws when useToast is used outside ToastProvider', () => {
    function InvalidConsumer() {
      useToast();
      return <div>Invalid usage</div>;
    }

    expect(() => {
      render(<InvalidConsumer />);
    }).toThrow('useToast must be used within a ToastProvider.');
  });

  it('shows a toast through useToast()', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));

    expect(
      screen.getByText('Project updated successfully.')
    ).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('runs action callback and dismisses toast', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <ToastProvider>
        <ToastHarness onAction={onAction} />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText('Project updated successfully.')
    ).not.toBeInTheDocument();
  });

  it('dismisses toast from close button', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));
    await user.click(
      screen.getByRole('button', { name: 'Dismiss notification' })
    );

    expect(
      screen.queryByText('Project updated successfully.')
    ).not.toBeInTheDocument();
  });

  it('dismisses all visible toasts', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss all' }));

    expect(
      screen.queryByText('Project updated successfully.')
    ).not.toBeInTheDocument();
  });

  it('uses incrementing fallback ids when crypto.randomUUID is unavailable', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('crypto', undefined);

    render(
      <ToastProvider>
        <ToastIdHarness
          options={{
            description: 'Fallback id toast',
            duration: 0
          }}
        />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Show custom toast' }));

    expect(screen.getByTestId('generated-toast-id')).toHaveTextContent(
      /^toast-\d+$/
    );
  });

  it('applies default info variant and assertive aria-live for error variant', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <VariantToastHarness />
      </ToastProvider>
    );

    await user.click(
      screen.getByRole('button', { name: 'Show default toast' })
    );

    const defaultToastOutput = screen
      .getByText('Default info toast')
      .closest('output');

    expect(defaultToastOutput).toHaveAttribute('aria-live', 'polite');

    await user.click(screen.getByRole('button', { name: 'Show error toast' }));

    const errorToastOutput = screen.getByText('Error toast').closest('output');

    expect(errorToastOutput).toHaveAttribute('aria-live', 'assertive');
  });

  it('respects toast limit and removes overflowed items', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider limit={1}>
        <OverflowToastHarness />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Show two toasts' }));

    expect(screen.getByText('Second toast')).toBeInTheDocument();
    expect(screen.queryByText('First toast')).not.toBeInTheDocument();
  });

  it('does not auto-dismiss when duration is zero', async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <ToastHarness autoDuration={0} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(
      screen.getByText('Project updated successfully.')
    ).toBeInTheDocument();
  });

  it('auto dismisses toast after duration', async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <ToastHarness autoDuration={1200} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));

    expect(
      screen.getByText('Project updated successfully.')
    ).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1300);
    });

    expect(
      screen.queryByText('Project updated successfully.')
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));

    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  it('renders viewport directly in server mode when document is unavailable', () => {
    vi.stubGlobal('document', undefined);

    const markup = renderToString(
      <ToastProvider>
        <div>Server child</div>
      </ToastProvider>
    );

    expect(markup).toContain('Notifications');
    expect(markup).toContain('Server child');
  });
});
