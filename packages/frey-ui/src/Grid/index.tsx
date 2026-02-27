import React from 'react';
import Box, { type BoxElement, type BoxProps } from '../Box';
import type { PolymorphicRef } from '../types/polymorphic';

export type GridProps<E extends BoxElement = 'div'> = Omit<
  BoxProps<E>,
  'display'
> & {
  columns?: number | string;
  rows?: number | string;
  autoFlow?: React.CSSProperties['gridAutoFlow'];
  alignItems?: React.CSSProperties['alignItems'];
  justifyItems?: React.CSSProperties['justifyItems'];
};

function resolveTrackTemplate(value?: number | string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return `repeat(${value}, minmax(0, 1fr))`;
  }

  return value;
}

type GridComponent = (<E extends BoxElement = 'div'>(
  props: Readonly<GridProps<E>> & { ref?: PolymorphicRef<E> }
) => React.ReactElement | null) & { displayName?: string };

const Grid = React.forwardRef(function Grid<E extends BoxElement = 'div'>(
  {
    as,
    columns,
    rows,
    autoFlow,
    alignItems,
    justifyItems,
    style,
    ...restProps
  }: Readonly<GridProps<E>>,
  ref: PolymorphicRef<E>
) {
  const resolvedStyle: React.CSSProperties = {
    gridTemplateColumns: resolveTrackTemplate(columns),
    gridTemplateRows: resolveTrackTemplate(rows),
    gridAutoFlow: autoFlow,
    alignItems,
    justifyItems,
    ...style
  };

  return (
    <Box
      as={as}
      ref={ref}
      display='grid'
      style={resolvedStyle}
      {...restProps}
    />
  );
}) as GridComponent;

Grid.displayName = 'Grid';

export default Grid;
