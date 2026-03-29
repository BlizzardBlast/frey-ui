import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const stubbornRef = {} as { current: HTMLInputElement | null };
Object.defineProperty(stubbornRef, 'current', {
  configurable: true,
  get: () => null,
  set: () => undefined
});

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');

  return {
    ...actual,
    useRef: vi.fn(() => stubbornRef)
  };
});

import Checkbox from './index';

describe('Checkbox ref edge cases', () => {
  it('guards the indeterminate sync effect when the input ref is unavailable', () => {
    expect(() => {
      render(<Checkbox label='Edge checkbox' indeterminate />);
    }).not.toThrow();
  });
});
