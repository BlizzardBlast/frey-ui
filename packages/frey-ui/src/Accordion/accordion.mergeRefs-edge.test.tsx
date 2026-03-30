import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../utils/mergeRefs', () => ({
  mergeRefs: () => () => undefined
}));

import Accordion from './index';

describe('Accordion ref edge cases', () => {
  it('does not crash when content ref assignment is unavailable', () => {
    expect(() => {
      render(
        <Accordion defaultValue='one'>
          <Accordion.Item value='one'>
            <Accordion.Trigger>Ref edge trigger</Accordion.Trigger>
            <Accordion.Content>
              <button type='button'>Edge focusable</button>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      );
    }).not.toThrow();

    expect(
      screen.getByRole('button', { name: 'Edge focusable' })
    ).toBeInTheDocument();
  });
});
