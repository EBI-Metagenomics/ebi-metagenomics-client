import React, { useEffect, useMemo, useState } from 'react';

import type { PaginatedList } from '@/interfaces';
import TSVTableView from './TSVTableView';
import type { TSVTableLoaderProps } from './types';

const PAGE_SIZE = 100;

const parseRows = (text: string, leadingCommentChars = '#'): string[][] =>
  text
    .split('\n')
    .filter(
      (line) => line.trim().length > 0 && !line.startsWith(leadingCommentChars)
    )
    .map((line) => line.split('\t'));

const normalizePageNumber = (pageNum: number): number =>
  Math.max(1, Number(pageNum) || 1);

type RowsState = {
  rows: string[][] | null;
  url: string;
};

const PlainTSVTable: React.FC<TSVTableLoaderProps> = ({
  barChartSpec,
  columnHeaders,
  columns = [],
  download,
  pageNum,
  setPageNum,
}) => {
  const [rowsState, setRowsState] = useState<RowsState>({
    rows: null,
    url: download.url,
  });

  useEffect(() => {
    let cancelled = false;
    const url = download.url;

    setRowsState({ rows: null, url });
    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch TSV file: ${response.status} ${response.statusText}`
          );
        }
        return parseRows(await response.text());
      })
      .then((rows) => {
        if (!cancelled) setRowsState({ rows, url });
      })
      .catch(() => {
        if (!cancelled) setRowsState({ rows: [], url });
      });

    return () => {
      cancelled = true;
    };
  }, [download.url]);

  const rows = rowsState.url === download.url ? rowsState.rows : null;
  const firstRowIsHeader = columns.length === 0;
  const headerRow = firstRowIsHeader ? rows?.[0] : undefined;
  const dataRows = useMemo(
    () => (firstRowIsHeader ? rows?.slice(1) : rows) ?? [],
    [firstRowIsHeader, rows]
  );
  const totalPages = Math.max(1, Math.ceil(dataRows.length / PAGE_SIZE));
  const currentPage = Math.min(normalizePageNumber(pageNum), totalPages);

  useEffect(() => {
    if (rows !== null && currentPage !== pageNum) setPageNum(currentPage);
  }, [currentPage, pageNum, rows, setPageNum]);

  const pageData = useMemo<PaginatedList<string[]>>(() => {
    const offset = (currentPage - 1) * PAGE_SIZE;
    return {
      items: dataRows.slice(offset, offset + PAGE_SIZE),
      count: dataRows.length,
    };
  }, [currentPage, dataRows]);

  return (
    <TSVTableView
      barChartSpec={barChartSpec}
      columnHeaders={columnHeaders}
      columns={columns}
      data={pageData}
      expectedPageSize={PAGE_SIZE}
      headerRow={headerRow}
      isLoading={rows === null}
    />
  );
};

export default PlainTSVTable;
