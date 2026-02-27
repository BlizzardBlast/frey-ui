import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Grid from './index';

describe('Grid', () => {
  it('uses grid display and resolves numeric tracks', () => {
    render(
      <Grid data-testid='grid' columns={3} rows={2} gap='3'>
        Content
      </Grid>
    );

    expect(screen.getByTestId('grid')).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
      rowGap: 'var(--frey-space-3, 0.75rem)',
      columnGap: 'var(--frey-space-3, 0.75rem)'
    });
  });

  it('accepts custom track template strings', () => {
    render(
      <Grid data-testid='grid' columns='200px 1fr' rows='auto 1fr'>
        Content
      </Grid>
    );

    expect(screen.getByTestId('grid')).toHaveStyle({
      gridTemplateColumns: '200px 1fr',
      gridTemplateRows: 'auto 1fr'
    });
  });

  it('forwards refs to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Grid ref={ref}>Grid ref</Grid>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Grid as='section' columns={2} gap='2'>
        <span>One</span>
        <span>Two</span>
      </Grid>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
