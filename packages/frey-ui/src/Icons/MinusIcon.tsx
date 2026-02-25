import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function MinusIcon({
  size = 'md',
  strokeWidth = 'bold',
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
      <path d='M5 12H19' />
    </IconSvg>
  );
}
