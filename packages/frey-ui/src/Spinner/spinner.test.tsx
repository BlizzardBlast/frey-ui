import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Spinner from './index';

describe('Spinner', () => {
  it('renders with default loading label', () => {
    render(<Spinner />);

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('supports custom label', () => {
    render(<Spinner label='Saving changes' />);

    expect(screen.getByLabelText('Saving changes')).toBeInTheDocument();
  });

  it('supports numeric size overrides', () => {
    const { container } = render(<Spinner size={28} />);

    const output = container.querySelector('output');

    expect(output).toHaveStyle({ '--spinner-size': '28px' });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Spinner label='A11y spinner' />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
