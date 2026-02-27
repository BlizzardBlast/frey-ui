import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Stack from './index';

describe('Stack', () => {
  it('defaults to vertical direction', () => {
    render(<Stack data-testid='stack'>Content</Stack>);

    expect(screen.getByTestId('stack')).toHaveStyle({
      display: 'flex',
      flexDirection: 'column'
    });
  });

  it('supports horizontal direction', () => {
    render(
      <Stack data-testid='stack' direction='horizontal' gap='4'>
        Content
      </Stack>
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      flexDirection: 'row',
      rowGap: 'var(--frey-space-4, 1rem)',
      columnGap: 'var(--frey-space-4, 1rem)'
    });
  });

  it('forwards refs to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Stack ref={ref}>Stack ref</Stack>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Stack as='section' gap='2'>
        <span>One</span>
        <span>Two</span>
      </Stack>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
