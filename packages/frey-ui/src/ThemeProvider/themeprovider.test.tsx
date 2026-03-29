import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeProvider, { useTheme } from './index';

function ThemeConsumer() {
  const value = useTheme();

  return (
    <output
      data-testid='theme-consumer'
      data-theme={value?.resolvedTheme}
      data-high-contrast={String(value?.highContrast)}
    />
  );
}

describe('ThemeProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('throws when useTheme is consumed outside ThemeProvider', () => {
    function InvalidConsumer() {
      useTheme();
      return <div>Invalid usage</div>;
    }

    expect(() => {
      render(<InvalidConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider.');
  });

  it('applies static theme props and provides context values', () => {
    render(
      <ThemeProvider
        theme='dark'
        highContrast
        id='theme-root'
        className='custom-theme-class'
        style={{ padding: '8px' }}
      >
        <ThemeConsumer />
      </ThemeProvider>
    );

    const consumer = screen.getByTestId('theme-consumer');
    const providerRoot = consumer.parentElement;

    expect(providerRoot).toHaveAttribute('id', 'theme-root');
    expect(providerRoot).toHaveClass('custom-theme-class');
    expect(providerRoot).toHaveAttribute('data-frey-theme', 'dark');
    expect(providerRoot).toHaveAttribute('data-frey-high-contrast', 'true');

    expect(consumer).toHaveAttribute('data-theme', 'dark');
    expect(consumer).toHaveAttribute('data-high-contrast', 'true');
  });

  it('resolves and updates the system theme via matchMedia listeners', () => {
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined;

    const addEventListener = vi.fn(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change') {
          changeListener = listener as (event: MediaQueryListEvent) => void;
        }
      }
    );
    const removeEventListener = vi.fn();

    const matchMediaSpy = vi.fn((query: string): MediaQueryList => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener,
        removeEventListener,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
      } as MediaQueryList;
    });

    vi.stubGlobal('matchMedia', matchMediaSpy);

    const { unmount } = render(
      <ThemeProvider theme='system'>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const consumer = screen.getByTestId('theme-consumer');
    const providerRoot = consumer.parentElement;

    expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(providerRoot).toHaveAttribute('data-frey-theme', 'light');

    act(() => {
      changeListener?.({ matches: true } as MediaQueryListEvent);
    });

    expect(providerRoot).toHaveAttribute('data-frey-theme', 'dark');
    expect(consumer).toHaveAttribute('data-theme', 'dark');

    act(() => {
      changeListener?.({ matches: false } as MediaQueryListEvent);
    });

    expect(providerRoot).toHaveAttribute('data-frey-theme', 'light');

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('initially resolves to dark when system preference is dark', () => {
    const matchMediaSpy = vi.fn((query: string): MediaQueryList => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
      } as MediaQueryList;
    });

    vi.stubGlobal('matchMedia', matchMediaSpy);

    render(
      <ThemeProvider theme='system'>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const providerRoot = screen.getByTestId('theme-consumer').parentElement;

    expect(providerRoot).toHaveAttribute('data-frey-theme', 'dark');
  });

  it('does not crash in system mode when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    render(
      <ThemeProvider theme='system'>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const providerRoot = screen.getByTestId('theme-consumer').parentElement;

    expect(providerRoot).toHaveAttribute('data-frey-theme', 'light');
  });
});
