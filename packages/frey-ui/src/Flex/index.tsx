import React from 'react';
import Box, { type BoxElement, type BoxProps } from '../Box';
import type { PolymorphicRef } from '../types/polymorphic';

export type FlexProps<E extends BoxElement = 'div'> = Omit<
  BoxProps<E>,
  | 'display'
  | 'flexDirection'
  | 'alignItems'
  | 'justifyContent'
  | 'flexWrap'
  | 'inline'
  | 'direction'
  | 'align'
  | 'justify'
  | 'wrap'
> & {
  inline?: boolean;
  direction?: React.CSSProperties['flexDirection'];
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: React.CSSProperties['flexWrap'];
};

type FlexComponent = (<E extends BoxElement = 'div'>(
  props: Readonly<FlexProps<E>> & { ref?: PolymorphicRef<E> }
) => React.ReactElement | null) & { displayName?: string };

const Flex = React.forwardRef(function Flex<E extends BoxElement = 'div'>(
  {
    as,
    inline = false,
    direction,
    align,
    justify,
    wrap,
    style,
    ...restProps
  }: Readonly<FlexProps<E>>,
  ref: PolymorphicRef<E>
) {
  const resolvedStyle: React.CSSProperties = {
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap,
    ...style
  };

  return (
    <Box
      as={as}
      ref={ref}
      display={inline ? 'inline-flex' : 'flex'}
      style={resolvedStyle}
      {...restProps}
    />
  );
}) as FlexComponent;

Flex.displayName = 'Flex';

export default Flex;
