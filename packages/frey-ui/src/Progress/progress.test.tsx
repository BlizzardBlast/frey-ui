import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Progress from './index';

describe('Progress', () => {
  it('renders progress with label and value text', () => {
    render(<Progress label='Upload progress' value={45} showValue />);

    expect(screen.getByText('Upload progress')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Upload progress' })
    ).toHaveAttribute('value', '45');
  });

  it('clamps values above max', () => {
    render(<Progress label='Clamped progress' value={200} max={100} />);

    expect(
      screen.getByRole('progressbar', { name: 'Clamped progress' })
    ).toHaveAttribute('value', '100');
  });

  it('supports indeterminate mode', () => {
    render(<Progress label='Loading progress' indeterminate />);

    expect(
      screen.getByRole('progressbar', { name: 'Loading progress' })
    ).not.toHaveAttribute('value');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Progress label='A11y progress' value={75} showValue />
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
