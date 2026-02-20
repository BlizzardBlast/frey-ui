import clsx from 'clsx';
import type React from 'react';
import { useEffect, useState } from 'react';
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

function ThemeProvider({
  children,
  theme = 'light',
  highContrast = false,
  id,
  className,
  style
}: Readonly<ThemeProviderProps>) {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div
      id={id}
      className={clsx(styles['frey-theme-provider'], className)}
      style={style}
      data-frey-theme={resolvedTheme}
      data-frey-high-contrast={highContrast}
    >
      {children}
    </div>
  );
}

export default ThemeProvider;
