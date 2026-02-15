import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
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
});
