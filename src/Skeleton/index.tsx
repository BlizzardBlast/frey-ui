import clsx from 'clsx';
import React from 'react';
import styles from './skeleton.module.css';

export type SkeletonShape = 'rectangle' | 'circle';

export type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  shape?: SkeletonShape;
  className?: string;
  style?: React.CSSProperties;
};

const ShapeClassMap: Record<SkeletonShape, string> = {
  rectangle: styles['skeleton-rectangle'],
  circle: styles['skeleton-circle']
};

function Skeleton({
  width,
  height,
  shape = 'rectangle',
  className,
  style
}: Readonly<SkeletonProps>) {
  const resolvedWidth = shape === 'circle' && !width && height ? height : width;
  const resolvedHeight =
    shape === 'circle' && !height && width ? width : height;

  return (
    <span
      className={clsx(styles.skeleton, ShapeClassMap[shape], className)}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
        ...style
      }}
      aria-hidden='true'
      role='presentation'
    />
  );
}

export default Skeleton;
