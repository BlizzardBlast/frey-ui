import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './index';

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

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
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
});
