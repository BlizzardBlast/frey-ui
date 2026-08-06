import clsx from 'clsx';
import React from 'react';
import type {
  PolymorphicComponentProps,
  PolymorphicRef,
} from '../types/polymorphic';
import styles from './emptyState.module.css';

export type EmptyStateLayout = 'centered' | 'compact';

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  layout?: EmptyStateLayout;
};

type EmptyStateRootComponent = React.ForwardRefExoticComponent<
  Readonly<EmptyStateProps> & React.RefAttributes<HTMLDivElement>
>;

const EmptyStateRoot: EmptyStateRootComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<EmptyStateProps>
>(function EmptyState({ className, layout = 'centered', ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={clsx(styles.empty_state, styles[layout], className)}
      data-layout={layout}
    />
  );
});
EmptyStateRoot.displayName = 'EmptyState';

export type EmptyStateIconProps = React.HTMLAttributes<HTMLDivElement>;

type EmptyStateIconComponent = React.ForwardRefExoticComponent<
  Readonly<EmptyStateIconProps> & React.RefAttributes<HTMLDivElement>
>;

const EmptyStateIcon: EmptyStateIconComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<EmptyStateIconProps>
>(function EmptyStateIcon({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(styles.empty_state_icon, className)}
      {...props}
    />
  );
});
EmptyStateIcon.displayName = 'EmptyState.Icon';

export type EmptyStateTitleElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'div';

type EmptyStateTitleBaseProps = {
  className?: string;
  style?: React.CSSProperties;
};

export type EmptyStateTitleProps<
  Element extends EmptyStateTitleElement = 'h3',
> = PolymorphicComponentProps<Element, EmptyStateTitleBaseProps>;

type EmptyStateTitleComponent = (<
  Element extends EmptyStateTitleElement = 'h3',
>(
  props: Readonly<EmptyStateTitleProps<Element>> & {
    ref?: PolymorphicRef<Element>;
  }
) => React.ReactElement | null) & { displayName?: string };

const EmptyStateTitle = React.forwardRef(function EmptyStateTitle<
  Element extends EmptyStateTitleElement = 'h3',
>(
  { as, className, ...props }: Readonly<EmptyStateTitleProps<Element>>,
  ref: PolymorphicRef<Element>
) {
  const Component = (as ?? 'h3') as React.ElementType;

  return (
    <Component
      ref={ref}
      className={clsx(styles.empty_state_title, className)}
      {...props}
    />
  );
}) as EmptyStateTitleComponent;
EmptyStateTitle.displayName = 'EmptyState.Title';

export type EmptyStateDescriptionProps =
  React.HTMLAttributes<HTMLParagraphElement>;

type EmptyStateDescriptionComponent = React.ForwardRefExoticComponent<
  Readonly<EmptyStateDescriptionProps> &
    React.RefAttributes<HTMLParagraphElement>
>;

const EmptyStateDescription: EmptyStateDescriptionComponent = React.forwardRef<
  HTMLParagraphElement,
  Readonly<EmptyStateDescriptionProps>
>(function EmptyStateDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={clsx(styles.empty_state_description, className)}
      {...props}
    />
  );
});
EmptyStateDescription.displayName = 'EmptyState.Description';

export type EmptyStateActionsProps = React.HTMLAttributes<HTMLDivElement>;

type EmptyStateActionsComponent = React.ForwardRefExoticComponent<
  Readonly<EmptyStateActionsProps> & React.RefAttributes<HTMLDivElement>
>;

const EmptyStateActions: EmptyStateActionsComponent = React.forwardRef<
  HTMLDivElement,
  Readonly<EmptyStateActionsProps>
>(function EmptyStateActions({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(styles.empty_state_actions, className)}
      {...props}
    />
  );
});
EmptyStateActions.displayName = 'EmptyState.Actions';

type EmptyStateComponent = typeof EmptyStateRoot & {
  Icon: typeof EmptyStateIcon;
  Title: typeof EmptyStateTitle;
  Description: typeof EmptyStateDescription;
  Actions: typeof EmptyStateActions;
};

export const EmptyState: EmptyStateComponent = Object.assign(EmptyStateRoot, {
  Icon: EmptyStateIcon,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
});

export default EmptyState;
