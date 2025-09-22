import React, { useEffect, useMemo, useState } from 'react';
import { Download, PaginatedList } from 'interfaces';
import './style.css';
import { BGZipService } from 'components/Analysis/BgZipService';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { Column } from 'react-table';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import { startCase } from 'lodash-es';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';

interface CompressedTSVTableProps {
  columns?: Column[];
  download: Download;
}

const {usePage, withQueryParamProvider} = createSharedQueryParamContextForTable()

/**
 * A component for displaying and interacting with compressed TSV files
 */
const CompressedTSVTable: React.FC<CompressedTSVTableProps> = ({
  columns = [],
  download,
}) => {
  const bgzipReader = useMemo(() => new BGZipService(download), [download]);
  const [pageNum, setPageNum] = usePage<number>();
  const [pageData, setPageData] = useState<PaginatedList>({ items: [], count: 0 });
  const [estimatedPageSize, setEstimatedPageSize] = useState<number>(0);
  const [cols, setCols] = useState<Column[]>(columns);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const columnsAreFirstRowOfFirstPage = !columns.length;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        // Ensure the service is initialized before any page read
        const ok = await bgzipReader.initialize();
        if (!ok || cancelled) return;

        // Clamp the current page to the available range (default 1)
        const totalPages = Math.max(1, bgzipReader.getPageCount?.() || 1);
        const requestedPage = Math.max(1, Number(pageNum) || 1);
        const currentPage = Math.min(requestedPage, totalPages);
        if (currentPage !== pageNum && typeof setPageNum === 'function') {
          setPageNum(currentPage);
        }

        const response = await bgzipReader.readPageAsTSV(currentPage);
        if (cancelled) return;

        if (response.length > estimatedPageSize) {
          setEstimatedPageSize(response.length);
        }

        const pageCount = Math.max(1, bgzipReader.getPageCount?.() || 1);
        let count = pageCount * Math.max(estimatedPageSize || response.length || 1, response.length || 1);
        const items = [...response];

        if (columnsAreFirstRowOfFirstPage && currentPage === 1 && items.length) {
          const rowToUseAsHeaders = items[0] as string[];
          count = Math.max(0, count - 1);
          items.shift();

          setCols(
            rowToUseAsHeaders.map((header, colNum) => ({
              Header: startCase(header),
              accessor: (row: string[]) => row[colNum],
            }))
          );
        }

        setPageData({ items, count } as PaginatedList);
      } catch {
        if (!cancelled) {
          // Don’t mask with empty data; surface as an empty dataset but stop the spinner
          setPageData({ items: [], count: 0 });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    pageNum,
    bgzipReader,
    estimatedPageSize,
    columnsAreFirstRowOfFirstPage,
  ]);

  return (
    <div className="compressed-tsv-table">
      <FixedHeightScrollable heightPx={600}>
        {isLoading ? (
          <Loading />
        ) : (
          <EMGTable
            cols={cols}
            data={pageData}
            showPagination
            expectedPageSize={estimatedPageSize || (pageData.items?.length || 100)}
          />
        )}
      </FixedHeightScrollable>
    </div>
  );
};

export default withQueryParamProvider(CompressedTSVTable);
