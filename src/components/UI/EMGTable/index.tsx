/* eslint-disable react/jsx-props-no-spreading */
import React, {
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { filter } from 'lodash-es';

import { Column, Row, usePagination, useSortBy, useTable } from 'react-table';
import Loading from 'components/UI/Loading';
import TextInputDebounced from 'components/UI/TextInputDebounced';
import LoadingOverlay from 'components/UI/LoadingOverlay';
import { MGnifyDatum, MGnifyResponse } from '@/hooks/data/useData';
import useQueryParamState from '@/hooks/queryParamState/useQueryParamState';

import PaginationButton from './PaginationButton';
import './style.css';

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
    page < (pageCount > 6 ? pageCount - 2 : pageCount) &&
    adjacentPages.length < 5;
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
  Title?: React.ReactNode;
  showPagination?: boolean;
  showTextFilter?: boolean;
  initialPage?: number;
  initialPageSize?: number;
  initialPageCount?: number;
  className?: string;
  namespace?: string;
  sortable?: boolean;
  loading?: boolean;
  isStale?: boolean;
  downloadURL?: string;
  ExtraBarComponent?: React.ReactNode;
  onMouseEnterRow?: (row: Row) => void;
  onMouseLeaveRow?: (row: Row) => void;
  dataCy?: string;
};

const EMGTable: React.FC<EMGTableProps> = ({
  cols,
  data,
  Title,
  initialPage = 0,
  initialPageSize = 25,
  initialPageCount = null,
  className = '',
  namespace = '',
  showPagination = true,
  showTextFilter = false,
  sortable = false,
  loading = false,
  isStale = false,
  downloadURL = null,
  ExtraBarComponent = null,
  onMouseEnterRow = () => null,
  onMouseLeaveRow = () => null,
  dataCy,
}) => {
  const [page, setPage] = useQueryParamState(`${namespace}page`, 1, Number);
  const [ordering, setOrdering] = useQueryParamState(`${namespace}order`, '');
  const [pageSizeSelected, setPageSizeSelected] = useQueryParamState(
    `${namespace}page_size`,
    initialPageSize,
    Number
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
        pageSize: pageSizeSelected,
      },
      pageCount:
        initialPageCount ||
        (data as MGnifyResponse)?.meta?.pagination?.pages ||
        1,
      manualPagination: true,
      manualSortBy: true,
    },
    useSortBy,
    usePagination
  );
  const tableRef = useRef(null);
  const [isChangingPage, setChangingPage] = useState(false);

  useEffect(() => {
    if (showPagination && page !== pageIndex + 1) {
      setPage(pageIndex + 1);
      if (tableRef.current && isChangingPage) {
        tableRef.current.scrollIntoView();
        setChangingPage(false);
      }
    }
    // eslint-disable-next-line react-@/hooks/exhaustive-deps
  }, [showPagination, setPage, pageIndex]);

  useEffect(() => {
    if (showPagination && pageSizeSelected !== pageSize) {
      setPageSizeSelected(pageSize);
      if (tableRef.current && isChangingPage) {
        tableRef.current.scrollIntoView();
        setChangingPage(false);
      }
    }
    // eslint-disable-next-line react-@/hooks/exhaustive-deps
  }, [showPagination, setPageSizeSelected, pageSize]);

  useEffect(() => {
    if (sortable) {
      const order = getOrderingQueryParamFromSortedColumn(sortBy);
      if (order === ordering) return;
      setOrdering(order);
      setPage(1);
      if (tableRef.current && isChangingPage) {
        tableRef.current.scrollIntoView();
        setChangingPage(false);
      }
    }
    // eslint-disable-next-line react-@/hooks/exhaustive-deps
  }, [showPagination, setOrdering, setPage, sortBy, sortable]);

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

  const fullWidthColSpan = useMemo(() => {
    return filter(cols, (col) => !col.isFullWidth).length;
  }, [cols]);

  if (loading && !isStale) return <Loading size="small" />;
  return (
    <section data-cy={dataCy}>
      <LoadingOverlay loading={loading && isStale}>
        <table
          {...getTableProps}
          className={`vf-table--striped mg-table ${className}`}
          ref={tableRef}
        >
          {(Title || showTextFilter || downloadURL) && (
            <caption className="vf-table__caption mg-table-caption">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {ExtraBarComponent}
                  {showTextFilter && (
                    <TextInputDebounced namespace={namespace} />
                  )}
                  {downloadURL && (
                    <div>
                      {' '}
                      <a
                        href={downloadURL}
                        className="vf-button vf-button--secondary vf-button--sm"
                        style={{ whiteSpace: 'nowrap', marginBottom: '8px' }}
                        download
                      >
                        <span className="icon icon-common icon-download" />{' '}
                        Download
                      </a>
                    </div>
                  )}
                </div>
                {Title}
              </div>
            </caption>
          )}
          <thead className="vf-table__header">
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="vf-table__row"
              >
                {headerGroup.headers.map((column) => {
                  if (column.isFullWidth) {
                    return null;
                  }
                  return (
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
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="vf-table__body">
            {rows.map((row) => {
              prepareRow(row);
              return (
                <React.Fragment key={row.id}>
                  <tr
                    {...row.getRowProps()}
                    className="vf-table__row"
                    onMouseEnter={() => onMouseEnterRow(row)}
                    onMouseLeave={() => onMouseLeaveRow(row)}
                  >
                    {row.cells.map((cell) => {
                      if (cell.column.isFullWidth) {
                        return null;
                      }
                      return (
                        <td
                          {...cell.getCellProps()}
                          colSpan={
                            typeof cell.column?.colspan === 'function'
                              ? cell.column.colspan(cell)
                              : cell.column?.colspan
                          }
                          className={`vf-table__cell vf-u-type__text-body--3 ${
                            cell.column?.className || ''
                          }`}
                          style={{ ...(cell.column?.style || {}) }}
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                  {row.cells.map((cell) => {
                    if (cell.column.isFullWidth) {
                      return (
                        <>
                          <tr className="vf-table__row" />
                          {/* Empty row to maintain striping */}
                          <tr
                            {...row.getRowProps()}
                            className="vf-table__row"
                            onMouseEnter={() => onMouseEnterRow(row)}
                            onMouseLeave={() => onMouseLeaveRow(row)}
                          >
                            <td
                              {...cell.getCellProps()}
                              colSpan={fullWidthColSpan}
                              className={`vf-table__cell vf-u-type__text-body--3 ${
                                cell.column?.className || ''
                              }`}
                              style={{ ...(cell.column?.style || {}) }}
                            >
                              <strong>{cell.render('Header')}:&nbsp;</strong>
                              {cell.render('Cell')}
                            </td>
                          </tr>
                        </>
                      );
                    }
                    return null;
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {!loading && !rows.length && (
          <div
            className="vf-box vf-box-theme--primary vf-box--easy"
            style={{
              backgroundColor: '#d1e3f6',
            }}
          >
            <h3 className="vf-box__heading">
              <span className="icon icon-common icon-exclamation-triangle" /> No
              matching data
            </h3>
          </div>
        )}
      </LoadingOverlay>

      {showPagination && (
        <section className="mg-table-footer">
          <label className="vf-form__label">
            Page Size:
            <select
              className="vf-form__select"
              value={pageSizeSelected as number}
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
