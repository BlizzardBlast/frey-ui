import clsx from 'clsx';
import React from 'react';
import type {
  PolymorphicComponentProps,
  PolymorphicRef
} from '../types/polymorphic';
import styles from './box.module.css';

export type SpaceToken =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '16';

export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type ColorToken =
  | 'surface'
  | 'surface-subtle'
  | 'surface-hover'
  | 'surface-active'
  | 'text'
  | 'text-primary'
  | 'text-secondary'
  | 'text-muted'
  | 'text-title'
  | 'border'
  | 'border-muted'
  | 'border-subtle'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type BoxElement =
  | 'div'
  | 'span'
  | 'section'
  | 'article'
  | 'main'
  | 'aside'
  | 'header'
  | 'footer'
  | 'nav'
  | 'a'
  | 'button'
  | 'ul'
  | 'ol'
  | 'li'
  | 'p';

type BoxBaseProps = {
  p?: SpaceToken;
  px?: SpaceToken;
  py?: SpaceToken;
  pt?: SpaceToken;
  pr?: SpaceToken;
  pb?: SpaceToken;
  pl?: SpaceToken;
  m?: SpaceToken;
  mx?: SpaceToken;
  my?: SpaceToken;
  mt?: SpaceToken;
  mr?: SpaceToken;
  mb?: SpaceToken;
  ml?: SpaceToken;
  gap?: SpaceToken;
  rowGap?: SpaceToken;
  columnGap?: SpaceToken;
  bg?: ColorToken;
  color?: ColorToken;
  borderColor?: ColorToken;
  radius?: RadiusToken;
  display?: React.CSSProperties['display'];
  width?: React.CSSProperties['width'];
  minWidth?: React.CSSProperties['minWidth'];
  maxWidth?: React.CSSProperties['maxWidth'];
  height?: React.CSSProperties['height'];
  minHeight?: React.CSSProperties['minHeight'];
  maxHeight?: React.CSSProperties['maxHeight'];
  className?: string;
  style?: React.CSSProperties;
};

export type BoxProps<E extends BoxElement = 'div'> = PolymorphicComponentProps<
  E,
  BoxBaseProps
>;

const SpaceValueMap: Record<SpaceToken, string> = {
  '0': 'var(--frey-space-0, 0)',
  '1': 'var(--frey-space-1, 0.25rem)',
  '2': 'var(--frey-space-2, 0.5rem)',
  '3': 'var(--frey-space-3, 0.75rem)',
  '4': 'var(--frey-space-4, 1rem)',
  '5': 'var(--frey-space-5, 1.25rem)',
  '6': 'var(--frey-space-6, 1.5rem)',
  '8': 'var(--frey-space-8, 2rem)',
  '10': 'var(--frey-space-10, 2.5rem)',
  '12': 'var(--frey-space-12, 3rem)',
  '16': 'var(--frey-space-16, 4rem)'
};

const RadiusValueMap: Record<RadiusToken, string> = {
  none: 'var(--frey-radius-none)',
  sm: 'var(--frey-radius-sm)',
  md: 'var(--frey-radius-md)',
  lg: 'var(--frey-radius-lg)',
  full: 'var(--frey-radius-full)'
};

const ColorValueMap: Record<ColorToken, string> = {
  surface: 'var(--frey-color-surface)',
  'surface-subtle': 'var(--frey-color-surface-subtle)',
  'surface-hover': 'var(--frey-color-surface-hover)',
  'surface-active': 'var(--frey-color-surface-active)',
  text: 'var(--frey-color-text)',
  'text-primary': 'var(--frey-color-text-primary)',
  'text-secondary': 'var(--frey-color-text-secondary)',
  'text-muted': 'var(--frey-color-text-muted)',
  'text-title': 'var(--frey-color-text-title)',
  border: 'var(--frey-color-border)',
  'border-muted': 'var(--frey-color-border-muted)',
  'border-subtle': 'var(--frey-color-border-subtle)',
  primary: 'var(--frey-color-primary)',
  info: 'var(--frey-color-info)',
  success: 'var(--frey-color-success)',
  warning: 'var(--frey-color-warning)',
  error: 'var(--frey-color-error)'
};

function resolveSpace(token?: SpaceToken) {
  if (!token) return undefined;
  return SpaceValueMap[token];
}

function resolveRadius(token?: RadiusToken) {
  if (!token) return undefined;
  return RadiusValueMap[token];
}

function resolveColor(token?: ColorToken) {
  if (!token) return undefined;
  return ColorValueMap[token];
}

function mergeResolvedStyle(
  baseStyle: React.CSSProperties,
  overrideStyle?: React.CSSProperties
) {
  if (!overrideStyle) {
    return baseStyle;
  }

  const mergedStyle: Record<string, unknown> = { ...baseStyle };
  const overrideEntries = Object.entries(overrideStyle) as [
    keyof React.CSSProperties,
    React.CSSProperties[keyof React.CSSProperties]
  ][];

  for (const [key, value] of overrideEntries) {
    if (value === undefined) {
      continue;
    }

    delete mergedStyle[key];
  }

  if (overrideStyle.padding !== undefined) {
    delete mergedStyle.paddingTop;
    delete mergedStyle.paddingRight;
    delete mergedStyle.paddingBottom;
    delete mergedStyle.paddingLeft;
  }

  if (overrideStyle.margin !== undefined) {
    delete mergedStyle.marginTop;
    delete mergedStyle.marginRight;
    delete mergedStyle.marginBottom;
    delete mergedStyle.marginLeft;
  }

  if (overrideStyle.gap !== undefined) {
    delete mergedStyle.rowGap;
    delete mergedStyle.columnGap;
  }

  return {
    ...(mergedStyle as React.CSSProperties),
    ...overrideStyle
  };
}

type BoxComponent = (<E extends BoxElement = 'div'>(
  props: Readonly<BoxProps<E>> & { ref?: PolymorphicRef<E> }
) => React.ReactElement | null) & { displayName?: string };

const Box = React.forwardRef(function Box<E extends BoxElement = 'div'>(
  {
    as,
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    gap,
    rowGap,
    columnGap,
    bg,
    color,
    borderColor,
    radius,
    display,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    className,
    style,
    ...restProps
  }: Readonly<BoxProps<E>>,
  ref: PolymorphicRef<E>
) {
  const Component = (as ?? 'div') as React.ElementType;
  const resolvedPadding = resolveSpace(p);
  const resolvedPaddingX = resolveSpace(px);
  const resolvedPaddingY = resolveSpace(py);
  const resolvedMargin = resolveSpace(m);
  const resolvedMarginX = resolveSpace(mx);
  const resolvedMarginY = resolveSpace(my);
  const resolvedGap = resolveSpace(gap);

  const resolvedStyle: React.CSSProperties = {
    paddingTop: resolveSpace(pt) ?? resolvedPaddingY ?? resolvedPadding,
    paddingRight: resolveSpace(pr) ?? resolvedPaddingX ?? resolvedPadding,
    paddingBottom: resolveSpace(pb) ?? resolvedPaddingY ?? resolvedPadding,
    paddingLeft: resolveSpace(pl) ?? resolvedPaddingX ?? resolvedPadding,
    marginTop: resolveSpace(mt) ?? resolvedMarginY ?? resolvedMargin,
    marginRight: resolveSpace(mr) ?? resolvedMarginX ?? resolvedMargin,
    marginBottom: resolveSpace(mb) ?? resolvedMarginY ?? resolvedMargin,
    marginLeft: resolveSpace(ml) ?? resolvedMarginX ?? resolvedMargin,
    rowGap: resolveSpace(rowGap) ?? resolvedGap,
    columnGap: resolveSpace(columnGap) ?? resolvedGap,
    backgroundColor: resolveColor(bg),
    color: resolveColor(color),
    borderColor: resolveColor(borderColor),
    borderRadius: resolveRadius(radius),
    display,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight
  };

  const mergedStyle = mergeResolvedStyle(resolvedStyle, style);

  return (
    <Component
      ref={ref}
      className={clsx(styles.box, className)}
      style={mergedStyle}
      {...restProps}
    />
  );
}) as BoxComponent;

Box.displayName = 'Box';

export default Box;
