import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { type ChangeEvent, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Combobox, type ComboboxOption } from '../index';

const options: ReadonlyArray<ComboboxOption> = [
  {
    value: 'indonesia',
    label: 'Indonesia'
  },
  {
    value: 'singapore',
    label: 'Singapore'
  },
  {
    value: 'japan',
    label: 'Japan'
  }
];

describe('Combobox', () => {
  it('renders with an accessible label', () => {
    render(<Combobox label='Country' options={options} />);

    expect(
      screen.getByRole('combobox', {
        name: 'Country'
      })
    ).toBeInTheDocument();
  });

  it('filters options based on typed query', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.type(input, 'jap');

    expect(screen.getByRole('button', { name: 'Japan' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Indonesia' })
    ).not.toBeInTheDocument();
  });

  it('selects an option in uncontrolled mode', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'Japan' }));

    expect(input).toHaveValue('Japan');
    expect(
      screen.queryByRole('button', {
        name: 'Japan'
      })
    ).not.toBeInTheDocument();
  });

  it('supports controlled value updates', async () => {
    const user = userEvent.setup();

    function ControlledCombobox() {
      const [value, setValue] = useState('Indonesia');

      return (
        <>
          <Combobox
            label='Country'
            options={options}
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setValue(event.target.value)
            }
          />
          <small data-testid='current-value'>{value}</small>
        </>
      );
    }

    render(<ControlledCombobox />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.clear(input);
    await user.type(input, 'Japan');

    expect(screen.getByTestId('current-value')).toHaveTextContent('Japan');
  });

  it('supports keyboard navigation and selection', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(input).toHaveValue('Singapore');
    expect(
      screen.queryByRole('button', {
        name: 'Singapore'
      })
    ).not.toBeInTheDocument();
  });

  it('marks combobox invalid and shows error text', () => {
    render(
      <Combobox label='Country' options={options} error='Country is required' />
    );

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Country is required');
  });

  it('does not open options when disabled', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} disabled />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);

    expect(
      screen.queryByRole('button', {
        name: 'Indonesia'
      })
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Combobox label='Country' options={options} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
