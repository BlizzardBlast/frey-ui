import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Calendar from './index';

function getDayButton(name: string): HTMLButtonElement {
  return screen.getByRole('button', { name });
}

function getDayCell(name: string): HTMLElement {
  const cell = getDayButton(name).closest('[role="gridcell"]');
  expect(cell).not.toBeNull();
  return cell as HTMLElement;
}

function getGridDayButtons(): HTMLButtonElement[] {
  return Array.from(
    screen
      .getByRole('grid')
      .querySelectorAll<HTMLButtonElement>('button[data-date-value]')
  );
}

describe('Calendar', () => {
  it('renders a semantic labeled grid and forwards the outer ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Calendar
        ref={ref}
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-20'
        locale='en-US'
        className='custom-calendar'
        style={{ inlineSize: 400 }}
      />
    );

    const grid = screen.getByRole('grid', { name: 'Appointment date' });
    const heading = screen.getByText('March 2024');
    const headers = within(grid).getAllByRole('columnheader');

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('custom-calendar');
    expect(ref.current).toHaveStyle({ inlineSize: '400px' });
    expect(heading).toHaveAttribute('aria-live', 'polite');
    expect(headers).toHaveLength(7);
    expect(headers[0]?.querySelector('abbr')).toHaveAttribute(
      'title',
      'Sunday'
    );
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(42);
    expect(getGridDayButtons()).toHaveLength(42);
    expect(getDayCell('March 20, 2024')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(getDayCell('March 21, 2024')).not.toHaveAttribute('aria-selected');
    expect(getDayButton('March 20, 2024')).toHaveAttribute('data-today');
  });

  it('supports uncontrolled selection and keeps exactly one day in the tab sequence', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Calendar
        label='Appointment date'
        defaultValue='2024-03-20'
        today='2024-03-01'
        onValueChange={onValueChange}
      />
    );

    await user.click(getDayButton('March 21, 2024'));

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('2024-03-21');
    expect(getDayCell('March 21, 2024')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(
      getGridDayButtons().filter((button) => button.tabIndex === 0)
    ).toHaveLength(1);
    expect(getDayButton('March 21, 2024')).toHaveAttribute('tabindex', '0');
  });

  it('emits controlled selections without drifting from the controlled value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Calendar
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-01'
        onValueChange={onValueChange}
      />
    );

    await user.click(getDayButton('March 21, 2024'));
    expect(onValueChange).toHaveBeenCalledWith('2024-03-21');
    expect(getDayCell('March 20, 2024')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(getDayCell('March 21, 2024')).not.toHaveAttribute('aria-selected');

    rerender(
      <Calendar
        label='Appointment date'
        value='2024-03-21'
        today='2024-03-01'
        onValueChange={onValueChange}
      />
    );
    expect(getDayCell('March 21, 2024')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('focuses today for controlled null and honors default focused value', () => {
    const { rerender } = render(
      <Calendar
        label='Appointment date'
        value={null}
        today='2024-03-15'
      />
    );

    expect(getDayButton('March 15, 2024')).toHaveAttribute('tabindex', '0');

    rerender(
      <Calendar
        label='Appointment date'
        value={null}
        defaultFocusedValue='2024-04-10'
        today='2024-03-15'
      />
    );
    expect(screen.getByText('April 2024')).toBeVisible();
    expect(getDayButton('April 10, 2024')).toHaveAttribute('tabindex', '0');
  });

  it('uses the current local date when today is omitted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 6, 12));
    try {
      render(<Calendar label='Appointment date' value={null} />);
      expect(getDayButton('May 6, 2024')).toHaveAttribute('data-today');
      expect(getDayButton('May 6, 2024')).toHaveAttribute('tabindex', '0');
    } finally {
      vi.useRealTimers();
    }
  });

  it('moves focus with arrows in LTR and RTL visual order', () => {
    const { rerender } = render(
      <Calendar
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-01'
        locale='en-US'
      />
    );
    const selected = getDayButton('March 20, 2024');
    selected.focus();
    fireEvent.keyDown(selected, { key: 'ArrowRight' });
    expect(getDayButton('March 21, 2024')).toHaveFocus();

    rerender(
      <Calendar
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-01'
        locale='ar-SA'
      />
    );
    const rtlSelected = getDayButton('٢٠ مارس ٢٠٢٤');
    rtlSelected.focus();
    fireEvent.keyDown(rtlSelected, { key: 'ArrowRight' });
    expect(getDayButton('١٩ مارس ٢٠٢٤')).toHaveFocus();
  });

  it('anchors keyboard movement to the day that still owns DOM focus', () => {
    const { rerender } = render(
      <Calendar
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-01'
      />
    );
    const previouslyFocused = getDayButton('March 20, 2024');
    previouslyFocused.focus();

    rerender(
      <Calendar
        label='Appointment date'
        value='2024-03-25'
        today='2024-03-01'
      />
    );
    expect(previouslyFocused).toHaveFocus();
    fireEvent.keyDown(previouslyFocused, { key: 'ArrowRight' });
    expect(getDayButton('March 21, 2024')).toHaveFocus();
  });

  it('fulfills a focus request when its target already matches reducer state', () => {
    render(
      <Calendar
        label='Appointment date'
        value='2024-03-21'
        today='2024-03-01'
      />
    );
    const priorDay = getDayButton('March 20, 2024');
    priorDay.focus();
    fireEvent.keyDown(priorDay, { key: 'ArrowRight' });
    expect(getDayButton('March 21, 2024')).toHaveFocus();
  });

  it('implements week, month, year, and activation keyboard behavior', () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        label='Appointment date'
        defaultValue='2024-03-20'
        today='2024-03-01'
        firstDayOfWeek='mon'
        onValueChange={onValueChange}
      />
    );
    let active = getDayButton('March 20, 2024');
    active.focus();

    fireEvent.keyDown(active, { key: 'Home' });
    expect(getDayButton('March 18, 2024')).toHaveFocus();
    active = getDayButton('March 18, 2024');
    fireEvent.keyDown(active, { key: 'End' });
    expect(getDayButton('March 24, 2024')).toHaveFocus();
    active = getDayButton('March 24, 2024');
    fireEvent.keyDown(active, { key: 'ArrowDown' });
    expect(getDayButton('March 31, 2024')).toHaveFocus();
    active = getDayButton('March 31, 2024');
    fireEvent.keyDown(active, { key: 'PageDown' });
    expect(screen.getByText('April 2024')).toBeVisible();
    expect(getDayButton('April 30, 2024')).toHaveFocus();
    active = getDayButton('April 30, 2024');
    fireEvent.keyDown(active, { key: 'PageUp', shiftKey: true });
    expect(screen.getByText('April 2023')).toBeVisible();
    expect(getDayButton('April 30, 2023')).toHaveFocus();

    fireEvent.keyDown(getDayButton('April 30, 2023'), { key: 'Enter' });
    expect(onValueChange).toHaveBeenLastCalledWith('2023-04-30');
    fireEvent.keyDown(getDayButton('April 30, 2023'), { key: ' ' });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(getDayButton('April 30, 2023'), { key: 'ArrowLeft' });
    fireEvent.keyDown(getDayButton('April 29, 2023'), { key: ' ' });
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenLastCalledWith('2023-04-29');
  });

  it('covers complementary keyboard paths without handling unrelated keys', () => {
    render(
      <Calendar
        label='Appointment date'
        value='2024-05-15'
        today='2024-05-01'
      />
    );
    let active = getDayButton('May 15, 2024');
    active.focus();
    fireEvent.keyDown(active, { key: 'x' });
    expect(active).toHaveFocus();

    fireEvent.keyDown(active, { key: 'ArrowUp' });
    active = getDayButton('May 8, 2024');
    expect(active).toHaveFocus();
    fireEvent.keyDown(active, { key: 'PageUp' });
    active = getDayButton('April 8, 2024');
    expect(active).toHaveFocus();
    fireEvent.keyDown(active, { key: 'PageDown', shiftKey: true });
    expect(getDayButton('April 8, 2025')).toHaveFocus();
  });

  it('navigates months with labeled reusable controls', async () => {
    const user = userEvent.setup();
    render(
      <Calendar
        label='Appointment date'
        value='2024-03-31'
        today='2024-03-01'
        previousMonthLabel='Earlier month'
        nextMonthLabel='Later month'
      />
    );

    await user.click(screen.getByRole('button', { name: 'Later month' }));
    expect(screen.getByText('April 2024')).toBeVisible();
    expect(getDayButton('April 30, 2024')).toHaveAttribute('tabindex', '0');
    await user.click(screen.getByRole('button', { name: 'Earlier month' }));
    expect(screen.getByText('March 2024')).toBeVisible();
  });

  it('keeps unavailable and out-of-range days focusable while blocking activation', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Calendar
        label='Appointment date'
        value='2024-03-09'
        today='2024-03-01'
        minValue='2024-03-10'
        maxValue='2024-03-20'
        isDateUnavailable={(value) => value === '2024-03-15'}
        onValueChange={onValueChange}
      />
    );

    const belowMinimum = getDayButton('March 9, 2024');
    expect(belowMinimum).toHaveAttribute('aria-disabled', 'true');
    expect(belowMinimum).toHaveAttribute('tabindex', '0');
    await user.click(belowMinimum);
    await user.click(getDayButton('March 15, 2024'));
    await user.click(getDayButton('March 21, 2024'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('allows read-only inspection but disables every interaction when disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Calendar
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-01'
        readOnly
        onValueChange={onValueChange}
      />
    );

    await user.click(getDayButton('March 21, 2024'));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('April 2024')).toBeVisible();

    rerender(
      <Calendar
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-01'
        disabled
        onValueChange={onValueChange}
      />
    );
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    expect(getGridDayButtons().every((button) => button.tabIndex === -1)).toBe(
      true
    );
    const disabledDay = getDayButton('April 20, 2024');
    disabledDay.focus();
    expect(fireEvent.keyDown(disabledDay, { key: 'Tab' })).toBe(true);
    fireEvent.keyDown(disabledDay, { key: 'PageDown' });
    expect(screen.getByText('April 2024')).toBeVisible();
  });

  it('disables outward navigation at the hard ISO boundaries', () => {
    const { rerender } = render(
      <Calendar
        label='Appointment date'
        value='0001-01-01'
        today='2024-03-01'
      />
    );
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();

    rerender(
      <Calendar
        label='Appointment date'
        value='9999-12-31'
        today='2024-03-01'
      />
    );
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });

  it('validates all date and constraint props with prop-specific errors', () => {
    expect(() =>
      render(
        <Calendar
          label='Appointment date'
          value='2024-03-20'
          defaultValue='invalid'
          today='2024-03-01'
        />
      )
    ).toThrow(
      new RangeError(
        'defaultValue must be a valid YYYY-MM-DD date; received invalid.'
      )
    );
    expect(() =>
      render(
        <Calendar
          label='Appointment date'
          today='2024-03-01'
          minValue='2024-04-01'
          maxValue='2024-03-01'
        />
      )
    ).toThrow(new RangeError('minValue must be on or before maxValue.'));
  });

  it('has no automated accessibility violations', async () => {
    const { container } = render(
      <Calendar
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-20'
        minValue='2024-03-01'
        maxValue='2024-03-31'
        isDateUnavailable={(value) => value === '2024-03-21'}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
