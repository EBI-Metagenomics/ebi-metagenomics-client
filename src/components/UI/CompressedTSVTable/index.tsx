import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Download, PaginatedList } from '@/interfaces';
import './style.css';
import { BGZipService } from 'components/Analysis/BgZipService';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { Column } from 'react-table';
import { createSharedQueryParamContextForTable } from 'hooks/queryParamState/useQueryParamState';
import { startCase } from 'lodash-es';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';
import BarChartForTable, {
  BarChartForTableProps,
} from 'components/Analysis/BarChartForTable';

type BarChartSpec = Pick<
  BarChartForTableProps,
  'title' | 'labelsCol' | 'countsCol' | 'maxLabels'
>;

interface CompressedTSVTableProps {
  columns?: Column[];
  download: Download;
  barChartSpec?: BarChartSpec;
}

const { usePage, withQueryParamProvider } =
  createSharedQueryParamContextForTable();

/**
 * A component for displaying and interacting with compressed TSV files
 */
const CompressedTSVTable: React.FC<CompressedTSVTableProps> = ({
  columns = [],
  download,
  barChartSpec,
}) => {
  const bgzipReader = useMemo(() => new BGZipService(download), [download]);
  const [pageNum, setPageNum] = usePage<number>();
  const [pageData, setPageData] = useState<PaginatedList>({
    items: [],
    count: 0,
  });
  const [estimatedPageSize, setEstimatedPageSize] = useState<number>(0);
  const [cols, setCols] = useState<Column[]>(columns);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const columnsAreFirstRowOfFirstPage = !columns.length;
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

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
        let count =
          pageCount *
          Math.max(
            estimatedPageSize || response.length || 1,
            response.length || 1
          );
        const items = [...response];

        if (
          columnsAreFirstRowOfFirstPage &&
          currentPage === 1 &&
          items.length
        ) {
          const rowToUseAsHeaders = items[0] as string[];
          count = Math.max(0, count - 1);
          items.shift();

          setCols(
            rowToUseAsHeaders.map((header, colNum) => ({
              Header: startCase(header),
              accessor: (row) => row[colNum],
              id: `col_${colNum}`,
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
  }, [pageNum, bgzipReader, estimatedPageSize, columnsAreFirstRowOfFirstPage]);

  const viewModeSelector = barChartSpec ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button
        type="button"
        className={`vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm`}
        onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
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
  ) : null;

  let content: ReactElement | null = null;
  if (isLoading) content = <Loading />;
  else if (viewMode === 'table')
    content = (
      <EMGTable
        cols={cols}
        data={pageData}
        showPagination
        expectedPageSize={estimatedPageSize || pageData.items?.length || 100}
      />
    );
  else if (viewMode === 'chart' && barChartSpec)
    content = (
      <BarChartForTable
        data={pageData}
        labelsCol={barChartSpec?.labelsCol}
        countsCol={barChartSpec?.countsCol}
        title={barChartSpec?.title}
      />
    );

  return (
    <div className="compressed-tsv-table">
      <FixedHeightScrollable heightPx={600}>
        {viewModeSelector}
        {content}
      </FixedHeightScrollable>
    </div>
  );
};

export default withQueryParamProvider(CompressedTSVTable);
