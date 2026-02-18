import clsx from 'clsx';
import type React from 'react';
import styles from './themeprovider.module.css';

export type FreyTheme = 'light' | 'dark';

export type ThemeProviderProps = {
  children: React.ReactNode;
  theme?: FreyTheme;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

function ThemeProvider({
  children,
  theme = 'light',
  id,
  className,
  style
}: Readonly<ThemeProviderProps>) {
  return (
    <div
      id={id}
      className={clsx(styles['frey-theme-provider'], className)}
      style={style}
      data-frey-theme={theme}
    >
      {children}
    </div>
  );
}

export default ThemeProvider;
