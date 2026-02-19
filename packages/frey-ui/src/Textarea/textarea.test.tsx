import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Textarea from './index';

describe('Textarea', () => {
  it('renders with an accessible label', () => {
    render(<Textarea label='Bio' />);

    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('forwards ref to the native textarea', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea label='Ref textarea' ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('links helper and error text through aria-describedby', () => {
    render(
      <Textarea
        label='Description'
        id='description'
        helperText='At least 20 characters'
        error='Too short'
      />
    );

    const textarea = screen.getByLabelText('Description');

    expect(textarea).toHaveAttribute(
      'aria-describedby',
      'description-error description-helper'
    );
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports controlled value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Textarea label='Notes' value='Seed' onChange={onChange} />);

    const textarea = screen.getByLabelText('Notes');

    await user.type(textarea, 'ed');

    expect(onChange).toHaveBeenCalled();
  });

  it('prevents interaction when disabled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Textarea label='Disabled notes' disabled onChange={onChange} />);

    const textarea = screen.getByLabelText('Disabled notes');

    await user.click(textarea);

    expect(textarea).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Textarea label='A11y textarea' helperText='Help text' />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
