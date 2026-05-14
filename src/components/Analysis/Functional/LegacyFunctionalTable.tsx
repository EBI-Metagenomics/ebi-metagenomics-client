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
  maxLabels?: number;
}

const LegacyFunctionalTable: React.FC<LegacyFunctionalTableProps> = ({
  url,
  title,
  type,
  maxLabels = 10,
}) => {
  const [data, setData] = useState<PaginatedList<string[]>>({
    items: [],
    count: 0,
  });
  const [cols, setCols] = useState<Column<string[]>[]>([]);
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

        let text = response.data;
        if (typeof text !== 'string') {
          text = JSON.stringify(text);
        }
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        let items = lines
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
          let headerIdx = -1;
          // Try to find table header even though some legacy files have extra
          // header lines like comments, source info etc
          // Only check first 10 lines for header to avoid false positives in data
          // Look for some commonly known col headers
          for (let i = 0; i < Math.min(items.length, 10); i++) {
            const row = items[i];
            const isHeader = row.some((cell) => {
              const c = cell.toLowerCase().replace(/_/g, ' ');
              return [
                'accession',
                'description',
                'count',
                'module accession',
                'pathway name',
                'completeness',
                'cluster type',
              ].some((keyword) => c.includes(keyword));
            });
            if (isHeader) {
              headerIdx = i;
              headers = row.map((h) => startCase(h));
              break;
            }
          }

          if (headerIdx !== -1) {
            items = items.slice(headerIdx + 1);
          } else {
            // No header found, guess based on type and content
            const maxCols = Math.max(...items.map((row) => row.length));
            headers = Array.from(
              { length: maxCols },
              (_, i) => `Column ${i + 1}`
            );
            const firstRow = items[0];
            const firstIsNumeric =
              !Number.isNaN(parseFloat(firstRow[0])) &&
              /^\d+(\.\d+)?$/.test(firstRow[0].trim());

            if (type === 'go') {
              if (maxCols === 3) {
                headers = ['Accession', 'Description', 'Count'];
              } else if (maxCols >= 4) {
                headers = ['Accession', 'Description', 'Category', 'Count'];
              }
            } else if (firstIsNumeric) {
              headers[0] = 'Count';
              if (maxCols >= 2) headers[1] = 'Accession';
              if (maxCols >= 3) headers[2] = 'Description';
            } else {
              headers[0] = 'Accession';
              if (maxCols >= 2) headers[1] = 'Description';
              if (maxCols >= 3) {
                // Check if last column is numeric
                const lastCell = firstRow[maxCols - 1];
                if (!Number.isNaN(parseFloat(lastCell))) {
                  headers[maxCols - 1] = 'Count';
                } else {
                  headers[2] = 'Count';
                }
              }
            }
          }

          setCols(
            headers.map((header, colNum) => ({
              Header: header,
              accessor: (row: string[]) => row[colNum],
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
    if (data.items.length === 0 || cols.length === 0) return null;

    let labelsColIdx = -1;
    let countsColIdx = -1;
    let accessionColIdx = -1;

    const headerLabels = cols.map((c) =>
      (c.Header as string).toLowerCase().replace(/_/g, ' ')
    );

    accessionColIdx = headerLabels.findIndex(
      (h) =>
        h.includes('accession') || h.includes('id') || h.includes('identifier')
    );
    countsColIdx = headerLabels.findIndex(
      (h) =>
        h.includes('count') || h.includes('completeness') || h.includes('value')
    );
    labelsColIdx = headerLabels.findIndex(
      (h) =>
        h.includes('description') ||
        h.includes('name') ||
        h.includes('label') ||
        h.includes('type') ||
        h.includes('term')
    );

    // Fallbacks
    if (countsColIdx === -1) {
      // Try to find a numeric column in the first data row
      countsColIdx = data.items[0].findIndex(
        (cell: string) => !Number.isNaN(parseFloat(cell))
      );
    }
    if (labelsColIdx === -1) {
      // Pick a column that isn't the accession or count
      labelsColIdx = cols.findIndex(
        (_, i: number) => i !== accessionColIdx && i !== countsColIdx
      );
      if (labelsColIdx === -1) labelsColIdx = 0;
    }

    if (countsColIdx === -1) return null;

    const chartDataItems = data.items
      .map((item: string[]) => {
        const label = item[labelsColIdx] || 'Unknown';
        const accession = accessionColIdx !== -1 ? item[accessionColIdx] : null;
        const isKeggModule = type === 'ko' && (maxLabels > 10 || maxLabels === 0);
        return {
          label: isKeggModule ? accession || label : accession ? `${accession}: ${label}` : label,
          description: accession ? `${accession}: ${label}` : label,
          count: parseFloat(item[countsColIdx]) || 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    let chartTitle = `${startCase(type)} (top ${maxLabels})`;
    if (type === 'ko') {
      chartTitle =
        maxLabels > 10 || maxLabels === 0
          ? 'KEGG Modules'
          : `KEGG Orthologs (top ${maxLabels})`;
    }

    return {
      title: chartTitle,
      labelsCol: {
        accessor: (row: { label: string; count: number }) => row.label,
        id: 'Label',
        Header: 'Label',
      },
      countsCol: {
        accessor: (row: { label: string; count: number }) => row.count,
        id: 'Count',
        Header: 'Count',
      },
      data: {
        items: chartDataItems,
        count: chartDataItems.length,
      },
    };
  }, [cols, data.items, type, maxLabels]);

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
          ? `${
              type === 'ko'
                ? maxLabels > 10 || maxLabels === 0
                  ? 'KEGG Module'
                  : 'Annotation'
                : startCase(type)
            } Table`
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
        maxLabels={maxLabels}
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
