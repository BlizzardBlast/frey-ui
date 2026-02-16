import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Chip from './index';
import styles from './chip.module.css';

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

  it('has no accessibility violations', async () => {
    const { container } = render(<Chip label='A11y chip' />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
