import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Alert from './index';

describe('Alert', () => {
  it('renders children as message text', () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Alert title='Error'>Details here</Alert>);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });

  it('uses role="alert" for error variant', () => {
    render(<Alert variant='error'>Error message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="alert" for warning variant', () => {
    render(<Alert variant='warning'>Warning message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for success variant', () => {
    render(<Alert variant='success'>Success message</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="status" for info variant', () => {
    render(<Alert variant='info'>Info message</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('defaults to info variant', () => {
    render(<Alert>Default message</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has no accessibility violations for error variant', async () => {
    const { container } = render(
      <Alert variant='error' title='Error'>
        Something went wrong
      </Alert>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations for success variant', async () => {
    const { container } = render(
      <Alert variant='success'>Operation completed</Alert>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations for info variant', async () => {
    const { container } = render(<Alert variant='info'>FYI</Alert>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
