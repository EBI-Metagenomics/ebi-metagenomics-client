import React, { useEffect, useMemo, useState } from 'react';
import { Download, PaginatedList } from 'interfaces';
import './style.css';
import { BGZipService } from 'components/Analysis/BgZipService';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { Column } from 'react-table';
import useQueryParamState from 'hooks/queryParamState/useQueryParamState';
import { startCase } from 'lodash-es';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';

interface CompressedTSVTableProps {
  columns?: Column[];
  download: Download;
}

/**
 * A component for displaying and interacting with compressed TSV files
 */
const CompressedTSVTable: React.FC<CompressedTSVTableProps> = ({
  columns = [],
  download,
}) => {
  const bgzipReader = useMemo(() => new BGZipService(download), [download]);
  const [pageNum] = useQueryParamState('page', 1, Number);
  const [pageData, setPageData] = useState<PaginatedList>({
    items: [],
    count: 0,
  });
  const [estimatedPageSize, setEstimatedPageSize] = useState<number>(0);
  const [cols, setCols] = useState<Column[]>(columns);
  const columnsAreFirstRowOfFirstPage = !columns.length;

  useEffect(() => {
    if (!bgzipReader.isInitialized) return;
    if (pageNum > bgzipReader.getPageCount()) return;
    bgzipReader.readPageAsTSV(pageNum as number).then((response) => {
      if (response.length > estimatedPageSize) {
        setEstimatedPageSize(response.length);
      }
      let count =
        bgzipReader.getPageCount() *
        Math.max(estimatedPageSize, response.length);
      const items = response;

      if (columnsAreFirstRowOfFirstPage && pageNum === 1) {
        const rowToUseAsHeaders = items[0] as string[];
        count -= 1;
        items.shift();

        setCols(
          rowToUseAsHeaders.map((header, colNum) => ({
            Header: startCase(header),
            accessor: (row: string[]) => row[colNum],
          }))
        );
      }

      setPageData({
        items,
        count,
      } as PaginatedList);
    });
  }, [
    pageNum,
    bgzipReader.isInitialized,
    estimatedPageSize,
    bgzipReader,
    columnsAreFirstRowOfFirstPage,
  ]);

  if (!bgzipReader.isInitialized) return <Loading />;
  return (
    <div className="compressed-tsv-table">
      <FixedHeightScrollable heightPx={600}>
        {pageData && (
          <EMGTable
            cols={cols}
            data={pageData}
            showPagination
            expectedPageSize={estimatedPageSize}
          />
        )}
      </FixedHeightScrollable>
    </div>
  );
};

export default CompressedTSVTable;
