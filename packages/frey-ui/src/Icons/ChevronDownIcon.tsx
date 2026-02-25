import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function ChevronDownIcon({
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
      <path d='M6 9L12 15L18 9' />
    </IconSvg>
  );
}
