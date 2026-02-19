import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import styles from './chip.module.css';
import Chip from './index';

describe('Chip', () => {
  it('renders non-interactive chip as text element when onClick is missing', () => {
    render(<Chip label='Status' />);

    expect(
      screen.queryByRole('button', { name: 'Status' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders button chip when onClick exists', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Chip label='Action' onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Action' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the underlying interactive element', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(<Chip label='Focusable' onClick={() => {}} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveTextContent('Focusable');
  });

  it('applies interactive styles when rendered as button without onClick', () => {
    render(<Chip as='button' label='Submit' />);

    const button = screen.getByRole('button', { name: 'Submit' });

    expect(button).toHaveClass(styles['chip-default-clickable']);
  });

  it('adds role="button" and tabIndex to non-native interactive elements', () => {
    render(<Chip as='div' label='Div action' onClick={() => {}} />);

    const chip = screen.getByRole('button', { name: 'Div action' });

    expect(chip.tagName).toBe('DIV');
    expect(chip).toHaveAttribute('role', 'button');
    expect(chip).toHaveAttribute('tabindex', '0');
  });

  it('handles keyboard Enter on non-native interactive elements', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Chip as='div' label='Key chip' onClick={onClick} />);

    const chip = screen.getByRole('button', { name: 'Key chip' });
    chip.focus();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard Space on non-native interactive elements', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Chip as='span' label='Space chip' onClick={onClick} />);

    const chip = screen.getByRole('button', { name: 'Space chip' });
    chip.focus();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not add role or tabIndex to non-interactive elements', () => {
    render(<Chip as='div' label='Static div' />);

    const chip = screen.getByText('Static div').closest('div');

    expect(chip).not.toHaveAttribute('role');
    expect(chip).not.toHaveAttribute('tabindex');
  });

  it('sets type="button" on button elements to prevent form submission', () => {
    render(<Chip as='button' label='Btn' />);

    const button = screen.getByRole('button', { name: 'Btn' });

    expect(button).toHaveAttribute('type', 'button');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Chip label='A11y chip' />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when interactive as div', async () => {
    const { container } = render(
      <Chip as='div' label='A11y div chip' onClick={() => {}} />
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
