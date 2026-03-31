import clsx from 'clsx';
import React from 'react';
import { useControllableValue } from '../hooks/useControllableState';
import styles from './pagination.module.css';

export type PaginationProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'children' | 'onChange'
> & {
  totalPages: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  showControls?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
};

type PaginationItem = number | 'ellipsis';

function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), totalPages);
}

function normalizePositiveInt(value: number, fallback: number): number {
  const parsed = Math.floor(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function createPaginationItems(
  totalPages: number,
  currentPage: number,
  siblingCount: number,
  boundaryCount: number
): PaginationItem[] {
  const pages = new Set<number>();

  for (let page = 1; page <= Math.min(boundaryCount, totalPages); page += 1) {
    pages.add(page);
  }

  for (
    let page = Math.max(totalPages - boundaryCount + 1, 1);
    page <= totalPages;
    page += 1
  ) {
    pages.add(page);
  }

  for (
    let page = Math.max(currentPage - siblingCount, 1);
    page <= Math.min(currentPage + siblingCount, totalPages);
    page += 1
  ) {
    pages.add(page);
  }

  const sortedPages = [...pages].sort((left, right) => left - right);
  const items: PaginationItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage !== undefined) {
      const gap = page - previousPage;

      if (gap === 2) {
        items.push(previousPage + 1);
      } else if (gap > 2) {
        items.push('ellipsis');
      }
    }

    items.push(page);
  });

  return items;
}

type PaginationComponent = React.ForwardRefExoticComponent<
  Readonly<PaginationProps> & React.RefAttributes<HTMLElement>
>;

const Pagination: PaginationComponent = React.forwardRef<
  HTMLElement,
  Readonly<PaginationProps>
>(function Pagination(
  {
    totalPages,
    page,
    defaultPage = 1,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    disabled = false,
    showControls = true,
    previousLabel = 'Previous',
    nextLabel = 'Next',
    ariaLabel = 'Pagination',
    className,
    style,
    ...props
  },
  ref
) {
  const resolvedTotalPages = normalizePositiveInt(totalPages, 1);
  const initialPage = clampPage(
    normalizePositiveInt(defaultPage, 1),
    resolvedTotalPages
  );
  const controlledPage =
    page === undefined
      ? undefined
      : clampPage(normalizePositiveInt(page, 1), resolvedTotalPages);
  const [currentPage, setCurrentPage] = useControllableValue(
    controlledPage,
    initialPage,
    onPageChange
  );

  const resolvedPage = clampPage(currentPage, resolvedTotalPages);

  const resolvedSiblingCount = Math.max(0, Math.floor(siblingCount));
  const resolvedBoundaryCount = Math.max(1, Math.floor(boundaryCount));

  const items = React.useMemo(
    () =>
      createPaginationItems(
        resolvedTotalPages,
        resolvedPage,
        resolvedSiblingCount,
        resolvedBoundaryCount
      ),
    [
      resolvedTotalPages,
      resolvedPage,
      resolvedSiblingCount,
      resolvedBoundaryCount
    ]
  );

  const handlePageChange = (nextPage: number) => {
    const clampedPage = clampPage(nextPage, resolvedTotalPages);

    if (clampedPage === resolvedPage) {
      return;
    }

    setCurrentPage(clampedPage);
  };

  const isPreviousDisabled = disabled || resolvedPage <= 1;
  const isNextDisabled = disabled || resolvedPage >= resolvedTotalPages;
  let ellipsisKeyCounter = 0;

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={clsx(styles.pagination, className)}
      style={style}
      {...props}
    >
      <ul className={styles.pagination_list}>
        {showControls && (
          <li className={styles.pagination_item}>
            <button
              type='button'
              className={clsx(
                styles.pagination_button,
                styles.pagination_button_control
              )}
              disabled={isPreviousDisabled}
              onClick={() => handlePageChange(resolvedPage - 1)}
              aria-label='Go to previous page'
            >
              {previousLabel}
            </button>
          </li>
        )}

        {items.map((item) => {
          if (item === 'ellipsis') {
            ellipsisKeyCounter += 1;

            return (
              <li
                key={`ellipsis-${ellipsisKeyCounter}`}
                className={clsx(
                  styles.pagination_item,
                  styles.pagination_item_gap
                )}
              >
                <span className={styles.pagination_ellipsis} aria-hidden='true'>
                  …
                </span>
              </li>
            );
          }

          const isCurrent = item === resolvedPage;

          return (
            <li key={item} className={styles.pagination_item}>
              <button
                type='button'
                className={clsx(styles.pagination_button, {
                  [styles.pagination_button_current]: isCurrent
                })}
                onClick={() => handlePageChange(item)}
                disabled={disabled}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Go to page ${item}`}
              >
                {item}
              </button>
            </li>
          );
        })}

        {showControls && (
          <li className={styles.pagination_item}>
            <button
              type='button'
              className={clsx(
                styles.pagination_button,
                styles.pagination_button_control
              )}
              disabled={isNextDisabled}
              onClick={() => handlePageChange(resolvedPage + 1)}
              aria-label='Go to next page'
            >
              {nextLabel}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
