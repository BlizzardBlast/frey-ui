import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTooltipInteractions } from './useTooltipInteractions';

function TooltipInteractionFixture({
  open = false,
  delay = 0,
  disabled = false,
  label = 'Tooltip trigger',
  onOpenChange,
}: Readonly<{
  open?: boolean;
  delay?: number;
  disabled?: boolean;
  label?: string;
  onOpenChange: (open: boolean) => void;
}>): React.JSX.Element {
  const [reference, setReference] = React.useState<HTMLElement | null>(null);
  const referenceProps = useTooltipInteractions({
    open,
    delay,
    reference,
    onOpenChange,
  });

  return (
    <button
      ref={setReference}
      type='button'
      disabled={disabled}
      {...referenceProps}
    >
      {label}
    </button>
  );
}

describe('useTooltipInteractions', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('opens after the hover delay and closes immediately on leave', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <TooltipInteractionFixture delay={120} onOpenChange={onOpenChange} />
    );
    const trigger = screen.getByRole('button');

    fireEvent.mouseEnter(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(120));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    fireEvent.mouseLeave(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('uses native hover events for disabled custom triggers', () => {
    const onOpenChange = vi.fn();
    render(<TooltipInteractionFixture disabled onOpenChange={onOpenChange} />);

    fireEvent.mouseEnter(screen.getByRole('button'));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('opens for keyboard focus and closes on blur', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <TooltipInteractionFixture onOpenChange={onOpenChange} />
    );

    await user.tab();
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(<TooltipInteractionFixture open onOpenChange={onOpenChange} />);
    fireEvent.blur(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('does not open from pointer-originated focus', () => {
    const onOpenChange = vi.fn();
    render(<TooltipInteractionFixture onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button');
    vi.spyOn(trigger, 'matches').mockReturnValue(true);

    fireEvent.pointerDown(trigger, { pointerType: 'mouse' });
    fireEvent.focus(trigger);

    expect(onOpenChange).not.toHaveBeenCalledWith(true);
  });

  it('keeps pointer modality for modified keys and returns to keyboard modality', () => {
    const onOpenChange = vi.fn();
    render(<TooltipInteractionFixture onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button');
    vi.spyOn(trigger, 'matches').mockReturnValue(true);

    fireEvent.pointerDown(trigger, { pointerType: 'mouse' });
    fireEvent.keyDown(document, { ctrlKey: true, key: 'Control' });
    fireEvent.focus(trigger);
    expect(onOpenChange).not.toHaveBeenCalledWith(true);

    fireEvent.keyDown(document, { key: 'Tab' });
    fireEvent.focus(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('falls back to keyboard modality when focus-visible matching is unsupported', () => {
    const onOpenChange = vi.fn();
    render(<TooltipInteractionFixture onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button');
    vi.spyOn(trigger, 'matches').mockImplementation(() => {
      throw new Error(':focus-visible is unsupported');
    });

    fireEvent.focus(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('does not schedule another open while already controlled open', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <TooltipInteractionFixture open delay={120} onOpenChange={onOpenChange} />
    );

    fireEvent.mouseEnter(screen.getByRole('button'));
    act(() => vi.runAllTimers());

    expect(onOpenChange).not.toHaveBeenCalledWith(true);
  });

  it('shares modality listeners until the final tooltip unmounts', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    const onOpenChange = vi.fn();
    const { rerender, unmount } = render(
      <>
        <TooltipInteractionFixture
          label='First tooltip'
          onOpenChange={onOpenChange}
        />
        <TooltipInteractionFixture
          label='Second tooltip'
          onOpenChange={onOpenChange}
        />
      </>
    );

    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'pointerdown')
    ).toHaveLength(1);
    rerender(
      <TooltipInteractionFixture
        label='First tooltip'
        onOpenChange={onOpenChange}
      />
    );
    expect(
      removeEventListener.mock.calls.filter(([type]) => type === 'pointerdown')
    ).toHaveLength(0);

    unmount();
    expect(
      removeEventListener.mock.calls.filter(([type]) => type === 'pointerdown')
    ).toHaveLength(1);
  });

  it('uses the latest callback when a pending hover timer completes', () => {
    vi.useFakeTimers();
    const firstChange = vi.fn();
    const secondChange = vi.fn();
    const { rerender } = render(
      <TooltipInteractionFixture delay={120} onOpenChange={firstChange} />
    );
    fireEvent.mouseEnter(screen.getByRole('button'));

    rerender(
      <TooltipInteractionFixture delay={120} onOpenChange={secondChange} />
    );
    act(() => vi.advanceTimersByTime(120));

    expect(firstChange).not.toHaveBeenCalled();
    expect(secondChange).toHaveBeenCalledWith(true);
  });

  it('cancels pending hover timers during cleanup', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const { unmount } = render(
      <React.StrictMode>
        <TooltipInteractionFixture delay={120} onOpenChange={onOpenChange} />
      </React.StrictMode>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));
    unmount();
    act(() => vi.runAllTimers());

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
