import clsx from 'clsx';
import React from 'react';
import styles from './table.module.css';

export type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
};

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;
export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;
export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>;
export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;
export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

type TableRootComponent = React.ForwardRefExoticComponent<
  Readonly<TableProps> & React.RefAttributes<HTMLTableElement>
>;

const TableRoot: TableRootComponent = React.forwardRef<
  HTMLTableElement,
  Readonly<TableProps>
>(function Table(
  { containerClassName, containerStyle, className, ...props },
  ref
) {
  return (
    <div
      className={clsx(styles.table_container, containerClassName)}
      style={containerStyle}
    >
      <table ref={ref} className={clsx(styles.table, className)} {...props} />
    </div>
  );
});
TableRoot.displayName = 'Table';

type TableHeaderComponent = React.ForwardRefExoticComponent<
  Readonly<TableHeaderProps> & React.RefAttributes<HTMLTableSectionElement>
>;

const TableHeader: TableHeaderComponent = React.forwardRef<
  HTMLTableSectionElement,
  Readonly<TableHeaderProps>
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      ref={ref}
      className={clsx(styles.table_header, className)}
      {...props}
    />
  );
});
TableHeader.displayName = 'Table.Header';

type TableBodyComponent = React.ForwardRefExoticComponent<
  Readonly<TableBodyProps> & React.RefAttributes<HTMLTableSectionElement>
>;

const TableBody: TableBodyComponent = React.forwardRef<
  HTMLTableSectionElement,
  Readonly<TableBodyProps>
>(function TableBody({ className, ...props }, ref) {
  return (
    <tbody
      ref={ref}
      className={clsx(styles.table_body, className)}
      {...props}
    />
  );
});
TableBody.displayName = 'Table.Body';

type TableFooterComponent = React.ForwardRefExoticComponent<
  Readonly<TableFooterProps> & React.RefAttributes<HTMLTableSectionElement>
>;

const TableFooter: TableFooterComponent = React.forwardRef<
  HTMLTableSectionElement,
  Readonly<TableFooterProps>
>(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      className={clsx(styles.table_footer, className)}
      {...props}
    />
  );
});
TableFooter.displayName = 'Table.Footer';

type TableRowComponent = React.ForwardRefExoticComponent<
  Readonly<TableRowProps> & React.RefAttributes<HTMLTableRowElement>
>;

const TableRow: TableRowComponent = React.forwardRef<
  HTMLTableRowElement,
  Readonly<TableRowProps>
>(function TableRow({ className, ...props }, ref) {
  return (
    <tr ref={ref} className={clsx(styles.table_row, className)} {...props} />
  );
});
TableRow.displayName = 'Table.Row';

type TableHeadComponent = React.ForwardRefExoticComponent<
  Readonly<TableHeadProps> & React.RefAttributes<HTMLTableCellElement>
>;

const TableHead: TableHeadComponent = React.forwardRef<
  HTMLTableCellElement,
  Readonly<TableHeadProps>
>(function TableHead({ className, scope, ...props }, ref) {
  return (
    <th
      ref={ref}
      scope={scope ?? 'col'}
      className={clsx(styles.table_head, className)}
      {...props}
    />
  );
});
TableHead.displayName = 'Table.Head';

type TableCellComponent = React.ForwardRefExoticComponent<
  Readonly<TableCellProps> & React.RefAttributes<HTMLTableCellElement>
>;

const TableCell: TableCellComponent = React.forwardRef<
  HTMLTableCellElement,
  Readonly<TableCellProps>
>(function TableCell({ className, ...props }, ref) {
  return (
    <td ref={ref} className={clsx(styles.table_cell, className)} {...props} />
  );
});
TableCell.displayName = 'Table.Cell';

type TableCaptionComponent = React.ForwardRefExoticComponent<
  Readonly<TableCaptionProps> & React.RefAttributes<HTMLTableCaptionElement>
>;

const TableCaption: TableCaptionComponent = React.forwardRef<
  HTMLTableCaptionElement,
  Readonly<TableCaptionProps>
>(function TableCaption({ className, ...props }, ref) {
  return (
    <caption
      ref={ref}
      className={clsx(styles.table_caption, className)}
      {...props}
    />
  );
});
TableCaption.displayName = 'Table.Caption';

type TableComponent = typeof TableRoot & {
  Header: typeof TableHeader;
  Body: typeof TableBody;
  Footer: typeof TableFooter;
  Row: typeof TableRow;
  Head: typeof TableHead;
  Cell: typeof TableCell;
  Caption: typeof TableCaption;
};

export const Table: TableComponent = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption
});

export default Table;
