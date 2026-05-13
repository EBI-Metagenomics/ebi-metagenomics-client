import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { PaginatedList } from '@/interfaces';
import Loading from 'components/UI/Loading';
import EMGTable from 'components/UI/EMGTable';
import { Column } from 'react-table';
import { startCase } from 'lodash-es';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';
import BarChartForTable from 'components/Analysis/BarChartForTable';
import protectedAxios from '@/utils/protectedAxios';
import axios from 'axios';

interface LegacyTaxonomyTableProps {
  url: string;
  fallbackUrl?: string;
  title: string;
}

const LegacyTaxonomyTable: React.FC<LegacyTaxonomyTableProps> = ({
  url,
  fallbackUrl,
  title,
}) => {
  const [data, setData] = useState<PaginatedList>({
    items: [],
    count: 0,
  });
  const [cols, setCols] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const targetUrl = url || fallbackUrl;
      if (!targetUrl) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await protectedAxios.get(targetUrl);
        if (cancelled) return;

        const text = response.data;
        const lines = text.split('\n').filter(Boolean);
        let items = lines.map((line: string) => line.split('\t'));

        if (items.length > 0) {
          let headers: string[] = [];
          // Find the header line. It's either the first line starting with '# OTU ID'
          // or the first line that doesn't start with '#' but has multiple columns.
          let headerIdx = -1;
          for (let i = 0; i < items.length; i++) {
            const firstCell = items[i][0];
            if (firstCell.toLowerCase().includes('otu id')) {
              headerIdx = i;
              headers = items[i].map((h: string) => h.replace(/^#\s*/, ''));
              break;
            }
          }

          if (headerIdx !== -1) {
            items = items.slice(headerIdx + 1);
          } else {
            // If no explicit header found, try skipping all '#' comments
            const firstNonCommentIdx = items.findIndex(
              (row) => !row[0].startsWith('#')
            );
            if (firstNonCommentIdx !== -1) {
              items = items.slice(firstNonCommentIdx);
            }
            // Generate generic headers
            const maxCols = Math.max(...items.map((row) => row.length));
            headers = Array.from(
              { length: maxCols },
              (_, i) => `Column ${i + 1}`
            );
          }

          setCols(
            headers.map((header, colNum) => ({
              Header: header.includes('_') ? startCase(header) : header,
              accessor: (row: any) => row[colNum],
              id: `col_${colNum}`,
            }))
          );

          setData({
            items,
            count: items.length,
          });
        }
      } catch (err) {
        if (!cancelled) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            localStorage.setItem('mgnify.sessionExpired', 'true');
            window.location.reload();
          }
          setData({ items: [], count: 0 });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [url, fallbackUrl]);

  const phylumColIdx = useMemo(() => {
    const idx = cols.findIndex((c) => {
      const header = (c.Header as string).toLowerCase();
      return (
        header === 'taxonomy' ||
        header === 'phylum' ||
        header === 'column 4' || // for .txt files
        header === 'column 3' // MGYA00429313 TSV has taxonomy in 3rd col
      );
    });
    if (idx !== -1) return idx;
    return -1;
  }, [cols]);

  const countColIdx = useMemo(() => {
    // For TSV: OTU ID, LSU_rRNA, taxonomy, taxid (LSU_rRNA is count)
    // For TXT: count is first column
    const rRNAIdx = cols.findIndex((c) => {
      const header = (c.Header as string).toLowerCase();
      return (
        header.includes('rrna') ||
        header.includes('otu count') ||
        header.includes('otu_count') ||
        header === 'count'
      );
    });
    if (rRNAIdx !== -1) return rRNAIdx;

    const firstColHeader = cols[0]?.Header as string;
    if (
      firstColHeader?.toLowerCase() === 'column 1' ||
      firstColHeader?.toLowerCase() === 'otu id'
    ) {
      // If first column is OTU ID, count is usually second. If first is Column 1 (txt), it is count.
      return firstColHeader?.toLowerCase() === 'column 1' ? 0 : 1;
    }
    // Check for "Column 2" as well for TSVs that might not have headers and taxonomy is in Col 3
    const secondColHeader = cols[1]?.Header as string;
    if (secondColHeader?.toLowerCase() === 'column 2') return 1;

    return 1;
  }, [cols]);

  const barChartSpec = useMemo(() => {
    if (phylumColIdx === -1 || countColIdx === -1 || data.items.length === 0)
      return null;

    // Aggregate counts by phylum
    const aggregation: Record<string, number> = {};
    data.items.forEach((item: any) => {
      const taxonomyStr = item[phylumColIdx] || 'Unknown';
      let phylum: string;

      const taxonomyParts = taxonomyStr.split(';').map((p: string) => p.trim());
      // Look for p__ prefix
      const phylumPart = taxonomyParts.find((p: string) => p.startsWith('p__'));
      if (phylumPart) {
        phylum = phylumPart;
      } else if (taxonomyParts.length >= 3) {
        // Fallback to 3rd level (sk, k, p)
        phylum = taxonomyParts[2];
      } else {
        phylum = taxonomyParts[taxonomyParts.length - 1] || 'Unknown';
      }

      const count = parseFloat(item[countColIdx]) || 0;
      // Trim rank prefixes like p__, k__, etc.
      const cleanPhylum = phylum.replace(/^[a-z]+__/, '');
      aggregation[cleanPhylum] = (aggregation[cleanPhylum] || 0) + count;
    });

    const chartDataItems = Object.entries(aggregation)
      .map(([phylum, count]) => ({ phylum, count }))
      .sort((a, b) => b.count - a.count);

    return {
      title: 'Phylum composition (top 10)',
      labelsCol: {
        accessor: (row: any) => row.phylum,
        id: 'Phylum',
        Header: 'Phylum',
      },
      countsCol: {
        accessor: (row: any) => row.count,
        id: 'Count',
        Header: 'Count',
      },
      data: {
        items: chartDataItems,
        count: chartDataItems.length,
      },
    };
  }, [data, phylumColIdx, countColIdx]);

  const viewModeSelector = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: 'white',
        padding: '0.5rem 0',
      }}
    >
      <div
        className="vf-text-body vf-text-body--3"
        style={{ fontWeight: 'bold' }}
      >
        {viewMode === 'table'
          ? 'Taxonomy Table'
          : 'Phylum composition (top 10)'}
      </div>
      <button
        type="button"
        className={`vf-search__button | vf-button vf-button--primary mg-text-search-button vf-button--sm`}
        onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
      >
        <span
          className={`icon icon-common icon-${
            viewMode === 'table' ? 'chart-bar' : 'table'
          }`}
          style={{ marginRight: '0.5rem' }}
        />
        <span className="vf-button__text">
          Switch to {viewMode === 'table' ? 'chart' : 'table'} view
        </span>
      </button>
    </div>
  );

  let content: ReactElement | null = null;
  if (isLoading) content = <Loading />;
  else if (viewMode === 'table')
    content = <EMGTable cols={cols} data={data} showPagination />;
  else if (viewMode === 'chart' && barChartSpec)
    content = (
      <BarChartForTable
        data={barChartSpec.data as PaginatedList}
        labelsCol={barChartSpec.labelsCol}
        countsCol={barChartSpec.countsCol}
        title={barChartSpec.title}
        maxLabels={10}
      />
    );

  return (
    <div className="legacy-taxonomy-table">
      {title && <h4 className="vf-text-heading--4">{title}</h4>}
      <FixedHeightScrollable heightPx={600}>
        {viewModeSelector}
        {content}
      </FixedHeightScrollable>
    </div>
  );
};

export default LegacyTaxonomyTable;
