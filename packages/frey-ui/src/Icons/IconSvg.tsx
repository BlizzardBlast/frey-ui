import clsx from 'clsx';
import type React from 'react';
import styles from './icons.module.css';

export type IconSizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconStrokeToken = 'thin' | 'regular' | 'bold';

export type IconProps = {
  size?: IconSizeToken | number;
  strokeWidth?: IconStrokeToken | number;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
};

const IconSizeMap: Record<IconSizeToken, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24
};

const IconStrokeWidthMap: Record<IconStrokeToken, number> = {
  thin: 1.5,
  regular: 1.8,
  bold: 2.2
};

function resolveSize(size: IconSizeToken | number | undefined) {
  if (typeof size === 'number') {
    return size;
  }

  return IconSizeMap[size ?? 'md'];
}

function resolveStrokeWidth(strokeWidth: IconStrokeToken | number | undefined) {
  if (typeof strokeWidth === 'number') {
    return strokeWidth;
  }

  return IconStrokeWidthMap[strokeWidth ?? 'regular'];
}

function getA11yProps(title?: string) {
  const trimmedTitle = title?.trim();

  if (trimmedTitle) {
    return {
      role: 'img' as const,
      'aria-label': trimmedTitle
    };
  }

  return {
    'aria-hidden': 'true' as const
  };
}

export function IconSvg({
  size,
  strokeWidth,
  title,
  className,
  style,
  children
}: Readonly<IconProps & { children: React.ReactNode }>): React.ReactNode {
  const resolvedSize = resolveSize(size);
  const resolvedStrokeWidth = resolveStrokeWidth(strokeWidth);
  const trimmedTitle = title?.trim();

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width={resolvedSize}
      height={resolvedSize}
      fill='none'
      stroke='currentColor'
      strokeWidth={resolvedStrokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={clsx(styles.icon_svg, className)}
      style={style}
      {...getA11yProps(title)}
    >
      <title>{trimmedTitle ?? 'Icon'}</title>
      {children}
    </svg>
  );
}
