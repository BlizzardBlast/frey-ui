import clsx from 'clsx';
import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import styles from './themeprovider.module.css';

export type FreyTheme = 'light' | 'dark' | 'system';

export type ThemeProviderProps = {
  children: React.ReactNode;
  theme?: FreyTheme;
  highContrast?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

export type ThemeContextValue = {
  resolvedTheme: 'light' | 'dark';
  highContrast: boolean;
};

export const ThemeContext: React.Context<ThemeContextValue | null> =
  createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }

  return context;
}

function ThemeProvider({
  children,
  theme = 'light',
  highContrast = false,
  id,
  className,
  style
}: Readonly<ThemeProviderProps>): React.JSX.Element {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme !== 'system' || typeof globalThis.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const contextValue = useMemo(
    () => ({ resolvedTheme, highContrast }),
    [resolvedTheme, highContrast]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        id={id}
        className={clsx(
          'frey-theme-provider',
          styles['frey-theme-provider'],
          className
        )}
        style={style}
        data-frey-theme={resolvedTheme}
        data-frey-high-contrast={highContrast}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
