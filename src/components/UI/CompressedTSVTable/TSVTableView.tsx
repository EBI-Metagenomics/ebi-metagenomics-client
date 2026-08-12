import React, { useEffect, useMemo, useState } from 'react';
import { filesize } from 'filesize';
import type { Column } from 'react-table';

import BarChartForTable from 'components/Analysis/BarChartForTable';
import EMGTable from 'components/UI/EMGTable';
import EMGModal from 'components/UI/EMGModal';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';
import Loading from 'components/UI/Loading';
import { getRemoteFileSize } from 'utils/fetch';
import { getTSVColumnLabel } from 'utils/tsv';
import TSVCell from './TSVCell';
import type { TSVTableViewProps } from './types';

const columnsFromHeader = (
  headerRow: string[],
  columnHeaders: string[] | undefined,
  searchTerm: string
): Column[] =>
  headerRow.map((header, columnIndex) => ({
    Header: getTSVColumnLabel(columnHeaders?.[columnIndex] ?? header),
    accessor: (row) => row[columnIndex],
    Cell: ({ value }) => <TSVCell value={value} searchTerm={searchTerm} />,
    id: `col_${columnIndex}`,
  }));

const TSVTableView: React.FC<TSVTableViewProps> = ({
  barChartSpec,
  columnHeaders,
  columns = [],
  data,
  expectedPageSize,
  fileUrl,
  headerRow,
  isLoading,
  isSearching,
  onClearSearch,
  onSearch,
  searchTerm,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [fileSize, setFileSize] = useState<number | null>();
  const tableColumns = useMemo(() => {
    if (!columns.length) {
      return columnsFromHeader(headerRow ?? [], columnHeaders, searchTerm);
    }
    return columns.map((column) =>
      'Cell' in column && column.Cell
        ? column
        : {
            ...column,
            Cell: ({ value }) => (
              <TSVCell value={value} searchTerm={searchTerm} />
            ),
          }
    );
  }, [columnHeaders, columns, headerRow, searchTerm]);
  const isBusy = isLoading || isSearching;

  useEffect(() => {
    setFileSize(undefined);
  }, [fileUrl]);

  useEffect(() => {
    if (!isSearchModalOpen || fileSize !== undefined) return undefined;

    let cancelled = false;
    getRemoteFileSize(fileUrl).then((size) => {
      if (!cancelled) setFileSize(size || null);
    });
    return () => {
      cancelled = true;
    };
  }, [fileSize, fileUrl, isSearchModalOpen]);

  const openSearchModal = () => {
    setSearchInput(searchTerm);
    setIsSearchModalOpen(true);
  };

  const clearSearch = () => {
    onClearSearch();
    setSearchInput('');
    setViewMode('table');
    setIsSearchModalOpen(false);
  };

  return (
    <div className="compressed-tsv-table tsv-table">
      <EMGModal
        isOpen={isSearchModalOpen}
        onRequestClose={() => setIsSearchModalOpen(false)}
        contentLabel="Search TSV table"
      >
        <form
          className="compressed-tsv-table__search-form vf-stack vf-stack--400"
          onSubmit={async (event) => {
            event.preventDefault();
            const nextSearchTerm = searchInput.trim();
            if (!nextSearchTerm) return;
            await onSearch(nextSearchTerm);
            setViewMode('table');
            setIsSearchModalOpen(false);
          }}
        >
          <h2>Search table</h2>
          <p>
            Searching requires the complete file
            {fileSize === undefined && ' (checking its size...)'}
            {fileSize !== undefined &&
              fileSize !== null &&
              ` (${filesize(fileSize, { round: 1 })})`}{' '}
            to be loaded in your browser.
          </p>
          <label className="vf-form__label">
            Search&nbsp;term
            <input
              type="search"
              className="vf-form__input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              autoFocus
            />
          </label>
          <div className="compressed-tsv-table__search-actions">
            <button
              type="submit"
              className="vf-button vf-button--primary vf-button--sm"
              disabled={!searchInput.trim() || isBusy}
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                className="vf-button vf-button--secondary vf-button--sm"
                onClick={clearSearch}
                disabled={isSearching}
              >
                Clear search
              </button>
            )}
          </div>
          {isSearching && (
            <div aria-live="polite">
              <p>Searching all rows…</p>
              <Loading size="small" />
            </div>
          )}
        </form>
      </EMGModal>
      <FixedHeightScrollable heightPx={600} className="tsv-table__scroll">
        <div className="compressed-tsv-table__toolbar tsv-table__toolbar">
          <div className="compressed-tsv-table__search-status">
            {searchTerm && (
              <>
                Showing {data.count.toLocaleString()}{' '}
                {data.count === 1 ? 'row' : 'rows'} matching{' '}
                <strong>{searchTerm}</strong>
                <button
                  type="button"
                  className="vf-button vf-button--link vf-button--sm"
                  onClick={clearSearch}
                  disabled={isSearching}
                >
                  Clear
                </button>
              </>
            )}
          </div>
          <div className="compressed-tsv-table__toolbar-actions">
            {barChartSpec && (
              <button
                type="button"
                className="vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm"
                onClick={() =>
                  setViewMode((currentMode) =>
                    currentMode === 'table' ? 'chart' : 'table'
                  )
                }
                disabled={isBusy}
              >
                <span
                  className={`icon icon-common icon-${
                    viewMode === 'table' ? 'chart-bar' : 'table'
                  }`}
                  style={{ color: '#dcfce7' }}
                />
                <span className="vf-button__text">
                  Switch to {viewMode === 'table' ? 'chart' : 'table'} view
                </span>
              </button>
            )}
            <button
              type="button"
              className="vf-button vf-button--secondary vf-button--sm"
              onClick={openSearchModal}
              disabled={isBusy}
            >
              <span className="icon icon-common icon-search" />{' '}
              <span className="vf-button__text">Search...</span>
            </button>
          </div>
        </div>

        {isBusy && <Loading />}
        {!isBusy && viewMode === 'table' && (
          <EMGTable
            cols={tableColumns}
            data={data}
            showPagination
            expectedPageSize={expectedPageSize}
          />
        )}
        {!isBusy && viewMode === 'chart' && barChartSpec && (
          <BarChartForTable data={data} {...barChartSpec} />
        )}
      </FixedHeightScrollable>
    </div>
  );
};

export default TSVTableView;
