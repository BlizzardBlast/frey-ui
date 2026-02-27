import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Link from './index';
import styles from './link.module.css';

describe('Link', () => {
  it('renders semantic anchor output', () => {
    render(<Link href='https://example.com'>Documentation</Link>);

    const link = screen.getByRole('link', { name: 'Documentation' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('applies color and underline variants', () => {
    render(
      <Link href='#' color='info' underline='always'>
        Learn more
      </Link>
    );

    const link = screen.getByRole('link', { name: 'Learn more' });

    expect(link).toHaveClass(
      styles.link,
      styles['link-info'],
      styles['underline-always']
    );
  });

  it('adds safe rel values for target="_blank"', () => {
    render(
      <Link href='https://example.com' target='_blank'>
        External
      </Link>
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('merges safe rel values with existing rel content', () => {
    render(
      <Link href='https://example.com' target='_blank' rel='nofollow'>
        External
      </Link>
    );

    const link = screen.getByRole('link', { name: 'External' });
    const rel = link.getAttribute('rel') ?? '';

    expect(rel).toContain('nofollow');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });

  it('does not mutate rel when target is not _blank', () => {
    render(
      <Link href='/internal' rel='author'>
        Internal
      </Link>
    );

    expect(screen.getByRole('link', { name: 'Internal' })).toHaveAttribute(
      'rel',
      'author'
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Link href='https://example.com'>Accessible link</Link>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
