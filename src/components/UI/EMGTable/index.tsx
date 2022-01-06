/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  MouseEventHandler,
} from 'react';
import { Column, usePagination, useSortBy, useTable } from 'react-table';

import Loading from 'components/UI/Loading';
import { MGnifyResponse, MGnifyDatum } from 'src/hooks/data/useData';
import { useQueryParametersState } from 'hooks/useQueryParamState';
import PaginationButton from './PaginationButton';

import './style.css';
import TextInputDebounced from '../TextInputDebounced';

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

function getOrderingQueryParamFromSortedColumn(
  tableSortBy: Array<{ id: string; desc: boolean }>
): string {
  if (!tableSortBy.length) return '';
  const col = tableSortBy[0];
  return `${col.desc ? '-' : ''}${col.id
    .replace(/attributes./g, '')
    .replace(/-/g, '_')}`;
}

type EMGTableProps = {
  cols: Column[];
  data: MGnifyResponse | Array<MGnifyDatum> | Record<string, unknown>[];
  title?: string | React.ElementType;
  showPagination?: boolean;
  showTextFilter?: boolean;
  initialPage?: number;
  initialPageSize?: number;
  className?: string;
  namespace?: string;
  sortable?: boolean;
  loading?: boolean;
  isStale?: boolean;
  downloadURL?: string;
};

const EMGTable: React.FC<EMGTableProps> = ({
  cols,
  data,
  title: Title,
  initialPage = 0,
  initialPageSize = 25,
  className = '',
  namespace = '',
  showPagination = true,
  showTextFilter = false,
  sortable = false,
  loading = false,
  isStale = false,
  downloadURL = null,
}) => {
  const [queryParameters, setQueryParameters] = useQueryParametersState(
    {
      [`${namespace}page`]: 1,
      [`${namespace}order`]: '',
      [`${namespace}page_size`]: initialPageSize,
      [`${namespace}search`]: initialPageSize,
    },
    {
      [`${namespace}page`]: Number,
      [`${namespace}page_size`]: Number,
    }
  );
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
    setPageSize,
    nextPage,
    previousPage,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns: cols,
      data: (data as MGnifyResponse)?.data || data,
      initialState: {
        pageIndex: initialPage,
        pageSize: queryParameters[`${namespace}page_size`],
      },
      pageCount: (data as MGnifyResponse)?.meta?.pagination?.pages || 1,
      manualPagination: true,
      manualSortBy: true,
    },
    useSortBy,
    usePagination
  );
  const tableRef = useRef(null);
  const [isChangingPage, setChangingPage] = useState(false);

  useEffect(() => {
    if (
      showPagination &&
      queryParameters[`${namespace}page`] !== pageIndex + 1
    ) {
      setQueryParameters({
        ...queryParameters,
        [`${namespace}page`]: pageIndex + 1,
      });
      if (tableRef.current && isChangingPage) {
        tableRef.current.scrollIntoView();
        setChangingPage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPagination, setQueryParameters, pageIndex]);

  useEffect(() => {
    if (
      showPagination &&
      queryParameters[`${namespace}page_size`] !== pageSize
    ) {
      setQueryParameters({
        ...queryParameters,
        [`${namespace}page_size`]: pageSize,
      });
      if (tableRef.current && isChangingPage) {
        tableRef.current.scrollIntoView();
        setChangingPage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPagination, setQueryParameters, pageSize]);

  useEffect(() => {
    if (sortable) {
      const order = getOrderingQueryParamFromSortedColumn(sortBy);
      if (order === queryParameters[`${namespace}order`]) return;
      setQueryParameters({
        ...queryParameters,
        [`${namespace}order`]: order,
        [`${namespace}page`]: 1,
      });
      if (tableRef.current && isChangingPage) {
        tableRef.current.scrollIntoView();
        setChangingPage(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPagination, setQueryParameters, sortBy, sortable]);

  const paginationRanges = useMemo(
    () => getPaginationRanges(pageIndex, pageCount),
    [pageIndex, pageCount]
  );
  const goToPageAndScroll = (pageNumber): MouseEventHandler => {
    setChangingPage(true);
    return gotoPage(pageNumber);
  };
  const changeSizeAndScroll = (evt): void => {
    setChangingPage(true);
    return setPageSize(+evt.target.value);
  };

  if (loading && !isStale) return <Loading size="small" />;

  return (
    <section>
      <div className="mg-table-overlay-container">
        <div className={loading && isStale ? 'mg-table-overlay' : undefined} />
        <table
          {...getTableProps}
          className={`vf-table--striped mg-table ${className}`}
          ref={tableRef}
        >
          {(Title || showTextFilter || downloadURL) && (
            <caption className="vf-table__caption mg-table-caption">
              <div>
                <div>
                  {showTextFilter && (
                    <TextInputDebounced namespace={namespace} />
                  )}
                  {downloadURL && (
                    <>
                      {' '}
                      <a
                        href={downloadURL}
                        className="vf-button vf-button--secondary vf-button--sm"
                        style={{ whiteSpace: 'nowrap' }}
                        download
                      >
                        <span className="icon icon-common icon-download" />{' '}
                        Download
                      </a>
                    </>
                  )}
                </div>
                {Title && (typeof Title === 'string' ? Title : <Title />)}
              </div>
            </caption>
          )}
          <thead className="vf-table__header">
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="vf-table__row"
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...(sortable && column.canSort
                      ? column.getHeaderProps(column.getSortByToggleProps())
                      : { key: column.id })}
                    className="vf-table__heading"
                  >
                    {column.render('Header')}
                    {sortable && column.canSort && (
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
      </div>

      {showPagination && (
        <section className="mg-table-footer">
          <label className="vf-form__label">
            Page Size:
            <select
              className="vf-form__select"
              value={queryParameters[`${namespace}page_size`] as number}
              onBlur={changeSizeAndScroll}
              onChange={changeSizeAndScroll}
            >
              {[10, 25, 50].map((pg) => (
                <option key={pg} value={pg}>
                  Show {pg}
                </option>
              ))}
            </select>
          </label>
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
                  gotoPage={goToPageAndScroll}
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
                  gotoPage={goToPageAndScroll}
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
                  gotoPage={goToPageAndScroll}
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
        </section>
      )}
    </section>
  );
};

export default EMGTable;
