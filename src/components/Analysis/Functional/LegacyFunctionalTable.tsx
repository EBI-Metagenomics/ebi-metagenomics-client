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

interface LegacyFunctionalTableProps {
  url: string;
  title: string;
  type: 'interpro' | 'go' | 'pfam' | 'ko';
}

const LegacyFunctionalTable: React.FC<LegacyFunctionalTableProps> = ({
  url,
  title,
  type,
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
      if (!url) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await protectedAxios.get(url);
        if (cancelled) return;

        const text = response.data;
        const lines = text.split('\n').filter(Boolean);
        const items = lines
          .map((line: string) => {
            // Check for TSV first
            if (line.includes('\t')) {
              return line
                .split('\t')
                .map((m) => m.trim().replace(/^"|"$/g, ''));
            }
            // Comma separated, potentially with quotes
            const parts: string[] = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                parts.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
              } else {
                current += char;
              }
            }
            parts.push(current.trim().replace(/^"|"$/g, ''));
            return parts;
          })
          .filter((row) => row.length >= 2);

        if (items.length > 0) {
          let headers: string[] = [];
          if (type === 'interpro') {
            // Check if first column is indeed numeric (Count)
            const firstRow = items[0];
            const firstIsNumeric =
              !Number.isNaN(parseFloat(firstRow[0])) &&
              /^\d+$/.test(firstRow[0].trim());
            if (firstIsNumeric) {
              headers = ['Count', 'Accession', 'Description'];
            } else {
              // Sometimes they are: Accession, Description, Count
              headers = ['Accession', 'Description', 'Count'];
            }
          } else if (type === 'go') {
            headers = ['Accession', 'Description', 'Category', 'Count'];
          } else if (type === 'pfam') {
            const firstRow = items[0];
            const firstIsNumeric =
              !Number.isNaN(parseFloat(firstRow[0])) &&
              /^\d+$/.test(firstRow[0].trim());
            if (firstIsNumeric) {
              headers = ['Count', 'Accession', 'Description'];
            } else {
              headers = ['Accession', 'Description', 'Count'];
            }
          } else if (type === 'ko') {
            const firstRow = items[0];
            const firstIsNumeric =
              !Number.isNaN(parseFloat(firstRow[0])) &&
              /^\d+$/.test(firstRow[0].trim());
            if (firstIsNumeric) {
              headers = ['Count', 'Accession', 'Description'];
            } else {
              headers = ['Accession', 'Description', 'Count'];
            }
          }

          setCols(
            headers.map((header, colNum) => ({
              Header: header,
              accessor: (row: any) => row[colNum],
              id: `col_${colNum}`,
            }))
          );

          setData({
            items,
            count: items.length,
          });
        } else {
          setData({
            items: [],
            count: 0,
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
  }, [type, url]);

  const barChartSpec = useMemo(() => {
    if (data.items.length === 0) return null;

    let labelsColIdx = -1;
    let countsColIdx = -1;
    let accessionColIdx = -1;

    cols.forEach((c, idx) => {
      const header = (c.Header as string).toLowerCase();
      if (header === 'description' || header === 'label') labelsColIdx = idx;
      if (header === 'count') countsColIdx = idx;
      if (header === 'accession') accessionColIdx = idx;
    });

    if (labelsColIdx === -1 || countsColIdx === -1) return null;

    const chartDataItems = data.items
      .map((item: any) => {
        const label = item[labelsColIdx] || 'Unknown';
        const accession = item[accessionColIdx];
        return {
          label: accession ? `${accession}: ${label}` : label,
          count: parseFloat(item[countsColIdx]) || 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      title: `${startCase(type)} (top 10)`,
      labelsCol: {
        accessor: (row: any) => row.label,
        id: 'Label',
        Header: 'Label',
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
  }, [cols, data.items, type]);

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
          ? `${startCase(type)} Table`
          : barChartSpec?.title}
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
    <div className="legacy-functional-table">
      {title && <h4 className="vf-text-heading--4">{title}</h4>}
      <FixedHeightScrollable heightPx={600}>
        {viewModeSelector}
        {content}
      </FixedHeightScrollable>
    </div>
  );
};

export default LegacyFunctionalTable;
