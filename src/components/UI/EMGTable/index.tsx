import React, {
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { camelCase, filter } from 'lodash-es';

import {
  Column,
  Row,
  SortingRule,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import Loading from 'components/UI/Loading';
import TextInputDebounced from 'components/UI/TextInputDebounced';
import LoadingOverlay from 'components/UI/LoadingOverlay';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';

import { PaginatedList } from '@/interfaces';
import { MGnifyDatum, MGnifyResponse } from 'hooks/data/useData';
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

  let endingPages: number[] = [];
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
  tableSortBy: Array<SortingRule<string>>
): string {
  if (!tableSortBy.length) return '';
  const col = tableSortBy[0];
  return `${col.desc ? '-' : ''}${col.id
    .replace(/attributes./g, '')
    .replace(/-/g, '_')}`;
}

function getSortedColumnFromOrderingQueryParam(
  ordering: string
): Array<{ id: string; desc: boolean }> {
  if (!ordering) return [];
  const desc = ordering.startsWith('-');
  const id = ordering
    .replace(/^-/, '')
    .replace(/attributes\./g, '')
    .replace(/-/g, '_');
  return [{ id, desc }];
}

type EMGTableProps<T extends object> = {
  cols: Column<T>[];
  data:
    | PaginatedList
    | Record<string, unknown>[]
    | MGnifyResponse
    | Array<MGnifyDatum>;
  Title?: React.ReactNode;
  showPagination?: boolean;
  showTextFilter?: boolean;
  initialPage?: number;
  expectedPageSize?: number;
  initialPageSize?: number; // legacy
  className?: string;
  namespace?: string;
  sortable?: boolean;
  loading?: boolean;
  isStale?: boolean;
  downloadURL?: string;
  onDownloadRequested?: () => void;
  ExtraBarComponent?: React.ReactNode;
  onMouseEnterRow?: (row: Row<T>) => void;
  onMouseLeaveRow?: (row: Row<T>) => void;
  dataCy?: string;
};

const EMGTable = <T extends object>({
  cols,
  data,
  Title,
  initialPage = 0,
  expectedPageSize = 100,
  className = '',
  namespace = '',
  showPagination = true,
  showTextFilter = false,
  sortable = false,
  loading = false,
  isStale = false,
  downloadURL = undefined,
  onDownloadRequested = () => null,
  ExtraBarComponent = null,
  onMouseEnterRow = () => null,
  onMouseLeaveRow = () => null,
  dataCy,
}: EMGTableProps<T>) => {
  const [page, setPage] = useQueryParamState<number>(
    camelCase(`${namespace} page`)
  );
  const [ordering, setOrdering] = useQueryParamState<string>(
    camelCase(`${namespace} order`)
  );

  const pageCount = useMemo(() => {
    if (data && 'count' in data) {
      return Math.ceil(data.count / expectedPageSize) || 1;
    }
    return (data as MGnifyResponse)?.meta?.pagination?.pages || 1;
  }, [data, expectedPageSize]);

  const tableData = useMemo(() => {
    return ((data as MGnifyResponse)?.data ||
      (data as PaginatedList)?.items ||
      data) as T[];
  }, [data]);

  const {
    setSortBy,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    gotoPage,
    state: { pageIndex, sortBy },
  } = useTable<T>(
    {
      columns: cols as Column<T>[],
      data: tableData,
      initialState: {
        pageIndex: initialPage,
        sortBy: getSortedColumnFromOrderingQueryParam(ordering),
      },
      pageCount: pageCount || 1,
      manualPagination: true,
      manualSortBy: true,
    },
    useSortBy,
    usePagination
  );
  const tableRef = useRef(null);
  const [isChangingPage, setChangingPage] = useState(false);

  useEffect(() => {
    if (!showPagination) return;
    const desiredIndex = Math.max(0, (page ?? 1) - 1);
    if (pageIndex !== desiredIndex) {
      gotoPage(desiredIndex);
      if (tableRef.current && isChangingPage) {
        (tableRef.current as HTMLElement).scrollIntoView();
        setChangingPage(false);
      }
    }
  }, [showPagination, page, pageIndex, gotoPage, isChangingPage]);

  useEffect(() => {
    // Handle table-initiated change of sorting column
    if (!sortable || !sortBy?.length) return;
    const orderParamRequestedByTable =
      getOrderingQueryParamFromSortedColumn(sortBy);
    if (ordering !== orderParamRequestedByTable) {
      setOrdering(orderParamRequestedByTable);
      setPage(1);
    }
  }, [sortable, sortBy, ordering, setOrdering, setPage]);

  useEffect(() => {
    // Handle external (e.g. URL query param) load/change of sorting column
    if (!sortable) return;
    const orderParamSpecifiedExternally = ordering;
    const orderParamCurrentlyInTable =
      getOrderingQueryParamFromSortedColumn(sortBy);
    if (orderParamSpecifiedExternally !== orderParamCurrentlyInTable) {
      setSortBy(
        getSortedColumnFromOrderingQueryParam(orderParamSpecifiedExternally)
      );
      setPage(1);
    }
  }, [ordering, setPage, setSortBy, sortBy, sortable]);

  const paginationRanges = useMemo(
    () => getPaginationRanges(pageIndex, pageCount),
    [pageIndex, pageCount]
  );
  const goToPageAndScroll = (pageNumber): MouseEventHandler => {
    return () => {
      setChangingPage(true);
      setPage(pageNumber + 1);
    };
  };

  const fullWidthColSpan = useMemo(() => {
    return filter(cols, (col) => !col.isFullWidth).length;
  }, [cols]);

  if (loading && !isStale) return <Loading size="small" />;
  return (
    <section data-cy={dataCy}>
      <LoadingOverlay loading={loading && isStale}>
        <table
          {...getTableProps()}
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
                  {onDownloadRequested && (
                    <div>
                      {' '}
                      <button
                        onClick={onDownloadRequested}
                        type="button"
                        data-cy="emg-table-download-button"
                        className="vf-button vf-button--secondary vf-button--sm"
                        style={{ whiteSpace: 'nowrap', marginBottom: '8px' }}
                      >
                        <span className="icon icon-common icon-download" />{' '}
                        Download
                      </button>
                    </div>
                  )}
                </div>
                {Title}
              </div>
            </caption>
          )}
          <thead className="vf-table__header">
            {headerGroups.map((headerGroup, idx) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="vf-table__row"
                key={headerGroup.id || idx}
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
                      key={column.id}
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
                          key={cell.column.id}
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
          <nav className="vf-pagination" aria-label="Pagination">
            <ul className="vf-pagination__list">
              <li className="vf-pagination__item vf-pagination__item--previous-page">
                <button
                  disabled={!canPreviousPage}
                  type="button"
                  onClick={() => {
                    setChangingPage(true);
                    setPage(Math.max(1, pageIndex /* zero-based */ + 1 - 1));
                  }}
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
                  onClick={() => {
                    setChangingPage(true);
                    setPage(pageIndex + 1 + 1);
                  }}
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
