import clsx from 'clsx';
import React from 'react';
import styles from './link.module.css';

export type LinkColor =
  | 'primary'
  | 'text'
  | 'muted'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type LinkUnderline = 'always' | 'hover' | 'none';

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  color?: LinkColor;
  underline?: LinkUnderline;
};

const ColorClassMap: Record<LinkColor, string> = {
  primary: styles['link-primary'],
  text: styles['link-text'],
  muted: styles['link-muted'],
  info: styles['link-info'],
  success: styles['link-success'],
  warning: styles['link-warning'],
  error: styles['link-error']
};

const UnderlineClassMap: Record<LinkUnderline, string> = {
  always: styles['underline-always'],
  hover: styles['underline-hover'],
  none: styles['underline-none']
};

function getSafeRelForTargetBlank(rel?: string) {
  const tokens = new Set((rel ?? '').split(/\s+/).filter(Boolean));

  tokens.add('noopener');
  tokens.add('noreferrer');

  return Array.from(tokens).join(' ');
}

type LinkComponent = React.ForwardRefExoticComponent<
  Readonly<LinkProps> & React.RefAttributes<HTMLAnchorElement>
>;

const Link: LinkComponent = React.forwardRef<
  HTMLAnchorElement,
  Readonly<LinkProps>
>(function Link(
  { color = 'primary', underline = 'hover', className, rel, target, ...props },
  ref
) {
  const resolvedRel = target === '_blank' ? getSafeRelForTargetBlank(rel) : rel;

  return (
    <a
      ref={ref}
      target={target}
      rel={resolvedRel}
      className={clsx(
        styles.link,
        ColorClassMap[color],
        UnderlineClassMap[underline],
        className
      )}
      {...props}
    />
  );
});

Link.displayName = 'Link';

export default Link;
