import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function CircleXIcon({
  size = 'md',
  strokeWidth = 'regular',
  title,
  className,
  style
}: Readonly<IconProps>): React.JSX.Element {
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
