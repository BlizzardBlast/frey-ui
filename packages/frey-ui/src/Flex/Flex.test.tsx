import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Flex from './index';

describe('Flex', () => {
  it('defaults to display: flex', () => {
    render(<Flex data-testid='flex'>Content</Flex>);

    expect(screen.getByTestId('flex')).toHaveStyle({ display: 'flex' });
  });

  it('supports inline mode and flex layout controls', () => {
    render(
      <Flex
        data-testid='flex'
        inline
        gap='3'
        direction='row-reverse'
        align='center'
        justify='space-between'
        wrap='wrap'
      >
        Content
      </Flex>
    );

    expect(screen.getByTestId('flex')).toHaveStyle({
      display: 'inline-flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      rowGap: 'var(--frey-space-3, 0.75rem)',
      columnGap: 'var(--frey-space-3, 0.75rem)'
    });
  });

  it('forwards refs to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Flex ref={ref}>Flex ref</Flex>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Flex as='section'>
        <span>Item</span>
      </Flex>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
