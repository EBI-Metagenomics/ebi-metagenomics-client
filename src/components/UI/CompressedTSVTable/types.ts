import type { Download, PaginatedList } from '@/interfaces';
import type { BarChartForTableProps } from 'components/Analysis/BarChartForTable';
import type { Column } from 'react-table';

export type BarChartSpec = Pick<
  BarChartForTableProps,
  'title' | 'labelsCol' | 'countsCol' | 'maxLabels'
>;

export interface TSVTableProps {
  columns?: Column[];
  columnHeaders?: string[];
  download: Download;
  barChartSpec?: BarChartSpec;
}

export interface TSVTableLoaderProps extends TSVTableProps {
  pageNum: number;
  setPageNum: (pageNum: number) => void;
}

export interface TSVTableViewProps extends Omit<TSVTableProps, 'download'> {
  data: PaginatedList<string[]>;
  expectedPageSize: number;
  headerRow?: string[];
  isLoading: boolean;
}
