import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import DateField from './index';

function getSegment(name: 'Era' | 'Year' | 'Month' | 'Day') {
  return screen.getByRole('spinbutton', { name });
}

describe('DateField', () => {
  it('renders a labeled segmented group in locale order and forwards its ref', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <DateField
        ref={ref}
        label='Birth date'
        value='2024-03-20'
        helperText='Use your legal birth date.'
        error='Check this date.'
      />
    );

    const group = screen.getByRole('group', { name: 'Birth date' });
    const segments = screen.getAllByRole('spinbutton');

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toContainElement(group);
    expect(
      segments.map((segment) => segment.getAttribute('aria-label'))
    ).toEqual(['Month', 'Day', 'Year']);
    expect(
      segments.map((segment) => (segment as HTMLInputElement).value)
    ).toEqual(['3', '20', '2024']);
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group.getAttribute('aria-describedby')).toContain('-error');
    expect(group.getAttribute('aria-describedby')).toContain('-helper');
    expect(getSegment('Month')).toHaveAttribute('aria-valuemin', '1');
    expect(getSegment('Month')).toHaveAttribute('aria-valuemax', '12');
    expect(getSegment('Month')).toHaveAttribute('aria-valuenow', '3');
    expect(getSegment('Month')).toHaveAttribute('aria-valuetext', '3');
  });

  it('supports an uncontrolled default value and native ISO FormData', () => {
    const { container } = render(
      <form>
        <DateField
          label='Start date'
          name='start-date'
          defaultValue='2024-03-20'
        />
      </form>
    );

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(new FormData(form as HTMLFormElement).get('start-date')).toBe(
      '2024-03-20'
    );
  });

  it('treats controlled null as empty', () => {
    render(<DateField label='Start date' value={null} />);

    expect(getSegment('Month')).toHaveValue('');
    expect(getSegment('Day')).toHaveValue('');
    expect(getSegment('Year')).toHaveValue('');
  });

  it('emits a complete uncontrolled edit and updates the submitted value', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <DateField
          label='Start date'
          name='start-date'
          onValueChange={onValueChange}
        />
      </form>
    );

    fireEvent.change(getSegment('Month'), { target: { value: '3' } });
    fireEvent.change(getSegment('Day'), { target: { value: '20' } });
    fireEvent.change(getSegment('Year'), { target: { value: '2024' } });

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('2024-03-20');
    expect(
      new FormData(container.querySelector('form') as HTMLFormElement).get(
        'start-date'
      )
    ).toBe('2024-03-20');
  });

  it('keeps partial drafts local and prevents stale committed form data', () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <DateField
          label='Start date'
          name='start-date'
          defaultValue='2024-03-20'
          onValueChange={onValueChange}
        />
      </form>
    );

    fireEvent.change(getSegment('Day'), { target: { value: '' } });

    expect(getSegment('Day')).toHaveValue('');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(
      new FormData(container.querySelector('form') as HTMLFormElement).get(
        'start-date'
      )
    ).toBe('');
    expect(getSegment('Month')).toBeInvalid();
    expect(
      (container.querySelector('form') as HTMLFormElement).checkValidity()
    ).toBe(false);
  });

  it('emits null only after every numeric segment is manually cleared', () => {
    const onValueChange = vi.fn();
    render(
      <DateField
        label='Start date'
        defaultValue='2024-03-20'
        onValueChange={onValueChange}
      />
    );

    fireEvent.change(getSegment('Month'), { target: { value: '' } });
    fireEvent.change(getSegment('Day'), { target: { value: '' } });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(getSegment('Year'), { target: { value: '' } });
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('supports callback refs and separate outer/control styling', () => {
    let control: HTMLDivElement | null = null;
    const { container } = render(
      <DateField
        label='Start date'
        ref={(node) => {
          control = node;
        }}
        className='outer-class'
        style={{ maxWidth: 400 }}
        controlClassName='control-class'
        controlStyle={{ minWidth: 240 }}
      />
    );

    expect(container.firstElementChild).toHaveClass('outer-class');
    expect(container.firstElementChild).toHaveStyle({ maxWidth: '400px' });
    expect(control).toHaveClass('control-class');
    expect(control).toHaveStyle({ minWidth: '240px' });
  });

  it('reverts a completed controlled edit when the parent does not update', () => {
    const onValueChange = vi.fn();
    render(
      <DateField
        label='Start date'
        value='2024-03-20'
        onValueChange={onValueChange}
      />
    );

    fireEvent.change(getSegment('Day'), { target: { value: '21' } });

    expect(onValueChange).toHaveBeenCalledWith('2024-03-21');
    expect(getSegment('Day')).toHaveValue('20');
  });

  it('accepts controlled updates as the source of truth', async () => {
    const user = userEvent.setup();
    function ControlledDateField() {
      const [value, setValue] = useState<string | null>('2024-03-20');
      return (
        <DateField label='Start date' value={value} onValueChange={setValue} />
      );
    }

    render(<ControlledDateField />);
    await user.click(getSegment('Day'));
    fireEvent.change(getSegment('Day'), { target: { value: '21' } });

    expect(getSegment('Day')).toHaveValue('21');
    expect(getSegment('Day')).toHaveFocus();
    expect(getSegment('Day')).toHaveAttribute('tabindex', '0');
    expect(getSegment('Month')).toHaveAttribute('tabindex', '-1');
  });

  it('clears optional editable values and hides clear for protected states', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DateField
        label='Start date'
        defaultValue='2024-03-20'
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear date' }));

    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(getSegment('Month')).toHaveValue('');

    rerender(<DateField label='Start date' value='2024-03-20' required />);
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();

    rerender(<DateField label='Start date' value='2024-03-20' readOnly />);
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();

    rerender(<DateField label='Start date' value='2024-03-20' disabled />);
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
  });

  it('applies required, disabled, read-only, and custom segment labels', () => {
    render(
      <DateField
        label='Start date'
        required
        readOnly
        segmentLabels={{ month: 'Calendar month' }}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: 'Calendar month' })
    ).toHaveAttribute('readonly');
  });

  it('uses one roving tab stop and physical arrows in LTR', async () => {
    const user = userEvent.setup();
    render(
      <>
        <DateField
          label='Start date'
          value='2024-03-20'
          showClearButton={false}
        />
        <button type='button'>After</button>
      </>
    );

    await user.tab();
    expect(getSegment('Month')).toHaveFocus();
    expect(getSegment('Month')).toHaveAttribute('tabindex', '0');
    expect(getSegment('Day')).toHaveAttribute('tabindex', '-1');

    await user.keyboard('{ArrowLeft}');
    expect(getSegment('Month')).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(getSegment('Day')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(getSegment('Month')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('reverses horizontal segment movement in RTL', async () => {
    const user = userEvent.setup();
    render(
      <DateField
        label='Start date'
        value='2024-03-20'
        locale='ar-EG'
        showClearButton={false}
      />
    );

    await user.click(getSegment('Day'));
    await user.keyboard('{ArrowLeft}');
    expect(getSegment('Month')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(getSegment('Day')).toHaveFocus();
    expect(
      screen.getByRole('group', { name: 'Start date' }).parentElement
    ).toHaveAttribute('dir', 'rtl');
  });

  it('increments calendar-aware parts and restores the committed value on Escape', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateField
        label='Start date'
        defaultValue='2024-01-31'
        onValueChange={onValueChange}
      />
    );

    await user.click(getSegment('Month'));
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('2024-02-29');
    expect(getSegment('Month')).toHaveValue('2');
    expect(getSegment('Day')).toHaveValue('29');

    await user.keyboard('{Delete}');
    expect(getSegment('Month')).toHaveValue('');
    await user.keyboard('{Escape}');
    expect(getSegment('Month')).toHaveValue('2');
  });

  it('steps day and year segments, ignores incomplete drafts, and stops at ISO bounds', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DateField
        label='Start date'
        defaultValue='2024-02-29'
        onValueChange={onValueChange}
      />
    );

    await user.click(getSegment('Day'));
    await user.keyboard('{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith('2024-02-28');

    await user.click(getSegment('Year'));
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('2025-02-28');

    await user.keyboard('{Delete}');
    onValueChange.mockClear();
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(
      <DateField
        label='Start date'
        value='9999-12-31'
        onValueChange={onValueChange}
      />
    );
    await user.click(getSegment('Day'));
    await user.keyboard('{ArrowUp}');
    expect(getSegment('Day')).toHaveValue('31');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('accepts strict ISO and localized segmented paste', () => {
    const onValueChange = vi.fn();
    render(<DateField label='Start date' onValueChange={onValueChange} />);

    fireEvent.paste(getSegment('Month'), {
      clipboardData: { getData: () => '2024-03-20' },
    });
    expect(onValueChange).toHaveBeenLastCalledWith('2024-03-20');

    fireEvent.paste(getSegment('Month'), {
      clipboardData: { getData: () => '04/21/2025' },
    });
    expect(onValueChange).toHaveBeenLastCalledWith('2025-04-21');
  });

  it('accepts localized digits in its own era-bearing segmented format', () => {
    const onValueChange = vi.fn();
    render(
      <DateField
        label='Persian date'
        calendar='persian'
        locale='fa-IR'
        onValueChange={onValueChange}
      />
    );

    fireEvent.paste(getSegment('Year'), {
      clipboardData: { getData: () => '۱/۲/۱۴۰۳ هجری شمسی' },
    });

    expect(onValueChange).toHaveBeenCalledWith('2024-03-21');
    expect(getSegment('Year')).toHaveValue('۱۴۰۳');
  });

  it('leaves unsupported localized paste and era typeahead as local drafts', () => {
    const onValueChange = vi.fn();
    render(
      <DateField
        label='Japanese date'
        calendar='japanese'
        locale='en-US'
        defaultValue='2024-03-20'
        onValueChange={onValueChange}
      />
    );

    expect(
      fireEvent.paste(getSegment('Month'), {
        clipboardData: { getData: () => 'not a date' },
      })
    ).toBe(true);
    expect(
      fireEvent.paste(getSegment('Month'), {
        clipboardData: { getData: () => '3/20/6 Missing era' },
      })
    ).toBe(true);

    fireEvent.change(getSegment('Era'), { target: { value: 'ZZZ' } });
    expect(getSegment('Era')).toHaveValue('ZZZ');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('ignores change and paste mutations while read-only', () => {
    const onValueChange = vi.fn();
    render(
      <DateField
        label='Start date'
        value='2024-03-20'
        readOnly
        onValueChange={onValueChange}
      />
    );

    fireEvent.change(getSegment('Month'), { target: { value: '4' } });
    fireEvent.keyDown(getSegment('Month'), { key: 'Delete' });
    fireEvent.paste(getSegment('Month'), {
      clipboardData: { getData: () => '2025-04-21' },
    });

    expect(getSegment('Month')).toHaveValue('3');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('accepts localized digits and retains unavailable drafts without emitting', () => {
    const onValueChange = vi.fn();
    render(
      <DateField
        label='Start date'
        locale='fa-IR'
        value={null}
        onValueChange={onValueChange}
        isDateUnavailable={(candidate) => candidate === '2024-03-20'}
      />
    );

    fireEvent.change(getSegment('Year'), { target: { value: '۲۰۲۴' } });
    fireEvent.change(getSegment('Month'), { target: { value: '۰۳' } });
    fireEvent.change(getSegment('Day'), { target: { value: '۲۰' } });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Start date' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(getSegment('Day')).toHaveValue('۲۰');
  });

  it('cycles and typeaheads localized era segments', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateField
        label='Japanese date'
        calendar='japanese'
        locale='en-US'
        defaultValue='2024-03-20'
        onValueChange={onValueChange}
      />
    );

    await user.click(getSegment('Era'));
    expect(getSegment('Era')).toHaveValue('Reiwa');

    await user.keyboard('{ArrowDown}');
    expect(getSegment('Era')).toHaveValue('Heisei');
    expect(onValueChange).toHaveBeenLastCalledWith('1994-03-20');

    fireEvent.change(getSegment('Era'), { target: { value: 'Reiw' } });
    expect(getSegment('Era')).toHaveValue('Reiwa');
    expect(onValueChange).toHaveBeenLastCalledWith('2024-03-20');

    onValueChange.mockClear();
    await user.click(getSegment('Era'));
    await user.keyboard('{Delete}');
    expect(getSegment('Era')).toHaveValue('');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.type(getSegment('Era'), 'Heis', { skipClick: true });
    expect(getSegment('Era')).toHaveValue('Heisei');
  });

  it('marks controlled out-of-range values invalid without coercing them', () => {
    render(
      <DateField label='Start date' value='2024-01-01' minValue='2024-02-01' />
    );

    expect(getSegment('Month')).toHaveValue('1');
    expect(screen.getByRole('group', { name: 'Start date' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('supersedes stale partial drafts when the controlled value changes', () => {
    const { rerender } = render(
      <DateField label='Start date' value='2024-03-20' />
    );
    fireEvent.change(getSegment('Day'), { target: { value: '' } });
    expect(getSegment('Day')).toHaveValue('');

    rerender(<DateField label='Start date' value='2025-04-21' />);

    expect(getSegment('Month')).toHaveValue('4');
    expect(getSegment('Day')).toHaveValue('21');
    expect(getSegment('Year')).toHaveValue('2025');
  });

  it('honors clear customization and disabled form semantics', () => {
    const { container, rerender } = render(
      <form>
        <DateField
          label='Start date'
          name='start-date'
          value='2024-03-20'
          clearButtonLabel='Remove date'
        />
      </form>
    );
    expect(
      screen.getByRole('button', { name: 'Remove date' })
    ).toBeInTheDocument();

    rerender(
      <form>
        <DateField
          label='Start date'
          name='start-date'
          value='2024-03-20'
          disabled
        />
      </form>
    );

    expect(getSegment('Month')).toBeDisabled();
    expect(
      new FormData(container.querySelector('form') as HTMLFormElement).has(
        'start-date'
      )
    ).toBe(false);
  });

  it('rejects malformed props and inverted constraints', () => {
    expect(() => render(<DateField label='Date' value='2024-2-01' />)).toThrow(
      new RangeError(
        'value must be a valid YYYY-MM-DD date; received 2024-2-01.'
      )
    );
    expect(() =>
      render(
        <DateField label='Date' minValue='2024-02-01' maxValue='2024-01-01' />
      )
    ).toThrow(new RangeError('minValue must be on or before maxValue.'));
    expect(() => render(<DateField label='Date' minValue='' />)).toThrow(
      new RangeError('minValue must be a valid YYYY-MM-DD date; received .')
    );
    expect(() => render(<DateField label='Date' locale='' />)).toThrow(
      new RangeError('locale must be a valid BCP 47 language tag.')
    );
  });

  it('has no automated accessibility violations', async () => {
    const { container } = render(
      <DateField
        label='Start date'
        defaultValue='2024-03-20'
        helperText='Choose a date.'
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
