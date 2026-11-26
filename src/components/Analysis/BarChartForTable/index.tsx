import React, { useMemo, useRef } from 'react';
import { PaginatedList } from '@/interfaces';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { capitalize, get, kebabCase, min, unzip } from 'lodash-es';
import { getAnnotationLabel } from 'utils/annotationStringStore';

type BarChartColSpec = {
  // Uses the same accessors as the table columns.
  accessorKey?: string;
  accessorFn?: (row: any, index: number) => any;
  id: string;
  header: string;
};

export interface BarChartForTableProps {
  data: PaginatedList;
  labelsCol: BarChartColSpec;
  countsCol: BarChartColSpec;
  title: string;
  maxLabels?: number;
  subtitle?: string;
  /** Draw vertical columns (histogram style) instead of horizontal bars. */
  vertical?: boolean;
  /** Draw a pie chart of the label counts instead of bars. */
  pie?: boolean;
}

const BarChartForTable: React.FC<BarChartForTableProps> = ({
  data,
  labelsCol,
  countsCol,
  title = 'Annotations',
  maxLabels = 50,
  subtitle,
  vertical = false,
  pie = false,
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const labelAccessor = (labelsCol.accessorFn ?? labelsCol.accessorKey) as
    | string
    | ((row: any, index: number) => any);
  const dataAccessor = (countsCol.accessorFn ?? countsCol.accessorKey) as
    | string
    | ((row: any, index: number) => any);
  const [labels, series, descriptions] = useMemo(() => {
    if (!data?.items) return [[], [], []];
    const mapped = data.items
      .map((d, idx) => {
        const countValue =
          typeof dataAccessor === 'function'
            ? dataAccessor(d, idx)
            : get(d, dataAccessor);
        const label =
          typeof labelAccessor === 'function'
            ? labelAccessor(d, idx)
            : get(d, labelAccessor);
        const description = (d as any).description || label;
        return [label, Number.isNaN(countValue) ? 0 : countValue, description];
      })
      .slice(0, maxLabels === 0 ? undefined : maxLabels);
    return unzip(mapped);
  }, [data.items, dataAccessor, labelAccessor, maxLabels]);

  const total = data.count;
  const chartTitle = getAnnotationLabel(capitalize(title));

  let chartType: 'pie' | 'column' | 'bar' = 'bar';
  if (pie) chartType = 'pie';
  else if (vertical) chartType = 'column';
  const options: Highcharts.Options = {
    chart: {
      type: chartType,
      height:
        pie || vertical ? 400 : Math.max(400, (series?.length || 0) * 20 + 100),
      zoomType: 'xy',
    },
    title: { text: chartTitle },
    subtitle: {
      text:
        subtitle ??
        `Showing ${
          maxLabels === 0
            ? data.items.length
            : min([data.items.length, maxLabels])
        } of ${total} annotations`,
    },
    yAxis: {
      min: 0,
      title: { text: countsCol.id },
    },
    xAxis: {
      type: 'category',
      categories: labels as string[],
    },
    plotOptions: {
      series: { stacking: 'normal' },
      bar: {
        allowPointSelect: true,
        cursor: 'pointer',
      },
      column: {
        allowPointSelect: true,
        cursor: 'pointer',
        pointPadding: 0,
        groupPadding: 0,
        borderWidth: 1,
      },
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.percentage:.1f}%',
          style: {
            color: '#333333',
            fontSize: '14px',
            fontWeight: 'normal',
            textOutline: 'none',
          },
        },
      },
    },
    credits: { enabled: false },
    legend: { enabled: false },
    tooltip: {
      formatter() {
        const idx = this.point.index;
        const desc = (descriptions as string[])[idx];
        const share = pie ? ` (${this.point.percentage?.toFixed(1)}%)` : '';
        return `<b>${desc}</b><br/>${this.series.name}: <b>${this.y}</b>${share}`;
      },
    },
    series: [
      {
        name: chartTitle,
        data: pie
          ? (series as number[]).map((y, index) => ({
              name: (labels as string[])[index],
              y,
            }))
          : (series as number[]),
        type: chartType,
      },
    ],
  };
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      containerProps={{ id: kebabCase(title) }}
    />
  );
};

export default BarChartForTable;
