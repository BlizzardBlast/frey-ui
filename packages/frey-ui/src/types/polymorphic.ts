import type React from 'react';

export type PolymorphicRef<Element extends React.ElementType> =
  React.ComponentPropsWithRef<Element>['ref'];

export type PolymorphicComponentProps<
  Element extends React.ElementType,
  OwnProps extends object = Record<string, never>
> = OwnProps & {
  as?: Element;
} & Omit<React.ComponentPropsWithoutRef<Element>, keyof OwnProps | 'as'>;
