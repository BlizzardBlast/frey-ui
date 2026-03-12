import React from 'react';
import type { BoxElement } from './src/Box';
import Flex, { type FlexProps } from './src/Flex';
import type { PolymorphicRef } from './src/types/polymorphic';

export type StackProps<E extends BoxElement = 'div'> = Omit<
  FlexProps<E>,
  'direction'
> & {
  direction?: 'vertical' | 'horizontal';
};

const Stack = React.forwardRef(function Stack<E extends BoxElement = 'div'>(
  { direction, ...restProps }: Readonly<StackProps<E>>,
  ref: PolymorphicRef<E>
) {
  const stackDirection = direction ?? 'vertical';
  return (
    <Flex
      ref={ref}
      direction={stackDirection === 'horizontal' ? 'row' : 'column'}
      {...(restProps as any)}
    />
  );
});
