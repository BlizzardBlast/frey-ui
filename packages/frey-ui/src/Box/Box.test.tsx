import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Box from './index';

describe('Box', () => {
  it('maps token-based styles to the element', () => {
    render(
      <Box
        data-testid='box'
        p='4'
        pt='1'
        px='2'
        m='3'
        bg='surface-subtle'
        color='text-primary'
        borderColor='border'
        radius='md'
        gap='2'
      />
    );

    const box = screen.getByTestId('box');

    expect(box.style.getPropertyValue('padding-top')).toBe(
      'var(--frey-space-1, 0.25rem)'
    );
    expect(box.style.getPropertyValue('padding-left')).toBe(
      'var(--frey-space-2, 0.5rem)'
    );
    expect(box.style.getPropertyValue('padding-right')).toBe(
      'var(--frey-space-2, 0.5rem)'
    );
    expect(box.style.getPropertyValue('padding-bottom')).toBe(
      'var(--frey-space-4, 1rem)'
    );
    expect(box.style.getPropertyValue('background-color')).toBe(
      'var(--frey-color-surface-subtle)'
    );
    expect(box.style.getPropertyValue('color')).toBe(
      'var(--frey-color-text-primary)'
    );
    expect(box.style.getPropertyValue('border-color')).toBe(
      'var(--frey-color-border)'
    );
    expect(box.style.getPropertyValue('border-radius')).toBe(
      'var(--frey-radius-md)'
    );
    expect(box.style.getPropertyValue('row-gap')).toBe(
      'var(--frey-space-2, 0.5rem)'
    );
    expect(box.style.getPropertyValue('column-gap')).toBe(
      'var(--frey-space-2, 0.5rem)'
    );
  });

  it('supports polymorphic rendering with as', () => {
    render(
      <Box as='a' href='https://example.com'>
        Docs
      </Box>
    );

    const link = screen.getByRole('link', { name: 'Docs' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('forwards refs to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Box ref={ref}>Ref content</Box>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveTextContent('Ref content');
  });

  it('merges user style last', () => {
    render(
      <Box data-testid='box' p='4' style={{ padding: '2px' }}>
        Override
      </Box>
    );

    expect(screen.getByTestId('box').style.getPropertyValue('padding')).toBe(
      '2px'
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Box as='section'>Accessible content</Box>);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
