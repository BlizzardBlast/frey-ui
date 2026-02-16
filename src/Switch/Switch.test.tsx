import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Switch from './index';

describe('Switch', () => {
  it('renders with an accessible label', () => {
    render(<Switch label='Enable feature' />);
    expect(
      screen.getByRole('switch', { name: 'Enable feature' })
    ).toBeInTheDocument();
  });

  it('forwards ref to the native checkbox input', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(<Switch label='Ref switch' ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('toggles with keyboard Enter key', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch label='Keyboard switch' onChange={onChange} />);

    const input = screen.getByRole('switch', { name: 'Keyboard switch' });
    input.focus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Switch label='A11y switch' />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
