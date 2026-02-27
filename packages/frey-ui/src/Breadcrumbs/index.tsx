import clsx from 'clsx';
import React from 'react';
import Link, { type LinkProps } from '../Link';
import styles from './breadcrumbs.module.css';

export type BreadcrumbsProps = React.HTMLAttributes<HTMLElement> & {
  separator?: string;
  ariaLabel?: string;
};

export type BreadcrumbsListProps = React.OlHTMLAttributes<HTMLOListElement>;
export type BreadcrumbsItemProps = React.LiHTMLAttributes<HTMLLIElement>;
export type BreadcrumbsLinkProps = LinkProps;
export type BreadcrumbsCurrentProps = React.HTMLAttributes<HTMLSpanElement>;

type BreadcrumbsStyle = React.CSSProperties & {
  '--frey-breadcrumb-separator'?: string;
};

type BreadcrumbsRootComponent = React.ForwardRefExoticComponent<
  Readonly<BreadcrumbsProps> & React.RefAttributes<HTMLElement>
>;

const BreadcrumbsRoot: BreadcrumbsRootComponent = React.forwardRef<
  HTMLElement,
  Readonly<BreadcrumbsProps>
>(function Breadcrumbs(
  {
    separator = '/',
    ariaLabel = 'Breadcrumb',
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const resolvedStyle: BreadcrumbsStyle = {
    '--frey-breadcrumb-separator': JSON.stringify(separator),
    ...style
  };

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={clsx(styles.breadcrumbs, className)}
      style={resolvedStyle}
      {...props}
    >
      {children}
    </nav>
  );
});
BreadcrumbsRoot.displayName = 'Breadcrumbs';

type BreadcrumbsListComponent = React.ForwardRefExoticComponent<
  Readonly<BreadcrumbsListProps> & React.RefAttributes<HTMLOListElement>
>;

const BreadcrumbsList: BreadcrumbsListComponent = React.forwardRef<
  HTMLOListElement,
  Readonly<BreadcrumbsListProps>
>(function BreadcrumbsList({ className, ...props }, ref) {
  return (
    <ol
      ref={ref}
      className={clsx(styles.breadcrumbs_list, className)}
      {...props}
    />
  );
});
BreadcrumbsList.displayName = 'Breadcrumbs.List';

type BreadcrumbsItemComponent = React.ForwardRefExoticComponent<
  Readonly<BreadcrumbsItemProps> & React.RefAttributes<HTMLLIElement>
>;

const BreadcrumbsItem: BreadcrumbsItemComponent = React.forwardRef<
  HTMLLIElement,
  Readonly<BreadcrumbsItemProps>
>(function BreadcrumbsItem({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      className={clsx(styles.breadcrumbs_item, className)}
      {...props}
    />
  );
});
BreadcrumbsItem.displayName = 'Breadcrumbs.Item';

type BreadcrumbsLinkComponent = React.ForwardRefExoticComponent<
  Readonly<BreadcrumbsLinkProps> & React.RefAttributes<HTMLAnchorElement>
>;

const BreadcrumbsLink: BreadcrumbsLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  Readonly<BreadcrumbsLinkProps>
>(function BreadcrumbsLink(
  { className, color = 'text', underline = 'hover', ...props },
  ref
) {
  return (
    <Link
      ref={ref}
      color={color}
      underline={underline}
      className={clsx(styles.breadcrumbs_link, className)}
      {...props}
    />
  );
});
BreadcrumbsLink.displayName = 'Breadcrumbs.Link';

type BreadcrumbsCurrentComponent = React.ForwardRefExoticComponent<
  Readonly<BreadcrumbsCurrentProps> & React.RefAttributes<HTMLSpanElement>
>;

const BreadcrumbsCurrent: BreadcrumbsCurrentComponent = React.forwardRef<
  HTMLSpanElement,
  Readonly<BreadcrumbsCurrentProps>
>(function BreadcrumbsCurrent({ className, children, ...props }, ref) {
  const resolvedAriaCurrent = props['aria-current'] ?? 'page';

  return (
    <span
      ref={ref}
      className={clsx(styles.breadcrumbs_current, className)}
      aria-current={resolvedAriaCurrent}
      {...props}
    >
      {children}
    </span>
  );
});
BreadcrumbsCurrent.displayName = 'Breadcrumbs.Current';

type BreadcrumbsComponent = typeof BreadcrumbsRoot & {
  List: typeof BreadcrumbsList;
  Item: typeof BreadcrumbsItem;
  Link: typeof BreadcrumbsLink;
  Current: typeof BreadcrumbsCurrent;
};

export const Breadcrumbs: BreadcrumbsComponent = Object.assign(
  BreadcrumbsRoot,
  {
    List: BreadcrumbsList,
    Item: BreadcrumbsItem,
    Link: BreadcrumbsLink,
    Current: BreadcrumbsCurrent
  }
);

export default Breadcrumbs;
