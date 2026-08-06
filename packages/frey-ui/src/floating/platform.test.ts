import { describe, expect, it, vi } from 'vitest';
import { isSafari, isWebKit } from './platform';

type MockCSS = {
  supports?: (property: string, value: string) => boolean | null | undefined;
};

type MockWindow = {
  CSS?: MockCSS;
  navigator?: { vendor: string };
};

function mockWindow(css: MockCSS | undefined, vendor?: string): Window {
  const mock: MockWindow = { CSS: css };
  if (vendor !== undefined) {
    mock.navigator = { vendor };
  }
  return mock as unknown as Window;
}

describe('platform detection', () => {
  it('returns false when the owner window is null', () => {
    expect(isWebKit(null)).toBe(false);
    expect(isSafari(null)).toBe(false);
  });

  it('returns false when CSS is not available', () => {
    expect(isWebKit(mockWindow(undefined))).toBe(false);
  });

  it('returns false when CSS.supports is not available', () => {
    expect(isWebKit(mockWindow({}))).toBe(false);
  });

  it('returns false when the feature probe returns false', () => {
    const supports = vi.fn().mockReturnValue(false);
    const ownerWindow = mockWindow({ supports });

    expect(isWebKit(ownerWindow)).toBe(false);
    expect(supports).toHaveBeenCalledWith('-webkit-backdrop-filter', 'none');
  });

  it('returns false when the feature probe returns a nullish value', () => {
    const supports = vi.fn().mockReturnValue(null);
    const ownerWindow = mockWindow({ supports });

    expect(isWebKit(ownerWindow)).toBe(false);
  });

  it('returns true when the feature probe returns true', () => {
    const supports = vi.fn().mockReturnValue(true);
    const ownerWindow = mockWindow({ supports });

    expect(isWebKit(ownerWindow)).toBe(true);
  });

  it('detects Safari only on a WebKit window with an Apple vendor', () => {
    const supports = vi.fn().mockReturnValue(true);
    const appleWindow = mockWindow({ supports }, 'Apple Computer, Inc.');
    const otherWindow = mockWindow({ supports }, 'Google Inc.');

    expect(isSafari(appleWindow)).toBe(true);
    expect(isSafari(otherWindow)).toBe(false);
  });
});
