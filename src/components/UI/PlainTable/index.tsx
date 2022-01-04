/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef } from 'react';
import { Column, useSortBy, useTable } from 'react-table';

import Loading from 'components/UI/Loading';

type EMGTableProps = {
  cols: Column[];
  data: Array<unknown>;
  className?: string;
  sortable?: boolean;
  loading?: boolean;
  isStale?: boolean;
};

const PlainTable: React.FC<EMGTableProps> = ({
  cols,
  data,
  className = '',
  sortable = false,
  loading = false,
  isStale = false,
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns: cols,
        data,
      },
      useSortBy
    );
  const tableRef = useRef(null);

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
    </section>
  );
};

export default PlainTable;
