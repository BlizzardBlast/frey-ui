import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function CloseIcon({
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
      <path d='M18 6L6 18' />
      <path d='M6 6L18 18' />
    </IconSvg>
  );
}
