import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function TriangleAlertIcon({
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
      <path d='M12 4L20 19H4L12 4Z' />
      <path d='M12 9V13' />
      <circle cx='12' cy='16.2' r='0.65' fill='currentColor' stroke='none' />
    </IconSvg>
  );
}
