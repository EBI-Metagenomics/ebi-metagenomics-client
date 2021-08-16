/* eslint-disable react/jsx-props-no-spreading */
import React, { MouseEventHandler } from 'react';
import { Column, usePagination, useSortBy, useTable } from 'react-table';

type PaginationRanges = {
  startingPages: number[];
  endingPages: number[];
  adjacentPages: number[];
  hasJumpFromStart: boolean;
  hasJumpToEnd: boolean;
};

function getPaginationRanges(
  pageIndex: number,
  pageCount: number
): PaginationRanges {
  const startingPages = pageCount > 1 ? [0, 1] : [0];

  const adjacentPages = pageCount > 2 ? [Math.max(2, pageIndex - 2)] : [];
  for (
    let page = adjacentPages[0] + 1;
    page < pageCount - 2 && adjacentPages.length < 5;
    page += 1
  ) {
    adjacentPages.push(page);
  }

  let endingPages = [];
  if (pageCount > 7) {
    endingPages = [pageCount - 2, pageCount - 1];
  } else if (pageCount > 6) {
    endingPages = [pageCount - 1];
  }

  return {
    startingPages,
    endingPages,
    adjacentPages,
    hasJumpFromStart:
      !!adjacentPages.length &&
      adjacentPages[0] > startingPages[startingPages.length - 1] + 1,
    hasJumpToEnd:
      !!endingPages.length &&
      !!adjacentPages.length &&
      endingPages[0] > adjacentPages[adjacentPages.length - 1] + 1,
  };
}

type PaginationButtonProps = {
  currentPageIndex: number;
  pageIndex: number;
  gotoPage: (pageIndex: number) => MouseEventHandler;
};

const PaginationButton: React.FC<PaginationButtonProps> = ({
  currentPageIndex,
  pageIndex,
  gotoPage,
}) => {
  if (currentPageIndex === pageIndex) {
    return (
      <li className="vf-pagination__item vf-pagination__item--is-active">
        <span className="vf-pagination__label" aria-current="page">
          <span className="vf-u-sr-only">Page </span>
          {currentPageIndex + 1}
        </span>
      </li>
    );
  }
  return (
    <li className="vf-pagination__item">
      <button
        type="button"
        onClick={() => gotoPage(pageIndex)}
        className="vf-button vf-button--link vf-pagination__link"
      >
        <span className="vf-u-sr-only"> page</span>
        {pageIndex + 1}
      </button>
    </li>
  );
};

type EMGTableProps = {
  cols: Column[];
  data: {
    data: Record<string, any>[];
    meta: Record<string, any>;
    links?: Record<string, any>;
  };
  title?: string | React.CElement<any, any>;
  fetchPage?: (pageIndex: number, pageSize: number) => void;
  onChangeSort?: (columnId: string) => void;
  initialPage?: number;
  className?: string;
};

const EMGTable: React.FC<EMGTableProps> = ({
  cols,
  data,
  title,
  fetchPage,
  onChangeSort,
  initialPage = 0,
  className = '',
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns: cols,
      data: data.data,
      initialState: { pageIndex: initialPage },
      pageCount: data.meta.pagination.pages,
      manualPagination: true,
      manualSortBy: true,
    },
    useSortBy,
    usePagination
  );

  React.useEffect(() => {
    if (fetchPage) {
      fetchPage(pageIndex, pageSize);
    }
  }, [fetchPage, pageIndex, pageSize]);

  React.useEffect(() => {
    if (onChangeSort) {
      onChangeSort(sortBy);
    }
  }, [onChangeSort, sortBy]);

  const paginationRanges = React.useMemo(
    () => getPaginationRanges(pageIndex, pageCount),
    [pageIndex, pageCount]
  );

  return (
    <section>
      <table {...getTableProps} className={`vf-table--striped ${className}`}>
        <caption className="vf-table__caption">{title}</caption>
        <thead className="vf-table__header">
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              className="vf-table__row"
            >
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="vf-table__heading"
                >
                  {column.render('Header')}
                  {onChangeSort && (
                    <>
                      &nbsp;
                      <span>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <i className="icon icon-common icon-sort-down" />
                          ) : (
                            <i className="icon icon-common icon-sort-up" />
                          )
                        ) : (
                          <i className="icon icon-common icon-sort" />
                        )}
                      </span>
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="vf-table__body">
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="vf-table__row">
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()} className="vf-table__cell">
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {fetchPage && (
        <nav className="vf-pagination" aria-label="Pagination">
          <ul className="vf-pagination__list">
            <li className="vf-pagination__item vf-pagination__item--previous-page">
              <button
                disabled={!canPreviousPage}
                type="button"
                onClick={previousPage}
                className="vf-button vf-button--link vf-pagination__link"
              >
                Previous<span className="vf-u-sr-only"> page</span>
              </button>
            </li>

            {paginationRanges.startingPages.map((paginationIndex) => (
              <PaginationButton
                key={paginationIndex}
                currentPageIndex={pageIndex}
                pageIndex={paginationIndex}
                gotoPage={gotoPage}
              />
            ))}

            {paginationRanges.hasJumpFromStart && (
              <li className="vf-pagination__item">
                <span className="vf-pagination__label">...</span>
              </li>
            )}

            {paginationRanges.adjacentPages.map((paginationIndex) => (
              <PaginationButton
                key={paginationIndex}
                currentPageIndex={pageIndex}
                pageIndex={paginationIndex}
                gotoPage={gotoPage}
              />
            ))}

            {paginationRanges.hasJumpToEnd && (
              <li className="vf-pagination__item">
                <span className="vf-pagination__label">...</span>
              </li>
            )}

            {paginationRanges.endingPages.map((paginationIndex) => (
              <PaginationButton
                key={paginationIndex}
                currentPageIndex={pageIndex}
                pageIndex={paginationIndex}
                gotoPage={gotoPage}
              />
            ))}

            <li className="vf-pagination__item vf-pagination__item--next-page">
              <button
                disabled={!canNextPage}
                type="button"
                onClick={nextPage}
                className="vf-button vf-button--link vf-pagination__link"
              >
                Next<span className="vf-u-sr-only"> page</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </section>
  );
};

export default EMGTable;
