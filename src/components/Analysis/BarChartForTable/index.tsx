import React, { useMemo, useRef } from 'react';
import { PaginatedList } from '@/interfaces';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { capitalize, get, kebabCase, min, unzip } from 'lodash-es';

type BarChartColSpec = {
  // similar but simplified compared to react-table's column spec... somewhat compatible with it
  accessor: string | ((row: any, index: number) => any);
  id: string;
  Header: string;
};

export interface BarChartForTableProps {
  data: PaginatedList;
  labelsCol: BarChartColSpec;
  countsCol: BarChartColSpec;
  title: string;
  maxLabels?: number;
}

const BarChartForTable: React.FC<BarChartForTableProps> = ({
  data,
  labelsCol,
  countsCol,
  title = 'Annotations',
  maxLabels = 50,
}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const labelAccessor = labelsCol.accessor as
    | string
    | ((row: any, index: number) => any);
  const dataAccessor = countsCol.accessor as
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

  const options: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: Math.max(400, (series?.length || 0) * 20 + 100),
      zoomType: 'xy',
    },
    title: { text: capitalize(title) },
    subtitle: {
      text: `Showing ${
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
    },
    credits: { enabled: false },
    legend: { enabled: false },
    tooltip: {
      formatter() {
        const idx = this.point.index;
        const desc = (descriptions as string[])[idx];
        return `<b>${desc}</b><br/>${this.series.name}: <b>${this.y}</b>`;
      },
    },
    series: [
      {
        name: capitalize(title),
        data: series as number[],
        type: 'bar',
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
