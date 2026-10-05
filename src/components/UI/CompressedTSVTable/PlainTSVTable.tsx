import React, { useEffect, useMemo, useState } from 'react';
import { ungzip } from 'pako';

import type { PaginatedList } from '@/interfaces';
import { searchRegExp } from 'utils/textSearch';
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

type SearchResults = {
  rows: string[][];
  term: string;
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
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    const url = download.url;

    setRowsState({ rows: null, url });
    setSearchResults(null);
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
        return parseRows(text);
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
  const visibleRows = searchResults?.rows ?? dataRows;
  const histogramColumnIndex =
    headerRow?.findIndex(
      (header) =>
        header.trim().toLowerCase() ===
        barChartSpec?.histogramColumn?.trim().toLowerCase()
    ) ?? -1;
  const chartData = useMemo<PaginatedList<string[]> | undefined>(() => {
    if (!barChartSpec?.histogramColumn || histogramColumnIndex < 0)
      return undefined;
    const counts = new Map<string, number>();
    visibleRows.forEach((row) => {
      const label = row[histogramColumnIndex]?.trim() || 'Unclassified';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    const items = [...counts]
      .sort(([a, aCount], [b, bCount]) => bCount - aCount || a.localeCompare(b))
      .map(([label, count]) => [label, String(count)]);
    return { items, count: items.length };
  }, [barChartSpec?.histogramColumn, histogramColumnIndex, visibleRows]);
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
      barChartSpec={
        barChartSpec?.histogramColumn && histogramColumnIndex < 0
          ? undefined
          : barChartSpec
      }
      chartData={chartData}
      columnHeaders={columnHeaders}
      columns={columns}
      data={pageData}
      expectedPageSize={PAGE_SIZE}
      fileUrl={download.url}
      headerRow={headerRow}
      isLoading={rows === null}
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
