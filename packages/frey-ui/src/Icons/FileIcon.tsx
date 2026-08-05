import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function FileIcon({
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
      <path d='M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z' />
      <path d='M14 2V8H20' />
      <path d='M8 13H16' />
      <path d='M8 17H13' />
    </IconSvg>
  );
}
