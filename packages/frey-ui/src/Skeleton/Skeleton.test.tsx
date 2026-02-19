import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Skeleton from './index';

describe('Skeleton', () => {
  it('renders as a span element', () => {
    const { container } = render(<Skeleton width={200} height={20} />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('SPAN');
  });

  it('applies width and height styles', () => {
    const { container } = render(<Skeleton width={200} height={20} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('20px');
  });

  it('supports string dimensions', () => {
    const { container } = render(<Skeleton width='100%' height='1rem' />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('1rem');
  });

  it('sets aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies circle shape with equal dimensions', () => {
    const { container } = render(<Skeleton shape='circle' width={40} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('40px');
    expect(el.style.height).toBe('40px');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className='custom' />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('custom')).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Skeleton width={200} height={20} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
