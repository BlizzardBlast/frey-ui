import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Checkbox from './index';

describe('Checkbox', () => {
  it('renders with an accessible label', () => {
    render(<Checkbox label='Accept terms' />);
    expect(
      screen.getByRole('checkbox', { name: 'Accept terms' })
    ).toBeInTheDocument();
  });

  it('forwards ref to the native checkbox input', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox label='Ref checkbox' ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('toggles on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label='Toggle me' onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Toggle me' });
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('prevents interaction when disabled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label='No click' disabled onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'No click' });
    await user.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
    expect(checkbox).toBeDisabled();
  });

  it('does not use disabled attribute on wrapper span', () => {
    const { container } = render(<Checkbox label='Disabled test' disabled />);
    const wrapper = container.querySelector('span[class]');
    expect(wrapper).not.toHaveAttribute('disabled');
    expect(wrapper).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports indeterminate state', () => {
    render(<Checkbox label='Select all' indeterminate />);
    const checkbox = screen.getByRole('checkbox', { name: 'Select all' });
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('sets indeterminate property on the DOM element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox label='Indeterminate' indeterminate ref={ref} />);
    expect(ref.current?.indeterminate).toBe(true);
  });

  it('clears indeterminate when updated to checked', () => {
    const { rerender } = render(
      <Checkbox label='Select all' checked={false} indeterminate />
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Select all' });

    expect((checkbox as HTMLInputElement).indeterminate).toBe(true);
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

    rerender(<Checkbox label='Select all' checked indeterminate={false} />);

    expect((checkbox as HTMLInputElement).indeterminate).toBe(false);
    expect(checkbox).toBeChecked();
    expect(checkbox).not.toHaveAttribute('aria-checked');
  });

  it('visually hides the label when hideLabel is true', () => {
    render(<Checkbox label='Hidden' hideLabel />);
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Checkbox label='A11y checkbox' />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when disabled', async () => {
    const { container } = render(<Checkbox label='A11y disabled' disabled />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
