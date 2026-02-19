import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import RadioGroup, { type RadioOption } from './index';

const options: ReadonlyArray<RadioOption> = [
  {
    value: 'basic',
    label: 'Basic'
  },
  {
    value: 'pro',
    label: 'Pro',
    description: 'Best for teams'
  }
];

describe('RadioGroup', () => {
  it('renders a labeled radiogroup', () => {
    render(<RadioGroup label='Plan' options={options} />);

    expect(
      screen.getByRole('radiogroup', { name: 'Plan' })
    ).toBeInTheDocument();
  });

  it('supports uncontrolled mode via defaultValue', () => {
    render(<RadioGroup label='Tier' options={options} defaultValue='pro' />);

    expect(screen.getByRole('radio', { name: /^Pro/ })).toBeChecked();
  });

  it('supports controlled value with onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RadioGroup
        label='Access'
        options={options}
        value='basic'
        onChange={onChange}
      />
    );

    const proRadio = screen.getByRole('radio', { name: /^Pro/ });

    await user.click(proRadio);

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Basic' })).toBeChecked();
  });

  it('disables all options when disabled is true', () => {
    render(<RadioGroup label='Disabled group' options={options} disabled />);

    expect(screen.getByRole('radio', { name: 'Basic' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /^Pro/ })).toBeDisabled();
  });

  it('renders error message and marks group invalid', () => {
    render(
      <RadioGroup label='Errors' options={options} error='Please choose one' />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Please choose one');
    expect(screen.getByRole('radiogroup', { name: 'Errors' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RadioGroup label='A11y group' options={options} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
