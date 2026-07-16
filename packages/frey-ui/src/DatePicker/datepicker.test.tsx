import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import DatePicker from './index';

describe('DatePicker', () => {
  it('opens an uncontrolled dialog and focuses the selected day', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    render(
      <DatePicker
        ref={ref}
        label='Appointment date'
        defaultValue='2024-03-20'
        today='2024-03-15'
        locale='en-US'
      />
    );

    const trigger = screen.getByLabelText('Change date, March 20, 2024');
    const group = screen.getByRole('group', { name: 'Appointment date' });

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(group).toHaveAttribute('aria-labelledby');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(
      screen.getByRole('dialog', { name: 'Appointment date calendar' })
    ).toBeVisible();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'March 20, 2024' })
      ).toHaveFocus();
    });
  });

  it('supports controlled open state without drifting locally', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <DatePicker
        label='Appointment date'
        value={null}
        today='2024-03-15'
        open={false}
        onOpenChange={onOpenChange}
      />
    );
    const trigger = screen.getByRole('button', { name: 'Choose date' });

    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <DatePicker
        label='Appointment date'
        value={null}
        today='2024-03-15'
        open
        onOpenChange={onOpenChange}
      />
    );
    expect(screen.getByRole('dialog')).toBeVisible();

    await user.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('closes on Escape without changing the value and restores trigger focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        label='Appointment date'
        defaultValue='2024-03-20'
        today='2024-03-15'
        onValueChange={onValueChange}
      />
    );
    const trigger = screen.getByLabelText('Change date, March 20, 2024');

    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('restores trigger focus after outside dismissal', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type='button'>Outside date picker</button>
        <DatePicker
          label='Appointment date'
          defaultValue='2024-03-20'
          today='2024-03-15'
        />
      </div>
    );
    const trigger = screen.getByLabelText('Change date, March 20, 2024');
    const outside = screen.getByRole('button', { name: 'Outside date picker' });

    await user.click(trigger);
    await user.click(outside);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('returns focus after a controlled programmatic close', async () => {
    const { rerender } = render(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
        open
      />
    );
    const trigger = screen.getByLabelText('Change date, March 20, 2024');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'March 20, 2024' })
      ).toHaveFocus();
    });
    rerender(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
        open={false}
      />
    );

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('blocks disabled opening while allowing read-only inspection', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
        disabled
      />
    );
    const disabledTrigger = screen.getByRole('button', {
      name: 'Change date, March 20, 2024',
    });

    expect(disabledTrigger).toBeDisabled();
    await user.click(disabledTrigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
        readOnly
      />
    );
    const readOnlyTrigger = screen.getByRole('button', {
      name: 'Change date, March 20, 2024',
    });
    expect(readOnlyTrigger).not.toBeDisabled();
    await user.click(readOnlyTrigger);
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('has no automated accessibility violations when open', async () => {
    render(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
        open
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'March 20, 2024' })
      ).toHaveFocus();
    });
    expect(
      await axe(
        screen.getByRole('dialog', { name: 'Appointment date calendar' })
      )
    ).toHaveNoViolations();
  });

  it('selects one shared ISO value, closes, and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        label='Appointment date'
        defaultValue='2024-03-20'
        today='2024-03-15'
        locale='en-US'
        onValueChange={onValueChange}
      />
    );
    const trigger = screen.getByRole('button', {
      name: 'Change date, March 20, 2024',
    });

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'March 21, 2024' }));

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('2024-03-21');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveValue('21');
    expect(trigger).toHaveAccessibleName('Change date, March 21, 2024');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('keeps segmented edits and the calendar on the same controlled value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
        locale='en-US'
        onValueChange={onValueChange}
      />
    );
    const day = screen.getByRole('spinbutton', { name: 'Day' });

    await user.click(day);
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenCalledWith('2024-03-21');
    expect(day).toHaveValue('20');

    rerender(
      <DatePicker
        label='Appointment date'
        value='2024-03-21'
        today='2024-03-15'
        locale='en-US'
        onValueChange={onValueChange}
      />
    );
    expect(day).toHaveValue('21');
    await user.click(
      screen.getByRole('button', { name: 'Change date, March 21, 2024' })
    );
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'March 21, 2024' })
      ).toHaveFocus();
    });
  });

  it('opens and closes from date segments with Alt+Arrow shortcuts', async () => {
    render(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
      />
    );
    const month = screen.getByRole('spinbutton', { name: 'Month' });
    const trigger = screen.getByLabelText('Change date, March 20, 2024');

    fireEvent.focus(month);
    expect(fireEvent.keyDown(month, { key: 'Enter', altKey: true })).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(month, { key: 'ArrowDown', altKey: true });
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(month).toHaveValue('3');
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'March 20, 2024' })
      ).toHaveFocus();
    });

    fireEvent.keyDown(month, { key: 'ArrowUp', altKey: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('clears optional values while required values omit the clear action', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { unmount } = render(
      <DatePicker
        label='Optional date'
        defaultValue='2024-03-20'
        today='2024-03-15'
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole('button', { name: 'Choose date' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();

    unmount();
    render(
      <DatePicker
        label='Required date'
        value='2024-03-20'
        today='2024-03-15'
        required
      />
    );
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
  });

  it('submits only the shared ISO value through one hidden input', () => {
    const { container } = render(
      <form>
        <DatePicker
          label='Appointment date'
          defaultValue='2024-03-20'
          today='2024-03-15'
          name='appointmentDate'
        />
      </form>
    );
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    const data = new FormData(form as HTMLFormElement);

    expect(data.get('appointmentDate')).toBe('2024-03-20');
    expect(Array.from(data.keys())).toEqual(['appointmentDate']);
  });

  it('blocks unavailable calendar activation without closing or emitting', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        label='Appointment date'
        defaultValue='2024-03-20'
        today='2024-03-15'
        isDateUnavailable={(value) => value === '2024-03-21'}
        onValueChange={onValueChange}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Change date, March 20, 2024' })
    );
    const unavailable = screen.getByRole('button', {
      name: 'March 21, 2024',
    });
    expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await user.click(unavailable);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('keeps every read-only mutation path closed while allowing navigation', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
        readOnly
        onValueChange={onValueChange}
      />
    );
    const day = screen.getByRole('spinbutton', { name: 'Day' });

    expect(day).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
    fireEvent.change(day, { target: { value: '21' } });
    expect(day).toHaveValue('20');

    await user.click(
      screen.getByRole('button', { name: 'Change date, March 20, 2024' })
    );
    await user.click(screen.getByRole('button', { name: 'March 21, 2024' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('heading', { name: 'April 2024' })).toBeVisible();
  });

  it('propagates focus, week, action-label, and trigger-label customization', async () => {
    const user = userEvent.setup();
    const getCalendarButtonLabel = vi.fn(
      (formattedValue: string | null) => `Calendar value: ${formattedValue}`
    );
    render(
      <DatePicker
        label='Settlement date'
        value={null}
        defaultFocusedValue='2024-04-10'
        today='2024-03-15'
        firstDayOfWeek='mon'
        calendarLabel='Settlement calendar'
        previousMonthLabel='Earlier period'
        nextMonthLabel='Later period'
        getCalendarButtonLabel={getCalendarButtonLabel}
      />
    );
    const trigger = screen.getByRole('button', { name: 'Calendar value: null' });

    expect(getCalendarButtonLabel).toHaveBeenCalledWith(null);
    await user.click(trigger);
    expect(
      screen.getByRole('dialog', { name: 'Settlement calendar' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Earlier period' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Later period' })).toBeVisible();
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Mon');
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'April 10, 2024' })
      ).toHaveFocus();
    });
  });

  it('formats trigger labels in the explicit display calendar and locale', () => {
    const getCalendarButtonLabel = vi.fn(() => 'Open localized calendar');
    render(
      <DatePicker
        label='Persian date'
        value='2024-03-20'
        today='2024-03-15'
        locale='fa-IR'
        calendar='persian'
        getCalendarButtonLabel={getCalendarButtonLabel}
      />
    );

    expect(getCalendarButtonLabel).toHaveBeenCalledWith(
      expect.stringContaining('۱۴۰۳')
    );
    expect(
      screen.getByRole('button', { name: 'Open localized calendar' })
    ).toBeVisible();
  });

  it('preserves consumer Field descriptions and validation copy', () => {
    render(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        today='2024-03-15'
        helperText='Choose a business day.'
        error='The service rejected this date.'
      />
    );

    const group = screen.getByRole('group', { name: 'Appointment date' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group.getAttribute('aria-describedby')).toContain('-error');
    expect(group.getAttribute('aria-describedby')).toContain('-helper');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The service rejected this date.'
    );
  });

  it('uses the local date contract when today is omitted', () => {
    render(
      <DatePicker
        label='Appointment date'
        value='2024-03-20'
        locale='en-US'
      />
    );

    expect(
      screen.getByRole('button', { name: 'Change date, March 20, 2024' })
    ).toBeVisible();
  });
});
