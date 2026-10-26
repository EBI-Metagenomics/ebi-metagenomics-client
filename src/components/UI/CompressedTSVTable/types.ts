import type { Download, PaginatedList } from '@/interfaces';
import type { BarChartForTableProps } from 'components/Analysis/BarChartForTable';
import type { ColumnDef as Column } from '@tanstack/react-table';

export type BarChartSpec = Pick<
  BarChartForTableProps,
  'title' | 'labelsCol' | 'countsCol' | 'maxLabels' | 'subtitle'
> & {
  histogramColumn?: string;
};

export interface TSVTableProps {
  columns?: Column<any, any>[];
  columnHeaders?: string[];
  download: Download;
  emptyStateMessage?: string;
  barChartSpec?: BarChartSpec;
}

export interface TSVTableLoaderProps extends TSVTableProps {
  pageNum: number;
  setPageNum: (pageNum: number) => void;
}

export interface TSVTableViewProps extends Omit<TSVTableProps, 'download'> {
  data: PaginatedList<string[]>;
  chartData?: PaginatedList<string[]>;
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
