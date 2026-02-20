import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Button from '../Button';
import Tooltip from './index';

describe('Tooltip', () => {
  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content='Helpful information' delay={0}>
        <Button>Help</Button>
      </Tooltip>
    );

    await user.hover(screen.getByRole('button', { name: 'Help' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Helpful information'
    );
  });

  it('shows tooltip on focus and hides on blur', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content='Keyboard hint' delay={0}>
        <Button>Focus me</Button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Focus me' });

    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.tab();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content='Escape closes me' delay={0}>
        <Button>Escape target</Button>
      </Tooltip>
    );

    await user.hover(screen.getByRole('button', { name: 'Escape target' }));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Tooltip content='A11y tooltip' defaultOpen>
        <Button>A11y target</Button>
      </Tooltip>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
