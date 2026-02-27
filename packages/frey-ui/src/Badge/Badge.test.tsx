import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it } from 'vitest';
import styles from './badge.module.css';
import Badge from './index';

describe('Badge', () => {
  it('renders with defaults', () => {
    render(<Badge>Status</Badge>);

    const badge = screen.getByText('Status');

    expect(badge).toHaveClass(
      styles.badge,
      styles['badge-md'],
      styles['badge-subtle-neutral']
    );
  });

  it('supports tone, variant, and size options', () => {
    render(
      <Badge tone='error' variant='solid' size='sm'>
        Failed
      </Badge>
    );

    expect(screen.getByText('Failed')).toHaveClass(
      styles['badge-sm'],
      styles['badge-solid-error']
    );
  });

  it('forwards refs to the span element', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(<Badge ref={ref}>Ref badge</Badge>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge tone='success'>Active</Badge>);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
