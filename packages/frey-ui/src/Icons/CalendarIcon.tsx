import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function CalendarIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style,
}: Readonly<IconProps>): React.JSX.Element {
  return (
    <IconSvg
      size={size}
      strokeWidth={strokeWidth}
      title={title}
      className={className}
      style={style}
    >
      <path d='M7 3V6' />
      <path d='M17 3V6' />
      <rect x='3' y='5' width='18' height='16' rx='2' />
      <path d='M3 10H21' />
    </IconSvg>
  );
}
