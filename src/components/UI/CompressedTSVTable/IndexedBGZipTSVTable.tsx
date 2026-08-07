import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { PaginatedList } from '@/interfaces';
import { BGZipService } from 'components/Analysis/BgZipService';
import { rowMatchesTSVSearch } from 'utils/tsv';
import TSVTableView from './TSVTableView';
import type { TSVTableLoaderProps } from './types';

const DEFAULT_PAGE_SIZE = 100;
const EMPTY_PAGE: PaginatedList<string[]> = { items: [], count: 0 };

const normalizePageNumber = (pageNum: number): number =>
  Math.max(1, Number(pageNum) || 1);

type SearchResults = {
  rows: string[][];
  term: string;
};

const IndexedBGZipTSVTable: React.FC<TSVTableLoaderProps> = ({
  barChartSpec,
  columnHeaders,
  columns = [],
  download,
  pageNum,
  setPageNum,
}) => {
  const [reader] = useState(() => new BGZipService(download, false));
  const [pageData, setPageData] = useState<PaginatedList<string[]>>(EMPTY_PAGE);
  const [headerRow, setHeaderRow] = useState<string[]>();
  const [estimatedPageSize, setEstimatedPageSize] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const estimatedPageSizeRef = useRef(0);
  const firstPagePromiseRef = useRef<Promise<string[][]>>();
  const firstRowIsHeader = columns.length === 0;

  const readFirstPage = useCallback(() => {
    if (!firstPagePromiseRef.current) {
      const firstPagePromise = reader.readPageAsTSV(1);
      firstPagePromiseRef.current = firstPagePromise;
      firstPagePromise.catch(() => {
        if (firstPagePromiseRef.current === firstPagePromise) {
          firstPagePromiseRef.current = undefined;
        }
      });
    }
    return firstPagePromiseRef.current;
  }, [reader]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        if (searchResults) {
          const totalPages = Math.max(
            1,
            Math.ceil(searchResults.rows.length / DEFAULT_PAGE_SIZE)
          );
          const currentPage = Math.min(
            normalizePageNumber(pageNum),
            totalPages
          );
          if (currentPage !== pageNum) setPageNum(currentPage);
          const offset = (currentPage - 1) * DEFAULT_PAGE_SIZE;
          setPageData({
            items: searchResults.rows.slice(offset, offset + DEFAULT_PAGE_SIZE),
            count: searchResults.rows.length,
          });
          return;
        }

        const initialized = await reader.initialize();
        if (!initialized || cancelled) return;

        // Reading page one first lets BGZipService account for a leading
        // comments-only block before it maps logical page numbers.
        const firstPageRows = await readFirstPage();
        if (cancelled) return;

        const totalPages = Math.max(1, reader.getPageCount() || 1);
        const currentPage = Math.min(normalizePageNumber(pageNum), totalPages);
        if (currentPage !== pageNum) setPageNum(currentPage);

        const response =
          currentPage === 1
            ? firstPageRows
            : await reader.readPageAsTSV(currentPage);
        if (cancelled) return;

        const nextEstimatedPageSize = Math.max(
          estimatedPageSizeRef.current,
          firstPageRows.length,
          response.length
        );
        estimatedPageSizeRef.current = nextEstimatedPageSize;
        setEstimatedPageSize(nextEstimatedPageSize);

        const items = [...response];
        if (firstRowIsHeader) {
          setHeaderRow(firstPageRows[0]);
          if (currentPage === 1) items.shift();
        } else {
          setHeaderRow(undefined);
        }

        const estimatedRowCount =
          totalPages * Math.max(nextEstimatedPageSize, response.length, 1) -
          (firstRowIsHeader && firstPageRows.length ? 1 : 0);
        setPageData({
          items,
          count: Math.max(0, estimatedRowCount),
        });
      } catch {
        if (!cancelled) setPageData(EMPTY_PAGE);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    firstRowIsHeader,
    pageNum,
    readFirstPage,
    reader,
    searchResults,
    setPageNum,
  ]);

  const searchAllPages = async (rawSearchTerm: string) => {
    const term = rawSearchTerm.trim();
    if (!term) return;

    setIsSearching(true);
    try {
      const initialized = await reader.initialize();
      if (!initialized) throw new Error('Could not initialize TSV reader');

      const firstPageRows = await readFirstPage();
      setHeaderRow(firstRowIsHeader ? firstPageRows[0] : undefined);
      const totalPages = Math.max(1, reader.getPageCount() || 1);
      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, pageIndex) =>
          reader.readPageAsTSV(pageIndex + 2)
        )
      );
      const rows = [firstPageRows, ...remainingPages].flat();
      if (firstRowIsHeader && rows.length) rows.shift();

      setSearchResults({
        rows: rows.filter((row) => rowMatchesTSVSearch(row, term)),
        term,
      });
      setPageNum(1);
    } catch {
      setSearchResults({ rows: [], term });
      setPageNum(1);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <TSVTableView
      barChartSpec={barChartSpec}
      columnHeaders={columnHeaders}
      columns={columns}
      data={pageData}
      expectedPageSize={
        searchResults
          ? DEFAULT_PAGE_SIZE
          : estimatedPageSize || pageData.items.length || DEFAULT_PAGE_SIZE
      }
      fileUrl={download.url}
      headerRow={headerRow}
      isLoading={isLoading}
      isSearching={isSearching}
      onClearSearch={() => {
        setSearchResults(null);
        setPageNum(1);
      }}
      onSearch={searchAllPages}
      searchTerm={searchResults?.term ?? ''}
    />
  );
};

export default IndexedBGZipTSVTable;
