import React, { useEffect, useMemo, useState, useId } from 'react';
import Select from 'react-select';
import { filesize } from 'filesize';
import type { ColumnDef as Column } from '@tanstack/react-table';

import BarChartForTable from 'components/Analysis/BarChartForTable';
import EMGTable from 'components/UI/EMGTable';
import EMGModal from 'components/UI/EMGModal';
import FixedHeightScrollable from 'components/UI/FixedHeightScrollable';
import Loading from 'components/UI/Loading';
import WildcardSearchInput from 'components/UI/WildcardSearchInput';
import { getRemoteFileSize } from 'utils/fetch';
import { getAnnotationLabel } from 'utils/annotationStringStore';
import TSVCell from './TSVCell';
import type { BarChartSpec, TSVTableViewProps } from './types';

const columnsFromHeader = (
  headerRow: string[],
  columnHeaders: string[] | undefined,
  searchTerm: string
): Column<any, any>[] =>
  headerRow.map((header, columnIndex) => ({
    header: getAnnotationLabel(columnHeaders?.[columnIndex] ?? header),
    accessorFn: (row) => row[columnIndex],
    cell: ({ getValue }) => {
      const value = getValue();
      return <TSVCell value={value} searchTerm={searchTerm} />;
    },
    id: `col_${columnIndex}`,
  }));

// Histogram views count the complete loaded rows, including active search results.
const histogramData = (
  data: TSVTableViewProps['data'],
  headerRow: string[] | undefined,
  spec: BarChartSpec
) => {
  if (!spec.histogramColumn) return data;
  const index =
    headerRow?.findIndex(
      (header) =>
        header.trim().toLowerCase() ===
        spec.histogramColumn?.trim().toLowerCase()
    ) ?? -1;
  if (index < 0) return { items: [], count: 0 };
  const counts = new Map<string, number>();
  const bins = spec.histogramBins;
  const binLabels = bins?.map((lower, i) =>
    i + 1 < bins.length ? `${lower}–${bins[i + 1] - 1}` : `${lower}+`
  );
  binLabels?.forEach((label) => counts.set(label, 0));
  data.items.forEach((row) => {
    const value = row[index]?.trim() || 'Unclassified';
    if (bins && binLabels) {
      const number = Number(value);
      const bin = bins.findIndex(
        (lower, i) =>
          number >= lower && (i + 1 === bins.length || number < bins[i + 1])
      );
      if (Number.isFinite(number) && bin >= 0)
        counts.set(binLabels[bin], (counts.get(binLabels[bin]) ?? 0) + 1);
    } else {
      const labels = spec.histogramSplit
        ? value.split(spec.histogramSplit)
        : [value];
      new Set(labels.map((label) => label.trim()).filter(Boolean)).forEach(
        (label) => counts.set(label, (counts.get(label) ?? 0) + 1)
      );
    }
  });
  const items = (
    bins
      ? [...counts]
      : [...counts].sort(([a, ac], [b, bc]) => bc - ac || a.localeCompare(b))
  ).map(([label, count]) => [label, String(count)]);
  return { items, count: items.length };
};

const chartTypeOptions: { value: 'pie' | 'histogram'; label: string }[] = [
  { value: 'pie', label: 'Pie chart' },
  { value: 'histogram', label: 'Histogram' },
];

const TSVTableView: React.FC<TSVTableViewProps> = ({
  barChartSpec,
  chartViews,
  chartButtons = false,
  columnHeaders,
  chartData,
  columns = [],
  data,
  error,
  emptyStateMessage = 'The file has no content',
  expectedPageSize,
  fileUrl,
  headerRow,
  isLoading,
  isFileEmpty,
  isSearching,
  initialView = 'table',
  onClearSearch,
  onSearch,
  searchTerm,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>(initialView);
  const [chartId, setChartId] = useState(chartViews?.[0]?.id);
  const selectorId = useId();
  const activeChart =
    chartViews?.find((chart) => chart.id === chartId) ?? chartViews?.[0];
  const [isChartSelectorOpen, setIsChartSelectorOpen] = useState(false);
  const multipleCharts = (chartViews?.length ?? 0) > 1;
  const hasCharts = !!chartViews?.length || !!barChartSpec;
  const activeSpec =
    activeChart?.barChartSpec ?? (!activeChart ? barChartSpec : undefined);
  const [chartTypes, setChartTypes] = useState<
    Record<string, 'pie' | 'histogram'>
  >({});
  const activeChartType =
    activeChart &&
    (chartTypes[activeChart.id] ??
      (activeChart.barChartSpec?.pie ? 'pie' : 'histogram'));
  const renderedSpec: BarChartSpec | undefined =
    chartButtons && activeSpec
      ? {
          ...activeSpec,
          pie: activeChartType === 'pie',
          vertical: activeChartType === 'histogram',
        }
      : activeSpec;
  const sourceData = chartData ?? data;
  const barData = useMemo(
    () =>
      activeSpec
        ? histogramData(sourceData, headerRow, activeSpec)
        : sourceData,
    [sourceData, headerRow, activeSpec]
  );
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [wholeWord, setWholeWord] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>();
  const tableColumns = useMemo(() => {
    if (!columns.length) {
      return columnsFromHeader(headerRow ?? [], columnHeaders, searchTerm);
    }
    return columns.map((column) =>
      'cell' in column && column.cell
        ? column
        : {
            ...column,
            cell: ({ getValue }) => {
              const value = getValue();
              return <TSVCell value={value} searchTerm={searchTerm} />;
            },
          }
    );
  }, [columnHeaders, columns, headerRow, searchTerm]);
  const isBusy = isLoading || isSearching;

  useEffect(() => {
    setFileSize(undefined);
  }, [fileUrl]);

  useEffect(() => {
    if (!isSearchModalOpen || fileSize !== undefined) return undefined;

    let cancelled = false;
    getRemoteFileSize(fileUrl).then((size) => {
      if (!cancelled) setFileSize(size || null);
    });
    return () => {
      cancelled = true;
    };
  }, [fileSize, fileUrl, isSearchModalOpen]);

  const openSearchModal = () => {
    setSearchInput(searchTerm);
    setIsSearchModalOpen(true);
  };

  const clearSearch = () => {
    onClearSearch();
    setSearchInput('');
    setViewMode('table');
    setIsSearchModalOpen(false);
  };

  return (
    <div className="compressed-tsv-table tsv-table">
      <EMGModal
        isOpen={isSearchModalOpen}
        onRequestClose={() => setIsSearchModalOpen(false)}
        contentLabel="Search TSV table"
      >
        <form
          className="compressed-tsv-table__search-form vf-stack vf-stack--400"
          onSubmit={async (event) => {
            event.preventDefault();
            const nextSearchTerm = searchInput.trim();
            if (!nextSearchTerm) return;
            await onSearch(nextSearchTerm, wholeWord);
            setViewMode('table');
            setIsSearchModalOpen(false);
          }}
        >
          <h2>Search table</h2>
          <p>
            Searching requires the complete file
            {fileSize === undefined && ' (checking its size...)'}
            {fileSize !== undefined &&
              fileSize !== null &&
              ` (${filesize(fileSize, { round: 1 })})`}{' '}
            to be loaded in your browser.
          </p>
          <label
            className="vf-form__label"
            htmlFor="compressed-tsv-search-term"
          >
            Search&nbsp;term
          </label>
          <WildcardSearchInput
            id="compressed-tsv-search-term"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            wholeWord={wholeWord}
            onWholeWordChange={setWholeWord}
            disabled={isBusy}
            autoFocus
          />
          <div className="compressed-tsv-table__search-actions">
            <button
              type="submit"
              className="vf-button vf-button--primary vf-button--sm"
              disabled={!searchInput.trim() || isBusy}
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                className="vf-button vf-button--secondary vf-button--sm"
                onClick={clearSearch}
                disabled={isSearching}
              >
                Clear search
              </button>
            )}
          </div>
          {isSearching && (
            <div aria-live="polite">
              <p>Searching all rows…</p>
              <Loading size="small" />
            </div>
          )}
        </form>
      </EMGModal>
      <div className="compressed-tsv-table__toolbar tsv-table__toolbar">
        {chartButtons && multipleCharts && (
          <div className="compressed-tsv-table__toolbar-actions">
            {chartViews?.map((chart) => {
              const isActive =
                viewMode === 'chart' && chart.id === activeChart?.id;
              return (
                <button
                  key={chart.id}
                  type="button"
                  className={`vf-button vf-button--sm ${
                    isActive ? 'vf-button--primary' : 'vf-button--secondary'
                  }`}
                  aria-pressed={isActive}
                  onClick={() => {
                    setChartId(chart.id);
                    setViewMode('chart');
                  }}
                  disabled={isBusy}
                >
                  {chart.label}
                </button>
              );
            })}
          </div>
        )}
        <div className="compressed-tsv-table__search-status">
          {searchTerm && (
            <>
              Showing {data.count.toLocaleString()}{' '}
              {data.count === 1 ? 'row' : 'rows'} matching{' '}
              <strong>{searchTerm}</strong>
              <button
                type="button"
                className="vf-button vf-button--link vf-button--sm"
                onClick={clearSearch}
                disabled={isSearching}
              >
                Clear
              </button>
            </>
          )}
        </div>
        <div className="compressed-tsv-table__toolbar-actions">
          <button
            type="button"
            className="vf-button vf-button--secondary vf-button--sm"
            onClick={openSearchModal}
            disabled={isBusy}
          >
            <span className="icon icon-common icon-search" />{' '}
            <span className="vf-button__text">Search...</span>
          </button>
          <button
            type="button"
            className="vf-button vf-button--secondary vf-button--sm"
            onClick={() => {
              setViewMode('table');
              setIsChartSelectorOpen(false);
            }}
            disabled={isBusy || viewMode === 'table'}
          >
            <span className="icon icon-common icon-table" /> Table view
          </button>
          {chartButtons && multipleCharts && activeChart?.barChartSpec && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="vf-button vf-button--secondary vf-button--sm"
                aria-expanded={isChartSelectorOpen}
                aria-controls={isChartSelectorOpen ? selectorId : undefined}
                onClick={() => setIsChartSelectorOpen((open) => !open)}
                disabled={isBusy || viewMode !== 'chart'}
              >
                <span className="icon icon-common icon-chart-bar" /> Chart views{' '}
                <span aria-hidden="true">▾</span>
              </button>
              {isChartSelectorOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    width: 200,
                    zIndex: 20,
                  }}
                >
                  <Select
                    inputId={selectorId}
                    aria-label="Chart views"
                    autoFocus
                    menuIsOpen
                    isSearchable={false}
                    options={chartTypeOptions}
                    value={chartTypeOptions.find(
                      (option) => option.value === activeChartType
                    )}
                    onBlur={() => setIsChartSelectorOpen(false)}
                    onMenuClose={() => setIsChartSelectorOpen(false)}
                    onChange={(option) => {
                      if (option && activeChart) {
                        setChartTypes((types) => ({
                          ...types,
                          [activeChart.id]: option.value,
                        }));
                      }
                      setIsChartSelectorOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}
          {!(chartButtons && multipleCharts) && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="vf-button vf-button--secondary vf-button--sm"
                aria-expanded={multipleCharts ? isChartSelectorOpen : undefined}
                aria-controls={
                  multipleCharts && isChartSelectorOpen ? selectorId : undefined
                }
                onClick={() => {
                  if (multipleCharts) setIsChartSelectorOpen((open) => !open);
                  else setViewMode('chart');
                }}
                disabled={
                  isBusy ||
                  !hasCharts ||
                  (!multipleCharts && viewMode === 'chart')
                }
              >
                <span className="icon icon-common icon-chart-bar" />{' '}
                {multipleCharts ? 'Chart views' : 'Chart view'}
                {multipleCharts && (
                  <>
                    {' '}
                    <span aria-hidden="true">▾</span>
                  </>
                )}
              </button>
              {isChartSelectorOpen && multipleCharts && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    width: 260,
                    zIndex: 20,
                  }}
                >
                  <Select
                    inputId={selectorId}
                    aria-label="Chart views"
                    autoFocus
                    menuIsOpen
                    options={chartViews?.map((chart) => ({
                      value: chart.id,
                      label: chart.label,
                    }))}
                    value={
                      activeChart
                        ? { value: activeChart.id, label: activeChart.label }
                        : null
                    }
                    onBlur={() => setIsChartSelectorOpen(false)}
                    onMenuClose={() => setIsChartSelectorOpen(false)}
                    onChange={(option) => {
                      if (option) {
                        setChartId(option.value);
                        setViewMode('chart');
                      }
                      setIsChartSelectorOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <FixedHeightScrollable heightPx={600} className="tsv-table__scroll">
        {isBusy && <Loading />}
        {!error && !isBusy && viewMode === 'table' && (
          <EMGTable
            cols={tableColumns}
            data={data}
            emptyStateMessage={isFileEmpty ? emptyStateMessage : undefined}
            showPagination
            expectedPageSize={expectedPageSize}
          />
        )}
        {!error &&
          !isBusy &&
          viewMode === 'chart' &&
          (activeChart?.render
            ? activeChart.render(sourceData, headerRow)
            : renderedSpec && (
                <BarChartForTable data={barData} {...renderedSpec} />
              ))}
      </FixedHeightScrollable>
    </div>
  );
};

export default TSVTableView;
