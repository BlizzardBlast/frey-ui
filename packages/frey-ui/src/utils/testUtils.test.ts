import { describe, expect, it } from 'vitest';
import { createMockRect } from './testUtils';

describe('createMockRect', () => {
  it('creates a DOMRect-like object with derived coordinates', () => {
    const rect = createMockRect({ x: 10, y: 20, width: 30, height: 40 });

    expect(rect.top).toBe(20);
    expect(rect.left).toBe(10);
    expect(rect.right).toBe(40);
    expect(rect.bottom).toBe(60);
    expect(rect.toJSON()).toEqual({});
  });
});
