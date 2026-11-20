import React, { useEffect, useMemo, useState } from 'react';
import { ungzip } from 'pako';
import Papa from 'papaparse';

import type { PaginatedList } from '@/interfaces';
import { searchRegExp } from 'utils/textSearch';
import TSVTableView from './TSVTableView';
import type { TSVTableLoaderProps } from './types';

const PAGE_SIZE = 100;

const normalizePageNumber = (pageNum: number): number =>
  Math.max(1, Number(pageNum) || 1);

type RowsState = {
  rows: string[][] | null;
  url: string;
};

type SearchResults = {
  rows: string[][];
  term: string;
};

const PlainTSVTable: React.FC<TSVTableLoaderProps> = ({
  barChartSpec,
  chartViews,
  delimiter = '\t',
  columnHeaders,
  columns = [],
  download,
  emptyStateMessage,
  initialView,
  pageNum,
  setPageNum,
}) => {
  const [rowsState, setRowsState] = useState<RowsState>({
    rows: null,
    url: download.url,
  });
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    const url = download.url;

    setRowsState({ rows: null, url });
    setSearchResults(null);
    setError('');
    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch TSV file: ${response.status} ${response.statusText}`
          );
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        // Inspect the body because HTTP content encoding may already have
        // decompressed a .gz URL before fetch exposes the response.
        const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
        const text = new TextDecoder().decode(isGzip ? ungzip(bytes) : bytes);
        const parsed = Papa.parse<string[]>(text, {
          delimiter,
          comments: '#',
          skipEmptyLines: 'greedy',
        });
        if (parsed.errors.length) throw new Error('Invalid delimited table');
        return parsed.data;
      })
      .then((rows) => {
        if (!cancelled) setRowsState({ rows, url });
      })
      .catch((reason: Error) => {
        if (!cancelled) {
          setError(reason.message);
          setRowsState({ rows: [], url });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [download.url, delimiter]);

  const rows = rowsState.url === download.url ? rowsState.rows : null;
  const firstRowIsHeader = columns.length === 0;
  const headerRow = firstRowIsHeader ? rows?.[0] : undefined;
  const dataRows = useMemo(
    () => (firstRowIsHeader ? rows?.slice(1) : rows) ?? [],
    [firstRowIsHeader, rows]
  );
  const visibleRows = searchResults?.rows ?? dataRows;
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
  const currentPage = Math.min(normalizePageNumber(pageNum), totalPages);

  useEffect(() => {
    if (rows !== null && currentPage !== pageNum) setPageNum(currentPage);
  }, [currentPage, pageNum, rows, setPageNum]);

  const pageData = useMemo<PaginatedList<string[]>>(() => {
    const offset = (currentPage - 1) * PAGE_SIZE;
    return {
      items: visibleRows.slice(offset, offset + PAGE_SIZE),
      count: visibleRows.length,
    };
  }, [currentPage, visibleRows]);

  const searchAllRows = async (rawSearchTerm: string, wholeWord: boolean) => {
    const term = rawSearchTerm.trim();
    if (!term || rows === null) return;

    setIsSearching(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    const pattern = searchRegExp(term, wholeWord);
    setSearchResults({
      rows: dataRows.filter(
        (row) => !!pattern && row.some((cell) => pattern.test(String(cell)))
      ),
      term,
    });
    setPageNum(1);
    setIsSearching(false);
  };

  return (
    <TSVTableView
      initialView={initialView}
      barChartSpec={barChartSpec}
      chartViews={chartViews}
      chartData={{ items: visibleRows, count: visibleRows.length }}
      error={error}
      columnHeaders={columnHeaders}
      columns={columns}
      data={pageData}
      emptyStateMessage={emptyStateMessage}
      expectedPageSize={PAGE_SIZE}
      fileUrl={download.url}
      headerRow={headerRow}
      isLoading={rows === null}
      isFileEmpty={rows !== null && dataRows.length === 0}
      isSearching={isSearching}
      onClearSearch={() => {
        setSearchResults(null);
        setPageNum(1);
      }}
      onSearch={searchAllRows}
      searchTerm={searchResults?.term ?? ''}
    />
  );
};

export default PlainTSVTable;
