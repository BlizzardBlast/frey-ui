import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDateLocale } from './useDateLocale';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useDateLocale', () => {
  it('uses a deterministic locale snapshot during server rendering', () => {
    function LocaleProbe() {
      return <span>{useDateLocale()}</span>;
    }

    expect(renderToString(<LocaleProbe />)).toContain('en-US');
  });

  it('falls back when browser locale data is absent or empty', () => {
    vi.stubGlobal('navigator', undefined);
    const missingNavigator = renderHook(() => useDateLocale());
    expect(missingNavigator.result.current).toBe('en-US');
    missingNavigator.unmount();

    vi.stubGlobal('navigator', { language: '' });
    const emptyLanguage = renderHook(() => useDateLocale());
    expect(emptyLanguage.result.current).toBe('en-US');
  });
});
