import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { type ChangeEvent, createRef, useState } from 'react';
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

  it('forwards object refs to the input element', () => {
    const ref = createRef<HTMLInputElement>();

    render(<Combobox label='Country' options={options} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('supports callback refs', () => {
    let callbackRefNode: HTMLInputElement | null = null;

    render(
      <Combobox
        label='Country'
        options={options}
        ref={(node) => {
          callbackRefNode = node;
        }}
      />
    );

    expect(callbackRefNode).toBeInstanceOf(HTMLInputElement);
  });

  it('filters options based on typed query', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.type(input, 'jap');

    expect(screen.getByRole('option', { name: 'Japan' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Indonesia' })
    ).not.toBeInTheDocument();
  });

  it('selects an option in uncontrolled mode', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.clear(input);
    await user.click(screen.getByRole('option', { name: 'Japan' }));

    expect(input).toHaveValue('Japan');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
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
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens options on ArrowDown when focus handler prevents auto-open', async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        label='Country'
        options={options}
        onFocus={(event) => event.preventDefault()}
      />
    );

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    input.focus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Indonesia' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('keeps active option unset when filtered options are empty', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.type(input, 'zzzz-no-match');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('keeps active option unset when all filtered options are disabled', async () => {
    const user = userEvent.setup();
    const allDisabledOptions: ReadonlyArray<ComboboxOption> = [
      {
        value: 'indonesia',
        label: 'Indonesia',
        disabled: true
      },
      {
        value: 'japan',
        label: 'Japan',
        disabled: true
      }
    ];

    render(<Combobox label='Country' options={allDisabledOptions} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('opens options on ArrowUp and highlights the previous enabled option', async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        label='Country'
        options={options}
        onFocus={(event) => event.preventDefault()}
      />
    );

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    input.focus();
    await user.keyboard('{ArrowUp}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Singapore' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('supports ArrowUp navigation when popup is already open', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.keyboard('{ArrowUp}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Singapore' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('closes the options popup on Escape', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('keeps popup open when input blurs to an element inside combobox', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);

    const option = screen.getByRole('option', { name: 'Indonesia' });

    fireEvent.blur(input, {
      relatedTarget: option
    });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('does not open popup from click when click event is default prevented', async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        label='Country'
        options={options}
        onFocus={(event) => event.preventDefault()}
        onClick={(event) => event.preventDefault()}
      />
    );

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not handle navigation when keydown is already default prevented', async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        label='Country'
        options={options}
        onKeyDown={(event) => event.preventDefault()}
      />
    );

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.keyboard('{ArrowDown}');

    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('does not select when active option becomes stale before Enter', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}');

    rerender(
      <Combobox
        label='Country'
        options={[
          {
            value: 'indonesia',
            label: 'Indonesia'
          }
        ]}
      />
    );

    await user.keyboard('{Enter}');

    expect(input).toHaveValue('');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('does not select disabled options', async () => {
    const user = userEvent.setup();
    const optionsWithDisabled: ReadonlyArray<ComboboxOption> = [
      {
        value: 'indonesia',
        label: 'Indonesia'
      },
      {
        value: 'japan',
        label: 'Japan',
        disabled: true
      }
    ];

    render(<Combobox label='Country' options={optionsWithDisabled} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'Japan' }));

    expect(input).toHaveValue('');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('uses listbox and option roles while options are visible', async () => {
    const user = userEvent.setup();

    render(<Combobox label='Country' options={options} />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);

    const listbox = screen.getByRole('listbox');
    const option = screen.getByRole('option', {
      name: 'Indonesia'
    });

    expect(listbox).toBeInTheDocument();
    expect(option).toHaveAttribute('tabindex', '-1');
  });

  it('keeps listbox closed after selecting an option in controlled mode', async () => {
    const user = userEvent.setup();

    function ControlledSelectCombobox() {
      const [value, setValue] = useState('Indonesia');

      return (
        <Combobox
          label='Country'
          options={options}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setValue(event.target.value)
          }
        />
      );
    }

    render(<ControlledSelectCombobox />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    await user.clear(input);
    await user.click(screen.getByRole('option', { name: 'Japan' }));

    expect(input).toHaveValue('Japan');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('updates aria-expanded and aria-controls when component becomes disabled', async () => {
    const user = userEvent.setup();

    function DisableAfterOpenCombobox() {
      const [isDisabled, setIsDisabled] = useState(false);

      return (
        <div>
          <button type='button' onClick={() => setIsDisabled(true)}>
            Disable combobox
          </button>
          <Combobox label='Country' options={options} disabled={isDisabled} />
        </div>
      );
    }

    render(<DisableAfterOpenCombobox />);

    const input = screen.getByRole('combobox', {
      name: 'Country'
    });

    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls');

    await user.click(screen.getByRole('button', { name: 'Disable combobox' }));

    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
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

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Combobox label='Country' options={options} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
