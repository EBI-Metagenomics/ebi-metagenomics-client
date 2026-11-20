import type { ReactNode } from 'react';
import type { Download, PaginatedList } from '@/interfaces';
import type { BarChartForTableProps } from 'components/Analysis/BarChartForTable';
import type { ColumnDef as Column } from '@tanstack/react-table';

export type BarChartSpec = Pick<
  BarChartForTableProps,
  'title' | 'labelsCol' | 'countsCol' | 'maxLabels' | 'subtitle'
> & {
  histogramColumn?: string;
  histogramBins?: number[];
  histogramSplit?: string;
};

export type TableChartView = {
  id: string;
  label: string;
} & (
  | { barChartSpec: BarChartSpec; render?: never }
  | {
      barChartSpec?: never;
      render: (
        data: PaginatedList<string[]>,
        headerRow?: string[]
      ) => ReactNode;
    }
);

export interface TSVTableProps {
  columns?: Column<any, any>[];
  columnHeaders?: string[];
  download: Download;
  emptyStateMessage?: string;
  barChartSpec?: BarChartSpec;
  initialView?: 'table' | 'chart';
  /** Named charts receive all loaded rows, including current search results. */
  chartViews?: TableChartView[];
  delimiter?: string;
}

export interface TSVTableLoaderProps extends TSVTableProps {
  pageNum: number;
  setPageNum: (pageNum: number) => void;
}

export interface TSVTableViewProps extends Omit<TSVTableProps, 'download'> {
  data: PaginatedList<string[]>;
  chartData?: PaginatedList<string[]>;
  error?: string;
  expectedPageSize: number;
  fileUrl: string;
  headerRow?: string[];
  isLoading: boolean;
  isFileEmpty: boolean;
  isSearching: boolean;
  onClearSearch: () => void;
  onSearch: (searchTerm: string, wholeWord: boolean) => Promise<void>;
  searchTerm: string;
}
