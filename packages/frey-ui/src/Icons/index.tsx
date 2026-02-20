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

function IconSvg({
  size,
  strokeWidth,
  title,
  className,
  style,
  children
}: Readonly<IconProps & { children: React.ReactNode }>) {
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

export function CloseIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style
}: Readonly<IconProps>) {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <path d='M18 6L6 18' />
      <path d='M6 6L18 18' />
    </IconSvg>
  );
}

export function ChevronDownIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style
}: Readonly<IconProps>) {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <path d='M6 9L12 15L18 9' />
    </IconSvg>
  );
}

export function CheckIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style
}: Readonly<IconProps>) {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <path d='M5 13L10 18L19 8' />
    </IconSvg>
  );
}

export function MinusIcon({
  size = 'md',
  strokeWidth = 'bold',
  title,
  className,
  style
}: Readonly<IconProps>) {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <path d='M5 12H19' />
    </IconSvg>
  );
}

export function CircleXIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style
}: Readonly<IconProps>) {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <circle cx='12' cy='12' r='9' />
      <path d='M15 9L9 15' />
      <path d='M9 9L15 15' />
    </IconSvg>
  );
}

export function CircleCheckIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style
}: Readonly<IconProps>) {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <circle cx='12' cy='12' r='9' />
      <path d='M8 12L11 15L16 10' />
    </IconSvg>
  );
}

export function TriangleAlertIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style
}: Readonly<IconProps>) {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <path d='M12 4L20 19H4L12 4Z' />
      <path d='M12 9V13' />
      <circle cx='12' cy='16.2' r='0.65' fill='currentColor' stroke='none' />
    </IconSvg>
  );
}

export function CircleInfoIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style
}: Readonly<IconProps>) {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <circle cx='12' cy='12' r='9' />
      <path d='M12 11V16' />
      <circle cx='12' cy='8' r='0.85' fill='currentColor' stroke='none' />
    </IconSvg>
  );
}

const Icons = {
  CloseIcon,
  ChevronDownIcon,
  CheckIcon,
  MinusIcon,
  CircleXIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
  CircleInfoIcon
};

export default Icons;
