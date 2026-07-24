import React, { useMemo, useState } from 'react';
import { startCase } from 'lodash-es';
import type { Column } from 'react-table';

import BarChartForTable from 'components/Analysis/BarChartForTable';
import EMGTable from 'components/UI/EMGTable';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';
import Loading from 'components/UI/Loading';
import type { TSVTableViewProps } from './types';

const columnsFromHeader = (
  headerRow: string[],
  columnHeaders?: string[]
): Column[] =>
  headerRow.map((header, columnIndex) => ({
    Header:
      columnHeaders?.[columnIndex] ??
      (header.includes('_') ? startCase(header) : header),
    accessor: (row) => row[columnIndex],
    id: `col_${columnIndex}`,
  }));

const TSVTableView: React.FC<TSVTableViewProps> = ({
  barChartSpec,
  columnHeaders,
  columns = [],
  data,
  expectedPageSize,
  headerRow,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const tableColumns = useMemo(
    () =>
      columns.length
        ? columns
        : columnsFromHeader(headerRow ?? [], columnHeaders),
    [columnHeaders, columns, headerRow]
  );

  return (
    <div className="compressed-tsv-table">
      <FixedHeightScrollable heightPx={600}>
        {barChartSpec && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              backgroundColor: 'white',
              padding: '0.5rem 0',
            }}
          >
            <button
              type="button"
              className="vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm"
              onClick={() =>
                setViewMode((currentMode) =>
                  currentMode === 'table' ? 'chart' : 'table'
                )
              }
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
          </div>
        )}

        {isLoading && <Loading />}
        {!isLoading && viewMode === 'table' && (
          <EMGTable
            cols={tableColumns}
            data={data}
            showPagination
            expectedPageSize={expectedPageSize}
          />
        )}
        {!isLoading && viewMode === 'chart' && barChartSpec && (
          <BarChartForTable data={data} {...barChartSpec} />
        )}
      </FixedHeightScrollable>
    </div>
  );
};

export default TSVTableView;
