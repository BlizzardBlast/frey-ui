import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CheckIcon, ChevronDownIcon, CloseIcon } from './index';

describe('Icons', () => {
  it('renders decorative icon as aria-hidden by default', () => {
    const { container } = render(<CloseIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders accessible icon when title is provided', () => {
    render(<ChevronDownIcon title='Open options' />);

    expect(
      screen.getByRole('img', { name: 'Open options' })
    ).toBeInTheDocument();
  });

  it('supports named size and stroke tokens', () => {
    const { container } = render(<CheckIcon size='lg' strokeWidth='bold' />);

    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('stroke-width', '2.2');
  });

  it('supports numeric size and stroke overrides', () => {
    const { container } = render(<CloseIcon size={22} strokeWidth={2.6} />);

    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '22');
    expect(svg).toHaveAttribute('height', '22');
    expect(svg).toHaveAttribute('stroke-width', '2.6');
  });
});
