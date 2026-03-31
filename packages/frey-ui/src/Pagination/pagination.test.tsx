import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './index';

describe('Pagination', () => {
  it('renders pagination navigation with default aria-label', () => {
    render(<Pagination totalPages={5} />);

    expect(
      screen.getByRole('navigation', { name: 'Pagination' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toHaveAttribute('aria-current', 'page');
  });

  it('supports uncontrolled mode with defaultPage and emits onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination totalPages={5} defaultPage={2} onPageChange={onPageChange} />
    );

    const page3Button = screen.getByRole('button', { name: 'Go to page 3' });

    await user.click(page3Button);

    expect(page3Button).toHaveAttribute('aria-current', 'page');
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('supports controlled mode with page and onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    const { rerender } = render(
      <Pagination totalPages={5} page={2} onPageChange={onPageChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(
      screen.getByRole('button', { name: 'Go to page 2' })
    ).toHaveAttribute('aria-current', 'page');

    rerender(
      <Pagination totalPages={5} page={3} onPageChange={onPageChange} />
    );

    expect(
      screen.getByRole('button', { name: 'Go to page 3' })
    ).toHaveAttribute('aria-current', 'page');
  });

  it('falls back to page 1 when totalPages/defaultPage are invalid', () => {
    render(<Pagination totalPages={0} defaultPage={0} />);

    expect(
      screen.getByRole('button', { name: 'Go to page 1' })
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', { name: 'Go to previous page' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Go to next page' })
    ).toBeDisabled();
  });

  it('disables prev/next controls at boundaries', () => {
    const { rerender } = render(<Pagination totalPages={3} page={1} />);

    expect(
      screen.getByRole('button', { name: 'Go to previous page' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Go to next page' })
    ).toBeEnabled();

    rerender(<Pagination totalPages={3} page={3} />);

    expect(
      screen.getByRole('button', { name: 'Go to next page' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Go to previous page' })
    ).toBeEnabled();
  });

  it('calls onPageChange when previous control is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination totalPages={5} page={3} onPageChange={onPageChange} />);

    await user.click(
      screen.getByRole('button', { name: 'Go to previous page' })
    );

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('does not emit page change when disabled', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        totalPages={5}
        page={3}
        disabled
        onPageChange={onPageChange}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Go to previous page' })
    );
    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('does not emit page change when clicking the current page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination totalPages={5} page={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('renders ellipsis when pages are truncated', () => {
    render(
      <Pagination totalPages={10} page={5} siblingCount={1} boundaryCount={1} />
    );

    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Pagination totalPages={8} page={4} siblingCount={1} boundaryCount={1} />
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
