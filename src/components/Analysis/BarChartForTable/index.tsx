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
  const [labels, series] = useMemo(() => {
    if (!data?.items) return [[], []];
    return unzip(
      data.items
        .map((d, idx) => [
          typeof labelAccessor === 'function'
            ? labelAccessor(d, idx)
            : get(d, labelAccessor),
          typeof dataAccessor === 'function'
            ? dataAccessor(d, idx)
            : get(d, dataAccessor),
        ])
        .slice(0, maxLabels)
    );
  }, [data.items, dataAccessor, labelAccessor, maxLabels]);

  const total = data.count;

  const options: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: 800,
      zoomType: 'xy',
    },
    title: { text: capitalize(title) },
    subtitle: {
      text: `Showing ${min([
        data.items.length,
        maxLabels,
      ])} of ${total} annotations`,
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
    tooltip: { pointFormat: '<b>{point.y}</b> {series.name}' },
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
