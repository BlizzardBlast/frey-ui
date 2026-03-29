import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../utils/mergeRefs', () => ({
  mergeRefs: () => () => undefined
}));

import Dialog from './index';

describe('Dialog ref edge cases', () => {
  it('returns early when the dialog element ref is unavailable', () => {
    render(
      <Dialog open>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Missing ref dialog</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );

    expect(document.querySelector('dialog')).toBeInTheDocument();
  });
});
