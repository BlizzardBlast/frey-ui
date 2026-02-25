import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function CheckIcon({
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
      <path d='M5 13L10 18L19 8' />
    </IconSvg>
  );
}
