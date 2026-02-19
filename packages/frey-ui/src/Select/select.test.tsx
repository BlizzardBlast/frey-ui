import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Select from './index';

describe('Select', () => {
  it('renders with an accessible label', () => {
    render(
      <Select label='Country'>
        <option value='id'>Indonesia</option>
      </Select>
    );

    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });

  it('forwards ref to the native select', () => {
    const ref = React.createRef<HTMLSelectElement>();

    render(
      <Select label='Timezone' ref={ref}>
        <option value='utc'>UTC</option>
      </Select>
    );

    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('shows a placeholder option when provided', () => {
    render(
      <Select label='Framework' placeholder='Choose one'>
        <option value='react'>React</option>
      </Select>
    );

    expect(
      screen.getByText('Choose one', { selector: 'option' })
    ).toBeInTheDocument();
  });

  it('supports controlled value changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select label='Language' value='en' onChange={onChange}>
        <option value='en'>English</option>
        <option value='id'>Bahasa Indonesia</option>
      </Select>
    );

    const select = screen.getByLabelText('Language');

    await user.selectOptions(select, 'id');

    expect(onChange).toHaveBeenCalled();
  });

  it('sets aria-invalid when an error is provided', () => {
    render(
      <Select label='Role' error='Role is required'>
        <option value='member'>Member</option>
      </Select>
    );

    expect(screen.getByLabelText('Role')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Role is required');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Select label='Team'>
        <option value='design'>Design</option>
      </Select>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
