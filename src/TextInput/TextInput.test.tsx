import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import TextInput from './index';

describe('TextInput', () => {
  it('renders with an accessible label', () => {
    render(<TextInput label='Email' />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders as a text input by default', () => {
    render(<TextInput label='Name' />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('forwards ref to the native input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TextInput label='Ref input' ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('visually hides the label when hideLabel is true', () => {
    render(<TextInput label='Hidden label' hideLabel />);
    const label = screen.getByText('Hidden label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('displays error message and sets aria-invalid', () => {
    render(<TextInput label='Email' error='Invalid email' />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('displays helper text', () => {
    render(<TextInput label='Name' helperText='Enter your full name' />);
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('links error and helper text via aria-describedby', () => {
    render(
      <TextInput
        label='Email'
        id='test-email'
        error='Required'
        helperText='We need your email'
      />
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'test-email-error test-email-helper'
    );
  });

  it('prevents interaction when disabled', async () => {
    const onChange = vi.fn();
    render(<TextInput label='Disabled' disabled onChange={onChange} />);
    const input = screen.getByLabelText('Disabled');
    expect(input).toBeDisabled();
  });

  it('supports controlled value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TextInput label='Controlled' value='hello' onChange={onChange} />);
    const input = screen.getByLabelText('Controlled');
    expect(input).toHaveValue('hello');
    await user.type(input, 'x');
    expect(onChange).toHaveBeenCalled();
  });

  it('supports read-only state', () => {
    render(<TextInput label='Read only' readOnly value='fixed' />);
    const input = screen.getByLabelText('Read only');
    expect(input).toHaveAttribute('readOnly');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TextInput label='A11y input' />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with error', async () => {
    const { container } = render(
      <TextInput label='A11y error' error='Something went wrong' />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
