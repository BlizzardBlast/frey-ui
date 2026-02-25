import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function CircleCheckIcon({
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
      <path d='M8 12L11 15L16 10' />
    </IconSvg>
  );
}
