import type React from 'react';
import { type IconProps, IconSvg } from './IconSvg';

export function UploadIcon({
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
      <path d='M12 16V4' />
      <path d='M7 9L12 4L17 9' />
      <path d='M5 20H19' />
    </IconSvg>
  );
}
