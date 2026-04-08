import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Accordion from './index';

describe('Accordion overflow edge cases', () => {
  it('does not crash when firstElementChild is unavailable during layout effect', async () => {
    const user = userEvent.setup();

    render(
      <Accordion>
        <Accordion.Item value='one'>
          <Accordion.Trigger>Section</Accordion.Trigger>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const panel = screen.getByText('Content').closest('section') as HTMLElement;
    const trigger = screen.getByRole('button', { name: 'Section' });

    // Simulate a DOM state where the inner child element is missing.
    // This exercises the null-inner guard in the overflow useLayoutEffect.
    Object.defineProperty(panel, 'firstElementChild', {
      get: () => null,
      configurable: true
    });

    await user.click(trigger);

    // The trigger should still have toggled the panel state without throwing.
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
