import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Field from './index';

describe('Field', () => {
  it('links label and input by default', () => {
    render(
      <Field label='Email'>
        {({ inputId }) => <input id={inputId} type='email' />}
      </Field>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('sets helper and error messaging ids for described-by usage', () => {
    render(
      <Field
        label='Username'
        helperText='Enter a unique username'
        error='Taken'
      >
        {({ inputId, describedBy, hasError }) => (
          <input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
          />
        )}
      </Field>
    );

    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute(
      'aria-describedby',
      `${input.id}-error ${input.id}-helper`
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Taken');
  });

  it('supports group-style labels when labelElement is span', () => {
    render(
      <Field label='Theme' labelElement='span'>
        {({ labelId }) => (
          <div role='radiogroup' aria-labelledby={labelId}></div>
        )}
      </Field>
    );

    expect(
      screen.getByRole('radiogroup', { name: 'Theme' })
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Field label='A11y label' helperText='Helper'>
        {({ inputId }) => <input id={inputId} />}
      </Field>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
