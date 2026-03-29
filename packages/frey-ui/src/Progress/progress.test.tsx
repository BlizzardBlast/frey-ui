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
    expect(
      screen.getByRole('progressbar', { name: 'Upload progress' })
    ).toHaveAttribute('aria-valuenow', '45');
    expect(
      screen.getByRole('progressbar', { name: 'Upload progress' })
    ).toHaveAttribute('aria-valuetext', '45%');
  });

  it('clamps values above max', () => {
    render(<Progress label='Clamped progress' value={200} max={100} />);

    expect(
      screen.getByRole('progressbar', { name: 'Clamped progress' })
    ).toHaveAttribute('value', '100');
  });

  it('supports indeterminate mode', () => {
    render(<Progress label='Loading progress' indeterminate />);

    const progressbar = screen.getByRole('progressbar', {
      name: 'Loading progress'
    });

    expect(progressbar).not.toHaveAttribute('value');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(progressbar).toHaveAttribute('aria-valuetext', 'Loading');
    expect(progressbar).toHaveAttribute('aria-busy', 'true');
  });

  it('falls back to safe max and safe value for invalid numeric input', () => {
    render(<Progress value={Number.NaN} max={0} />);

    const progressbar = screen.getByRole('progressbar', { name: 'Progress' });

    expect(progressbar).toHaveAttribute('max', '100');
    expect(progressbar).toHaveAttribute('value', '0');
  });

  it('renders value text without label when showValue is true', () => {
    render(<Progress value={20} showValue />);

    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Progress' })
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Progress label='A11y progress' value={75} showValue />
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
