import React from 'react';
import type { BoxElement } from '../Box';
import Flex, { type FlexProps } from '../Flex';
import type { PolymorphicRef } from '../types/polymorphic';

export type StackProps<E extends BoxElement = 'div'> = Omit<
  FlexProps<E>,
  'direction'
> & {
  direction?: 'vertical' | 'horizontal';
};

type StackComponent = (<E extends BoxElement = 'div'>(
  props: Readonly<StackProps<E>> & { ref?: PolymorphicRef<E> }
) => React.ReactElement | null) & { displayName?: string };

const Stack = React.forwardRef(function Stack<E extends BoxElement = 'div'>(
  { direction, ...restProps }: Readonly<StackProps<E>>,
  ref: PolymorphicRef<E>
) {
  const rawDirection = direction as 'vertical' | 'horizontal' | undefined;
  const stackDirection = rawDirection ?? 'vertical';

  return (
    <Flex
      ref={ref}
      direction={stackDirection === 'horizontal' ? 'row' : 'column'}
      {...restProps}
    />
  );
}) as StackComponent;

Stack.displayName = 'Stack';

export default Stack;
