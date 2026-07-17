import React, { useEffect, useRef, useState } from 'react';

import type { PaginatedList } from '@/interfaces';
import { BGZipService } from 'components/Analysis/BgZipService';
import TSVTableView from './TSVTableView';
import type { TSVTableLoaderProps } from './types';

const DEFAULT_PAGE_SIZE = 100;
const EMPTY_PAGE: PaginatedList<string[]> = { items: [], count: 0 };

const normalizePageNumber = (pageNum: number): number =>
  Math.max(1, Number(pageNum) || 1);

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
  const estimatedPageSizeRef = useRef(0);
  const firstPagePromiseRef = useRef<Promise<string[][]>>();
  const firstRowIsHeader = columns.length === 0;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const initialized = await reader.initialize();
        if (!initialized || cancelled) return;

        if (!firstPagePromiseRef.current) {
          const firstPagePromise = reader.readPageAsTSV(1);
          firstPagePromiseRef.current = firstPagePromise;
          firstPagePromise.catch(() => {
            if (firstPagePromiseRef.current === firstPagePromise) {
              firstPagePromiseRef.current = undefined;
            }
          });
        }

        // Reading page one first lets BGZipService account for a leading
        // comments-only block before it maps logical page numbers.
        const firstPageRows = await firstPagePromiseRef.current;
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
  }, [firstRowIsHeader, pageNum, reader, setPageNum]);

  return (
    <TSVTableView
      barChartSpec={barChartSpec}
      columnHeaders={columnHeaders}
      columns={columns}
      data={pageData}
      expectedPageSize={
        estimatedPageSize || pageData.items.length || DEFAULT_PAGE_SIZE
      }
      headerRow={headerRow}
      isLoading={isLoading}
    />
  );
};

export default IndexedBGZipTSVTable;
